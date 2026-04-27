import { MigrationInterface, QueryRunner } from "typeorm";

export class AddMinimumStockToProducts1777312980373 implements MigrationInterface {
    name = 'AddMinimumStockToProducts1777312980373'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`products\` ADD \`minimumStock\` float NOT NULL DEFAULT '0'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`products\` DROP COLUMN \`minimumStock\``);
    }

}
