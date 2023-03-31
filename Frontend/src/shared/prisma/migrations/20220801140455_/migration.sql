/*
  Warnings:

  - You are about to alter the column `amount` on the `DepositData` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(255)`.
  - You are about to alter the column `wallet` on the `Referral` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(255)`.
  - You are about to alter the column `discordId` on the `Referral` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(255)`.
  - You are about to alter the column `txHash` on the `Referral` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(255)`.
  - You are about to alter the column `wallet` on the `User` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(255)`.
  - You are about to alter the column `referralCode` on the `User` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(255)`.
  - You are about to alter the column `activation_eligibility_epoch` on the `Validator` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(255)`.
  - You are about to alter the column `activation_epoch` on the `Validator` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(255)`.
  - You are about to alter the column `exit_epoch` on the `Validator` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(255)`.
  - You are about to alter the column `withdrawable_epoch` on the `Validator` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(255)`.
  - You are about to alter the column `depositBalance` on the `Validator` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(255)`.

*/
-- AlterTable
ALTER TABLE "DepositData" ALTER COLUMN "amount" SET DATA TYPE VARCHAR(255);

-- AlterTable
ALTER TABLE "Referral" ALTER COLUMN "wallet" SET DATA TYPE VARCHAR(255),
ALTER COLUMN "discordId" SET DATA TYPE VARCHAR(255),
ALTER COLUMN "txHash" SET DATA TYPE VARCHAR(255);

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "wallet" SET DATA TYPE VARCHAR(255),
ALTER COLUMN "referralCode" SET DATA TYPE VARCHAR(255);

-- AlterTable
ALTER TABLE "Validator" ALTER COLUMN "activation_eligibility_epoch" SET DATA TYPE VARCHAR(255),
ALTER COLUMN "activation_epoch" SET DATA TYPE VARCHAR(255),
ALTER COLUMN "exit_epoch" SET DATA TYPE VARCHAR(255),
ALTER COLUMN "withdrawable_epoch" SET DATA TYPE VARCHAR(255),
ALTER COLUMN "depositBalance" SET DATA TYPE VARCHAR(255);
