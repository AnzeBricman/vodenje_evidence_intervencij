import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { prisma } from "@/lib/prisma";
import { ROLE_LABEL, ROLES } from "@/lib/roles";

function canManageUsers(role?: string) {
  return role === ROLES.ADMIN;
}

const ALLOWED_ROLES = new Set([ROLES.ADMIN, ROLES.UPORABNIK]);

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const user = session?.user as any;
    if (!user || !canManageUsers(user.role)) {
      return NextResponse.json({ error: "Ni dovoljenja." }, { status: 403 });
    }

    const body = await req.json();
    const email = String(body.email ?? "").trim().toLowerCase();
    const ime = String(body.name ?? "").trim();
    const password = String(body.password ?? "");
    const role = String(body.role ?? ROLES.UPORABNIK);

    if (!email || !ime || !password) {
      return NextResponse.json({ error: "Manjkajoči podatki." }, { status: 400 });
    }

    if (!ALLOWED_ROLES.has(role as any)) {
      return NextResponse.json({ error: "Neveljavna vloga." }, { status: 400 });
    }

    const roleLabel = ROLE_LABEL[role as keyof typeof ROLE_LABEL] ?? ROLE_LABEL[ROLES.UPORABNIK];

    let vloga = await prisma.vloga_v_aplikaciji.findFirst({ where: { ime: roleLabel } });
    if (!vloga) {
      vloga = await prisma.vloga_v_aplikaciji.create({ data: { ime: roleLabel } });
    }

    const hashed = await bcrypt.hash(password, 10);

    const created = await prisma.uporabnik.create({
      data: {
        email,
        ime,
        geslo: hashed,
        id_gd: user.id_gd ?? 0,
        id_vva: vloga.id_vva,
        kreiran: new Date(),
      },
    });

    return NextResponse.json({ ok: true, user: { id: created.id_u, email: created.email } });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err?.message ?? String(err) }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const user = session?.user as any;
    if (!user || !canManageUsers(user.role)) {
      return NextResponse.json({ error: "Ni dovoljenja." }, { status: 403 });
    }

    const body = await req.json();
    const userId = Number(body.userId);

    if (!Number.isInteger(userId) || userId <= 0) {
      return NextResponse.json({ error: "Neveljaven uporabnik." }, { status: 400 });
    }

    if (Number(user.id) === userId) {
      return NextResponse.json({ error: "Ne moreš izbrisati samega sebe." }, { status: 400 });
    }

    const targetUser = await prisma.uporabnik.findUnique({
      where: { id_u: userId },
      select: { id_u: true, id_gd: true },
    });

    if (!targetUser || targetUser.id_gd !== user.id_gd) {
      return NextResponse.json(
        { error: "Uporabnik ne obstaja v tvojem društvu." },
        { status: 404 },
      );
    }

    await prisma.$transaction([
      prisma.intervencije_vozila_uporabniki.deleteMany({ where: { id_u: userId } }),
      prisma.intervencije_uporabnik.deleteMany({ where: { id_u: userId } }),
      prisma.uporabnik.delete({ where: { id_u: userId } }),
    ]);

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json(
      { error: err?.message ?? "Brisanje uporabnika ni uspelo." },
      { status: 500 },
    );
  }
}
