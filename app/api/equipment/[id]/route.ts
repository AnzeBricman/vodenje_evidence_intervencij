import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { prisma } from "@/lib/prisma";
import { ROLES } from "@/lib/roles";

function canManageEquipment(role?: string) {
  return role === ROLES.ADMIN || role === ROLES.POVELJNIK;
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getServerSession(authOptions);
    const user = session?.user as any;

    if (!user || !canManageEquipment(user.role)) {
      return NextResponse.json({ error: "Ni dovoljenja" }, { status: 403 });
    }

    const { id } = await params;
    const equipmentId = Number(id);

    if (!Number.isInteger(equipmentId) || equipmentId <= 0) {
      return NextResponse.json({ error: "Neveljavna oprema." }, { status: 400 });
    }

    const equipment = await prisma.oprema.findUnique({
      where: { id_o: equipmentId },
      select: { id_o: true, id_gd: true },
    });

    if (!equipment || equipment.id_gd !== user.id_gd) {
      return NextResponse.json({ error: "Oprema ne obstaja v tvojem društvu." }, { status: 404 });
    }

    await prisma.$transaction([
      prisma.intervencija_oprema.deleteMany({ where: { id_o: equipmentId } }),
      prisma.oprema.delete({ where: { id_o: equipmentId } }),
    ]);

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json(
      { error: err?.message ?? "Brisanje opreme ni uspelo." },
      { status: 500 },
    );
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getServerSession(authOptions);
    const user = session?.user as any;

    if (!user || !canManageEquipment(user.role)) {
      return NextResponse.json({ error: "Ni dovoljenja" }, { status: 403 });
    }

    const { id } = await params;
    const equipmentId = Number(id);
    const body = await req.json();
    const stateId = Number(body.stateId);

    if (!Number.isInteger(equipmentId) || equipmentId <= 0 || !Number.isInteger(stateId)) {
      return NextResponse.json({ error: "Neveljavni podatki." }, { status: 400 });
    }

    const [equipment, state] = await Promise.all([
      prisma.oprema.findUnique({
        where: { id_o: equipmentId },
        select: { id_o: true, id_gd: true },
      }),
      prisma.stanje_opreme.findUnique({
        where: { id_so: stateId },
        select: { id_so: true },
      }),
    ]);

    if (!equipment || equipment.id_gd !== user.id_gd) {
      return NextResponse.json({ error: "Oprema ne obstaja v tvojem društvu." }, { status: 404 });
    }

    if (!state) {
      return NextResponse.json({ error: "Izbrano stanje ne obstaja." }, { status: 400 });
    }

    await prisma.oprema.update({
      where: { id_o: equipmentId },
      data: { id_so: stateId },
    });

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err?.message ?? String(err) }, { status: 500 });
  }
}
