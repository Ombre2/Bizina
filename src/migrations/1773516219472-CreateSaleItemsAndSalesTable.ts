import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateSaleItemsAndSalesTable1773516219472 implements MigrationInterface {
  name = 'CreateSaleItemsAndSalesTable1773516219472';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`sales\` (\`id\` varchar(36) NOT NULL, \`customer_id\` varchar(36) NULL DEFAULT NULL, \`sale_date\` timestamp NOT NULL, \`total_amount\` decimal(14,2) NOT NULL, \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`sale_items\` (\`id\` varchar(36) NOT NULL, \`quantity\` decimal(14,3) NOT NULL, \`unit_price\` decimal(14,2) NOT NULL, \`total_price\` decimal(14,2) NOT NULL, \`sale_id\` varchar(36) NOT NULL, \`product_unit_id\` varchar(36) NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `ALTER TABLE \`sales\` ADD CONSTRAINT \`FK_c51005b2b06cec7aa17462c54f5\` FOREIGN KEY (\`customer_id\`) REFERENCES \`customers\`(\`id\`) ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`sale_items\` ADD CONSTRAINT \`FK_c210a330b80232c29c2ad68462a\` FOREIGN KEY (\`sale_id\`) REFERENCES \`sales\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`sale_items\` ADD CONSTRAINT \`FK_33a3d30b5af2d614198486b7333\` FOREIGN KEY (\`product_unit_id\`) REFERENCES \`product_units\`(\`id\`) ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`sale_items\` DROP FOREIGN KEY \`FK_33a3d30b5af2d614198486b7333\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`sale_items\` DROP FOREIGN KEY \`FK_c210a330b80232c29c2ad68462a\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`sales\` DROP FOREIGN KEY \`FK_c51005b2b06cec7aa17462c54f5\``,
    );
    await queryRunner.query(`DROP TABLE \`sale_items\``);
    await queryRunner.query(`DROP TABLE \`sales\``);
  }
}
