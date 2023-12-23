import { Image, Text, TextInput, View } from "react-native";
import { useTranslation } from "react-i18next";
import CustomButton from "../components/CustomButton";
import { ResetPasswordScreenProps } from "../utils/types";
import { TextInputWithTitle } from "../components/TextInputWithTitle";
import { useCurrentSettings } from "../utils/GlobalStateContext";
import { useState } from "react";

export default function ResetPasswordScreen({route, navigation}: ResetPasswordScreenProps) {
    const { t } = useTranslation();
    const { colorScheme, toggleColorScheme } = useCurrentSettings();

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    return (
        <View className="flex-1 p-3 items-center justify-center dark:bg-slate-800">
            <Text className="mt-8 text-2xl mb-10 font-semibold text-gray-800 dark:text-slate-300">{'Reset Password'}</Text>
            
            <TextInputWithTitle
                title={'Enter New Password'}
                secureTextEntry={!showPassword}
                titleClassNames="text-gray-600 text-center dark:text-slate-300 text-xl mb-1"
                innerViewClassNames="shadow-xl shadow-black border-transparent"
                mainViewClassNames="w-10/12"
                className="text-xl bg-white dark:bg-slate-600 p-3 rounded-xl text-slate-800"
                defaultValue={password}
            />

            <TextInputWithTitle
                title={'Confirm New Password'}
                secureTextEntry={!showPassword}
                titleClassNames="text-gray-600 text-center dark:text-slate-300 text-xl mb-1"
                innerViewClassNames="shadow-xl shadow-black border-transparent"
                mainViewClassNames="w-10/12 mt-6"
                className="text-xl bg-white dark:bg-slate-600 p-3 rounded-xl text-slate-800"
                defaultValue={confirmPassword}
            />

            <CustomButton
                onPress={() => setShowPassword(!showPassword)}
                textStyle="font-bold text-lg text-white dark:text-slate-300 tracking-widest"
                className="h-12 w-8/12 text-center flex-row items-center justify-center rounded-full mt-10 bg-blue-500 dark:bg-blue-800/80" 
                android_ripple={{color: ''}}>{'SHOW PASSWORD'}</CustomButton>

            <CustomButton
                textStyle="font-bold text-lg text-white dark:text-slate-300 tracking-widest"
                className="h-12 w-8/12 text-center flex-row items-center justify-center rounded-full mt-10 bg-blue-500 dark:bg-blue-800/80" 
                android_ripple={{color: ''}}>{'CONFIRM'}</CustomButton>
        </View>
    );
}