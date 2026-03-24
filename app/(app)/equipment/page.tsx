import PageHeader from "@/components/common/page-header";
import CreateEquipmentForm from "@/components/equipment/create-equipment-form";
import EquipmentTable from "@/components/equipment/equipment-table";
import { hasPermission, requireUser } from "@/lib/auth-guards";
import { prisma } from "@/lib/prisma";

export default async function EquipmentPage() {
  const user = await requireUser();

  const [equipment, categories, states] = await Promise.all([
    prisma.oprema.findMany({
      where: { id_gd: user.id_gd },
      include: {
        kategorija_oprema: true,
        stanje_opreme: true,
      },
      orderBy: { ime_opreme: "asc" },
    }),
    prisma.kategorija_oprema.findMany({ orderBy: { ime_kategorije: "asc" } }),
    prisma.stanje_opreme.findMany({ orderBy: { ime_stanja: "asc" } }),
  ]);

  const serializedEquipment = equipment.map((item) => ({
    id_o: item.id_o,
    ime_opreme: item.ime_opreme,
    kategorija: item.kategorija_oprema.ime_kategorije,
    stanje: item.stanje_opreme.ime_stanja,
    stanjeId: item.id_so,
    ustvarjeno: item.ustvarjeno ? item.ustvarjeno.toISOString() : null,
    serijska_st: item.serijska_st,
  }));

  const canManageEquipment = hasPermission((user as any).role, "EQUIPMENT_MANAGE");

  return (
    <>
      <PageHeader
        title="Oprema"
        subtitle="Seznam opreme tvojega gasilskega društva"
        right={
          canManageEquipment ? (
            <CreateEquipmentForm
              categories={categories.map((category) => ({
                id: category.id_ko,
                label: category.ime_kategorije,
              }))}
              states={states.map((state) => ({
                id: state.id_so,
                label: state.ime_stanja,
              }))}
            />
          ) : null
        }
      />

      <EquipmentTable
        equipment={serializedEquipment}
        canManageEquipment={canManageEquipment}
        states={states.map((state) => ({
          id: state.id_so,
          label: state.ime_stanja,
        }))}
      />
    </>
  );
}
