import React from 'react';
import { View, ActivityIndicator } from 'react-native';

export default () => <View
    style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'absolute',
        backgroundColor: 'white',
        top: 0,
        bottom: 0,
        right: 0,
        left: 0,
        elevation: 5
    }}>
    <ActivityIndicator size='large' color="blue"/>
</View>

