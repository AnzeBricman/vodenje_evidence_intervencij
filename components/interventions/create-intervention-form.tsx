"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

type Option = {
  id: number;
  label: string;
};

type UserOption = {
  id: number;
  label: string;
  email: string;
};

type VehicleOption = {
  id: number;
  label: string;
  registration: string | null;
};

type EquipmentOption = {
  id: number;
  label: string;
};

type ParticipantRow = {
  userId: string;
  roleId: string;
};

type VehicleCrewRow = {
  userId: string;
  roleId: string;
};

type VehicleAssignmentRow = {
  vehicleId: string;
  crew: VehicleCrewRow[];
};

type EquipmentRow = {
  equipmentId: string;
  quantity: string;
  hours: string;
  note: string;
};

type Props = {
  statuses: Option[];
  interventionTypes: Option[];
  timeTypes: Option[];
  users: UserOption[];
  interventionRoles: Option[];
  vehicles: VehicleOption[];
  vehicleRoles: Option[];
  equipment: EquipmentOption[];
};

function Section({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="mb-4">
        <h2 className="text-sm font-semibold text-gray-900">{title}</h2>
        {subtitle ? <p className="mt-1 text-sm text-gray-500">{subtitle}</p> : null}
      </div>
      {children}
    </div>
  );
}

