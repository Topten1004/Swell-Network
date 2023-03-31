/*
  Warnings:

  - You are about to drop the column `title` on the `NodeOperator` table. All the data in the column will be lost.
  - You are about to drop the column `email` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `User` table. All the data in the column will be lost.
  - Added the required column `cpu` to the `NodeOperator` table without a default value. This is not possible if the table is not empty.
  - Added the required column `description` to the `NodeOperator` table without a default value. This is not possible if the table is not empty.
  - Added the required column `location` to the `NodeOperator` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `NodeOperator` table without a default value. This is not possible if the table is not empty.
  - Added the required column `network` to the `NodeOperator` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nodes` to the `NodeOperator` table without a default value. This is not possible if the table is not empty.
  - Added the required column `ram` to the `NodeOperator` table without a default value. This is not possible if the table is not empty.
  - Added the required column `storage` to the `NodeOperator` table without a default value. This is not possible if the table is not empty.
  - Added the required column `yearsOfExperience` to the `NodeOperator` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Category" AS ENUM ('INDIVIDUAL', 'INSTITUTIONAL');

-- DropIndex
DROP INDEX "User_email_key";

-- AlterTable
ALTER TABLE "NodeOperator" DROP COLUMN "title",
ADD COLUMN     "category" "Category" NOT NULL DEFAULT E'INDIVIDUAL',
ADD COLUMN     "cpu" VARCHAR(255) NOT NULL,
ADD COLUMN     "description" TEXT NOT NULL,
ADD COLUMN     "email" VARCHAR(255),
ADD COLUMN     "location" VARCHAR(255) NOT NULL,
ADD COLUMN     "name" VARCHAR(255) NOT NULL,
ADD COLUMN     "network" VARCHAR(255) NOT NULL,
ADD COLUMN     "nodes" INTEGER NOT NULL,
ADD COLUMN     "ram" VARCHAR(255) NOT NULL,
ADD COLUMN     "social" VARCHAR(255),
ADD COLUMN     "storage" VARCHAR(255) NOT NULL,
ADD COLUMN     "website" VARCHAR(255),
ADD COLUMN     "yearsOfExperience" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "email",
DROP COLUMN "name",
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;
