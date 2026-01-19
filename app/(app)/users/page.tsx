import PageHeader from "@/components/common/page-header";
import { prisma } from "@/lib/prisma";
import { getDevGdId } from "@/lib/gd";

export default async function UsersPage() {
  const gdId = getDevGdId();

  const users = await prisma.uporabnik.findMany({
    where: { id_gd: gdId },
    include: { vloga_v_aplikaciji: true },
    orderBy: { ime: "asc" },
  });

  return (
    <>
      <PageHeader
        title="Uporabniki"
        subtitle="Člani tvojega gasilskega društva"
      />

      <div className="rounded-xl border bg-white p-5">
        <div className="mb-4 flex gap-3">
          <input
            className="w-full rounded-lg border px-3 py-2 text-sm"
            placeholder="Iskanje po imenu ali emailu..."
          />
          <button className="rounded-lg border px-3 py-2 text-sm">Vloga</button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-xs text-muted-foreground">
                <th className="py-2 pr-4">Ime</th>
                <th className="py-2 pr-4">Email</th>
                <th className="py-2 pr-4">Vloga v aplikaciji</th>
                <th className="py-2 pr-4">Kreiran</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id_u} className="border-b last:border-b-0">
                  <td className="py-3 pr-4 font-medium">{u.ime}</td>
                  <td className="py-3 pr-4 text-muted-foreground">{u.email}</td>
                  <td className="py-3 pr-4">
                    <span className="inline-flex items-center rounded-full border px-2 py-1 text-xs">
                      {u.vloga_v_aplikaciji.ime}
                    </span>
                  </td>
                  <td className="py-3 pr-4 text-muted-foreground">
                    {u.kreiran ? new Date(u.kreiran).toLocaleDateString("sl-SI") : "—"}
                  </td>
                </tr>
              ))}

              {users.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-10 text-center text-muted-foreground">
                    Ni uporabnikov v bazi za to društvo.
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
