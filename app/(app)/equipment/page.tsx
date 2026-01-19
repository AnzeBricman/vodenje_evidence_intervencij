import PageHeader from "@/components/common/page-header";
import { prisma } from "@/lib/prisma";
import { getDevGdId } from "@/lib/gd";

export default async function EquipmentPage() {
  const gdId = getDevGdId();

  const equipment = await prisma.oprema.findMany({
    where: { id_gd: gdId },
    include: {
      kategorija_oprema: true,
      stanje_opreme: true,
    },
    orderBy: { ime_opreme: "asc" },
  });

  return (
    <>
      <PageHeader
        title="Oprema"
        subtitle="Seznam opreme tvojega gasilskega društva"
      />

      <div className="rounded-xl border bg-white p-5">
        <div className="mb-4 flex gap-3">
          <input
            className="w-full rounded-lg border px-3 py-2 text-sm"
            placeholder="Iskanje po nazivu opreme..."
          />
          <button className="rounded-lg border px-3 py-2 text-sm">Kategorija</button>
          <button className="rounded-lg border px-3 py-2 text-sm">Stanje</button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-xs text-muted-foreground">
                <th className="py-2 pr-4">Naziv</th>
                <th className="py-2 pr-4">Kategorija</th>
                <th className="py-2 pr-4">Stanje</th>
                <th className="py-2 pr-4">Ustvarjeno</th>
              </tr>
            </thead>
            <tbody>
              {equipment.map((o) => (
                <tr key={o.id_o} className="border-b last:border-b-0">
                  <td className="py-3 pr-4 font-medium">{o.ime_opreme}</td>
                  <td className="py-3 pr-4">{o.kategorija_oprema.ime_kategorije}</td>
                  <td className="py-3 pr-4">
                    <span className="inline-flex items-center rounded-full border px-2 py-1 text-xs">
                      {o.stanje_opreme.ime_stanja}
                    </span>
                  </td>
                  <td className="py-3 pr-4 text-muted-foreground">
                    {o.ustvarjeno ? new Date(o.ustvarjeno).toLocaleDateString("sl-SI") : "—"}
                  </td>
                </tr>
              ))}

              {equipment.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-10 text-center text-muted-foreground">
                    Ni opreme v bazi za to društvo.
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
