import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { prisma } from "@/lib/prisma";
import { ROLES } from "@/lib/roles";

function isSuperAdmin(role?: string) {
  return role === ROLES.SUPER_ADMIN;
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  const user = session?.user as any;

  if (!user || !isSuperAdmin(user.role)) {
    return NextResponse.json({ error: "Ni dovoljenja." }, { status: 403 });
  }

  try {
    const body = await req.json();
    const name = String(body.name ?? "").trim();

    if (!name) {
      return NextResponse.json({ error: "Ime društva je obvezno." }, { status: 400 });
    }

    const existing = await prisma.gasilni_dom.findFirst({
      where: { ime: name },
      select: { id_gd: true },
    });

    if (existing) {
      return NextResponse.json({ error: "To društvo že obstaja." }, { status: 409 });
    }

    const society = await prisma.gasilni_dom.create({
      data: {
        ime: name,
        kreirano: new Date(),
      },
      select: {
        id_gd: true,
        ime: true,
      },
    });

    return NextResponse.json({ ok: true, society });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message ?? "Dodajanje društva ni uspelo." },
      { status: 500 },
    );
  }
}
