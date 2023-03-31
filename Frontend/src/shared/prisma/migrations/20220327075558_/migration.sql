/*
  Warnings:

  - A unique constraint covering the columns `[wallet]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Validator" ALTER COLUMN "status" SET DEFAULT true;

-- AlterTable
ALTER TABLE "NodeOperator" ALTER COLUMN "status" SET DEFAULT true;

-- CreateIndex
CREATE UNIQUE INDEX "User_wallet_key" ON "User"("wallet");

-- CreateIndex
CREATE UNIQUE INDEX "NodeOperator_userId_key" ON "NodeOperator"("userId");

/*
  Warnings:

  - Made the column `userId` on table `NodeOperator` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "NodeOperator" DROP CONSTRAINT "NodeOperator_userId_fkey";

-- AlterTable
ALTER TABLE "NodeOperator" ALTER COLUMN "userId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "NodeOperator" ADD CONSTRAINT "NodeOperator_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;