import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { prisma } from "@/lib/prisma";
import { ROLES } from "@/lib/roles";

function canManageInterventions(role?: string) {
  return role === ROLES.ADMIN;
}

async function getScopedIntervention(interventionId: number, gdId: number) {
  const intervention = await prisma.intervencija.findUnique({
    where: { id_i: interventionId },
    select: { id_i: true, id_gd: true },
  });

  if (!intervention || intervention.id_gd !== gdId) {
    return null;
  }

  return intervention;
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getServerSession(authOptions);
    const user = session?.user as { role?: string; id_gd?: number } | undefined;

    if (!user || !canManageInterventions(user.role)) {
      return NextResponse.json({ error: "Ni dovoljenja." }, { status: 403 });
    }

    const { id } = await params;
    const interventionId = Number(id);
    const body = await req.json();
    const statusId = Number(body.statusId);

    if (!Number.isInteger(interventionId) || interventionId <= 0 || !Number.isInteger(statusId)) {
      return NextResponse.json({ error: "Neveljavni podatki." }, { status: 400 });
    }

    const [intervention, status] = await Promise.all([
      getScopedIntervention(interventionId, user.id_gd ?? 0),
      prisma.status.findUnique({
        where: { id_s: statusId },
        select: { id_s: true },
      }),
    ]);

    if (!intervention) {
      return NextResponse.json(
        { error: "Intervencija ne obstaja v tvojem društvu." },
        { status: 404 },
      );
    }

    if (!status) {
      return NextResponse.json({ error: "Izbran status ne obstaja." }, { status: 400 });
    }

    await prisma.intervencija.update({
      where: { id_i: interventionId },
      data: { id_s: statusId },
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
    const user = session?.user as { role?: string; id_gd?: number } | undefined;

    if (!user || !canManageInterventions(user.role)) {
      return NextResponse.json({ error: "Ni dovoljenja." }, { status: 403 });
    }

    const { id } = await params;
    const interventionId = Number(id);

    if (!Number.isInteger(interventionId) || interventionId <= 0) {
      return NextResponse.json({ error: "Neveljavna intervencija." }, { status: 400 });
    }

    const intervention = await getScopedIntervention(interventionId, user.id_gd ?? 0);

    if (!intervention) {
      return NextResponse.json(
        { error: "Intervencija ne obstaja v tvojem društvu." },
        { status: 404 },
      );
    }

    await prisma.intervencija.delete({
      where: { id_i: interventionId },
    });

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json(
      { error: err?.message ?? "Brisanje intervencije ni uspelo." },
      { status: 500 },
    );
  }
}
