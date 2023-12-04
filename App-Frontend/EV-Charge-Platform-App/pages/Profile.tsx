import { View, Text, TextInput, StyleSheet, Modal } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from '@expo/vector-icons';
import React, { useState, useEffect } from "react";
import CustomButton from "../components/CustomButton";
import { AuthContext } from "../utils/GlobalStateContext";
import { TextInputWithTitle } from "../components/TextInputWithTitle";
import { Pressable } from "react-native";
import { ViewBase } from "react-native";
import { useToast } from 'react-native-toast-notifications'
import { ProfilePageProps } from "../utils/types";



export default function ProfilePage({exitModal}: ProfilePageProps) {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [rfid, setRfid] = useState(null);
    const [isEditable, setIsEditable] = useState(false)

    const toast = useToast();

    useEffect(() => {
        setUsername('Term');
        setEmail('Jani.Bangiev@gmail.com')
    }, [])

    return (
        <SafeAreaView className="items-center justify-center p-5">
            <Ionicons name={'person-circle-outline'} size={120}/>

            <TextInputWithTitle
                title="Username"
                titleClassNames="text-gray-600 text-xl mb-1"
                innerViewClassNames="shadow-xl shadow-black border-transparent"
                mainViewClassNames="w-full"
                defaultValue={username}
                editable={isEditable}
                onChangeText={newUsername => setUsername(newUsername)}
                className="text-xl bg-white p-3 rounded-xl"
            />

            <TextInputWithTitle
                title="Email"
                titleClassNames="text-gray-600 text-xl mb-1"
                innerViewClassNames="shadow-xl shadow-black border-transparent"
                mainViewClassNames="w-full mt-5"
                defaultValue={email}
                editable={isEditable}
                onChangeText={newUsername => setUsername(newUsername)}
                className="text-xl bg-white p-3 rounded-xl"
            />

            <View className="flex-row justify-between self-stretch mt-5">
                <View className="flex-col">
                    <Text className="text-gray-600 text-xl">RFID: </Text>
                    <View className="flex-row items-center">
                        <Text className="text-black text-xl">{rfid === null ? 'Not Assigned' : 'Assigned'}</Text>
                        <Pressable className="mt-1 ml-2" 
                            onPress={() => toast.show('Contact your company administrator to get assigned an RFID.', 
                                {
                                    icon: <Ionicons name="information-circle-outline" size={40} color={'white'} />
                                })}>
                            <Ionicons name='information-circle-outline' size={30}/>
                        </Pressable>
                    </View>
                </View>

                <View className="flex-col">
                    <Text className="text-gray-600 text-xl">Company: </Text>
                    <View className="flex-row items-center">
                        <Text className="text-black text-xl">{rfid === null ? 'Not Assigned' : rfid}</Text>
                        <Pressable className="mt-1 ml-2"
                            onPress={() => toast.show('Contact your company administrator to get assigned as a company employee.', 
                            {
                                icon: <Ionicons name="information-circle-outline" size={40} color={'white'} />
                            })}>
                            <Ionicons name={'information-circle-outline'} size={30}/>
                        </Pressable>
                    </View>
                    
                </View>
            </View>
            
            { isEditable ? (
                <>
                <CustomButton
                    onPress={() => {
                        if (isEditable) {
                            //TODO: save new info
                        }
                        setIsEditable(!isEditable)
                    }}
                    textStyle="font-bold text-lg"
                    className="h-12 w-8/12 text-center flex-row items-center justify-center rounded-lg mt-8 border stroke-black"
                    android_ripple={{color: ''}}>
                    Upload new image
                </CustomButton></> ) : (<></>)}
            <CustomButton
                onPress={() => {
                    if (isEditable) {
                        //TODO: save new info
                    }
                    setIsEditable(!isEditable)
                }}
                textStyle="font-bold text-lg text-white"
                className="h-12 w-8/12 text-center items-center justify-center rounded-lg mt-8 bg-blue-500"
                android_ripple={{color: ''}}>
                {isEditable ? 'SAVE' : 'EDIT'}
            </CustomButton>

            {
                isEditable ? (<></>) :
                (<CustomButton
                    onPress={() => {exitModal()}}
                    textStyle="font-bold text-lg text-white"
                    className="h-12 w-8/12 text-center items-center justify-center rounded-lg mt-4 bg-red-500"
                    android_ripple={{color: ''}}>
                    CANCEL
                </CustomButton>)
            }
            
        </SafeAreaView>
    )
}