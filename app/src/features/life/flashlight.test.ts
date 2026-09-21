import { describe, expect, it } from 'vitest';
import { FlashlightController, FlashlightError, flashlightMessage } from './flashlight';

describe('FlashlightController', () => {
  it('serializes an in-flight turn-on before a safety turn-off', async () => {
    const calls: boolean[] = [];
    let release!: () => void;
    const wait = new Promise<void>((resolve) => { release = resolve; });
    const controller = new FlashlightController({
      async setEnabled(enabled) {
        calls.push(enabled);
        if (enabled) await wait;
      },
    });

    const turningOn = controller.turnOn();
    const turningOff = controller.turnOff();
    release();
    const [remainedOn] = await Promise.all([turningOn, turningOff]);

    expect(calls).toEqual([true, false]);
    expect(remainedOn).toBe(false);
    expect(controller.isEnabled()).toBe(false);
  });

  it('resets state even when the native turn-off call fails', async () => {
    const controller = new FlashlightController({
      async setEnabled(enabled) {
        if (!enabled) throw new Error('camera service unavailable');
      },
    });

    await controller.turnOn();
    await expect(controller.turnOff()).rejects.toThrow('camera service unavailable');
    expect(controller.isEnabled()).toBe(false);
  });
});

describe('flashlightMessage', () => {
  it('gives an actionable message for a permanently blocked permission', () => {
    const error = new FlashlightError('permission-blocked', 'blocked');
    expect(flashlightMessage(error)).toContain('系统设置');
  });
});
