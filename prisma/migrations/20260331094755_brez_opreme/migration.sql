/*
  Warnings:

  - You are about to drop the column `posodobljeno` on the `intervencija` table. All the data in the column will be lost.
  - You are about to drop the column `ustvarjeno` on the `intervencija` table. All the data in the column will be lost.
  - You are about to drop the column `opomba` on the `intervencija_oprema` table. All the data in the column will be lost.
  - You are about to drop the column `strosek` on the `intervencija_oprema` table. All the data in the column will be lost.
  - You are about to drop the column `unicen` on the `intervencija_oprema` table. All the data in the column will be lost.
  - You are about to drop the column `cena_na_uro` on the `oprema` table. All the data in the column will be lost.
  - You are about to drop the column `datum_nakupa` on the `oprema` table. All the data in the column will be lost.
  - You are about to drop the column `id_v_dodeljeno` on the `oprema` table. All the data in the column will be lost.
  - You are about to drop the column `leto_nabave` on the `oprema` table. All the data in the column will be lost.
  - You are about to drop the column `opis` on the `oprema` table. All the data in the column will be lost.
  - You are about to drop the column `public_uid` on the `oprema` table. All the data in the column will be lost.
  - You are about to drop the column `serijska_st` on the `oprema` table. All the data in the column will be lost.
  - You are about to drop the column `servis_interval_dni` on the `oprema` table. All the data in the column will be lost.
  - You are about to drop the column `servis_interval_ur` on the `oprema` table. All the data in the column will be lost.
  - You are about to drop the column `ustvarjeno` on the `oprema` table. All the data in the column will be lost.
  - You are about to drop the column `kreiran` on the `uporabnik` table. All the data in the column will be lost.
  - You are about to drop the column `cena_na_uro` on the `vozilo` table. All the data in the column will be lost.
  - You are about to drop the column `opis` on the `vozilo` table. All the data in the column will be lost.
  - You are about to drop the column `posodobljeno` on the `vozilo` table. All the data in the column will be lost.
  - You are about to drop the column `ustvarjeno` on the `vozilo` table. All the data in the column will be lost.
  - You are about to drop the `dokument_tip` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `incident_status` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `oprema_dokument` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `oprema_incident` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `oprema_servis` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `servis_status` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "oprema" DROP CONSTRAINT "oprema_id_v_dodeljeno_fkey";

-- DropForeignKey
ALTER TABLE "oprema_dokument" DROP CONSTRAINT "oprema_dokument_id_dt_fkey";

-- DropForeignKey
ALTER TABLE "oprema_dokument" DROP CONSTRAINT "oprema_dokument_id_o_fkey";

-- DropForeignKey
ALTER TABLE "oprema_dokument" DROP CONSTRAINT "oprema_dokument_uploaded_by_fkey";

-- DropForeignKey
ALTER TABLE "oprema_incident" DROP CONSTRAINT "oprema_incident_id_i_fkey";

-- DropForeignKey
ALTER TABLE "oprema_incident" DROP CONSTRAINT "oprema_incident_id_is_fkey";

-- DropForeignKey
ALTER TABLE "oprema_incident" DROP CONSTRAINT "oprema_incident_id_o_fkey";

-- DropForeignKey
ALTER TABLE "oprema_incident" DROP CONSTRAINT "oprema_incident_prijavil_id_u_fkey";

-- DropForeignKey
ALTER TABLE "oprema_servis" DROP CONSTRAINT "oprema_servis_id_o_fkey";

-- DropForeignKey
ALTER TABLE "oprema_servis" DROP CONSTRAINT "oprema_servis_id_ss_fkey";

-- DropForeignKey
ALTER TABLE "oprema_servis" DROP CONSTRAINT "oprema_servis_ustvaril_id_u_fkey";

-- DropIndex
DROP INDEX "intervencija_id_gd_idx";

-- DropIndex
DROP INDEX "intervencija_oprema_id_i_idx";

-- DropIndex
DROP INDEX "intervencija_oprema_id_o_idx";

-- DropIndex
DROP INDEX "oprema_id_gd_idx";

-- DropIndex
DROP INDEX "oprema_id_v_dodeljeno_idx";

-- DropIndex
DROP INDEX "uporabnik_id_gd_idx";

-- DropIndex
DROP INDEX "uporabnik_id_vva_idx";

-- DropIndex
DROP INDEX "vozilo_id_gd_idx";

-- DropIndex
DROP INDEX "vozilo_registrska_st_key";

-- AlterTable
ALTER TABLE "intervencija" DROP COLUMN "posodobljeno",
DROP COLUMN "ustvarjeno",
ALTER COLUMN "zacetek" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "konec" SET DATA TYPE TIMESTAMP(3);

-- AlterTable
ALTER TABLE "intervencija_oprema" DROP COLUMN "opomba",
DROP COLUMN "strosek",
DROP COLUMN "unicen",
ALTER COLUMN "kolicina" DROP DEFAULT,
ALTER COLUMN "ure_uporabe" DROP DEFAULT;

-- AlterTable
ALTER TABLE "oprema" DROP COLUMN "cena_na_uro",
DROP COLUMN "datum_nakupa",
DROP COLUMN "id_v_dodeljeno",
DROP COLUMN "leto_nabave",
DROP COLUMN "opis",
DROP COLUMN "public_uid",
DROP COLUMN "serijska_st",
DROP COLUMN "servis_interval_dni",
DROP COLUMN "servis_interval_ur",
DROP COLUMN "ustvarjeno";

-- AlterTable
ALTER TABLE "uporabnik" DROP COLUMN "kreiran";

-- AlterTable
ALTER TABLE "vozilo" DROP COLUMN "cena_na_uro",
DROP COLUMN "opis",
DROP COLUMN "posodobljeno",
DROP COLUMN "ustvarjeno";

-- DropTable
DROP TABLE "dokument_tip";

-- DropTable
DROP TABLE "incident_status";

-- DropTable
DROP TABLE "oprema_dokument";

-- DropTable
DROP TABLE "oprema_incident";

-- DropTable
DROP TABLE "oprema_servis";

-- DropTable
DROP TABLE "servis_status";
