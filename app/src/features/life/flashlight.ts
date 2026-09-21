export type FlashlightFailureCode =
  | 'unsupported-platform'
  | 'unsupported-version'
  | 'permission-denied'
  | 'permission-blocked'
  | 'no-flash'
  | 'camera-busy'
  | 'native-error';

export class FlashlightError extends Error {
  constructor(
    public readonly code: FlashlightFailureCode,
    message: string,
  ) {
    super(message);
    this.name = 'FlashlightError';
  }
}

export interface FlashlightDriver {
  setEnabled(enabled: boolean): Promise<void>;
}

export class FlashlightController {
  private operation: Promise<void> = Promise.resolve();
  private enabled = false;
  private generation = 0;

  constructor(private readonly driver: FlashlightDriver) {}

  isEnabled(): boolean {
    return this.enabled;
  }

  turnOn(): Promise<boolean> {
    const generation = this.generation;
    return this.enqueue(async () => {
      if (this.enabled) return true;
      await this.driver.setEnabled(true);
      if (generation !== this.generation) {
        await this.driver.setEnabled(false);
        return false;
      }
      this.enabled = true;
      return true;
    });
  }

  turnOff(): Promise<void> {
    this.generation += 1;
    return this.enqueue(async () => {
      if (!this.enabled) return;
      try {
        await this.driver.setEnabled(false);
      } finally {
        this.enabled = false;
      }
    });
  }

  private enqueue<T>(task: () => Promise<T>): Promise<T> {
    const next = this.operation.then(task, task);
    this.operation = next.then(() => undefined, () => undefined);
    return next;
  }
}

export function flashlightMessage(error: unknown): string {
  if (!(error instanceof FlashlightError)) return '手电筒暂时无法打开，请稍后再试。';
  if (error.code === 'unsupported-platform') return '请在 Android 手机上使用手电筒。';
  if (error.code === 'unsupported-version') return '这台手机的系统版本暂不支持此手电筒。';
  if (error.code === 'permission-denied') return '需要相机权限才能打开闪光灯。';
  if (error.code === 'permission-blocked') return '相机权限已关闭，请在系统设置中允许后重试。';
  if (error.code === 'no-flash') return '这台手机没有可用的闪光灯。';
  if (error.code === 'camera-busy') return '闪光灯正被其他应用使用，请关闭相机后重试。';
  return '手电筒暂时无法打开，请稍后再试。';
}
