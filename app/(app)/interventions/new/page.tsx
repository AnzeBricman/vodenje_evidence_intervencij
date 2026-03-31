import CreateInterventionForm from "@/components/interventions/create-intervention-form";
import { requirePermission } from "@/lib/auth-guards";
import { prisma } from "@/lib/prisma";

export default async function NewInterventionPage() {
  const user = await requirePermission("INTERVENTION_CREATE");

  const [
    statuses,
    interventionTypes,
    timeTypes,
    users,
    interventionRoles,
    vehicles,
    vehicleRoles,
    equipment,
  ] = await Promise.all([
    prisma.status.findMany({ orderBy: { ime_statusa: "asc" } }),
    prisma.intervencija_tip.findMany({ orderBy: { tip: "asc" } }),
    prisma.tip_casa.findMany({ orderBy: { ime_tipa: "asc" } }),
    prisma.uporabnik.findMany({
      where: { id_gd: user.id_gd },
      orderBy: { ime: "asc" },
      select: { id_u: true, ime: true, email: true },
    }),
    prisma.vloga_na_intervenciji.findMany({ orderBy: { ime_vloge: "asc" } }),
    prisma.vozilo.findMany({
      where: { id_gd: user.id_gd },
      orderBy: { ime: "asc" },
      select: { id_v: true, ime: true, registrska_st: true },
    }),
    prisma.vloga_v_vozilu.findMany({ orderBy: { ime_vloge: "asc" } }),
    prisma.oprema.findMany({
      where: { id_gd: user.id_gd },
      orderBy: { ime_opreme: "asc" },
      select: { id_o: true, ime_opreme: true },
    }),
  ]);

  return (
    <CreateInterventionForm
      statuses={statuses.map((item) => ({ id: item.id_s, label: item.ime_statusa }))}
      interventionTypes={interventionTypes.map((item) => ({ id: item.id_it, label: item.tip }))}
      timeTypes={timeTypes.map((item) => ({ id: item.id_tc, label: item.ime_tipa }))}
      users={users.map((item) => ({ id: item.id_u, label: item.ime, email: item.email }))}
      interventionRoles={interventionRoles.map((item) => ({
        id: item.id_vni,
        label: item.ime_vloge,
      }))}
      vehicles={vehicles.map((item) => ({
        id: item.id_v,
        label: item.ime,
        registration: item.registrska_st,
      }))}
      vehicleRoles={vehicleRoles.map((item) => ({
        id: item.id_vvv,
        label: item.ime_vloge,
      }))}
      equipment={equipment.map((item) => ({ id: item.id_o, label: item.ime_opreme }))}
    />
  );
}
