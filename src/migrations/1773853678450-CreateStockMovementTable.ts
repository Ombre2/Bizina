import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateStockMovementTable1773853678450 implements MigrationInterface {
  name = 'CreateStockMovementTable1773853678450';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`stock_movements\` (\`id\` varchar(36) NOT NULL, \`quantity\` decimal(14,3) NOT NULL, \`movement_type\` enum ('purchase', 'sale', 'adjustment') NOT NULL, \`sale_id\` varchar(36) NULL DEFAULT NULL, \`purchase_id\` varchar(36) NULL DEFAULT NULL, \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`product_id\` varchar(36) NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `ALTER TABLE \`stock_movements\` ADD CONSTRAINT \`FK_2c1bb05b80ddcc562cd28d826c6\` FOREIGN KEY (\`product_id\`) REFERENCES \`products\`(\`id\`) ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`stock_movements\` ADD CONSTRAINT \`FK_b6d549c625b2e9979c1f72a6731\` FOREIGN KEY (\`sale_id\`) REFERENCES \`sales\`(\`id\`) ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`stock_movements\` ADD CONSTRAINT \`FK_251d35c3ccfc975991b758de993\` FOREIGN KEY (\`purchase_id\`) REFERENCES \`purchases\`(\`id\`) ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`stock_movements\` DROP FOREIGN KEY \`FK_251d35c3ccfc975991b758de993\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`stock_movements\` DROP FOREIGN KEY \`FK_b6d549c625b2e9979c1f72a6731\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`stock_movements\` DROP FOREIGN KEY \`FK_2c1bb05b80ddcc562cd28d826c6\``,
    );
    await queryRunner.query(`DROP TABLE \`stock_movements\``);
  }
}
