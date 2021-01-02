import {CommonActions} from '@react-navigation/native';

export default clearRoute = (navigation, route) => {navigation.dispatch(
    CommonActions.reset({
        index: 0,
        routes: [{name: route}]
    })
)}