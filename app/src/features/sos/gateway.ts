import type { SosGatewayEvent, SosRequest } from './types';

export interface SosGateway {
  createRequest(): Promise<SosRequest>;
  watchRequest(requestId: string, onEvent: (event: SosGatewayEvent) => void): () => void;
  dispose(): void;
}

export interface MockSosGatewayOptions {
  createDelayMs?: number;
  outcomeDelayMs?: number;
  outcome?: 'claimed' | 'timeout' | 'failure';
  claimantName?: string;
}

export function createMockSosGateway(options: MockSosGatewayOptions = {}): SosGateway {
  const {
    createDelayMs = 650,
    outcomeDelayMs = 4200,
    outcome = 'claimed',
    claimantName = '王丽',
  } = options;
  const timers = new Set<ReturnType<typeof setTimeout>>();
  let sequence = 0;

  const later = (callback: () => void, delay: number) => {
    const timer = setTimeout(() => {
      timers.delete(timer);
      callback();
    }, delay);
    timers.add(timer);
    return timer;
  };

  return {
    createRequest() {
      return new Promise((resolve, reject) => {
        later(() => {
          if (outcome === 'failure') {
            reject(new Error('模拟网关暂时无法发送'));
            return;
          }
          sequence += 1;
          resolve({ id: `demo-sos-${sequence}`, createdAt: new Date().toISOString() });
        }, createDelayMs);
      });
    },
    watchRequest(_requestId, onEvent) {
      const timer = later(() => {
        onEvent(outcome === 'timeout'
          ? { type: 'timeout' }
          : { type: 'claimed', claimantName });
      }, outcomeDelayMs);
      return () => {
        clearTimeout(timer);
        timers.delete(timer);
      };
    },
    dispose() {
      timers.forEach((timer) => clearTimeout(timer));
      timers.clear();
    },
  };
}
