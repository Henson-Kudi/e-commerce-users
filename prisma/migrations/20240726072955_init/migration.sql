-- AlterTable
ALTER TABLE "User" ADD COLUMN     "invitedById" TEXT,
ADD COLUMN     "lastModifiedById" TEXT;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_lastModifiedById_fkey" FOREIGN KEY ("lastModifiedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_invitedById_fkey" FOREIGN KEY ("invitedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
