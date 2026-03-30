import { format } from 'date-fns';

const pad2 = (n: number) => String(n).padStart(2, '0');

const extractIsoDateTime = (value: string): { date: string; time: string } | null => {
  const m = value.match(/^(\d{4}-\d{2}-\d{2})[T\s](\d{2}:\d{2})/);
  if (!m) return null;
  return { date: m[1], time: m[2] };
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
  const parts = extractIsoDateTime(value);
  if (parts) return `${parts.date}T${parts.time}`;

  const d = new Date(value);
  return `${d.getUTCFullYear()}-${pad2(d.getUTCMonth() + 1)}-${pad2(d.getUTCDate())}T${pad2(d.getUTCHours())}:${pad2(d.getUTCMinutes())}`;
};

export const formatDateTime = (date: string | Date): string => {
  return `${formatDate(date)} ${formatTime(date)}`;
};

export const formatTime = (date: string | Date): string => {
  if (typeof date === 'string') {
    const parts = extractIsoDateTime(date);
    if (parts) return parts.time;
  }

  const d = typeof date === 'string' ? new Date(date) : date;
  return `${pad2(d.getUTCHours())}:${pad2(d.getUTCMinutes())}`;
};

export const formatDate = (date: string | Date): string => {
  if (typeof date === 'string') {
    const parts = extractIsoDateTime(date);
    if (parts) return parts.date;
    const m = date.match(/^(\d{4}-\d{2}-\d{2})/);
    if (m) return m[1];
  }

  const d = typeof date === 'string' ? new Date(date) : date;
  return `${d.getUTCFullYear()}-${pad2(d.getUTCMonth() + 1)}-${pad2(d.getUTCDate())}`;
};

export const getTodayDateRange = () => {
  const now = new Date();
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0, 0));
  const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 23, 59, 59, 999));
  return { start: start.toISOString(), end: end.toISOString() };
};

export const isDateToday = (date: string | Date): boolean => {
  const day = formatDate(date);
  const now = new Date();
  const today = `${now.getUTCFullYear()}-${pad2(now.getUTCMonth() + 1)}-${pad2(now.getUTCDate())}`;
  return day === today;
};

export const getCurrentDateTime = (): string => {
  return format(new Date(), "yyyy-MM-dd'T'HH:mm");
};
