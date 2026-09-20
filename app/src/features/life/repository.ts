import { addDays, schedulesForDate, toDateKey } from './calendar';
import type { ScheduleItem } from './types';

export interface ScheduleRepository {
  listAll(): ScheduleItem[];
  listByDate(date: string): ScheduleItem[];
}

function clone(items: ScheduleItem[]): ScheduleItem[] {
  return items.map((item) => ({ ...item }));
}

export function createDemoSchedule(referenceDate = new Date()): ScheduleItem[] {
  const today = toDateKey(referenceDate);
  const tomorrow = toDateKey(addDays(referenceDate, 1));
  const nextWeek = toDateKey(addDays(referenceDate, 4));
  return [
    { id: 'today-medication', date: today, time: '12:00', title: '服用降压药', kind: 'medication', source: 'demo-local' },
    { id: 'today-family-call', date: today, time: '16:30', title: '女儿来电话', kind: 'family', source: 'demo-local' },
    { id: 'tomorrow-walk', date: tomorrow, time: '09:00', title: '社区散步', kind: 'daily', source: 'demo-local' },
    { id: 'next-appointment', date: nextWeek, time: '09:30', title: '社区服务预约', kind: 'appointment', source: 'demo-local' },
  ];
}

export function createScheduleRepository(
  items: ScheduleItem[] = createDemoSchedule(),
): ScheduleRepository {
  const data = clone(items);
  return {
    listAll: () => clone(data),
    listByDate: (date) => clone(schedulesForDate(data, date)),
  };
}
