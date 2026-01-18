"use client";

import { Bell, Search } from "lucide-react";

export default function Topbar() {
  return (
    <div className="h-full px-6 flex items-center justify-end gap-4">
      <div className="relative w-[360px]">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          placeholder="Iskanje..."
          className="w-full rounded-lg border bg-white px-9 py-2 text-sm outline-none focus:ring-2 focus:ring-red-200"
        />
      </div>

      <button className="relative rounded-lg p-2 hover:bg-gray-100">
        <Bell className="h-5 w-5" />
        <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-600" />
      </button>
    </div>
  );
}
