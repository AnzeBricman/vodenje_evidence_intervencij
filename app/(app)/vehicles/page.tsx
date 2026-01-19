import PageHeader from "@/components/common/page-header";
import { prisma } from "@/lib/prisma";
import { getDevGdId } from "@/lib/gd";

export default async function VehiclesPage() {
  const gdId = getDevGdId();

  const vehicles = await prisma.vozilo.findMany({
    where: { id_gd: gdId },
    include: {
      tip_vozila: true,
      status_vozila: true,
    },
    orderBy: { ime: "asc" },
  });

  return (
    <>
      <PageHeader
        title="Vozila"
        subtitle="Seznam vozil tvojega gasilskega društva"
      />

      <div className="rounded-xl border bg-white p-5">
        <div className="mb-4 flex gap-3">
          <input
            className="w-full rounded-lg border px-3 py-2 text-sm"
            placeholder="Iskanje po imenu, registrski..."
          />
          <button className="rounded-lg border px-3 py-2 text-sm">Status</button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-xs text-muted-foreground">
                <th className="py-2 pr-4">Ime</th>
                <th className="py-2 pr-4">Registrska</th>
                <th className="py-2 pr-4">Tip</th>
                <th className="py-2 pr-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {vehicles.map((v) => (
                <tr key={v.id_v} className="border-b last:border-b-0">
                  <td className="py-3 pr-4 font-medium">{v.ime}</td>
                  <td className="py-3 pr-4 text-muted-foreground">
                    {v.registrska_st ?? "—"}
                  </td>
                  <td className="py-3 pr-4">{v.tip_vozila.ime_tipa}</td>
                  <td className="py-3 pr-4">
                    <span className="inline-flex items-center rounded-full border px-2 py-1 text-xs">
                      {v.status_vozila.ime_statusa}
                    </span>
                  </td>
                </tr>
              ))}

              {vehicles.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-10 text-center text-muted-foreground">
                    Ni vozil v bazi za to društvo.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
