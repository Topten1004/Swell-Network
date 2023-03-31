/*
  Warnings:

  - Changed the type of `cpu` on the `NodeOperator` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `network` on the `NodeOperator` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `ram` on the `NodeOperator` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `storage` on the `NodeOperator` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "NodeOperator" DROP COLUMN "cpu",
ADD COLUMN     "cpu" INTEGER NOT NULL,
DROP COLUMN "network",
ADD COLUMN     "network" INTEGER NOT NULL,
DROP COLUMN "ram",
ADD COLUMN     "ram" INTEGER NOT NULL,
DROP COLUMN "storage",
ADD COLUMN     "storage" INTEGER NOT NULL;
