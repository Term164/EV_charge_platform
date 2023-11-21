import { NavigationContainer } from '@react-navigation/native';
import { NativeStackScreenProps, createNativeStackNavigator } from '@react-navigation/native-stack';
import { BottomTabScreenProps ,createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import SignInScreen from './pages/SignInScreen';
import SignUpScreen from './pages/SignUpScreen';
import Dashboard from './pages/Dashboard';
import Map from './pages/Map';
import Stations from './pages/Stations';
import Settings from './pages/Settings';
import Profile from './pages/Profile';
import React, { useReducer } from 'react';
import { AuthContext } from './utils/GlobalStateContext';


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

const startingState: AppState = {
  isLoading: true,
  isSignout: false,
  userToken: null
}

function AppStateReducer(prevState: AppState, action: StateAction) {
  switch (action.type) {
    case StateActionKind.RESTORE_TOKEN:
      return {
        ...prevState,
        userToken: action.token,
        isLoading: false,
      };
    case StateActionKind.SIGN_IN:
      return {
        ...prevState,
        isSignout: false,
        userToken: action.token,
      };
    case StateActionKind.SIGN_OUT:
      return {
        ...prevState,
        isSignout: true,
        userToken: null
      };
    default: return prevState
  }
}

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

type IoniconIconName = React.ComponentProps<typeof Ionicons>['name'];

// type StackProps = NativeStackScreenProps<RootStackParamList, 'SignInScreen'>;
// type TabProps = BottomTabScreenProps<HomeTabParamList, 'Dashboard'>;

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator();

export default function App() {
  const [state, dispatch] = useReducer(AppStateReducer, startingState);

  const authContext = React.useMemo(
    () => ({
      signIn: async (_data: string) => {
        // In a production app, we need to send some data (usually username, password) to server and get a token
        // We will also need to handle errors if sign in failed
        // After getting token, we need to persist the token using `SecureStore`
        // In the example, we'll use a dummy token

        dispatch({ type: StateActionKind.SIGN_IN, token: 'dummy-auth-token' });
      },
      signOut: () => dispatch({ type: StateActionKind.SIGN_OUT }),
      signUp: async (_data: string) => {
        // In a production app, we need to send user data to server and get a token
        // We will also need to handle errors if sign up failed
        // After getting token, we need to persist the token using `SecureStore`
        // In the example, we'll use a dummy token

        dispatch({ type: StateActionKind.SIGN_IN, token: 'dummy-auth-token' });
      },
    }),
    []
  );

  return(
    <AuthContext.Provider value={authContext}>
      <NavigationContainer>
        { state.userToken != null ? (
        <Tab.Navigator
        screenOptions={({ route }) => ({
            headerShown: false,
            tabBarIcon: ({ focused, color, size }) => {
              let iconName: IoniconIconName = 'close-circle-outline';

              if (route.name === 'Profile') {
                iconName = focused ? 'person-circle' : 'person-circle-outline';
              } else if (route.name === 'Dashboard') {
                iconName = focused ? 'home' : 'home-outline';
              } else if (route.name === 'Map') {
                iconName = focused ? 'map' : 'map-outline';
              } else if (route.name === 'Stations') {
                iconName = focused ? 'battery-charging' : 'battery-charging-outline';
              } else if (route.name === 'Settings') {
                iconName = focused ? 'settings' : 'settings-outline';
              }
              // You can return any component that you like here!
              return <Ionicons name={iconName} size={size} color={color} />;
            },
            tabBarInactiveTintColor: 'gray',
          })}
        >
          <Tab.Screen name='Profile' component={Profile} />
          <Tab.Screen name='Dashboard' component={Dashboard}/>
          <Tab.Screen name='Map' component={Map}/>
          <Tab.Screen name='Stations' component={Stations}/>
          <Tab.Screen name='Settings' component={Settings}/>
        </Tab.Navigator>
        ) : (
          <Stack.Navigator
            screenOptions={{headerShown: false}}
            initialRouteName='SignInScreen'
          >
            <Stack.Screen name='SignInScreen' component={SignInScreen}/>
            <Stack.Screen name='SignUpScreen' component={SignUpScreen}/>    
          </Stack.Navigator>
        )}
      </NavigationContainer>
    </AuthContext.Provider>
  );
}