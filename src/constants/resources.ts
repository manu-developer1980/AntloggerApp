export const RESOURCES = [
  'proteina',
  'gammarus',
  'semillas',
  'alpiste',
  'quinoa',
  'bluesugar',
  'arena',
  'restos',
  'bebedero'
] as const;

export type Resource = typeof RESOURCES[number];