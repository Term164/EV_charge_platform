import React, { useState } from "react";
import { View, Text, Image, Pressable, Alert,} from "react-native";
import CustomButton from "../components/CustomButton";
import { SafeAreaView } from "react-native-safe-area-context";
import { TextInputWithIcon } from "../components/TextInputWithIcon";
import { SignInScreenProps } from "../utils/types";
import { AuthContext, useCurrentAuth, useCurrentSettings } from "../utils/GlobalStateContext";
import { useTranslation } from "react-i18next";
import { styled, useColorScheme } from "nativewind";

export default function SignInScreen({ route, navigation }: SignInScreenProps) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const { colorScheme, toggleColorScheme } = useCurrentSettings();
    const { signIn } = useCurrentAuth();

    const { t } = useTranslation();

    // const [data, setData] = useState<Response>();
    
    // const testFetch = async () => {
    //     try {
    //         const response = await fetch(
    //           'http://192.168.50.188:3000/api/v1/auth/login',
    //           {
    //             method: 'POST',
    //             headers: {
    //                 Accept: '*/*',
    //                 'Content-Type': 'application/json'
    //             },
    //             body: JSON.stringify({
    //                 "username": "asd",
    //                 "password": "test"
    //             })
    //           }
    //         );
    //         const json = await response.json();
    //         console.log(json.data['sessionID']);
    //         setData(json);
    //     } catch (error) {
    //         console.error(error);
    //     }
    // }

    // useEffect(() => {
    //     testFetch();
    // },[]);

    let logo;
    if (colorScheme === 'dark'){
        logo = <Image 
                source={require('../assets/logo/Charge-Mate-Logo-dark.png')}
                style={{width: '40%', height: '20%', resizeMode: 'cover'}}
                className=""
            />
    }
    else {
        logo = <Image 
                source={require('../assets/logo/Charge-Mate-Logo.png')}
                style={{width: '40%', height: '20%', resizeMode: 'cover'}}
                className=""
            />
    }

    return (
        <SafeAreaView className="flex-1 items-center justify-center dark:bg-slate-800">
            {logo}
            <Text className="text-black dark:text-slate-200 font-bold text-4xl">{t("signInWelcome")}</Text>
            <Text className="text-gray-500 dark:text-slate-300 ml-1 mb-16 font-bold text-lg">{t("signInSubHeader")}</Text>

            <View>
                <TextInputWithIcon 
                    viewClassNames="stroke-black border dark:border-white dark:border-2 rounded-full w-72 p-2 mb-4"
                    iconName='person' 
                    iconSize={20} 
                    iconColor={colorScheme === 'dark' ? '#d1d5db' : "#1f2937"}
                    className="flex-1 text-center text-lg font-bold text-gray-800 dark:text-slate-300"
                    placeholder={t("usernameEmailInputPlaceholder")}
                    placeholderTextColor={colorScheme === 'dark' ? '#d1d5db' : "#1f2937"}
                    onChangeText={newUsername => setUsername(newUsername)}
                    defaultValue={username}
                />

                <TextInputWithIcon 
                    viewClassNames="stroke-black border dark:border-white dark:border-2 rounded-full w-72 p-2 mb-4"
                    secureTextEntry
                    iconName='lock-closed' 
                    iconSize={20} 
                    iconColor={colorScheme === 'dark' ? '#d1d5db' : "#1f2937"}
                    className="flex-1 text-center text-lg font-bold text-gray-800" 
                    placeholder={t("passInputPlaceholder")}
                    placeholderTextColor={colorScheme === 'dark' ? '#d1d5db' : "#1f2937"}
                    onChangeText={newPassword => setPassword(newPassword)}
                    defaultValue={password}
                />
            </View>

             <CustomButton
                    onPress={() => signIn(username, password)}
                    textStyle="font-bold text-lg text-white dark:text-slate-300 tracking-widest"
                    className="h-12 w-8/12 text-center flex-row items-center justify-center rounded-lg mt-8 bg-blue-500 dark:bg-blue-500/80" 
                    android_ripple={{color: ''}}>{t('signInButtonText')}</CustomButton>

            <Pressable 
                onPress={() => navigation.navigate('SignUpScreen')}
                className="justify-center mt-10"
            >
                <Text className="dark:text-slate-300">{t('registerTextNormal')} <Text className="font-bold underline text-base dark:text-white">{t('registerTextBold')}</Text></Text>
            </Pressable>

            <Pressable 
                    onPress={toggleColorScheme}
                    className="justify-center mt-5"
                >
                    <Text className="text-gray-500 dark:text-slate-400 text-sm">{t('forgotPassword')}</Text>
            </Pressable>
            

        </SafeAreaView>
    )
}