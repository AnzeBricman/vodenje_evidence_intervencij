import PageHeader from "@/components/common/page-header";
import CreateUserForm from "@/components/users/create-user-form";
import UsersTable from "@/components/users/users-table";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/auth-guards";

export default async function UsersPage() {
  const user = await requirePermission("USER_MANAGE");

  const users = await prisma.uporabnik.findMany({
    where: { id_gd: user.id_gd },
    include: { vloga_v_aplikaciji: true },
    orderBy: { ime: "asc" },
  });

  type UserRow = (typeof users)[number];

  const serializedUsers = users.map((u: UserRow) => ({
    id_u: u.id_u,
    ime: u.ime,
    email: u.email,
    kreiran: u.kreiran ? u.kreiran.toISOString() : null,
    vloga: u.vloga_v_aplikaciji.ime,
  }));

  return (
    <>
      <PageHeader
        title="Uporabniki"
        subtitle="Člani tvojega gasilskega društva"
        right={<CreateUserForm />}
      />

      <UsersTable users={serializedUsers} currentUserId={Number(user.id)} />
    </>
  );
}
