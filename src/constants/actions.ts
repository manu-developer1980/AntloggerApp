export const ACTIONS = [
  'inspeccion',
  'exploracion',
  'transporte',
  'limpieza',
  'reclutamiento',
  'retirada',
  'reposicion',
  'patrulla',
  'excavacion',
  'ajuste_estructural',
  'actualizacion_modulo'
] as const;

export type Action = typeof ACTIONS[number];