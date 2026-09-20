import { computed, onBeforeUnmount, ref } from 'vue';
import type { SosGateway } from './gateway';
import { initialSosState, isActiveSos, transitionSos } from './machine';
import type { SosAction, SosState } from './types';

const HOLD_DURATION_MS = 3000;

export function useSosFlow(gateway: SosGateway, options: { registerLifecycle?: boolean } = {}) {
  const state = ref<SosState>({ ...initialSosState });
  const holdElapsedMs = ref(0);
  let holdStartedAt = 0;
  let holdTimer: ReturnType<typeof setInterval> | null = null;
  let stopWatching: (() => void) | null = null;

  const dispatch = (action: SosAction) => {
    state.value = transitionSos(state.value, action);
  };

  const clearHoldTimer = () => {
    if (holdTimer) clearInterval(holdTimer);
    holdTimer = null;
  };

  const clearWatcher = () => {
    stopWatching?.();
    stopWatching = null;
  };

  const submit = async () => {
    clearWatcher();
    try {
      const request = await gateway.createRequest();
      dispatch({ type: 'CREATE_SUCCEEDED', request });
      stopWatching = gateway.watchRequest(request.id, (event) => {
        if (event.type === 'claimed') {
          dispatch({ type: 'CLAIMED', claimantName: event.claimantName ?? '家人' });
        } else {
          dispatch({ type: 'TIMED_OUT' });
        }
        clearWatcher();
      });
    } catch (error) {
      dispatch({
        type: 'CREATE_FAILED',
        message: error instanceof Error ? error.message : '求助暂时未发送',
      });
    }
  };

  const completeHold = () => {
    if (state.value.phase !== 'holding') return;
    clearHoldTimer();
    holdElapsedMs.value = HOLD_DURATION_MS;
    dispatch({ type: 'HOLD_COMPLETED' });
    void submit();
  };

  const startHold = () => {
    if (isActiveSos(state.value) || state.value.phase !== 'idle') return;
    dispatch({ type: 'HOLD_STARTED' });
    holdStartedAt = Date.now();
    holdElapsedMs.value = 0;
    holdTimer = setInterval(() => {
      holdElapsedMs.value = Math.min(Date.now() - holdStartedAt, HOLD_DURATION_MS);
      if (holdElapsedMs.value >= HOLD_DURATION_MS) completeHold();
    }, 50);
  };

  const cancelHold = () => {
    if (state.value.phase !== 'holding') return;
    clearHoldTimer();
    holdElapsedMs.value = 0;
    dispatch({ type: 'HOLD_CANCELLED' });
  };

  const retry = () => {
    if (!['failed', 'no-response'].includes(state.value.phase)) return;
    dispatch({ type: 'RETRY_STARTED' });
    void submit();
  };

  const reset = () => {
    clearWatcher();
    dispatch({ type: 'RESET' });
  };

  const dispose = () => {
    clearHoldTimer();
    clearWatcher();
    gateway.dispose();
  };

  if (options.registerLifecycle !== false) onBeforeUnmount(dispose);

  return {
    state,
    holdProgress: computed(() => Math.round((holdElapsedMs.value / HOLD_DURATION_MS) * 100)),
    remainingSeconds: computed(() => Math.max(1, Math.ceil((HOLD_DURATION_MS - holdElapsedMs.value) / 1000))),
    overlayVisible: computed(() => state.value.phase !== 'idle'),
    startHold,
    cancelHold,
    retry,
    reset,
    dispose,
  };
}
