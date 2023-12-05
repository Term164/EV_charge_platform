import { SafeAreaView } from "react-native-safe-area-context";
import ToggleSwitch from "toggle-switch-react-native";
import React, { useState } from 'react';
import DropDownPicker from "react-native-dropdown-picker";
import SloveniaIcon from "../assets/flag-icons/slovenia.svg";
import UKIcon from "../assets/flag-icons/united-kingdom.svg";
import { Text, View, Pressable, ScrollView, Modal } from "react-native";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faChevronRight } from "@fortawesome/free-solid-svg-icons";
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from "../utils/GlobalStateContext";
import Profile from '../pages/Profile';


export default function SettingsPage() {
    const [darkMode, setDarkMode] = useState(false);
    const [notifications, setNotifications] = useState(false);
    const [editProfile, setEditProfile] = useState(false);

    const [open, setOpen] = useState(false);
    const [value, setValue] = useState('english');
    const [items, setItems] = useState([
        {label: 'English', value: 'eng', icon: () => <UKIcon width={30} height={32} style={{}} />},
        {label: 'Slovenščina', value: 'slo', icon: () => <SloveniaIcon width={32} height={30} />}
    ]);

    // Auth context
    const { signOut } = React.useContext(AuthContext);
    return (
        <SafeAreaView className="flex-1">
            
            <Modal
                animationType="slide"
                visible={editProfile}
                onRequestClose={() => {setEditProfile(!editProfile)}}
            >
                <Profile exitModal={() => setEditProfile(false)} />
            </Modal>

            <ScrollView className="w-full h-full" contentContainerStyle={{flexGrow: 1, justifyContent: 'center', alignItems: 'center'}}>
                <Text className="w-11/12 text-gray-500/70 text-base font-medium mb-3">Account</Text>

                <View className="w-11/12 h-16 overflow-hidden rounded-2xl">
                    <Pressable 
                        onPress={() => setEditProfile(true)}
                        className="flex-row items-center justify-between bg-gray-300/70 p-2 h-16 rounded-2xl"
                        android_ripple={{color: '#9ca3af'}}
                    >
                        <View className="flex-row items-center">
                            <Ionicons name="person-circle-outline" size={32} color={'#374151'}/>
                            <View>
                                <Text className="text-base font-medium ml-4 text-gray-800">Personal Information</Text>
                                <Text className="text-sm font-medium ml-4 text-gray-500">Edit your profile</Text>
                            </View>
                        </View>
                        <FontAwesomeIcon icon={faChevronRight} size={24} color="#374151" />
                    </Pressable>
                </View>

                <View className="w-11/12 h-16 overflow-hidden rounded-2xl mt-3">
                    <Pressable 
                        className="flex-row items-center justify-between bg-gray-300/70 p-2 h-16 rounded-2xl"
                        android_ripple={{color: '#9ca3af'}}
                        onPress={() => {setNotifications(!notifications)}}
                    >
                        <View className="flex-row items-center">
                            <Ionicons name={notifications ? 'notifications-circle-outline' : 'notifications-off-circle-outline'} size={32} color={'#374151'}/>
                            <View>
                                <Text className="text-base font-medium ml-4 text-gray-800">Notifications</Text>
                                <Text className="text-sm font-medium ml-4 text-gray-500">{notifications ? 'On' : 'Off'}</Text>
                            </View>
                        </View>
                        <ToggleSwitch
                            isOn={notifications}
                            onColor={'#3b82f6'}
                            offColor={'#9ca3af'}
                            onToggle={isOn => {setNotifications(isOn)}}
                        />
                    </Pressable>
                </View>

                <View style={{borderBottomWidth: 1.2}} className="border-gray-600/50 my-5 w-11/12"/>
                <Text className="w-11/12 text-gray-500/70 text-base font-medium mb-3">Interface</Text>

                <View className="w-11/12 h-16 overflow-hidden rounded-2xl">
                    <Pressable 
                        className="flex-row items-center justify-between bg-gray-300/70 p-2 h-16 rounded-2xl"
                        android_ripple={{color: '#9ca3af'}}
                        onPress={() => {setDarkMode(!darkMode)}}
                    >
                        <View className="flex-row items-center">
                            <Ionicons name='contrast-outline' size={32} color={'#374151'}/>
                            <View>
                                <Text className="text-base font-medium ml-4 text-gray-800">Theme</Text>
                                <Text className="text-sm font-medium ml-4 text-gray-500">{darkMode ? 'Dark' : 'Light'}</Text>
                            </View>
                        </View>
                        <ToggleSwitch
                            isOn={darkMode}
                            onColor={'#3b82f6'}
                            offColor={'#9ca3af'}
                            onToggle={isOn => {setNotifications(isOn)}}
                        />
                    </Pressable>
                </View>

                <View className="w-11/12 h-16 bg-gray-300/70 rounded-2xl mt-3 z-10 relative">
                    <Text className="text-base font-medium ml-4 text-gray-800 absolute left-10 top-2">Language</Text>
                    <DropDownPicker
                        open={open}
                        value={value}
                        items={items}
                        setOpen={setOpen}
                        setValue={setValue}
                        setItems={setItems}
                        showTickIcon={true}
                        showArrowIcon={true}
                        itemSeparator={true}
                        listMode="MODAL"
                        ArrowUpIconComponent={({style}) => <FontAwesomeIcon icon={faChevronRight} size={24} color="#374151" />}
                        ArrowDownIconComponent={({style}) => <FontAwesomeIcon icon={faChevronRight} size={24} color="#374151" />}
                        iconContainerStyle={{}}
                        style={{borderWidth: 0, padding: 0, margin: 0, minHeight: 0, height: 64, backgroundColor:'transparent'}}
                        containerStyle={{padding: 0, margin: 0}}
                        labelStyle={{padding: 0, margin: 0, left: 6, top: 8, color:'rgb(107 114 128)', fontWeight: '500', fontSize: 14, lineHeight: 20,}}/>
                </View>

                <View style={{borderBottomWidth: 1.2}} className="border-gray-600/50 my-5 w-11/12"/>
                <Text className="w-11/12 text-gray-500/70 text-base font-medium mb-3">Service</Text>

                <View className="w-11/12 overflow-hidden rounded-2xl">
                    <Pressable 
                        className="flex-row items-center justify-between bg-gray-300/70 p-2 h-16 rounded-2xl"
                        android_ripple={{color: '#9ca3af'}}
                    >
                        <View className="flex-row items-center">
                            <Ionicons name="lock-closed-outline" size={32} color={'#374151'}/>
                            <Text className="text-xl font-medium ml-4 text-gray-800">Privacy & Security</Text>
                        </View>
                        <FontAwesomeIcon icon={faChevronRight} size={24} color="#374151" />
                    </Pressable>
                </View>

                <View className="w-11/12 overflow-hidden rounded-2xl mt-3">
                    <Pressable 
                        className="flex-row items-center justify-between bg-gray-300/70 p-2 h-16 rounded-2xl"
                        android_ripple={{color: '#9ca3af'}}
                    >
                        <View className="flex-row items-center">
                            <Ionicons name="help-circle-outline" size={32} color={'#374151'}/>
                            <Text className="text-xl font-medium ml-4 text-gray-800">Help</Text>
                        </View>
                        <FontAwesomeIcon icon={faChevronRight} size={24} color="#374151" />
                    </Pressable>
                </View>

                <View className="w-11/12 overflow-hidden rounded-2xl mt-3">
                    <Pressable 
                        className="flex-row items-center justify-between bg-gray-300/70 p-2 h-16 rounded-2xl"
                        android_ripple={{color: '#9ca3af'}}
                    >
                        <View className="flex-row items-center">
                            <Ionicons name="information-circle-outline" size={32} color={'#374151'}/>
                            <Text className="text-xl font-medium ml-4 text-gray-800">About</Text>
                        </View>
                        <FontAwesomeIcon icon={faChevronRight} size={24} color="#374151" />
                    </Pressable>
                </View>

                <View style={{borderBottomWidth: 1.2}} className="border-gray-600/50 my-5 w-11/12"/>

                <View className="w-11/12 overflow-hidden rounded-2xl mb-4">
                    <Pressable 
                        onPress={signOut}
                        className="flex-row items-center justify-between p-2 h-16 rounded-2xl"
                        android_ripple={{color: ''}}
                    >
                        <View className="flex-row items-center">
                            <Ionicons name="log-out-outline" size={32} color={'#374151'}/>
                            <Text className="text-xl font-medium ml-4 text-gray-800">Log out</Text>
                        </View>
                        <FontAwesomeIcon icon={faChevronRight} size={24} color="#374151" />
                    </Pressable>
                </View>
            </ScrollView>
        </SafeAreaView>
    )
}