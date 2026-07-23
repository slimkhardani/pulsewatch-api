import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1784674670433 implements MigrationInterface {
    name = 'InitialSchema1784674670433'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "checks" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "statusCode" integer, "responseTimeMs" integer, "success" boolean NOT NULL, "checkedAt" TIMESTAMP NOT NULL DEFAULT now(), "monitorId" uuid, CONSTRAINT "PK_5b78bc7432d3654a701ca5f35e5" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_dde6cf7ec3b6d71386e89dec42" ON "checks"  ("monitorId", "checkedAt") `);
        await queryRunner.query(`CREATE TABLE "incidents" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "startedAt" TIMESTAMP NOT NULL DEFAULT now(), "resolvedAt" TIMESTAMP, "cause" character varying NOT NULL, "monitorId" uuid, CONSTRAINT "PK_ccb34c01719889017e2246469f9" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "monitors" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "url" character varying NOT NULL, "intervalSeconds" integer NOT NULL DEFAULT '300', "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "userId" uuid, CONSTRAINT "PK_193902e2013887310490284cdbe" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."users_plan_enum" AS ENUM('free', 'pro')`);
        await queryRunner.query(`CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "email" character varying NOT NULL, "passwordHash" character varying NOT NULL, "plan" "public"."users_plan_enum" NOT NULL DEFAULT 'free', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "stripeCustomerId" character varying, "isEmailVerified" boolean NOT NULL DEFAULT false, "emailVerificationToken" character varying, "passwordResetToken" character varying, "passwordResetExpires" TIMESTAMP, "stripeSubscriptionId" character varying, CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "checks" ADD CONSTRAINT "FK_d949d3cc0a17ce869be055aa6d2" FOREIGN KEY ("monitorId") REFERENCES "monitors"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "incidents" ADD CONSTRAINT "FK_77c92898211e6e84f9577380481" FOREIGN KEY ("monitorId") REFERENCES "monitors"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "monitors" ADD CONSTRAINT "FK_8c605bf1839d27af6b2efc0d025" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "monitors" DROP CONSTRAINT "FK_8c605bf1839d27af6b2efc0d025"`);
        await queryRunner.query(`ALTER TABLE "incidents" DROP CONSTRAINT "FK_77c92898211e6e84f9577380481"`);
        await queryRunner.query(`ALTER TABLE "checks" DROP CONSTRAINT "FK_d949d3cc0a17ce869be055aa6d2"`);
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP TYPE "public"."users_plan_enum"`);
        await queryRunner.query(`DROP TABLE "monitors"`);
        await queryRunner.query(`DROP TABLE "incidents"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_dde6cf7ec3b6d71386e89dec42"`);
        await queryRunner.query(`DROP TABLE "checks"`);
    }

}
