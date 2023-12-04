# biometric-sdk-react-native

Biometric SDK

## Installation

```sh
npm install @iriscan/biometric-sdk-react-native
```

## Usage

```js
import {
  configure, faceCompare, faceScore, livenessScore, livenessValidate
} from '@iriscan/biometric-sdk-react-native';

// configure sdk
let config = {
  withFace: {
    encoder: {
      tfModel: {
        path: 'https://github.com/biometric-technologies/tensorflow-facenet-model-test/raw/master/model.tflite',
        inputWidth: 160,
        inputHeight: 160,
        outputLength: 512,
        // optional
        modelChecksum: '797b4d99794965749635352d55da38d4748c28c659ee1502338badee4614ed06',
      },
    },
    matcher: {
      threshold: 1.0,
    },
    liveness: {
      tfModel: {
        path: 'https://github.com/biometric-technologies/liveness-detection-model/releases/download/v0.2.0/deePix.tflite',
        inputWidth: 224,
        inputHeight: 224,
        // 0.0 - real, 1.0 - spoof
        threshold: 0.5,
        // optional
        // modelChecksum: "797b4d99794965749635352d55da38d4748c28c659ee1502338badee4614ed06",
      },
    },
  },
};
configure(config).then(() => console.log('Biometric SDK Ready'));

// recognition
// create templates from base64 image
const template1 = await faceExtractAndEncode(image1.data);
const template2 = await faceExtractAndEncode(image2.data);
// calculatee match score
const result = await BiometricSdkReactNative.faceScore(template1, template2);
console.log(`Result = ${result}`)

// liveness
// calculatee score
const livenessScore = await livenessScore(image1.data);
const live = livenessScore < 0.5;
// check for result
const isLive = livenessValidate(image1.data)
```

## Contributing

See the [contributing guide](CONTRIBUTING.md) to learn how to contribute to the repository and the development workflow.

## License

MIT

---

Made with [create-react-native-library](https://github.com/callstack/react-native-builder-bob)
