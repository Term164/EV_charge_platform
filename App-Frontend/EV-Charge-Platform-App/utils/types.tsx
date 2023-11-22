import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Ionicons } from '@expo/vector-icons';

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


enum StateActionKind {
    RESTORE_TOKEN = 'RESTORE_TOKEN',
    SIGN_IN = 'SIGN_IN',
    SIGN_OUT = 'SIGN_OUT'
}
  
type TokenAction = {
    type: StateActionKind.RESTORE_TOKEN | StateActionKind.SIGN_IN;
    token: string
};
type SignOutAction = { type: StateActionKind.SIGN_OUT};
type StateAction  = TokenAction | SignOutAction;

interface AppState {
    isLoading: boolean,
    isSignout: boolean,
    userToken: string | null
}

  
type IoniconIconName = React.ComponentProps<typeof Ionicons>['name'];
  
type SignInScreenProps = NativeStackScreenProps<RootStackParamList, 'SignInScreen'>
type SignUpScreenProps = NativeStackScreenProps<RootStackParamList, 'SignUpScreen'>

export {
    SignInScreenProps,
    SignUpScreenProps,
    AppState,
    StateAction,
    StateActionKind,
    HomeTabParamList,
    RootStackParamList,
    IoniconIconName
}