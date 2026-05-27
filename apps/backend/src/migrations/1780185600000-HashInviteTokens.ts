import { MigrationInterface, QueryRunner } from 'typeorm';

export class HashInviteTokens1780185600000 implements MigrationInterface {
  name = 'HashInviteTokens1780185600000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "invites" ADD COLUMN "token_hash" CHAR(64)`);
    // Hash existing raw tokens using Postgres built-in sha256 (available since PG 11)
    await queryRunner.query(
      `UPDATE "invites" SET "token_hash" = encode(sha256("token"::bytea), 'hex')`,
    );
    await queryRunner.query(`ALTER TABLE "invites" ALTER COLUMN "token_hash" SET NOT NULL`);
    await queryRunner.query(
      `ALTER TABLE "invites" ADD CONSTRAINT "uq_invites_token_hash" UNIQUE ("token_hash")`,
    );
    await queryRunner.query(`ALTER TABLE "invites" DROP CONSTRAINT "uq_invites_token"`);
    await queryRunner.query(`ALTER TABLE "invites" DROP COLUMN "token"`);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    // SHA-256 is irreversible — mark all pending invites revoked before downgrading
    await queryRunner.query(`UPDATE "invites" SET "status" = 'REVOKED' WHERE "status" = 'PENDING'`);
    await queryRunner.query(`ALTER TABLE "invites" ADD COLUMN "token" CHAR(64)`);
    // Use hash value as placeholder (satisfies NOT NULL + UNIQUE; tokens not usable)
    await queryRunner.query(`UPDATE "invites" SET "token" = "token_hash"`);
    await queryRunner.query(`ALTER TABLE "invites" ALTER COLUMN "token" SET NOT NULL`);
    await queryRunner.query(
      `ALTER TABLE "invites" ADD CONSTRAINT "uq_invites_token" UNIQUE ("token")`,
    );
    await queryRunner.query(`ALTER TABLE "invites" DROP CONSTRAINT "uq_invites_token_hash"`);
    await queryRunner.query(`ALTER TABLE "invites" DROP COLUMN "token_hash"`);
  }
}
