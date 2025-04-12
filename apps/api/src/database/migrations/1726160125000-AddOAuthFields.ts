import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddOAuthFields1726160125000 implements MigrationInterface {
  name = 'AddOAuthFields1726160125000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" ADD "provider" character varying DEFAULT 'local'`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD "provider_id" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD "profile_image" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD "is_email_verified" boolean DEFAULT false`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_USERS_PROVIDER_PROVIDER_ID" ON "users" ("provider", "provider_id")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_USERS_PROVIDER_PROVIDER_ID"`);
    await queryRunner.query(
      `ALTER TABLE "users" DROP COLUMN "is_email_verified"`,
    );
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "profile_image"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "provider_id"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "provider"`);
  }
}
