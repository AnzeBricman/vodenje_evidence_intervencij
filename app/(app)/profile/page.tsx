import ProfileSettingsForm from "@/components/profile/profile-settings-form";
import { requireUser } from "@/lib/auth-guards";
import { prisma } from "@/lib/prisma";
import { ROLE_LABEL, type Role } from "@/lib/roles";

export default async function ProfilePage() {
  const sessionUser = await requireUser();
  const userId = Number((sessionUser as any).id);

  const user = await prisma.uporabnik.findUnique({
    where: { id_u: userId },
    include: {
      gasilni_dom: true,
      vloga_v_aplikaciji: true,
    },
  });

  if (!user) {
    throw new Error("Uporabnik ni bil najden.");
  }

  const role = ((sessionUser as any).role ?? "UPORABNIK") as Role;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-semibold tracking-tight text-slate-900">Moj profil</h1>
        <p className="mt-2 text-base text-slate-600">
          Uredi svoj email in geslo za dostop do aplikacije.
        </p>
      </div>

      <ProfileSettingsForm
        name={user.ime}
        email={user.email}
        role={ROLE_LABEL[role] ?? user.vloga_v_aplikaciji.ime}
        societyName={user.gasilni_dom.ime}
      />
    </div>
  );
}
