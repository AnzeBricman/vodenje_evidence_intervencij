"use client";

import { Search } from "lucide-react";
import { useMemo, useState } from "react";
import DeleteUserButton from "@/components/users/delete-user-button";

type UserRow = {
  id_u: number;
  ime: string;
  email: string;
  kreiran: string | null;
  vloga: string;
};

type UsersTableProps = {
  users: UserRow[];
  currentUserId: number;
};

export default function UsersTable({ users, currentUserId }: UsersTableProps) {
  const [query, setQuery] = useState("");

  const filteredUsers = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) return users;

    return users.filter((user) => user.ime.toLowerCase().includes(normalizedQuery));
  }, [query, users]);

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
      <div className="border-b border-gray-100 bg-gradient-to-r from-white to-gray-50 px-6 py-5">
        <div className="relative max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-3 text-sm shadow-sm outline-none transition focus:border-red-300 focus:ring-2 focus:ring-red-100"
            placeholder="Iskanje po imenu..."
          />
        </div>
      </div>

      <div className="overflow-x-auto px-4 py-4">
        <table className="w-full border-separate border-spacing-y-2 text-sm">
          <thead>
            <tr className="text-left text-[11px] font-semibold uppercase tracking-[0.14em] text-gray-500">
              <th className="px-4 py-2">Ime</th>
              <th className="px-4 py-2">Email</th>
              <th className="px-4 py-2">Vloga v aplikaciji</th>
              <th className="px-4 py-2">Kreiran</th>
              <th className="px-4 py-2 text-right">Akcije</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((u) => (
              <tr
                key={u.id_u}
                className="bg-gray-50/80 shadow-sm ring-1 ring-gray-100 transition hover:bg-white hover:ring-red-100"
              >
                <td className="rounded-l-xl px-4 py-4 font-medium text-gray-900">{u.ime}</td>
                <td className="px-4 py-4 text-gray-500">{u.email}</td>
                <td className="px-4 py-4">
                  <span className="inline-flex items-center rounded-full border border-gray-200 bg-white px-2.5 py-1 text-xs font-medium text-gray-700">
                    {u.vloga}
                  </span>
                </td>
                <td className="px-4 py-4 text-gray-500">
                  {u.kreiran ? new Date(u.kreiran).toLocaleDateString("sl-SI") : "—"}
                </td>
                <td className="rounded-r-xl px-4 py-4 text-right">
                  <DeleteUserButton
                    userId={u.id_u}
                    userName={u.ime}
                    disabled={currentUserId === u.id_u}
                  />
                </td>
              </tr>
            ))}

            {filteredUsers.length === 0 && (
              <tr>
                <td colSpan={5} className="py-12 text-center text-sm text-gray-500">
                  {users.length === 0
                    ? "Ni uporabnikov v bazi za to društvo."
                    : "Ni zadetkov za iskano ime."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
