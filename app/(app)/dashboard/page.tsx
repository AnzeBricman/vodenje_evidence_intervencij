import PageHeader from "@/components/common/page-header";
import { prisma } from "@/lib/prisma";

export default async function DashboardPage() {
  const activeStatusName = "Aktivna";
  const closedStatusName = "Zaključena";

  const [activeStatus, closedStatus] = await Promise.all([
    prisma.status.findFirst({ where: { ime_statusa: activeStatusName } }),
    prisma.status.findFirst({ where: { ime_statusa: closedStatusName } }),
  ]);

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const nextMonthStart = new Date(now.getFullYear(), now.getMonth() + 1, 1);

  const [
    activeInterventionsCount,
    closedThisMonthCount,
    totalHoursThisMonth,
    usersCount,
    lastInterventions,
  ] = await Promise.all([
    prisma.intervencija.count({
      where: activeStatus?.id_s ? { id_s: activeStatus.id_s } : undefined,
    }),

    prisma.intervencija.count({
      where: closedStatus?.id_s
        ? {
            id_s: closedStatus.id_s,
            zacetek: { gte: monthStart, lt: nextMonthStart },
          }
        : {
            zacetek: { gte: monthStart, lt: nextMonthStart },
          },
    }),

    prisma.intervencija.aggregate({
      where: {
        zacetek: { gte: monthStart, lt: nextMonthStart },
      },
      _sum: { trajanje_ur: true },
    }),

    prisma.uporabnik.count(),

    prisma.intervencija.findMany({
      orderBy: { zacetek: "desc" },
      take: 5,
      include: {
        status: true,
        intervencija_tip: true,
      },
    }),
  ]);

  const totalHours = totalHoursThisMonth._sum.trajanje_ur ?? 0;

  const typesAgg = await prisma.intervencija.groupBy({
    by: ["id_it"],
    _count: { id_i: true },
    where: { zacetek: { gte: monthStart, lt: nextMonthStart } },
  });

  const typeIds = typesAgg.map((t) => t.id_it);
  const types = await prisma.intervencija_tip.findMany({
    where: { id_it: { in: typeIds } },
  });

  const typesWithCounts = typesAgg
    .map((row) => ({
      id_it: row.id_it,
      count: row._count.id_i,
      tip: types.find((t) => t.id_it === row.id_it)?.tip ?? "Neznano",
    }))
    .sort((a, b) => b.count - a.count);

  return (
    <>
      <PageHeader title="Nadzorna plošča" />

      <div className="grid gap-6">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard title="Aktivne intervencije" value={activeInterventionsCount} />
          <StatCard title="Zaključene ta mesec" value={closedThisMonthCount} />
          <StatCard title="Skupne ure" value={`${Number(totalHours).toFixed(2)} h`} />
          <StatCard title="Aktivni člani" value={usersCount} />
        </div>

        <div className="grid gap-6 xl:grid-cols-3">
          <div className="xl:col-span-2 rounded-xl border bg-white p-5">
            <div className="mb-4 text-sm font-semibold">Zadnje intervencije</div>

            <div className="divide-y">
              {lastInterventions.map((i) => (
                <div key={i.id_i} className="py-3 flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <div className="text-sm font-medium truncate">
                      {i.zap_st ?? "(brez št.)"} — {i.naslov}
                    </div>
                    <div className="text-xs text-gray-500">
                      {i.lokacija} • {i.intervencija_tip?.tip ?? "—"} •{" "}
                      {i.zacetek ? new Date(i.zacetek).toLocaleString("sl-SI") : "—"}
                    </div>
                  </div>

                  <span className="shrink-0 rounded-full border px-3 py-1 text-xs">
                    {i.status?.ime_statusa ?? "—"}
                  </span>
                </div>
              ))}

              {lastInterventions.length === 0 && (
                <div className="py-6 text-sm text-gray-500">
                  Trenutno ni nobene intervencije.
                </div>
              )}
            </div>
          </div>

          <div className="rounded-xl border bg-white p-5">
            <div className="mb-4 text-sm font-semibold">Vrste intervencij (ta mesec)</div>

            <div className="space-y-2">
              {typesWithCounts.map((t) => (
                <div key={t.id_it} className="flex items-center justify-between text-sm">
                  <span className="text-gray-700">{t.tip}</span>
                  <span className="rounded-full border px-2 py-0.5 text-xs">
                    {t.count}
                  </span>
                </div>
              ))}

              {typesWithCounts.length === 0 && (
                <div className="text-sm text-gray-500">
                  Ta mesec še ni podatkov.
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-3">
          <div className="hidden xl:block xl:col-span-2" />
          <div className="rounded-xl border bg-white p-5">
            <div className="mb-4 text-sm font-semibold">Opozorila</div>

            <div className="space-y-3 text-sm text-gray-600">
              <div className="rounded-lg border p-3">
                (Kasneje) Vozila z zapadlim servisom
              </div>
              <div className="rounded-lg border p-3">
                (Kasneje) Oprema za pregled / poškodovana
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function StatCard({ title, value }: { title: string; value: string | number }) {
  return (
    <div className="rounded-xl border bg-white p-5">
      <div className="text-sm text-gray-600">{title}</div>
      <div className="mt-2 text-2xl font-semibold">{value}</div>
    </div>
  );
}
