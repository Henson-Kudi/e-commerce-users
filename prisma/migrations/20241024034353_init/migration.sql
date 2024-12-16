/*
  Warnings:

  - A unique constraint covering the columns `[userId,token]` on the table `Token` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Invitation" ALTER COLUMN "expireAt" SET DEFAULT now() + interval '2 weeks';

-- CreateIndex
CREATE UNIQUE INDEX "Token_userId_token_key" ON "Token"("userId", "token");
