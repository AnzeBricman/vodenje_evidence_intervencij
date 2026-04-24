import { redirect } from "next/navigation";
import PageHeader from "@/components/common/page-header";
import CreateSocietyForm from "@/components/admin/create-society-form";
import CreateSocietyUserForm from "@/components/admin/create-society-user-form";
import { requireUser } from "@/lib/auth-guards";
import { prisma } from "@/lib/prisma";

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
    <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_18px_45px_-32px_rgba(15,23,42,0.24)]">
      <div className="mb-5">
        <h2 className="text-xl font-semibold text-slate-900">{title}</h2>
        {subtitle ? <p className="mt-1 text-sm text-slate-600">{subtitle}</p> : null}
      </div>
      {children}
    </section>
  );
}

export default async function AdminPage() {
  const user = await requireUser();

  if ((user as { role?: string }).role !== "SUPER_ADMIN") {
    redirect("/dashboard");
  }

  const [societies, usersCount] = await Promise.all([
    prisma.gasilni_dom.findMany({
      orderBy: { ime: "asc" },
      include: {
        _count: {
          select: { uporabniki: true },
        },
      },
    }),
    prisma.uporabnik.count(),
  ]);

  type SocietyRow = (typeof societies)[number];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Sistemski panel"
        subtitle="Dodaj društva in začetne uporabnike za posamezno društvo."
      />

      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-3xl border border-red-100 bg-gradient-to-br from-red-50 via-white to-rose-50 p-5 shadow-[0_18px_45px_-32px_rgba(220,38,38,0.3)]">
          <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-red-500">
            Društva
          </div>
          <div className="mt-3 text-4xl font-semibold tracking-tight text-slate-900">
            {societies.length}
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
            Uporabniki
          </div>
          <div className="mt-3 text-4xl font-semibold tracking-tight text-slate-900">
            {usersCount}
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
            Način dela
          </div>
          <div className="mt-3 text-lg font-semibold tracking-tight text-slate-900">
            Sistemska administracija
          </div>
          <p className="mt-2 text-sm text-slate-600">
            Tukaj upravljaš strukturo sistema, ne operativnih evidenc društev.
          </p>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <Panel title="Dodaj društvo" subtitle="Ustvari novo gasilsko društvo v sistemu.">
          <CreateSocietyForm />
        </Panel>

        <Panel
          title="Dodaj uporabnika v društvo"
          subtitle="Ustvari začetni račun in mu določi vlogo znotraj izbranega društva."
        >
          <CreateSocietyUserForm
            societies={societies.map((society: SocietyRow) => ({
              id: society.id_gd,
              label: society.ime,
            }))}
          />
        </Panel>
      </section>

      <Panel title="Obstoječa društva" subtitle="Hiter pregled trenutno dodanih društev.">
        {societies.length === 0 ? (
          <div className="rounded-2xl bg-slate-50 px-4 py-8 text-sm text-slate-500">
            Trenutno še ni nobenega društva.
          </div>
        ) : (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {societies.map((society: SocietyRow) => (
              <div
                key={society.id_gd}
                className="rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-4"
              >
                <div className="text-base font-semibold text-slate-900">{society.ime}</div>
                <div className="mt-2 text-sm text-slate-500">
                  Uporabnikov: {society._count.uporabniki}
                </div>
              </div>
            ))}
          </div>
        )}
      </Panel>
    </div>
  );
}
