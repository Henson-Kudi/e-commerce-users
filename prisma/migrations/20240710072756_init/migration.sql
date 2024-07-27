/*
  Warnings:

  - Changed the type of `type` on the `UserToken` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "TokenType" AS ENUM ('OTP', 'ACCESS_TOKEN', 'REFRESH_TOKEN');

-- AlterTable
ALTER TABLE "UserToken" DROP COLUMN "type",
ADD COLUMN     "type" "TokenType" NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "UserToken_type_userId_key" ON "UserToken"("type", "userId");
