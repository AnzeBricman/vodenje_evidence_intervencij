import PageHeader from "@/components/common/page-header";
import CreateVehicleForm from "@/components/vehicles/create-vehicle-form";
import VehiclesTable from "@/components/vehicles/vehicles-table";
import { hasPermission, requireUser } from "@/lib/auth-guards";
import { prisma } from "@/lib/prisma";

export default async function VehiclesPage() {
  const user = await requireUser();

  const [vehicles, vehicleTypes, vehicleStatuses] = await Promise.all([
    prisma.vozilo.findMany({
      where: { id_gd: user.id_gd },
      include: {
        tip_vozila: true,
        status_vozila: true,
      },
      orderBy: { ime: "asc" },
    }),
    prisma.tip_vozila.findMany({ orderBy: { ime_tipa: "asc" } }),
    prisma.status_vozila.findMany({ orderBy: { ime_statusa: "asc" } }),
  ]);

  type VehicleRow = (typeof vehicles)[number];
  type VehicleTypeRow = (typeof vehicleTypes)[number];
  type VehicleStatusRow = (typeof vehicleStatuses)[number];

  const serializedVehicles = vehicles.map((vehicle: VehicleRow) => ({
    id_v: vehicle.id_v,
    ime: vehicle.ime,
    registrska_st: vehicle.registrska_st,
    tip: vehicle.tip_vozila.ime_tipa,
    status: vehicle.status_vozila.ime_statusa,
    statusId: vehicle.id_sv,
    ustvarjeno: vehicle.ustvarjeno ? vehicle.ustvarjeno.toISOString() : null,
  }));

  const canManageVehicles = hasPermission((user as any).role, "VEHICLE_MANAGE");

  return (
    <>
      <PageHeader
        title="Vozila"
        subtitle="Seznam vozil tvojega gasilskega društva"
        right={
          canManageVehicles ? (
            <CreateVehicleForm
              vehicleTypes={vehicleTypes.map((type: VehicleTypeRow) => ({
                id: type.id_tv,
                label: type.ime_tipa,
              }))}
              vehicleStatuses={vehicleStatuses.map((status: VehicleStatusRow) => ({
                id: status.id_sv,
                label: status.ime_statusa,
              }))}
            />
          ) : null
        }
      />

      <VehiclesTable
        vehicles={serializedVehicles}
        canManageVehicles={canManageVehicles}
        vehicleStatuses={vehicleStatuses.map((status: VehicleStatusRow) => ({
          id: status.id_sv,
          label: status.ime_statusa,
        }))}
      />
    </>
  );
}
