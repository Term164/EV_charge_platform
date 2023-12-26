import { Image, Text, TextInput, View } from "react-native";
import { useTranslation } from "react-i18next";
import CustomButton from "../components/CustomButton";
import { ForgotPasswordScreenProps } from "../utils/types";
import { useCurrentSettings } from "../utils/GlobalStateContext";
import { serverAddress } from "../utils/Constants";
import { useState } from "react";
import { APIResponse, forgotPasswordResponse } from "../utils/databaseTypes";
import { Toast } from "react-native-toast-notifications";

export default function ForgotPasswordScreen({route, navigation}: ForgotPasswordScreenProps) {
    const { t } = useTranslation();
    const { colorScheme, toggleColorScheme } = useCurrentSettings();
    const [email, setEmail] = useState('');

    const sendResetPasswordRequest = async () => {
        if (email.length == 0) {
            Toast.show(t('Email address cannot be empty'), {type: 'warning', textStyle: {textAlign: 'center'}})
            return;
        }
        try {
            const response = await fetch(
                `${serverAddress}/api/v1/auth/forgotPassword`,
                {
                method: 'POST',
                headers: {
                    Accept: '*/*',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email: email.toLowerCase()
                })
                }
            );
            const loginResponse = await response.json() as forgotPasswordResponse;

            if (loginResponse.status === 200) {
                Toast.show(loginResponse.message, {type: 'success', textStyle: {textAlign: 'center'}});
                navigation.navigate('VerifyCodeScreen', {email: email, accountID: loginResponse.data.account_id});
            } else {
                Toast.show(loginResponse.message, {type: 'danger', textStyle: {textAlign: 'center'}});
            }
        } catch (error) {
            Toast.show(t('somethingWrong'), {type: 'danger'});
        }
    }

    return (
        <View className="flex-1 p-3 items-center justify-center dark:bg-slate-800">
            <Text className="mt-8 text-2xl mb-10 font-semibold text-gray-800 dark:text-slate-300">{t('forgotPassword')}</Text>
            <Image 
                source={require('../assets/icons/forgot-password.png')}
                style={{width: '60%', height: '27%', marginLeft: 50, resizeMode: 'cover'}}
            />
            <Text className="mt-8 text-xl text-center font-semibold text-gray-800 dark:text-slate-300">{t('forgotPassFirstMessage')}</Text>
            <Text className="mt-4 px-3 text-base font-semibold text-gray-500 dark:text-slate-400 text-center">{t('forgotPassSecondMessage')}</Text>

            <TextInput
                defaultValue={email}
                onChangeText={newEmail => setEmail(newEmail)}
                className="text-slate-800 dark:text-slate-200 px-12 text-xl font-medium border-b-2 mt-4 border-b-slate-500"
                placeholder={t('forgotPassEmail')}
                placeholderTextColor={colorScheme === 'dark' ? '#64748b' :  '#1e293b'}
            />

            <CustomButton
                onPress={sendResetPasswordRequest}
                textStyle="font-bold text-lg text-white dark:text-slate-300 tracking-widest"
                className="h-12 w-8/12 text-center flex-row items-center justify-center rounded-full mt-8 bg-blue-500 dark:bg-blue-800/80" 
                android_ripple={{color: ''}}>{t('send')}</CustomButton>
        </View>
    );
}