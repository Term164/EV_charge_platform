import { useEffect, useState } from "react";
import { View, Text, TextInput, Button } from "react-native";
import CustomButton from "../components/CustomButton";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from '@expo/vector-icons';
import { TextInputWithIcon } from "../components/TextInputWithIcon";


type Response = {
    status: number,
    message: string,
    error: string,
    data: object
}

export default function SignInScreen() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
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
            <Text className="text-blue-800 font-bold mt-2 text-5xl">Charge Mate</Text>
            <Text className="text-blue-800 font-bold mt-2 text-4xl mb-24">Login</Text>


            {/* <TextInputWithIcon 
                viewClassNames=""
                iconName='person' 
                iconSize={20} 
                className="flex-1 text-center text-lg font-bold text-gray-800 bg-yellow-800" 
                placeholder="Username or Email"
                onChangeText={newUsername => setUsername(newUsername)}
                defaultValue={username}
                /> */}

            <TextInputWithIcon 
                viewClassNames="bg-blue-400 rounded-full w-72 p-2 mb-4"
                iconName='person' 
                iconSize={20} 
                className="flex-1 text-center text-lg font-bold text-gray-800" 
                placeholder="Username or Email"
                onChangeText={newUsername => setUsername(newUsername)}
                defaultValue={username}
            />

            {/* <View className="bg-blue-400 rounded-full w-72 p-2 mb-4 flex-row items-center justify-center">
                <Ionicons style={{fontSize: 20}} name="person" />
                <TextInput
                    className="flex-1 text-center text-lg font-bold text-gray-800"
                    placeholder="Username or Email"
                    onChangeText={newUsername => setUsername(newUsername)}
                    defaultValue={username}
                />
            </View> */}
             <TextInput
                className=" bg-blue-400 rounded-full w-72 text-center text-lg p-2 font-bold text-gray-800"
                secureTextEntry
                placeholder="Password"
                onChangeText={newPassword => setPassword(newPassword)}
                defaultValue={password}
             />
             <CustomButton textStyle="font-bold" className="bg-yellow-300" android_ripple={{color: 'yellow-400'}}>This text will be bold</CustomButton>
             
             <View className="flex-row self-stretch justify-between m-20">
                <Button
                    title="Sign up"
                />

                <Button 
                    title="Sign in"
                />
             </View>
        </SafeAreaView>
    )
}