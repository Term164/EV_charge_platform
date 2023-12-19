import AsyncStorage from '@react-native-async-storage/async-storage';
import { Language } from "./types";
import { ColorSchemeName } from "react-native";

export async function getUserSettingsContext(colorScheme: ColorSchemeName, toggleColorScheme: () => void) {
    const theme = await AsyncStorage.getItem('theme');
    const language = await AsyncStorage.getItem('language') as Language;
    const notifications = await AsyncStorage.getItem('notifications');

    const settingsContext = {
        colorScheme: theme ? theme : colorScheme as string,
        toggleColorScheme: toggleColorScheme,
        language: language ? language : 'en',
        notifications: notifications ? notifications : 'false',
        setColorScheme: () => {}
    }

    return settingsContext;
}

export function getDefaultSettingsContext(colorScheme: ColorSchemeName, toggleColorScheme: () => void) {
    const settingsContext = {
        colorScheme: colorScheme as string,
        toggleColorScheme: toggleColorScheme,
        language: 'en' as Language,
        notifications: 'false',
        setColorScheme: () => {}
    }

    return settingsContext;
}