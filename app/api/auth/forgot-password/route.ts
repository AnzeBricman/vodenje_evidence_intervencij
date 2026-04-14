import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendPasswordResetEmail } from "@/lib/mailer";
import { createPasswordResetToken } from "@/lib/password-reset";

const GENERIC_MESSAGE =
  "Če račun obstaja, smo na email poslali povezavo za ponastavitev gesla.";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    const email = String(body?.email ?? "").trim().toLowerCase();

    if (!email) {
      return NextResponse.json({ error: "Email je obvezen." }, { status: 400 });
    }

    const user = await prisma.uporabnik.findUnique({
      where: { email },
      select: {
        id_u: true,
        email: true,
        ime: true,
      },
    });

    if (!user) {
      return NextResponse.json({ ok: true, message: GENERIC_MESSAGE });
    }

    const { rawToken, tokenHash } = createPasswordResetToken();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
    const origin = new URL(req.url).origin;
    const resetUrl = `${origin}/reset-password?token=${rawToken}`;

    await prisma.$transaction([
      prisma.password_reset_token.deleteMany({
        where: {
          id_u: user.id_u,
          used_at: null,
        },
      }),
      prisma.password_reset_token.create({
        data: {
          id_u: user.id_u,
          token_hash: tokenHash,
          expires_at: expiresAt,
        },
      }),
    ]);

    await sendPasswordResetEmail({
      to: user.email,
      fullName: user.ime,
      resetUrl,
    });

    return NextResponse.json({ ok: true, message: GENERIC_MESSAGE });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json(
      { error: err?.message ?? "Posiljanje povezave ni uspelo." },
      { status: 500 },
    );
  }
}
