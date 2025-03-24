import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1709876543210 implements MigrationInterface {
  name = 'InitialSchema1709876543210';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create enum types
    await queryRunner.query(`
      CREATE TYPE "public"."cast_category_enum" AS ENUM (
        'news', 'tech', 'business', 'entertainment', 'sports',
        'science', 'health', 'politics', 'lifestyle', 'education'
      )
    `);

    await queryRunner.query(`
      CREATE TYPE "public"."cast_status_enum" AS ENUM (
        'draft', 'published', 'scheduled', 'preview'
      )
    `);

    await queryRunner.query(`
      CREATE TYPE "public"."cast_voice_enum" AS ENUM (
        'john', 'sarah', 'mike', 'emma'
      )
    `);

    // Create user table
    await queryRunner.query(`
      CREATE TABLE "user" (
        "id" SERIAL NOT NULL,
        "firstName" character varying(96) NOT NULL,
        "lastName" character varying(96),
        "email" character varying(96) NOT NULL,
        "password" character varying(96),
        "googleId" character varying,
        CONSTRAINT "UQ_e12875dfb3b1d92d7d7c5377e22" UNIQUE ("email"),
        CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id")
      )
    `);

    // Create cast table
    await queryRunner.query(`
      CREATE TABLE "cast" (
        "id" SERIAL NOT NULL,
        "title" character varying(512) NOT NULL,
        "castCategory" "public"."cast_category_enum" NOT NULL DEFAULT 'news',
        "slug" character varying(256) NOT NULL,
        "status" "public"."cast_status_enum" NOT NULL DEFAULT 'draft',
        "content" text,
        "voice" "public"."cast_voice_enum" DEFAULT 'john',
        "voiceOverUrl" character varying(1024),
        "featuredImageUrl" character varying(1024),
        "scheduledFor" TIMESTAMP,
        "publishedOn" TIMESTAMP,
        "ownerId" integer,
        CONSTRAINT "UQ_7c3c0c0c0c0c0c0c0c0c0c0c0c0c0" UNIQUE ("slug"),
        CONSTRAINT "PK_7c3c0c0c0c0c0c0c0c0c0c0c0c0c0" PRIMARY KEY ("id")
      )
    `);

    // Add foreign key constraint
    await queryRunner.query(`
      ALTER TABLE "cast"
      ADD CONSTRAINT "FK_7c3c0c0c0c0c0c0c0c0c0c0c0c0c0"
      FOREIGN KEY ("ownerId")
      REFERENCES "user"("id")
      ON DELETE CASCADE
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop foreign key constraint
    await queryRunner.query(`
      ALTER TABLE "cast"
      DROP CONSTRAINT "FK_7c3c0c0c0c0c0c0c0c0c0c0c0c0c0"
    `);

    // Drop tables
    await queryRunner.query(`DROP TABLE "cast"`);
    await queryRunner.query(`DROP TABLE "user"`);

    // Drop enum types
    await queryRunner.query(`DROP TYPE "public"."cast_voice_enum"`);
    await queryRunner.query(`DROP TYPE "public"."cast_status_enum"`);
    await queryRunner.query(`DROP TYPE "public"."cast_category_enum"`);
  }
}
