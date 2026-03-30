import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateExpenseCategoryTable1774543547047 implements MigrationInterface {
  name = 'CreateExpenseCategoryTable1774543547047';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`expense_categories\` (\`id\` varchar(36) NOT NULL, \`name\` varchar(150) NOT NULL, \`description\` varchar(255) NULL DEFAULT NULL, UNIQUE INDEX \`IDX_6bdb3db95dd955d3c701e93542\` (\`name\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX \`IDX_6bdb3db95dd955d3c701e93542\` ON \`expense_categories\``,
    );
    await queryRunner.query(`DROP TABLE \`expense_categories\``);
  }
}
