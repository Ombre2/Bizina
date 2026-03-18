import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreatePaymentMethodTable1773849743212 implements MigrationInterface {
  name = 'CreatePaymentMethodTable1773849743212';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`payment_methods\` (\`id\` varchar(36) NOT NULL, \`name\` varchar(100) NOT NULL, UNIQUE INDEX \`IDX_a793d7354d7c3aaf76347ee5a6\` (\`name\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX \`IDX_a793d7354d7c3aaf76347ee5a6\` ON \`payment_methods\``,
    );
    await queryRunner.query(`DROP TABLE \`payment_methods\``);
  }
}
