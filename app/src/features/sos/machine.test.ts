import { describe, expect, it } from 'vitest';
import { initialSosState, isActiveSos, transitionSos } from './machine';

describe('elder SOS state machine', () => {
  it('cancels an incomplete hold without creating a request', () => {
    const holding = transitionSos(initialSosState, { type: 'HOLD_STARTED' });
    const cancelled = transitionSos(holding, { type: 'HOLD_CANCELLED' });
    expect(cancelled).toEqual(initialSosState);
  });

  it('moves from a completed hold to waiting and claimed', () => {
    const holding = transitionSos(initialSosState, { type: 'HOLD_STARTED' });
    const sending = transitionSos(holding, { type: 'HOLD_COMPLETED' });
    const waiting = transitionSos(sending, {
      type: 'CREATE_SUCCEEDED',
      request: { id: 'demo-1', createdAt: '2026-09-20T00:00:00.000Z' },
    });
    const claimed = transitionSos(waiting, { type: 'CLAIMED', claimantName: '王丽' });

    expect(sending.phase).toBe('sending');
    expect(waiting.phase).toBe('waiting');
    expect(claimed).toMatchObject({ phase: 'claimed', claimantName: '王丽' });
  });

  it('ignores a second hold while a request is active', () => {
    const waiting = {
      ...initialSosState,
      phase: 'waiting' as const,
      request: { id: 'demo-1', createdAt: '2026-09-20T00:00:00.000Z' },
    };
    expect(isActiveSos(waiting)).toBe(true);
    expect(transitionSos(waiting, { type: 'HOLD_STARTED' })).toBe(waiting);
  });

  it('shows no-response after waiting times out', () => {
    const waiting = {
      ...initialSosState,
      phase: 'waiting' as const,
      request: { id: 'demo-1', createdAt: '2026-09-20T00:00:00.000Z' },
    };
    expect(transitionSos(waiting, { type: 'TIMED_OUT' }).phase).toBe('no-response');
  });

  it('allows retry only from terminal error states', () => {
    const failed = { ...initialSosState, phase: 'failed' as const, errorMessage: '失败' };
    expect(transitionSos(failed, { type: 'RETRY_STARTED' }).phase).toBe('sending');
    expect(transitionSos(initialSosState, { type: 'RETRY_STARTED' })).toBe(initialSosState);
  });
});
