import { NativeModules, Platform } from 'react-native';

const LINKING_ERROR =
  `The package 'biometric-sdk-react-native' doesn't seem to be linked. Make sure: \n\n` +
  Platform.select({ ios: "- You have run 'pod install'\n", default: '' }) +
  '- You rebuilt the app after installing the package\n' +
  '- You are not using Expo Go\n';

const BiometricSdkReactNative = NativeModules.BiometricSdkReactNative
  ? NativeModules.BiometricSdkReactNative
  : new Proxy(
      {},
      {
        get() {
          throw new Error(LINKING_ERROR);
        },
      }
    );

export function configure(config: any): Promise<string> {
  return BiometricSdkReactNative.configure(config);
}

export function faceExtractAndEncode(image: string): Promise<string> {
  return BiometricSdkReactNative.faceExtractAndEncode(image);
}

export function faceCompare(
  template1: string,
  template2: string
): Promise<boolean> {
  return BiometricSdkReactNative.faceCompare(template1, template2);
}
