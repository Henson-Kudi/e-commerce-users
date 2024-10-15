-- AlterTable
ALTER TABLE "Invitation" ADD COLUMN     "groups" TEXT[],
ALTER COLUMN "expireAt" SET DEFAULT now() + interval '2 weeks';
