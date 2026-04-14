"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { useState } from "react";

type SignInResult = {
  error?: string | null;
  url?: string | null;
};

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);

  return (
    <div className="grid min-h-screen place-items-center bg-[#fafafa] p-6">
      <div className="w-full max-w-sm rounded-xl border bg-white p-6">
        <Link href="/" className="text-sm text-gray-600 hover:text-gray-900">
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

          <div className="flex justify-end">
            <Link href="/forgot-password" className="text-sm text-red-600 hover:text-red-700">
              Pozabljeno geslo?
            </Link>
          </div>

          {err && <div className="text-sm text-red-600">{err}</div>}

          <button
            className="w-full rounded-lg bg-red-600 px-4 py-2 text-sm text-white"
            onClick={async () => {
              setErr(null);

              const res = (await signIn("credentials", {
                email,
                password,
                redirect: false,
                callbackUrl: "/post-login",
              })) as SignInResult | undefined;

              if (res?.error) {
                setErr("Email ne obstaja ali pa je geslo napačno.");
                return;
              }

              router.push(res?.url ?? "/post-login");
            }}
          >
            Prijava
          </button>
        </div>
      </div>
    </div>
  );
}
