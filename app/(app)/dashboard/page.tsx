import PageHeader from "@/components/common/page-header";
import { requireUser } from "@/lib/auth-guards";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const user = await requireUser();

  if ((user as any).role === "SUPER_ADMIN") {
    redirect("/admin");
  }

  const activeStatusName = "Aktivna";
  const closedStatusName = "Zaključena";

  const [activeStatus, closedStatus] = await Promise.all([
    prisma.status.findFirst({ where: { ime_statusa: activeStatusName } }),
    prisma.status.findFirst({ where: { ime_statusa: closedStatusName } }),
  ]);

  const now = new Date();
  const yearStart = new Date(now.getFullYear(), 0, 1);
  const nextYearStart = new Date(now.getFullYear() + 1, 0, 1);

  const [
    activeInterventionsCount,
    closedThisYearCount,
    totalHoursThisYear,
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
            zacetek: { gte: yearStart, lt: nextYearStart },
          }
        : {
            zacetek: { gte: yearStart, lt: nextYearStart },
          },
    }),
    prisma.intervencija.aggregate({
      where: {
        zacetek: { gte: yearStart, lt: nextYearStart },
      },
      _sum: { trajanje_ur: true },
    }),
    prisma.uporabnik.count(),
    prisma.intervencija.findMany({
      orderBy: { zacetek: "desc" },
      take: 3,
      include: {
        status: true,
        intervencija_tip: true,
      },
    }),
  ]);

  const totalHours = Number(totalHoursThisYear._sum.trajanje_ur ?? 0);

  const typesAgg = await prisma.intervencija.groupBy({
    by: ["id_it"],
    _count: { id_i: true },
    where: { zacetek: { gte: yearStart, lt: nextYearStart } },
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

  const currentYearLabel = now.getFullYear();

  return (
    <>
      <PageHeader
        title="Nadzorna plošča"
        subtitle={`Pregled ključnih številk in aktivnosti za leto ${currentYearLabel}`}
      />

      <div className="space-y-6">
        <section className="grid gap-6 xl:grid-cols-[1.65fr_1fr]">
          <div className="relative overflow-hidden rounded-3xl border border-red-100 bg-gradient-to-br from-red-50 via-white to-rose-50 px-7 py-7 text-slate-900 shadow-[0_24px_60px_-38px_rgba(220,38,38,0.28)]">
            <div className="absolute right-0 top-0 h-40 w-40 -translate-y-10 translate-x-10 rounded-full bg-red-100/70 blur-3xl" />
            <div className="absolute bottom-0 left-0 h-28 w-28 -translate-x-10 translate-y-10 rounded-full bg-rose-100/80 blur-3xl" />

            <div className="relative space-y-8">
              <div className="max-w-2xl">
                <div className="inline-flex rounded-full border border-red-200 bg-white/90 px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-red-600">
                  Letni pregled
                </div>
                <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-900">
                  V letu {currentYearLabel} ste zaključili {closedThisYearCount} intervencij.
                </h2>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <HeroMetric label="Zaključene letos" value={closedThisYearCount} />
                <HeroMetric label="Skupne ure letos" value={`${totalHours.toFixed(2)} h`} />
                <HeroMetric label="Aktivni člani" value={usersCount} />
              </div>
            </div>
          </div>

          <div className="grid gap-4">
            <StatCard
              eyebrow="Leto"
              title="Zaključene intervencije"
              value={closedThisYearCount}
              tone="red"
            />
            <StatCard
              eyebrow="Leto"
              title="Skupne ure dela"
              value={`${totalHours.toFixed(2)} h`}
              tone="slate"
            />
            <StatCard
              eyebrow="Trenutno"
              title="Aktivne intervencije"
              value={activeInterventionsCount}
              tone="amber"
            />
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
          <Panel
            title="Zadnje intervencije"
            subtitle="Zadnji 3 dogodki v sistemu"
          >
            {lastInterventions.length === 0 ? (
              <EmptyState text="Trenutno ni nobene intervencije." />
            ) : (
              <div className="space-y-3">
                {lastInterventions.map((item) => (
                  <div
                    key={item.id_i}
                    className="flex items-start justify-between gap-4 rounded-2xl border border-gray-200 bg-gray-50/80 px-4 py-4 transition hover:bg-white hover:shadow-sm"
                  >
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-gray-900">
                        {(item.zap_st || "(brez st.)") + " | " + item.naslov}
                      </div>
                      <div className="mt-1 text-sm text-gray-500">
                        {(item.lokacija || "Lokacija ni vpisana") +
                          " | " +
                          (item.intervencija_tip?.tip || "Brez vrste")}
                      </div>
                      <div className="mt-2 text-xs uppercase tracking-[0.14em] text-gray-400">
                        {item.zacetek
                          ? new Date(item.zacetek).toLocaleString("sl-SI")
                          : "Brez datuma"}
                      </div>
                    </div>

                    <span className="shrink-0 rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-medium text-gray-700">
                      {item.status?.ime_statusa || "Brez statusa"}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </Panel>

          <Panel title="Vrste intervencij" subtitle={`Razporeditev za leto ${currentYearLabel}`}>
            {typesWithCounts.length === 0 ? (
              <EmptyState text="Letos še ni podatkov." />
            ) : (
              <div className="space-y-3">
                {typesWithCounts.map((item, index) => (
                  <div key={item.id_it} className="space-y-2 rounded-2xl border border-gray-200 bg-gray-50/80 px-4 py-4">
                    <div className="flex items-center justify-between gap-3">
                      <div className="text-sm font-medium text-gray-800">{item.tip}</div>
                      <div className="rounded-full border border-gray-200 bg-white px-2.5 py-1 text-xs font-semibold text-gray-700">
                        {item.count}
                      </div>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-gray-200">
                      <div
                        className="h-full rounded-full bg-red-600"
                        style={{
                          width: `${Math.max(
                            12,
                            (item.count /
                              Math.max(...typesWithCounts.map((entry) => entry.count), 1)) *
                              100,
                          )}%`,
                          opacity: 1 - index * 0.12,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Panel>
        </section>

        <section>
          <Panel title="Ekipa" subtitle="Osnovni operativni okvir društva">
            <div className="grid gap-4 sm:grid-cols-2">
              <MiniCard label="Aktivni člani" value={usersCount} />
              <MiniCard label="Skupne ure letos" value={`${totalHours.toFixed(2)} h`} />
            </div>
          </Panel>
        </section>
      </div>
    </>
  );
}

function HeroMetric({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="rounded-2xl border border-red-100 bg-white/85 px-4 py-4 backdrop-blur-sm shadow-[0_12px_28px_-24px_rgba(220,38,38,0.4)]">
      <div className="text-xs uppercase tracking-[0.16em] text-slate-500">{label}</div>
      <div className="mt-2 text-2xl font-semibold text-slate-900">{value}</div>
    </div>
  );
}

function StatCard({
  eyebrow,
  title,
  value,
  tone,
}: {
  eyebrow: string;
  title: string;
  value: string | number;
  tone: "red" | "slate" | "amber";
}) {
  const toneClasses =
    tone === "red"
      ? "from-red-50 to-white border-red-100"
      : tone === "amber"
        ? "from-amber-50 to-white border-amber-100"
        : "from-slate-50 to-white border-slate-200";

  return (
    <div className={`rounded-2xl border bg-gradient-to-br ${toneClasses} p-5 shadow-sm`}>
      <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-gray-500">
        {eyebrow}
      </div>
      <div className="mt-3 text-sm font-medium text-gray-700">{title}</div>
      <div className="mt-2 text-3xl font-semibold tracking-tight text-gray-900">{value}</div>
    </div>
  );
}

function Panel({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="mb-5">
        <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
        {subtitle ? <p className="mt-1 text-sm text-gray-500">{subtitle}</p> : null}
      </div>
      {children}
    </div>
  );
}

function MiniCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-gray-50/80 px-4 py-5">
      <div className="text-xs uppercase tracking-[0.16em] text-gray-500">{label}</div>
      <div className="mt-2 text-2xl font-semibold text-gray-900">{value}</div>
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return <div className="rounded-2xl bg-gray-50 px-4 py-8 text-sm text-gray-500">{text}</div>;
}
