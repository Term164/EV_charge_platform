import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import SignInScreen from './pages/SignInScreen';
import SignUpScreen from './pages/SignUpScreen';
import Dashboard from './pages/Dashboard';
import Map from './pages/Map';
import Stations from './pages/Stations';
import Settings from './pages/Settings';
import React, { useReducer } from 'react';
import { AppStateReducer, AuthContext } from './utils/GlobalStateContext';
import { AppState, HomeTabParamList, IoniconIconName, RootStackParamList } from './utils/types';
import { Ionicons } from '@expo/vector-icons';
import { getAuthContextFunctions } from './utils/authentication';
import { ToastProvider } from 'react-native-toast-notifications';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import './translation'
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation();

  return(
    
      <ToastProvider>
        <GestureHandlerRootView style={{flex: 1}}>
          <AuthContext.Provider value={authContext}>
            <NavigationContainer>
              { state.userToken != null ? (
              <Tab.Navigator
              initialRouteName='Map'
              screenOptions={({ route }) => ({
                  headerShown: false,
                  tabBarIcon: ({ focused, color, size }) => {
                    let iconName: IoniconIconName = 'close-circle-outline';

                    if (route.name === t('dashboard')) {
                      iconName = focused ? 'home' : 'home-outline';
                    } else if (route.name === t('map')) {
                      iconName = focused ? 'map' : 'map-outline';
                    } else if (route.name === t('stations')) {
                      iconName = focused ? 'battery-charging' : 'battery-charging-outline';
                    } else if (route.name === t('settings')) {
                      iconName = focused ? 'settings' : 'settings-outline';
                    }
                    // You can return any component that you like here!
                    return <Ionicons name={iconName} size={size} color={color} />;
                  },
                  tabBarInactiveTintColor: 'gray',
                })}
              >
                <Tab.Screen name={t('dashboard')} component={Dashboard}/>
                <Tab.Screen name={t('map')} component={Map}/>
                <Tab.Screen name={t('stations')} component={Stations}/>
                <Tab.Screen name={t('settings')} component={Settings}/>
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
        </GestureHandlerRootView>
      </ToastProvider>
    
  );
}