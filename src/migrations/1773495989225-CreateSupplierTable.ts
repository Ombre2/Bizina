import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateSupplierTable1773495989225 implements MigrationInterface {
  name = 'CreateSupplierTable1773495989225';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`suppliers\` (\`id\` varchar(36) NOT NULL, \`name\` varchar(150) NOT NULL, \`phone\` varchar(30) NULL DEFAULT NULL, \`address\` text NULL DEFAULT NULL, \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE \`suppliers\``);
  }
}
