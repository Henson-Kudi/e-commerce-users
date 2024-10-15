-- CreateEnum
CREATE TYPE "InvitationStatus" AS ENUM ('ACCEPTED', 'REJECTED');

-- AlterTable
ALTER TABLE "Invitation" ADD COLUMN     "status" "InvitationStatus",
ALTER COLUMN "expireAt" SET DEFAULT now() + interval '2 weeks';
