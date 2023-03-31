/*
  Warnings:

  - Made the column `validatorId` on table `DepositData` required. This step will fail if there are existing NULL values in that column.
  - Made the column `nodeOperatorId` on table `Validator` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "DepositData" DROP CONSTRAINT "DepositData_validatorId_fkey";

-- DropForeignKey
ALTER TABLE "Validator" DROP CONSTRAINT "Validator_nodeOperatorId_fkey";

-- AlterTable
ALTER TABLE "DepositData" ALTER COLUMN "validatorId" SET NOT NULL;

-- AlterTable
ALTER TABLE "Validator" ALTER COLUMN "nodeOperatorId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "Validator" ADD CONSTRAINT "Validator_nodeOperatorId_fkey" FOREIGN KEY ("nodeOperatorId") REFERENCES "NodeOperator"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DepositData" ADD CONSTRAINT "DepositData_validatorId_fkey" FOREIGN KEY ("validatorId") REFERENCES "Validator"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
