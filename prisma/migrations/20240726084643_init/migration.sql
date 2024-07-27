-- AlterTable
ALTER TABLE "Invitation" ADD COLUMN     "expireAt" TIMESTAMP(3) NOT NULL DEFAULT now() + interval '2 weeks';
