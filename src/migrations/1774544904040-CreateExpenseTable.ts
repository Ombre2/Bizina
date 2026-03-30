import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateExpenseTable1774544904040 implements MigrationInterface {
  name = 'CreateExpenseTable1774544904040';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`expenses\` (\`id\` varchar(36) NOT NULL, \`amount\` decimal(14,2) NOT NULL, \`note\` text NULL DEFAULT NULL, \`mission_id\` varchar(36) NOT NULL, \`category_id\` varchar(36) NOT NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `ALTER TABLE \`expenses\` ADD CONSTRAINT \`FK_124a88386adbedacbce18573837\` FOREIGN KEY (\`mission_id\`) REFERENCES \`missions\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`expenses\` ADD CONSTRAINT \`FK_5d1f4be708e0dfe2afa1a3c376c\` FOREIGN KEY (\`category_id\`) REFERENCES \`expense_categories\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`expenses\` DROP FOREIGN KEY \`FK_5d1f4be708e0dfe2afa1a3c376c\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`expenses\` DROP FOREIGN KEY \`FK_124a88386adbedacbce18573837\``,
    );
    await queryRunner.query(`DROP TABLE \`expenses\``);
  }
}
