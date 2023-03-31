/*
  Warnings:

  - You are about to drop the `Referral` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Referral" DROP CONSTRAINT "Referral_userId_fkey";

-- DropTable
DROP TABLE "Referral";

-- CreateTable
CREATE TABLE "Faucet" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "wallet" VARCHAR(255) NOT NULL,
    "userId" INTEGER NOT NULL,
    "discordId" VARCHAR(255) NOT NULL,
    "txHash" VARCHAR(255),

    CONSTRAINT "Faucet_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Faucet" ADD CONSTRAINT "Faucet_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
