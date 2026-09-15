import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date | null | undefined): string {
  if (!date) return '—';
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
  }).format(new Date(date));
}

export function formatDateTime(date: string | Date | null | undefined): string {
  if (!date) return '—';
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  }).format(new Date(date));
}

export function formatNumber(n: number | null | undefined): string {
  if (n === null || n === undefined) return '0';
  return new Intl.NumberFormat('en-IN').format(n);
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map(s => s[0])
    .join('')
    .toUpperCase();
}

export function truncate(str: string, len = 50): string {
  if (!str) return '';
  return str.length > len ? str.slice(0, len) + '…' : str;
}

export function debounce<T extends (...args: unknown[]) => unknown>(fn: T, ms = 300) {
  let timer: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
}
