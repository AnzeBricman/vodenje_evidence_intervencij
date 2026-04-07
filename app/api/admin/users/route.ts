import crypto from "node:crypto";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { sendCredentialsEmail } from "@/lib/mailer";
import { prisma } from "@/lib/prisma";
import { ROLE_LABEL, ROLES } from "@/lib/roles";

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
    const email = String(body.email ?? "").trim().toLowerCase();
    const ime = String(body.name ?? "").trim();
    const role = String(body.role ?? ROLES.ADMIN);
    const id_gd = Number(body.id_gd);

    if (!email || !ime || !Number.isInteger(id_gd) || id_gd <= 0) {
      return NextResponse.json({ error: "Manjkajoči ali neveljavni podatki." }, { status: 400 });
    }

    if (role === ROLES.SUPER_ADMIN) {
      return NextResponse.json(
        { error: "Super admina dodaj ločeno na sistemskem nivoju." },
        { status: 400 },
      );
    }

    const existingEmail = await prisma.uporabnik.findUnique({
      where: { email },
      select: { id_u: true },
    });

    if (existingEmail) {
      return NextResponse.json({ error: "Ta email je že v uporabi." }, { status: 409 });
    }

    const society = await prisma.gasilni_dom.findUnique({
      where: { id_gd },
      select: { id_gd: true, ime: true },
    });

    if (!society) {
      return NextResponse.json({ error: "Izbrano društvo ne obstaja." }, { status: 404 });
    }

    const roleLabel = ROLE_LABEL[role as keyof typeof ROLE_LABEL] ?? "Uporabnik";

    let vloga = await prisma.vloga_v_aplikaciji.findFirst({
      where: { ime: roleLabel },
    });

    if (!vloga) {
      vloga = await prisma.vloga_v_aplikaciji.create({
        data: { ime: roleLabel },
      });
    }

    const generatedPassword = crypto.randomBytes(9).toString("base64url");
    const hashed = await bcrypt.hash(generatedPassword, 10);

    const created = await prisma.uporabnik.create({
      data: {
        email,
        ime,
        geslo: hashed,
        id_gd,
        id_vva: vloga.id_vva,
        kreiran: new Date(),
      },
      select: {
        id_u: true,
        ime: true,
        email: true,
      },
    });

    try {
      await sendCredentialsEmail({
        to: email,
        fullName: ime,
        societyName: society.ime,
        roleLabel,
        password: generatedPassword,
      });
    } catch (mailError: any) {
      await prisma.uporabnik.delete({
        where: { id_u: created.id_u },
      });

      return NextResponse.json(
        {
          error:
            mailError?.message ??
            "Uporabnik ni bil ustvarjen, ker pošiljanje emaila ni uspelo.",
        },
        { status: 500 },
      );
    }

    return NextResponse.json({ ok: true, user: created });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message ?? "Dodajanje uporabnika ni uspelo." },
      { status: 500 },
    );
  }
}
