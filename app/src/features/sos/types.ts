export type SosPhase =
  | 'idle'
  | 'holding'
  | 'sending'
  | 'waiting'
  | 'claimed'
  | 'no-response'
  | 'failed';

export interface SosRequest {
  id: string;
  createdAt: string;
}

export interface SosState {
  phase: SosPhase;
  request: SosRequest | null;
  claimantName: string | null;
  errorMessage: string | null;
}

export type SosAction =
  | { type: 'HOLD_STARTED' }
  | { type: 'HOLD_CANCELLED' }
  | { type: 'HOLD_COMPLETED' }
  | { type: 'CREATE_SUCCEEDED'; request: SosRequest }
  | { type: 'CREATE_FAILED'; message: string }
  | { type: 'CLAIMED'; claimantName: string }
  | { type: 'TIMED_OUT' }
  | { type: 'RETRY_STARTED' }
  | { type: 'RESET' };

export interface SosGatewayEvent {
  type: 'claimed' | 'timeout';
  claimantName?: string;
}
