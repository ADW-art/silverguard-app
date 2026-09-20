import type {
  MedicationPlan,
  MedicationStatus,
  MedicationUpdate,
} from './types';

const statusPriority: Record<MedicationStatus, number> = {
  reminding: 0,
  missed: 1,
  upcoming: 2,
  completed: 3,
};

export function createDefaultMedicationPlans(): MedicationPlan[] {
  return [
    {
      id: 'morning-vitamin',
      time: '08:00',
      medicineName: '维生素',
      dose: '1 片',
      status: 'completed',
      completedAt: '08:02',
    },
    {
      id: 'noon-pressure',
      time: '12:00',
      medicineName: '降压药',
      dose: '1 片',
      status: 'reminding',
    },
    {
      id: 'evening-pressure',
      time: '20:00',
      medicineName: '降压药',
      dose: '1 片',
      status: 'upcoming',
    },
  ];
}

export function confirmMedication(
  plans: MedicationPlan[],
  id: string,
  completedAt: string,
): MedicationUpdate {
  const target = plans.find((plan) => plan.id === id);
  if (!target) return { plans, result: 'not-found' };
  if (target.status === 'completed') return { plans, result: 'already-completed' };

  return {
    plans: plans.map((plan) => plan.id === id
      ? { ...plan, status: 'completed', completedAt }
      : plan),
    result: 'updated',
  };
}

export function snoozeMedication(
  plans: MedicationPlan[],
  id: string,
  minutes = 10,
): MedicationUpdate {
  const target = plans.find((plan) => plan.id === id);
  if (!target) return { plans, result: 'not-found' };
  if (target.status !== 'reminding') return { plans, result: 'not-reminding' };

  return {
    plans: plans.map((plan) => plan.id === id
      ? { ...plan, time: addMinutesToClock(plan.time, minutes), status: 'upcoming' }
      : plan),
    result: 'updated',
  };
}

export function countRemaining(plans: MedicationPlan[]): number {
  return plans.filter((plan) => plan.status !== 'completed').length;
}

export function getPriorityMedication(plans: MedicationPlan[]): MedicationPlan | undefined {
  return [...plans].sort((left, right) => {
    const statusDifference = statusPriority[left.status] - statusPriority[right.status];
    return statusDifference || left.time.localeCompare(right.time);
  })[0];
}

export function addMinutesToClock(time: string, minutes: number): string {
  const [hours, minute] = time.split(':').map(Number);
  const total = ((hours * 60 + minute + minutes) % 1440 + 1440) % 1440;
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
}
