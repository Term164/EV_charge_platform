import { Image, Text, TextInput, View } from "react-native";
import { useTranslation } from "react-i18next";
import CustomButton from "../components/CustomButton";
import { ResetPasswordScreenProps } from "../utils/types";
import { TextInputWithTitle } from "../components/TextInputWithTitle";
import { useCurrentSettings } from "../utils/GlobalStateContext";
import { useState } from "react";
import { Toast } from "react-native-toast-notifications";
import { serverAddress } from "../utils/Constants";
import { APIResponse } from "../utils/databaseTypes";

function isPasswordStrongEnough(pass: string) {
    return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}/.test(pass);
}

export default function ResetPasswordScreen({route, navigation}: ResetPasswordScreenProps) {
    const { t } = useTranslation();
    const { colorScheme, toggleColorScheme } = useCurrentSettings();
    const { accountID } = route.params;

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);


    const updatePassword = async () => {
        if (password.length === 0) {
            Toast.show(t('passwordFieldEmpty'), {type: 'warning', duration: 2000, textStyle: {textAlign: 'center'}});
            return false;
        }

        if (!isPasswordStrongEnough(password)) {
            Toast.show(t('passwordStrength'), {type: 'warning', duration: 10000, textStyle: {textAlign: 'center'}});
            return false;
        }

        if (confirmPassword != password) {
            Toast.show(t('passwordsNotMatching'), {type: 'warning', duration: 2000, textStyle: {textAlign: 'center'}});
            return false;
        }

        try {
            const response = await fetch(
                `${serverAddress}/api/v1/auth/resetPassword`,
                {
                method: 'POST',
                headers: {
                    Accept: '*/*',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    accountID: accountID,
                    newPassword: password
                })
                }
            );
            const resetPassResponse = await response.json() as APIResponse;
            if (response.status == 200) {
                Toast.show(t('passwordChangeSuccess'), {type: 'success', textStyle: {textAlign: 'center'}});
                navigation.navigate('SignInScreen');
            } else {
                Toast.show(resetPassResponse.message, {type: 'danger', textStyle: {textAlign: 'center'}});
                navigation.navigate('SignInScreen');
            }
        } catch (error) {
            Toast.show(t('somethingWrong'), {type: 'danger', textStyle: {textAlign: 'center'}});
            if (error instanceof Error )
                console.trace(error.message, error.stack, error.name ,error.cause);
            return false;
        }
    }

    return (
        <View className="flex-1 p-3 items-center justify-center dark:bg-slate-800">
            <Text className="mt-8 text-2xl mb-10 font-semibold text-gray-800 dark:text-slate-300">{t('Reset Password')}</Text>
            
            <TextInputWithTitle
                title={t('enterNewPassword')}
                secureTextEntry={!showPassword}
                titleClassNames="text-gray-600 text-center dark:text-slate-300 text-xl mb-1"
                innerViewClassNames="shadow-xl shadow-black border-transparent"
                mainViewClassNames="w-10/12"
                className="text-xl bg-white p-3 rounded-xl text-slate-800 dark:text-slate-300 dark:bg-slate-600"
                defaultValue={password}
                onChangeText={newPasword => setPassword(newPasword)}
            />

            <TextInputWithTitle
                title={t('confirmNewPassword')}
                secureTextEntry={!showPassword}
                titleClassNames="text-gray-600 text-center dark:text-slate-300 text-xl mb-1"
                innerViewClassNames="shadow-xl shadow-black border-transparent"
                mainViewClassNames="w-10/12 mt-6"
                className="text-xl bg-white p-3 rounded-xl text-slate-800 dark:text-slate-300 dark:bg-slate-600"
                defaultValue={confirmPassword}
                onChangeText={newPasword => setConfirmPassword(newPasword)}
            />

            <CustomButton
                onPress={() => setShowPassword(!showPassword)}
                textStyle="font-bold text-lg text-white dark:text-slate-300 tracking-widest"
                className="h-12 w-8/12 text-center flex-row items-center justify-center rounded-full mt-10 bg-blue-500 dark:bg-blue-800/80" 
                android_ripple={{color: ''}}>{t('showPass')}</CustomButton>

            <CustomButton
                onPress={updatePassword}
                textStyle="font-bold text-lg text-white dark:text-slate-300 tracking-widest"
                className="h-12 w-8/12 text-center flex-row items-center justify-center rounded-full mt-10 bg-blue-500 dark:bg-blue-800/80" 
                android_ripple={{color: ''}}>{t('confirm')}</CustomButton>
        </View>
    );
}