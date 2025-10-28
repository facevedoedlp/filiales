export const ROLES = {
  ADMIN: 'ADMIN',
  PRESIDENTE: 'PRESIDENTE',
  INTEGRANTE: 'INTEGRANTE',
};

export const ROLES_LABELS = {
  [ROLES.ADMIN]: 'Administrador',
  [ROLES.PRESIDENTE]: 'Presidente',
  [ROLES.INTEGRANTE]: 'Integrante',
};

export const ESTADOS_ENTRADA = [
  { value: 'PENDIENTE', label: 'Pendiente' },
  { value: 'APROBADA', label: 'Aprobada' },
  { value: 'RECHAZADA', label: 'Rechazada' },
];

export const ESTADOS_INTEGRANTE = [
  { value: 'ACTIVO', label: 'Activo' },
  { value: 'INACTIVO', label: 'Inactivo' },
];

export const ESTADOS_HILO = {
  ABIERTO: 'ABIERTO',
  CERRADO: 'CERRADO',
};

export const TABS_FORO = {
  RECIENTES: 'recientes',
  POPULARES: 'populares',
};
