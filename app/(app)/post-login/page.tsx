import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth-guards";

export default async function PostLoginPage() {
  const user = await requireUser();

  if ((user as any).role === "SUPER_ADMIN") {
    redirect("/admin");
  }

  redirect("/dashboard");
}
