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

// Screen props

type SignInScreenProps = NativeStackScreenProps<RootStackParamList, 'SignInScreen'>
type SignUpScreenProps = NativeStackScreenProps<RootStackParamList, 'SignUpScreen'>

// Station types

enum ChargingType {
  TYPE1 = 'TYPE1',
  TYPE2 = 'TYPE2',
  CHAdeMO = 'CHAdeMO',
  CCS = 'CCS',
  TESLASUC = 'TESLASUC'
}

type Connector = {
  chargingType: ChargingType,
  watts: number
  numberOfConnectors: number
}

type Coordinate = {
  latitude: number,
  longitude: number
}

type Building = {
  coordinate: Coordinate,
  name: string,
  address: string,
  availability: number,
  stations: number,
  Connectors: Connector[]
}

const mapStyle = [
    {
      "featureType": "administrative",
      "elementType": "geometry",
      "stylers": [
        {
          "visibility": "off"
        }
      ]
    },
    {
      "featureType": "poi",
      "stylers": [
        {
          "visibility": "off"
        }
      ]
    },
    {
      "featureType": "road",
      "elementType": "labels.icon",
      "stylers": [
        {
          "visibility": "off"
        }
      ]
    },
    {
      "featureType": "transit",
      "stylers": [
        {
          "visibility": "off"
        }
      ]
    }
  ]

export {
    SignInScreenProps,
    SignUpScreenProps,
    AppState,
    StateAction,
    StateActionKind,
    HomeTabParamList,
    RootStackParamList,
    IoniconIconName,
    Building,
    ChargingType,
    mapStyle
}