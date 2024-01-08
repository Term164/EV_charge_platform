import { Text, View } from "react-native";
import CustomButton from "../components/CustomButton";
import ChargingStationSVG from "../assets/icons/chargingStation.svg";
import { useTranslation } from "react-i18next";
import { NoReservationsPageProps } from "../utils/types";

export default function NoReservationsPage({ route, navigation }: NoReservationsPageProps) {
    const { t } = useTranslation();
    return (
        <View className="flex-1 p-3 items-center justify-center dark:bg-slate-800">
            <ChargingStationSVG width={150} height={150} fill={'#94a3b8'} style={{marginLeft: 50}} />
            <Text className="mt-12 text-xl font-semibold text-gray-800 dark:text-slate-300">{t('noReservations')}</Text>
            <Text className="mt-2 px-3 text-base font-semibold text-gray-500 dark:text-slate-400 text-center">{t('Plan ahead and reserve your charging spot for a stress-free charging experience.')}</Text>
            <CustomButton
                    onPress={() => {navigation.navigate('Stations')}}
                    textStyle="font-bold text-lg text-white dark:text-slate-200 tracking-widest"
                    className="h-12 w-8/12 m-4 text-center flex-row items-center justify-center rounded-3xl mt-16 bg-blue-500 dark:bg-blue-800 shadow-2xl shadow-blue-400 dark:shadow-black" 
                    android_ripple={{color: ''}}>{t('makeReservationButtonText')}</CustomButton>
        </View>
    );
}