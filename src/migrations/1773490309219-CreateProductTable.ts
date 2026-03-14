import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateProductTable1773490309219 implements MigrationInterface {
  name = 'CreateProductTable1773490309219';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`products\` (\`id\` varchar(36) NOT NULL, \`name\` varchar(150) NOT NULL, \`description\` text NOT NULL, \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`base_unit_id\` varchar(36) NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `ALTER TABLE \`products\` ADD CONSTRAINT \`FK_7882b3e78824252ea9de4bee977\` FOREIGN KEY (\`base_unit_id\`) REFERENCES \`units\`(\`id\`) ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`products\` DROP FOREIGN KEY \`FK_7882b3e78824252ea9de4bee977\``,
    );
    await queryRunner.query(`DROP TABLE \`products\``);
  }
}
