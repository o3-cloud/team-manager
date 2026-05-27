import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateParticipationTables1748563200000 implements MigrationInterface {
  name = 'CreateParticipationTables1748563200000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "rsvp_status_enum" AS ENUM ('GOING','NOT_GOING','MAYBE');
      EXCEPTION WHEN duplicate_object THEN NULL; END $$
    `);
    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "attendance_mark_enum" AS ENUM ('PRESENT','ABSENT');
      EXCEPTION WHEN duplicate_object THEN NULL; END $$
    `);
    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "game_outcome_enum" AS ENUM ('WIN','LOSS','TIE');
      EXCEPTION WHEN duplicate_object THEN NULL; END $$
    `);

    await queryRunner.query(`
      CREATE TABLE "rsvp" (
        "id"         UUID              NOT NULL DEFAULT gen_random_uuid(),
        "event_id"   UUID              NOT NULL,
        "user_id"    UUID              NOT NULL,
        "status"     "rsvp_status_enum" NOT NULL,
        "created_at" TIMESTAMPTZ       NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ       NOT NULL DEFAULT now(),
        CONSTRAINT "pk_rsvp"             PRIMARY KEY ("id"),
        CONSTRAINT "uq_rsvp_event_user"  UNIQUE ("event_id","user_id"),
        CONSTRAINT "fk_rsvp_event" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE,
        CONSTRAINT "fk_rsvp_user"  FOREIGN KEY ("user_id")  REFERENCES "users"("id")  ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "attendance_records" (
        "id"               UUID                  NOT NULL DEFAULT gen_random_uuid(),
        "event_id"         UUID                  NOT NULL,
        "roster_entry_id"  UUID                  NOT NULL,
        "mark"             "attendance_mark_enum" NOT NULL,
        "created_at"       TIMESTAMPTZ           NOT NULL DEFAULT now(),
        "updated_at"       TIMESTAMPTZ           NOT NULL DEFAULT now(),
        CONSTRAINT "pk_attendance"                PRIMARY KEY ("id"),
        CONSTRAINT "uq_attendance_event_entry"    UNIQUE ("event_id","roster_entry_id"),
        CONSTRAINT "fk_attendance_event"  FOREIGN KEY ("event_id")        REFERENCES "events"("id")         ON DELETE CASCADE,
        CONSTRAINT "fk_attendance_entry"  FOREIGN KEY ("roster_entry_id") REFERENCES "roster_entries"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "game_results" (
        "id"           UUID               NOT NULL DEFAULT gen_random_uuid(),
        "event_id"     UUID               NOT NULL,
        "season_id"    UUID               NOT NULL,
        "own_score"    INT                NOT NULL,
        "opp_score"    INT                NOT NULL,
        "outcome"      "game_outcome_enum" NOT NULL,
        "notes"        TEXT,
        "created_at"   TIMESTAMPTZ        NOT NULL DEFAULT now(),
        "updated_at"   TIMESTAMPTZ        NOT NULL DEFAULT now(),
        CONSTRAINT "pk_game_results"    PRIMARY KEY ("id"),
        CONSTRAINT "uq_game_result_event" UNIQUE ("event_id"),
        CONSTRAINT "fk_gr_event"  FOREIGN KEY ("event_id")  REFERENCES "events"("id")   ON DELETE CASCADE,
        CONSTRAINT "fk_gr_season" FOREIGN KEY ("season_id") REFERENCES "seasons"("id")  ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "season_records" (
        "id"        UUID NOT NULL DEFAULT gen_random_uuid(),
        "season_id" UUID NOT NULL,
        "wins"      INT  NOT NULL DEFAULT 0,
        "losses"    INT  NOT NULL DEFAULT 0,
        "ties"      INT  NOT NULL DEFAULT 0,
        CONSTRAINT "pk_season_records"    PRIMARY KEY ("id"),
        CONSTRAINT "uq_season_records_season" UNIQUE ("season_id"),
        CONSTRAINT "fk_sr_season" FOREIGN KEY ("season_id") REFERENCES "seasons"("id") ON DELETE CASCADE
      )
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "season_records"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "game_results"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "attendance_records"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "rsvp"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "game_outcome_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "attendance_mark_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "rsvp_status_enum"`);
  }
}
