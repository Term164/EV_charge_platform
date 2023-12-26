import { SafeAreaView } from "react-native-safe-area-context";
import ToggleSwitch from "toggle-switch-react-native";
import React, { useState } from 'react';
import DropDownPicker, { ThemeNameType, ValueType } from "react-native-dropdown-picker";
import SloveniaIcon from "../assets/flag-icons/slovenia.svg";
import UKIcon from "../assets/flag-icons/united-kingdom.svg";
import { Text, View, Pressable, ScrollView, Modal } from "react-native";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faChevronRight } from "@fortawesome/free-solid-svg-icons";
import { Ionicons } from '@expo/vector-icons';
import { useCurrentAuth, useCurrentSettings, userSettingsContext } from "../utils/GlobalStateContext";
import Profile from '../pages/Profile';
import { useTranslation } from "react-i18next";
import i18n from '../translation'
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ChargingType, Language } from "../utils/types";
import { useColorScheme } from "nativewind";
import { getConnectorIcon } from "../utils/utils";
import ChargingStationSVG from "../assets/icons/chargingStation.svg";

export default function SettingsPage() {

    const { language, notifications, selectedChargingTypes, updateSettingsContext, setColorScheme } = useCurrentSettings();
    const { colorScheme, toggleColorScheme } = useColorScheme();
    const [darkMode, setDarkMode] = useState(colorScheme === 'dark');
    const [notification, setNotification] = useState(notifications === 'false' ? false : true);
    const [editProfile, setEditProfile] = useState(false);

    const [open, setOpen] = useState(false);
    const [openChargerType, setOpenChargerType] = useState(false);

    const [chargerTypeValue, setChargerTypeValue] = useState(selectedChargingTypes)
    const [chargerTypeItems, setChargerTypeItems] = useState([
        {label: 'Type 1', value: 'TYPE1', icon: () => getConnectorIcon(ChargingType.TYPE1, colorScheme)},
        {label: 'Type 2', value: 'TYPE2', icon: () => getConnectorIcon(ChargingType.TYPE2, colorScheme)},
        {label: 'CHAdeMO', value: 'CHAdeMO', icon: () => getConnectorIcon(ChargingType.CHAdeMO, colorScheme)},
        {label: 'CCS', value: 'CCS', icon: () => getConnectorIcon(ChargingType.CCS, colorScheme)},
        {label: 'TESLA', value: 'TESLASUC', icon: () => getConnectorIcon(ChargingType.TESLASUC, colorScheme)},
    ])

    const [value, setValue] = useState(language);
    const [items, setItems] = useState([
        {label: 'English', value: 'en', icon: () => <UKIcon width={30} height={32} style={{}} />},
        {label: 'Slovenščina', value: 'si', icon: () => <SloveniaIcon width={32} height={30} />}
    ]);

    const { t } = useTranslation();

    const saveAndSetNotificaton = async (newNotification: boolean) => {
        setNotification(newNotification);
        await AsyncStorage.setItem('notifications', newNotification ? 'true' : 'false');
    }

    const saveAndSetDarkMode = async (newTheme: boolean) => {
        setDarkMode(newTheme);
        await AsyncStorage.setItem('theme', newTheme ? 'dark' : 'light');
        toggleColorScheme()
    }

    const saveAndSetLanguage = async (value: Language | undefined) => {
        if (value != undefined) {
            i18n.changeLanguage(value);
            setValue(value);
            await AsyncStorage.setItem('language', value);
        }
    }

    const saveSelectedChargingTypes = async (value: ValueType[] | null | undefined) => {
        await AsyncStorage.setItem('chargingTypes', JSON.stringify(value));
        const newSettings: userSettingsContext = {
            colorScheme: colorScheme,
            language: language,
            notifications: notifications,
            selectedChargingTypes: value as Array<string>,
            setColorScheme: setColorScheme,
            toggleColorScheme: toggleColorScheme,
            updateSettingsContext: updateSettingsContext
        }
        
        updateSettingsContext(newSettings);
    }

    // Auth context
    const { signOut } = useCurrentAuth()
    return (
        <SafeAreaView className="flex-1 dark:bg-slate-950">
            
            <Modal
                animationType="slide"
                visible={editProfile}
                onRequestClose={() => {setEditProfile(!editProfile)}}
            >
                <Profile exitModal={() => setEditProfile(false)} />
            </Modal>

            <ScrollView className="w-full h-full" contentContainerStyle={{flexGrow: 1, justifyContent: 'center', alignItems: 'center'}}>
                <Text className="w-11/12 text-gray-500/70 dark:text-slate-400 text-base font-medium mb-3">{t('account')}</Text>

                <View className="w-11/12 h-16 overflow-hidden rounded-2xl">
                    <Pressable 
                        onPress={() => setEditProfile(true)}
                        className="flex-row items-center justify-between bg-gray-300/70 dark:bg-slate-800 p-2 h-16 rounded-2xl"
                        android_ripple={{color: '#9ca3af'}}
                    >
                        <View className="flex-row items-center">
                            <Ionicons name="person-circle-outline" size={32} color={colorScheme === 'dark' ? '#cbd5e1' : '#374151'}/>
                            <View>
                                <Text className="text-base font-medium ml-4 text-gray-800 dark:text-slate-300">{t('personalInfo')}</Text>
                                <Text className="text-sm font-medium ml-4 text-gray-500 dark:text-slate-400">{t('editProfile')}</Text>
                            </View>
                        </View>
                        <FontAwesomeIcon icon={faChevronRight} size={24} color={colorScheme === 'dark' ? '#cbd5e1' : '#374151'} />
                    </Pressable>
                </View>

                <View className="w-11/12 h-20 bg-gray-300/70 dark:bg-slate-800 rounded-2xl mt-3 z-10 relative">
                    <Text className="text-base font-medium ml-4 text-gray-800 dark:text-slate-300 absolute left-10 top-2">{t('preferredChargingType')}</Text>
                    <ChargingStationSVG style={{position: 'absolute', top: 25, left: 10}} width={32} height={32} fill={colorScheme === 'dark' ? '#cbd5e1' : '#374151'} />
                    <DropDownPicker
                            placeholder={t("allTypes")}
                            min={0}
                            mode={'BADGE'}
                            max={5}
                            multiple={true}
                            open={openChargerType}
                            value={chargerTypeValue}
                            items={chargerTypeItems}
                            theme={colorScheme.toUpperCase() as ThemeNameType}
                            onChangeValue={(item) => saveSelectedChargingTypes(item)}
                            setOpen={setOpenChargerType}
                            setValue={setChargerTypeValue}
                            setItems={setChargerTypeItems}
                            showTickIcon={true}
                            showArrowIcon={true}
                            itemSeparator={true}
                            listMode="MODAL"
                            ArrowUpIconComponent={({style}) => <FontAwesomeIcon icon={faChevronRight} size={24} color={colorScheme === 'dark' ? '#cbd5e1' : '#374151'} />}
                            ArrowDownIconComponent={({style}) => <FontAwesomeIcon icon={faChevronRight} size={24} color={colorScheme === 'dark' ? '#cbd5e1' : '#374151'} />}
                            style={{borderWidth: 0, padding: 0, paddingLeft: 60, margin: 0, marginTop: 20, minHeight: 0, height: 64, width: 'auto', backgroundColor:'transparent'}}
                            showBadgeDot={false}
                            placeholderStyle={{color: colorScheme === 'light' ? 'rgb(107 114 128)' : '#94a3b8', fontWeight: '500', fontSize: 14, lineHeight: 20,}}
                            badgeColors={colorScheme === 'light' ? ["#f3f4f6"] : ["#475569"]}
                            badgeTextStyle={{color: colorScheme === 'light' ? '#334155' : '#cbd5e1', fontWeight: '500', fontSize: 14, lineHeight: 20}}
                            />
                    
                </View>

                <View className="w-11/12 h-16 overflow-hidden rounded-2xl mt-3">
                    <Pressable 
                        className="flex-row items-center justify-between bg-gray-300/70 dark:bg-slate-800 p-2 h-16 rounded-2xl"
                        android_ripple={{color: '#9ca3af'}}
                        onPress={() => {saveAndSetNotificaton(!notifications)}}
                    >
                        <View className="flex-row items-center">
                            <Ionicons name={notifications ? 'notifications-circle-outline' : 'notifications-off-circle-outline'} size={32} color={colorScheme === 'dark' ? '#cbd5e1' : '#374151'}/>
                            <View>
                                <Text className="text-base font-medium ml-4 text-gray-800 dark:text-slate-300">{t('notifications')}</Text>
                                <Text className="text-sm font-medium ml-4 text-gray-500 dark:text-slate-400">{notifications ? t('on') : t('off')}</Text>
                            </View>
                        </View>
                        <ToggleSwitch
                            isOn={notification}
                            onColor={colorScheme === 'light' ? '#3b82f6' : '#166534'}
                            offColor={'#9ca3af'}
                            onToggle={isOn => {saveAndSetNotificaton(isOn)}}
                        />
                    </Pressable>
                </View>

                <View style={{borderBottomWidth: 1.2}} className="border-gray-600/50 my-5 w-11/12"/>
                <Text className="w-11/12 text-gray-500/70 dark:text-slate-400 text-base font-medium mb-3">{t('interface')}</Text>

                <View className="w-11/12 h-16 overflow-hidden rounded-2xl">
                    <Pressable 
                        className="flex-row items-center justify-between bg-gray-300/70 dark:bg-slate-800 p-2 h-16 rounded-2xl"
                        android_ripple={{color: '#9ca3af'}}
                        onPress={() => {saveAndSetDarkMode(!darkMode)}}
                    >
                        <View className="flex-row items-center">
                            <Ionicons name='contrast-outline' size={32} color={colorScheme === 'dark' ? '#cbd5e1' : '#374151'}/>
                            <View>
                                <Text className="text-base font-medium ml-4 text-gray-800 dark:text-gray-300">{t('theme')}</Text>
                                <Text className="text-sm font-medium ml-4 text-gray-500 dark:text-slate-400">{darkMode ? t('dark') : t('light')}</Text>
                            </View>
                        </View>
                        <ToggleSwitch
                            isOn={darkMode}
                            onColor={colorScheme === 'light' ? '#3b82f6' : '#166534'}
                            offColor={'#9ca3af'}
                            onToggle={isOn => {saveAndSetDarkMode(!darkMode)}}
                        />
                    </Pressable>
                </View>

                <View className="w-11/12 h-16 bg-gray-300/70 dark:bg-slate-800 rounded-2xl mt-3 z-10 relative">
                    <Text className="text-base font-medium ml-4 text-gray-800 dark:text-slate-300 absolute left-10 top-2">{t('language')}</Text>
                    <DropDownPicker
                        open={open}
                        value={value}
                        items={items}
                        theme={colorScheme.toUpperCase() as ThemeNameType}
                        setOpen={setOpen}
                        setValue={setValue}
                        onSelectItem={(item) => {saveAndSetLanguage(item.value as Language)}}
                        setItems={setItems}
                        showTickIcon={true}
                        showArrowIcon={true}
                        itemSeparator={true}
                        listMode="MODAL"
                        ArrowUpIconComponent={({style}) => <FontAwesomeIcon icon={faChevronRight} size={24} color={colorScheme === 'dark' ? '#cbd5e1' : '#374151'} />}
                        ArrowDownIconComponent={({style}) => <FontAwesomeIcon icon={faChevronRight} size={24} color={colorScheme === 'dark' ? '#cbd5e1' : '#374151'} />}
                        iconContainerStyle={{}}
                        listChildContainerStyle={{backgroundColor: 'red'}}
                        style={{borderWidth: 0, padding: 0, margin: 0, minHeight: 0, height: 64, backgroundColor:'transparent'}}
                        containerStyle={{padding: 0, margin: 0}}
                        labelStyle={{padding: 0, margin: 0, left: 6, top: 8, color: colorScheme === 'light' ? 'rgb(107 114 128)' : '#94a3b8', fontWeight: '500', fontSize: 14, lineHeight: 20,}}/>
                </View>
                <View style={{borderBottomWidth: 1.2}} className="border-gray-600/50 my-5 w-11/12"/>
                <Text className="w-11/12 text-gray-500/70 dark:text-slate-400 text-base font-medium mb-3">{t('service')}</Text>

                <View className="w-11/12 overflow-hidden rounded-2xl">
                    <Pressable 
                        className="flex-row items-center justify-between bg-gray-300/70 dark:bg-slate-800 p-2 h-16 rounded-2xl"
                        android_ripple={{color: '#9ca3af'}}
                    >
                        <View className="flex-row items-center">
                            <Ionicons name="lock-closed-outline" size={32} color={colorScheme === 'dark' ? '#cbd5e1' : '#374151'}/>
                            <Text className="text-xl font-medium ml-4 text-gray-800 dark:text-slate-300">{t('pp')}</Text>
                        </View>
                        <FontAwesomeIcon icon={faChevronRight} size={24} color={colorScheme === 'dark' ? '#cbd5e1' : '#374151'} />
                    </Pressable>
                </View>

                <View className="w-11/12 overflow-hidden rounded-2xl mt-3">
                    <Pressable 
                        className="flex-row items-center justify-between bg-gray-300/70 dark:bg-slate-800 p-2 h-16 rounded-2xl"
                        android_ripple={{color: '#9ca3af'}}
                    >
                        <View className="flex-row items-center">
                            <Ionicons name="help-circle-outline" size={32} color={colorScheme === 'dark' ? '#cbd5e1' : '#374151'}/>
                            <Text className="text-xl font-medium ml-4 text-gray-800 dark:text-slate-300">{t('help')}</Text>
                        </View>
                        <FontAwesomeIcon icon={faChevronRight} size={24} color={colorScheme === 'dark' ? '#cbd5e1' : '#374151'} />
                    </Pressable>
                </View>

                <View className="w-11/12 overflow-hidden rounded-2xl mt-3">
                    <Pressable 
                        className="flex-row items-center justify-between bg-gray-300/70 dark:bg-slate-800 p-2 h-16 rounded-2xl"
                        android_ripple={{color: '#9ca3af'}}
                    >
                        <View className="flex-row items-center">
                            <Ionicons name="information-circle-outline" size={32} color={colorScheme === 'dark' ? '#cbd5e1' : '#374151'}/>
                            <Text className="text-xl font-medium ml-4 text-gray-800 dark:text-slate-300">{t('about')}</Text>
                        </View>
                        <FontAwesomeIcon icon={faChevronRight} size={24} color={colorScheme === 'dark' ? '#cbd5e1' : '#374151'} />
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
                            <Ionicons name="log-out-outline" size={32} color={colorScheme === 'dark' ? '#cbd5e1' : '#374151'}/>
                            <Text className="text-xl font-medium ml-4 text-gray-800 dark:text-slate-300">{t('logout')}</Text>
                        </View>
                        <FontAwesomeIcon icon={faChevronRight} size={24} color={colorScheme === 'dark' ? '#cbd5e1' : '#374151'} />
                    </Pressable>
                </View>
            </ScrollView>
        </SafeAreaView>
    )
}