import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreatePurshaseItemsTable1773499834907 implements MigrationInterface {
  name = 'CreatePurshaseItemsTable1773499834907';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`purchase_items\` (\`id\` varchar(36) NOT NULL, \`quantity\` decimal(14,3) NOT NULL, \`unit_price\` decimal(14,2) NOT NULL, \`total_price\` decimal(14,2) NOT NULL, \`purchase_id\` varchar(36) NOT NULL, \`product_id\` varchar(36) NOT NULL, \`unit_id\` varchar(36) NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `ALTER TABLE \`purchase_items\` ADD CONSTRAINT \`FK_607211d59b13e705a673a999ab5\` FOREIGN KEY (\`purchase_id\`) REFERENCES \`purchases\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`purchase_items\` ADD CONSTRAINT \`FK_43694b2fa800ce38d2da9ce74d6\` FOREIGN KEY (\`product_id\`) REFERENCES \`products\`(\`id\`) ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`purchase_items\` ADD CONSTRAINT \`FK_700d629642e39ee68e3c20eaa2c\` FOREIGN KEY (\`unit_id\`) REFERENCES \`units\`(\`id\`) ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`purchase_items\` DROP FOREIGN KEY \`FK_700d629642e39ee68e3c20eaa2c\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`purchase_items\` DROP FOREIGN KEY \`FK_43694b2fa800ce38d2da9ce74d6\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`purchase_items\` DROP FOREIGN KEY \`FK_607211d59b13e705a673a999ab5\``,
    );
    await queryRunner.query(`DROP TABLE \`purchase_items\``);
  }
}
