import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { prisma } from "@/lib/prisma";
import { ROLES } from "@/lib/roles";

function canManageVehicles(role?: string) {
  return role === ROLES.ADMIN || role === ROLES.POVELJNIK;
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const user = session?.user as any;

    if (!user || !canManageVehicles(user.role)) {
      return NextResponse.json({ error: "Ni dovoljenja" }, { status: 403 });
    }

    const body = await req.json();
    const ime = (body.name || "").toString().trim();
    const registrska_st = (body.registration || "").toString().trim() || null;
    const cenaNaUro = Number(body.hourlyRate);
    const opis = (body.description || "").toString().trim() || null;
    const id_tv = Number(body.typeId);
    const id_sv = Number(body.statusId);

    if (
      !ime ||
      !Number.isFinite(cenaNaUro) ||
      cenaNaUro < 0 ||
      !Number.isInteger(id_tv) ||
      !Number.isInteger(id_sv)
    ) {
      return NextResponse.json({ error: "Manjkajoči ali neveljavni podatki." }, { status: 400 });
    }

    const [tip, status] = await Promise.all([
      prisma.tip_vozila.findUnique({ where: { id_tv } }),
      prisma.status_vozila.findUnique({ where: { id_sv } }),
    ]);

    if (!tip || !status) {
      return NextResponse.json({ error: "Izbran tip ali status ne obstaja." }, { status: 400 });
    }

    const created = await prisma.vozilo.create({
      data: {
        ime,
        registrska_st,
        cena_na_uro: cenaNaUro,
        opis,
        ustvarjeno: new Date(),
        id_tv,
        id_sv,
        id_gd: user.id_gd,
      },
    });

    return NextResponse.json({ ok: true, vehicle: { id: created.id_v, ime: created.ime } });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err?.message ?? String(err) }, { status: 500 });
  }
}
