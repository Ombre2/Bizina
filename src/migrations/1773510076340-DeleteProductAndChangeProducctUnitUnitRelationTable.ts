import { MigrationInterface, QueryRunner } from 'typeorm';

export class DeleteProductAndChangeProducctUnitUnitRelationTable1773510076340 implements MigrationInterface {
  name = 'DeleteProductAndChangeProducctUnitUnitRelationTable1773510076340';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`purchase_items\` DROP FOREIGN KEY \`FK_43694b2fa800ce38d2da9ce74d6\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`purchase_items\` DROP FOREIGN KEY \`FK_700d629642e39ee68e3c20eaa2c\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`purchase_items\` DROP COLUMN \`product_id\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`purchase_items\` DROP COLUMN \`unit_id\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`purchase_items\` ADD \`product_unit_id\` varchar(36) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`purchase_items\` ADD CONSTRAINT \`FK_0557738aa4084eded4e979605b7\` FOREIGN KEY (\`product_unit_id\`) REFERENCES \`product_units\`(\`id\`) ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`purchase_items\` DROP FOREIGN KEY \`FK_0557738aa4084eded4e979605b7\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`purchase_items\` DROP COLUMN \`product_unit_id\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`purchase_items\` ADD \`unit_id\` varchar(36) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`purchase_items\` ADD \`product_id\` varchar(36) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`purchase_items\` ADD CONSTRAINT \`FK_700d629642e39ee68e3c20eaa2c\` FOREIGN KEY (\`unit_id\`) REFERENCES \`units\`(\`id\`) ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`purchase_items\` ADD CONSTRAINT \`FK_43694b2fa800ce38d2da9ce74d6\` FOREIGN KEY (\`product_id\`) REFERENCES \`products\`(\`id\`) ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
  }
}
