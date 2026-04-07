"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ROLE_LABEL, ROLES } from "@/lib/roles";

type SocietyOption = {
  id: number;
  label: string;
};

export default function CreateSocietyUserForm({
  societies,
}: {
  societies: SocietyOption[];
}) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<string>(ROLES.ADMIN);
  const [societyId, setSocietyId] = useState<string>(societies[0]?.id ? String(societies[0].id) : "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const roleOptions = [ROLES.ADMIN, ROLES.POVELJNIK, ROLES.CLAN, ROLES.UPORABNIK];

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          password,
          role,
          id_gd: Number(societyId),
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Napaka.");

      setName("");
      setEmail("");
      setPassword("");
      setRole(ROLES.ADMIN);
      setSuccess(`Uporabnik ${json.user.ime} je bil dodan.`);
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
        <label className="text-sm font-medium text-slate-700">Društvo</label>
        <select
          value={societyId}
          onChange={(e) => setSocietyId(e.target.value)}
          className="rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-100"
          required
        >
          {societies.map((society) => (
            <option key={society.id} value={society.id}>
              {society.label}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-2">
          <label className="text-sm font-medium text-slate-700">Ime in priimek</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-100"
            required
          />
        </div>
        <div className="grid gap-2">
          <label className="text-sm font-medium text-slate-700">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-100"
            required
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-2">
          <label className="text-sm font-medium text-slate-700">Začasno geslo</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-100"
            minLength={6}
            required
          />
        </div>
        <div className="grid gap-2">
          <label className="text-sm font-medium text-slate-700">Vloga</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-100"
          >
            {roleOptions.map((roleOption) => (
              <option key={roleOption} value={roleOption}>
                {ROLE_LABEL[roleOption]}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex items-center justify-end">
        <button
          type="submit"
          disabled={loading || societies.length === 0}
          className="rounded-2xl bg-red-600 px-5 py-3 text-sm font-medium text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-red-300"
        >
          Dodaj uporabnika
        </button>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
      {success && <p className="text-sm text-emerald-600">{success}</p>}
      {societies.length === 0 && (
        <p className="text-sm text-slate-500">
          Najprej dodaj vsaj eno društvo, nato lahko vanj dodaš uporabnika.
        </p>
      )}
    </form>
  );
}
