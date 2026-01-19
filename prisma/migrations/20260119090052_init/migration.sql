/*
  Warnings:

  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "User";

-- DropEnum
DROP TYPE "Role";

-- CreateTable
CREATE TABLE "vloga_v_aplikaciji" (
    "id_vva" SERIAL NOT NULL,
    "ime" VARCHAR(200) NOT NULL,
    "opis" VARCHAR(200),

    CONSTRAINT "vloga_v_aplikaciji_pkey" PRIMARY KEY ("id_vva")
);

-- CreateTable
CREATE TABLE "vloga_na_intervenciji" (
    "id_vni" SERIAL NOT NULL,
    "ime_vloge" VARCHAR(200) NOT NULL,
    "opis_vloge" VARCHAR(200),

    CONSTRAINT "vloga_na_intervenciji_pkey" PRIMARY KEY ("id_vni")
);

-- CreateTable
CREATE TABLE "vloga_v_vozilu" (
    "id_vvv" SERIAL NOT NULL,
    "ime_vloge" VARCHAR(200) NOT NULL,
    "opis_vloge" VARCHAR(200),

    CONSTRAINT "vloga_v_vozilu_pkey" PRIMARY KEY ("id_vvv")
);

-- CreateTable
CREATE TABLE "status" (
    "id_s" SERIAL NOT NULL,
    "ime_statusa" VARCHAR(200) NOT NULL,
    "opis_statusa" VARCHAR(200),

    CONSTRAINT "status_pkey" PRIMARY KEY ("id_s")
);

-- CreateTable
CREATE TABLE "intervencija_tip" (
    "id_it" SERIAL NOT NULL,
    "tip" VARCHAR(200) NOT NULL,
    "opis" VARCHAR(300),

    CONSTRAINT "intervencija_tip_pkey" PRIMARY KEY ("id_it")
);

-- CreateTable
CREATE TABLE "tip_casa" (
    "id_tc" SERIAL NOT NULL,
    "ime_tipa" VARCHAR(200) NOT NULL,
    "cena_na_uro" DECIMAL(10,2) NOT NULL,

    CONSTRAINT "tip_casa_pkey" PRIMARY KEY ("id_tc")
);

-- CreateTable
CREATE TABLE "status_vozila" (
    "id_sv" SERIAL NOT NULL,
    "ime_statusa" VARCHAR(200) NOT NULL,
    "opis_statusa" VARCHAR(200),

    CONSTRAINT "status_vozila_pkey" PRIMARY KEY ("id_sv")
);

-- CreateTable
CREATE TABLE "tip_vozila" (
    "id_tv" SERIAL NOT NULL,
    "ime_tipa" VARCHAR(200) NOT NULL,
    "opis_tipa" VARCHAR(200),

    CONSTRAINT "tip_vozila_pkey" PRIMARY KEY ("id_tv")
);

-- CreateTable
CREATE TABLE "kategorija_oprema" (
    "id_ko" SERIAL NOT NULL,
    "ime_kategorije" VARCHAR(200) NOT NULL,
    "opis_kategorije" VARCHAR(200),

    CONSTRAINT "kategorija_oprema_pkey" PRIMARY KEY ("id_ko")
);

-- CreateTable
CREATE TABLE "stanje_opreme" (
    "id_so" SERIAL NOT NULL,
    "ime_stanja" VARCHAR(200) NOT NULL,
    "opis_stanja" VARCHAR(200),

    CONSTRAINT "stanje_opreme_pkey" PRIMARY KEY ("id_so")
);

-- CreateTable
CREATE TABLE "gasilni_dom" (
    "id_gd" SERIAL NOT NULL,
    "ime" VARCHAR(200) NOT NULL,
    "kreirano" TIMESTAMP(6),

    CONSTRAINT "gasilni_dom_pkey" PRIMARY KEY ("id_gd")
);

-- CreateTable
CREATE TABLE "uporabnik" (
    "id_u" SERIAL NOT NULL,
    "email" VARCHAR(200) NOT NULL,
    "ime" VARCHAR(200) NOT NULL,
    "geslo" VARCHAR(255),
    "kreiran" TIMESTAMP(6),
    "id_gd" INTEGER NOT NULL,
    "id_vva" INTEGER NOT NULL,

    CONSTRAINT "uporabnik_pkey" PRIMARY KEY ("id_u")
);

-- CreateTable
CREATE TABLE "intervencija" (
    "id_i" SERIAL NOT NULL,
    "zap_st" VARCHAR(50) NOT NULL,
    "naslov" VARCHAR(200) NOT NULL,
    "lokacija" VARCHAR(200),
    "zacetek" TIMESTAMP(6) NOT NULL,
    "konec" TIMESTAMP(6) NOT NULL,
    "ustvarjeno" TIMESTAMP(6),
    "posodobljeno" TIMESTAMP(6),
    "trajanje_ur" DECIMAL(6,2) NOT NULL,
    "id_it" INTEGER NOT NULL,
    "id_s" INTEGER NOT NULL,
    "id_tc" INTEGER NOT NULL,
    "id_gd" INTEGER NOT NULL,

    CONSTRAINT "intervencija_pkey" PRIMARY KEY ("id_i")
);

-- CreateTable
CREATE TABLE "vozilo" (
    "id_v" SERIAL NOT NULL,
    "ime" VARCHAR(200) NOT NULL,
    "registrska_st" VARCHAR(20),
    "opis" VARCHAR(200),
    "ustvarjeno" TIMESTAMP(6),
    "posodobljeno" TIMESTAMP(6),
    "id_sv" INTEGER NOT NULL,
    "id_tv" INTEGER NOT NULL,
    "id_gd" INTEGER NOT NULL,

    CONSTRAINT "vozilo_pkey" PRIMARY KEY ("id_v")
);

-- CreateTable
CREATE TABLE "oprema" (
    "id_o" SERIAL NOT NULL,
    "ime_opreme" VARCHAR(200) NOT NULL,
    "opis" VARCHAR(200),
    "ustvarjeno" TIMESTAMP(6),
    "id_ko" INTEGER NOT NULL,
    "id_so" INTEGER NOT NULL,
    "id_gd" INTEGER NOT NULL,

    CONSTRAINT "oprema_pkey" PRIMARY KEY ("id_o")
);

-- CreateTable
CREATE TABLE "intervencije_uporabnik" (
    "id" SERIAL NOT NULL,
    "id_i" INTEGER NOT NULL,
    "id_u" INTEGER NOT NULL,
    "id_vni" INTEGER NOT NULL,

    CONSTRAINT "intervencije_uporabnik_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "intervencije_vozila" (
    "id_iv" SERIAL NOT NULL,
    "id_v" INTEGER NOT NULL,
    "id_i" INTEGER NOT NULL,

    CONSTRAINT "intervencije_vozila_pkey" PRIMARY KEY ("id_iv")
);

-- CreateTable
CREATE TABLE "intervencije_vozila_uporabniki" (
    "id_ivu" SERIAL NOT NULL,
    "id_iv" INTEGER NOT NULL,
    "id_u" INTEGER NOT NULL,
    "id_vvv" INTEGER NOT NULL,

    CONSTRAINT "intervencije_vozila_uporabniki_pkey" PRIMARY KEY ("id_ivu")
);

-- CreateTable
CREATE TABLE "intervencija_oprema" (
    "id_io" SERIAL NOT NULL,
    "id_o" INTEGER NOT NULL,
    "id_i" INTEGER NOT NULL,
    "kolicina" INTEGER NOT NULL,
    "ure_uporabe" DECIMAL(6,2) NOT NULL,
    "strosek" DECIMAL(12,2) NOT NULL,

    CONSTRAINT "intervencija_oprema_pkey" PRIMARY KEY ("id_io")
);

-- CreateIndex
CREATE INDEX "uporabnik_id_gd_idx" ON "uporabnik"("id_gd");

-- CreateIndex
CREATE INDEX "uporabnik_id_vva_idx" ON "uporabnik"("id_vva");

-- CreateIndex
CREATE UNIQUE INDEX "uporabnik_email_key" ON "uporabnik"("email");

-- CreateIndex
CREATE UNIQUE INDEX "intervencija_zap_st_key" ON "intervencija"("zap_st");

-- CreateIndex
CREATE UNIQUE INDEX "vozilo_registrska_st_key" ON "vozilo"("registrska_st");

-- CreateIndex
CREATE UNIQUE INDEX "intervencije_uporabnik_id_i_id_u_key" ON "intervencije_uporabnik"("id_i", "id_u");

-- CreateIndex
CREATE UNIQUE INDEX "intervencije_vozila_uporabniki_id_iv_id_u_key" ON "intervencije_vozila_uporabniki"("id_iv", "id_u");

-- AddForeignKey
ALTER TABLE "uporabnik" ADD CONSTRAINT "uporabnik_id_gd_fkey" FOREIGN KEY ("id_gd") REFERENCES "gasilni_dom"("id_gd") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "uporabnik" ADD CONSTRAINT "uporabnik_id_vva_fkey" FOREIGN KEY ("id_vva") REFERENCES "vloga_v_aplikaciji"("id_vva") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "intervencija" ADD CONSTRAINT "intervencija_id_it_fkey" FOREIGN KEY ("id_it") REFERENCES "intervencija_tip"("id_it") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "intervencija" ADD CONSTRAINT "intervencija_id_s_fkey" FOREIGN KEY ("id_s") REFERENCES "status"("id_s") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "intervencija" ADD CONSTRAINT "intervencija_id_tc_fkey" FOREIGN KEY ("id_tc") REFERENCES "tip_casa"("id_tc") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "intervencija" ADD CONSTRAINT "intervencija_id_gd_fkey" FOREIGN KEY ("id_gd") REFERENCES "gasilni_dom"("id_gd") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vozilo" ADD CONSTRAINT "vozilo_id_sv_fkey" FOREIGN KEY ("id_sv") REFERENCES "status_vozila"("id_sv") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vozilo" ADD CONSTRAINT "vozilo_id_tv_fkey" FOREIGN KEY ("id_tv") REFERENCES "tip_vozila"("id_tv") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vozilo" ADD CONSTRAINT "vozilo_id_gd_fkey" FOREIGN KEY ("id_gd") REFERENCES "gasilni_dom"("id_gd") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "oprema" ADD CONSTRAINT "oprema_id_ko_fkey" FOREIGN KEY ("id_ko") REFERENCES "kategorija_oprema"("id_ko") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "oprema" ADD CONSTRAINT "oprema_id_so_fkey" FOREIGN KEY ("id_so") REFERENCES "stanje_opreme"("id_so") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "oprema" ADD CONSTRAINT "oprema_id_gd_fkey" FOREIGN KEY ("id_gd") REFERENCES "gasilni_dom"("id_gd") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "intervencije_uporabnik" ADD CONSTRAINT "intervencije_uporabnik_id_i_fkey" FOREIGN KEY ("id_i") REFERENCES "intervencija"("id_i") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "intervencije_uporabnik" ADD CONSTRAINT "intervencije_uporabnik_id_u_fkey" FOREIGN KEY ("id_u") REFERENCES "uporabnik"("id_u") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "intervencije_uporabnik" ADD CONSTRAINT "intervencije_uporabnik_id_vni_fkey" FOREIGN KEY ("id_vni") REFERENCES "vloga_na_intervenciji"("id_vni") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "intervencije_vozila" ADD CONSTRAINT "intervencije_vozila_id_v_fkey" FOREIGN KEY ("id_v") REFERENCES "vozilo"("id_v") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "intervencije_vozila" ADD CONSTRAINT "intervencije_vozila_id_i_fkey" FOREIGN KEY ("id_i") REFERENCES "intervencija"("id_i") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "intervencije_vozila_uporabniki" ADD CONSTRAINT "intervencije_vozila_uporabniki_id_iv_fkey" FOREIGN KEY ("id_iv") REFERENCES "intervencije_vozila"("id_iv") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "intervencije_vozila_uporabniki" ADD CONSTRAINT "intervencije_vozila_uporabniki_id_u_fkey" FOREIGN KEY ("id_u") REFERENCES "uporabnik"("id_u") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "intervencije_vozila_uporabniki" ADD CONSTRAINT "intervencije_vozila_uporabniki_id_vvv_fkey" FOREIGN KEY ("id_vvv") REFERENCES "vloga_v_vozilu"("id_vvv") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "intervencija_oprema" ADD CONSTRAINT "intervencija_oprema_id_o_fkey" FOREIGN KEY ("id_o") REFERENCES "oprema"("id_o") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "intervencija_oprema" ADD CONSTRAINT "intervencija_oprema_id_i_fkey" FOREIGN KEY ("id_i") REFERENCES "intervencija"("id_i") ON DELETE CASCADE ON UPDATE CASCADE;
