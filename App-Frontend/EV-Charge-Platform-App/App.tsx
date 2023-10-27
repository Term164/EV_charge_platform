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
import React from 'react';


const getIsSignedIn = () => {
  return false;
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
  SignUpScren: undefined;
}

type IoniconIconName = React.ComponentProps<typeof Ionicons>['name'];

// type StackProps = NativeStackScreenProps<RootStackParamList, 'SignInScreen'>;
// type TabProps = BottomTabScreenProps<HomeTabParamList, 'Dashboard'>;

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator();

export default function App() {
  const isSignedIn = getIsSignedIn();

  return(
    <NavigationContainer>
      { isSignedIn ? (
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
          tabBarActiveTintColor: 'tomato',
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
        >
          <Stack.Screen name='SignInScreen' component={SignInScreen}/>
          <Stack.Screen name='SignUpScren' component={SignInScreen}/>
        </Stack.Navigator>
      )}
    </NavigationContainer>
  );
}