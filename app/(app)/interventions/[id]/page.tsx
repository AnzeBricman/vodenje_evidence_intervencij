import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import React from "react";

type TabKey = "osnovno" | "prisotnost" | "oprema" | "stroski";

const TABS: { key: TabKey; label: string }[] = [
  { key: "osnovno", label: "Osnovno" },
  { key: "prisotnost", label: "Prisotnost" },
  { key: "oprema", label: "Oprema" },
  { key: "stroski", label: "Stroški" },
];

// Helper za € format (vedno na voljo v tej datoteki)
function eur(n: number) {
  return new Intl.NumberFormat("sl-SI", {
    style: "currency",
    currency: "EUR",
  }).format(n);
}

export default async function InterventionDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string }>;
}) {
  const { id } = await params;
  const sp = await searchParams;

  const numericId = Number(id);
  if (!Number.isFinite(numericId)) notFound();

  const tab = (sp.tab as TabKey) ?? "osnovno";

  const intervencija = await prisma.intervencija.findUnique({
    where: { id_i: numericId },
    include: {
      status: true,
      intervencija_tip: true,
      tip_casa: true,

      intervencije_uporabnik: {
        include: {
          uporabnik: true,
          vloga_na_intervenciji: true,
        },
        orderBy: { id: "asc" },
      },

      intervencije_vozila: {
        include: {
          vozilo: {
            include: { tip_vozila: true },
          },
          intervencije_vozila_uporabniki: {
            include: {
              uporabnik: true,
              vloga_v_vozilu: true,
            },
            orderBy: { id_ivu: "asc" },
          },
        },
        orderBy: { id_iv: "asc" },
      },

      intervencija_oprema: {
        include: {
          oprema: {
            include: { kategorija_oprema: true },
          },
        },
        orderBy: { id_io: "asc" },
      },
    },
  });

  if (!intervencija) notFound();


  const trajanje = Number(intervencija.trajanje_ur ?? 0); // ure
  const skupneUre = trajanje.toFixed(2);

  const claniCount = intervencija.intervencije_uporabnik.length;
  const vozilaCount = intervencija.intervencije_vozila.length;
  const opremaCount = intervencija.intervencija_oprema.length;

 
  const inVehicleUserIds = new Set(
    intervencija.intervencije_vozila.flatMap((iv) =>
      iv.intervencije_vozila_uporabniki.map((x) => x.id_u)
    )
  );

  const nedodeljeni = intervencija.intervencije_uporabnik.filter(
    (x) => !inVehicleUserIds.has(x.id_u)
  );

 
  const cenaTipaCasa = Number(intervencija.tip_casa?.cena_na_uro ?? 0);

  const stroskiMostvo = claniCount * trajanje * cenaTipaCasa;

  const vozilaRows = intervencija.intervencije_vozila.map((iv) => {
    const cenaVozila = Number((iv.vozilo as any).cena_na_uro ?? 0);
    const strosek = trajanje * cenaVozila;
    return { iv, cenaVozila, strosek };
  });
  const stroskiVozila = vozilaRows.reduce((s, r) => s + r.strosek, 0);

  const opremaRows = intervencija.intervencija_oprema.map((io) => {
    const cenaOpreme = Number((io.oprema as any).cena_na_uro ?? 0);
    const ure = Number(io.ure_uporabe ?? 0);
    const kolicina = Number(io.kolicina ?? 0);

    const strosek = kolicina * ure * cenaOpreme;

    return { io, cenaOpreme, ure, kolicina, strosek };
  });
  const stroskiOprema = opremaRows.reduce((s, r) => s + r.strosek, 0);

  const skupniStroski = stroskiMostvo + stroskiVozila + stroskiOprema;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-6">
        <div className="space-y-2">
          <div className="text-sm text-gray-500">
            <Link
              href="/interventions"
              className="inline-flex items-center gap-2 hover:underline"
            >
              ← Nazaj na seznam
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold">{intervencija.naslov}</h1>
            <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-700">
              {intervencija.status?.ime_statusa ?? "—"}
            </span>
          </div>

          <div className="text-sm text-gray-500">
            {intervencija.zap_st} • {intervencija.lokacija ?? "—"}
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-4">
        <div className="xl:col-span-3 space-y-4">
          <div className="inline-flex rounded-xl border bg-white p-1">
            {TABS.map((t) => {
              const active = tab === t.key;
              return (
                <Link
                  key={t.key}
                  href={`/interventions/${intervencija.id_i}?tab=${t.key}`}
                  className={[
                    "rounded-lg px-4 py-2 text-sm transition",
                    active
                      ? "bg-gray-100 font-medium"
                      : "text-gray-600 hover:bg-gray-50",
                  ].join(" ")}
                >
                  {t.label}
                </Link>
              );
            })}
          </div>

          {tab === "osnovno" && (
            <SectionCard title="Osnovni podatki">
              <div className="grid gap-4 sm:grid-cols-2">
                <Info label="Številka intervencije" value={intervencija.zap_st} />
                <Info
                  label="Vrsta"
                  value={intervencija.intervencija_tip?.tip ?? "—"}
                />
                <Info
                  label="Začetek"
                  value={new Date(intervencija.zacetek).toLocaleString("sl-SI")}
                />
                <Info
                  label="Konec"
                  value={new Date(intervencija.konec).toLocaleString("sl-SI")}
                />
                <Info
                  label="Tip časa"
                  value={intervencija.tip_casa?.ime_tipa ?? "—"}
                />
                <Info label="Trajanje" value={`${trajanje.toFixed(2)} h`} />
              </div>
            </SectionCard>
          )}

          {tab === "prisotnost" && (
            <div className="grid gap-6 xl:grid-cols-2">
              <SectionCard
                title={`Prisotni (${claniCount})`}
                subtitle={
                  nedodeljeni.length > 0
                    ? `${nedodeljeni.length} ni dodeljenih vozilu`
                    : "Vsi člani so dodeljeni vozilom"
                }
              >
                {claniCount === 0 ? (
                  <Empty text="Ni vpisanih prisotnih članov." />
                ) : (
                  <div className="divide-y">
                    {intervencija.intervencije_uporabnik.map((p) => (
                      <div key={p.id} className="flex items-center justify-between py-3">
                        <div className="min-w-0">
                          <div className="text-sm font-medium">{p.uporabnik.ime}</div>
                          <div className="text-xs text-gray-500">{p.uporabnik.email}</div>
                        </div>
                        <span className="rounded-full border px-3 py-1 text-xs text-gray-700">
                          {p.vloga_na_intervenciji?.ime_vloge ?? "—"}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </SectionCard>

              <SectionCard title={`Vozila (${vozilaCount})`} subtitle="Posadke po vozilih">
                {vozilaCount === 0 ? (
                  <Empty text="Na intervenciji še ni dodanih vozil." />
                ) : (
                  <div className="space-y-4">
                    {intervencija.intervencije_vozila.map((iv) => (
                      <div key={iv.id_iv} className="rounded-xl border p-4">
                        <div className="mb-3">
                          <div className="text-sm font-semibold">
                            {iv.vozilo.ime}{" "}
                            <span className="text-xs font-normal text-gray-500">
                              ({iv.vozilo.tip_vozila?.ime_tipa ?? "—"})
                            </span>
                          </div>
                          <div className="text-xs text-gray-500">
                            Registrska: {iv.vozilo.registrska_st ?? "—"}
                          </div>
                        </div>

                        {iv.intervencije_vozila_uporabniki.length === 0 ? (
                          <div className="text-sm text-gray-500">
                            Ni dodeljenih članov v vozilo.
                          </div>
                        ) : (
                          <div className="divide-y">
                            {iv.intervencije_vozila_uporabniki.map((m) => (
                              <div
                                key={m.id_ivu}
                                className="flex items-center justify-between py-2"
                              >
                                <div className="text-sm">{m.uporabnik.ime}</div>
                                <span className="rounded-full border px-3 py-1 text-xs">
                                  {m.vloga_v_vozilu?.ime_vloge ?? "—"}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </SectionCard>
            </div>
          )}

          {tab === "oprema" && (
            <SectionCard
              title={`Oprema (${opremaCount})`}
              subtitle="Porabljena oprema na intervenciji"
            >
              {opremaCount === 0 ? (
                <Empty text="Ni vpisane opreme." />
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b text-left text-xs text-gray-500">
                        <th className="py-2 pr-4">Oprema</th>
                        <th className="py-2 pr-4">Kategorija</th>
                        <th className="py-2 pr-4">Količina</th>
                        <th className="py-2 pr-4">Ure</th>
                        <th className="py-2 pr-4">Cena/uro</th>
                        <th className="py-2 pr-0 text-right">Strošek</th>
                      </tr>
                    </thead>
                    <tbody>
                      {opremaRows.map((r) => (
                        <tr key={r.io.id_io} className="border-b last:border-b-0">
                          <td className="py-3 pr-4 font-medium">
                            {r.io.oprema.ime_opreme}
                          </td>
                          <td className="py-3 pr-4 text-gray-500">
                            {r.io.oprema.kategorija_oprema?.ime_kategorije ?? "—"}
                          </td>
                          <td className="py-3 pr-4">{r.kolicina}</td>
                          <td className="py-3 pr-4">{r.ure.toFixed(2)}</td>
                          <td className="py-3 pr-4">{eur(r.cenaOpreme)}</td>
                          <td className="py-3 pr-0 text-right font-semibold">
                            {eur(r.strosek)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="border-t">
                        <td colSpan={5} className="py-3 pr-4 text-right text-gray-600">
                          Skupaj oprema
                        </td>
                        <td className="py-3 pr-0 text-right font-semibold">
                          {eur(stroskiOprema)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              )}
            </SectionCard>
          )}


          {tab === "stroski" && (
            <SectionCard title="Stroški" subtitle="Moštvo + vozila + oprema">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left text-xs text-gray-500">
                      <th className="py-2 pr-4">Postavka</th>
                      <th className="py-2 pr-4">Opis</th>
                      <th className="py-2 pr-0 text-right">Strošek</th>
                    </tr>
                  </thead>

                  <tbody>
                    <tr className="border-b">
                      <td className="py-3 pr-4 font-medium">Moštvo</td>
                      <td className="py-3 pr-4 text-gray-500">
                        {claniCount} član(ov) × {trajanje.toFixed(2)} h ×{" "}
                        {eur(cenaTipaCasa)}/h ({intervencija.tip_casa?.ime_tipa})
                      </td>
                      <td className="py-3 pr-0 text-right font-semibold">
                        {eur(stroskiMostvo)}
                      </td>
                    </tr>

                    {vozilaRows.map((r) => (
                      <tr key={`v-${r.iv.id_iv}`} className="border-b">
                        <td className="py-3 pr-4 font-medium">Vozilo</td>
                        <td className="py-3 pr-4 text-gray-500">
                          {r.iv.vozilo.ime} × {trajanje.toFixed(2)} h ×{" "}
                          {eur(r.cenaVozila)}/h
                        </td>
                        <td className="py-3 pr-0 text-right font-semibold">
                          {eur(r.strosek)}
                        </td>
                      </tr>
                    ))}

                    {opremaRows.map((r) => (
                      <tr key={`o-${r.io.id_io}`} className="border-b">
                        <td className="py-3 pr-4 font-medium">Oprema</td>
                        <td className="py-3 pr-4 text-gray-500">
                          {r.io.oprema.ime_opreme} — {r.kolicina} kos ×{" "}
                          {r.ure.toFixed(2)} h × {eur(r.cenaOpreme)}/h
                        </td>
                        <td className="py-3 pr-0 text-right font-semibold">
                          {eur(r.strosek)}
                        </td>
                      </tr>
                    ))}
                  </tbody>

                  <tfoot>
                    <tr className="border-t">
                      <td colSpan={2} className="py-3 pr-4 text-right text-gray-600">
                        Skupaj
                      </td>
                      <td className="py-3 pr-0 text-right font-semibold">
                        {eur(skupniStroski)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </SectionCard>
          )}
        </div>

        <div className="xl:col-span-1">
          <div className="rounded-xl border bg-white p-5">
            <div className="mb-4 text-sm font-semibold">Povzetek</div>

            <div className="space-y-3">
              <Kpi label="Skupne ure" value={`${skupneUre} h`} />
              <Kpi label="Skupni stroški" value={eur(skupniStroski)} />

              <div className="my-3 border-t" />

              <Row label="Člani" value={String(claniCount)} />
              <Row label="Oprema" value={String(opremaCount)} />
              <Row label="Vozila" value={String(vozilaCount)} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SectionCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border bg-white p-5">
      <div className="mb-4">
        <div className="text-sm font-semibold">{title}</div>
        {subtitle && <div className="mt-1 text-xs text-gray-500">{subtitle}</div>}
      </div>
      {children}
    </div>
  );
}

function Info({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <div className="text-xs text-gray-500">{label}</div>
      <div className="mt-1 text-sm font-medium">{value}</div>
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return <div className="text-sm text-gray-500">{text}</div>;
}

function Kpi({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs text-gray-500">{label}</div>
      <div className="text-xl font-semibold">{value}</div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-gray-600">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
