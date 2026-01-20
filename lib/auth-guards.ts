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

  const allowed = PERMISSIONS[permission];
  if (!allowed.includes((user as any).role)) {
    throw new Error("Nimaš pravic za to dejanje.");
  }

  return user;
}
