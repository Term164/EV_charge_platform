import { useColorScheme } from "nativewind";
import React from "react";

export function getUserSettingsContext() {
    const { colorScheme, toggleColorScheme } = useColorScheme();
    const settingsContext = {
        colorScheme: colorScheme,
        toggleColorScheme: toggleColorScheme
    }

    return settingsContext;
}