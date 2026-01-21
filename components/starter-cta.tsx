"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function StarterCTA() {
  const { status } = useSession();
  const router = useRouter();

  const handleClick = () => {
    if (status === "authenticated") {
      router.push("/dashboard");
    } else {
      router.push("/login");
    }
  };

  return (
    <button
      onClick={handleClick}
      className="cta"
    >
      Prijava v sistem
    </button>
  );
}
