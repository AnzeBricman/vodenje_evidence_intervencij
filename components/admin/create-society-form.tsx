"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CreateSocietyForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch("/api/admin/societies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Napaka.");

      setName("");
      setSuccess(`Društvo ${json.society.ime} je bilo dodano.`);
      router.refresh();
    } catch (err: any) {
      setError(err?.message ?? "Dodajanje ni uspelo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="grid gap-4">
      <div className="grid gap-2">
        <label className="text-sm font-medium text-slate-700">Ime društva</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="PGD Primer"
          className="rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-100"
          required
        />
      </div>

      <div className="flex items-center justify-end">
        <button
          type="submit"
          disabled={loading}
          className="rounded-2xl bg-red-600 px-5 py-3 text-sm font-medium text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-red-300"
        >
          Dodaj društvo
        </button>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
      {success && <p className="text-sm text-emerald-600">{success}</p>}
    </form>
  );
}
