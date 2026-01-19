import PageHeader from "@/components/common/page-header";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

function formatDateTime(d: Date | null) {
  if (!d) return "—";
  return new Intl.DateTimeFormat("sl-SI", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

function formatHours(h: unknown) {
  if (h == null) return "—";
  const n = Number((h as any)?.toString?.() ?? h);
  if (Number.isNaN(n)) return "—";
  return `${n.toFixed(2)} h`;
}

export default async function InterventionsPage() {
  const interventions = await prisma.intervencija.findMany({
    orderBy: { zacetek: "desc" },
    take: 50,
    select: {
      id_i: true,
      zap_st: true,
      naslov: true,
      lokacija: true,
      zacetek: true,
      trajanje_ur: true,
      intervencija_tip: { select: { tip: true } },
      status: { select: { ime_statusa: true } },
    },
  });

  type InterventionRow = (typeof interventions)[number];

  return (
    <>
      <PageHeader
        title="Seznam intervencij"
        subtitle="Pregled vseh gasilskih intervencij"
        right={
          <button className="rounded-lg bg-red-600 px-4 py-2 text-sm text-white">
            + Nova intervencija
          </button>
        }
      />

      <div className="rounded-xl border bg-white p-5">
        <div className="mb-4 flex gap-3">
          <input
            className="w-full rounded-lg border px-3 py-2 text-sm"
            placeholder="Iskanje po naslovu, številki ali lokaciji..."
          />
          <button className="rounded-lg border px-3 py-2 text-sm">
            Vsi statusi
          </button>
          <button className="rounded-lg border px-3 py-2 text-sm">📅</button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-xs text-muted-foreground">
                <th className="py-2 pr-4">Št.</th>
                <th className="py-2 pr-4">Naslov</th>
                <th className="py-2 pr-4">Lokacija</th>
                <th className="py-2 pr-4">Vrsta</th>
                <th className="py-2 pr-4">Začetek</th>
                <th className="py-2 pr-4">Trajanje</th>
                <th className="py-2 pr-4">Status</th>
              </tr>
            </thead>

            <tbody>
              {interventions.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="py-10 text-center text-muted-foreground"
                  >
                    Ni intervencij v bazi.
                  </td>
                </tr>
              ) : (
              interventions.map((i: InterventionRow) => (
                <tr key={i.id_i} className="border-b last:border-b-0 hover:bg-gray-50">
                  <td className="py-3 pr-4 font-medium">
                    <Link
                      href={`/interventions/${i.id_i}`}
                      className="hover:underline text-blue-600"
                    >
                      {i.zap_st}
                    </Link>
                  </td>

                  <td className="py-3 pr-4 font-medium">
                    {i.naslov}
                  </td>

                  <td className="py-3 pr-4 text-muted-foreground">
                    {i.lokacija ?? "—"}
                  </td>

                  <td className="py-3 pr-4">
                    {i.intervencija_tip?.tip ?? "—"}
                  </td>

                  <td className="py-3 pr-4">
                    {formatDateTime(i.zacetek)}
                  </td>

                  <td className="py-3 pr-4">
                    {formatHours(i.trajanje_ur)}
                  </td>

    <td className="py-3 pr-4">
      <span className="inline-flex items-center rounded-full border px-2 py-1 text-xs">
        {i.status?.ime_statusa ?? "—"}
      </span>
    </td>
  </tr>
))

              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
