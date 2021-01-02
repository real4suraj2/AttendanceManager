import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, ToastAndroid, Image } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import DateTimePicker from '@react-native-community/datetimepicker';
import Icon from 'react-native-vector-icons/dist/FontAwesome';
import { db, IMAGES } from '../constants';
import Loading from '../components/Loading';
import { currentDate, showDate } from '../helper/date-helper';
import AsyncStorage from '@react-native-community/async-storage';

const { width, height } = Dimensions.get('window');


export default ({ navigation }) => {
    const [date, setDate] = useState(currentDate());
    const [ph, setPh] = useState('Select Date...');
    const [data, setData] = useState(null);
    const [visible, setVisible] = useState(false);
    const [showAlert, setShowAlert] = useState(null);
    const [loading, setLoading] = useState(true);
    const [userId, setUserId] = useState('');

    useEffect(() => {
        const fetch = async () => {
            const id = await AsyncStorage.getItem('enrollment');
            setUserId(id);
            db.ref(`history/${id}`)
                .once('value')
                .then(snapshot => {
                    const val = snapshot.val();
                    setData(val);
                    setLoading(false);
                });
        }
        fetch();
    }, []);

    const renderAlert = (key, data) => {
        return <View style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, justifyContent: 'center', alignItems: 'center', backgroundColor: 'white' }}>
            <Image
                source={IMAGES[4]}
                style={[
                    StyleSheet.absoluteFill,
                    {
                        position: 'absolute',
                        width,
                        resizeMode: 'cover'
                    }
                ]}
            />
            <View style={{ ...styles.box, backgroundColor: 'rgba(255, 255, 255, 0.8)' }}>
                <View style={{ flex: 0.1, marginBottom: 12 }}>
                    <Text style={{ textAlign: 'center', fontSize: 20, fontWeight: 'bold' }}>{key}</Text>
                </View>
                <View style={{ flex: 0.6, width: width * 0.8, justifyContent: 'space-between', marginTop: 12 }}>
                    {
                        Object.keys(data).map((subject, idx) => <View key={idx} style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                            <Text style={{ textAlign: 'center', fontSize: 16, fontWeight: 'bold' }}>{subject.toUpperCase()}</Text>
                            <Text style={{ textAlign: 'center', fontSize: 16, fontWeight: 'bold' }}>{data[subject]}</Text>
                        </View>)
                    }
                </View>
                <View style={{ flex: 0.3, marginTop: 12, elevation: 5, justifyContent: 'center', alignItems: 'center' }}>
                    <TouchableOpacity style={styles.viewFull} onPress={() => {
                        setShowAlert(null);
                    }}>
                        <Text style={{ fontWeight: 'bold' }}>Close</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    }

    return (
        <View style={styles.container}>
            <Image
                source={IMAGES[4]}
                style={[
                    StyleSheet.absoluteFill,
                    {
                        position: 'absolute',
                        width,
                        resizeMode: 'cover'
                    }
                ]}
            />
            { !loading &&
                <ScrollView style={{ marginBottom: 24 }}>
                    <View style={{ flex: 0.2, justifyContent: 'center', marginTop: 12 }}>
                        <View style={{ ...styles.search, backgroundColor: 'rgba(255, 255, 255, 0.8)' }}>
                            <TouchableOpacity onPress={() => setVisible(!visible)}>
                                <Text>{ph}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => {
                                const filtered = Object.keys(data).filter(key => key == ph);
                                if (filtered.length) {
                                    setShowAlert(ph);
                                }
                                else {
                                    ToastAndroid.showWithGravityAndOffset(
                                        "No data Found",
                                        ToastAndroid.LONG,
                                        ToastAndroid.BOTTOM,
                                        25,
                                        50
                                    );
                                }
                                // renderAlert(showDate(date), data[showAlert])
                            }}>
                                <Icon name='search' size={24} color='rgba(0, 0, 0, 0.8)' />
                            </TouchableOpacity>
                        </View>
                    </View>
                    <View style={{ flex: 0.8 }}>
                        {
                            data != null && Object.keys(data).slice(0, 10).map((key, idx) => <View key={idx} style={{ ...styles.box, backgroundColor: 'rgba(255, 255, 255, 0.8)' }}>
                                <Text style={styles.boxDate}>{key}</Text>
                                {
                                    Object.keys(data[key]).slice(0, 3).map((subject, idx2) => <View key={`${idx}-${idx2}`}>
                                        <Text style={styles.subjects}>{subject.toUpperCase()}</Text>
                                        <Text style={styles.status}>{data[key][subject].toUpperCase()}</Text>
                                    </View>)
                                }
                                <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                                    <TouchableOpacity style={styles.viewFull} onPress={() => {
                                        setShowAlert(key);
                                    }}>
                                        <Text style={{ fontWeight: 'bold' }}>View Full</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>)
                        }
                    </View>
                </ScrollView>
            }
            {
                showAlert != null && renderAlert(showAlert, data[showAlert])
            }
            {visible &&
                <DateTimePicker
                    value={date}
                    mode='date'
                    display='calendar'
                    maximumDate={currentDate()}
                    minimumDate={currentDate(10)}
                    onChange={(event, d) => {
                        if (d != undefined) {
                            setDate(d);
                            setVisible(false);
                            setPh(showDate(d));
                        }
                    }}
                />
            }
            {
                loading && <Loading />
            }
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
        alignItems: 'center'
    },
    search: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 12,
        borderColor: '#000',
        borderRadius: 12,
        borderWidth: 2,
        marginHorizontal: 36,
        paddingHorizontal: 12,
        paddingVertical: 6
    },
    buttonContainer: {
        marginTop: 20,
        height: 45,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
        width: 250,
        borderRadius: 30,
        backgroundColor: "lime",

    },
    box: {
        width: width * 0.9,
        height: 280,
        borderRadius: 12,
        marginTop: 30,
        borderWidth: 2,
        justifyContent: 'space-around',
        padding: 12,
    },
    boxDate: {
        textAlign: 'center',
        fontWeight: 'bold',
        fontSize: 24,
        marginBottom: 12
    },
    subjects: {
        fontWeight: 'bold',
        marginLeft: 20,
    },
    status: {
        fontWeight: 'bold',
        marginRight: 20,
        textAlign: 'right',
        top: -20,
    },
    viewFull: {
        height: 45,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        width: 150,
        borderRadius: 150,
        backgroundColor: "lime",
    }
})

