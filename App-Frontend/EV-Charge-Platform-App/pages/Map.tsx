import { View, Text, Dimensions, Animated, ScrollView } from "react-native";
import MapView, {MapMarker} from "react-native-maps";
import React from 'react';
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faChargingStation } from "@fortawesome/free-solid-svg-icons";
import CustomButton from "../components/CustomButton";
import { markers } from "../utils/markers";
import { mapStyle } from "../utils/types";
import SearchBar from "react-native-dynamic-search-bar";

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
                                </MapMarker>
                            )
                        })
                    }

                </MapView>
                <SearchBar className="absolute left-0 top-6 m-3 w-11/12 h-12" textInputStyle={{fontSize: 16}} placeholder="search building"/>
            </View>
            
        )   
    }
}