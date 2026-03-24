"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Option = {
  id: number;
  label: string;
};

type CreateEquipmentFormProps = {
  categories: Option[];
  states: Option[];
};

export default function CreateEquipmentForm({
  categories,
  states,
}: CreateEquipmentFormProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [serialNumber, setSerialNumber] = useState("");
  const [hourlyRate, setHourlyRate] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState(categories[0]?.id?.toString() ?? "");
  const [stateId, setStateId] = useState(states[0]?.id?.toString() ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reset = () => {
    setName("");
    setSerialNumber("");
    setHourlyRate("");
    setDescription("");
    setCategoryId(categories[0]?.id?.toString() ?? "");
    setStateId(states[0]?.id?.toString() ?? "");
    setError(null);
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/equipment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          serialNumber,
          hourlyRate,
          description,
          categoryId: Number(categoryId),
          stateId: Number(stateId),
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Napaka");

      reset();
      setOpen(false);
      router.refresh();
    } catch (err: any) {
      setError(err?.message ?? String(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="rounded-lg border bg-white px-3 py-2 text-sm"
        aria-haspopup="dialog"
      >
        Dodaj
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/40 transition-opacity"
            onClick={() => setOpen(false)}
            aria-hidden
          />

          <div className="relative w-full max-w-lg rounded-lg bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold">Dodaj novo opremo</h3>
              <button
                onClick={() => setOpen(false)}
                aria-label="Zapri"
                className="-mr-2 rounded p-1 text-muted-foreground hover:bg-muted"
              >
                ×
              </button>
            </div>

            <form onSubmit={onSubmit} className="grid gap-3">
              <label className="text-sm">Naziv opreme</label>
              <input
                className="rounded-lg border px-3 py-2 text-sm"
                placeholder="Naziv opreme"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />

              <label className="text-sm">Serijska številka</label>
              <input
                className="rounded-lg border px-3 py-2 text-sm"
                placeholder="Serijska številka"
                value={serialNumber}
                onChange={(e) => setSerialNumber(e.target.value)}
              />

              <label className="text-sm">Cena na uro</label>
              <input
                className="rounded-lg border px-3 py-2 text-sm"
                placeholder="npr. 10.00"
                type="number"
                min="0"
                step="0.01"
                value={hourlyRate}
                onChange={(e) => setHourlyRate(e.target.value)}
                required
              />

              <label className="text-sm">Kategorija</label>
              <select
                className="rounded-lg border px-3 py-2 text-sm"
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                required
              >
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.label}
                  </option>
                ))}
              </select>

              <label className="text-sm">Stanje</label>
              <select
                className="rounded-lg border px-3 py-2 text-sm"
                value={stateId}
                onChange={(e) => setStateId(e.target.value)}
                required
              >
                {states.map((state) => (
                  <option key={state.id} value={state.id}>
                    {state.label}
                  </option>
                ))}
              </select>

              <label className="text-sm">Opis</label>
              <textarea
                className="min-h-24 rounded-lg border px-3 py-2 text-sm"
                placeholder="Kratek opis opreme"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />

              <div className="mt-4 flex items-center justify-end gap-2">
                <button
                  type="button"
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-50"
                  onClick={() => {
                    reset();
                    setOpen(false);
                  }}
                >
                  Prekliči
                </button>

                <button
                  className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-red-300"
                  disabled={loading}
                  type="submit"
                >
                  Dodaj
                </button>
              </div>

              {error ? <div className="mt-2 text-sm text-destructive">{error}</div> : null}
            </form>
          </div>
        </div>
      )}
    </>
  );
}
