import { View, Text, Image, ImageBackground, Pressable, Alert, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import React, { useState, useEffect, useContext } from "react";
import CustomButton from "../components/CustomButton";
import { TextInputWithTitle } from "../components/TextInputWithTitle";
import { ProfilePageProps } from "../utils/types";
import { useTranslation } from "react-i18next";
import { UserDataContext } from "../utils/GlobalStateContext";
import { serverAddress } from "../utils/Constants";
import { Toast } from "react-native-toast-notifications";
import { APIResponse } from "../utils/databaseTypes";
import { useColorScheme } from "nativewind";
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from "expo-image-picker"; 
import * as FileSystem from 'expo-file-system';


export default function ProfilePage({exitModal}: ProfilePageProps) {
    const userData = useContext(UserDataContext);

    const [username, setUsername] = useState(userData?.userData.username);
    const [email, setEmail] = useState(userData?.userData.email_account);
    const [rfid, setRfid] = useState(userData?.userData.rfid);
    const [company, setCompany] = useState(userData?.userData.company_name);
    const [isEditable, setIsEditable] = useState(false);
    const [file, setFile] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const { t } = useTranslation();

    const { colorScheme, toggleColorScheme } = useColorScheme();

    const pickImage = async () => { 
        const { status } = await ImagePicker. 
            requestMediaLibraryPermissionsAsync(); 
  
        if (status !== "granted") { 
  
            // If permission is denied, show an alert 
            Alert.alert( 
                "Permission Denied", 
                `Sorry, we need camera  
                 roll permission to upload images.` 
            ); 
        } else { 
  
            // Launch the image library and get 
            // the selected image 
            const result = 
                await ImagePicker.launchImageLibraryAsync(); 

            if (result.assets != null) {
                if (!result.canceled) { 
                    setFile(result.assets[0].uri);
                } 
            }
            
        } 
    }; 

    const updateUserData = async () => {
        setIsLoading(true);
        try {
            let EditProfileResponse: APIResponse;
            if (file) {
                const response = await FileSystem.uploadAsync(`${serverAddress}/api/v1/user/patch/editProfile`, file, {
                    httpMethod: 'PATCH',
                    headers: userData?.header,
                    uploadType: FileSystem.FileSystemUploadType.MULTIPART,
                    fieldName: 'file',
                    parameters: {'userID': String(userData?.userData.id),
                                 'username': username,
                                 'email': email}
                })
                EditProfileResponse = JSON.parse(response.body) as APIResponse
            } else {
                const response = await fetch(
                    `${serverAddress}/api/v1/user/patch/editProfile`,
                    {
                    method: 'PATCH',
                    headers: userData?.header as HeadersInit,
                    body: JSON.stringify({
                        userID: userData?.userData.id,
                        username: username,
                        email: email
                    })
                    }
                );
                EditProfileResponse = await response.json() as APIResponse
            }
            
            setIsLoading(false);
            if (EditProfileResponse.status === 200) {
                setUsername(username);
                setEmail(email);
                Toast.show(t('profileUpdatedSuccess'), {type: 'success', duration: 3000, textStyle: {textAlign: 'center'}})
            } else {
                Toast.show(t('profileUpdateFail'), {type: 'danger', duration: 3000, textStyle: {textAlign: 'center'}})
            }
            exitModal();
        }
        catch(error) {
            setIsLoading(false);
            Toast.show(t('profileUpdateFail'), {type: 'danger', duration: 3000, textStyle: {textAlign: 'center'}})
            exitModal();
        }
    }

    let profilePicture;

    if (file) {
        profilePicture = <ImageBackground
        className="flex-1 items-center justify-center"
        blurRadius={isEditable ? 10 : 0}
        source={{uri: file}}
        resizeMode="cover">
            {isEditable ? <Ionicons className="bg-white" name='camera-outline' size={50} color={'white'}/> : <></>}
        </ImageBackground>
    } else if (userData?.userData.profile_picture) {
        profilePicture = <ImageBackground
        className="flex-1 items-center justify-center"
        blurRadius={isEditable ? 10 : 0}
        source={{uri: 'data:image/jpeg;base64,'+ userData?.userData.profile_picture?.toString('base64')}}
        resizeMode="cover">
            {isEditable ? <Ionicons className="bg-white" name='camera-outline' size={50} color={'white'}/> : <></>}
        </ImageBackground>
    } else {
        profilePicture = <ImageBackground
        className="flex-1 items-center justify-center"
        blurRadius={isEditable ? 10 : 0}
        source={require('../assets/icons/man.png')}
        resizeMode="cover">
            {isEditable ? <Ionicons className="bg-white" name='camera-outline' size={50} color={'white'}/> : <></>}
        </ImageBackground>
    }

    return (
        <SafeAreaView className="flex-1 items-center justify-center p-5 dark:bg-slate-800">
            { isLoading ? <ActivityIndicator className="absolute w-1/2 h-1/2 z-10" size={"large"} /> : <></>}
            <Pressable
                onPress={() => {
                    if (isEditable) pickImage()
                }}
                className="overflow-hidden"
                style={{width: '40%', height: '18.5%', borderColor: colorScheme === 'dark' ? '#e2e8f0' : '#1e293b', borderRadius: 100, borderWidth: 1}}
            >
                {profilePicture}
            </Pressable>
            

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
                    <Text className="text-black dark:text-slate-100 text-xl">{company === null ? t('notAssigned') : company}</Text>
                </View>
            </View>

            <CustomButton
                onPress={() => {
                    if (isEditable) {
                        updateUserData()
                        setIsEditable(!isEditable)
                    }
                    setIsEditable(!isEditable)
                }}
                textStyle="font-bold text-lg text-white tracking-widest"
                className="h-12 w-8/12 text-center items-center justify-center rounded-lg mt-8 bg-blue-500 dark:bg-blue-800 dark:text-slate-200"
                android_ripple={{color: ''}}>
                {isEditable ? t('save') : t('editButtonText')}
            </CustomButton>

            <CustomButton
                onPress={() => {exitModal()}}
                textStyle="font-bold text-lg text-white tracking-widest"
                className="h-12 w-8/12 text-center items-center justify-center rounded-lg mt-4 bg-red-500 dark:bg-red-800 dark:text-slate-200"
                android_ripple={{color: ''}}>
                {t('cancel')}
            </CustomButton>
            
        </SafeAreaView>
    )
}