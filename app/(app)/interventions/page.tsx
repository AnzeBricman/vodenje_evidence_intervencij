import PageHeader from "@/components/common/page-header";

export default function InterventionsPage() {
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
          <button className="rounded-lg border px-3 py-2 text-sm">Vsi statusi</button>
          <button className="rounded-lg border px-3 py-2 text-sm">📅</button>
        </div>

        <div className="text-sm text-muted-foreground">
          (Tukaj pride tabela intervencij)
        </div>
      </div>
    </>
  );
}
