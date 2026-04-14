import Link from "next/link";
import PageHeader from "@/components/common/page-header";
import InterventionsTable from "@/components/interventions/interventions-table";
import { hasPermission, requireUser } from "@/lib/auth-guards";
import { prisma } from "@/lib/prisma";

export default async function InterventionsPage() {
  const user = await requireUser();

  const [interventions, statuses] = await Promise.all([
    prisma.intervencija.findMany({
      where: { id_gd: user.id_gd },
      orderBy: { zacetek: "desc" },
      take: 50,
      select: {
        id_i: true,
        zap_st: true,
        naslov: true,
        lokacija: true,
        zacetek: true,
        trajanje_ur: true,
        id_s: true,
        intervencija_tip: { select: { tip: true } },
        status: { select: { ime_statusa: true } },
      },
    }),
    prisma.status.findMany({
      orderBy: { ime_statusa: "asc" },
      select: { id_s: true, ime_statusa: true },
    }),
  ]);

  const canCreate = hasPermission((user as any).role, "INTERVENTION_CREATE");
  const canManageStatus = hasPermission((user as any).role, "INTERVENTION_EDIT");
  const canDelete = hasPermission((user as any).role, "INTERVENTION_DELETE");

  const serializedInterventions = interventions.map((item) => ({
    id_i: item.id_i,
    zap_st: item.zap_st,
    naslov: item.naslov,
    lokacija: item.lokacija,
    zacetek: item.zacetek ? item.zacetek.toISOString() : null,
    trajanje_ur: item.trajanje_ur != null ? Number(item.trajanje_ur) : null,
    vrsta: item.intervencija_tip?.tip ?? null,
    status: item.status?.ime_statusa ?? null,
    statusId: item.id_s,
  }));

  return (
    <>
      <PageHeader
        title="Seznam intervencij"
        subtitle="Pregled vseh gasilskih intervencij"
        right={
          canCreate ? (
            <Link href="/interventions/new" className="rounded-lg bg-red-600 px-4 py-2 text-sm text-white">
              + Nova intervencija
            </Link>
          ) : null
        }
      />

      <InterventionsTable
        interventions={serializedInterventions}
        statuses={statuses.map((status) => ({ id: status.id_s, label: status.ime_statusa }))}
        canManageStatus={canManageStatus}
        canDelete={canDelete}
      />
    </>
  );
}
