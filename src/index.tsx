import { NativeModules, Platform } from 'react-native';

const LINKING_ERROR =
  `The package 'biometric-sdk-react-native' doesn't seem to be linked. Make sure: \n\n` +
  Platform.select({ ios: '- You have run \'pod install\'\n', default: '' }) +
  '- You rebuilt the app after installing the package\n' +
  '- You are not using Expo Go\n';

type FACE_DIRECTION = 'LEFT' | 'RIGHT' | 'UP' | 'DOWN' | 'STRAIGHT';

const BiometricSdkReactNative = NativeModules.BiometricSdkReactNative
  ? NativeModules.BiometricSdkReactNative
  : new Proxy(
    {},
    {
      get() {
        throw new Error(LINKING_ERROR);
      },
    },
  );

export async function configure(config: any): Promise<boolean> {
  try {
    console.log(`init with: ${JSON.stringify(config)}`);
    await BiometricSdkReactNative.configure(config);
    return true;
  } catch (e) {
    console.error('init failed', e);
    return false;
  }
}

export async function faceCompare(capturedImage: string, vcImage: string): Promise<boolean> {
  try {
    const template1 = await BiometricSdkReactNative.faceExtractAndEncode(capturedImage);
    const template2 = await BiometricSdkReactNative.faceExtractAndEncode(vcImage);
    return await BiometricSdkReactNative.faceCompare(template1, template2);
  } catch (e) {
    console.error('faceAuth auth failed', e);
    return false;
  }
}

export async function faceScore(capturedImage: string, vcImage: string): Promise<number> {
  try {
    const template1 = await BiometricSdkReactNative.faceExtractAndEncode(capturedImage);
    const template2 = await BiometricSdkReactNative.faceExtractAndEncode(vcImage);
    return await BiometricSdkReactNative.faceScore(template1, template2);
  } catch (e) {
    console.error('faceScore auth failed', e);
    return -1.0;
  }
}

export async function livenessValidate(capturedImage: string): Promise<boolean> {
  try {
    return !(await BiometricSdkReactNative.livenessValidate(capturedImage));
  } catch (e) {
    console.error('livenessScore validate failed', e);
    return false;
  }
}

export async function livenessScore(capturedImage: string): Promise<number> {
  try {
    return await BiometricSdkReactNative.livenessScore(capturedImage);
  } catch (e) {
    console.error('livenessScore  failed', e);
    return -1.0;
  }
}

export async function livenessGetDirection(capturedImage: string): Promise<FACE_DIRECTION> {
  try {
    switch ( await BiometricSdkReactNative.livenessGetDirection(capturedImage)) {
      case 1:
        return 'LEFT';
      case 2:
        return 'RIGHT';
      case 3:
        return 'UP';
      case 4:
        return 'DOWN';
      case 0:
      default:
        return 'STRAIGHT';
    }
  } catch (e) {
    console.error('liveness get direction failed', e);
    return 'STRAIGHT';
  }
}
