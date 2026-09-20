import { afterEach, describe, expect, it, vi } from 'vitest';
import { createMockSosGateway } from './gateway';
import { useSosFlow } from './useSosFlow';

describe('SOS long-press flow', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('cancels before three seconds and creates no request', async () => {
    vi.useFakeTimers();
    const flow = useSosFlow(createMockSosGateway({ createDelayMs: 10 }), { registerLifecycle: false });
    flow.startHold();
    await vi.advanceTimersByTimeAsync(2999);
    expect(flow.state.value.phase).toBe('holding');
    flow.cancelHold();
    expect(flow.state.value.phase).toBe('idle');
    flow.dispose();
  });

  it('submits after three seconds and receives the claimed result', async () => {
    vi.useFakeTimers();
    const flow = useSosFlow(createMockSosGateway({
      createDelayMs: 10,
      outcomeDelayMs: 20,
      claimantName: '王丽',
    }), { registerLifecycle: false });

    flow.startHold();
    await vi.advanceTimersByTimeAsync(3000);
    expect(flow.state.value.phase).toBe('sending');
    await vi.advanceTimersByTimeAsync(10);
    expect(flow.state.value.phase).toBe('waiting');
    await vi.advanceTimersByTimeAsync(20);
    expect(flow.state.value).toMatchObject({ phase: 'claimed', claimantName: '王丽' });
    flow.dispose();
  });
});
