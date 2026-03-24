import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/auth";
import { PERMISSIONS, type Permission } from "@/lib/roles";

export async function requireUser() {
  const session = await getServerSession(authOptions);

  if (!session?.user) redirect("/login");

  return session.user;
}

export async function requirePermission(permission: Permission) {
  const user = await requireUser();

  if (!hasPermission((user as any).role, permission)) {
    throw new Error("Nimaš pravic za to dejanje.");
  }

  return user;
}

export function hasPermission(role: string | undefined, permission: Permission) {
  const allowed = PERMISSIONS[permission];
  return allowed.includes(role as any);
}
