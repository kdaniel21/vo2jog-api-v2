-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN');

-- CreateTable
CREATE TABLE "User" (
"id" SERIAL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "password" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT E'USER',
    "password_reset_token" TEXT,
    "password_reset_token_expires_at" TIMESTAMP(3),
    "deleted" BOOLEAN NOT NULL DEFAULT false,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RefreshToken" (
"id" SERIAL,
    "token" TEXT NOT NULL,
    "user_id" INTEGER NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,

    PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User.email_unique" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "RefreshToken.token_unique" ON "RefreshToken"("token");

-- AddForeignKey
ALTER TABLE "RefreshToken" ADD FOREIGN KEY("user_id")REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
