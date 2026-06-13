import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddRosterStatus1789200000000 implements MigrationInterface {
  name = 'AddRosterStatus1789200000000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "roster_entry_status_enum" AS ENUM ('ACTIVE','INJURED','INACTIVE');
      EXCEPTION WHEN duplicate_object THEN NULL; END $$
    `);
    await queryRunner.query(`
      ALTER TABLE "roster_entries"
        ADD COLUMN "status" "roster_entry_status_enum" NOT NULL DEFAULT 'ACTIVE';
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "roster_entries" DROP COLUMN IF EXISTS "status"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "roster_entry_status_enum"`);
  }
}