export default function CreateInterventionForm({
  statuses,
  interventionTypes,
  timeTypes,
  users,
  interventionRoles,
  vehicles,
  vehicleRoles,
  equipment,
}: Props) {
  const router = useRouter();
  const [referenceNumber, setReferenceNumber] = useState("");
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [startAt, setStartAt] = useState("");
  const [endAt, setEndAt] = useState("");
  const [statusId, setStatusId] = useState(statuses[0]?.id?.toString() ?? "");
  const [typeId, setTypeId] = useState(interventionTypes[0]?.id?.toString() ?? "");
  const [timeTypeId, setTimeTypeId] = useState(timeTypes[0]?.id?.toString() ?? "");
  const [participants, setParticipants] = useState<ParticipantRow[]>([
    { userId: "", roleId: interventionRoles[0]?.id?.toString() ?? "" },
  ]);
  const [vehicleAssignments, setVehicleAssignments] = useState<VehicleAssignmentRow[]>([]);
  const [equipmentRows, setEquipmentRows] = useState<EquipmentRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addParticipant = () => {
    setParticipants((prev) => [
      ...prev,
      { userId: "", roleId: interventionRoles[0]?.id?.toString() ?? "" },
    ]);
  };

  const updateParticipant = (index: number, key: keyof ParticipantRow, value: string) => {
    setParticipants((prev) => prev.map((row, i) => (i === index ? { ...row, [key]: value } : row)));
  };

  const removeParticipant = (index: number) => {
    setParticipants((prev) => prev.filter((_, i) => i !== index));
  };

  const addVehicle = () => {
    setVehicleAssignments((prev) => [...prev, { vehicleId: "", crew: [] }]);
  };

  const updateVehicle = (index: number, vehicleId: string) => {
    setVehicleAssignments((prev) =>
      prev.map((row, i) => (i === index ? { ...row, vehicleId } : row)),
    );
  };

  const removeVehicle = (index: number) => {
    setVehicleAssignments((prev) => prev.filter((_, i) => i !== index));
  };

  const addCrewMember = (vehicleIndex: number) => {
    setVehicleAssignments((prev) =>
      prev.map((row, i) =>
        i === vehicleIndex
          ? {
              ...row,
              crew: [...row.crew, { userId: "", roleId: vehicleRoles[0]?.id?.toString() ?? "" }],
            }
          : row,
      ),
    );
  };

  const updateCrewMember = (
    vehicleIndex: number,
    crewIndex: number,
    key: keyof VehicleCrewRow,
    value: string,
  ) => {
    setVehicleAssignments((prev) =>
      prev.map((row, i) =>
        i === vehicleIndex
          ? {
              ...row,
              crew: row.crew.map((crewRow, ci) =>
                ci === crewIndex ? { ...crewRow, [key]: value } : crewRow,
              ),
            }
          : row,
      ),
    );
  };

  const removeCrewMember = (vehicleIndex: number, crewIndex: number) => {
    setVehicleAssignments((prev) =>
      prev.map((row, i) =>
        i === vehicleIndex
          ? { ...row, crew: row.crew.filter((_, ci) => ci !== crewIndex) }
          : row,
      ),
    );
  };

  const addEquipment = () => {
    setEquipmentRows((prev) => [...prev, { equipmentId: "", quantity: "1", hours: "1", note: "" }]);
  };

  const updateEquipment = (index: number, key: keyof EquipmentRow, value: string) => {
    setEquipmentRows((prev) => prev.map((row, i) => (i === index ? { ...row, [key]: value } : row)));
  };

  const removeEquipment = (index: number) => {
    setEquipmentRows((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/interventions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          referenceNumber,
          title,
          location,
          startAt,
          endAt,
          statusId: Number(statusId),
          typeId: Number(typeId),
          timeTypeId: Number(timeTypeId),
          participants,
          vehicles: vehicleAssignments,
          equipment: equipmentRows,
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Shranjevanje ni uspelo.");

      router.push(`/interventions/${json.id}`);
      router.refresh();
    } catch (err: any) {
      setError(err?.message ?? String(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Nova intervencija</h1>
          <p className="mt-1 text-sm text-gray-500">
            Izpolni osnovne podatke, ekipo, vozila in uporabljeno opremo.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/interventions"
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 transition hover:bg-gray-50"
          >
            Prekliči
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-red-300"
          >
            {loading ? "Shranjujem..." : "Shrani intervencijo"}
          </button>
        </div>
      </div>

      <Section title="Osnovni podatki">
        <div className="grid gap-4 md:grid-cols-2">
          <label className="grid gap-2 text-sm">
            <span>Številka intervencije</span>
            <input
              className="rounded-lg border border-gray-200 px-3 py-2"
              value={referenceNumber}
              onChange={(e) => setReferenceNumber(e.target.value)}
              placeholder="npr. 2026-001"
              required
            />
          </label>

          <label className="grid gap-2 text-sm">
            <span>Status</span>
            <select
              className="rounded-lg border border-gray-200 px-3 py-2"
              value={statusId}
              onChange={(e) => setStatusId(e.target.value)}
              required
            >
              {statuses.map((status: Option) => (
                <option key={status.id} value={status.id}>
                  {status.label}
                </option>
              ))}
            </select>
          </label>

          <label className="grid gap-2 text-sm md:col-span-2">
            <span>Naslov</span>
            <input
              className="rounded-lg border border-gray-200 px-3 py-2"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Naslov intervencije"
              required
            />
          </label>

          <label className="grid gap-2 text-sm">
            <span>Lokacija</span>
            <input
              className="rounded-lg border border-gray-200 px-3 py-2"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Lokacija"
            />
          </label>

          <label className="grid gap-2 text-sm">
            <span>Vrsta intervencije</span>
            <select
              className="rounded-lg border border-gray-200 px-3 py-2"
              value={typeId}
              onChange={(e) => setTypeId(e.target.value)}
              required
            >
              {interventionTypes.map((type: Option) => (
                <option key={type.id} value={type.id}>
                  {type.label}
                </option>
              ))}
            </select>
          </label>

          <label className="grid gap-2 text-sm">
            <span>Začetek</span>
            <input
              type="datetime-local"
              className="rounded-lg border border-gray-200 px-3 py-2"
              value={startAt}
              onChange={(e) => setStartAt(e.target.value)}
              required
            />
          </label>

          <label className="grid gap-2 text-sm">
            <span>Konec</span>
            <input
              type="datetime-local"
              className="rounded-lg border border-gray-200 px-3 py-2"
              value={endAt}
              onChange={(e) => setEndAt(e.target.value)}
              required
            />
          </label>

          <label className="grid gap-2 text-sm md:col-span-2">
            <span>Tip časa</span>
            <select
              className="rounded-lg border border-gray-200 px-3 py-2"
              value={timeTypeId}
              onChange={(e) => setTimeTypeId(e.target.value)}
              required
            >
              {timeTypes.map((timeType: Option) => (
                <option key={timeType.id} value={timeType.id}>
                  {timeType.label}
                </option>
              ))}
            </select>
          </label>
        </div>
      </Section>

      <Section title="Prisotni člani" subtitle="Dodaj člane in njihove vloge na intervenciji.">
        <div className="space-y-3">
          {participants.map((row: ParticipantRow, index: number) => (
            <div key={index} className="grid gap-3 rounded-xl border border-gray-200 bg-gray-50 p-4 md:grid-cols-[1.6fr_1fr_auto]">
              <select
                className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm"
                value={row.userId}
                onChange={(e) => updateParticipant(index, "userId", e.target.value)}
              >
                <option value="">Izberi člana</option>
                {users.map((user: UserOption) => (
                  <option key={user.id} value={user.id}>
                    {user.label} ({user.email})
                  </option>
                ))}
              </select>

              <select
                className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm"
                value={row.roleId}
                onChange={(e) => updateParticipant(index, "roleId", e.target.value)}
              >
                {interventionRoles.map((role: Option) => (
                  <option key={role.id} value={role.id}>
                    {role.label}
                  </option>
                ))}
              </select>

              <button
                type="button"
                onClick={() => removeParticipant(index)}
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 transition hover:bg-white"
              >
                Odstrani
              </button>
            </div>
          ))}

          <button
            type="button"
            onClick={addParticipant}
            className="rounded-lg border border-dashed border-gray-300 px-4 py-2 text-sm text-gray-700 transition hover:bg-gray-50"
          >
            + Dodaj člana
          </button>
        </div>
      </Section>

      <Section title="Vozila" subtitle="Dodaj vozila in posadko v posameznem vozilu.">
        <div className="space-y-4">
          {vehicleAssignments.map((vehicleRow: VehicleAssignmentRow, vehicleIndex: number) => (
            <div key={vehicleIndex} className="rounded-xl border border-gray-200 bg-gray-50 p-4">
              <div className="mb-3 grid gap-3 md:grid-cols-[1fr_auto]">
                <select
                  className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm"
                  value={vehicleRow.vehicleId}
                  onChange={(e) => updateVehicle(vehicleIndex, e.target.value)}
                >
                  <option value="">Izberi vozilo</option>
                  {vehicles.map((vehicle: VehicleOption) => (
                    <option key={vehicle.id} value={vehicle.id}>
                      {vehicle.label} {vehicle.registration ? `(${vehicle.registration})` : ""}
                    </option>
                  ))}
                </select>

                <button
                  type="button"
                  onClick={() => removeVehicle(vehicleIndex)}
                  className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 transition hover:bg-white"
                >
                  Odstrani vozilo
                </button>
              </div>

              <div className="space-y-3">
                {vehicleRow.crew.map((crewRow: VehicleCrewRow, crewIndex: number) => (
                  <div
                    key={crewIndex}
                    className="grid gap-3 rounded-xl border border-gray-200 bg-white p-3 md:grid-cols-[1.6fr_1fr_auto]"
                  >
                    <select
                      className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm"
                      value={crewRow.userId}
                      onChange={(e) =>
                        updateCrewMember(vehicleIndex, crewIndex, "userId", e.target.value)
                      }
                    >
                      <option value="">Izberi člana</option>
                      {users.map((user: UserOption) => (
                        <option key={user.id} value={user.id}>
                          {user.label}
                        </option>
                      ))}
                    </select>

                    <select
                      className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm"
                      value={crewRow.roleId}
                      onChange={(e) =>
                        updateCrewMember(vehicleIndex, crewIndex, "roleId", e.target.value)
                      }
                    >
                      {vehicleRoles.map((role: Option) => (
                        <option key={role.id} value={role.id}>
                          {role.label}
                        </option>
                      ))}
                    </select>

                    <button
                      type="button"
                      onClick={() => removeCrewMember(vehicleIndex, crewIndex)}
                      className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 transition hover:bg-gray-50"
                    >
                      Odstrani
                    </button>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={() => addCrewMember(vehicleIndex)}
                  className="rounded-lg border border-dashed border-gray-300 px-4 py-2 text-sm text-gray-700 transition hover:bg-white"
                >
                  + Dodaj člana v vozilo
                </button>
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={addVehicle}
            className="rounded-lg border border-dashed border-gray-300 px-4 py-2 text-sm text-gray-700 transition hover:bg-gray-50"
          >
            + Dodaj vozilo
          </button>
        </div>
      </Section>

      <Section title="Oprema" subtitle="Dodaj uporabljeno opremo, količino in ure uporabe.">
        <div className="space-y-3">
          {equipmentRows.map((row: EquipmentRow, index: number) => (
            <div
              key={index}
              className="grid gap-3 rounded-xl border border-gray-200 bg-gray-50 p-4 md:grid-cols-[1.8fr_0.8fr_0.8fr_auto]"
            >
              <select
                className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm"
                value={row.equipmentId}
                onChange={(e) => updateEquipment(index, "equipmentId", e.target.value)}
              >
                <option value="">Izberi opremo</option>
                {equipment.map((item: EquipmentOption) => (
                  <option key={item.id} value={item.id}>
                    {item.label}
                  </option>
                ))}
              </select>

              <input
                type="number"
                min="1"
                step="1"
                className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm"
                value={row.quantity}
                onChange={(e) => updateEquipment(index, "quantity", e.target.value)}
                placeholder="Količina"
              />

              <input
                type="number"
                min="0"
                step="0.01"
                className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm"
                value={row.hours}
                onChange={(e) => updateEquipment(index, "hours", e.target.value)}
                placeholder="Ure"
              />

              <button
                type="button"
                onClick={() => removeEquipment(index)}
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 transition hover:bg-white"
              >
                Odstrani
              </button>

              <label className="grid gap-2 text-sm md:col-span-4">
                <span className="text-xs text-gray-600">Komentar za opremo / poškodba</span>
                <textarea
                  className="min-h-20 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm"
                  value={row.note}
                  onChange={(e) => updateEquipment(index, "note", e.target.value)}
                  placeholder="npr. poškodovana cev, počena maska, brez posebnosti ..."
                  maxLength={500}
                />
              </label>
            </div>
          ))}

          <button
            type="button"
            onClick={addEquipment}
            className="rounded-lg border border-dashed border-gray-300 px-4 py-2 text-sm text-gray-700 transition hover:bg-gray-50"
          >
            + Dodaj opremo
          </button>
        </div>
      </Section>

      {error ? <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}
    </form>
  );
}
