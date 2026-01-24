-- AlterTable
ALTER TABLE "intervencija_oprema" ADD COLUMN     "opomba" VARCHAR(500),
ADD COLUMN     "unicen" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "kolicina" SET DEFAULT 1,
ALTER COLUMN "ure_uporabe" SET DEFAULT 0,
ALTER COLUMN "strosek" SET DEFAULT 0;

-- AlterTable
ALTER TABLE "oprema" ADD COLUMN     "datum_nakupa" DATE,
ADD COLUMN     "id_v_dodeljeno" INTEGER,
ADD COLUMN     "leto_nabave" INTEGER,
ADD COLUMN     "public_uid" VARCHAR(64),
ADD COLUMN     "serijska_st" VARCHAR(80),
ADD COLUMN     "servis_interval_dni" INTEGER,
ADD COLUMN     "servis_interval_ur" DECIMAL(10,2);

-- CreateTable
CREATE TABLE "dokument_tip" (
    "id_dt" SERIAL NOT NULL,
    "naziv" VARCHAR(200) NOT NULL,
    "opis" VARCHAR(300),

    CONSTRAINT "dokument_tip_pkey" PRIMARY KEY ("id_dt")
);

-- CreateTable
CREATE TABLE "servis_status" (
    "id_ss" SERIAL NOT NULL,
    "naziv" VARCHAR(100) NOT NULL,
    "opis" VARCHAR(200),

    CONSTRAINT "servis_status_pkey" PRIMARY KEY ("id_ss")
);

-- CreateTable
CREATE TABLE "incident_status" (
    "id_is" SERIAL NOT NULL,
    "naziv" VARCHAR(100) NOT NULL,
    "opis" VARCHAR(200),

    CONSTRAINT "incident_status_pkey" PRIMARY KEY ("id_is")
);

-- CreateTable
CREATE TABLE "oprema_servis" (
    "id_os" SERIAL NOT NULL,
    "id_o" INTEGER NOT NULL,
    "datum" DATE NOT NULL,
    "id_ss" INTEGER NOT NULL,
    "opis" VARCHAR(400),
    "izvajalec" VARCHAR(200),
    "strosek" DECIMAL(12,2),
    "ure_ob_servisu" DECIMAL(10,2),
    "ustvaril_id_u" INTEGER,

    CONSTRAINT "oprema_servis_pkey" PRIMARY KEY ("id_os")
);

-- CreateTable
CREATE TABLE "oprema_dokument" (
    "id_od" SERIAL NOT NULL,
    "id_o" INTEGER NOT NULL,
    "id_dt" INTEGER NOT NULL,
    "naziv" VARCHAR(200) NOT NULL,
    "mime" VARCHAR(100),
    "size_bytes" INTEGER,
    "datum" DATE,
    "storage_key" VARCHAR(500) NOT NULL,
    "public_url" VARCHAR(800),
    "uploaded_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "uploaded_by" INTEGER,

    CONSTRAINT "oprema_dokument_pkey" PRIMARY KEY ("id_od")
);

-- CreateTable
CREATE TABLE "oprema_incident" (
    "id_oi" SERIAL NOT NULL,
    "id_o" INTEGER NOT NULL,
    "naslov" VARCHAR(200) NOT NULL,
    "opis" VARCHAR(800),
    "datum" DATE NOT NULL,
    "id_is" INTEGER NOT NULL,
    "prijavil_id_u" INTEGER,
    "resitev" VARCHAR(800),
    "zakljuceno_at" TIMESTAMP(6),
    "id_i" INTEGER,

    CONSTRAINT "oprema_incident_pkey" PRIMARY KEY ("id_oi")
);

-- CreateIndex
CREATE INDEX "oprema_servis_id_o_datum_idx" ON "oprema_servis"("id_o", "datum");

-- CreateIndex
CREATE INDEX "oprema_dokument_id_o_uploaded_at_idx" ON "oprema_dokument"("id_o", "uploaded_at");

-- CreateIndex
CREATE INDEX "oprema_incident_id_o_datum_idx" ON "oprema_incident"("id_o", "datum");

-- CreateIndex
CREATE INDEX "oprema_incident_id_i_idx" ON "oprema_incident"("id_i");

-- CreateIndex
CREATE INDEX "intervencija_id_gd_idx" ON "intervencija"("id_gd");

-- CreateIndex
CREATE INDEX "intervencija_oprema_id_o_idx" ON "intervencija_oprema"("id_o");

-- CreateIndex
CREATE INDEX "intervencija_oprema_id_i_idx" ON "intervencija_oprema"("id_i");

-- CreateIndex
CREATE INDEX "oprema_id_gd_idx" ON "oprema"("id_gd");

-- CreateIndex
CREATE INDEX "oprema_id_v_dodeljeno_idx" ON "oprema"("id_v_dodeljeno");

-- CreateIndex
CREATE INDEX "vozilo_id_gd_idx" ON "vozilo"("id_gd");

-- AddForeignKey
ALTER TABLE "oprema" ADD CONSTRAINT "oprema_id_v_dodeljeno_fkey" FOREIGN KEY ("id_v_dodeljeno") REFERENCES "vozilo"("id_v") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "oprema_servis" ADD CONSTRAINT "oprema_servis_id_o_fkey" FOREIGN KEY ("id_o") REFERENCES "oprema"("id_o") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "oprema_servis" ADD CONSTRAINT "oprema_servis_id_ss_fkey" FOREIGN KEY ("id_ss") REFERENCES "servis_status"("id_ss") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "oprema_servis" ADD CONSTRAINT "oprema_servis_ustvaril_id_u_fkey" FOREIGN KEY ("ustvaril_id_u") REFERENCES "uporabnik"("id_u") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "oprema_dokument" ADD CONSTRAINT "oprema_dokument_id_o_fkey" FOREIGN KEY ("id_o") REFERENCES "oprema"("id_o") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "oprema_dokument" ADD CONSTRAINT "oprema_dokument_id_dt_fkey" FOREIGN KEY ("id_dt") REFERENCES "dokument_tip"("id_dt") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "oprema_dokument" ADD CONSTRAINT "oprema_dokument_uploaded_by_fkey" FOREIGN KEY ("uploaded_by") REFERENCES "uporabnik"("id_u") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "oprema_incident" ADD CONSTRAINT "oprema_incident_id_o_fkey" FOREIGN KEY ("id_o") REFERENCES "oprema"("id_o") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "oprema_incident" ADD CONSTRAINT "oprema_incident_id_is_fkey" FOREIGN KEY ("id_is") REFERENCES "incident_status"("id_is") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "oprema_incident" ADD CONSTRAINT "oprema_incident_prijavil_id_u_fkey" FOREIGN KEY ("prijavil_id_u") REFERENCES "uporabnik"("id_u") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "oprema_incident" ADD CONSTRAINT "oprema_incident_id_i_fkey" FOREIGN KEY ("id_i") REFERENCES "intervencija"("id_i") ON DELETE SET NULL ON UPDATE CASCADE;
