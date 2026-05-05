import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { prisma } from "@/lib/prisma";
import { ROLES } from "@/lib/roles";

type TxClient = Pick<
  typeof prisma,
  | "intervencija"
  | "intervencije_uporabnik"
  | "intervencije_vozila"
  | "intervencije_vozila_uporabniki"
  | "intervencija_oprema"
>;

function canManageInterventions(role?: string) {
  return role === ROLES.ADMIN;
}

type ParticipantInput = {
  userId: string;
  roleId: string;
};

type VehicleCrewInput = {
  userId: string;
  roleId: string;
};

type VehicleInput = {
  vehicleId: string;
  crew: VehicleCrewInput[];
};

type EquipmentInput = {
  equipmentId: string;
  quantity: string;
  hours: string;
  note?: string;
};

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const user = session?.user as any;

    if (!user || !canManageInterventions(user.role)) {
      return NextResponse.json({ error: "Ni dovoljenja" }, { status: 403 });
    }

    const body = await req.json();
    const zap_st = (body.referenceNumber || "").toString().trim();
    const naslov = (body.title || "").toString().trim();
    const lokacija = (body.location || "").toString().trim() || null;
    const zacetek = new Date(body.startAt);
    const konec = new Date(body.endAt);
    const id_s = Number(body.statusId);
    const id_it = Number(body.typeId);
    const id_tc = Number(body.timeTypeId);
    const participants = ((body.participants as ParticipantInput[]) ?? []).filter(
      (item: ParticipantInput) => item.userId && item.roleId,
    );
    const vehicles = ((body.vehicles as VehicleInput[]) ?? []).filter(
      (item: VehicleInput) => item.vehicleId,
    );
    const equipment = ((body.equipment as EquipmentInput[]) ?? []).filter(
      (item: EquipmentInput) => item.equipmentId,
    );

    if (
      !zap_st ||
      !naslov ||
      Number.isNaN(zacetek.getTime()) ||
      Number.isNaN(konec.getTime()) ||
      konec <= zacetek ||
      !Number.isInteger(id_s) ||
      !Number.isInteger(id_it) ||
      !Number.isInteger(id_tc)
    ) {
      return NextResponse.json({ error: "Manjkajoči ali neveljavni podatki." }, { status: 400 });
    }

    const participantUserIds = participants.map((item: ParticipantInput) => Number(item.userId));
    const participantRoleIds = participants.map((item: ParticipantInput) => Number(item.roleId));
    const vehicleIds = vehicles.map((item: VehicleInput) => Number(item.vehicleId));
    const vehicleCrewUserIds = vehicles.flatMap((item: VehicleInput) =>
      item.crew.map((crew: VehicleCrewInput) => Number(crew.userId)),
    );
    const vehicleCrewRoleIds = vehicles.flatMap((item: VehicleInput) =>
      item.crew.map((crew: VehicleCrewInput) => Number(crew.roleId)),
    );
    const equipmentIds = equipment.map((item: EquipmentInput) => Number(item.equipmentId));

    if (new Set(participantUserIds).size !== participantUserIds.length) {
      return NextResponse.json({ error: "Isti član je vpisan večkrat med prisotnimi." }, { status: 400 });
    }

    if (new Set(vehicleIds).size !== vehicleIds.length) {
      return NextResponse.json({ error: "Isto vozilo je dodano večkrat." }, { status: 400 });
    }

    if (new Set(equipmentIds).size !== equipmentIds.length) {
      return NextResponse.json({ error: "Ista oprema je dodana večkrat." }, { status: 400 });
    }

    const [status, type, timeType, dbUsers, dbInterventionRoles, dbVehicles, dbVehicleRoles, dbEquipment] =
      await Promise.all([
        prisma.status.findUnique({ where: { id_s } }),
        prisma.intervencija_tip.findUnique({ where: { id_it } }),
        prisma.tip_casa.findUnique({ where: { id_tc } }),
        participantUserIds.length + vehicleCrewUserIds.length > 0
          ? prisma.uporabnik.findMany({
              where: {
                id_gd: user.id_gd,
                id_u: { in: Array.from(new Set([...participantUserIds, ...vehicleCrewUserIds])) },
              },
              select: { id_u: true },
            })
          : Promise.resolve([]),
        participantRoleIds.length > 0
          ? prisma.vloga_na_intervenciji.findMany({
              where: { id_vni: { in: participantRoleIds } },
              select: { id_vni: true },
            })
          : Promise.resolve([]),
        vehicleIds.length > 0
          ? prisma.vozilo.findMany({
              where: { id_gd: user.id_gd, id_v: { in: vehicleIds } },
              select: { id_v: true },
            })
          : Promise.resolve([]),
        vehicleCrewRoleIds.length > 0
          ? prisma.vloga_v_vozilu.findMany({
              where: { id_vvv: { in: vehicleCrewRoleIds } },
              select: { id_vvv: true },
            })
          : Promise.resolve([]),
        equipmentIds.length > 0
          ? prisma.oprema.findMany({
              where: { id_gd: user.id_gd, id_o: { in: equipmentIds } },
              select: { id_o: true },
            })
          : Promise.resolve([]),
      ]);

    if (!status || !type || !timeType) {
      return NextResponse.json({ error: "Status, vrsta ali tip časa ne obstaja." }, { status: 400 });
    }

    if (dbUsers.length !== new Set([...participantUserIds, ...vehicleCrewUserIds]).size) {
      return NextResponse.json({ error: "Nekateri člani ne pripadajo tvojemu društvu." }, { status: 400 });
    }

    if (dbInterventionRoles.length !== new Set(participantRoleIds).size) {
      return NextResponse.json({ error: "Nekatere vloge na intervenciji ne obstajajo." }, { status: 400 });
    }

    if (dbVehicles.length !== new Set(vehicleIds).size) {
      return NextResponse.json({ error: "Nekatera vozila ne pripadajo tvojemu društvu." }, { status: 400 });
    }

    if (dbVehicleRoles.length !== new Set(vehicleCrewRoleIds).size) {
      return NextResponse.json({ error: "Nekatere vloge v vozilu ne obstajajo." }, { status: 400 });
    }

    if (dbEquipment.length !== new Set(equipmentIds).size) {
      return NextResponse.json({ error: "Nekatera oprema ne pripada tvojemu društvu." }, { status: 400 });
    }

    const participantIdSet = new Set(participantUserIds);
    for (const vehicle of vehicles) {
      const crewIds = vehicle.crew.map((item: VehicleCrewInput) => Number(item.userId));
      if (new Set(crewIds).size !== crewIds.length) {
        return NextResponse.json({ error: "Isti član je v istem vozilu dodan večkrat." }, { status: 400 });
      }

      for (const crewId of crewIds) {
        if (!participantIdSet.has(crewId)) {
          return NextResponse.json(
            { error: "Vsak član v vozilu mora biti najprej dodan med prisotne člane." },
            { status: 400 },
          );
        }
      }
    }

    for (const item of equipment) {
      const quantity = Number(item.quantity);
      const hours = Number(item.hours);
      const note = (item.note ?? "").toString().trim();
      if (!Number.isFinite(quantity) || quantity <= 0 || !Number.isFinite(hours) || hours < 0) {
        return NextResponse.json({ error: "Količina ali ure uporabe opreme niso veljavne." }, { status: 400 });
      }
      if (note.length > 500) {
        return NextResponse.json({ error: "Komentar za opremo je lahko dolg največ 500 znakov." }, { status: 400 });
      }
    }

    const durationHours = Math.round((((konec.getTime() - zacetek.getTime()) / 36e5) * 100)) / 100;

    const created = await prisma.$transaction(async (tx: TxClient) => {
      const intervention = await tx.intervencija.create({
        data: {
          zap_st,
          naslov,
          lokacija,
          zacetek,
          konec,
          trajanje_ur: durationHours,
          id_it,
          id_s,
          id_tc,
          id_gd: user.id_gd,
        },
      });

      if (participants.length > 0) {
        await tx.intervencije_uporabnik.createMany({
          data: participants.map((item: ParticipantInput) => ({
            id_i: intervention.id_i,
            id_u: Number(item.userId),
            id_vni: Number(item.roleId),
          })),
        });
      }

      for (const vehicle of vehicles) {
        const createdVehicle = await tx.intervencije_vozila.create({
          data: {
            id_i: intervention.id_i,
            id_v: Number(vehicle.vehicleId),
          },
        });

        if (vehicle.crew.length > 0) {
          await tx.intervencije_vozila_uporabniki.createMany({
            data: vehicle.crew
              .filter((crew: VehicleCrewInput) => crew.userId && crew.roleId)
              .map((crew: VehicleCrewInput) => ({
                id_iv: createdVehicle.id_iv,
                id_u: Number(crew.userId),
                id_vvv: Number(crew.roleId),
              })),
          });
        }
      }

      if (equipment.length > 0) {
        await tx.intervencija_oprema.createMany({
          data: equipment.map((item: EquipmentInput) => ({
            id_i: intervention.id_i,
            id_o: Number(item.equipmentId),
            kolicina: Number(item.quantity),
            ure_uporabe: Number(item.hours),
            opomba: (item.note ?? "").toString().trim() || null,
          })),
        });
      }

      return intervention;
    });

    return NextResponse.json({ ok: true, id: created.id_i });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err?.message ?? String(err) }, { status: 500 });
  }
}
