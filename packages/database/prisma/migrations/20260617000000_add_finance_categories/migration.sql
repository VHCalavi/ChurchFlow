-- CreateEnum
CREATE TYPE "ExpenseFamily" AS ENUM ('FONCTIONNEMENT', 'INVESTISSEMENT', 'EXCEPTIONNEL');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('ESPECES', 'MOBILE_MONEY', 'CHEQUE', 'VIREMENT');

-- CreateTable
CREATE TABLE "finance_categories" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "flowType" "TransactionType" NOT NULL,
    "family" "ExpenseFamily",
    "color" TEXT,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "churchId" TEXT NOT NULL,

    CONSTRAINT "finance_categories_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "finance_categories_churchId_name_flowType_key" ON "finance_categories"("churchId", "name", "flowType");

-- AddForeignKey
ALTER TABLE "finance_categories" ADD CONSTRAINT "finance_categories_churchId_fkey" FOREIGN KEY ("churchId") REFERENCES "churches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AlterTable: Transaction — drop old category column, add new columns
ALTER TABLE "transactions" RENAME COLUMN "title" TO "label";
ALTER TABLE "transactions" DROP COLUMN IF EXISTS "category";
ALTER TABLE "transactions" ADD COLUMN "expenseFamily" "ExpenseFamily";
ALTER TABLE "transactions" ADD COLUMN "paymentMethod" "PaymentMethod" NOT NULL DEFAULT 'ESPECES';
ALTER TABLE "transactions" ADD COLUMN "donorName" TEXT;
ALTER TABLE "transactions" ADD COLUMN "categoryId" TEXT;
ALTER TABLE "transactions" DROP COLUMN IF EXISTS "description";

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "finance_categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Drop old enum (only if no other table uses it)
DROP TYPE IF EXISTS "TransactionCategory";
