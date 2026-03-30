export const ZONES = [
  'forrajeo',
  'tubo',
  'tubo_superior',
  'rampa',
  'entrada',
  'nido',
  'puente',
  'conexion_nido_tubo'
] as const;

export type Zone = typeof ZONES[number];