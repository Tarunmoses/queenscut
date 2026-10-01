import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitSchema1735804800000 implements MigrationInterface {
  name = 'InitSchema1735804800000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "pgcrypto"`);

    await queryRunner.query(`CREATE TYPE "orders_status_enum" AS ENUM ('pending', 'in_progress', 'complete')`);
    await queryRunner.query(
      `CREATE TYPE "orders_payment_status_enum" AS ENUM ('unpaid', 'partially_paid', 'paid')`,
    );
    await queryRunner.query(
      `CREATE TYPE "inventory_items_status_enum" AS ENUM ('ok', 'low', 'critical')`,
    );

    await queryRunner.query(`
      CREATE TABLE "customers" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "name" character varying NOT NULL,
        "phone" character varying NOT NULL,
        "email" character varying,
        CONSTRAINT "PK_customers_id" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "orders" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "customer_id" uuid NOT NULL,
        "delivery_date" date NOT NULL,
        "advance_received" numeric(10,2) NOT NULL DEFAULT 0,
        "balance_due" numeric(10,2) NOT NULL DEFAULT 0,
        "total_amount" numeric(10,2) NOT NULL DEFAULT 0,
        "status" "orders_status_enum" NOT NULL DEFAULT 'pending',
        "payment_status" "orders_payment_status_enum" NOT NULL DEFAULT 'unpaid',
        CONSTRAINT "PK_orders_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_orders_customer_id" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE RESTRICT
      )
    `);
    await queryRunner.query(`CREATE INDEX "IDX_orders_customer_id" ON "orders" ("customer_id")`);
    await queryRunner.query(`CREATE INDEX "IDX_orders_status" ON "orders" ("status")`);
    await queryRunner.query(`CREATE INDEX "IDX_orders_payment_status" ON "orders" ("payment_status")`);
    await queryRunner.query(`CREATE INDEX "IDX_orders_delivery_date" ON "orders" ("delivery_date")`);

    await queryRunner.query(`
      CREATE TABLE "order_items" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "order_id" uuid NOT NULL,
        "apparel_type" character varying NOT NULL,
        "measurements" jsonb NOT NULL DEFAULT '{}',
        "design_notes" text,
        "amount_charged" numeric(10,2) NOT NULL DEFAULT 0,
        CONSTRAINT "PK_order_items_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_order_items_order_id" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE
      )
    `);
    await queryRunner.query(`CREATE INDEX "IDX_order_items_order_id" ON "order_items" ("order_id")`);

    await queryRunner.query(`
      CREATE TABLE "inventory_items" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "item_name" character varying NOT NULL,
        "unit_type" character varying NOT NULL,
        "quantity" numeric(10,2) NOT NULL DEFAULT 0,
        "cost_per_unit" numeric(10,2) NOT NULL DEFAULT 0,
        "reorder_level" numeric(10,2) NOT NULL DEFAULT 0,
        "last_used_date" date,
        "status" "inventory_items_status_enum" NOT NULL DEFAULT 'ok',
        CONSTRAINT "PK_inventory_items_id" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(`CREATE INDEX "IDX_inventory_items_status" ON "inventory_items" ("status")`);
    await queryRunner.query(`CREATE INDEX "IDX_inventory_items_item_name" ON "inventory_items" ("item_name")`);

    await queryRunner.query(`
      CREATE TABLE "expenses" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "description" character varying NOT NULL,
        "amount" numeric(10,2) NOT NULL,
        "date" date NOT NULL,
        "category" character varying,
        CONSTRAINT "PK_expenses_id" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(`CREATE INDEX "IDX_expenses_date" ON "expenses" ("date")`);
    await queryRunner.query(`CREATE INDEX "IDX_expenses_category" ON "expenses" ("category")`);

    await queryRunner.query(`
      CREATE TABLE "expense_orders" (
        "expense_id" uuid NOT NULL,
        "order_id" uuid NOT NULL,
        CONSTRAINT "PK_expense_orders" PRIMARY KEY ("expense_id", "order_id"),
        CONSTRAINT "FK_expense_orders_expense_id" FOREIGN KEY ("expense_id") REFERENCES "expenses"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_expense_orders_order_id" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE
      )
    `);
    await queryRunner.query(`CREATE INDEX "IDX_expense_orders_expense_id" ON "expense_orders" ("expense_id")`);
    await queryRunner.query(`CREATE INDEX "IDX_expense_orders_order_id" ON "expense_orders" ("order_id")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "expense_orders"`);
    await queryRunner.query(`DROP TABLE "expenses"`);
    await queryRunner.query(`DROP TABLE "inventory_items"`);
    await queryRunner.query(`DROP TABLE "order_items"`);
    await queryRunner.query(`DROP TABLE "orders"`);
    await queryRunner.query(`DROP TABLE "customers"`);
    await queryRunner.query(`DROP TYPE "inventory_items_status_enum"`);
    await queryRunner.query(`DROP TYPE "orders_payment_status_enum"`);
    await queryRunner.query(`DROP TYPE "orders_status_enum"`);
  }
}
