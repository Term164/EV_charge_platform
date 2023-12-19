import { View, Text, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { markers } from "../utils/markers";
import CustomButton from "../components/CustomButton";
import SearchBar from "react-native-dynamic-search-bar";
import { useCallback, useContext, useMemo, useRef, useState } from "react";
import { searchBuildingsByName } from "../utils/search";
import { getConnectorIcon } from "../utils/utils";
import MakeReservationPage from "./MakeReservation";
import { BottomSheetModal, BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { customStyle } from "../utils/styles";
import CustomBackdrop from "../components/CustomBackdrop";
import NoStationsPage from "./NoStationsPage";
import { useTranslation } from "react-i18next";
import { useUserData } from "../utils/GlobalStateContext";
import { Station } from "../utils/databaseTypes";
import { useColorScheme } from "nativewind";


function getTextColorBasedOnAvailability(availability: number) {
    let colorStyle;
    if (availability < 10) colorStyle = 'text-gray-600';
    else if (availability >= 10 && availability < 33.3) colorStyle = 'text-red-600';
    else if (availability >= 33.3 && availability < 66.6) colorStyle = 'text-yellow-600';
    else colorStyle = 'text-green-600';
    return colorStyle;
}

export default function StationsPage() {
    const userData = useUserData();
    console.log(userData.stations);
    const [stations, setStations] = useState<Array<Station>>(userData.stations);
    const [selectedStation, setSelectedStation] = useState(stations[0]);
    console.log(stations);

    const { t } = useTranslation();

    const { colorScheme, toggleColorScheme } = useColorScheme();

    const filterBuildings = (searchWord: string) => {
        setStations(searchBuildingsByName(searchWord, stations));
    }

    // ref
    const bottomSheetModalRef = useRef<BottomSheetModal>(null);

    // variables
    const snapPoints = useMemo(() => ['25%', '80%', '100%'], []);

    // callbacks
    const handlePresentModalPress = useCallback(() => {
        bottomSheetModalRef.current?.present();
    }, []);

    const handleCloseModalPress = useCallback(() => {
        bottomSheetModalRef.current?.dismiss();
    }, [])

    if (markers.length == 0) {
        return (
            <NoStationsPage/>
        );
    }

    return (
        <SafeAreaView className="flex-1 items-center justify-center dark:bg-slate-950">
            <BottomSheetModalProvider>
                <SearchBar onChangeText={(text) => filterBuildings(text)} className="m-3 w-11/12 h-12 dark:bg-slate-700" textInputStyle={{fontSize: 20}} darkMode={colorScheme === 'dark'} placeholderTextColor={colorScheme === 'light' ? "#9ca3af" : '#cbd5e1'} placeholder={t('searchHere')}/>
                <ScrollView 
                    className="w-full h-full"
                >
                    {
                        stations.map((station, index) => {

                            return(
                                <View key={index} className="bg-slate-50 dark:bg-slate-800 my-2 mx-1 p-2 rounded-xl overflow-hidden shadow-xl shadow-black">
                                    <Text className="font-bold text-base text-gray-700 dark:text-slate-200 uppercase">{station.building.buildingName}</Text>
                                    <Text className="font-bold text-sm text-gray-500 dark:text-slate-300">{station.building.buildingLocation}</Text>
                                    <ScrollView
                                        horizontal
                                        showsHorizontalScrollIndicator={false}
                                        contentContainerStyle={{paddingVertical: 8}}
                                    >
                                        {
                                            station.chargingConnectors.map((Connector, index) => {
                                                return(
                                                    <View key={index} className="bg-gray-200 dark:bg-slate-700 mr-3 rounded-2xl flex-col shadow-md shadow-black px-3 py-2 ml-1 justify-center items-center">
                                                        <View className="flex-row">
                                                            {getConnectorIcon(Connector.chargingType.chargingType)}
                                                            <Text className="ml-1 font-semibold text-lg text-gray-800 dark:text-slate-300">{Connector.chargingConnectorPowerOutput} kW</Text>
                                                        </View>
                                                        <Text className="font-semibold text-gray-500 dark:text-slate-400 ml-1">{station.chargingConnectors.length} {station.chargingConnectors.length > 1 ? t('connectors') : t('connector')}</Text>
                                                    </View>
                                                )
                                            })
                                        }
                                    </ScrollView>
                                    <View className="flex-row justify-between items-center px-2 mt-2">
                                        <Text className="font-semibold text-lg text-gray-800 dark:text-slate-300">{t('availabilityStatusShort')} <Text className={getTextColorBasedOnAvailability(station.building.availability)}>{station.building.availability}</Text>%</Text>
                                        <CustomButton
                                            onPress={() => {
                                                setSelectedStation(station);
                                                handlePresentModalPress();
                                            }}
                                            textStyle="font-bold text-lg text-white dark:text-slate-200 tracking-widest"
                                            className="w-36 h-12 bg-blue-500 dark:bg-blue-700 text-center rounded-lg justify-center items-center border border-blue-800 shadow-lg"
                                            android_ripple={{color: ''}}
                                        >
                                            {t('reserveNowCTA')}
                                        </CustomButton>
                                    </View>
                                </View>
                            );
                        })
                    }
                    
                </ScrollView>

                <BottomSheetModal
                        ref={bottomSheetModalRef}
                        index={1}
                        snapPoints={snapPoints}
                        backgroundStyle={colorScheme === 'light' ? customStyle.reservationModalHandle : customStyle.reservationModalHandleDark}
                        handleStyle={colorScheme === 'light' ? customStyle.reservationModalHandle : customStyle.reservationModalHandleDark}
                        backdropComponent={CustomBackdrop}
                        handleIndicatorStyle={{backgroundColor: 'white'}}
                    >
                        <MakeReservationPage exitModal={handleCloseModalPress} station={selectedStation} />
                </BottomSheetModal>
            
            </BottomSheetModalProvider>
        </SafeAreaView>
    )
}