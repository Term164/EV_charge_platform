import React, { useEffect, useState } from "react";
import { View, Text, TextInput, Button, Image, Pressable, Alert,} from "react-native";
import CustomButton from "../components/CustomButton";
import { SafeAreaView } from "react-native-safe-area-context";
import { TextInputWithIcon } from "../components/TextInputWithIcon";
import { SignInScreenProps } from "../utils/types";
import { AuthContext } from "../utils/GlobalStateContext";


type Response = {
    status: number,
    message: string,
    error: string,
    data: object
}

export default function SignInScreen({ route, navigation }: SignInScreenProps) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const { signIn } = React.useContext(AuthContext);
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

    return (
        <SafeAreaView className="flex-1 items-center justify-center">
            <Image 
                source={require('../assets/logo/Charge-Mate-Logo.png')}
                style={{width: '40%', height: '20%', resizeMode: 'cover'}}
                className=""
            />

            <Text className="text-black font-bold text-4xl">Welcome Back</Text>
            <Text className="text-gray-500 ml-1 mb-16 font-bold text-lg">Sign in to continue</Text>

            <View>
                <TextInputWithIcon 
                    viewClassNames="stroke-black border rounded-full w-72 p-2 mb-4"
                    iconName='person' 
                    iconSize={20} 
                    className="flex-1 text-center text-lg font-bold text-gray-800" 
                    placeholder="Username or Email"
                    onChangeText={newUsername => setUsername(newUsername)}
                    defaultValue={username}
                />

                <TextInputWithIcon 
                    viewClassNames="stroke-black border rounded-full w-72 p-2 mb-4"
                    secureTextEntry
                    iconName='lock-closed' 
                    iconSize={20} 
                    className="flex-1 text-center text-lg font-bold text-gray-800" 
                    placeholder="Password"
                    onChangeText={newPassword => setPassword(newPassword)}
                    defaultValue={password}
                />
            </View>

             <CustomButton
                    onPress={() => signIn(username, password)}
                    textStyle="font-bold text-lg text-white"
                    className="h-12 w-8/12 text-center flex-row items-center justify-center rounded-lg mt-8 bg-blue-500" 
                    android_ripple={{color: ''}}>SIGN IN</CustomButton>

            <Pressable 
                onPress={() => navigation.navigate('SignUpScreen')}
                className="justify-center mt-10"
            >
                <Text>Don't have an account yet?  <Text className="font-bold underline text-base">Sign up</Text> </Text>
            </Pressable>

            <Pressable 
                    onPress={() => Alert.alert('Forgot password')}
                    className="justify-center mt-5"
                >
                    <Text className="text-gray-500 text-sm">Forgot Password?</Text>
            </Pressable>
            

        </SafeAreaView>
    )
}