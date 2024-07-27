/*
  Warnings:

  - A unique constraint covering the columns `[path,module,method]` on the table `Route` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `module` to the `Route` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Route` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Route_path_application_key";

-- DropIndex
DROP INDEX "Route_path_key";

-- AlterTable
ALTER TABLE "Route" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "module" TEXT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Route_path_module_method_key" ON "Route"("path", "module", "method");
