import { FlashlightError, type FlashlightDriver } from './flashlight';

const CAMERA_PERMISSION = 'android.permission.CAMERA';
const FLASH_FEATURE = 'android.hardware.camera.flash';

interface PermissionResult {
  granted?: string[];
  deniedPresent?: string[];
  deniedAlways?: string[];
}

interface CameraManagerProxy {
  getCameraIdList(): ArrayLike<string>;
  getCameraCharacteristics(cameraId: string): PlusAndroidInstanceObject;
  setTorchMode(cameraId: string, enabled: boolean): void;
}

function unsupportedDriver(): FlashlightDriver {
  return {
    async setEnabled(enabled) {
      if (enabled) {
        throw new FlashlightError('unsupported-platform', 'Flashlight is only available on Android App.');
      }
    },
  };
}

function requestCameraPermission(): Promise<void> {
  return new Promise((resolve, reject) => {
    plus.android.requestPermissions(
      [CAMERA_PERMISSION],
      (result: PermissionResult) => {
        if (result.granted?.includes(CAMERA_PERMISSION)) {
          resolve();
          return;
        }
        if (result.deniedAlways?.includes(CAMERA_PERMISSION)) {
          reject(new FlashlightError('permission-blocked', 'Camera permission was permanently denied.'));
          return;
        }
        reject(new FlashlightError('permission-denied', 'Camera permission was denied.'));
      },
      () => reject(new FlashlightError('native-error', 'Camera permission request failed.')),
    );
  });
}

function nativeBoolean(value: unknown): boolean {
  if (typeof value === 'boolean') return value;
  if (!value || typeof value !== 'object') return false;
  try {
    return Boolean(plus.android.invoke(value as PlusAndroidInstanceObject, 'booleanValue'));
  } catch {
    return false;
  }
}

function createAndroidDriver(): FlashlightDriver {
  let manager: CameraManagerProxy | null = null;
  let cameraId: string | null = null;

  function getSdkVersion(): number {
    const version = plus.android.importClass('android.os.Build$VERSION');
    return Number(version.plusGetAttribute('SDK_INT'));
  }

  function hasFlashFeature(): boolean {
    const activity = plus.android.runtimeMainActivity();
    const packageManager = plus.android.invoke(activity, 'getPackageManager') as PlusAndroidInstanceObject;
    return nativeBoolean(plus.android.invoke(packageManager, 'hasSystemFeature', FLASH_FEATURE));
  }

  function ensureManager(): CameraManagerProxy {
    if (manager) return manager;
    const activity = plus.android.runtimeMainActivity();
    const nativeManager = plus.android.invoke(activity, 'getSystemService', 'camera') as PlusAndroidInstanceObject;
    plus.android.importClass(nativeManager);
    manager = nativeManager as unknown as CameraManagerProxy;
    return manager;
  }

  function findFlashCamera(nativeManager: CameraManagerProxy): string {
    if (cameraId) return cameraId;
    const characteristicsClass = plus.android.importClass('android.hardware.camera2.CameraCharacteristics');
    const flashKey = characteristicsClass.plusGetAttribute('FLASH_INFO_AVAILABLE');
    const ids = Array.from(nativeManager.getCameraIdList());
    const match = ids.find((id) => {
      const characteristics = nativeManager.getCameraCharacteristics(String(id));
      return nativeBoolean(plus.android.invoke(characteristics, 'get', flashKey));
    });
    if (match === undefined) throw new FlashlightError('no-flash', 'No flash camera is available.');
    cameraId = String(match);
    return cameraId;
  }

  return {
    async setEnabled(enabled) {
      if (!enabled && (!manager || !cameraId)) return;
      if (getSdkVersion() < 23) {
        throw new FlashlightError('unsupported-version', 'Camera torch mode requires Android API 23.');
      }
      if (enabled) {
        if (!hasFlashFeature()) throw new FlashlightError('no-flash', 'Device does not report a camera flash.');
        await requestCameraPermission();
      }
      try {
        const nativeManager = ensureManager();
        nativeManager.setTorchMode(findFlashCamera(nativeManager), enabled);
      } catch (error) {
        if (error instanceof FlashlightError) throw error;
        const message = error instanceof Error ? error.message : String(error);
        const busy = /CAMERA_IN_USE|MAX_CAMERAS_IN_USE|in use/i.test(message);
        throw new FlashlightError(busy ? 'camera-busy' : 'native-error', message);
      }
    },
  };
}

export function createPlatformFlashlightDriver(): FlashlightDriver {
  let driver = unsupportedDriver();
  // #ifdef APP-PLUS
  if (uni.getSystemInfoSync().platform === 'android') driver = createAndroidDriver();
  // #endif
  return driver;
}
