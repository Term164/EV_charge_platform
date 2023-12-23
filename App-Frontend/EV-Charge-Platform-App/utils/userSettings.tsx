import AsyncStorage from '@react-native-async-storage/async-storage';
import { Language } from "./types";
import { ColorSchemeName } from "react-native";
import { SettingsContext, userSettingsContext } from './GlobalStateContext';

export async function getUserSettingsContext(colorScheme: ColorSchemeName, toggleColorScheme: () => void, updateSettingsContext: (settingsContext: userSettingsContext) => void) {
    const theme = await AsyncStorage.getItem('theme');
    const language = await AsyncStorage.getItem('language') as Language;
    const notifications = await AsyncStorage.getItem('notifications');
    const selectedChargingTypes = JSON.parse(await AsyncStorage.getItem('chargingTypes') as string);

    const settingsContext = {
        colorScheme: theme ? theme : colorScheme as string,
        toggleColorScheme: toggleColorScheme,
        language: language ? language : 'en',
        selectedChargingTypes: selectedChargingTypes ? selectedChargingTypes: [] as Array<string>,
        notifications: notifications ? notifications : 'false',
        setColorScheme: () => {},
        updateSettingsContext: updateSettingsContext
    }

    return settingsContext;
}

export function getDefaultSettingsContext(colorScheme: ColorSchemeName, toggleColorScheme: () => void) {
    const settingsContext = {
        colorScheme: colorScheme as string,
        toggleColorScheme: toggleColorScheme,
        language: 'en' as Language,
        selectedChargingTypes: [] as Array<string>,
        notifications: 'false',
        setColorScheme: (colorScheme: string) => {},
        updateSettingsContext: (SettingsContext: userSettingsContext) => {}
    }

    return settingsContext;
}