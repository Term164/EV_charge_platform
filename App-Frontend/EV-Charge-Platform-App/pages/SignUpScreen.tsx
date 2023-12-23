import { useState } from "react";
import { View, Text, Image,} from "react-native";
import CustomButton from "../components/CustomButton";
import { SafeAreaView } from "react-native-safe-area-context";
import { TextInputWithIcon } from "../components/TextInputWithIcon";
import { useTranslation } from "react-i18next";
import { useCurrentAuth } from "../utils/GlobalStateContext";
import { SignUpScreenProps } from "../utils/types";
import { useColorScheme } from "nativewind";
import Spinner from "react-native-loading-spinner-overlay";


export default function SignInScreen({ route, navigation }: SignUpScreenProps) {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const { colorScheme, toggleColorScheme } = useColorScheme();
    const { t } = useTranslation();
    const { signUp } = useCurrentAuth();

    let logo;
    if (colorScheme === 'dark'){
        logo = <Image 
                source={require('../assets/logo/Charge-Mate-Logo-smaller-dark.png')}
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

    const signUpNewUser = async () => {
        setIsLoading(true);
        const switchScreen = await signUp(username, email, password, confirmPassword);
        setIsLoading(false);
        if (switchScreen)
            navigation.navigate('SignInScreen');
    }

    return (
        <SafeAreaView className="flex-1 items-center justify-center dark:bg-slate-800">
            <Spinner
                visible={isLoading}
                textContent="Signing you up! ..."
                textStyle={{color: colorScheme === 'dark' ? 'white' : 'black'}}
            />
            {logo}

            <Text className="text-gray-800 dark:text-slate-200 font-bold text-4xl mb-10 mt-5 ">{t('createAccount')}</Text>

            <View>
                <TextInputWithIcon 
                    viewClassNames="stroke-black border dark:border-white dark:border-2 rounded-full w-9/12 p-2 mb-4"
                    iconName='person' 
                    iconSize={20}
                    iconColor={colorScheme === 'dark' ? '#d1d5db' : "#1f2937"}
                    className="flex-1 text-center text-lg font-bold text-gray-800 dark:text-slate-300" 
                    placeholder={t('usernameInputPlaceholder')}
                    placeholderTextColor={colorScheme === 'dark' ? '#d1d5db' : "#1f2937"}
                    onChangeText={newUsername => setUsername(newUsername)}
                    defaultValue={username}
                />
                <TextInputWithIcon 
                    viewClassNames="stroke-black border dark:border-white dark:border-2 rounded-full w-9/12 p-2 mb-4"
                    iconName='mail'
                    iconSize={20} 
                    iconColor={colorScheme === 'dark' ? '#d1d5db' : "#1f2937"}
                    className="flex-1 text-center text-lg font-bold text-gray-800 dark:text-slate-300"
                    placeholder={t('emailInputPlaceholder')}
                    placeholderTextColor={colorScheme === 'dark' ? '#d1d5db' : "#1f2937"}
                    onChangeText={newEmail => setEmail(newEmail)}
                    defaultValue={email}
                />

                <TextInputWithIcon 
                    viewClassNames="stroke-black border dark:border-white dark:border-2 rounded-full w-9/12 p-2 mb-4"
                    secureTextEntry={!showPassword}
                    iconName='lock-closed' 
                    iconSize={20} 
                    iconColor={colorScheme === 'dark' ? '#d1d5db' : "#1f2937"}
                    className="flex-1 text-center text-lg font-bold text-gray-800 dark:text-slate-300"
                    placeholder={t('passwordInputPlaceholder')}
                    placeholderTextColor={colorScheme === 'dark' ? '#d1d5db' : "#1f2937"}
                    onChangeText={newPassword => setPassword(newPassword)}
                    defaultValue={password}
                    iconBackName={showPassword ? "eye-outline" : "eye-off-outline"}
                    iconBackSize={25}
                    iconBackColor={colorScheme === 'dark' ? '#d1d5db' : "#1f2937"}
                    iconBackPressable={true}
                    onIconBackPress={() => setShowPassword(!showPassword)}
                />

                <TextInputWithIcon 
                    viewClassNames="stroke-black border dark:border-white dark:border-2 rounded-full w-9/12 p-2 mb-4"
                    secureTextEntry={!showConfirmPassword}
                    iconName='lock-closed' 
                    iconSize={20} 
                    iconColor={colorScheme === 'dark' ? '#d1d5db' : "#1f2937"}
                    className="flex-1 text-center text-lg font-bold text-gray-800 dark:text-slate-300"
                    placeholder={t('confirmPassInputPlaceholder')}
                    placeholderTextColor={colorScheme === 'dark' ? '#d1d5db' : "#1f2937"}
                    onChangeText={newConfirmPassword => setConfirmPassword(newConfirmPassword)}
                    defaultValue={confirmPassword}
                    iconBackName={showConfirmPassword ? "eye-outline" : "eye-off-outline"}
                    iconBackSize={25}
                    iconBackColor={colorScheme === 'dark' ? '#d1d5db' : "#1f2937"}
                    iconBackPressable={true}
                    onIconBackPress={() => setShowPassword(!showConfirmPassword)}
                />
                
            </View>

             <CustomButton
                    onPress={signUpNewUser}
                    textStyle="font-bold text-lg text-white tracking-widest"
                    className="h-12 w-8/12 text-center flex-row items-center justify-center rounded-lg mt-8 bg-blue-500 dark:bg-blue-500/80" 
                    android_ripple={{color: ''}}>{t('signUpButtonText')}</CustomButton>
            

        </SafeAreaView>
    )
}