# biometric-sdk-react-native

Biometric SDK

## Installation

```sh
npm install biometric-sdk-react-native
```

## Usage

```js
import {
  configure,
  faceCompare,
  faceExtractAndEncode,
} from 'biometric-sdk-react-native';

// configure sdk
const config = {
  withFace: {
    encoder: {
      faceNetModel: {
        tfliteModelPath: 'assets://facenet-default.tflite',
        tfliteModelChecksum: -1,
        inputWidth: 160,
        inputHeight: 160,
        outputLength: 128,
      },
    },
    matcher: {
      threshold: 10.0,
    },
  },
};
configure(config).then(() => console.log('Biometric SDK Ready'));

// use
// create templates from base64 image
const template1 = await faceExtractAndEncode(image1.data);
const template2 = await faceExtractAndEncode(image2.data);

// compare templates
const result = await faceCompare(template1, template2);
console.log(`Result = ${result}`)

// prints
// Result = true

```

## Contributing

See the [contributing guide](CONTRIBUTING.md) to learn how to contribute to the repository and the development workflow.

## License

MIT

---

Made with [create-react-native-library](https://github.com/callstack/react-native-builder-bob)
