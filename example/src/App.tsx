import * as React from 'react';

import { Alert, Button, Image, Modal, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import RNFS from 'react-native-fs';
import { configure, faceCompare, faceScore, livenessScore, livenessValidate } from '@iriscan/biometric-sdk-react-native';
import LivenessDialog from './LivenessDialog';
import { useCameraPermission } from 'react-native-vision-camera';

export default function App() {
  const [image1, setImage1] = React.useState<{ path: string; data: string }>();
  const [image2, setImage2] = React.useState<{ path: string; data: string }>();

  const [result, setResult] = React.useState<string>('');
  const [score, setScore] = React.useState<string>('');
  const [liveness1, setLiveness1] = React.useState<string>('Spoof: -, Score: -');
  const [liveness2, setLiveness2] = React.useState<string>('Spoof: -, Score: -');
  const [modalVisible, setModalVisible] = React.useState(false);
  const { hasPermission, requestPermission } = useCameraPermission()

  React.useEffect(() => {
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
          photo: {
            path: 'https://github.com/biometric-technologies/liveness-detection-model/releases/download/v0.2.0/deePix.tflite',
            inputWidth: 224,
            inputHeight: 224,
            // 0.0 - real, 1.0 - spoof
            threshold: 0.5,
            // optional
            // modelChecksum: "797b4d99794965749635352d55da38d4748c28c659ee1502338badee4614ed06",
          },
          direction: {
            threshold: 10.0
          }
        },
      },
    };
    configure(config).then(() => console.log('Biometric SDK Ready'));
    if (!hasPermission) {
      requestPermission().then((res) => console.log('Permission: ' + res));
    }
  }, []);

  const loadImage = async (
    index: number,
  ): Promise<{ path: string; data: string }> => {
    if (Platform.OS === 'ios') {
      const path = `${RNFS.MainBundlePath}/images/img${index}.jpg`;
      return {
        path: path,
        data: await RNFS.readFile(path, 'base64'),
      };
    } else if (Platform.OS === 'android') {
      const path = `images/img${index}.jpg`;
      return {
        path: `asset:/${path}`,
        data: await RNFS.readFileAssets(path, 'base64'),
      };
    } else {
      return { path: '', data: '' };
    }
  };
  const loadRandomImages = async () => {
    const image1Dat = await loadImage(Math.floor(Math.random() * 3) + 1);
    const image2Dat = await loadImage(Math.floor(Math.random() * 2) + 1);
    setImage1(image1Dat);
    setImage2(image2Dat);
  };

  const compareImages = async () => {
    if (image1 === undefined || image2 === undefined) {
      return;
    }
    setResult('Calculating ... Please wait');
    setScore('Score: -');
    setLiveness1('Spoof: -, Score: -');
    setLiveness2('Spoof: -, Score: -');
    const score = await faceScore(image1.data, image2.data);
    const result = await faceCompare(image1.data, image2.data);
    const liveness1Score = await livenessScore(image1.data);
    const liveness1Result = await livenessValidate(image1.data);
    const liveness2Score = await livenessScore(image2.data);
    const liveness2Result = await livenessValidate(image2.data);
    setLiveness1(`Spoof: ${liveness1Result}, Score: ${liveness1Score.toFixed(4)}`);
    setLiveness2(`Spoof: ${liveness2Result}, Score: ${liveness2Score.toFixed(4)}`);
    let matchResult: string;
    if (result) {
      matchResult = 'Images matched';
    } else {
      matchResult = 'Images not matched';
    }
    setResult(`Score: ${matchResult}`);
    setScore(score.toString(4));
  };

  const closeDialog = (result: boolean) => {
    setModalVisible(false);
    if (result) {
      Alert.alert('Liveness pass?', 'SUCCESS');
    } else  {
      Alert.alert('Liveness pass?', 'FAIL');
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Button title={'Load images'} onPress={loadRandomImages} />
      <View style={styles.vseparator} />
      <Text style={styles.text}>Picture 1</Text>
      <Image style={styles.img1} source={{ uri: image1?.path }} />
      <Text style={styles.text}>{liveness1}</Text>
      <Text style={styles.text}>Picture 2</Text>
      <Image style={styles.img2} source={{ uri: image2?.path }} />
      <Text style={styles.text}>{liveness2}</Text>
      <View style={styles.vseparator} />
      <Button title={'Compare'} onPress={compareImages} />
      <Text style={styles.text}>{score}</Text>
      <Text style={styles.text}>{result}</Text>
      <Button title={'Try Liveness'} onPress={() => setModalVisible(true)} />
      <Modal
        transparent={false}
        animationType="slide"
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(false);
        }}
      >
        <LivenessDialog close={closeDialog}/>
      </Modal>
      <View style={styles.vseparator} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingStart: 10,
    paddingEnd: 10,
    paddingTop: 25,
    paddingBottom: 75,
    backgroundColor: 'black',
  },
  contentContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullScreenModal: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white', // Or any other background color
  },
  text: {
    fontSize: 20,
    color: '#ffffff',
    alignSelf: 'center',
  },
  box: {
    width: 60,
    height: 60,
    marginVertical: 20,
  },
  vseparator: {
    height: 25,
  },
  img1: {
    justifyContent: 'center',
    alignItems: 'center',
    aspectRatio: 1,
    width: 320,
    height: 240,
    margin: 5,
  },
  img2: {
    justifyContent: 'center',
    alignItems: 'center',
    aspectRatio: 1,
    width: 320,
    height: 240,
    margin: 5,
  },
});
