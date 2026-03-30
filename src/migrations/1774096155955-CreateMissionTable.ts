import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateMissionTable1774096155955 implements MigrationInterface {
  name = 'CreateMissionTable1774096155955';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`missions\` (\`id\` varchar(36) NOT NULL, \`title\` varchar(150) NOT NULL, \`initial_cash\` decimal(14,2) NOT NULL, \`status\` varchar(255) NOT NULL DEFAULT 'ongoing', \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`assigned_to\` varchar(36) NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `ALTER TABLE \`purchases\` ADD \`mission_id\` varchar(36) NULL DEFAULT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`sales\` ADD \`mission_id\` varchar(36) NULL DEFAULT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`stock_movements\` ADD \`mission_id\` varchar(36) NULL DEFAULT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`purchases\` ADD CONSTRAINT \`FK_d63c38541d0e76fbd2a456db7ec\` FOREIGN KEY (\`mission_id\`) REFERENCES \`missions\`(\`id\`) ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`sales\` ADD CONSTRAINT \`FK_af16eea90cdbccaf4ace0632d30\` FOREIGN KEY (\`mission_id\`) REFERENCES \`missions\`(\`id\`) ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`missions\` ADD CONSTRAINT \`FK_54c8f816acc99f103650a658d0c\` FOREIGN KEY (\`assigned_to\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`stock_movements\` ADD CONSTRAINT \`FK_fb2f69baef4630e163c9ac997b7\` FOREIGN KEY (\`mission_id\`) REFERENCES \`missions\`(\`id\`) ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`stock_movements\` DROP FOREIGN KEY \`FK_fb2f69baef4630e163c9ac997b7\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`missions\` DROP FOREIGN KEY \`FK_54c8f816acc99f103650a658d0c\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`sales\` DROP FOREIGN KEY \`FK_af16eea90cdbccaf4ace0632d30\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`purchases\` DROP FOREIGN KEY \`FK_d63c38541d0e76fbd2a456db7ec\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`stock_movements\` DROP COLUMN \`mission_id\``,
    );
    await queryRunner.query(`ALTER TABLE \`sales\` DROP COLUMN \`mission_id\``);
    await queryRunner.query(
      `ALTER TABLE \`purchases\` DROP COLUMN \`mission_id\``,
    );
    await queryRunner.query(`DROP TABLE \`missions\``);
  }
}
