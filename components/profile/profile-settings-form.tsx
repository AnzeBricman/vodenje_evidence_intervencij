"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";

type ProfileSettingsFormProps = {
  name: string;
  email: string;
  role: string;
  societyName: string;
};

export default function ProfileSettingsForm({
  name,
  email,
  role,
  societyName,
}: ProfileSettingsFormProps) {
  const { update } = useSession();

  const [nextEmail, setNextEmail] = useState(email);
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [emailSuccess, setEmailSuccess] = useState<string | null>(null);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);

  const saveEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError(null);
    setEmailSuccess(null);
    setEmailLoading(true);

    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: nextEmail }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Shranjevanje ni uspelo.");

      await update({ email: json.email });
      setEmailSuccess("Email je bil uspešno posodobljen.");
    } catch (err: any) {
      setEmailError(err?.message ?? "Shranjevanje ni uspelo.");
    } finally {
      setEmailLoading(false);
    }
  };

  const savePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(null);

    if (newPassword !== confirmPassword) {
      setPasswordError("Novo geslo in potrditev se ne ujemata.");
      return;
    }

    setPasswordLoading(true);

    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Shranjevanje ni uspelo.");

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setPasswordSuccess("Geslo je bilo uspešno spremenjeno.");
    } catch (err: any) {
      setPasswordError(err?.message ?? "Shranjevanje ni uspelo.");
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
      <section className="rounded-[28px] border border-red-100 bg-gradient-to-br from-white via-white to-red-50/80 p-6 shadow-[0_18px_45px_-28px_rgba(220,38,38,0.35)]">
        <div className="mb-6">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-red-500">
            Moj profil
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-slate-900">{name}</h2>
          <p className="mt-2 text-sm text-slate-600">
            Tukaj urejaš svoje kontaktne podatke in dostop do aplikacije.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4">
            <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Vloga</p>
            <p className="mt-2 text-base font-medium text-slate-900">{role}</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4">
            <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Društvo</p>
            <p className="mt-2 text-base font-medium text-slate-900">{societyName}</p>
          </div>
        </div>
      </section>

      <div className="grid gap-6">
        <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_18px_45px_-32px_rgba(15,23,42,0.25)]">
          <div className="mb-5">
            <h2 className="text-xl font-semibold text-slate-900">Email naslov</h2>
            <p className="mt-1 text-sm text-slate-600">
              Spremeni email, na katerega se prijavljaš v sistem.
            </p>
          </div>

          <form className="grid gap-4" onSubmit={saveEmail}>
            <div className="grid gap-2">
              <label className="text-sm font-medium text-slate-700">Email</label>
              <input
                type="email"
                value={nextEmail}
                onChange={(e) => setNextEmail(e.target.value)}
                className="rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-100"
                required
              />
            </div>

            <div className="flex items-center justify-end">
              <button
                type="submit"
                disabled={emailLoading}
                className="rounded-2xl bg-red-600 px-5 py-3 text-sm font-medium text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-red-300"
              >
                Shrani email
              </button>
            </div>

            {emailError && <p className="text-sm text-red-600">{emailError}</p>}
            {emailSuccess && <p className="text-sm text-emerald-600">{emailSuccess}</p>}
          </form>
        </section>

        <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_18px_45px_-32px_rgba(15,23,42,0.25)]">
          <div className="mb-5">
            <h2 className="text-xl font-semibold text-slate-900">Geslo</h2>
            <p className="mt-1 text-sm text-slate-600">
              Za spremembo gesla vpiši trenutno geslo in nato novo.
            </p>
          </div>

          <form className="grid gap-4" onSubmit={savePassword}>
            <div className="grid gap-2">
              <label className="text-sm font-medium text-slate-700">Trenutno geslo</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-100"
                required
              />
            </div>

            <div className="grid gap-2 sm:grid-cols-2">
              <div className="grid gap-2">
                <label className="text-sm font-medium text-slate-700">Novo geslo</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-100"
                  minLength={6}
                  required
                />
              </div>

              <div className="grid gap-2">
                <label className="text-sm font-medium text-slate-700">Ponovi novo geslo</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-100"
                  minLength={6}
                  required
                />
              </div>
            </div>

            <div className="flex items-center justify-end">
              <button
                type="submit"
                disabled={passwordLoading}
                className="rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-medium text-slate-800 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:text-slate-400"
              >
                Spremeni geslo
              </button>
            </div>

            {passwordError && <p className="text-sm text-red-600">{passwordError}</p>}
            {passwordSuccess && <p className="text-sm text-emerald-600">{passwordSuccess}</p>}
          </form>
        </section>
      </div>
    </div>
  );
}
