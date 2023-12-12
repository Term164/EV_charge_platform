import { useEffect, useState } from "react";
import { View, Text, Image,} from "react-native";
import CustomButton from "../components/CustomButton";
import { SafeAreaView } from "react-native-safe-area-context";
import { TextInputWithIcon } from "../components/TextInputWithIcon";
import { useTranslation } from "react-i18next";
import { useCurrentSettings } from "../utils/GlobalStateContext";


type Response = {
    status: number,
    message: string,
    error: string,
    data: object
}

export default function SignInScreen() {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const { colorScheme, toggleColorScheme } = useCurrentSettings();
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

    return (
        <SafeAreaView className="flex-1 items-center justify-center dark:bg-slate-800">

            {logo}

            <Text className="text-gray-800 dark:text-slate-200 font-bold text-4xl mb-10 mt-5 ">{t('createAccount')}</Text>

            <View>
                <TextInputWithIcon 
                    viewClassNames="stroke-black border dark:border-white dark:border-2 rounded-full w-9/12 p-2 mb-4"
                    iconName='person' 
                    iconSize={20}
                    iconColor={colorScheme === 'dark' ? '#d1d5db' : "#1f2937"}
                    className="flex-1 text-center text-lg font-bold text-gray-800" 
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
                    className="flex-1 text-center text-lg font-bold text-gray-800" 
                    placeholder={t('emailInputPlaceholder')}
                    placeholderTextColor={colorScheme === 'dark' ? '#d1d5db' : "#1f2937"}
                    onChangeText={newEmail => setEmail(newEmail)}
                    defaultValue={email}
                />

                <TextInputWithIcon 
                    viewClassNames="stroke-black border dark:border-white dark:border-2 rounded-full w-9/12 p-2 mb-4"
                    secureTextEntry
                    iconName='lock-closed' 
                    iconSize={20} 
                    iconColor={colorScheme === 'dark' ? '#d1d5db' : "#1f2937"}
                    className="flex-1 text-center text-lg font-bold text-gray-800" 
                    placeholder={t('passwordInputPlaceholder')}
                    placeholderTextColor={colorScheme === 'dark' ? '#d1d5db' : "#1f2937"}
                    onChangeText={newPassword => setPassword(newPassword)}
                    defaultValue={password}
                />

                <TextInputWithIcon 
                    viewClassNames="stroke-black border dark:border-white dark:border-2 rounded-full w-9/12 p-2 mb-4"
                    secureTextEntry
                    iconName='lock-closed' 
                    iconSize={20} 
                    iconColor={colorScheme === 'dark' ? '#d1d5db' : "#1f2937"}
                    className="flex-1 text-center text-lg font-bold text-gray-800" 
                    placeholder={t('confirmPassInputPlaceholder')}
                    placeholderTextColor={colorScheme === 'dark' ? '#d1d5db' : "#1f2937"}
                    onChangeText={newConfirmPassword => setConfirmPassword(newConfirmPassword)}
                    defaultValue={confirmPassword}
                />
                
            </View>

             <CustomButton
                    textStyle="font-bold text-lg text-white tracking-widest"
                    className="h-12 w-8/12 text-center flex-row items-center justify-center rounded-lg mt-8 bg-blue-500 dark:bg-blue-500/80" 
                    android_ripple={{color: ''}}>{t('signUpButtonText')}</CustomButton>
            

        </SafeAreaView>
    )
}