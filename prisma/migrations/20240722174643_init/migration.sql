/*
  Warnings:

  - You are about to drop the column `description` on the `Permission` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `Permission` table. All the data in the column will be lost.
  - You are about to drop the column `slug` on the `Permission` table. All the data in the column will be lost.
  - You are about to drop the `Route` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `RoutePermission` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `module` to the `Permission` table without a default value. This is not possible if the table is not empty.
  - Added the required column `permission` to the `Permission` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "RoutePermission" DROP CONSTRAINT "RoutePermission_permissionId_fkey";

-- DropForeignKey
ALTER TABLE "RoutePermission" DROP CONSTRAINT "RoutePermission_routeId_fkey";

-- DropIndex
DROP INDEX "Permission_name_key";

-- DropIndex
DROP INDEX "Permission_slug_key";

-- AlterTable
ALTER TABLE "Permission" DROP COLUMN "description",
DROP COLUMN "name",
DROP COLUMN "slug",
ADD COLUMN     "module" TEXT NOT NULL,
ADD COLUMN     "permission" TEXT NOT NULL;

-- DropTable
DROP TABLE "Route";

-- DropTable
DROP TABLE "RoutePermission";
