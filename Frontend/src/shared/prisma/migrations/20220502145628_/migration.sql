-- AlterTable
ALTER TABLE "Validator" ADD COLUMN     "activation_eligibility_epoch" INTEGER,
ADD COLUMN     "activation_epoch" INTEGER,
ADD COLUMN     "balance" VARCHAR(255),
ADD COLUMN     "effective_balance" VARCHAR(255),
ADD COLUMN     "exit_epoch" INTEGER,
ADD COLUMN     "index" INTEGER,
ADD COLUMN     "slashed" BOOLEAN,
ADD COLUMN     "state" VARCHAR(255),
ADD COLUMN     "withdrawable_epoch" INTEGER,
ADD COLUMN     "withdrawal_credentials" VARCHAR(255);
