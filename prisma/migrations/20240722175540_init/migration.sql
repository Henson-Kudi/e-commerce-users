/*
  Warnings:

  - A unique constraint covering the columns `[module,permission]` on the table `Permission` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Permission_module_permission_key" ON "Permission"("module", "permission");
