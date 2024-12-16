-- AlterTable
ALTER TABLE "Invitation" ALTER COLUMN "expireAt" SET DEFAULT now() + interval '2 weeks';

-- AlterTable
ALTER TABLE "UserDevices" ADD COLUMN     "lastLoginAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
