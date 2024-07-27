/*
  Warnings:

  - A unique constraint covering the columns `[module,permission,resource]` on the table `Permission` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `resource` to the `Permission` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Permission_module_permission_key";

-- AlterTable
ALTER TABLE "Permission" ADD COLUMN     "resource" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Permission_module_permission_resource_key" ON "Permission"("module", "permission", "resource");
