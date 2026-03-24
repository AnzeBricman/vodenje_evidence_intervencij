import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { prisma } from "@/lib/prisma";
import { ROLE_LABEL } from "@/lib/roles";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const user = session?.user as any;
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Ni dovoljenja" }, { status: 403 });
    }

    const body = await req.json();
    const email = (body.email || "").toString().trim().toLowerCase();
    const ime = (body.name || "").toString().trim();
    const password = (body.password || "").toString();
    const role = (body.role || "UPORABNIK").toString();

    if (!email || !ime || !password) {
      return NextResponse.json({ error: "Manjkajoči podatki" }, { status: 400 });
    }

    // map role constant to DB label (e.g. ADMIN -> "Administrator")
    const roleLabel = (ROLE_LABEL as any)[role] ?? "Uporabnik";

    // find or create role lookup
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
      },
    });

    return NextResponse.json({ ok: true, user: { id: created.id_u, email: created.email } });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err?.message ?? String(err) }, { status: 500 });
  }
}
