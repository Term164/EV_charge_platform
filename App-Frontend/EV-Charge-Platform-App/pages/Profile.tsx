import { View, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from '@expo/vector-icons';
import React, { useState, useEffect } from "react";
import CustomButton from "../components/CustomButton";
import { TextInputWithTitle } from "../components/TextInputWithTitle";
import { Pressable } from "react-native";
import { useToast } from 'react-native-toast-notifications'
import { ProfilePageProps } from "../utils/types";
import { useTranslation } from "react-i18next";
import { useCurrentSettings } from "../utils/GlobalStateContext";



export default function ProfilePage({exitModal}: ProfilePageProps) {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [rfid, setRfid] = useState(null);
    const [isEditable, setIsEditable] = useState(false)

    const { t } = useTranslation();

    const { colorScheme, toggleColorScheme } = useCurrentSettings();

    const toast = useToast();

    useEffect(() => {
        setUsername('Term');
        setEmail('Jani.Bangiev@gmail.com')
    }, [])

    return (
        <SafeAreaView className="flex-1 items-center justify-center p-5 dark:bg-slate-800">
            <Ionicons name={'person-circle-outline'} color={'#e2e8f0'} size={120}/>

            <TextInputWithTitle
                title={t('usernameInputPlaceholder')}
                titleClassNames="text-gray-600 dark:text-slate-300 text-xl mb-1"
                innerViewClassNames="shadow-xl shadow-black border-transparent"
                mainViewClassNames="w-full"
                defaultValue={username}
                editable={isEditable}
                onChangeText={newUsername => setUsername(newUsername)}
                className="text-xl bg-white dark:bg-slate-600 p-3 rounded-xl"
                style={{color: isEditable ? colorScheme === 'dark' ? '#e2e8f0' : '#1e293b' : colorScheme === 'dark' ? '#334155' : '#d1d5db'}}
            />

            <TextInputWithTitle
                title={t('emailInputPlaceholder')}
                titleClassNames="text-gray-600 dark:text-slate-300 text-xl mb-1"
                innerViewClassNames="shadow-xl shadow-black border-transparent"
                mainViewClassNames="w-full mt-5"
                defaultValue={email}
                editable={isEditable}
                onChangeText={newUsername => setUsername(newUsername)}
                className="text-xl bg-white dark:bg-slate-600 p-3 rounded-xl"
                style={{color: isEditable ? colorScheme === 'dark' ? '#e2e8f0' : '#1e293b' : colorScheme === 'dark' ? '#334155' : '#d1d5db'}}
            />

            <View className="flex-row justify-between self-stretch mt-5">
                <View className="flex-col">
                    <Text className="text-gray-600 dark:text-slate-400 text-xl">RFID: </Text>
                    <Text className="text-black dark:text-slate-100 text-xl">{rfid === null ? t('notAssigned') : t('assigned')}</Text>
                </View>

                <View className="flex-col">
                    <Text className="text-gray-600 dark:text-slate-400 text-xl">{t('company')}: </Text>
                    <Text className="text-black dark:text-slate-100 text-xl">{rfid === null ? t('notAssigned') : rfid}</Text>
                </View>
            </View>
            
            { isEditable ? (
                <>
                <CustomButton
                    onPress={() => {
                        if (isEditable) {
                            //TODO: save new info
                        }
                        setIsEditable(!isEditable)
                    }}
                    textStyle="font-bold text-lg dark:text-slate-200"
                    className="h-12 w-8/12 text-center flex-row items-center justify-center rounded-lg mt-8 border stroke-black dark:border-slate-200 dark:border-2"
                    android_ripple={{color: ''}}>
                    Upload new image
                </CustomButton></> ) : (<></>)}
            <CustomButton
                onPress={() => {
                    if (isEditable) {
                        //TODO: save new info
                    }
                    setIsEditable(!isEditable)
                }}
                textStyle="font-bold text-lg text-white tracking-widest"
                className="h-12 w-8/12 text-center items-center justify-center rounded-lg mt-8 bg-blue-500 dark:bg-blue-800 dark:text-slate-200"
                android_ripple={{color: ''}}>
                {isEditable ? t('save') : t('editButtonText')}
            </CustomButton>

            {
                isEditable ? (<></>) :
                (<CustomButton
                    onPress={() => {exitModal()}}
                    textStyle="font-bold text-lg text-white tracking-widest"
                    className="h-12 w-8/12 text-center items-center justify-center rounded-lg mt-4 bg-red-500 dark:bg-red-800 dark:text-slate-200"
                    android_ripple={{color: ''}}>
                    {t('cancel')}
                </CustomButton>)
            }
            
        </SafeAreaView>
    )
}