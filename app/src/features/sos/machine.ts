import type { SosAction, SosState } from './types';

export const initialSosState: SosState = {
  phase: 'idle',
  request: null,
  claimantName: null,
  errorMessage: null,
};

export function isActiveSos(state: SosState): boolean {
  return ['sending', 'waiting', 'claimed', 'no-response'].includes(state.phase);
}

export function transitionSos(state: SosState, action: SosAction): SosState {
  switch (action.type) {
    case 'HOLD_STARTED':
      return state.phase === 'idle' ? { ...state, phase: 'holding', errorMessage: null } : state;
    case 'HOLD_CANCELLED':
      return state.phase === 'holding' ? { ...initialSosState } : state;
    case 'HOLD_COMPLETED':
      return state.phase === 'holding' ? { ...state, phase: 'sending' } : state;
    case 'CREATE_SUCCEEDED':
      return state.phase === 'sending'
        ? { ...state, phase: 'waiting', request: action.request, errorMessage: null }
        : state;
    case 'CREATE_FAILED':
      return state.phase === 'sending'
        ? { ...state, phase: 'failed', errorMessage: action.message }
        : state;
    case 'CLAIMED':
      return state.phase === 'waiting'
        ? { ...state, phase: 'claimed', claimantName: action.claimantName }
        : state;
    case 'TIMED_OUT':
      return state.phase === 'waiting' ? { ...state, phase: 'no-response' } : state;
    case 'RETRY_STARTED':
      return ['failed', 'no-response'].includes(state.phase)
        ? { ...state, phase: 'sending', request: null, claimantName: null, errorMessage: null }
        : state;
    case 'RESET':
      return ['claimed', 'no-response', 'failed'].includes(state.phase)
        ? { ...initialSosState }
        : state;
    default:
      return state;
  }
}
