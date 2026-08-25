import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatIDR(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(amount || 0);
}

export function formatDate(dateString: string | Date, options?: Intl.DateTimeFormatOptions): string {
  if (!dateString) return '-';
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
  if (isNaN(date.getTime())) return '-';
  
  const defaultOptions: Intl.DateTimeFormatOptions = {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    ...options,
  };
  return new Intl.DateTimeFormat('id-ID', defaultOptions).format(date);
}

export function formatDateTime(dateString: string | Date): string {
  return formatDate(dateString, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function getMonthName(monthNumber: number): string {
  const months = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];
  return months[monthNumber - 1] || '';
}

export function getCutOffDay(): number {
  if (typeof window === 'undefined') return 1;
  const saved = localStorage.getItem('fin_cutoff_day');
  return saved ? parseInt(saved, 10) : 1;
}

export function setCutOffDay(day: number): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('fin_cutoff_day', day.toString());
  }
}

export function getCutOffPeriod(cutoffDay?: number, refDate: Date = new Date()) {
  const activeCutoff = cutoffDay !== undefined ? cutoffDay : getCutOffDay();
  const year = refDate.getFullYear();
  const month = refDate.getMonth();
  const day = refDate.getDate();

  const formatStr = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const da = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${da}`;
  };

  if (activeCutoff <= 1) {
    const startDate = new Date(year, month, 1);
    const endDate = new Date(year, month + 1, 0);
    return {
      startDate: formatStr(startDate),
      endDate: formatStr(endDate),
      label: new Intl.DateTimeFormat('id-ID', { month: 'long', year: 'numeric' }).format(startDate),
      isCutOffSet: false,
      cutoffDay: 1,
    };
  }

  let periodStartYear = year;
  let periodStartMonth = month;

  if (day < activeCutoff) {
    periodStartMonth = month - 1;
    if (periodStartMonth < 0) {
      periodStartMonth = 11;
      periodStartYear = year - 1;
    }
  }

  const startDate = new Date(periodStartYear, periodStartMonth, activeCutoff);
  const endDate = new Date(periodStartYear, periodStartMonth + 1, activeCutoff - 1);

  const startLabel = new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short' }).format(startDate);
  const endLabel = new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }).format(endDate);

  return {
    startDate: formatStr(startDate),
    endDate: formatStr(endDate),
    label: `${startLabel} - ${endLabel}`,
    isCutOffSet: true,
    cutoffDay: activeCutoff,
  };
}
