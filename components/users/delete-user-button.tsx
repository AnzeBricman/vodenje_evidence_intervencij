"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type DeleteUserButtonProps = {
  userId: number;
  userName: string;
  disabled?: boolean;
};

export default function DeleteUserButton({
  userId,
  userName,
  disabled = false,
}: DeleteUserButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    const confirmed = window.confirm(
      `Ali res želiš izbrisati uporabnika ${userName}?`,
    );
    if (!confirmed) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/users", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Brisanje ni uspelo.");

      router.refresh();
    } catch (err: any) {
      setError(err?.message ?? String(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={handleDelete}
        disabled={disabled || loading}
        className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-700 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:border-gray-200 disabled:text-gray-400"
      >
        {loading ? "Brisanje..." : "Izbriši"}
      </button>

      {error ? <div className="text-right text-xs text-red-600">{error}</div> : null}
    </div>
  );
}
