import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateScheduleTables1748476800000 implements MigrationInterface {
  name = 'CreateScheduleTables1748476800000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "event_type_enum" AS ENUM ('GAME','PRACTICE','MEETING','OTHER');
      EXCEPTION WHEN duplicate_object THEN NULL; END $$
    `);
    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "event_status_enum" AS ENUM ('SCHEDULED','CANCELLED');
      EXCEPTION WHEN duplicate_object THEN NULL; END $$
    `);

    await queryRunner.query(`
      CREATE TABLE "recurring_event_series" (
        "id"           UUID        NOT NULL DEFAULT gen_random_uuid(),
        "team_id"      UUID        NOT NULL,
        "season_id"    UUID        NOT NULL,
        "rrule_string" TEXT        NOT NULL,
        "end_date"     DATE        NOT NULL,
        "created_at"   TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "pk_recurring_event_series" PRIMARY KEY ("id"),
        CONSTRAINT "fk_res_team"   FOREIGN KEY ("team_id")   REFERENCES "teams"("id")   ON DELETE CASCADE,
        CONSTRAINT "fk_res_season" FOREIGN KEY ("season_id") REFERENCES "seasons"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "events" (
        "id"            UUID               NOT NULL DEFAULT gen_random_uuid(),
        "team_id"       UUID               NOT NULL,
        "season_id"     UUID               NOT NULL,
        "series_id"     UUID,
        "title"         VARCHAR(200)       NOT NULL,
        "type"          "event_type_enum"  NOT NULL DEFAULT 'PRACTICE',
        "status"        "event_status_enum" NOT NULL DEFAULT 'SCHEDULED',
        "starts_at"     TIMESTAMPTZ        NOT NULL,
        "location"      VARCHAR(300),
        "notes"         TEXT,
        "cancel_reason" TEXT,
        "version"       INT                NOT NULL DEFAULT 0,
        "created_at"    TIMESTAMPTZ        NOT NULL DEFAULT now(),
        CONSTRAINT "pk_events"      PRIMARY KEY ("id"),
        CONSTRAINT "fk_events_team"   FOREIGN KEY ("team_id")   REFERENCES "teams"("id")   ON DELETE CASCADE,
        CONSTRAINT "fk_events_season" FOREIGN KEY ("season_id") REFERENCES "seasons"("id") ON DELETE CASCADE,
        CONSTRAINT "fk_events_series" FOREIGN KEY ("series_id") REFERENCES "recurring_event_series"("id") ON DELETE CASCADE
      )
    `);
    await queryRunner.query(`
      CREATE INDEX "idx_events_team_starts" ON "events" ("team_id","starts_at")
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "events"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "recurring_event_series"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "event_status_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "event_type_enum"`);
  }
}
