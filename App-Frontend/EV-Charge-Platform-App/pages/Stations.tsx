import { View, Text, ScrollView, Modal } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { markers } from "../utils/markers";
import CustomButton from "../components/CustomButton";
import SearchBar from "react-native-dynamic-search-bar";
import { useCallback, useMemo, useRef, useState } from "react";
import { searchBuildingsByName } from "../utils/search";
import { getConnectorIcon } from "../utils/utils";
import MakeReservationPage from "./MakeReservation";
import { BlurView } from "expo-blur";
import { BottomSheetModal, BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { customStyle } from "../utils/styles";
import CustomBackdrop from "../components/CustomBackdrop";


function getTextColorBasedOnAvailability(availability: number) {
    let colorStyle;
    if (availability < 10) colorStyle = 'text-gray-600';
    else if (availability >= 10 && availability < 33.3) colorStyle = 'text-red-600';
    else if (availability >= 33.3 && availability < 66.6) colorStyle = 'text-yellow-600';
    else colorStyle = 'text-green-600';
    return colorStyle;
}

export default function StationsPage() {
    const [buildings, setBuildings] = useState(markers);
    const [selectedBuilding, setSelectedBuilding] = useState(markers[0]);

    const filterBuildings = (searchWord: string) => {
        setBuildings(searchBuildingsByName(searchWord, markers));
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
    

    return (
        <SafeAreaView className="flex-1 items-center justify-center">
            <BottomSheetModalProvider>
                <SearchBar onChangeText={(text) => filterBuildings(text)} className="m-3 w-11/12 h-12" textInputStyle={{fontSize: 20}} placeholderTextColor="#9ca3af" placeholder="Search here"/>
                <ScrollView 
                    className="w-full h-full"
                >
                    {
                        buildings.map((marker, index) => {

                            return(
                                <View key={index} className="bg-slate-50 my-2 mx-1 p-2 rounded-xl overflow-hidden shadow-xl shadow-black">
                                    <Text className="font-bold text-base text-gray-700 uppercase">{marker.name}</Text>
                                    <Text className="font-bold text-sm text-gray-500">{marker.address}</Text>
                                    <ScrollView
                                        horizontal
                                        showsHorizontalScrollIndicator={false}
                                        contentContainerStyle={{paddingVertical: 8}}
                                    >
                                        {
                                            marker.Connectors.map((Connector, index) => {
                                                return(
                                                    <View key={index} className="bg-gray-200 mr-3 rounded-2xl flex-col shadow-md shadow-black px-3 py-2 ml-1 justify-center items-center">
                                                        <View className="flex-row">
                                                            {getConnectorIcon(Connector.chargingType)}
                                                            <Text className="ml-1 font-semibold text-lg text-gray-800">{Connector.watts} kW</Text>
                                                        </View>
                                                        <Text className="font-semibold text-gray-500 ml-1">{Connector.numberOfConnectors} {Connector.numberOfConnectors > 1 ? 'Connectors' : 'Connector'}</Text>
                                                    </View>
                                                )
                                            })
                                        }
                                    </ScrollView>
                                    <View className="flex-row justify-between items-center px-2 mt-2">
                                        <Text className="font-semibold text-lg text-gray-800">Availability at <Text className={getTextColorBasedOnAvailability(marker.availability)}>{marker.availability}</Text>%</Text>
                                        <CustomButton
                                            onPress={() => {
                                                setSelectedBuilding(marker);
                                                handlePresentModalPress();
                                            }}
                                            textStyle="font-bold text-lg text-white tracking-widest"
                                            className="w-36 h-12 bg-blue-500 text-center rounded-lg justify-center items-center border border-blue-800 shadow-lg"
                                            android_ripple={{color: ''}}
                                        >
                                            RESERVE NOW
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
                        backgroundStyle={customStyle.reservationModalHandle}
                        handleStyle={customStyle.reservationModalHandle}
                        backdropComponent={CustomBackdrop}
                        handleIndicatorStyle={{backgroundColor: 'white'}}
                    >
                        <MakeReservationPage exitModal={handleCloseModalPress} building={selectedBuilding} />
                </BottomSheetModal>
            
            </BottomSheetModalProvider>
        </SafeAreaView>
    )
}