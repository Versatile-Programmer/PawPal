-- AlterTable
ALTER TABLE "pets" ADD COLUMN     "is_potty_trained" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "is_vaccinated" BOOLEAN NOT NULL DEFAULT false;
