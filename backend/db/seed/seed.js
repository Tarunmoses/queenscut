/**
 * Demo seed script — populates customers, orders (across all statuses),
 * inventory (across all 3 stock levels), and expenses (including
 * inventory-usage-linked ones) by calling the real running API, so every
 * computed field (order totals, payment status, stock status) goes through
 * the same validated business logic the app itself uses.
 *
 * Usage: start the backend first (npm run dev:backend), then:
 *   node backend/db/seed/seed.js
 *
 * Not idempotent — running it twice adds a second copy of everything. To
 * reset first, truncate via psql (see backend/db/DATABASE_LOG.md for the
 * exact command) before re-running.
 */

const API_URL = process.env.API_URL ?? 'http://localhost:3000';

function daysFromToday(offset) {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return d.toISOString().slice(0, 10);
}

async function post(path, body) {
  const res = await fetch(`${API_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    throw new Error(`POST ${path} -> ${res.status}: ${await res.text()}`);
  }
  return res.json();
}

async function main() {
  console.log(`Seeding against ${API_URL} ...`);

  // --- Customers ---
  const customers = {};
  for (const [key, name, phone] of [
    ['sarah', 'Sarah Kumar', '9876500001'],
    ['priya', 'Priya Sharma', '9876500002'],
    ['anjali', 'Anjali Mehta', '9876500003'],
    ['meena', 'Meena Iyer', '9876500004'],
    ['neha', 'Neha Singh', '9876500005'],
  ]) {
    customers[key] = await post('/customers', { name, phone });
    console.log(`customer: ${name}`);
  }

  // --- Inventory (spans OK / LOW / CRITICAL for a realistic demo) ---
  const inventory = {};
  for (const [key, itemName, unitType, quantity, reorderLevel, costPerUnit] of [
    ['lining', 'Lining Material', 'Meters', 15, 5, 40],
    ['redThread', 'Red Thread', 'Spools', 2, 3, 25], // LOW
    ['chalk', 'Chalk', 'Pieces', 0, 2, 5], // CRITICAL
    ['netFabric', 'Net Fabric', 'Meters', 8, 3, 60],
    ['whiteThread', 'White Thread', 'Spools', 12, 3, 25],
    ['goldThread', 'Gold Thread', 'Spools', 20, 5, 80],
  ]) {
    inventory[key] = await post('/inventory', { itemName, unitType, quantity, reorderLevel, costPerUnit });
    console.log(`inventory: ${itemName} (${quantity} ${unitType})`);
  }

  // --- Orders (across pending / in_progress / complete, one due today) ---
  const sarahOrder = await post('/orders', {
    customerId: customers.sarah.id,
    deliveryDate: daysFromToday(5),
    advanceReceived: 3000,
    items: [
      {
        apparelType: 'Blouse',
        measurements: { bust: '36', waist: '30', shoulder: '14', topLength: '15' },
        designNotes: 'Sleeveless, gold lace trim on neckline',
        amountCharged: 2500,
      },
      {
        apparelType: 'Lehenga',
        measurements: { waist: '30', hip: '38', fullLength: '40' },
        designNotes: 'Heavy work, can-can lining',
        amountCharged: 8000,
      },
    ],
  });
  console.log('order: Sarah Kumar (2 items)');

  const priyaOrder = await post('/orders', {
    customerId: customers.priya.id,
    deliveryDate: daysFromToday(3),
    items: [{ apparelType: 'Blouse', measurements: { bust: '34' }, amountCharged: 1800 }],
  });
  console.log('order: Priya Sharma (pending, unpaid)');

  const anjaliOrder = await post('/orders', {
    customerId: customers.anjali.id,
    deliveryDate: daysFromToday(0), // due today, for the Home screen's "Due Today" stat
    advanceReceived: 1000,
    items: [
      { apparelType: 'Gown', measurements: { bust: '36', waist: '28' }, amountCharged: 6000 },
      { apparelType: 'Dupatta', measurements: {}, amountCharged: 1200 },
    ],
  });
  console.log('order: Anjali Mehta (due today)');

  const meenaOrder = await post('/orders', {
    customerId: customers.meena.id,
    deliveryDate: daysFromToday(-2),
    advanceReceived: 3500,
    items: [{ apparelType: 'One-piece', measurements: { bust: '38', fullLength: '42' }, amountCharged: 3500 }],
  });
  console.log('order: Meena Iyer (fully paid)');

  const nehaOrder = await post('/orders', {
    customerId: customers.neha.id,
    deliveryDate: daysFromToday(10),
    advanceReceived: 500,
    items: [{ apparelType: 'Kurti', measurements: { bust: '34', fullLength: '36' }, amountCharged: 1500 }],
  });
  console.log('order: Neha Singh (in progress)');

  // Nudge a few orders into more interesting statuses so the demo isn't all "pending"
  await fetch(`${API_URL}/orders/${sarahOrder.id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status: 'in_progress' }),
  });
  await fetch(`${API_URL}/orders/${meenaOrder.id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status: 'complete' }),
  });
  await fetch(`${API_URL}/orders/${nehaOrder.id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status: 'in_progress' }),
  });
  console.log('orders: statuses updated (Sarah/Neha -> in_progress, Meena -> complete)');

  // --- Expenses (plain + inventory-usage-linked) ---
  await post('/expenses', {
    description: 'Fuel for deliveries',
    amount: 300,
    date: daysFromToday(-1),
    category: 'Transport',
  });

  await post('/expenses', {
    description: 'Gold thread for Sarah’s blouse',
    amount: 160,
    date: daysFromToday(-1),
    usageLines: [
      {
        inventoryItemId: inventory.goldThread.id,
        orderId: sarahOrder.id,
        orderItemId: sarahOrder.items[0].id,
        quantity: 2,
      },
    ],
  });

  await post('/expenses', {
    description: 'Lining material for Anjali’s gown',
    amount: 120,
    date: daysFromToday(0),
    usageLines: [
      {
        inventoryItemId: inventory.lining.id,
        orderId: anjaliOrder.id,
        orderItemId: anjaliOrder.items[0].id,
        quantity: 3,
      },
    ],
  });

  await post('/expenses', {
    description: 'Tailor assistant wages',
    amount: 500,
    date: daysFromToday(-2),
    category: 'Labor',
    orderIds: [meenaOrder.id],
  });

  console.log('expenses: 4 created (1 transport, 2 with inventory usage, 1 labor linked to an order)');

  console.log('\nSeed complete.');
}

main().catch((err) => {
  console.error('Seed failed:', err.message);
  process.exit(1);
});
