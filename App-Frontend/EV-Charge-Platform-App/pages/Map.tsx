import { View, Text, Dimensions, Animated, ScrollView, Pressable, Alert } from "react-native";
import MapView, {Callout, MapMarker} from "react-native-maps";
import React from 'react';
import { markers } from "../utils/markers";
import { Building, mapStyle } from "../utils/types";
import SearchBar from "react-native-dynamic-search-bar";
import { searchBuildingsByName } from "../utils/search";
import { SafeAreaView } from "react-native-safe-area-context";
import { BackHandler } from "react-native";
import { ActivityIndicator } from "react-native";

const {width, height} = Dimensions.get('window');

const ASPECT_RATION = width / height;
const LATITUDE = 46.056946;
const LONGITUDE = 14.505751;
const LATITUDE_DELTA = 0.0922;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATION;

const region = {
    latitude: LATITUDE,
    longitude: 	LONGITUDE,
    latitudeDelta: LATITUDE_DELTA,
    longitudeDelta: LONGITUDE_DELTA
}

export default class MapScreen extends React.Component<any, any> {

    animation: Animated.Value;
    regionTimeout: NodeJS.Timeout;
    map: MapView | null;

    constructor(props: any) {
        super(props);
        this.animation = new Animated.Value(0);
        this.regionTimeout = setTimeout(()=>{},0);
        this.map = null;
        this.state = {index: 0};
        this.state = {searchBarSelected: false};
        this.state = {filteredBuildings: markers}
        this.state = {searching: false};
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
        if (availability < 10) colorStyle = 'bg-gray-300/60 border-gray-600';
        else if (availability >= 10 && availability < 33.3) colorStyle = 'bg-red-300/60 border-red-600';
        else if (availability >= 33.3 && availability < 66.6) colorStyle = 'bg-yellow-300/60 border-yellow-600';
        else colorStyle = 'bg-green-300/60 border-green-600';
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

        const filterBuildings = async (searchWord: string) => {
            if (!this.state.searchBarSelected)
                this.setState({searchBarSelected: true})
            this.setState({searching: true});
            this.setState({filteredBuildings: searchBuildingsByName(searchWord, markers)});
            this.setState({searching: false});
        }

        let searchWindow;

        if (this.state.filteredBuildings) {
            searchWindow = <ScrollView className="mt-20 w-full h-full">t
                {
                    this.state.filteredBuildings.map((building: Building, index: number) => {
                        return(
                            <Pressable key={index} android_ripple={{color: '#9ca3af'}}>
                                <View className="px-3 pt-3">
                                    <Text className="font-semibold text-base text-gray-800" >{building.name}</Text>
                                    <Text className="text-gray-500 text-base">{building.address}</Text>
                                </View>
                                <View style={{borderBottomWidth: 1}} className="border-gray-600/50 mt-2 pt-3"></View>
                            </Pressable>
                        );
                    })
                }
            </ScrollView>
        } else {
            <></>
        }

        return (
            <View className="justify-end items-center flex-1">
                <MapView
                    ref={map => this.map = map}
                    className="w-full h-full"
                    initialRegion={region}
                    showsCompass={false}
                    showsBuildings={false}
                    showsIndoors={false}
                    customMapStyle={mapStyle}
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
                                opacity: this.state.index === index ? 1 : 0.35
                            }

                            const ringStyle = "w-6 h-6 border rounded-full items-center justify-center " + this.getColorBasedOnAvailability(marker.availability);
                            const markerStyle = "w-2 h-2 rounded-full absolute " + this.getDeepColorBasedOnAvailability(marker.availability);

                            return (
                                <MapMarker 
                                    onPress={() => {this.setState({index: index})}}
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
                                        onPress={_ => Alert.alert('callout pressed')}
                                        className="w-56 pb-3"
                                    >
                                        <View className="bg-white rounded-lg w-full h-full p-2 border border-slate-300">
                                            <Text className="text-gray-800 text-sm">{marker.name}</Text>
                                            <View className="flex-row justify-between items-center">
                                                <Text className="text-gray-500 text-xs">{marker.address}</Text>
                                                <Text className={"px-2 py-1 rounded-full font-semibold text-gray-800 " + this.getColorBasedOnAvailability(marker.availability)}>{marker.availability} %</Text>
                                            </View>
                                        </View>
                                    </Callout>
                                </MapMarker>
                            )
                        })
                    }

                </MapView>
                <SearchBar 
                    className="absolute left-0 top-6 m-3 w-11/12 h-12 z-10" 
                    fontSize={20}
                    placeholderTextColor="#9ca3af"
                    spinnerVisibility={this.state.searching}
                    placeholder="search building"
                    onClearPress={() => {this.setState({searchBarSelected: false})}}
                    onChangeText={(text) => {
                        if (text.length === 0) 
                            this.setState({searchBarSelected: false})
                        else 
                            filterBuildings(text)
                            
                    }}
                />
                {

                    this.state.searchBarSelected ? 
                        <View className="absolute pt-2 left-0 top-0 z-0 w-full h-full bg-slate-100">
                            {searchWindow}
                        </View> 
                        : <></>
                }
            </View>
            
        )   
    }
}