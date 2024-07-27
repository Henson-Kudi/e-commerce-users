-- CreateTable
CREATE TABLE "Invitation" (
    "id" TEXT NOT NULL,
    "invitorId" TEXT NOT NULL,
    "invitee" TEXT NOT NULL,
    "roles" TEXT[],

    CONSTRAINT "Invitation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Invitation_invitee_key" ON "Invitation"("invitee");

-- AddForeignKey
ALTER TABLE "Invitation" ADD CONSTRAINT "Invitation_invitorId_fkey" FOREIGN KEY ("invitorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
