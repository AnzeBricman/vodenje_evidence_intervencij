"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, ClipboardList, Wrench, Truck, Users, Shield } from "lucide-react";
import { signOut, useSession } from "next-auth/react";

const nav = [
  { href: "/dashboard", label: "Nadzorna plošča", icon: Home },
  { href: "/interventions", label: "Intervencije", icon: ClipboardList },
  { href: "/equipment", label: "Oprema", icon: Wrench },
  { href: "/vehicles", label: "Vozila", icon: Truck },
  { href: "/users", label: "Uporabniki", icon: Users },
] as const;

const superAdminNav = [{ href: "/admin", label: "Sistemski panel", icon: Shield }] as const;

function initials(name?: string | null) {
  const n = (name ?? "").trim();
  if (!n) return "??";
  const parts = n.split(/\s+/).filter(Boolean);
  const first = parts[0]?.[0] ?? "?";
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (first + last).toUpperCase();
}

function roleLabel(role?: string | null) {
  switch ((role ?? "").toUpperCase()) {
    case "SUPER_ADMIN":
      return "Super admin";
    case "ADMIN":
      return "Administrator";
    case "UPORABNIK":
      return "Uporabnik";
    default:
      return role ?? "—";
  }
}

export default function Sidebar() {
  const pathname = usePathname();
  const { data: session, status } = useSession();

  const userName = session?.user?.name ?? session?.user?.email ?? "Uporabnik";
  const userRole = (session?.user as any)?.role as string | undefined;
  const isSuperAdmin = (userRole ?? "").toUpperCase() === "SUPER_ADMIN";
  const societyName = isSuperAdmin
    ? "Sistemski nivo"
    : session?.user?.gd_name?.trim() || "Gasilstvo";

  const canSeeUsers =
    isSuperAdmin || (userRole ?? "").toUpperCase() === "ADMIN";

  return (
    <div className="flex h-screen flex-col bg-white">
      <div className="border-b border-red-100/70 px-6 pb-5 pt-6">
        <div className="flex items-center">
          <div>
            <div className="text-[15px] font-semibold tracking-tight text-slate-900">
              {status === "loading" ? "Nalagam..." : societyName}
            </div>
            <div className="mt-0.5 text-[11px] font-medium uppercase tracking-[0.22em] text-slate-500">
              Intervencije
            </div>
          </div>
        </div>
      </div>

      <nav className="space-y-1 px-4 py-4">
        {(isSuperAdmin ? superAdminNav : nav)
          .filter((item) => {
            if (item.href === "/users") return canSeeUsers;
            return true;
          })
          .map((item) => {
            const active = pathname.startsWith(item.href);
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={[
                  "group flex items-center gap-3 rounded-2xl px-3 py-2.5 text-[15px] font-medium transition-all",
                  active
                    ? "bg-gradient-to-r from-red-100 via-red-50 to-rose-50 text-red-700 shadow-[0_14px_26px_-22px_rgba(220,38,38,0.45)]"
                    : "text-slate-700 hover:bg-red-50 hover:text-red-700",
                ].join(" ")}
              >
                <span
                  className={[
                    "flex h-8 w-8 items-center justify-center rounded-xl transition",
                    active
                      ? "bg-white text-red-600 shadow-sm"
                      : "bg-slate-100 text-slate-500 group-hover:bg-white group-hover:text-red-600",
                  ].join(" ")}
                >
                  <Icon className="h-4 w-4" />
                </span>
                {item.label}
              </Link>
            );
          })}
      </nav>

      <div className="mt-auto border-t border-slate-200/80 bg-gradient-to-t from-slate-50 to-white p-4">
        <Link
          href="/profile"
          className={[
            "flex items-center gap-3 rounded-3xl border px-3 py-2.5 transition-all",
            pathname.startsWith("/profile")
              ? "border-red-100 bg-red-50 shadow-[0_18px_40px_-28px_rgba(220,38,38,0.55)]"
              : "border-transparent bg-white/80 hover:border-slate-200 hover:bg-white hover:shadow-[0_18px_40px_-34px_rgba(15,23,42,0.3)]",
          ].join(" ")}
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-red-100 to-red-200 text-xs font-semibold text-red-700">
            {initials(userName)}
          </div>

          <div className="min-w-0 leading-tight">
            <div className="truncate text-sm font-semibold text-slate-900">
              {status === "loading" ? "Nalagam..." : userName}
            </div>
            <div className="mt-0.5 text-xs text-slate-500">{roleLabel(userRole)}</div>
          </div>
        </Link>
        <button
          className="mt-3 px-2 text-sm font-medium text-slate-500 transition hover:text-slate-900"
          onClick={() => signOut({ callbackUrl: "/" })}
        >
          Odjava
        </button>
      </div>
    </div>
  );
}
