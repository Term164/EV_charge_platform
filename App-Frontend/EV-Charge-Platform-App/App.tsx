import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import SignInScreen from './pages/SignInScreen';
import SignUpScreen from './pages/SignUpScreen';
import Dashboard from './pages/Dashboard';
import Stations from './pages/Stations';
import Settings from './pages/Settings';
import React, { useReducer, useState } from 'react';
import { AppStateReducer, AuthContext, SettingsContext, UserDataContext, useCurrentSettings, userSettingsContext } from './utils/GlobalStateContext';
import { AppState, HomeTabParamList, IoniconIconName, RootStackParamList, StateActionKind } from './utils/types';
import { Ionicons } from '@expo/vector-icons';
import { getAuthContextFunctions } from './utils/authentication';
import { ToastProvider } from 'react-native-toast-notifications';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import './translation'
import { useTranslation } from 'react-i18next';
import { getDefaultSettingsContext, getUserSettingsContext } from './utils/userSettings';
import { DefaultTheme, DarkTheme } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import WrapedMap from './pages/WrapedMap';
import * as SecureStore from 'expo-secure-store';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ActivityIndicator, Image } from 'react-native';
import { serverAddress } from './utils/Constants';
import { useColorScheme } from 'nativewind';
import i18n from './translation';
import { APIResponse, Profile, ProfileResponse, Station, StationResponse } from './utils/databaseTypes';
import { parseStations } from './utils/utils';
import ForgotPasswordScreen from './pages/ForgotPasswordScreen';
import VerifyPasswordScreen from './pages/VerifyPasswordScreen';
import ResetPasswordScreen from './pages/ResetPasswordScreen';
global.Buffer = require('buffer').Buffer;

const startingState: AppState = {
  isLoading: true,
  isSignout: false,
  userToken: null
}

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<HomeTabParamList>();

