import { useEffect, useState } from "react";
import { View, Text, Image,} from "react-native";
import CustomButton from "../components/CustomButton";
import { SafeAreaView } from "react-native-safe-area-context";
import { TextInputWithIcon } from "../components/TextInputWithIcon";


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
                source={require('../assets/logo/Charge-Mate-Logo-smaller.png')}
                style={{width: '40%', height: '21%', resizeMode: 'cover'}}
                className=""
            />

            <Text className="text-black font-bold text-4xl mb-10 mt-5 ">Create account</Text>

            <View>
                <TextInputWithIcon 
                    viewClassNames="stroke-black border rounded-full w-9/12 p-2 mb-4"
                    iconName='person' 
                    iconSize={20} 
                    className="flex-1 text-center text-lg font-bold text-gray-800" 
                    placeholder="Username"
                    onChangeText={newUsername => setUsername(newUsername)}
                    defaultValue={username}
                />
                <TextInputWithIcon 
                    viewClassNames="stroke-black border rounded-full w-9/12 p-2 mb-4"
                    iconName='mail'
                    iconSize={20} 
                    className="flex-1 text-center text-lg font-bold text-gray-800" 
                    placeholder="Email"
                    onChangeText={newEmail => setEmail(newEmail)}
                    defaultValue={email}
                />

                <TextInputWithIcon 
                    viewClassNames="stroke-black border rounded-full w-9/12 p-2 mb-4"
                    secureTextEntry
                    iconName='lock-closed' 
                    iconSize={20} 
                    className="flex-1 text-center text-lg font-bold text-gray-800" 
                    placeholder="Password"
                    onChangeText={newPassword => setPassword(newPassword)}
                    defaultValue={password}
                />

                <TextInputWithIcon 
                    viewClassNames="stroke-black border rounded-full w-9/12 p-2 mb-4"
                    secureTextEntry
                    iconName='lock-closed' 
                    iconSize={20} 
                    className="flex-1 text-center text-lg font-bold text-gray-800" 
                    placeholder="Confirm password"
                    onChangeText={newConfirmPassword => setConfirmPassword(newConfirmPassword)}
                    defaultValue={confirmPassword}
                />
                
            </View>

             <CustomButton
                    textStyle="font-bold text-lg text-white tracking-widest"
                    className="h-12 w-8/12 text-center flex-row items-center justify-center rounded-lg mt-8 bg-blue-500" 
                    android_ripple={{color: ''}}>SIGN UP</CustomButton>
            

        </SafeAreaView>
    )
}