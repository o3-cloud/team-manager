import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateTeamCoreTables1748390400000 implements MigrationInterface {
  name = 'CreateTeamCoreTables1748390400000';

  async up(queryRunner: QueryRunner): Promise<void> {
    // Users table — must exist for FK references; mirrors UserEntity columns (camelCase,
    // as created by TypeORM's default naming strategy with synchronize:true).
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "users" (
        "id"           UUID        NOT NULL DEFAULT gen_random_uuid(),
        "email"        VARCHAR     NOT NULL,
        "displayName"  VARCHAR     NOT NULL,
        "passwordHash" VARCHAR     NOT NULL,
        "createdAt"    TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "pk_users"       PRIMARY KEY ("id"),
        CONSTRAINT "uq_users_email" UNIQUE ("email")
      )
    `);

    // ENUMs
    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "team_role" AS ENUM (
          'COACH','ASSISTANT_COACH','TEAM_MANAGER','SCOREKEEPER','PLAYER','PARENT'
        );
      EXCEPTION WHEN duplicate_object THEN NULL; END $$
    `);
    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "season_status_enum" AS ENUM ('ACTIVE','ARCHIVED');
      EXCEPTION WHEN duplicate_object THEN NULL; END $$
    `);
    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "invite_status_enum" AS ENUM ('PENDING','ACCEPTED','REVOKED');
      EXCEPTION WHEN duplicate_object THEN NULL; END $$
    `);

    // teams
    await queryRunner.query(`
      CREATE TABLE "teams" (
        "id"         UUID         NOT NULL DEFAULT gen_random_uuid(),
        "owner_id"   UUID         NOT NULL,
        "name"       VARCHAR(100) NOT NULL,
        "created_at" TIMESTAMPTZ  NOT NULL DEFAULT now(),
        CONSTRAINT "pk_teams" PRIMARY KEY ("id"),
        CONSTRAINT "fk_teams_owner" FOREIGN KEY ("owner_id")
          REFERENCES "users"("id") ON DELETE CASCADE
      )
    `);
    await queryRunner.query(`
      CREATE UNIQUE INDEX "uq_teams_owner_name_ci"
        ON "teams" ("owner_id", LOWER("name"))
    `);

    // memberships
    await queryRunner.query(`
      CREATE TABLE "memberships" (
        "id"         UUID        NOT NULL DEFAULT gen_random_uuid(),
        "team_id"    UUID        NOT NULL,
        "user_id"    UUID        NOT NULL,
        "role"       "team_role" NOT NULL,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "pk_memberships"          PRIMARY KEY ("id"),
        CONSTRAINT "uq_memberships_team_user" UNIQUE ("team_id","user_id"),
        CONSTRAINT "fk_memberships_team" FOREIGN KEY ("team_id")
          REFERENCES "teams"("id") ON DELETE CASCADE,
        CONSTRAINT "fk_memberships_user" FOREIGN KEY ("user_id")
          REFERENCES "users"("id") ON DELETE CASCADE
      )
    `);
    await queryRunner.query(`
      CREATE INDEX "idx_memberships_user_team" ON "memberships" ("user_id","team_id")
    `);

    // seasons
    await queryRunner.query(`
      CREATE TABLE "seasons" (
        "id"         UUID                 NOT NULL DEFAULT gen_random_uuid(),
        "team_id"    UUID                 NOT NULL,
        "name"       VARCHAR(100)         NOT NULL,
        "start_date" DATE                 NOT NULL,
        "end_date"   DATE                 NOT NULL,
        "status"     "season_status_enum" NOT NULL DEFAULT 'ACTIVE',
        "created_at" TIMESTAMPTZ          NOT NULL DEFAULT now(),
        CONSTRAINT "pk_seasons" PRIMARY KEY ("id"),
        CONSTRAINT "fk_seasons_team" FOREIGN KEY ("team_id")
          REFERENCES "teams"("id") ON DELETE CASCADE
      )
    `);
    await queryRunner.query(`
      CREATE UNIQUE INDEX "uq_seasons_one_active"
        ON "seasons" ("team_id") WHERE "status" = 'ACTIVE'
    `);

    // invites
    await queryRunner.query(`
      CREATE TABLE "invites" (
        "id"          UUID                 NOT NULL DEFAULT gen_random_uuid(),
        "team_id"     UUID                 NOT NULL,
        "created_by"  UUID                 NOT NULL,
        "role"        "team_role"          NOT NULL,
        "token"       CHAR(64)             NOT NULL,
        "expires_at"  TIMESTAMPTZ          NOT NULL,
        "accepted_by" UUID,
        "status"      "invite_status_enum" NOT NULL DEFAULT 'PENDING',
        "created_at"  TIMESTAMPTZ          NOT NULL DEFAULT now(),
        CONSTRAINT "pk_invites"       PRIMARY KEY ("id"),
        CONSTRAINT "uq_invites_token" UNIQUE ("token"),
        CONSTRAINT "fk_invites_team"       FOREIGN KEY ("team_id")
          REFERENCES "teams"("id") ON DELETE CASCADE,
        CONSTRAINT "fk_invites_created_by" FOREIGN KEY ("created_by")
          REFERENCES "users"("id"),
        CONSTRAINT "fk_invites_accepted_by" FOREIGN KEY ("accepted_by")
          REFERENCES "users"("id")
      )
    `);

    // roster_entries
    await queryRunner.query(`
      CREATE TABLE "roster_entries" (
        "id"            UUID         NOT NULL DEFAULT gen_random_uuid(),
        "team_id"       UUID         NOT NULL,
        "user_id"       UUID,
        "display_name"  VARCHAR(100) NOT NULL,
        "jersey_number" VARCHAR(20),
        "position"      VARCHAR(50),
        "created_at"    TIMESTAMPTZ  NOT NULL DEFAULT now(),
        CONSTRAINT "pk_roster_entries" PRIMARY KEY ("id"),
        CONSTRAINT "fk_roster_entries_team" FOREIGN KEY ("team_id")
          REFERENCES "teams"("id") ON DELETE CASCADE,
        CONSTRAINT "fk_roster_entries_user" FOREIGN KEY ("user_id")
          REFERENCES "users"("id")
      )
    `);
    await queryRunner.query(`
      CREATE UNIQUE INDEX "uq_roster_entries_team_user"
        ON "roster_entries" ("team_id","user_id") WHERE "user_id" IS NOT NULL
    `);

    // parent_player_links
    await queryRunner.query(`
      CREATE TABLE "parent_player_links" (
        "id"              UUID NOT NULL DEFAULT gen_random_uuid(),
        "parent_user_id"  UUID NOT NULL,
        "roster_entry_id" UUID NOT NULL,
        CONSTRAINT "pk_parent_player_links"  PRIMARY KEY ("id"),
        CONSTRAINT "uq_parent_player_links"  UNIQUE ("parent_user_id","roster_entry_id"),
        CONSTRAINT "fk_ppl_parent" FOREIGN KEY ("parent_user_id")
          REFERENCES "users"("id") ON DELETE CASCADE,
        CONSTRAINT "fk_ppl_entry" FOREIGN KEY ("roster_entry_id")
          REFERENCES "roster_entries"("id") ON DELETE CASCADE
      )
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "parent_player_links"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "roster_entries"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "invites"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "seasons"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "memberships"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "teams"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "invite_status_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "season_status_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "team_role"`);
  }
}
