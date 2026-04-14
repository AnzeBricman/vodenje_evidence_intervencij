import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPasswordResetToken } from "@/lib/password-reset";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    const token = String(body?.token ?? "").trim();
    const password = String(body?.password ?? "");

    if (!token || !password) {
      return NextResponse.json({ error: "Token in novo geslo sta obvezna." }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Novo geslo mora imeti vsaj 6 znakov." },
        { status: 400 },
      );
    }

    const tokenHash = hashPasswordResetToken(token);
    const resetToken = await prisma.password_reset_token.findUnique({
      where: { token_hash: tokenHash },
      select: {
        id_prt: true,
        id_u: true,
        used_at: true,
        expires_at: true,
      },
    });

    if (!resetToken || resetToken.used_at || resetToken.expires_at < new Date()) {
      return NextResponse.json(
        { error: "Povezava za ponastavitev ni več veljavna." },
        { status: 400 },
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.$transaction([
      prisma.uporabnik.update({
        where: { id_u: resetToken.id_u },
        data: { geslo: hashedPassword },
      }),
      prisma.password_reset_token.update({
        where: { id_prt: resetToken.id_prt },
        data: { used_at: new Date() },
      }),
      prisma.password_reset_token.deleteMany({
        where: {
          id_u: resetToken.id_u,
          id_prt: { not: resetToken.id_prt },
        },
      }),
    ]);

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json(
      { error: err?.message ?? "Ponastavitev gesla ni uspela." },
      { status: 500 },
    );
  }
}
