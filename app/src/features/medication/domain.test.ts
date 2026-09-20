import { describe, expect, it } from 'vitest';
import {
  addMinutesToClock,
  confirmMedication,
  countRemaining,
  createDefaultMedicationPlans,
  getPriorityMedication,
  snoozeMedication,
} from './domain';

describe('medication domain', () => {
  it('confirms a pending medication once', () => {
    const first = confirmMedication(createDefaultMedicationPlans(), 'noon-pressure', '12:01');
    expect(first.result).toBe('updated');
    expect(first.plans.find((plan) => plan.id === 'noon-pressure')).toMatchObject({
      status: 'completed',
      completedAt: '12:01',
    });

    const duplicate = confirmMedication(first.plans, 'noon-pressure', '12:02');
    expect(duplicate.result).toBe('already-completed');
    expect(duplicate.plans.find((plan) => plan.id === 'noon-pressure')?.completedAt).toBe('12:01');
  });

  it('snoozes only an active reminder by ten minutes', () => {
    const update = snoozeMedication(createDefaultMedicationPlans(), 'noon-pressure');
    expect(update.result).toBe('updated');
    expect(update.plans.find((plan) => plan.id === 'noon-pressure')).toMatchObject({
      status: 'upcoming',
      time: '12:10',
    });
    expect(snoozeMedication(update.plans, 'noon-pressure').result).toBe('not-reminding');
  });

  it('does not create medical advice for a missed state', () => {
    const plans = createDefaultMedicationPlans();
    plans[1] = { ...plans[1], status: 'missed' };
    const target = getPriorityMedication(plans);
    expect(target?.status).toBe('missed');
    expect(target).not.toHaveProperty('advice');
  });

  it('counts remaining plans and prioritizes the current reminder', () => {
    const plans = createDefaultMedicationPlans();
    expect(countRemaining(plans)).toBe(2);
    expect(getPriorityMedication(plans)?.id).toBe('noon-pressure');
  });

  it('wraps reminder time at midnight', () => {
    expect(addMinutesToClock('23:55', 10)).toBe('00:05');
  });
});
