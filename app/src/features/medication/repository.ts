import {
  confirmMedication,
  createDefaultMedicationPlans,
  snoozeMedication,
} from './domain';
import type { MedicationPlan, MedicationUpdate } from './types';

const STORAGE_KEY = 'silverguard.medication.today.v1';
const allowedStatuses = new Set(['upcoming', 'reminding', 'completed', 'missed']);

export interface MedicationStorage {
  get(key: string): unknown;
  set(key: string, value: unknown): void;
}

export interface MedicationRepository {
  listToday(): MedicationPlan[];
  confirm(id: string, completedAt: string): MedicationUpdate;
  snooze(id: string): MedicationUpdate;
  resetDemo(): MedicationPlan[];
}

const uniStorage: MedicationStorage = {
  get: (key) => uni.getStorageSync(key),
  set: (key, value) => uni.setStorageSync(key, value),
};

function isMedicationPlan(value: unknown): value is MedicationPlan {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Partial<MedicationPlan>;
  return typeof candidate.id === 'string'
    && typeof candidate.time === 'string'
    && typeof candidate.medicineName === 'string'
    && typeof candidate.dose === 'string'
    && typeof candidate.status === 'string'
    && allowedStatuses.has(candidate.status);
}

function clonePlans(plans: MedicationPlan[]): MedicationPlan[] {
  return plans.map((plan) => ({ ...plan }));
}

export function createMedicationRepository(
  storage: MedicationStorage = uniStorage,
): MedicationRepository {
  function save(plans: MedicationPlan[]): MedicationPlan[] {
    storage.set(STORAGE_KEY, plans);
    return clonePlans(plans);
  }

  function listToday(): MedicationPlan[] {
    const stored = storage.get(STORAGE_KEY);
    if (Array.isArray(stored) && stored.every(isMedicationPlan)) return clonePlans(stored);
    return save(createDefaultMedicationPlans());
  }

  return {
    listToday,
    confirm(id, completedAt) {
      const update = confirmMedication(listToday(), id, completedAt);
      if (update.result === 'updated') save(update.plans);
      return { ...update, plans: clonePlans(update.plans) };
    },
    snooze(id) {
      const update = snoozeMedication(listToday(), id);
      if (update.result === 'updated') save(update.plans);
      return { ...update, plans: clonePlans(update.plans) };
    },
    resetDemo() {
      return save(createDefaultMedicationPlans());
    },
  };
}
