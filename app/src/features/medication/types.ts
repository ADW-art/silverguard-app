export type MedicationStatus = 'upcoming' | 'reminding' | 'completed' | 'missed';

export interface MedicationPlan {
  id: string;
  time: string;
  medicineName: string;
  dose: string;
  status: MedicationStatus;
  completedAt?: string;
}

export type MedicationActionResult =
  | 'updated'
  | 'already-completed'
  | 'not-reminding'
  | 'not-found';

export interface MedicationUpdate {
  plans: MedicationPlan[];
  result: MedicationActionResult;
}
