/*
  Warnings:

  - You are about to drop the column `ip` on the `Token` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "UserDevice_userAgent_deviceIp_key";

-- AlterTable
ALTER TABLE "Invitation" ALTER COLUMN "expireAt" SET DEFAULT now() + interval '2 weeks';

-- AlterTable
ALTER TABLE "Token" DROP COLUMN "ip",
ALTER COLUMN "deviceId" DROP NOT NULL;
