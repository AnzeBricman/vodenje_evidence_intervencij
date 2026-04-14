"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!token) {
      setError("Povezava za ponastavitev ni veljavna.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Novo geslo in potrditev se ne ujemata.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Ponastavitev gesla ni uspela.");

      setSuccess("Geslo je bilo uspešno nastavljeno. Preusmerjam na prijavo...");
      setPassword("");
      setConfirmPassword("");
      setTimeout(() => router.push("/login"), 1200);
    } catch (err: any) {
      setError(err?.message ?? "Ponastavitev gesla ni uspela.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-sm rounded-xl border bg-white p-6">
      <Link href="/login" className="text-sm text-gray-600 hover:text-gray-900">
        ← Nazaj na prijavo
      </Link>

      <h1 className="mt-4 text-xl font-semibold">Nastavi novo geslo</h1>
      <p className="mt-1 text-sm text-gray-500">
        Izberi novo geslo za svoj račun. Povezava velja samo enkrat.
      </p>

      <form className="mt-5 space-y-3" onSubmit={onSubmit}>
        <input
          className="w-full rounded-lg border px-3 py-2 text-sm"
          placeholder="Novo geslo"
          type="password"
          minLength={6}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <input
          className="w-full rounded-lg border px-3 py-2 text-sm"
          placeholder="Ponovi novo geslo"
          type="password"
          minLength={6}
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />

        {error && <div className="text-sm text-red-600">{error}</div>}
        {success && <div className="text-sm text-emerald-600">{success}</div>}

        <button
          type="submit"
          disabled={loading || !token}
          className="w-full rounded-lg bg-red-600 px-4 py-2 text-sm text-white disabled:cursor-not-allowed disabled:bg-red-300"
        >
          Nastavi novo geslo
        </button>
      </form>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="grid min-h-screen place-items-center bg-[#fafafa] p-6">
      <Suspense fallback={<div className="text-sm text-slate-500">Nalagam...</div>}>
        <ResetPasswordContent />
      </Suspense>
    </div>
  );
}
