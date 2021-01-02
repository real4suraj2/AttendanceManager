import AsyncStorage from "@react-native-community/async-storage";
import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Image, TextInput, TouchableOpacity, ToastAndroid } from "react-native";
import Loading from "../components/Loading";
import { db } from "../constants";
import { IMAGES } from "../constants/images";
import clearRoute from '../helper/clear-route-helper';


const clearAsyncStorage = async() => {
    await AsyncStorage.clear();
}

export default ({ navigation }) => {
    const [text, setText] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        // clearAsyncStorage();
        const fetch = async () => {
            try {
                const userId = await AsyncStorage.getItem('enrollment');
                if (userId != null) {
                    navigation.navigate('Dashboard');
                    clearRoute(navigation, 'Dashboard');
                }
                setLoading(false);
            }
            catch (err) {
                setLoading(false);
            }
        };
        fetch();
    }, []);

    const handleLogin = async () => {
        setLoading(true);
        const username = text.toUpperCase();
        try {
            db.ref(`users/${username}`).once('value').then(snapshot => {
                const val = snapshot.val();
                setLoading(false);
                if (val != null) {
                    console.log(val);
                    if (val.password == password) {
                        const set = async (callback) => {
                            await AsyncStorage.setItem("enrollment", String(val.enrollment));
                            await AsyncStorage.setItem("name", String(val.name));
                            await AsyncStorage.setItem("classId", String(val.classId));
                            await AsyncStorage.setItem("accsoftId", String(val.accsoftId));
                            await AsyncStorage.setItem("photoURL", String(val.photoURL));
                            return callback();
                        };
                        set(() => {
                            navigation.navigate('Dashboard');
                            clearRoute(navigation, 'Dashboard');
                        });
                    }
                    else {
                        ToastAndroid.showWithGravityAndOffset(
                            "Check your credentials",
                            ToastAndroid.LONG,
                            ToastAndroid.BOTTOM,
                            25,
                            50
                        );
                    }
                }
            }).catch(err => {
                setLoading(false)
                ToastAndroid.showWithGravityAndOffset(
                    "Error : User not found",
                    ToastAndroid.LONG,
                    ToastAndroid.BOTTOM,
                    25,
                    50
                );
            });
        }
        catch (err) {
            setLoading(false);
            ToastAndroid.showWithGravityAndOffset(
                "Error Occured",
                ToastAndroid.LONG,
                ToastAndroid.BOTTOM,
                25,
                50
            );
        }
    }
    return (
        <View style={styles.container}>
            <Image style={styles.logo}
                source={IMAGES[7]} />
            <TextInput
                style={styles.input}
                placeholder="Enter Accsoft ID here..."
                onChangeText={(val) => setText(val)}
            />
            <TextInput
                style={styles.input}
                placeholder="Enter Password here..."
                secureTextEntry={true}
                onChangeText={(val) => setPassword(val)}
            />
            <TouchableOpacity style={styles.buttonstyle} onPress={async () => {
                await handleLogin();
            }}>
                <Text style={styles.loginText}>Login</Text>
            </TouchableOpacity>
            {
                loading && <Loading />
            }
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "white",
        alignItems: "center",
        justifyContent: 'center'
    },
    logo: {
        width: 100,
        height: 100,
    },
    input: {
        marginTop: 40,
        height: 50,
        width: 250,
        borderWidth: 1,
        padding: 10,
        paddingLeft: 20,
        borderRadius: 30,
    },
    buttonstyle: {
        height: 40,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 40,
        width: 200,
        borderRadius: 30,
        backgroundColor: '#3498db',
    },
    loginText: {
        color: 'white',

    }
})