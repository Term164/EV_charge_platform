import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Ionicons } from '@expo/vector-icons';
import { BottomTabScreenProps } from "@react-navigation/bottom-tabs";

type HomeTabParamList = {
    Dashboard: undefined;
    Map: {theme: string};
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
type NoReservationsPageProps = BottomTabScreenProps<HomeTabParamList, 'Dashboard'>

type ProfilePageProps = {
  exitModal: () => void;
}

type MakeReservationPageProps = {
  exitModal: () => void
  building: Building
}

type EditReservationPageProps = {
  exitModal: () => void
  reservation: Reservation;
}

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

enum ReservationStatus {
  CHARGING = 'Charging',
  RESERVED = 'Reserved',
  ALLOCATED = 'Allocated',
  INQUEUE = 'In Queue',
}

type Reservation = {
  building: Building,
  allocated_connector: Connector | null;
  charging_time: number,
  desired_from: Date,
  desired_to: Date,
  desired_type: ChargingType,
  allocated_from: Date | null,
  allocated_to: Date | null,
  queueNumber: number,
  reservation_status: ReservationStatus
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
    "featureType": "administrative.land_parcel",
    "elementType": "labels",
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
    "featureType": "poi",
    "elementType": "labels.text",
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
    "featureType": "road.local",
    "elementType": "labels",
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

const mapStyleDark = [
  {
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#212121"
      }
    ]
  },
  {
    "elementType": "labels.icon",
    "stylers": [
      {
        "visibility": "off"
      }
    ]
  },
  {
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#757575"
      }
    ]
  },
  {
    "elementType": "labels.text.stroke",
    "stylers": [
      {
        "color": "#212121"
      }
    ]
  },
  {
    "featureType": "administrative",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#757575"
      }
    ]
  },
  {
    "featureType": "administrative.country",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#9e9e9e"
      }
    ]
  },
  {
    "featureType": "administrative.land_parcel",
    "elementType": "labels",
    "stylers": [
      {
        "visibility": "off"
      }
    ]
  },
  {
    "featureType": "administrative.locality",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#bdbdbd"
      }
    ]
  },
  {
    "featureType": "poi",
    "elementType": "labels.text",
    "stylers": [
      {
        "visibility": "off"
      }
    ]
  },
  {
    "featureType": "poi",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#757575"
      }
    ]
  },
  {
    "featureType": "poi.park",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#181818"
      }
    ]
  },
  {
    "featureType": "poi.park",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#616161"
      }
    ]
  },
  {
    "featureType": "poi.park",
    "elementType": "labels.text.stroke",
    "stylers": [
      {
        "color": "#1b1b1b"
      }
    ]
  },
  {
    "featureType": "road",
    "elementType": "geometry.fill",
    "stylers": [
      {
        "color": "#2c2c2c"
      }
    ]
  },
  {
    "featureType": "road",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#8a8a8a"
      }
    ]
  },
  {
    "featureType": "road.arterial",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#373737"
      }
    ]
  },
  {
    "featureType": "road.highway",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#3c3c3c"
      }
    ]
  },
  {
    "featureType": "road.highway.controlled_access",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#4e4e4e"
      }
    ]
  },
  {
    "featureType": "road.local",
    "elementType": "labels",
    "stylers": [
      {
        "visibility": "off"
      }
    ]
  },
  {
    "featureType": "road.local",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#616161"
      }
    ]
  },
  {
    "featureType": "transit",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#757575"
      }
    ]
  },
  {
    "featureType": "water",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#000000"
      }
    ]
  },
  {
    "featureType": "water",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#3d3d3d"
      }
    ]
  }
]

type Response = {
  status: number,
  message: string,
  error: string,
  data: object
}

export {
    SignInScreenProps,
    SignUpScreenProps,
    NoReservationsPageProps,
    AppState,
    StateAction,
    StateActionKind,
    HomeTabParamList,
    RootStackParamList,
    IoniconIconName,
    Connector,
    Building,
    ReservationStatus,
    Reservation,
    ChargingType,
    mapStyle,
    mapStyleDark,
    ProfilePageProps,
    MakeReservationPageProps,
    EditReservationPageProps,
  }