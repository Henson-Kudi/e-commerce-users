/*
  Warnings:

  - You are about to drop the column `device` on the `Token` table. All the data in the column will be lost.
  - You are about to drop the column `lastLoginAt` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `lastLoginDevice` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `lastLoginIp` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `lastLoginLocation` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `UserDevices` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[type,userId,deviceId]` on the table `Token` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `deviceId` to the `Token` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "UserDevices" DROP CONSTRAINT "UserDevices_userId_fkey";

-- DropIndex
DROP INDEX "Token_type_userId_key";

-- AlterTable
ALTER TABLE "Invitation" ALTER COLUMN "expireAt" SET DEFAULT now() + interval '2 weeks';

-- AlterTable
ALTER TABLE "Token" DROP COLUMN "device",
ADD COLUMN     "deviceId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "lastLoginAt",
DROP COLUMN "lastLoginDevice",
DROP COLUMN "lastLoginIp",
DROP COLUMN "lastLoginLocation";

-- DropTable
DROP TABLE "UserDevices";

-- CreateTable
CREATE TABLE "UserDevice" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "deviceIp" TEXT NOT NULL,
    "userAgent" TEXT NOT NULL,
    "deviceType" TEXT NOT NULL,
    "browser" TEXT,
    "location" TEXT,
    "os" TEXT,
    "lastLoginAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserDevice_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserDevice_userId_deviceIp_key" ON "UserDevice"("userId", "deviceIp");

-- CreateIndex
CREATE UNIQUE INDEX "UserDevice_userAgent_deviceIp_key" ON "UserDevice"("userAgent", "deviceIp");

-- CreateIndex
CREATE UNIQUE INDEX "UserDevice_userId_userAgent_key" ON "UserDevice"("userId", "userAgent");

-- CreateIndex
CREATE INDEX "Group_slug_isActive_isDeleted_idx" ON "Group"("slug", "isActive", "isDeleted");

-- CreateIndex
CREATE INDEX "Permission_module_resource_permission_isActive_isDeleted_idx" ON "Permission"("module", "resource", "permission", "isActive", "isDeleted");

-- CreateIndex
CREATE INDEX "Role_slug_isActive_isDeleted_idx" ON "Role"("slug", "isActive", "isDeleted");

-- CreateIndex
CREATE UNIQUE INDEX "Token_type_userId_deviceId_key" ON "Token"("type", "userId", "deviceId");

-- CreateIndex
CREATE INDEX "User_email_phone_isActive_isDeleted_idx" ON "User"("email", "phone", "isActive", "isDeleted");

-- AddForeignKey
ALTER TABLE "Token" ADD CONSTRAINT "Token_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "UserDevice"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserDevice" ADD CONSTRAINT "UserDevice_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
