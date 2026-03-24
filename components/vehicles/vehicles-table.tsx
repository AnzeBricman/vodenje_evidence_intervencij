"use client";

import { Search } from "lucide-react";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type VehicleRow = {
  id_v: number;
  ime: string;
  registrska_st: string | null;
  tip: string;
  status: string;
  statusId: number;
  ustvarjeno: string | null;
};

type VehicleStatusOption = {
  id: number;
  label: string;
};

type VehiclesTableProps = {
  vehicles: VehicleRow[];
  canManageVehicles: boolean;
  vehicleStatuses: VehicleStatusOption[];
};

export default function VehiclesTable({
  vehicles,
  canManageVehicles,
  vehicleStatuses,
}: VehiclesTableProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [busyId, setBusyId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const filteredVehicles = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) return vehicles;

    return vehicles.filter((vehicle) => {
      const name = vehicle.ime.toLowerCase();
      const registration = vehicle.registrska_st?.toLowerCase() ?? "";
      return name.includes(normalizedQuery) || registration.includes(normalizedQuery);
    });
  }, [query, vehicles]);

  const updateStatus = async (vehicleId: number, statusId: number) => {
    setBusyId(vehicleId);
    setError(null);

    try {
      const res = await fetch(`/api/vehicles/${vehicleId}`, {
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

  const deleteVehicle = async (vehicleId: number, vehicleName: string) => {
    const confirmed = window.confirm(`Ali res želiš izbrisati vozilo ${vehicleName}?`);
    if (!confirmed) return;

    setBusyId(vehicleId);
    setError(null);

    try {
      const res = await fetch(`/api/vehicles/${vehicleId}`, {
        method: "DELETE",
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Brisanje vozila ni uspelo.");

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
            placeholder="Iskanje po imenu ali registrski..."
          />
        </div>
      </div>

      <div className="overflow-x-auto px-4 py-4">
        <table className="w-full border-separate border-spacing-y-2 text-sm">
          <thead>
            <tr className="text-left text-[11px] font-semibold uppercase tracking-[0.14em] text-gray-500">
              <th className="px-4 py-2">Ime</th>
              <th className="px-4 py-2">Registrska</th>
              <th className="px-4 py-2">Tip</th>
              <th className="px-4 py-2">Status</th>
              <th className="px-4 py-2">Dodano</th>
              {canManageVehicles ? <th className="px-4 py-2 text-right">Akcije</th> : null}
            </tr>
          </thead>
          <tbody>
            {filteredVehicles.map((v) => (
              <tr
                key={v.id_v}
                className="bg-gray-50/80 shadow-sm ring-1 ring-gray-100 transition hover:bg-white hover:ring-red-100"
              >
                <td className="rounded-l-xl px-4 py-4 font-medium text-gray-900">{v.ime}</td>
                <td className="px-4 py-4 text-gray-500">{v.registrska_st ?? "—"}</td>
                <td className="px-4 py-4">{v.tip}</td>
                <td className="px-4 py-4">
                  {canManageVehicles ? (
                    <select
                      className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs shadow-sm"
                      value={v.statusId}
                      disabled={busyId === v.id_v}
                      onChange={(e) => updateStatus(v.id_v, Number(e.target.value))}
                    >
                      {vehicleStatuses.map((status) => (
                        <option key={status.id} value={status.id}>
                          {status.label}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <span className="inline-flex items-center rounded-full border border-gray-200 bg-white px-2.5 py-1 text-xs">
                      {v.status}
                    </span>
                  )}
                </td>
                <td className="px-4 py-4 text-gray-500">
                  {v.ustvarjeno ? new Date(v.ustvarjeno).toLocaleDateString("sl-SI") : "—"}
                </td>
                {canManageVehicles ? (
                  <td className="rounded-r-xl px-4 py-4 text-right">
                    <button
                      type="button"
                      disabled={busyId === v.id_v}
                      onClick={() => deleteVehicle(v.id_v, v.ime)}
                      className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-700 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:border-gray-200 disabled:text-gray-400"
                    >
                      Izbriši
                    </button>
                  </td>
                ) : null}
              </tr>
            ))}

            {filteredVehicles.length === 0 && (
              <tr>
                <td
                  colSpan={canManageVehicles ? 6 : 5}
                  className="py-12 text-center text-sm text-gray-500"
                >
                  {vehicles.length === 0
                    ? "Ni vozil v bazi za to društvo."
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
