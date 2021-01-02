import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView, Dimensions, TouchableOpacity, Text, Image, ToastAndroid, Linking } from 'react-native';
import { RNCamera } from 'react-native-camera';
import Icon from 'react-native-vector-icons/dist/MaterialIcons';
import Loading from '../components/Loading';
import base64ToArrayBuffer from 'base64-arraybuffer';
import { db, DAY, IMAGES } from '../constants';
import { showDate } from '../helper/date-helper';
import axios from 'axios';
import AsyncStorage from '@react-native-community/async-storage';

const { height, width } = Dimensions.get("window")
const key = 'YOUR COGNITIVE SERVICES API KEY';
const loc = 'southeastasia.api.cognitive.microsoft.com';
const uri = 'https://zoom.us/j/95457356861?pwd=aDZtM0tsQ28xektKdElnc0lRS0EzUT09&uname=Some%20Guy#success';

const base_instance_options = {
  baseURL: `https://${loc}/face/v1.0`,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Ocp-Apim-Subscription-Key': key
  }
};

const getLastInterval = (running) => {
  if (running != null) return running + 1;
  const interval = (new Date().getUTCHours() + 5) * 60 + (new Date().getUTCMinutes() + 30);
  let lectureNo = null;
  if (interval <= 690) lectureNo = 1;
  else if (interval <= 765) lectureNo = 2;
  else if (interval <= 870) lectureNo = 3;
  else if (interval <= 845) lecureNo = 4;
  return lectureNo;
}
const renderSession = (data, running = null) => {
  const flex = running == null ? 1 : 0.8;
  // console.log(data, running);
  // return <View></View>
  return (
    <View style={{ ...styles.box, flex, width: width * 0.8, backgroundColor: 'rgba(255, 255, 255, 0.8)' }}>
      <Text style={{ fontSize: 16, fontWeight: 'bold', textAlign: 'center' }}> {data.name} </Text>
      <Text style={{ fontSize: 16, fontWeight: 'bold', textAlign: 'center' }}> Lecture - {data.lectureNo} </Text>
      <Text style={{ fontSize: 12, fontStyle: 'italic' }}> Implementation of this part is pending </Text>
      <Text style={{ fontSize: 14 }}> {data.duration} </Text>
      <Text style={{ fontSize: 12, fontStyle: 'italic', textAlign: 'right' }}> {data.teacherName} </Text>
    </View>
  );
}

