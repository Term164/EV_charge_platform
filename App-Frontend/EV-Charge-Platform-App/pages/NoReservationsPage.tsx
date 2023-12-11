import { Text, View } from "react-native";
import CustomButton from "../components/CustomButton";
import ChargingStationSVG from "../assets/icons/chargingStation.svg";

export default function NoReservationsPage() {

    return (
        <View className="flex-1 p-3 items-center justify-center">
            <ChargingStationSVG width={150} height={150} fill={'#94a3b8'} style={{marginLeft: 50}} />
            <Text className="mt-12 text-xl font-semibold text-gray-800">No Reservations</Text>
            <Text className="mt-2 px-3 text-base font-semibold text-gray-500 text-center">Plan ahead and reserve your charging spot for a stress-free charging experience.</Text>
            <CustomButton
                    onPress={() => {}}
                    textStyle="font-bold text-lg text-white tracking-widest"
                    className="h-12 w-8/12 m-4 text-center flex-row items-center justify-center rounded-3xl mt-20 bg-blue-500 shadow-2xl shadow-blue-400" 
                    android_ripple={{color: ''}}>MAKE RESERVATION</CustomButton>
        </View>
    );
}