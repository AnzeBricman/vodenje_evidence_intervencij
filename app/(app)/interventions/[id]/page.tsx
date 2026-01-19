import PageHeader from "@/components/common/page-header";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import React from "react";

export default async function InterventionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;      
  const numericId = Number(id);
  if (!Number.isFinite(numericId)) notFound();

  const intervencija = await prisma.intervencija.findUnique({
    where: { id_i: numericId },
    include: {
      status: true,
      intervencija_tip: true,
      tip_casa: true,
      intervencije_vozila: {
        include: {
          vozilo: { include: { tip_vozila: true } },
          intervencije_vozila_uporabniki: {
            include: { uporabnik: true, vloga_v_vozilu: true },
          },
        },
      },
    },
  });

  if (!intervencija) notFound();

  return (
    <>
      <PageHeader
        title={`Intervencija ${intervencija.zap_st}`}
        subtitle={`${intervencija.naslov}${
          intervencija.lokacija ? ` – ${intervencija.lokacija}` : ""
        }`}
      />

      <div className="mb-6 grid gap-4 rounded-xl border bg-white p-5 sm:grid-cols-2 xl:grid-cols-4">
        <Info label="Status" value={intervencija.status.ime_statusa} />
        <Info label="Vrsta" value={intervencija.intervencija_tip.tip} />
        <Info
          label="Začetek"
          value={new Date(intervencija.zacetek).toLocaleString("sl-SI")}
        />
        <Info
          label="Konec"
          value={new Date(intervencija.konec).toLocaleString("sl-SI")}
        />
        <Info
          label="Trajanje"
          value={`${Number(intervencija.trajanje_ur).toFixed(2)} h`}
        />
        <Info label="Tip časa" value={intervencija.tip_casa.ime_tipa} />
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Vozila na intervenciji</h2>

        {intervencija.intervencije_vozila.map((iv) => (
          <div key={iv.id_iv} className="rounded-xl border bg-white p-5">
            <div className="mb-3">
              <div className="font-medium">
                {iv.vozilo.ime} ({iv.vozilo.tip_vozila.ime_tipa})
              </div>
              <div className="text-sm text-gray-500">
                Registrska: {iv.vozilo.registrska_st ?? "—"}
              </div>
            </div>

            {iv.intervencije_vozila_uporabniki.length > 0 ? (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-gray-600">
                    <th className="py-2">Član</th>
                    <th className="py-2">Vloga v vozilu</th>
                  </tr>
                </thead>
                <tbody>
                  {iv.intervencije_vozila_uporabniki.map((ivu) => (
                    <tr key={ivu.id_ivu} className="border-b last:border-0">
                      <td className="py-2">{ivu.uporabnik.ime}</td>
                      <td className="py-2">{ivu.vloga_v_vozilu.ime_vloge}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="text-sm text-gray-500">Ni dodeljenih članov.</div>
            )}
          </div>
        ))}

        {intervencija.intervencije_vozila.length === 0 && (
          <div className="rounded-xl border bg-white p-5 text-sm text-gray-500">
            Na intervenciji še ni dodanih vozil.
          </div>
        )}
      </div>
    </>
  );
}

function Info({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <div className="text-xs text-gray-500">{label}</div>
      <div className="font-medium">{value}</div>
    </div>
  );
}
