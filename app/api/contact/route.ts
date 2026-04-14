import { NextResponse } from "next/server";
import { sendContactEmail } from "@/lib/mailer";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    const fullName = String(body?.fullName ?? "").trim();
    const email = String(body?.email ?? "").trim().toLowerCase();
    const message = String(body?.message ?? "").trim();

    if (!fullName || !email || !message) {
      return NextResponse.json({ error: "Izpolni vsa polja." }, { status: 400 });
    }

    if (message.length < 10) {
      return NextResponse.json(
        { error: "Sporočilo naj bo malo bolj opisno." },
        { status: 400 },
      );
    }

    await sendContactEmail({
      fullName,
      email,
      message,
    });

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json(
      { error: err?.message ?? "Pošiljanje sporočila ni uspelo." },
      { status: 500 },
    );
  }
}
