/*
  Warnings:

  - A unique constraint covering the columns `[validatorId,amount]` on the table `DepositData` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "DepositData_validatorId_amount_key" ON "DepositData"("validatorId", "amount");
