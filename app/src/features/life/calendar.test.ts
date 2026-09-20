import { describe, expect, it } from 'vitest';
import {
  buildMonthDays,
  formatDateTitle,
  schedulesForDate,
  toDateKey,
} from './calendar';
import { createDemoSchedule } from './repository';

describe('life calendar', () => {
  it('builds a stable Monday-first six-week grid', () => {
    const days = buildMonthDays(2026, 8, new Date(2026, 8, 20));
    expect(days).toHaveLength(42);
    expect(days[0]).toMatchObject({ date: '2026-08-31', inCurrentMonth: false });
    expect(days[41]).toMatchObject({ date: '2026-10-11', inCurrentMonth: false });
    expect(days.find((day) => day.date === '2026-09-20')?.isToday).toBe(true);
  });

  it('uses local date keys and readable weekday titles', () => {
    const date = new Date(2026, 8, 20);
    expect(toDateKey(date)).toBe('2026-09-20');
    expect(formatDateTitle(date)).toBe('9月20日 · 星期日');
  });

  it('filters and sorts local demo schedules by date', () => {
    const items = createDemoSchedule(new Date(2026, 8, 20));
    const today = schedulesForDate(items, '2026-09-20');
    expect(today.map((item) => item.time)).toEqual(['12:00', '16:30']);
    expect(today.every((item) => item.source === 'demo-local')).toBe(true);
  });
});
