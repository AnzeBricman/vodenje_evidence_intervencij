"use client";

import Link from "next/link";
import { useState } from "react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Posiljanje ni uspelo.");

      setSuccess(
        json?.message ?? "Če račun obstaja, smo na email poslali povezavo za ponastavitev gesla.",
      );
      setEmail("");
    } catch (err: any) {
      setError(err?.message ?? "Posiljanje ni uspelo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid min-h-screen place-items-center bg-[#fafafa] p-6">
      <div className="w-full max-w-sm rounded-xl border bg-white p-6">
        <Link href="/login" className="text-sm text-gray-600 hover:text-gray-900">
          ← Nazaj na prijavo
        </Link>

        <h1 className="mt-4 text-xl font-semibold">Pozabljeno geslo</h1>
        <p className="mt-1 text-sm text-gray-500">
          Vpiši email in poslali bomo povezavo za nastavitev novega gesla.
        </p>

        <form className="mt-5 space-y-3" onSubmit={onSubmit}>
          <input
            className="w-full rounded-lg border px-3 py-2 text-sm"
            placeholder="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          {error && <div className="text-sm text-red-600">{error}</div>}
          {success && <div className="text-sm text-emerald-600">{success}</div>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-red-600 px-4 py-2 text-sm text-white disabled:cursor-not-allowed disabled:bg-red-300"
          >
            Pošlji povezavo
          </button>
        </form>
      </div>
    </div>
  );
}
