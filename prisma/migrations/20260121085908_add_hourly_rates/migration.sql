-- AlterTable
ALTER TABLE "oprema" ADD COLUMN     "cena_na_uro" DECIMAL(10,2) NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "vozilo" ADD COLUMN     "cena_na_uro" DECIMAL(10,2) NOT NULL DEFAULT 0;
