import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateSalePaymentTable1773851207218 implements MigrationInterface {
  name = 'CreateSalePaymentTable1773851207218';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`sale_payments\` (\`id\` varchar(36) NOT NULL, \`amount\` decimal(14,2) NOT NULL, \`payment_date\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`sale_id\` varchar(36) NOT NULL, \`payment_method_id\` varchar(36) NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `ALTER TABLE \`sale_payments\` ADD CONSTRAINT \`FK_0e4445597642c2456ebdd7e23b1\` FOREIGN KEY (\`sale_id\`) REFERENCES \`sales\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`sale_payments\` ADD CONSTRAINT \`FK_9c7db4fd07371a0c1eddcd1bd20\` FOREIGN KEY (\`payment_method_id\`) REFERENCES \`payment_methods\`(\`id\`) ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`sale_payments\` DROP FOREIGN KEY \`FK_9c7db4fd07371a0c1eddcd1bd20\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`sale_payments\` DROP FOREIGN KEY \`FK_0e4445597642c2456ebdd7e23b1\``,
    );
    await queryRunner.query(`DROP TABLE \`sale_payments\``);
  }
}