export default function App() {
  const [state, dispatch] = useReducer(AppStateReducer, startingState);
  const authContext = getAuthContextFunctions(dispatch);
  const { colorScheme, toggleColorScheme } = useColorScheme();
  const [settingsContext, setSettingsContext] = useState(getDefaultSettingsContext(colorScheme, toggleColorScheme));
  const [user, setUser] = useState<Profile>();
  const [stations, setStations] = useState<Array<Station>>([]);
  const { t } = useTranslation();

  const updateSettingsContext = (settingsContext: userSettingsContext) => setSettingsContext(settingsContext);

   React.useEffect(() => {

    const bootstrapAsync = async () => {

      try {
        const test = await getUserSettingsContext(colorScheme, toggleColorScheme, updateSettingsContext);
        setSettingsContext(test);
        i18n.changeLanguage(test.language);
        if (test.colorScheme != colorScheme) toggleColorScheme();
      } catch (error) {
        console.log(error);
      }

      let userToken;

      try {
        userToken = await SecureStore.getItemAsync('sessionID');
      } catch (e) {
        dispatch({type: StateActionKind.SIGN_OUT});
      }

      if (typeof userToken === 'string'){
        try {
          const response = await fetch(
              `${serverAddress}/api/v1/dev/ping`,
              {
                method: 'GET',
                headers: {
                    Accept: '*/*',
                    'Content-Type': 'application/json',
                    'sessionid': userToken
                },
              }
          );
          const loginResponse = await response.json() as APIResponse;
          if (response.status === 200) {
            dispatch({ type: StateActionKind.RESTORE_TOKEN, token: userToken });
          } else {
            dispatch({type: StateActionKind.SIGN_OUT});
          }
        } catch (error) {
          console.log(error);
        }

      }
      else {
        dispatch({type: StateActionKind.SIGN_OUT});
      }
    };

    bootstrapAsync();
  }, []);

  React.useEffect(() => {

    const getProfileData = async () => {
      let userData;
      try {
          const response = await fetch(
              `${serverAddress}/api/v1/user/get/profile`,
              {
                method: 'GET',
                headers: {
                  Accept: '*/*',
                  'Content-Type': 'application/json',
                  'sessionid': state.userToken as string
                },
              }
          );
          userData = await response.json() as ProfileResponse;
          if (response.status === 200) {
            if (userData.data.profile_picture != null) {
              userData.data.profile_picture = Buffer.from(userData.data.profile_picture);
            }
            setUser(userData.data);
          }
      } catch (error) {
          console.log(error);
      }
      if (userData?.data != null) {
        const response = await fetch(
          `${serverAddress}/api/v1/station/get/allAvailable?${new URLSearchParams({userID: String(userData.data.id)}).toString()}`,
          {
            method: 'GET',
            headers: {
                Accept: '*/*',
                'Content-Type': 'application/json',
                'sessionid': state.userToken as string
            },
          }
        );
        const stationsResponse = await response.json() as StationResponse;
        if (response.status === 200) {
          setStations(stationsResponse.data.Result);
        }
      }
      try {
      } catch (error) {
        console.log(error);
      }
    }

    if(state.userToken != null) getProfileData();
  },[state.userToken])
  
  let logo;
  if (colorScheme === 'dark'){
      logo = <Image 
              source={require('./assets/logo/Charge-Mate-Logo-dark.png')}
              style={{width: '80%', height: '40%', resizeMode: 'cover'}}
          />
  }
  else {
      logo = <Image 
              source={require('./assets/logo/Charge-Mate-Logo.png')}
              style={{width: '80%', height: '40%' , resizeMode: 'cover'}}
          />
  }

  if (state.isLoading) {
    return(
      <SafeAreaView className='flex-1 items-center justify-center dark:bg-slate-800'>
        {logo}
        <ActivityIndicator size='large'/>
      </SafeAreaView>
    )
  }

  return(
      <ToastProvider>
        <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'}/>
        <GestureHandlerRootView style={{flex: 1}}>
          <SettingsContext.Provider value={settingsContext}>
            <AuthContext.Provider value={authContext}>
              <UserDataContext.Provider value={{header: {Accept: '*/*', 'Content-Type': 'application/json','sessionid': state.userToken}, userData: user as Profile, buildings: parseStations(stations, settingsContext.selectedChargingTypes)}}>
                <NavigationContainer theme={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
                  { state.userToken != null ? (
                  <Tab.Navigator
                  initialRouteName='Map'
                  screenOptions={({ route }) => ({
                      headerShown: false,
                      tabBarIcon: ({ focused, color, size }) => {
                        let iconName: IoniconIconName = 'close-circle-outline';

                        if (route.name === 'Dashboard') {
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
                    <Tab.Screen name='Dashboard' component={Dashboard} options={{title: t('dashboard')}}/>
                    <Tab.Screen name='Map' component={WrapedMap} options={{title: t('map')}}/>
                    <Tab.Screen name='Stations' component={Stations} options={{title: t('stations')}}/>
                    <Tab.Screen name='Settings' component={Settings} options={{title: t('settings')}}/>
                  </Tab.Navigator>
                  ) : (
                    <Stack.Navigator
                      screenOptions={{headerShown: false}}
                      initialRouteName='SignInScreen'
                    >
                      <Stack.Screen name='SignInScreen' component={SignInScreen} options={{animationTypeForReplace: state.isSignout ? 'pop' : 'push'}}/>
                      <Stack.Screen name='SignUpScreen' component={SignUpScreen}/>
                      <Stack.Screen name='ForgotPasswordScreen' component={ForgotPasswordScreen}/>
                      <Stack.Screen name='VerifyCodeScreen' component={VerifyPasswordScreen} />
                      <Stack.Screen name='ResetPasswordScreen' component={ResetPasswordScreen}/>
                    </Stack.Navigator>
                  )}
                </NavigationContainer>
              </UserDataContext.Provider>
            </AuthContext.Provider>
          </SettingsContext.Provider>
        </GestureHandlerRootView>
      </ToastProvider>
  );
}