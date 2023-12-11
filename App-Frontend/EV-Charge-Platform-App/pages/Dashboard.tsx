import { View, Text, ScrollView, Pressable, Modal } from "react-native";
import { reservations } from "../utils/markers";
import CustomButton from "../components/CustomButton";
import { SafeAreaView } from "react-native-safe-area-context";
import { getConnectorIcon, getTimeFromDate } from "../utils/utils";
import { Connector, Reservation, ReservationStatus } from "../utils/types";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faPen } from "@fortawesome/free-solid-svg-icons";
import { Ionicons } from '@expo/vector-icons';
import { useToast } from "react-native-toast-notifications";
import { useCallback, useMemo, useRef, useState } from 'react';
import { BlurView } from "expo-blur";
import EditReservationPage from "./EditReservation";
import { customStyle } from "../utils/styles";
import {
    BottomSheetModal,
    BottomSheetModalProvider,
  } from '@gorhom/bottom-sheet';
import CustomBackdrop from "../components/CustomBackdrop";

function ordinal_suffix_of(i: number) {
    var j = i % 10,
        k = i % 100;
    if (j == 1 && k != 11) {
        return i + "st";
    }
    if (j == 2 && k != 12) {
        return i + "nd";
    }
    if (j == 3 && k != 13) {
        return i + "rd";
    }
    return i + "th";
}

