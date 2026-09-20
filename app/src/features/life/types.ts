export type ScheduleKind = 'medication' | 'family' | 'appointment' | 'daily';

export interface ScheduleItem {
  id: string;
  date: string;
  time: string;
  title: string;
  kind: ScheduleKind;
  source: 'demo-local';
}

export interface CalendarDay {
  date: string;
  day: number;
  inCurrentMonth: boolean;
  isToday: boolean;
}
