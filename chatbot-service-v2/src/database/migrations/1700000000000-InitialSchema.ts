import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1700000000000 implements MigrationInterface {
  name = 'InitialSchema1700000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Enable UUID extension
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

    await queryRunner.query(`
      CREATE TABLE "conversations" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "user_id" character varying,
        "user_name" character varying,
        "user_role" character varying,
        "company_id" integer NOT NULL DEFAULT 1,
        "context" jsonb,
        "metadata" jsonb,
        "is_active" boolean NOT NULL DEFAULT true,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "last_message_at" TIMESTAMP,
        CONSTRAINT "PK_conversations" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "messages" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "conversation_id" character varying NOT NULL,
        "role" character varying NOT NULL,
        "content" text NOT NULL,
        "intent" character varying,
        "entities" jsonb,
        "metadata" jsonb,
        "response_time" integer,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_messages" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_messages_conversation_id" ON "messages" ("conversation_id")
    `);

    await queryRunner.query(`
      CREATE TABLE "user_preferences" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "user_id" character varying NOT NULL,
        "user_name" character varying,
        "user_role" character varying,
        "default_company_id" integer NOT NULL DEFAULT 1,
        "default_warehouse_id" integer,
        "language" character varying NOT NULL DEFAULT 'vi',
        "timezone" character varying NOT NULL DEFAULT 'Asia/Ho_Chi_Minh',
        "favorite_items" jsonb,
        "favorite_warehouses" jsonb,
        "notification_preferences" jsonb,
        "custom_settings" jsonb,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_user_preferences_user_id" UNIQUE ("user_id"),
        CONSTRAINT "PK_user_preferences" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_user_preferences_user_id" ON "user_preferences" ("user_id")
    `);

    await queryRunner.query(`
      CREATE TABLE "chat_logs" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "conversation_id" character varying NOT NULL,
        "user_id" character varying,
        "user_role" character varying,
        "user_message" text NOT NULL,
        "bot_response" text NOT NULL,
        "intent" character varying,
        "entities" jsonb,
        "response_time" integer NOT NULL,
        "success" boolean NOT NULL DEFAULT true,
        "error_message" character varying,
        "metadata" jsonb,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_chat_logs" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_chat_logs_user_id_created_at" ON "chat_logs" ("user_id", "created_at")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_chat_logs_intent_created_at" ON "chat_logs" ("intent", "created_at")
    `);

    await queryRunner.query(`
      CREATE TABLE "metrics" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "metric_type" character varying NOT NULL,
        "metric_name" character varying NOT NULL,
        "value" double precision NOT NULL,
        "date" date NOT NULL,
        "metadata" jsonb,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_metrics" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_metrics_type_date" ON "metrics" ("metric_type", "date")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_metrics_type_date"`);
    await queryRunner.query(`DROP TABLE "metrics"`);
    await queryRunner.query(`DROP INDEX "IDX_chat_logs_intent_created_at"`);
    await queryRunner.query(`DROP INDEX "IDX_chat_logs_user_id_created_at"`);
    await queryRunner.query(`DROP TABLE "chat_logs"`);
    await queryRunner.query(`DROP INDEX "IDX_user_preferences_user_id"`);
    await queryRunner.query(`DROP TABLE "user_preferences"`);
    await queryRunner.query(`DROP INDEX "IDX_messages_conversation_id"`);
    await queryRunner.query(`DROP TABLE "messages"`);
    await queryRunner.query(`DROP TABLE "conversations"`);
  }
}
