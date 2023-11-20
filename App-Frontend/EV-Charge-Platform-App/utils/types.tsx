import { NativeStackScreenProps } from "@react-navigation/native-stack";

type HomeTabParamList = {
    Dashboard: undefined;
    Map: undefined;
    Stations: undefined;
    Settings: undefined;
    Profile: undefined;
}

type RootStackParamList = {
    SignInScreen: undefined;
    SignUpScreen: undefined;
}

type SignInScreenProps = NativeStackScreenProps<RootStackParamList, 'SignInScreen'>
type SignUpScreenProps = NativeStackScreenProps<RootStackParamList, 'SignUpScreen'>

export {
    SignInScreenProps,
    SignUpScreenProps,
}