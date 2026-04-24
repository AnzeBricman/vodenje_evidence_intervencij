import Link from "next/link";
import ContactForm from "@/components/marketing/contact-form";

const features = [
  {
    title: "Evidenca intervencij",
    text: "Celoten pregled vseh gasilskih intervencij s podrobnostmi.",
  },
  {
    title: "Upravljanje opreme",
    text: "Šifrant gasilske opreme in spremljanje vzdrževanja.",
  },
  {
    title: "Evidenca vozil",
    text: "Pregled gasilskih vozil, kilometrov in servisov.",
  },
  {
    title: "Statistika in stroški",
    text: "Analiza ur, stroškov in ključnih kazalnikov.",
  },
];

type Feature = (typeof features)[number];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#fafafa] px-5 py-16">
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center">
        <section className="w-full max-w-4xl">
          <div className="rounded-[28px] border border-slate-200 bg-white px-8 py-12 text-center shadow-[0_24px_50px_-34px_rgba(15,23,42,0.28)] sm:px-12">
            <div className="inline-flex rounded-full border border-red-100 bg-red-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-red-600">
              Evidenca intervencij
            </div>

            <h1 className="mt-6 text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">
              Vodenje evidenc gasilskih
              <br />
              intervencij
            </h1>

            <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
              Sodobna spletna aplikacija za pregledno vodenje intervencij, opreme,
              vozil in sodelujočih članov gasilskih društev.
            </p>

            <div className="mt-8">
              <Link
                href="/post-login"
                className="inline-flex items-center justify-center rounded-2xl bg-red-600 px-6 py-3 text-sm font-medium text-white transition hover:bg-red-700"
              >
                Prijava v sistem
              </Link>
            </div>

            <p className="mt-4 text-sm text-slate-500">
              Za pooblaščene člane gasilskih društev
            </p>
          </div>
        </section>

        <section className="mt-10 grid w-full max-w-5xl gap-6 md:grid-cols-2 xl:grid-cols-4">
          {features.map((feature: Feature) => (
            <article
              key={feature.title}
              className="rounded-3xl border border-slate-200 bg-white p-6 text-center shadow-[0_18px_40px_-34px_rgba(15,23,42,0.22)]"
            >
              <h2 className="text-base font-semibold text-slate-900">{feature.title}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">{feature.text}</p>
            </article>
          ))}
        </section>

        <section className="mt-12 grid w-full max-w-5xl gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-[28px] border border-slate-200 bg-white p-8 shadow-[0_18px_40px_-34px_rgba(15,23,42,0.22)]">
            <div className="inline-flex rounded-full border border-red-100 bg-red-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-red-600">
              Kontakt
            </div>
            <h2 className="mt-5 text-3xl font-semibold tracking-tight text-slate-900">
              Imaš vprašanje ali želiš predstavitev?
            </h2>
            <p className="mt-4 text-sm leading-7 text-slate-600 sm:text-base">
              Piši nam, če želiš predstavitev sistema, pomoč pri postavitvi ali
              dodatne informacije za svoje društvo.
            </p>

            <div className="mt-8 space-y-4 text-sm text-slate-600">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                <p className="font-medium text-slate-900">Hitri odgovor</p>
                <p className="mt-1">Odgovorimo na osnovna vprašanja in pomagamo pri zagonu.</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                <p className="font-medium text-slate-900">Predstavitev za društvo</p>
                <p className="mt-1">Lahko se dogovorimo za kratek pregled funkcionalnosti.</p>
              </div>
            </div>
          </div>

          <div className="rounded-[28px] border border-slate-200 bg-white p-8 shadow-[0_18px_40px_-34px_rgba(15,23,42,0.22)]">
            <h2 className="text-2xl font-semibold text-slate-900">Pošlji sporočilo</h2>
            <p className="mt-2 text-sm text-slate-600">
              Izpolni obrazec in odgovorili bomo na vpisani email.
            </p>

            <div className="mt-6">
              <ContactForm />
            </div>
          </div>
        </section>

        <footer className="mt-12 text-sm text-slate-500">
          © 2026 Gasilstvo - Evidenca intervencij
          <span className="text-slate-300"> • Phase 2</span>
        </footer>
      </div>
    </main>
  );
}
