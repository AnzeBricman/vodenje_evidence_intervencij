import PageHeader from "@/components/common/page-header";

export default function DashboardPage() {
  return (
    <>
      <PageHeader title="Nadzorna plošča" />

      <div className="grid gap-6">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard title="Aktivne intervencije" />
          <StatCard title="Zaključene ta mesec" />
          <StatCard title="Skupne ure" />
          <StatCard title="Aktivni člani" />
        </div>

        <div className="grid gap-6 xl:grid-cols-3">
          <div className="xl:col-span-2 rounded-xl border bg-white p-5">
            Zadnje intervencije
          </div>
          <div className="rounded-xl border bg-white p-5">
            Vrste intervencij
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-3">
          <div className="hidden xl:block xl:col-span-2" />
          <div className="rounded-xl border bg-white p-5">
            Opozorila
          </div>
        </div>
      </div>
    </>
  );
}

function StatCard({ title }: { title: string }) {
  return (
    <div className="rounded-xl border bg-white p-5">
      <div className="text-sm text-gray-600">{title}</div>
      <div className="mt-2 text-2xl font-semibold">—</div>
    </div>
  );
}
