import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth-guards";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: Request) {
  const sessionUser = await requireUser();
  const userId = Number(sessionUser.id);

  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Neveljavni podatki." }, { status: 400 });
  }

  const currentUser = await prisma.uporabnik.findUnique({
    where: { id_u: userId },
    select: {
      id_u: true,
      geslo: true,
    },
  });

  if (!currentUser) {
    return NextResponse.json({ error: "Uporabnik ni bil najden." }, { status: 404 });
  }

  if (!("newPassword" in body || "currentPassword" in body)) {
    return NextResponse.json({ error: "Podprta je samo sprememba gesla." }, { status: 400 });
  }

  const currentPassword = String(body.currentPassword ?? "");
  const newPassword = String(body.newPassword ?? "");

  if (!currentPassword || !newPassword) {
    return NextResponse.json(
      { error: "Za spremembo gesla vpiši trenutno in novo geslo." },
      { status: 400 },
    );
  }

  if (newPassword.length < 6) {
    return NextResponse.json(
      { error: "Novo geslo mora imeti vsaj 6 znakov." },
      { status: 400 },
    );
  }

  if (!currentUser.geslo) {
    return NextResponse.json(
      { error: "Trenutnega gesla ni mogoče preveriti." },
      { status: 400 },
    );
  }

  const passwordMatches = await bcrypt.compare(currentPassword, currentUser.geslo);
  if (!passwordMatches) {
    return NextResponse.json({ error: "Trenutno geslo ni pravilno." }, { status: 400 });
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  await prisma.uporabnik.update({
    where: { id_u: userId },
    data: { geslo: hashedPassword },
  });

  return NextResponse.json({ ok: true });
}
