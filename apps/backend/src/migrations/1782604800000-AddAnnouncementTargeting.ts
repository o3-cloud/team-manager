import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddAnnouncementTargeting1782604800000 implements MigrationInterface {
  name = 'AddAnnouncementTargeting1782604800000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DO $$ BEGIN
        CREATE TYPE "announcement_audience_enum" AS ENUM ('ALL', 'PLAYERS', 'PARENTS');
      EXCEPTION WHEN duplicate_object THEN NULL; END $$`,
    );
    await queryRunner.query(
      `ALTER TABLE "announcements"
        ADD COLUMN "target_audience" "announcement_audience_enum" NOT NULL DEFAULT 'ALL',
        ADD COLUMN "urgent" BOOLEAN NOT NULL DEFAULT false`,
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "announcements"
        DROP COLUMN IF EXISTS "urgent",
        DROP COLUMN IF EXISTS "target_audience"`,
    );
    await queryRunner.query(`DROP TYPE IF EXISTS "announcement_audience_enum"`);
  }
}