export default function DashboardPage() {

    const [cancelModalVisible, setCancelModalVisible] = useState(false);
    const [selectedReservation, setSelectedReservation] = useState(reservations[0]);

    const toast = useToast();

    // ref
    const bottomSheetModalRef = useRef<BottomSheetModal>(null);

    // variables
    const snapPoints = useMemo(() => ['25%', '66%', '100%'], []);

    // callbacks
    const handlePresentModalPress = useCallback(() => {
        bottomSheetModalRef.current?.present();
    }, []);

    const handleCloseModalPress = useCallback(() => {
        bottomSheetModalRef.current?.dismiss();
    }, [])


    const getReservationStatus = (reservation: Reservation) => {
        switch (reservation.reservation_status) {
            case ReservationStatus.CHARGING: 
            return (
                <Text className="bg-sky-400 rounded-xl font-semibold text-base w-28 text-center text-gray-800 p-2">Charging</Text>
        );
            case ReservationStatus.RESERVED:
                return (
                        <Text className="bg-green-400 rounded-xl font-semibold text-base w-28 text-center text-gray-800 p-2">Reserved</Text>
                );
            case ReservationStatus.ALLOCATED:
                return (
                    <View className="flex-row items-center">
                        <Text className="bg-yellow-300 rounded-xl font-semibold text-base w-28 text-center text-gray-800 p-2 mr-2">Allocated</Text>
                    </View>
                );
            case ReservationStatus.INQUEUE:
                return (
                <View>
                    <Text className="bg-red-400 rounded-xl font-semibold text-base w-28 text-center text-gray-800 p-2"> {ordinal_suffix_of(reservation.queueNumber)} In Queue</Text>
                </View>);
        }
    }

    const getConnectorInfo = (connector: Connector | null) => {
        if (connector) {
            return (
                <View className="flex-row items-center pt-1">
                    {getConnectorIcon(connector.chargingType)}
                    <Text className="ml-1 font-semibold text-lg text-gray-800">{connector.watts} kW</Text>
                </View>
            );
        } else {
            return <></>
        }
    }

    return (
        <SafeAreaView className="flex-1 items-center justify-center">
            <BottomSheetModalProvider>
                <BottomSheetModal
                        ref={bottomSheetModalRef}
                        index={1}
                        snapPoints={snapPoints}
                        backgroundStyle={customStyle.reservationModalHandle}
                        handleStyle={customStyle.reservationModalHandle}
                        backdropComponent={CustomBackdrop}
                        handleIndicatorStyle={{backgroundColor: 'white'}}
                    >
                        <EditReservationPage exitModal={handleCloseModalPress} reservation={selectedReservation} />
                </BottomSheetModal>
            
                <Modal
                    transparent={true}
                    animationType="none"
                    visible={cancelModalVisible}
                    onRequestClose={() => {
                        setCancelModalVisible(!cancelModalVisible);
                    }}
                >
                    <BlurView intensity={20} className="flex-1 justify-center items-center">
                        <View className="bg-slate-200 rounded-lg shadow-lg shadow-black w-72 p-3 justify-center">
                            <Text className="text-2xl font-bold self-center text-gray-800">Cancel reservation ?</Text>
                            <Text className="py-4 text-center text-base font-medium self-center leading-4 text-gray-600">You are about to cancel your reservation. This action is not reversable and you will lose your spot at the specific building.</Text>
                            <View className="flex-row justify-between items-center px-2">
                                <CustomButton
                                    textStyle="font-bold text-lg text-white"
                                    className="w-24 h-10 bg-red-500 text-center rounded-lg justify-center items-center border border-red-800 shadow-lg"
                                    android_ripple={{color: ''}}
                                >
                                    CANCEL
                                </CustomButton>

                                <CustomButton
                                    onPress={() => setCancelModalVisible(false)}
                                    textStyle="font-bold text-lg text-gray-800"
                                    className="w-24 h-10 text-center rounded-lg justify-center items-center border border-gray-800 shadow-lg"
                                    android_ripple={{color: ''}}
                                >
                                    GO BACK
                                </CustomButton>
                            </View>
                        </View>
                    </BlurView>
                </Modal>
                <ScrollView className="w-full h-full">
                    {
                        reservations.map((reservation, index) => {
                            let toastInfo: string;
                            switch (reservation.reservation_status) {
                                case ReservationStatus.ALLOCATED:
                                    toastInfo = 'You have been allocated a certain time but this might still change.'
                                    break;
                                case ReservationStatus.INQUEUE:
                                    toastInfo = `We could not find a spot for you yet. You are ${ordinal_suffix_of(reservation.queueNumber)} in queue.`
                                    break;
                                case ReservationStatus.RESERVED:
                                    toastInfo = 'Your reservation has been set and it will not change unless edited.'
                                    break;
                            }

                            return(
                                <View key={index} className="bg-slate-50 my-2 mx-1 p-3 rounded-xl shadow-xl shadow-black">
                                    <View className="flex-row justify-between ">
                                        <Text className="font-bold text-base text-gray-700 uppercase">{reservation.building.name}</Text>
                                        {
                                            reservation.reservation_status != ReservationStatus.CHARGING ? 
                                            <Pressable
                                                onPress={() => toast.show(toastInfo)}>
                                                        <Ionicons name={'information-circle-outline'} size={30} color={'#64748b'} />
                                            </Pressable>
                                            : <></>
                                        }
                                    </View>
                                    <Text className="font-bold text-base text-gray-500 mb-2">{reservation.building.address}</Text>
                                    <View className="flex-row items-center mb-2">
                                        {getReservationStatus(reservation)}
                                        {getConnectorInfo(reservation.allocated_connector)}
                                    </View>

                                    {
                                        reservation.allocated_from && reservation.allocated_to ?
                                            <Text className="text-lg font-semibold text-gray-500">Reservation time: <Text className="text-lg font-semibold text-gray-800">{getTimeFromDate(reservation.allocated_from)}:{getTimeFromDate(reservation.allocated_to)}</Text></Text>
                                        : <></>
                                    }
                                    {
                                        reservation.reservation_status != ReservationStatus.CHARGING ? 
                                        <View>
                                            <Text className="text-lg font-semibold text-gray-500">Desired time range: <Text className="text-lg font-semibold text-gray-800">{getTimeFromDate(reservation.desired_from)}-{getTimeFromDate(reservation.desired_to)}</Text></Text>
                                            <Text className="pb-2 text-lg font-semibold text-gray-700">Reservation for maxium of {reservation.charging_time} {reservation.charging_time == 1 ? 'hour' : 'hours'}</Text>
                                            <View className="flex-row justify-end items-center px-2">
                                                <CustomButton
                                                    onPress={() => {setSelectedReservation(reservation); handlePresentModalPress()}}
                                                    textStyle="font-bold text-lg text-white tracking-widest"
                                                    className="w-24 h-10 bg-blue-500 text-center rounded-lg justify-center items-center border border-blue-800 shadow-lg mr-4"
                                                    android_ripple={{color: ''}}
                                                >
                                                    <FontAwesomeIcon icon={faPen} color="white" /> EDIT
                                                </CustomButton>

                                                <CustomButton
                                                    onPress={() => setCancelModalVisible(true)}
                                                    textStyle="font-bold text-lg text-gray-800 tracking-widest"
                                                    className="w-24 h-10 text-center rounded-lg justify-center items-center border border-gray-800 shadow-lg"
                                                    android_ripple={{color: ''}}
                                                >
                                                    CANCEL
                                                </CustomButton>
                                            </View>
                                        </View>
                                        : <></>
                                    }

                                </View>
                            )
                        })
                    }
                </ScrollView>
            </BottomSheetModalProvider>
        </SafeAreaView>
            
    )
}