import { View, Text, Dimensions, Animated, ScrollView, Pressable, Alert, Modal } from "react-native";
import MapView, {Callout, MapMarker} from "react-native-maps";
import React from 'react';
import { markers } from "../utils/markers";
import { Building, mapStyle, mapStyleDark } from "../utils/types";
import SearchBar from "react-native-dynamic-search-bar";
import { searchBuildingsByName } from "../utils/search";
import { BackHandler } from "react-native";
import MakeReservationPage from "./MakeReservation";
import { BottomSheetModal, BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { customStyle } from "../utils/styles";
import CustomBackdrop from "../components/CustomBackdrop";
import * as Animatable from 'react-native-animatable';
import CustomButton from "../components/CustomButton";
import { withTranslation } from "react-i18next";

const {width, height} = Dimensions.get('window');

const ASPECT_RATION = width / height;
const LATITUDE = 46.056946;
const LONGITUDE = 14.505751;
const LATITUDE_DELTA = 0.0922;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATION;

const region = {
    latitude: markers[0] ? markers[0].coordinate.latitude : LATITUDE,
    longitude: markers[0] ? markers[0].coordinate.longitude : LONGITUDE,
    latitudeDelta: LATITUDE_DELTA,
    longitudeDelta: LONGITUDE_DELTA
}

class MapScreen extends React.Component<any, any> {

    animation: Animated.Value;
    regionTimeout: NodeJS.Timeout;
    map: MapView | null;
    firstMarker: MapMarker | null;

    constructor(props: any) {
        super(props);
        this.animation = new Animated.Value(0);
        this.regionTimeout = setTimeout(()=>{},0);
        this.map = null;
        this.firstMarker = null;
        this.state = {
            index: 0,
            searchBarSelected: false,
            filteredBuildings: markers,
            searching: false,
            selectedBuilding: markers[0],
            bottomSheetModalRef: React.createRef(),
            isItemSelected: markers.length == 0 ? false : true,
            ModalShowing: false,
        };
        this.handleBackButtonClick = this.handleBackButtonClick.bind(this);
        BackHandler.addEventListener('hardwareBackPress', this.handleBackButtonClick);
    }
    
    componentWillUnmount(): void {
        BackHandler.removeEventListener('hardwareBackPress', this.handleBackButtonClick);
    }

    handleBackButtonClick() {
        if (this.state.searchBarSelected) {
            this.setState({searchBarSelected: false})
            return true;
        } else {
            return false;
        }
    }

    getColorBasedOnAvailability(availability: number) {
        let colorStyle;
        if (availability < 10) colorStyle = 'bg-gray-300/60 border-gray-600 bg-gray-300/80';
        else if (availability >= 10 && availability < 33.3) colorStyle = 'bg-red-300/60 border-red-600 bg-red-300/80';
        else if (availability >= 33.3 && availability < 66.6) colorStyle = 'bg-yellow-300/60 border-yellow-600 dark:bg-yellow-300/80';
        else colorStyle = 'bg-green-300/60 border-green-600 dark:bg-green-300/80';
        return colorStyle;
    }

    getDeepColorBasedOnAvailability(availability: number) {
        let colorStyle;
        if (availability < 10) colorStyle = 'bg-gray-600';
        else if (availability >= 10 && availability < 33.3) colorStyle = 'bg-red-600';
        else if (availability >= 33.3 && availability < 66.6) colorStyle = 'bg-yellow-600';
        else colorStyle = 'bg-green-600';
        return colorStyle;
    }

    render(): React.ReactNode {
        const { t } = this.props;
        const filterBuildings = async (searchWord: string) => {
            if (!this.state.searchBarSelected)
                this.setState({searchBarSelected: true})
            this.setState({searching: true});
            this.setState({filteredBuildings: searchBuildingsByName(searchWord, markers)});
            this.setState({searching: false});
        }

        let searchWindow;

        if (this.state.filteredBuildings) {
            searchWindow = <ScrollView className="mt-24 w-full h-full">
                {
                    this.state.filteredBuildings.map((building: Building, index: number) => {
                        return(
                            <Pressable key={index} android_ripple={{color: '#9ca3af'}}>
                                <View className="px-3 pt-3">
                                    <Text className="font-semibold text-base text-gray-800 dark:text-slate-300" >{building.name}</Text>
                                    <Text className="text-gray-500 dark:text-slate-400 text-base">{building.address}</Text>
                                </View>
                                <View style={{borderBottomWidth: 1}} className="border-gray-600/50 mt-2 pt-3"></View>
                            </Pressable>
                        );
                    })
                }
            </ScrollView>;
        } else {
            searchWindow = <></>;
        }

        const mapReadyCallout = () => {
            if(this.firstMarker) {
                setTimeout(() => this.firstMarker?.showCallout(), 0)
            }
                
        }

        // variables
        const snapPoints = ['25%', '80%', '100%'];

        // callbacks

        const handleCloseModalPress = () => {
            this.state.bottomSheetModalRef.current?.dismiss();
        }
    
        const handlePresentModalPress = () => {
            this.setState({isItemSelected: false, ModalShowing: true});
            this.state.bottomSheetModalRef.current?.present();
        }


        // Animated Button

        let makeReservationButton;

        if (this.state.isItemSelected && !this.state.searchBarSelected) {
            makeReservationButton = <Animatable.View className="absolute bottom-11" useNativeDriver={true} duration={500} easing={"ease-out-cubic"} animation="slideInUp"><CustomButton onPress={handlePresentModalPress} textStyle="font-bold text-lg text-white dark:text-slate-200 tracking-widest" className="w-60 h-14 bg-sky-500 dark:bg-sky-800 text-center rounded-lg justify-center items-center border border-black shadow-lg mr-4" android_ripple={{color: '#0369a1'}} >{t('makeReservationButtonText')}</CustomButton></Animatable.View>
        } else {
            makeReservationButton = <Animatable.View className="absolute bottom-11" useNativeDriver={true} duration={500} easing={"ease-out-cubic"} animation="slideOutDown"><CustomButton textStyle="font-bold text-lg text-white dark:text-slate-200 tracking-widest" className="w-60 h-14 bg-sky-500 dark:bg-sky-800 text-center rounded-lg justify-center items-center border border-black shadow-lg mr-4" android_ripple={{color: '#0369a1'}} >{t('makeReservationButtonText')}</CustomButton></Animatable.View>
        }
        return (
            <View className="justify-center items-center flex-1">
                <BottomSheetModalProvider>
                    <MapView
                        ref={map => this.map = map}
                        onMapReady={mapReadyCallout}
                        className="w-full h-full"
                        initialRegion={region}
                        showsCompass={false}
                        showsBuildings={false}
                        showsIndoors={false}
                        customMapStyle={this.props.route.params.theme === 'light' ? mapStyle : mapStyleDark}
                        onPanDrag={() => {if(this.state.isItemSelected)this.setState({isItemSelected: false});}}
                    >
        
                        {
                            markers.map((marker, index) => {
                                const scaleStyle = {
                                    transform: [
                                        {
                                            scale: index === this.state.index ? 1.5 : 1
                                        }
                                    ]
                                }

                                const opacityStlye = {
                                    opacity: this.state.index === index ? 1 : this.props.route.params.theme === 'light' ? 0.35 : 0.5
                                }

                                const ringStyle = "w-6 h-6 border rounded-full items-center justify-center " + this.getColorBasedOnAvailability(marker.availability);
                                const markerStyle = "w-2 h-2 rounded-full absolute " + this.getDeepColorBasedOnAvailability(marker.availability);

                                return (
                                    <MapMarker
                                        ref={marker => {
                                            if (this.state.index === index)
                                                this.firstMarker = marker;
                                        }}
                                        onPress={() => {this.setState({index: index, selectedBuilding: marker, isItemSelected: true})}}
                                        key={index} 
                                        coordinate={marker.coordinate}
                                        title={marker.name}
                                        description={marker.address}
                                    >
                                        <Animated.View className="w-9 h-9 items-center justify-center" style={opacityStlye}>
                                            <Animated.View className={ringStyle} style={scaleStyle} />
                                            <View className={markerStyle} />
                                        </Animated.View>
                                        <Callout
                                            alphaHitTest
                                            tooltip={true}
                                            onPress={handlePresentModalPress}
                                            className="w-56 pb-3"
                                        >
                                            <View className="bg-white dark:bg-slate-700 rounded-lg w-full h-full p-2 border border-slate-300 dark:border-slate-900">
                                                <Text className="text-gray-800 dark:text-slate-300 text-sm">{marker.name}</Text>
                                                <View className="flex-row justify-between items-center">
                                                    <Text className="text-gray-500 dark:text-slate-400 text-xs">{marker.address}</Text>
                                                    <Text className={"px-2 py-1 rounded-full font-semibold text-gray-800 " + this.getColorBasedOnAvailability(marker.availability)}>{marker.availability} %</Text>
                                                </View>
                                            </View>
                                        </Callout>
                                    </MapMarker>
                                )
                            })
                        }

                    </MapView>
                    {
                        // Search bar visible logic
                        !this.state.ModalShowing ? 
                        <SearchBar
                            className="absolute top-8 m-3 w-11/12 h-12 z-10 dark:bg-slate-700" 
                            fontSize={20}
                            placeholderTextColor={this.props.route.params.theme === 'light' ? "#9ca3af" : '#cbd5e1'}
                            spinnerVisibility={this.state.searching}
                            darkMode={this.props.route.params.theme === 'dark'}
                            placeholder={t('searchHere')}
                            onClearPress={() => {this.setState({searchBarSelected: false})}}
                            onChangeText={(text) => {
                                if (text.length === 0) 
                                    this.setState({searchBarSelected: false})
                                else 
                                    filterBuildings(text)
                                    
                            }}
                            /> : <></>
                    }
                    {
                        // Search bar modal visible logic
                        this.state.searchBarSelected ? 
                            <View className="absolute pt-2 left-0 top-0 z-0 w-full h-full bg-slate-100 dark:bg-slate-800">
                                {searchWindow}
                            </View> 
                            : <></>
                    }
                    <BottomSheetModal
                            ref={this.state.bottomSheetModalRef}
                            index={1}
                            snapPoints={snapPoints}
                            backgroundStyle={customStyle.reservationModalHandle}
                            handleStyle={customStyle.reservationModalHandle}
                            backdropComponent={CustomBackdrop}
                            handleIndicatorStyle={{backgroundColor: 'white'}}
                            onDismiss={() => {this.setState({ModalShowing: false})}}
                        >
                            <MakeReservationPage exitModal={handleCloseModalPress} building={this.state.selectedBuilding} />
                    </BottomSheetModal>
                    
                </BottomSheetModalProvider>
                {makeReservationButton}
            </View>
            
        )   
    }
}

export default withTranslation()(MapScreen);