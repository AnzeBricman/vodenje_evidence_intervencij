"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, ClipboardList, Wrench, Truck, Users } from "lucide-react";
import { signOut, useSession } from "next-auth/react";

const nav = [
  { href: "/dashboard", label: "Nadzorna plošča", icon: Home },
  { href: "/interventions", label: "Intervencije", icon: ClipboardList },
  { href: "/equipment", label: "Oprema", icon: Wrench },
  { href: "/vehicles", label: "Vozila", icon: Truck },
  { href: "/users", label: "Uporabniki", icon: Users, minRole: "ADMIN" }, // primer: samo admin
] as const;

function initials(name?: string | null) {
  const n = (name ?? "").trim();
  if (!n) return "??";
  const parts = n.split(/\s+/).filter(Boolean);
  const first = parts[0]?.[0] ?? "?";
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (first + last).toUpperCase();
}

function roleLabel(role?: string | null) {
  // prilagodi, če imaš druga imena rol
  switch ((role ?? "").toUpperCase()) {
    case "ADMIN":
      return "Administrator";
    case "POVELJNIK":
      return "Poveljnik";
    case "CLAN":
      return "Član";
    default:
      return role ?? "—";
  }
}

export default function Sidebar() {
  const pathname = usePathname();
  const { data: session, status } = useSession();

  const userName = session?.user?.name ?? session?.user?.email ?? "Uporabnik";
  const userRole = (session?.user as any)?.role as string | undefined;

  // primer: role check za link
  const canSeeUsers =
    (userRole ?? "").toUpperCase() === "ADMIN" ||
    (userRole ?? "").toUpperCase() === "POVELJNIK";

  return (
    <div className="flex h-screen flex-col">
      <div className="p-6">
        <div className="flex items-center gap-2">
          <div className="h-10 w-10 rounded-lg bg-red-600" />
          <div>
            <div className="text-sm font-semibold">Gasilstvo</div>
            <div className="text-xs text-muted-foreground">Intervencije</div>
          </div>
        </div>
      </div>

      <nav className="px-3 space-y-1">
        {nav
          .filter((item) => {
            // če želiš bolj napreden sistem, to kasneje priklopiš na roles.ts
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
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition",
                  active
                    ? "bg-red-600 text-white"
                    : "text-gray-700 hover:bg-gray-100",
                ].join(" ")}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
      </nav>

      <div className="mt-auto p-4 border-t">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center text-sm font-semibold text-red-700">
            {initials(userName)}
          </div>

          <div className="leading-tight min-w-0">
            <div className="text-sm font-medium truncate">
              {status === "loading" ? "Nalagam..." : userName}
            </div>
            <div className="text-xs text-muted-foreground">
              {roleLabel(userRole)}
            </div>
          </div>
        </div>
      <button
        className="mt-4 text-sm text-gray-600 hover:text-gray-900"
        onClick={() => signOut({ callbackUrl: "/" })}
      >
        Odjava
      </button>
      </div>
    </div>
  );
}
