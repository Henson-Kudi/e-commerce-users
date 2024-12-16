-- AlterTable
ALTER TABLE "Invitation" ALTER COLUMN "expireAt" SET DEFAULT now() + interval '2 weeks';

-- CreateTable
CREATE TABLE "UserDevices" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "deviceIp" TEXT NOT NULL,
    "deviceName" TEXT NOT NULL,

    CONSTRAINT "UserDevices_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "UserDevices" ADD CONSTRAINT "UserDevices_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
