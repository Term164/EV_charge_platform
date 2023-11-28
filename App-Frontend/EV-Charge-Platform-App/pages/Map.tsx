import { View, Text, Dimensions, Animated, ScrollView } from "react-native";
import MapView, {MapMarker} from "react-native-maps";
import React from 'react';
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faChargingStation } from "@fortawesome/free-solid-svg-icons";
import CustomButton from "../components/CustomButton";

const {width, height} = Dimensions.get('window');

const ASPECT_RATION = width / height;
const LATITUDE = 46.056946;
const LONGITUDE = 14.505751;
const LATITUDE_DELTA = 0.0922;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATION;

const CARD_WIDTH = width * 0.9
const CARD_HEIGHT = 180

const markers = [
    {
        coordinate: {
            latitude: 46.0483697,
            longitude: 14.458256,
        },
        name: 'TEHNOLOŠKI PARK - STAVBA G',
        location: 'Večna pot 150',
        availability: 100,
        numOfStations: 4
    },
    {
        coordinate: {
            latitude: 46.067616,
            longitude: 14.5381911,
        },
        name: 'A1 poslovna stavba',
        location: 'Ameriška ulica 4',
        availability: 50,
        numOfStations: 4
    },
    {
        coordinate: {
            latitude: 46.5398642,
            longitude: 15.6541704,
        },
        name: 'A1 Maribor',
        location: 'Mariborska cesta',
        availability: 10,
        numOfStations: 4
    },
    {
        coordinate: {
            latitude: 46.0740168,
            longitude: 14.516449,
        },
        name: 'Univerza v Ljubljani Ekonomska fakulteta',
        location: 'Kardeljeva ploščad 17',
        availability: 0,
        numOfStations: 4
    },
]

const region = {
    latitude: LATITUDE,
    longitude: 	LONGITUDE,
    latitudeDelta: LATITUDE_DELTA,
    longitudeDelta: LONGITUDE_DELTA
}

const mapStyle = [
    {
      "featureType": "administrative",
      "elementType": "geometry",
      "stylers": [
        {
          "visibility": "off"
        }
      ]
    },
    {
      "featureType": "poi",
      "stylers": [
        {
          "visibility": "off"
        }
      ]
    },
    {
      "featureType": "road",
      "elementType": "labels.icon",
      "stylers": [
        {
          "visibility": "off"
        }
      ]
    },
    {
      "featureType": "transit",
      "stylers": [
        {
          "visibility": "off"
        }
      ]
    }
  ]

export default class MapScreen extends React.Component<any, any> {

    animation: Animated.Value;
    index: number;
    regionTimeout: NodeJS.Timeout;
    map: MapView | null;
    scrollViewRef: React.RefObject<ScrollView | Animated.LegacyRef<ScrollView>> | null;

    constructor(props: any) {
        super(props);
        this.animation = new Animated.Value(0);
        this.index = 0;
        this.regionTimeout = setTimeout(()=>{},0);
        this.map = null;
        this.scrollViewRef = React.createRef();
    }

    scrollToCard(index: number, animated: boolean): void {
        if (index == 0) {
            (this.scrollViewRef?.current as ScrollView).scrollTo({ x: index * CARD_WIDTH - 1, animated: animated});    
        }
        else if (index == markers.length - 1) {
            (this.scrollViewRef?.current as ScrollView).scrollTo({ x: index * CARD_WIDTH + 16, animated: animated});    
        }
        else {
            (this.scrollViewRef?.current as ScrollView).scrollTo({ x: index * CARD_WIDTH + 8, animated: animated });
        }
        
    }

    componentDidMount(): void {
        this.animation.addListener(({ value }) => {
            let index = Math.floor(value / CARD_WIDTH + 0.3);
            if (index >= markers.length) {
                index = markers.length - 1;
            }

            if (index <=  0) {
                index = 0;
            }

            clearTimeout(this.regionTimeout);
            this.regionTimeout = setTimeout(() => {
                if (this.index !== index) {
                    this.index = index;
                    const {coordinate} = markers[index];
                    this.map?.animateToRegion({
                        ...coordinate,
                        latitudeDelta: region.latitudeDelta,
                        longitudeDelta: region.longitudeDelta
                    }, 350);
                }

                this.scrollToCard(index, true); // Scroll to correct card

            }, 10)
        })
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

        const interpolations = markers.map((marker, index) => {
            const inputRange = [
                (index - 1) * CARD_WIDTH,
                index * CARD_WIDTH,
                (index + 1) * CARD_WIDTH
            ];

            const scale = this.animation.interpolate({
                inputRange,
                outputRange: [1, 1.5, 1],
                extrapolate: "clamp"
            });

            const opacity = this.animation.interpolate({
                inputRange,
                outputRange: [.35, 1, .35],
                extrapolate: "clamp"
            });

            return {scale, opacity}
        })

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
                                        scale: interpolations[index].scale
                                    }
                                ]
                            }

                            const opacityStlye = {
                                opacity: interpolations[index].opacity
                            }

                            
                            const ringStyle = "w-6 h-6 border rounded-full items-center justify-center " + this.getColorBasedOnAvailability(marker.availability);
                            const markerStyle = "w-2 h-2 rounded-full absolute " + this.getDeepColorBasedOnAvailability(marker.availability);

                            return (
                                <MapMarker 
                                    key={index} 
                                    coordinate={marker.coordinate}
                                    onPress={() => {this.scrollToCard(index, false)}}
                                    title={marker.name}
                                    description={marker.location}
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
                <Animated.ScrollView
                    ref={this.scrollViewRef}
                    horizontal
                    scrollEventThrottle={1}
                    showsHorizontalScrollIndicator={false}
                    className="absolute ml-0 mr-0"
                    contentContainerStyle={{paddingRight: 14, paddingLeft: 14, paddingBottom:14}}
                    onScroll={
                        Animated.event([
                            {
                                nativeEvent: {
                                    contentOffset: {
                                        x: this.animation
                                    }
                                }   
                            }
                        ], {useNativeDriver: true})}
                >
                    {
                        markers.map((marker, index) => {

                            const availabilityClassNames = "pl-2 pr-1 rounded-full border text-xl " + this.getColorBasedOnAvailability(marker.availability);

                            return (
                                <View key={index} className="p-3 bg-white mx-1 overflow-hidden rounded-md shadow-lg shadow-black justify-between " style={{width: CARD_WIDTH, height:CARD_HEIGHT}}>
                                    <View>
                                        <Text className="font-bold text-gray-700 uppercase">{marker.name}</Text>
                                        <Text className="text-gray-500">{marker.location}</Text>
                                    </View>
                                    
                                    <View className="flex-row items-center justify-start mt-2 ">
                                        <FontAwesomeIcon icon={faChargingStation} size={40} color="#3b82f6"/>
                                        <Text className="text-2xl ml-2">{marker.numOfStations} stations</Text>
                                    </View>
                                    <View className="flex-row items-center justify-between mt-2 ">
                                        <View className="flex-row">
                                            <Text className={availabilityClassNames}>{marker.availability}%</Text>
                                            <Text className="text-2xl"> Availability</Text>
                                        </View>
                                        <CustomButton
                                            textStyle="font-bold text-lg text-white"
                                            className="w-4/12 bg-blue-500 text-center rounded-lg justify-center items-center border border-blue-800 shadow-lg shadow-black"
                                            android_ripple={{color: ''}}
                                        >
                                            RESERVE
                                        </CustomButton>
                                    </View>
                                    
                                </View>
                            )
                        })
                    }
                </Animated.ScrollView>
            </View>
            
        )   
    }
}