"use client";

import Link from "next/link";
import { signIn } from "next-auth/react";
import { useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);

  return (
    <div className="min-h-screen grid place-items-center p-6 bg-[#fafafa]">
      <div className="w-full max-w-sm rounded-xl border bg-white p-6">
          <Link
          href="/"
          className="text-sm text-gray-600 hover:text-gray-900"
        >
          ← Nazaj na domačo
        </Link>

        <h1 className="mt-4 text-xl font-semibold">Prijava</h1>
        <p className="mt-1 text-sm text-gray-500">Vpiši email in geslo.</p>

        <div className="mt-5 space-y-3">
          <input
            className="w-full rounded-lg border px-3 py-2 text-sm"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            className="w-full rounded-lg border px-3 py-2 text-sm"
            placeholder="Geslo"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {err && <div className="text-sm text-red-600">{err}</div>}

          <button
            className="w-full rounded-lg bg-red-600 px-4 py-2 text-sm text-white"
            onClick={async () => {
              setErr(null);
              const res = await signIn("credentials", {
                email,
                password,
                redirect: true,
                callbackUrl: "/dashboard",
              });
              if (res?.error) setErr("Napačen email ali geslo.");
            }}
          >
            Prijava
          </button>

          <div className="text-center">
          </div>
        </div>
      </div>
    </div>
  );
}
