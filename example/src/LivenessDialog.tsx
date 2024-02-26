import { Button, Text, TouchableOpacity, View } from 'react-native';
import * as React from 'react';
import { useEffect, useRef, useState } from 'react';
import { Camera, useCameraDevice } from 'react-native-vision-camera';
import { livenessGetDirection } from '@iriscan/biometric-sdk-react-native';
import RNFS from 'react-native-fs';

export default function LivenessDialog({ close }) {
  const device = useCameraDevice('front');
  const camera = useRef<Camera>(null);
  const actions = ['UP', 'DOWN', 'RIGHT', 'LEFT'];
  const [actionText, setActionText] = useState('');

  useEffect(() => {
    checkActions();
  }, []);

  const waitForDirection = async (action) => {
    let count = 0;
    return new Promise((resolve, reject) => {
      const intervalId = setInterval(async () => {
        try {
          const photo = await camera.current!.takePhoto();
          const photoData = await RNFS.readFile(photo.path, 'base64');
          const direction = await livenessGetDirection(photoData);
          console.log(`Found head direction ${direction}`);
          if (direction === action) {
            console.log('Action passed');
            clearInterval(intervalId);
            resolve(true);
          }
          if (count >= 5) {
            clearInterval(intervalId);
            resolve(false);
          }
          count += 1;
        } catch (error) {
          console.log('ERROR: ' + JSON.stringify(error));
          clearInterval(intervalId);
          reject(false);
        }
      }, 1000);
    });
  };

  const checkActions = async () => {
    for (let i = 0; i < actions.length; i++) {
      setActionText(`Please turn head ${actions[i]}`);
      const actionSuccess = await waitForDirection(actions[i]);
      if (!actionSuccess) {
        close(false);
      }
    }
    console.log(`All actions passed`);
    close(true);
  };

  return (
    <View style={{ flex: 1 }}>
      <Camera
        ref={camera}
        photo={true}
        style={{ flex: 1, justifyContent: 'flex-end', alignItems: 'center' }}
        device={device}
        isActive={true}
      >
        <TouchableOpacity style={{zIndex: 1111}}>
          <Text
            style={{ backgroundColor: 'black', color: 'white', marginBottom: 30, fontSize: 28 }}>{actionText}</Text>
          <Button title='Cancel' onPress={(e) => {
            close(false);
          }} />
        </TouchableOpacity>
      </Camera>
    </View>
  );
}
