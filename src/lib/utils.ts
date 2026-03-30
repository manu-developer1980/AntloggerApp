import { clsx, type ClassValue } from 'clsx';

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

export function formatTemperature(temp: number | null | undefined): string {
  if (temp === null || temp === undefined) return '--°C';
  return `${temp.toFixed(1)}°C`;
}

export function formatHumidity(humidity: number | null | undefined): string {
  if (humidity === null || humidity === undefined) return '--%';
  return `${humidity.toFixed(0)}%`;
}

export function formatPressure(pressure: number | null | undefined): string {
  if (pressure === null || pressure === undefined) return '-- hPa';
  return `${pressure.toFixed(0)} hPa`;
}