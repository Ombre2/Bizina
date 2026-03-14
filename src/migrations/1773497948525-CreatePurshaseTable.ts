import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreatePurshaseTable1773497948525 implements MigrationInterface {
  name = 'CreatePurshaseTable1773497948525';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`purchases\` (\`id\` varchar(36) NOT NULL, \`purchase_date\` timestamp NOT NULL, \`total_amount\` decimal(14,2) NOT NULL, \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`supplier_id\` varchar(36) NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `ALTER TABLE \`purchases\` ADD CONSTRAINT \`FK_d5fec047f705d5b510c19379b95\` FOREIGN KEY (\`supplier_id\`) REFERENCES \`suppliers\`(\`id\`) ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`purchases\` DROP FOREIGN KEY \`FK_d5fec047f705d5b510c19379b95\``,
    );
    await queryRunner.query(`DROP TABLE \`purchases\``);
  }
}
