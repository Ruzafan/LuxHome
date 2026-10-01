-- AlterTable
ALTER TABLE "Property" ADD COLUMN     "lowPriority" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "manualReserved" BOOLEAN NOT NULL DEFAULT false;