export default ({ navigation }) => {
  const [visible, setVisible] = useState(false);
  const [text, setText] = useState('View Full');
  const [showCamera, setShowCamera] = useState(false);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(null);
  const [ended, setEnded] = useState(false);
  const [userId, setUserId] = useState('');
  const [classId, setClassId] = useState('');

  let camera = null;

  useEffect(() => {
    const fetch = async () => {
      const enrollment = await AsyncStorage.getItem('enrollment');
      const id = await AsyncStorage.getItem('classId');
      setUserId(enrollment);
      setClassId(id);
      db.ref(`/timetables/${id}/${DAY[new Date().getDay()]}`).once('value').then(snapshot => {
        //console.log(snapshot.val());
        const val = snapshot.val();
        setLoading(false);
        setData(val);
      });
    }
    fetch();
  }, []);

  useEffect(() => {
    const subscription = setInterval(() => {
      const interval = (new Date().getUTCHours() + 5) * 60 + (new Date().getUTCMinutes() + 30);
      let lectureNo = null;
      if (interval >= 630 && interval <= 690) lectureNo = 1;
      else if (interval >= 705 && interval <= 765) lectureNo = 2;
      else if (interval >= 810 && interval <= 870) lectureNo = 3;
      else if (interval >= 885 && interval <= 845) lecureNo = 4;
      else if (interval > 845) {
        setEnded(true);
        clearInterval(subscription);
      }
      setRunning(lectureNo);
    }, 1000);
    return () => clearInterval(subscription);
  }, [])

  const takePictureAsync = async () => {
    if (camera != null) {
      const data = await camera.takePictureAsync({ quality: 0.25, base64: true });
      const selfie_ab = base64ToArrayBuffer.decode(data.base64);
      setLoading(true);
      try {
        const facedetect_instance_options = { ...base_instance_options };
        facedetect_instance_options.headers['Content-Type'] = 'application/octet-stream';
        const facedetect_instance = axios.create(facedetect_instance_options);

        const facedetect_res = await facedetect_instance.post(
          `/detect?returnFaceId=true&detectionModel=detection_02`,
          selfie_ab
        );

        console.log("face detect res: ", facedetect_res.data);

        if (facedetect_res.data.length) {

          const findsimilars_instance_options = { ...base_instance_options };
          findsimilars_instance_options.headers['Content-Type'] = 'application/json';
          const findsimilars_instance = axios.create(findsimilars_instance_options);
          const findsimilars_res = await findsimilars_instance.post(
            `/findsimilars`,
            {
              faceId: facedetect_res.data[0].faceId,
              faceListId: 'wern-faces-01',
              maxNumOfCandidatesReturned: 2,
              mode: 'matchPerson'
            }
          );

          console.log("find similars res: ", findsimilars_res.data);
          setLoading(false);
          if (findsimilars_res.data.length) {
          } else {
            Alert.alert("No match found", "Sorry, you are not registered");
          }
        } else {
          Alert.alert("error", "Cannot find any face. Please make sure there is sufficient light when taking a selfie");
        }
      } catch (err) {
        console.log("err: ", err);
        setLoading(false);
      }
    }
  }
  if (loading) return <Loading />
  return (
    <View style={styles.container}>
      <Image
        source={IMAGES[5]}
        style={[
          StyleSheet.absoluteFill,
          {
            position: 'absolute',
            width,
            resizeMode: 'cover'
          }
        ]}
      />
      {!ended && !showCamera && !loading && <ScrollView style={{ marginTop: 24, marginBottom: 48 }}>
        {
          running == null &&
          <View style={{ ...styles.box, overflow: 'hidden', justifyContent: 'center', height: 100 }}>
            <Image
              source={IMAGES[0]}
              style={[
                StyleSheet.absoluteFill,
                {
                  position: 'absolute',
                  width,
                  resizeMode: 'cover'
                }
              ]}
            />
            <Text style={{ fontWeight: 'bold', fontSize: 18, textAlign: 'center' }}>No Live Session</Text>
          </View>
        }
        {running != null &&
          <View style={{ ...styles.box, overflow: 'hidden', alignItems: 'center' }}>
            <Image source={IMAGES[0]} style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0
            }} />
            <View style={{ flex: 0.1 }}>
              <Text style={styles.heading}>Live Session</Text>
            </View>
            {
              data != null && renderSession(Object.values(data).filter(lecture => lecture.lectureNo == running)[0], running)
            }
            <View style={{ alignItems: 'center', justifyContent: 'center', flex: 0.1, marginTop: 12, marginBottom: 6 }}>
              <TouchableOpacity style={{ borderWidth: 2, paddingVertical: 8, paddingHorizontal: 36, backgroundColor: 'white', borderRadius: 12 }}
                onPress={() => {
                  setShowCamera(true);
                }}>
                <Text style={{ fontWeight: 'bold' }}>Attend</Text>
              </TouchableOpacity>
            </View>
          </View>
        }
        {
          running != 4 &&
          <View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 12, marginTop: 36, alignItems: 'center' }}>
              <Text style={{ ...styles.heading }}>Upcoming Sessions</Text>
              {
                running != 3 &&
                <TouchableOpacity onPress={() => {
                  const t = text == 'View Full' ? 'View Less' : 'View Full';
                  setVisible(!visible);
                  setText(t);
                }}>
                  <Text style={{ color: 'red', fontSize: 12, textDecorationLine: 'underline' }}>{text}</Text>
                </TouchableOpacity>
              }
            </View>
            <View style={{ ...styles.box, overflow: 'hidden', alignItems: 'center', justifyContent: 'center', height: 200, marginBottom: 24 }}>
              <Image source={IMAGES[1]} style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                resizeMode: 'cover'
              }} />
              {data != null && renderSession(Object.values(data).filter(lecture => lecture.lectureNo == getLastInterval(running))[0], false)}
            </View>
          </View>
        }
        {visible &&
          Object.values(data)
            .filter(lecture => lecture.lectureNo >= getLastInterval(running) + 1)
            .map((filteredLecture, idx) => <View key={"key" + idx} style={{ ...styles.box, justifyContent: 'center', overflow: 'hidden', alignItems: 'center', height: 200, marginBottom: 24 }}>
              <Image source={IMAGES[2 + idx]} style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                resizeMode: 'cover'
              }} />
              <View style={{ flex: 0.8 }}>
                {renderSession(filteredLecture, null)}
              </View>
            </View>)
        }
      </ScrollView>
      }
      {
        showCamera &&
        <View style={{ flex: 0.8, justifyContent: 'center' }}>
          <RNCamera
            ref={ref => {
              camera = ref;
            }}
            style={styles.preview}
            type={RNCamera.Constants.Type.front}
            flashMode={RNCamera.Constants.FlashMode.on}
            captureAudio={false}
          />

          <View style={styles.camer_button_container}>
            <TouchableOpacity onPress={async () => {
              await takePictureAsync();
              setShowCamera(false);
              ToastAndroid.showWithGravityAndOffset(
                "Match Found! Verification Successful",
                ToastAndroid.LONG,
                ToastAndroid.BOTTOM,
                25,
                50
              );
              const className = Object.values(data).filter(lecture => lecture.lectureNo == running)[0].name;
              console.log(className);
              const DATA = {};
              DATA[className] = 'Present';
              await db.ref(`history/${userId}/${showDate(new Date())}`).update({ ...DATA }).then(() => console.log("Updated"));
              await Linking.openURL(uri);
            }}>
              <Icon name="camera" size={50} color="teal" />
            </TouchableOpacity>
          </View>
        </View>
      }
      {
        ended && <View style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, justifyContent: 'center', alignItems: 'center', backgroundColor: 'white' }}>
          <Image
            source={IMAGES[5]}
            style={[
              StyleSheet.absoluteFill,
              {
                position: 'absolute',
                width,
                resizeMode: 'stretch'
              }
            ]}
          />

          <Text style={{ fontWeight: 'bold', fontSize: 18, color: 'white' }}> No Sessions Available For You </Text>
        </View>
      }
      {
        loading && <Loading />
      }
    </View>
  );

}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  heading: {
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 24,
    marginBottom: 12
  },
  box: {
    width: width * 0.9,
    borderRadius: 12,
    padding: 12,
  },
  inner: {
    flex: 1,
    backgroundColor: '#eee',
  },
  text: {
    marginBottom: 12,
    fontWeight: '700'
  },
  preview: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  camer_button_container: {
    flex: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    backgroundColor: '#333',
    borderRadius: 50,
    marginTop: 50,
    marginBottom: 100
  }
});