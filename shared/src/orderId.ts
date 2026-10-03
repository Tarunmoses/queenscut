/**
 * Short, human-readable, searchable order code derived from the order's UUID
 * — no separate sequence/counter needed. 6 hex chars (~16.7M combinations) is
 * plenty of headroom for a single boutique's order volume.
 */
export function shortOrderId(id: string): string {
  return `#${id.replace(/-/g, '').slice(0, 6).toUpperCase()}`;
}

/** True if `query` matches an order's short id or its full UUID, case-insensitively. */
export function matchesOrderId(id: string, query: string): boolean {
  const normalizedQuery = query.trim().replace(/^#/, '').toLowerCase();
  if (!normalizedQuery) return false;
  const shortId = shortOrderId(id).replace(/^#/, '').toLowerCase();
  const fullId = id.replace(/-/g, '').toLowerCase();
  return shortId.includes(normalizedQuery) || fullId.includes(normalizedQuery);
}
