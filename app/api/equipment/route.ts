import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { prisma } from "@/lib/prisma";
import { ROLES } from "@/lib/roles";

function canManageEquipment(role?: string) {
  return role === ROLES.ADMIN || role === ROLES.POVELJNIK;
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const user = session?.user as any;

    if (!user || !canManageEquipment(user.role)) {
      return NextResponse.json({ error: "Ni dovoljenja" }, { status: 403 });
    }

    const body = await req.json();
    const ime_opreme = (body.name || "").toString().trim();
    const opis = (body.description || "").toString().trim() || null;
    const serijska_st = (body.serialNumber || "").toString().trim() || null;
    const cenaNaUro = Number(body.hourlyRate);
    const id_ko = Number(body.categoryId);
    const id_so = Number(body.stateId);

    if (
      !ime_opreme ||
      !Number.isFinite(cenaNaUro) ||
      cenaNaUro < 0 ||
      !Number.isInteger(id_ko) ||
      !Number.isInteger(id_so)
    ) {
      return NextResponse.json({ error: "Manjkajoči ali neveljavni podatki." }, { status: 400 });
    }

    const [category, state] = await Promise.all([
      prisma.kategorija_oprema.findUnique({ where: { id_ko } }),
      prisma.stanje_opreme.findUnique({ where: { id_so } }),
    ]);

    if (!category || !state) {
      return NextResponse.json({ error: "Izbrana kategorija ali stanje ne obstaja." }, { status: 400 });
    }

    const created = await prisma.oprema.create({
      data: {
        ime_opreme,
        opis,
        serijska_st,
        cena_na_uro: cenaNaUro,
        ustvarjeno: new Date(),
        id_ko,
        id_so,
        id_gd: user.id_gd,
      },
    });

    return NextResponse.json({ ok: true, equipment: { id: created.id_o, name: created.ime_opreme } });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err?.message ?? String(err) }, { status: 500 });
  }
}
