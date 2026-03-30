import { parseISO } from 'date-fns';

const pad2 = (n: number) => String(n).padStart(2, '0');

const toDate = (date: string | Date): Date => {
  return typeof date === 'string' ? parseISO(date) : date;
};

export const datetimeLocalToUtcIso = (value: string): string => {
  if (!value) return value;
  if (value.endsWith('Z') || value.includes('+')) return new Date(value).toISOString();

  const [datePart, timePart] = value.split('T');
  if (!datePart || !timePart) return new Date(value).toISOString();

  const [y, m, d] = datePart.split('-').map(Number);
  const [hh, mm, ss = '0'] = timePart.split(':');

  const dateUtc = new Date(Date.UTC(y, m - 1, d, Number(hh), Number(mm), Number(ss), 0));
  return dateUtc.toISOString();
};

export const utcIsoToDatetimeLocal = (value: string): string => {
  const d = toDate(value);
  return `${d.getUTCFullYear()}-${pad2(d.getUTCMonth() + 1)}-${pad2(d.getUTCDate())}T${pad2(d.getUTCHours())}:${pad2(d.getUTCMinutes())}`;
};

export const formatDateTime = (date: string | Date): string => {
  return `${formatDate(date)} ${formatTime(date)}`;
};

export const formatTime = (date: string | Date): string => {
  const d = toDate(date);
  return `${pad2(d.getUTCHours())}:${pad2(d.getUTCMinutes())}`;
};

export const formatDate = (date: string | Date): string => {
  const d = toDate(date);
  return `${d.getUTCFullYear()}-${pad2(d.getUTCMonth() + 1)}-${pad2(d.getUTCDate())}`;
};

export const getTodayDateRange = () => {
  const now = new Date();
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0, 0));
  const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 23, 59, 59, 999));
  return { start: start.toISOString(), end: end.toISOString() };
};

export const isDateToday = (date: string | Date): boolean => {
  const d = toDate(date);
  const now = new Date();
  return (
    d.getUTCFullYear() === now.getUTCFullYear() &&
    d.getUTCMonth() === now.getUTCMonth() &&
    d.getUTCDate() === now.getUTCDate()
  );
};

export const getCurrentDateTime = (): string => {
  const now = new Date();
  return `${now.getUTCFullYear()}-${pad2(now.getUTCMonth() + 1)}-${pad2(now.getUTCDate())}T${pad2(now.getUTCHours())}:${pad2(now.getUTCMinutes())}`;
};
