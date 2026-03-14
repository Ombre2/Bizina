import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateUnitTable1773486097022 implements MigrationInterface {
  name = 'CreateUnitTable1773486097022';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`units\` (\`id\` varchar(36) NOT NULL, \`name\` varchar(100) NOT NULL, \`symbol\` varchar(20) NOT NULL, UNIQUE INDEX \`IDX_cd34e4bfea359fa09d997a0b87\` (\`name\`), UNIQUE INDEX \`IDX_a6212005ebb20ec48e23aa397a\` (\`symbol\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX \`IDX_a6212005ebb20ec48e23aa397a\` ON \`units\``,
    );
    await queryRunner.query(
      `DROP INDEX \`IDX_cd34e4bfea359fa09d997a0b87\` ON \`units\``,
    );
    await queryRunner.query(`DROP TABLE \`units\``);
  }
}
