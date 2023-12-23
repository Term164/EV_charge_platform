import { Image, Text, TextInput, View } from "react-native";
import { useTranslation } from "react-i18next";
import CustomButton from "../components/CustomButton";
import { ForgotPasswordScreenProps } from "../utils/types";
import { useCurrentSettings } from "../utils/GlobalStateContext";

export default function ForgotPasswordScreen({route, navigation}: ForgotPasswordScreenProps) {
    const { t } = useTranslation();
    const { colorScheme, toggleColorScheme } = useCurrentSettings();

    return (
        <View className="flex-1 p-3 items-center justify-center dark:bg-slate-800">
            <Text className="mt-8 text-2xl mb-10 font-semibold text-gray-800 dark:text-slate-300">{'Forgot Password?'}</Text>
            <Image 
                source={require('../assets/icons/forgot-password.png')}
                style={{width: '60%', height: '27%', marginLeft: 50, resizeMode: 'cover'}}
            />
            <Text className="mt-8 text-xl text-center font-semibold text-gray-800 dark:text-slate-300">{'Enter the email address associated with your account.'}</Text>
            <Text className="mt-4 px-3 text-base font-semibold text-gray-500 dark:text-slate-400 text-center">{'We will email you a link to reset your password.'}</Text>

            <TextInput
                className="dark:text-slate-200 text-slate-800 px-12 text-xl font-medium border-b-2 mt-4 border-b-slate-500"
                placeholder="Enter Email Address"
                placeholderTextColor={colorScheme === 'dark' ? '#64748b' :  '#1e293b'}
            />

            <CustomButton
                onPress={() => navigation.navigate('VerifyCodeScreen')}
                textStyle="font-bold text-lg text-white dark:text-slate-300 tracking-widest"
                className="h-12 w-8/12 text-center flex-row items-center justify-center rounded-full mt-8 bg-blue-500 dark:bg-blue-800/80" 
                android_ripple={{color: ''}}>{'SEND'}</CustomButton>
        </View>
    );
}