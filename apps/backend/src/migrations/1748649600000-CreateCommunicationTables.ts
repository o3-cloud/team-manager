import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateCommunicationTables1748649600000 implements MigrationInterface {
  name = 'CreateCommunicationTables1748649600000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "notification_type_enum" AS ENUM (
          'EVENT_UPDATED','EVENT_CANCELLED','EVENT_REINSTATED','ANNOUNCEMENT_POSTED'
        );
      EXCEPTION WHEN duplicate_object THEN NULL; END $$
    `);

    await queryRunner.query(`
      CREATE TABLE "announcements" (
        "id"         UUID    NOT NULL DEFAULT gen_random_uuid(),
        "team_id"    UUID    NOT NULL,
        "author_id"  UUID    NOT NULL,
        "title"      VARCHAR(200) NOT NULL,
        "body"       TEXT    NOT NULL,
        "pinned"     BOOLEAN NOT NULL DEFAULT false,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "pk_announcements" PRIMARY KEY ("id"),
        CONSTRAINT "fk_ann_team"   FOREIGN KEY ("team_id")   REFERENCES "teams"("id")  ON DELETE CASCADE,
        CONSTRAINT "fk_ann_author" FOREIGN KEY ("author_id") REFERENCES "users"("id")  ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "notifications" (
        "id"         UUID    NOT NULL DEFAULT gen_random_uuid(),
        "user_id"    UUID    NOT NULL,
        "team_id"    UUID    NOT NULL,
        "type"       "notification_type_enum" NOT NULL,
        "ref_id"     UUID,
        "message"    TEXT    NOT NULL,
        "is_read"    BOOLEAN NOT NULL DEFAULT false,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "pk_notifications" PRIMARY KEY ("id"),
        CONSTRAINT "fk_notif_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE,
        CONSTRAINT "fk_notif_team" FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "idx_notifications_user_team" ON "notifications" ("user_id", "team_id")
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_notifications_user_team"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "notifications"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "announcements"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "notification_type_enum"`);
  }
}
