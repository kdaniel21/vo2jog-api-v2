-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN');

-- CreateEnum
CREATE TYPE "DistanceUnit" AS ENUM ('KILOMETER', 'MILE', 'METER', 'FOOT');

-- CreateEnum
CREATE TYPE "Currency" AS ENUM ('EUR', 'HUF', 'USD');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "is_admin" BOOLEAN NOT NULL DEFAULT false,
    "email" TEXT NOT NULL,
    "is_email_confirmed" BOOLEAN NOT NULL DEFAULT false,
    "name" TEXT,
    "password" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT E'USER',
    "password_reset_token" TEXT,
    "password_reset_token_expires_at" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "refresh_tokens" (
"id" SERIAL,
    "token" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "organizers" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "is_approved" BOOLEAN NOT NULL DEFAULT false,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "organizer_contact_people" (
"id" SERIAL,
    "organizer_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "phone_number" TEXT,
    "isPublic" BOOLEAN NOT NULL DEFAULT true,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "social_media" (
"id" SERIAL,
    "organizer_id" TEXT,
    "event_id" TEXT,
    "name" TEXT NOT NULL,
    "link" TEXT NOT NULL,
    "icon" TEXT NOT NULL DEFAULT E'globe',

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "events" (
    "id" TEXT NOT NULL,
    "organizerId" TEXT,
    "name" TEXT NOT NULL,
    "is_public" BOOLEAN NOT NULL DEFAULT false,
    "is_approved" BOOLEAN NOT NULL DEFAULT false,
    "start_date" TIMESTAMP(3),
    "end_date" TIMESTAMP(3),
    "image_cover" TEXT,
    "description" TEXT,
    "is_deleted" BOOLEAN NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "event_locations" (
"id" SERIAL,
    "event_id" TEXT NOT NULL,
    "latitude" INTEGER NOT NULL,
    "longitude" INTEGER NOT NULL,
    "label" TEXT,
    "country_code" TEXT,
    "country_name" TEXT,
    "state" TEXT,
    "county" TEXT,
    "city" TEXT,
    "postal_code" TEXT,
    "street" TEXT,
    "house_number" TEXT,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "event_documents" (
"id" SERIAL,
    "event_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "file" TEXT NOT NULL,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "event_questions" (
"id" SERIAL,
    "event_id" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "event_competitions" (
    "id" TEXT NOT NULL,
    "event_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "elevation_gain" INTEGER,
    "elevation_gain_unit" "DistanceUnit",
    "elevation_loss" INTEGER,
    "elevation_loss_unit" "DistanceUnit",
    "age_limit_minimum" INTEGER,
    "age_limit_maximum" INTEGER,
    "distance" INTEGER,
    "distance_unit" "DistanceUnit",

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "event_competition_price_steps" (
"id" SERIAL,
    "competitionId" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "currency" "Currency" NOT NULL,
    "end_time" TIMESTAMP(3) NOT NULL,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "event_schedule_items" (
"id" SERIAL,
    "eventId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "time" TIMESTAMP(3) NOT NULL,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "categories" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subcategories" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "category_items" (
"id" SERIAL,
    "subcategoryId" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users.email_unique" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "refresh_tokens.token_unique" ON "refresh_tokens"("token");

-- CreateIndex
CREATE UNIQUE INDEX "organizers_user_id_unique" ON "organizers"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "event_locations_event_id_unique" ON "event_locations"("event_id");

-- AddForeignKey
ALTER TABLE "refresh_tokens" ADD FOREIGN KEY("user_id")REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organizers" ADD FOREIGN KEY("user_id")REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organizer_contact_people" ADD FOREIGN KEY("organizer_id")REFERENCES "organizers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "social_media" ADD FOREIGN KEY("organizer_id")REFERENCES "organizers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "social_media" ADD FOREIGN KEY("event_id")REFERENCES "events"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "events" ADD FOREIGN KEY("organizerId")REFERENCES "organizers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_locations" ADD FOREIGN KEY("event_id")REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_documents" ADD FOREIGN KEY("event_id")REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_questions" ADD FOREIGN KEY("event_id")REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_competitions" ADD FOREIGN KEY("event_id")REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_competition_price_steps" ADD FOREIGN KEY("competitionId")REFERENCES "event_competitions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_schedule_items" ADD FOREIGN KEY("eventId")REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subcategories" ADD FOREIGN KEY("categoryId")REFERENCES "categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "category_items" ADD FOREIGN KEY("subcategoryId")REFERENCES "subcategories"("id") ON DELETE CASCADE ON UPDATE CASCADE;
