"use client";

import { ChevronDown, Search } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type EquipmentRow = {
  id_o: number;
  ime_opreme: string;
  kategorija: string;
  stanje: string;
  stanjeId: number;
  ustvarjeno: string | null;
  serijska_st: string | null;
};

type StateOption = {
  id: number;
  label: string;
};

type EquipmentTableProps = {
  equipment: EquipmentRow[];
  canManageEquipment: boolean;
  states: StateOption[];
};

export default function EquipmentTable({
  equipment,
  canManageEquipment,
  states,
}: EquipmentTableProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [busyId, setBusyId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const filteredEquipment = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) return equipment;

    return equipment.filter((item) => {
      const name = item.ime_opreme.toLowerCase();
      const serial = item.serijska_st?.toLowerCase() ?? "";
      return name.includes(normalizedQuery) || serial.includes(normalizedQuery);
    });
  }, [equipment, query]);

  const updateState = async (equipmentId: number, stateId: number) => {
    setBusyId(equipmentId);
    setError(null);

    try {
      const res = await fetch(`/api/equipment/${equipmentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stateId }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Posodobitev stanja ni uspela.");

      router.refresh();
    } catch (err: any) {
      setError(err?.message ?? String(err));
    } finally {
      setBusyId(null);
    }
  };

  const deleteEquipment = async (equipmentId: number, equipmentName: string) => {
    const confirmed = window.confirm(`Ali res želiš izbrisati opremo ${equipmentName}?`);
    if (!confirmed) return;

    setBusyId(equipmentId);
    setError(null);

    try {
      const res = await fetch(`/api/equipment/${equipmentId}`, {
        method: "DELETE",
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Brisanje opreme ni uspelo.");

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
            placeholder="Iskanje po nazivu ali serijski..."
          />
        </div>
      </div>

      <div className="overflow-x-auto px-4 py-4">
        <table className="w-full border-separate border-spacing-y-2 text-sm">
          <thead>
            <tr className="text-left text-[11px] font-semibold uppercase tracking-[0.14em] text-gray-500">
              <th className="px-4 py-2">Naziv</th>
              <th className="px-4 py-2">Kategorija</th>
              <th className="px-4 py-2">Stanje</th>
              <th className="px-4 py-2">Dodano</th>
              {canManageEquipment ? <th className="px-4 py-2 text-right">Akcije</th> : null}
            </tr>
          </thead>
          <tbody>
            {filteredEquipment.map((item: EquipmentRow) => (
              <tr
                key={item.id_o}
                className="bg-gray-50/80 shadow-sm ring-1 ring-gray-100 transition hover:bg-white hover:ring-red-100"
              >
                <td className="rounded-l-xl px-4 py-4 font-medium text-gray-900">
                  <Link href={`/equipment/${item.id_o}`} className="block">
                    {item.ime_opreme}
                  </Link>
                </td>
                <td className="px-4 py-4">{item.kategorija}</td>
                <td className="px-4 py-4">
                  {canManageEquipment ? (
                    <div className="relative inline-block min-w-40">
                      <select
                        className="w-full appearance-none rounded-lg border border-gray-200 bg-white px-3 py-1.5 pr-8 text-xs cursor-pointer shadow-sm"
                        value={item.stanjeId}
                        disabled={busyId === item.id_o}
                        onChange={(e) => updateState(item.id_o, Number(e.target.value))}
                      >
                        {states.map((state: StateOption) => (
                          <option key={state.id} value={state.id}>
                            {state.label}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-500" />
                    </div>
                  ) : (
                    <span className="inline-flex items-center rounded-full border border-gray-200 bg-white px-2.5 py-1 text-xs">
                      {item.stanje}
                    </span>
                  )}
                </td>
                <td className="px-4 py-4 text-gray-500">
                  {item.ustvarjeno
                    ? new Date(item.ustvarjeno).toLocaleDateString("sl-SI")
                    : "—"}
                </td>
                {canManageEquipment ? (
                  <td className="rounded-r-xl px-4 py-4 text-right">
                    <button
                      type="button"
                      disabled={busyId === item.id_o}
                      onClick={() => deleteEquipment(item.id_o, item.ime_opreme)}
                      className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-700 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:border-gray-200 disabled:text-gray-400"
                    >
                      Izbriši
                    </button>
                  </td>
                ) : null}
              </tr>
            ))}

            {filteredEquipment.length === 0 && (
              <tr>
                <td
                  colSpan={canManageEquipment ? 5 : 4}
                  className="py-12 text-center text-sm text-gray-500"
                >
                  {equipment.length === 0
                    ? "Ni opreme v bazi za to društvo."
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
