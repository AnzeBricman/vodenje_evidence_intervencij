import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { prisma } from "@/lib/prisma";
import { ROLES } from "@/lib/roles";

function canManageVehicles(role?: string) {
  return role === ROLES.ADMIN || role === ROLES.POVELJNIK;
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getServerSession(authOptions);
    const user = session?.user as any;

    if (!user || !canManageVehicles(user.role)) {
      return NextResponse.json({ error: "Ni dovoljenja" }, { status: 403 });
    }

    const { id } = await params;
    const vehicleId = Number(id);
    const body = await req.json();
    const statusId = Number(body.statusId);

    if (!Number.isInteger(vehicleId) || vehicleId <= 0 || !Number.isInteger(statusId)) {
      return NextResponse.json({ error: "Neveljavni podatki." }, { status: 400 });
    }

    const [vehicle, status] = await Promise.all([
      prisma.vozilo.findUnique({
        where: { id_v: vehicleId },
        select: { id_v: true, id_gd: true },
      }),
      prisma.status_vozila.findUnique({
        where: { id_sv: statusId },
        select: { id_sv: true },
      }),
    ]);

    if (!vehicle || vehicle.id_gd !== user.id_gd) {
      return NextResponse.json({ error: "Vozilo ne obstaja v tvojem društvu." }, { status: 404 });
    }

    if (!status) {
      return NextResponse.json({ error: "Izbran status ne obstaja." }, { status: 400 });
    }

    await prisma.vozilo.update({
      where: { id_v: vehicleId },
      data: { id_sv: statusId },
    });

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err?.message ?? String(err) }, { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getServerSession(authOptions);
    const user = session?.user as any;

    if (!user || !canManageVehicles(user.role)) {
      return NextResponse.json({ error: "Ni dovoljenja" }, { status: 403 });
    }

    const { id } = await params;
    const vehicleId = Number(id);

    if (!Number.isInteger(vehicleId) || vehicleId <= 0) {
      return NextResponse.json({ error: "Neveljavno vozilo." }, { status: 400 });
    }

    const vehicle = await prisma.vozilo.findUnique({
      where: { id_v: vehicleId },
      select: { id_v: true, id_gd: true },
    });

    if (!vehicle || vehicle.id_gd !== user.id_gd) {
      return NextResponse.json({ error: "Vozilo ne obstaja v tvojem društvu." }, { status: 404 });
    }

    const linkedInterventionVehicles = await prisma.intervencije_vozila.findMany({
      where: { id_v: vehicleId },
      select: { id_iv: true },
    });

    const linkedIds = linkedInterventionVehicles.map((item) => item.id_iv);

    await prisma.$transaction(async (tx) => {
      if (linkedIds.length > 0) {
        await tx.intervencije_vozila_uporabniki.deleteMany({
          where: { id_iv: { in: linkedIds } },
        });

        await tx.intervencije_vozila.deleteMany({
          where: { id_v: vehicleId },
        });
      }

      await tx.vozilo.delete({
        where: { id_v: vehicleId },
      });
    });

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json(
      { error: err?.message ?? "Brisanje vozila ni uspelo." },
      { status: 500 },
    );
  }
}
