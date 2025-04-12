import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1718123456789 implements MigrationInterface {
  name = 'InitialSchema1718123456789';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create users table
    await queryRunner.query(`
      CREATE TABLE "users" (
        "id" SERIAL NOT NULL,
        "email" character varying NOT NULL,
        "password" character varying,
        "firstName" character varying,
        "lastName" character varying,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        "isActive" boolean NOT NULL DEFAULT true,
        CONSTRAINT "UQ_users_email" UNIQUE ("email"),
        CONSTRAINT "PK_users" PRIMARY KEY ("id")
      )
    `);

    // Create casts table
    await queryRunner.query(`
      CREATE TABLE "casts" (
        "id" SERIAL NOT NULL,
        "title" character varying NOT NULL,
        "content" text NOT NULL,
        "status" character varying NOT NULL DEFAULT 'draft',
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        "userId" integer NOT NULL,
        CONSTRAINT "PK_casts" PRIMARY KEY ("id")
      )
    `);

    // Create foreign key for casts to users
    await queryRunner.query(`
      ALTER TABLE "casts"
      ADD CONSTRAINT "FK_casts_users"
      FOREIGN KEY ("userId")
      REFERENCES "users"("id")
      ON DELETE CASCADE
      ON UPDATE NO ACTION
    `);

    // Create index for user's casts
    await queryRunner.query(`
      CREATE INDEX "IDX_casts_userId" ON "casts" ("userId")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop index
    await queryRunner.query(`DROP INDEX "IDX_casts_userId"`);

    // Drop foreign key
    await queryRunner.query(
      `ALTER TABLE "casts" DROP CONSTRAINT "FK_casts_users"`,
    );

    // Drop tables
    await queryRunner.query(`DROP TABLE "casts"`);
    await queryRunner.query(`DROP TABLE "users"`);
  }
}
