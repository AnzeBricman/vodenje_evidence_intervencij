import bcrypt from "bcryptjs";
import crypto from "crypto";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { sendCredentialsEmail } from "@/lib/mailer";
import { prisma } from "@/lib/prisma";
import { ROLE_LABEL, ROLES } from "@/lib/roles";

function canManageUsers(role?: string) {
  return role === ROLES.ADMIN;
}

const ALLOWED_ROLES = new Set([ROLES.ADMIN, ROLES.UPORABNIK]);

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const user = session?.user as { id?: string; role?: string; id_gd?: number } | undefined;

    if (!user || !canManageUsers(user.role)) {
      return NextResponse.json({ error: "Ni dovoljenja." }, { status: 403 });
    }

    const body = await req.json();
    const email = String(body.email ?? "").trim().toLowerCase();
    const ime = String(body.name ?? "").trim();
    const role = String(body.role ?? ROLES.UPORABNIK);

    if (!email || !ime) {
      return NextResponse.json({ error: "Manjkajoci podatki." }, { status: 400 });
    }

    if (!ALLOWED_ROLES.has(role as typeof ROLES.ADMIN | typeof ROLES.UPORABNIK)) {
      return NextResponse.json({ error: "Neveljavna vloga." }, { status: 400 });
    }

    if (!user.id_gd) {
      return NextResponse.json({ error: "Uporabnik nima društva." }, { status: 400 });
    }

    const roleLabel = ROLE_LABEL[role as keyof typeof ROLE_LABEL] ?? ROLE_LABEL[ROLES.UPORABNIK];
    const drustvo = await prisma.gasilni_dom.findUnique({
      where: { id_gd: user.id_gd },
      select: { ime: true },
    });

    if (!drustvo) {
      return NextResponse.json({ error: "Društvo ni bilo najdeno." }, { status: 400 });
    }

    let vloga = await prisma.vloga_v_aplikaciji.findFirst({ where: { ime: roleLabel } });
    if (!vloga) {
      vloga = await prisma.vloga_v_aplikaciji.create({ data: { ime: roleLabel } });
    }

    const temporaryPassword = crypto.randomBytes(9).toString("base64url");
    const hashedPassword = await bcrypt.hash(temporaryPassword, 10);

    const created = await prisma.uporabnik.create({
      data: {
        email,
        ime,
        geslo: hashedPassword,
        id_gd: user.id_gd,
        id_vva: vloga.id_vva,
        kreiran: new Date(),
      },
    });

    try {
      await sendCredentialsEmail({
        to: email,
        fullName: ime,
        societyName: drustvo.ime,
        roleLabel,
        password: temporaryPassword,
      });
    } catch (mailError) {
      await prisma.uporabnik.delete({ where: { id_u: created.id_u } });
      throw mailError;
    }

    return NextResponse.json({ ok: true, user: { id: created.id_u, email: created.email } });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err?.message ?? String(err) }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const user = session?.user as { id?: string; role?: string; id_gd?: number } | undefined;

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
