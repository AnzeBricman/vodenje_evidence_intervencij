import PageHeader from "@/components/common/page-header";

export default function DashboardPage() {
  return (
    <>
      <PageHeader title="Nadzorna plošča" />
      <div className="grid gap-6">
        <div className="grid grid-cols-4 gap-4">
          <div className="rounded-xl border bg-white p-5">Aktivne intervencije</div>
          <div className="rounded-xl border bg-white p-5">Zaključene ta mesec</div>
          <div className="rounded-xl border bg-white p-5">Skupne ure</div>
          <div className="rounded-xl border bg-white p-5">Aktivni člani</div>
        </div>

        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2 rounded-xl border bg-white p-5">Zadnje intervencije</div>
          <div className="rounded-xl border bg-white p-5">Vrste intervencij</div>
        </div>

        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2" />
          <div className="rounded-xl border bg-white p-5">Opozorila</div>
        </div>
      </div>
    </>
  );
}
