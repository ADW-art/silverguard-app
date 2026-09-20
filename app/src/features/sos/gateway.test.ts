import { afterEach, describe, expect, it, vi } from 'vitest';
import { createMockSosGateway } from './gateway';

describe('mock SOS gateway', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('creates a request and emits a claimed event', async () => {
    vi.useFakeTimers();
    const gateway = createMockSosGateway({ createDelayMs: 10, outcomeDelayMs: 20 });
    const requestPromise = gateway.createRequest();
    await vi.advanceTimersByTimeAsync(10);
    const request = await requestPromise;
    const eventPromise = new Promise((resolve) => gateway.watchRequest(request.id, resolve));
    await vi.advanceTimersByTimeAsync(20);
    await expect(eventPromise).resolves.toMatchObject({ type: 'claimed', claimantName: '王丽' });
    gateway.dispose();
  });

  it('can emit timeout without creating another request', async () => {
    vi.useFakeTimers();
    const gateway = createMockSosGateway({ createDelayMs: 1, outcomeDelayMs: 1, outcome: 'timeout' });
    const requestPromise = gateway.createRequest();
    await vi.advanceTimersByTimeAsync(1);
    const request = await requestPromise;
    const eventPromise = new Promise((resolve) => gateway.watchRequest(request.id, resolve));
    await vi.advanceTimersByTimeAsync(1);
    await expect(eventPromise).resolves.toEqual({ type: 'timeout' });
    gateway.dispose();
  });

  it('reports a configured create failure', async () => {
    vi.useFakeTimers();
    const gateway = createMockSosGateway({ createDelayMs: 1, outcome: 'failure' });
    const result = gateway.createRequest();
    const assertion = expect(result).rejects.toThrow('模拟网关暂时无法发送');
    await vi.advanceTimersByTimeAsync(1);
    await assertion;
    gateway.dispose();
  });
});
