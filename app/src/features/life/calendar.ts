import type { CalendarDay, ScheduleItem } from './types';

const pad = (value: number) => String(value).padStart(2, '0');

export function toDateKey(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function fromDateKey(value: string): Date {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day);
}

export function addDays(date: Date, amount: number): Date {
  const next = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  next.setDate(next.getDate() + amount);
  return next;
}

export function buildMonthDays(year: number, month: number, today = new Date()): CalendarDay[] {
  const first = new Date(year, month, 1);
  const mondayOffset = (first.getDay() + 6) % 7;
  const gridStart = addDays(first, -mondayOffset);
  const todayKey = toDateKey(today);

  return Array.from({ length: 42 }, (_, index) => {
    const date = addDays(gridStart, index);
    const dateKey = toDateKey(date);
    return {
      date: dateKey,
      day: date.getDate(),
      inCurrentMonth: date.getMonth() === month,
      isToday: dateKey === todayKey,
    };
  });
}

export function formatMonthTitle(year: number, month: number): string {
  return `${year}年${month + 1}月`;
}

export function formatDateTitle(date: Date): string {
  const weekday = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
  return `${date.getMonth() + 1}月${date.getDate()}日 · ${weekday[date.getDay()]}`;
}

export function formatLunarDate(date: Date): string {
  try {
    return new Intl.DateTimeFormat('zh-CN-u-ca-chinese', {
      month: 'long',
      day: 'numeric',
    }).format(date);
  } catch {
    return '农历信息暂不可用';
  }
}

export function schedulesForDate(items: ScheduleItem[], date: string): ScheduleItem[] {
  return items
    .filter((item) => item.date === date)
    .sort((left, right) => left.time.localeCompare(right.time));
}
