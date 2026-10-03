import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddInventoryUsage1759435000000 implements MigrationInterface {
  name = 'AddInventoryUsage1759435000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "inventory_usage" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "inventory_item_id" uuid NOT NULL,
        "order_id" uuid NOT NULL,
        "order_item_id" uuid NOT NULL,
        "quantity" numeric(10,2) NOT NULL,
        "unit_cost" numeric(10,2) NOT NULL,
        "total_cost" numeric(10,2) NOT NULL,
        "expense_id" uuid,
        CONSTRAINT "PK_inventory_usage_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_inventory_usage_inventory_item_id" FOREIGN KEY ("inventory_item_id") REFERENCES "inventory_items"("id") ON DELETE RESTRICT,
        CONSTRAINT "FK_inventory_usage_order_id" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE RESTRICT,
        CONSTRAINT "FK_inventory_usage_order_item_id" FOREIGN KEY ("order_item_id") REFERENCES "order_items"("id") ON DELETE RESTRICT,
        CONSTRAINT "FK_inventory_usage_expense_id" FOREIGN KEY ("expense_id") REFERENCES "expenses"("id") ON DELETE SET NULL
      )
    `);
    await queryRunner.query(`CREATE INDEX "IDX_inventory_usage_inventory_item_id" ON "inventory_usage" ("inventory_item_id")`);
    await queryRunner.query(`CREATE INDEX "IDX_inventory_usage_order_id" ON "inventory_usage" ("order_id")`);
    await queryRunner.query(`CREATE INDEX "IDX_inventory_usage_expense_id" ON "inventory_usage" ("expense_id")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "inventory_usage"`);
  }
}
