"use client";

import { Search } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { formatDurationHours } from "@/lib/format-duration";

type InterventionRow = {
  id_i: number;
  zap_st: string;
  naslov: string;
  lokacija: string | null;
  zacetek: string | null;
  trajanje_ur: number | null;
  vrsta: string | null;
  status: string | null;
  statusId: number;
};

type StatusOption = {
  id: number;
  label: string;
};

type InterventionsTableProps = {
  interventions: InterventionRow[];
  statuses: StatusOption[];
  canManageStatus: boolean;
  canDelete: boolean;
};

function formatDateTime(value: string | null) {
  if (!value) return "—";

  return new Intl.DateTimeFormat("sl-SI", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export default function InterventionsTable({
  interventions,
  statuses,
  canManageStatus,
  canDelete,
}: InterventionsTableProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [busyId, setBusyId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const filteredInterventions = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return interventions;

    return interventions.filter((item) => {
      const ref = item.zap_st.toLowerCase();
      const title = item.naslov.toLowerCase();
      const location = item.lokacija?.toLowerCase() ?? "";

      return (
        ref.includes(normalizedQuery) ||
        title.includes(normalizedQuery) ||
        location.includes(normalizedQuery)
      );
    });
  }, [interventions, query]);

  const updateStatus = async (interventionId: number, statusId: number) => {
    setBusyId(interventionId);
    setError(null);

    try {
      const res = await fetch(`/api/interventions/${interventionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ statusId }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Posodobitev statusa ni uspela.");

      router.refresh();
    } catch (err: any) {
      setError(err?.message ?? String(err));
    } finally {
      setBusyId(null);
    }
  };

  const deleteIntervention = async (interventionId: number) => {
    const confirmed = window.confirm("Ali res želiš izbrisati to intervencijo?");
    if (!confirmed) return;

    setBusyId(interventionId);
    setError(null);

    try {
      const res = await fetch(`/api/interventions/${interventionId}`, {
        method: "DELETE",
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Brisanje intervencije ni uspelo.");

      router.refresh();
    } catch (err: any) {
      setError(err?.message ?? String(err));
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
      <div className="border-b border-gray-100 bg-gradient-to-r from-white to-gray-50 px-6 py-5">
        <div className="relative max-w-xl">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-3 text-sm shadow-sm outline-none transition focus:border-red-300 focus:ring-2 focus:ring-red-100"
            placeholder="Iskanje po naslovu, številki ali lokaciji..."
          />
        </div>
      </div>

      <div className="overflow-x-auto px-4 py-4">
        <table className="w-full border-separate border-spacing-y-2 text-sm">
          <thead>
            <tr className="text-left text-[11px] font-semibold uppercase tracking-[0.14em] text-gray-500">
              <th className="px-4 py-2">Št.</th>
              <th className="px-4 py-2">Naslov</th>
              <th className="px-4 py-2">Lokacija</th>
              <th className="px-4 py-2">Vrsta</th>
              <th className="px-4 py-2">Začetek</th>
              <th className="px-4 py-2">Trajanje</th>
              <th className="px-4 py-2">Status</th>
              {canDelete ? <th className="px-4 py-2 text-right">Akcije</th> : null}
            </tr>
          </thead>
          <tbody>
            {filteredInterventions.map((item) => (
              <tr
                key={item.id_i}
                className="bg-gray-50/80 shadow-sm ring-1 ring-gray-100 transition hover:bg-white hover:ring-red-100"
              >
                <td className="rounded-l-xl px-4 py-4 font-medium">
                  <Link href={`/interventions/${item.id_i}`} className="text-blue-600 hover:underline">
                    {item.zap_st}
                  </Link>
                </td>
                <td className="px-4 py-4 font-medium text-gray-900">{item.naslov}</td>
                <td className="px-4 py-4 text-gray-500">{item.lokacija ?? "—"}</td>
                <td className="px-4 py-4">{item.vrsta ?? "—"}</td>
                <td className="px-4 py-4 text-gray-500">{formatDateTime(item.zacetek)}</td>
                <td className="px-4 py-4 text-gray-500">{formatDurationHours(item.trajanje_ur)}</td>
                <td className="px-4 py-4">
                  {canManageStatus ? (
                    <select
                      className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs shadow-sm"
                      value={item.statusId}
                      disabled={busyId === item.id_i}
                      onChange={(e) => updateStatus(item.id_i, Number(e.target.value))}
                    >
                      {statuses.map((status) => (
                        <option key={status.id} value={status.id}>
                          {status.label}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <span className="inline-flex items-center rounded-full border border-gray-200 bg-white px-2.5 py-1 text-xs">
                      {item.status ?? "—"}
                    </span>
                  )}
                </td>
                {canDelete ? (
                  <td className="rounded-r-xl px-4 py-4 text-right">
                    <button
                      type="button"
                      disabled={busyId === item.id_i}
                      onClick={() => deleteIntervention(item.id_i)}
                      className="rounded-lg border border-red-200 bg-white px-3 py-2 text-xs font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Izbriši
                    </button>
                  </td>
                ) : null}
              </tr>
            ))}

            {filteredInterventions.length === 0 && (
              <tr>
                <td
                  colSpan={canDelete ? 8 : 7}
                  className="py-12 text-center text-sm text-gray-500"
                >
                  {interventions.length === 0
                    ? "Ni intervencij v bazi."
                    : "Ni zadetkov za iskani niz."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {error ? <div className="px-6 pb-5 text-sm text-red-600">{error}</div> : null}
    </div>
  );
}
