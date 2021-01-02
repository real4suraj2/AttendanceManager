import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  Dimensions
} from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import Loading from '../components/Loading';
import { IMAGES } from '../constants';
import { TouchableOpacity } from 'react-native-gesture-handler';
import clearRouteHelper from '../helper/clear-route-helper';

const { height, width } = Dimensions.get("window")

export default ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({});
  useEffect(() => {
    const fetch = async () => {
      try {
        const info = {};
        info.userId = await AsyncStorage.getItem('enrollment');
        info.userName = await AsyncStorage.getItem('name');
        info.classId = await AsyncStorage.getItem('classId');
        info.accsoftId = await AsyncStorage.getItem('accsoftId');
        info.photoURL = await AsyncStorage.getItem('photoURL');
        console.log(info);
        setLoading(false);
        setData({ ...info });
      }
      catch (error) {
        setLoading(false);
        console.log("Error!", error);
      }
    }
    fetch();
  }, [])
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Image
        source={IMAGES[6]}
        style={[
          StyleSheet.absoluteFill,
          {
            position: 'absolute',
            width,
            resizeMode: 'stretch'
          }
        ]}
      />

      { !loading &&
        <View style={{ justifyContent: 'center', alignItems: 'center' }}>
          <Image style={{ width: 100, height: 100 }} source={IMAGES[7]} />
          <View style={styles.body}>
            <View style={{ flex: 0.6, alignItems: 'center', justifyContent: 'space-between' }}>
              <Text style={{fontWeight: 'bold', fontSize: 20}}>{data.userName}</Text>
              <Text style={{fontWeight: 'bold', fontSize: 18  }}>{data.userId}</Text>
              <Text style={{fontStyle: 'italic', fontSize: 16}}>Class ID : {data.classId}</Text>
              <Text style={{fontStyle: 'italic', fontSize: 16}}>Accsoft ID : {data.accsoftId}</Text>
            </View>
            <View style={{ flex: 0.4, alignItems: 'center', justifyContent: 'flex-end' }}>
              <TouchableOpacity style={styles.viewFull} onPress={async () => {
                await AsyncStorage.clear();
                navigation.navigate('login');
                clearRouteHelper(navigation, 'login');
              }}>
                <Text style={{ fontWeight: 'bold' }}>Logout</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      }
      {
        loading && <Loading />
      }
    </View>
  );
}


const styles = StyleSheet.create({
  body: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    width: width * 0.9,
    height: 280,
    borderRadius: 12,
    marginTop: 30,
    borderWidth: 2,
    justifyContent: 'space-around',
    padding: 12,
  },
  viewFull: {
    height: 45,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: 150,
    borderRadius: 150,
    backgroundColor: "orange",
  }
});
