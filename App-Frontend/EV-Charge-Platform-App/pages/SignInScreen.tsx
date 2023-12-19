import React, { useState } from "react";
import { View, Text, Image, Pressable,} from "react-native";
import CustomButton from "../components/CustomButton";
import { SafeAreaView } from "react-native-safe-area-context";
import { TextInputWithIcon } from "../components/TextInputWithIcon";
import { SignInScreenProps } from "../utils/types";
import { useCurrentAuth } from "../utils/GlobalStateContext";
import { useTranslation } from "react-i18next";
import Spinner from 'react-native-loading-spinner-overlay';
import { useColorScheme } from "nativewind";

export default function SignInScreen({ route, navigation }: SignInScreenProps) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const { colorScheme, toggleColorScheme } = useColorScheme();
    const { signIn } = useCurrentAuth();

    const { t } = useTranslation();

    let logo;
    if (colorScheme === 'dark'){
        logo = <Image 
                source={require('../assets/logo/Charge-Mate-Logo-dark.png')}
                style={{width: '40%', height: '20%', resizeMode: 'cover'}}
            />
    }
    else {
        logo = <Image 
                source={require('../assets/logo/Charge-Mate-Logo.png')}
                style={{width: '40%', height: '20%', resizeMode: 'cover'}}
            />
    }

    const signInUser = async (username: string, password: string) => {
        setIsLoading(true);
        await signIn(username, password);
        setIsLoading(false);
    }

    return (
        <SafeAreaView className="flex-1 items-center justify-center dark:bg-slate-800">
            <Spinner
                visible={isLoading}
                textContent="Logging in..."
                textStyle={{color: colorScheme === 'dark' ? 'white' : 'black'}}
            />
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
                    className="flex-1 text-center text-lg font-bold text-gray-800 dark:text-slate-300" 
                    placeholder={t("passInputPlaceholder")}
                    placeholderTextColor={colorScheme === 'dark' ? '#d1d5db' : "#1f2937"}
                    onChangeText={newPassword => setPassword(newPassword)}
                    defaultValue={password}
                />
            </View>

             <CustomButton
                    onPress={() => signInUser(username, password)}
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