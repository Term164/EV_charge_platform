import { View, Text, ScrollView, Pressable, Modal, ActivityIndicator } from "react-native";
import CustomButton from "../components/CustomButton";
import { SafeAreaView } from "react-native-safe-area-context";
import { getConnectorIcon, getTimeFromDate } from "../utils/utils";
import { ChargingType, NoReservationsPageProps, ReservationStatus } from "../utils/types";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faPen } from "@fortawesome/free-solid-svg-icons";
import { Ionicons } from '@expo/vector-icons';
import { useToast } from "react-native-toast-notifications";
import { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { BlurView } from "expo-blur";
import EditReservationPage from "./EditReservation";
import { customStyle } from "../utils/styles";
import {
    BottomSheetModal,
    BottomSheetModalProvider,
  } from '@gorhom/bottom-sheet';
import CustomBackdrop from "../components/CustomBackdrop";
import NoReservationsPage from "./NoReservationsPage";
import { useTranslation } from "react-i18next";
import { useColorScheme } from "nativewind";
import { serverAddress } from "../utils/Constants";
import { UserDataContext } from "../utils/GlobalStateContext";
import { Reservation, UserReservationsResponse } from "../utils/databaseTypes";

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

function getReservationStatusEnum(reservation: Reservation): ReservationStatus{
    
    if (reservation.position_in_queue == null && reservation.allocated_from != null) {
        if(new Date().getTime() > new Date(reservation.allocated_from).getTime()) return ReservationStatus.CHARGING;
        return ReservationStatus.RESERVED;
    }
    else if (reservation.position_in_queue != null && reservation.allocated_from != null){
        return ReservationStatus.ALLOCATED;
    } else if (reservation.position_in_queue != null && reservation.allocated_from == null) {
        return ReservationStatus.INQUEUE;
    }
    throw new Error('Error while trying to get reservation status.');
}

export default function DashboardPage({ route, navigation }: NoReservationsPageProps) {

    const [cancelModalVisible, setCancelModalVisible] = useState(false);
    const [reservations, setReservations] = useState<Reservation[]>([]);
    const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedReservationIndex, setSelectedReservationIndex] = useState<number | null>(null);


    const { t } = useTranslation();

    const toast = useToast();

    const { colorScheme, toggleColorScheme } = useColorScheme();

    // ref
    const bottomSheetModalRef = useRef<BottomSheetModal>(null);

    // variables
    const snapPoints = useMemo(() => ['25%', '66%', '100%'], []);
    const userData = useContext(UserDataContext);

    // callbacks
    const handlePresentModalPress = useCallback(() => {
        bottomSheetModalRef.current?.present();
    }, []);

    const handleCloseModalPress = useCallback(() => {
        bottomSheetModalRef.current?.dismiss();
    }, [])

    // ============================= SERVER REQUESTS DEFINITIONS ============================
    
    const cancleReservation = async () => {
        setCancelModalVisible(false)
        setLoading(true);
        try {
            const response = await fetch(
                `${serverAddress}/api/v1/reservation/delete/cancel?${new URLSearchParams({reservationID: String(selectedReservation?.id)}).toString()}`,
                {
                  method: 'DELETE',
                  headers: userData?.header as HeadersInit
                }
            );
            if (response.status == 200) {
                if (selectedReservationIndex){
                    reservations.splice(selectedReservationIndex, 1);
                    setReservations(reservations);
                    toast.show(t('reservationCanceled'), {type: 'success', textStyle: {textAlign: 'center'}});
                }
            }
        } catch (error) {
            console.log(error);
            toast.show(t('somethingWrong'), {type: 'danger', textStyle: {textAlign: 'center'}});
        }
        setLoading(false);
    }

    const getUserReservations = async () => {
        try {
            const response = await fetch(
                `${serverAddress}/api/v1/reservation/get/allReservationsForPerson?${new URLSearchParams({userID: String(userData?.userData.id)}).toString()}`,
                {
                  method: 'GET',
                  headers: userData?.header as HeadersInit
                }
            );
            const reservationResponse = await response.json() as UserReservationsResponse;
            setReservations(reservationResponse.data.Result);
        } catch (error) {
            console.log(error);
        }
        setLoading(false);
    }

    const updateReservations = () => {
        setLoading(true);
        getUserReservations();
    }

    useEffect(() => {
        if(userData?.userData != null) getUserReservations().catch(console.error); 
    }, [userData])

    const getReservationStatus = (reservation: Reservation) => {
        switch (getReservationStatusEnum(reservation)) {
            case ReservationStatus.CHARGING: 
            return (
                <Text className="bg-sky-400 dark:bg-sky-600 rounded-xl font-semibold text-base w-32 text-center text-gray-800 dark:text-slate-200 p-2 mr-2">{t('charging')}</Text>
        );
            case ReservationStatus.RESERVED:
                return (
                        <Text className="bg-green-400 dark:bg-green-600 rounded-xl font-semibold text-base w-32 text-center text-gray-800 dark:text-slate-200 p-2 mr-2">{t('reserved')}</Text>
                );
            case ReservationStatus.ALLOCATED:
                return (
                    <View className="flex-row items-center">
                        <Text className="bg-yellow-300 dark:bg-yellow-600 rounded-xl font-semibold text-base w-32 text-center text-gray-800 dark:text-slate-200 p-2 mr-2">{t('allocated')}</Text>
                    </View>
                );
            case ReservationStatus.INQUEUE:
                if (reservation.position_in_queue)
                    return (
                    <View>
                        <Text className="bg-red-400 dark:bg-red-600 rounded-xl font-semibold text-base w-32 text-center text-gray-800 dark:text-slate-200 p-2 mr-2"> {ordinal_suffix_of(reservation.position_in_queue)} {t('queue')}</Text>
                    </View>);
        }
    }

    const getConnectorInfo = (connectorType: ChargingType | null, connectorPower: number | null) => {
        if (connectorType != null) {
            return (
                <View className="flex-row items-center pt-1">
                    {getConnectorIcon(connectorType, colorScheme)}
                    <Text className="ml-1 font-semibold text-lg text-gray-800 dark:text-slate-300">{connectorPower} kW</Text>
                </View>
            );
        } else {
            return <></>
        }
    }

    if (reservations.length == 0 && !loading) {
        return(
            <NoReservationsPage route={route} navigation={navigation}/>
        );
    } else if (loading || userData == null) {
        return (<View className="flex-1 items-center justify-center"><ActivityIndicator size='large'/></View>);
    }

    return (
        <SafeAreaView className="flex-1 items-center justify-center">
            <BottomSheetModalProvider>
                <BottomSheetModal
                        ref={bottomSheetModalRef}
                        index={1}
                        snapPoints={snapPoints}
                        backgroundStyle={colorScheme === 'light' ? customStyle.reservationModalHandle : customStyle.reservationModalHandleDark}
                        handleStyle={colorScheme === 'light' ? customStyle.reservationModalHandle : customStyle.reservationModalHandleDark}
                        backdropComponent={CustomBackdrop}
                        handleIndicatorStyle={{backgroundColor: 'white'}}
                    >
                        <EditReservationPage exitModal={handleCloseModalPress} updateReservation={updateReservations} reservation={selectedReservation as Reservation} />
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
                        <View className="bg-slate-200 dark:bg-slate-600 rounded-lg shadow-lg shadow-black dark:shadow-slate-200 w-72 p-3 justify-center">
                            <Text className="text-2xl font-bold self-center text-gray-800 dark:text-slate-100">{t('Cancel reservation ?')}</Text>
                            <Text className="py-4 text-center text-base font-medium self-center leading-4 text-gray-600 dark:text-slate-300">{t('cancelReservationSupportText')}</Text>
                            <View className="flex-row justify-between items-center px-2">
                                <CustomButton
                                    onPress={() => cancleReservation()}
                                    textStyle="font-bold text-lg text-white tracking-widest"
                                    className="w-24 h-10 bg-red-500 dark:bg-red-700 text-center rounded-lg justify-center items-center border border-red-800 shadow-lg"
                                    android_ripple={{color: ''}}
                                >
                                    {t('cancelReservationCofirm')}
                                </CustomButton>

                                <CustomButton
                                    onPress={() => setCancelModalVisible(false)}
                                    textStyle="font-bold text-lg text-gray-800 dark:text-slate-200 tracking-widest"
                                    className="w-24 h-10 text-center rounded-lg justify-center items-center border border-gray-800 dark:border-slate-200 shadow-lg"
                                    android_ripple={{color: ''}}
                                >
                                    {t('cancelReservationExit')}
                                </CustomButton>
                            </View>
                        </View>
                    </BlurView>
                </Modal>
                <ScrollView className="w-full h-full dark:bg-slate-950">
                    {
                        reservations.map((reservation, index) => {
                            let toastInfo: string;
                            switch (getReservationStatusEnum(reservation)) {
                                case ReservationStatus.ALLOCATED:
                                    toastInfo = t('toastAllocatedInfo')
                                    break;
                                case ReservationStatus.INQUEUE:
                                    if (reservation.position_in_queue)
                                        toastInfo = `${t('toastInQueueInfo')} ${ordinal_suffix_of(reservation.position_in_queue)} ${t('toastInQueueInfo2')}`
                                    break;
                                case ReservationStatus.RESERVED:
                                    toastInfo = t('toastReservedInfo')
                                    break;
                            }

                            return(
                                <View key={index} className="bg-slate-50 dark:bg-slate-800 my-2 mx-1 p-3 rounded-xl shadow-xl shadow-black">
                                    <View className="flex-row justify-between mb-6">
                                        <View>
                                            <Text className="font-bold text-base text-gray-700 dark:text-slate-200 uppercase">{reservation.building_name}</Text>
                                            <Text className="font-bold text-base text-gray-500 dark:text-slate-300">{reservation.building_location}</Text>
                                        </View>
                                        {
                                            getReservationStatusEnum(reservation) != ReservationStatus.CHARGING ? 
                                            <Pressable
                                                onPress={() => toast.show(toastInfo)}>
                                                        <Ionicons name={'information-circle-outline'} size={40} color={colorScheme === 'light' ? '#64748b' : '#cbd5e1'} />
                                            </Pressable>
                                            : <></>
                                        }
                                    </View>
                                    <View className="flex-row items-center mb-2">
                                        {getReservationStatus(reservation)}
                                        {getConnectorInfo(reservation.charging_type, reservation.power_output)}
                                    </View>
                                    <Text className="text-lg font-semibold text-gray-800 dark:text-slate-200">{new Date(reservation.desired_from).toLocaleDateString()}</Text>

                                    {
                                        reservation.allocated_from && reservation.allocated_to ?
                                            <Text className="text-lg font-semibold text-gray-500 dark:text-slate-400">{t('reservationTime')} <Text className="text-lg font-semibold text-gray-800 dark:text-slate-200">{getTimeFromDate(reservation.allocated_from)}- {getTimeFromDate(reservation.allocated_to)}</Text></Text>
                                        : <></>
                                    }
                                    {
                                        getReservationStatusEnum(reservation) != ReservationStatus.CHARGING ? 
                                        <View>
                                            <Text className="text-lg font-semibold text-gray-500 dark:text-slate-400">{t('desiredTimedRange')} <Text className="text-lg font-semibold text-gray-800 dark:text-slate-200">{getTimeFromDate(reservation.desired_from)}- {getTimeFromDate(reservation.desired_to)}</Text></Text>
                                            <Text className="pb-2 text-lg font-semibold text-gray-700 dark:text-slate-200">{t('maxReservationTime')} {reservation.charging_time} {reservation.charging_time == 1 ? t('hour') : t('hours')}</Text>
                                            <View className="flex-row justify-end items-center px-2">
                                                <CustomButton
                                                    onPress={() => {setSelectedReservation(reservation); handlePresentModalPress()}}
                                                    textStyle="font-bold text-lg text-white dark:text-slate-200 tracking-widest"
                                                    className="w-24 h-10 bg-blue-500 dark:bg-blue-700 text-center rounded-lg justify-center items-center border border-blue-800 shadow-lg mr-4"
                                                    android_ripple={{color: ''}}
                                                >
                                                    <FontAwesomeIcon icon={faPen} color={colorScheme === 'light' ? 'white' : '#cbd5e1'} /> {t('editButtonText')}
                                                </CustomButton>

                                                <CustomButton
                                                    onPress={() => {setSelectedReservation(reservation); setSelectedReservationIndex(index); setCancelModalVisible(true)}}
                                                    textStyle="font-bold text-lg text-gray-800 dark:text-slate-200 tracking-widest"
                                                    className="w-24 h-10 text-center rounded-lg justify-center items-center border border-gray-800 dark:border-slate-200 shadow-lg"
                                                    android_ripple={{color: ''}}
                                                >
                                                    {t('cancelButtonText')}
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