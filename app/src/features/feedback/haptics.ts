export type HapticKind = 'light' | 'success' | 'warning';

export function triggerHaptic(kind: HapticKind = 'light'): void {
  try {
    // #ifdef APP-PLUS
    uni.vibrateShort({
      type: kind === 'warning' ? 'heavy' : kind === 'success' ? 'medium' : 'light',
    });
    // #endif
  } catch {
    // 振动只增强反馈，不得阻断核心操作。
  }
}
