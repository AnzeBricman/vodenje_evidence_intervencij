"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ROLE_LABEL, ROLES, type Role } from "@/lib/roles";

export default function CreateUserForm() {
  const router = useRouter();
  const roleOptions = [ROLES.ADMIN, ROLES.UPORABNIK];
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<string>(ROLES.UPORABNIK);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reset = () => {
    setName("");
    setEmail("");
    setRole(ROLES.UPORABNIK);
    setError(null);
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, role }),
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
              <h3 className="text-lg font-semibold">Dodaj novega uporabnika</h3>
              <button
                onClick={() => setOpen(false)}
                aria-label="Zapri"
                className="-mr-2 rounded p-1 text-muted-foreground hover:bg-muted"
              >
                ×
              </button>
            </div>

            <form onSubmit={onSubmit} className="grid gap-3">
              <label className="text-sm">Ime in priimek</label>
              <input
                className="rounded-lg border px-3 py-2 text-sm"
                placeholder="Ime in priimek"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />

              <label className="text-sm">Email</label>
              <input
                className="rounded-lg border px-3 py-2 text-sm"
                placeholder="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              <label className="text-sm">Vloga</label>
              <select
                className="rounded-lg border px-3 py-2 text-sm"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                {roleOptions.map((roleOption: Role) => (
                  <option key={roleOption} value={roleOption}>
                    {ROLE_LABEL[roleOption]}
                  </option>
                ))}
              </select>

              <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-700">
                Sistem bo ustvaril naključno začasno geslo in ga poslal na vpisani email.
              </div>

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

              {error && <div className="mt-2 text-sm text-destructive">{error}</div>}
            </form>
          </div>
        </div>
      )}
    </>
  );
}
