import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateProductUnitTable1773493899527 implements MigrationInterface {
    name = 'CreateProductUnitTable1773493899527'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`product_units\` (\`id\` varchar(36) NOT NULL, \`conversionToBase\` decimal(12,4) NOT NULL, \`product_id\` varchar(36) NOT NULL, \`unit_id\` varchar(36) NOT NULL, UNIQUE INDEX \`IDX_6a5262c30db5988ae51b2e4fea\` (\`product_id\`, \`unit_id\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`product_units\` ADD CONSTRAINT \`FK_832cf65bb9af2c8a29c1a9ae90b\` FOREIGN KEY (\`product_id\`) REFERENCES \`products\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`product_units\` ADD CONSTRAINT \`FK_57ac63c732902fbd6e0fc4b6f9e\` FOREIGN KEY (\`unit_id\`) REFERENCES \`units\`(\`id\`) ON DELETE RESTRICT ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`product_units\` DROP FOREIGN KEY \`FK_57ac63c732902fbd6e0fc4b6f9e\``);
        await queryRunner.query(`ALTER TABLE \`product_units\` DROP FOREIGN KEY \`FK_832cf65bb9af2c8a29c1a9ae90b\``);
        await queryRunner.query(`DROP INDEX \`IDX_6a5262c30db5988ae51b2e4fea\` ON \`product_units\``);
        await queryRunner.query(`DROP TABLE \`product_units\``);
    }

}
