export const ROLES = {
  SUPER_ADMIN: "SUPER_ADMIN",
  ADMIN: "ADMIN",
  UPORABNIK: "UPORABNIK",
} as const;

export type Role = typeof ROLES[keyof typeof ROLES];

export const ROLE_LABEL: Record<Role, string> = {
  SUPER_ADMIN: "Super admin",
  ADMIN: "Administrator",
  UPORABNIK: "Uporabnik",
};

export const PERMISSIONS = {
  INTERVENTION_VIEW: [ROLES.ADMIN, ROLES.UPORABNIK],
  INTERVENTION_CREATE: [ROLES.ADMIN],
  INTERVENTION_EDIT: [ROLES.ADMIN],
  INTERVENTION_DELETE: [ROLES.ADMIN],

  VEHICLE_MANAGE: [ROLES.ADMIN],
  EQUIPMENT_MANAGE: [ROLES.ADMIN],
  USER_MANAGE: [ROLES.ADMIN],
} as const;

export type Permission = keyof typeof PERMISSIONS;
