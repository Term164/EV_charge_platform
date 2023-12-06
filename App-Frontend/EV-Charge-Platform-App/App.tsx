import { NavigationContainer } from '@react-navigation/native';
import { NativeStackScreenProps, createNativeStackNavigator } from '@react-navigation/native-stack';
import { BottomTabScreenProps ,createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import SignInScreen from './pages/SignInScreen';
import SignUpScreen from './pages/SignUpScreen';
import Dashboard from './pages/Dashboard';
import Map from './pages/Map';
import Stations from './pages/Stations';
import Settings from './pages/Settings';
import Profile from './pages/Profile';
import React, { useReducer } from 'react';
import { AppStateReducer, AuthContext } from './utils/GlobalStateContext';
import { AppState, IoniconIconName, RootStackParamList } from './utils/types';
import { Ionicons } from '@expo/vector-icons';
import { getAuthContextFunctions } from './utils/authentication';
import { ToastProvider } from 'react-native-toast-notifications';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

const startingState: AppState = {
  isLoading: true,
  isSignout: false,
  userToken: null
}

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator();

export default function App() {
  const [state, dispatch] = useReducer(AppStateReducer, startingState);
  const authContext = getAuthContextFunctions(dispatch);


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
        </GestureHandlerRootView>
      </ToastProvider>
    
  );
}