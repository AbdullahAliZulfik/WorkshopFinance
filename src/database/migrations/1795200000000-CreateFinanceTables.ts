import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateFinanceTables1795200000000 implements MigrationInterface {
  name = 'CreateFinanceTables1795200000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`categories\` (
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`name\` varchar(100) NOT NULL,
        \`type\` enum ('income', 'expense') NOT NULL,
        \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        PRIMARY KEY (\`id\`)
      ) ENGINE=InnoDB`,
    );

    await queryRunner.query(
      `CREATE TABLE \`transactions\` (
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`title\` varchar(150) NOT NULL,
        \`amount\` decimal(12,2) NOT NULL,
        \`type\` enum ('income', 'expense') NOT NULL,
        \`description\` text NULL,
        \`transaction_date\` date NOT NULL,
        \`category_id\` int NOT NULL,
        \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        PRIMARY KEY (\`id\`)
      ) ENGINE=InnoDB`,
    );

    await queryRunner.query(
      `ALTER TABLE \`transactions\`
        ADD CONSTRAINT \`FK_transactions_category_id\`
        FOREIGN KEY (\`category_id\`) REFERENCES \`categories\`(\`id\`)
        ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );

    // Kategori awal supaya aplikasi langsung bisa dipakai
    await queryRunner.query(
      `INSERT INTO \`categories\` (\`name\`, \`type\`) VALUES
        ('Gaji', 'income'),
        ('Bonus', 'income'),
        ('Uang Saku', 'income'),
        ('Makanan & Minuman', 'expense'),
        ('Transportasi', 'expense'),
        ('Pendidikan', 'expense'),
        ('Kebutuhan Lainnya', 'expense')`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`transactions\` DROP FOREIGN KEY \`FK_transactions_category_id\``,
    );
    await queryRunner.query(`DROP TABLE \`transactions\``);
    await queryRunner.query(`DROP TABLE \`categories\``);
  }
}
