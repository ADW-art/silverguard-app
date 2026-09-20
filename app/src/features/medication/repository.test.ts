import { describe, expect, it } from 'vitest';
import { createMedicationRepository, type MedicationStorage } from './repository';

function createMemoryStorage(initial?: unknown): MedicationStorage {
  const values = new Map<string, unknown>();
  if (initial !== undefined) values.set('silverguard.medication.today.v1', initial);
  return {
    get: (key) => values.get(key),
    set: (key, value) => values.set(key, value),
  };
}

describe('medication repository', () => {
  it('initializes a valid demo schedule when storage is empty', () => {
    const repository = createMedicationRepository(createMemoryStorage());
    expect(repository.listToday()).toHaveLength(3);
  });

  it('persists confirmation across reads', () => {
    const storage = createMemoryStorage();
    const repository = createMedicationRepository(storage);
    repository.confirm('noon-pressure', '12:03');
    expect(repository.listToday().find((plan) => plan.id === 'noon-pressure')).toMatchObject({
      status: 'completed',
      completedAt: '12:03',
    });
  });

  it('replaces malformed local data with the demo schedule', () => {
    const repository = createMedicationRepository(createMemoryStorage([{ id: 1 }]));
    expect(repository.listToday()).toHaveLength(3);
  });
});
