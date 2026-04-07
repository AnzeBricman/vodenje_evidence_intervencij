import nodemailer from "nodemailer";

function requireEnv(name: string) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Manjka ${name} v .env.`);
  }
  return value;
}

export async function sendCredentialsEmail({
  to,
  fullName,
  societyName,
  roleLabel,
  password,
}: {
  to: string;
  fullName: string;
  societyName: string;
  roleLabel: string;
  password: string;
}) {
  const host = requireEnv("SMTP_HOST");
  const port = Number(requireEnv("SMTP_PORT"));
  const user = requireEnv("SMTP_USER");
  const pass = requireEnv("SMTP_PASS");
  const from = requireEnv("SMTP_FROM");

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: {
      user,
      pass,
    },
  });

  await transporter.sendMail({
    from,
    to,
    subject: `Dostop do sistema za društvo ${societyName}`,
    text: [
      `Pozdravljen${fullName ? `, ${fullName}` : ""}.`,
      "",
      `V sistem si bil dodan kot ${roleLabel} društva ${societyName}.`,
      "",
      "Prijavni podatki:",
      `Email: ${to}`,
      `Začasno geslo: ${password}`,
      "",
      "Priporočilo: po prvi prijavi geslo takoj zamenjaj v svojem profilu.",
      "",
      "Lep pozdrav,",
      "Sistem za vodenje evidenc intervencij",
    ].join("\n"),
    html: `
      <div style="font-family: Arial, Helvetica, sans-serif; color: #0f172a; line-height: 1.6;">
        <p>Pozdravljen${fullName ? `, <strong>${fullName}</strong>` : ""}.</p>
        <p>V sistem si bil dodan kot <strong>${roleLabel}</strong> društva <strong>${societyName}</strong>.</p>
        <p><strong>Prijavni podatki:</strong><br />
        Email: ${to}<br />
        Začasno geslo: ${password}</p>
        <p>Priporočilo: po prvi prijavi geslo takoj zamenjaj v svojem profilu.</p>
        <p>Lep pozdrav,<br />Sistem za vodenje evidenc intervencij</p>
      </div>
    `,
  });
}
