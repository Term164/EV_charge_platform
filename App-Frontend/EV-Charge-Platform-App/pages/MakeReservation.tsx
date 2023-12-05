import { SafeAreaView } from "react-native-safe-area-context";
import { ChargingType, MakeReservationPageProps } from "../utils/types";
import { Pressable, Text } from "react-native";
import { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import CustomButton from "../components/CustomButton";
import { useState } from "react";
import { View } from "react-native";
import { TextInputWithIcon } from "../components/TextInputWithIcon";
import DropDownPicker from "react-native-dropdown-picker";
import { getConnectorIcon } from "../utils/utils";


function getTextColorBasedOnAvailability(availability: number) {
    let colorStyle;
    if (availability < 10) colorStyle = 'text-gray-600';
    else if (availability >= 10 && availability < 33.3) colorStyle = 'text-red-600';
    else if (availability >= 33.3 && availability < 66.6) colorStyle = 'text-yellow-600';
    else colorStyle = 'text-green-600';
    return colorStyle;
}

export default function MakeReservationPage({exitModal, building}: MakeReservationPageProps) {

    const today = new Date();
    today.setHours(0,1,0,0);
    const tommorow = new Date(today)
    tommorow.setDate(today.getDate() + 1);
    const startTimeDate = new Date();
    const endTimeDate = new Date();

    startTimeDate.setHours(7,0,0,0);
    endTimeDate.setHours(17,0,0,0);



    const [selectedDate, setSelectedDate] = useState<Date>(tommorow);
    const [startTime, setStartTime] = useState<Date>(startTimeDate);
    const [endTime, setEndTime] = useState<Date>(endTimeDate);
    const [numOfHours, setNumOfHours] = useState(1);

    const [open, setOpen] = useState(false);
    const [value, setValue] = useState('english');
    const [items, setItems] = useState([
        {label: 'Type 2', value: 'type2', icon: () => getConnectorIcon(ChargingType.TYPE2)},
        {label: 'Tesla', value: 'tesla', icon: () => getConnectorIcon(ChargingType.TESLASUC)}
    ]);

    const selectedHourStyle = "basis-4/12 bg-blue-200 py-4 rounded-md shadow-lg shadow-black";
    const hourStyle = "basis-3/12 bg-gray-200 py-2 rounded-md shadow-lg";

    const getTimeFromDate = (date: Date) => {
        return `${("0" + date.getHours()).slice(-2)}:${("0" + date.getMinutes()).slice(-2)} `
    }

    return(
        <View className="p-5 bg-slate-100 rounded-xl rounded-t-none border-t-blue-400 border-t-8">
            <Text className="self-center mb-2 text-gray-500 text-2xl font-semibold">Making new reservation</Text>
            <Text className="text-lg font-semibold text-gray-800 uppercase">{building.name}</Text>
            <Text className="text-base font-medium text-gray-500">{building.address}</Text>
            <Text className="font-semibold text-lg text-gray-600 mb-2">Availability for this building is at <Text className={getTextColorBasedOnAvailability(building.availability)}>{building.availability}</Text>%</Text>

            <Text className="text-gray-600 text-xl mb-1">Type</Text>
            <DropDownPicker
                        placeholder="Charger type"
                        placeholderStyle={{color: '#6b7280', fontSize: 20}}
                        labelStyle={{fontSize: 20}}
                        open={open}
                        value={value}
                        items={items}
                        setOpen={setOpen}
                        setValue={setValue}
                        setItems={setItems}
                        showTickIcon={true}
                        showArrowIcon={true}
                        itemSeparator={true}/>
            <View className="mt-2">
                <Text className="text-gray-600 text-xl mb-1">Date</Text>
                <View className="rounded-md overflow-hidden">
                    <Pressable
                        android_ripple={{color: ''}}
                        onPress={() => {
                                DateTimePickerAndroid.open({
                                    value: selectedDate,
                                    mode: 'date',
                                    minimumDate: today,
                                    onChange(event, date) {
                                        if(date)
                                            setSelectedDate(date);
                                    },
                                    is24Hour: true
                                });
                        }}
                    >
                        <TextInputWithIcon
                            editable={false}
                            className="flex-1 text-center text-lg text-gray-800 font-medium"
                            iconName="calendar-outline"
                            iconSize={20}
                            front={false}
                            placeholder="Select a date"
                            value={String(selectedDate.toLocaleDateString('sl-SI'))}
                            viewClassNames="stroke-black border rounded-md p-2 bg-white"
                        />
                    </Pressable>
                    
                </View>
            </View>


            <View className="flex flex-row mt-4 justify-evenly w-full">
                <View className="flex-row items-center">
                    <Text className="text-gray-600 text-xl mb-1 mr-1">From</Text>
                    <View className="rounded-md overflow-hidden">
                        <Pressable
                            android_ripple={{color: ''}}
                            onPress={() => {
                                    DateTimePickerAndroid.open({
                                        display: 'spinner',
                                        value: startTime,
                                        mode: 'time',
                                        onChange(event, date) {
                                            if (date){
                                                date.setHours(date.getHours(),0,0,0);
                                                setStartTime(date);
                                            }
                                        },
                                        is24Hour: true
                                    });
                            }}
                        >
                            <TextInputWithIcon
                                editable={false}
                                className="flex-1 text-center text-lg text-gray-800 font-semibold"
                                iconName="time-outline"
                                iconSize={20}
                                front={false}
                                placeholder=""
                                value={getTimeFromDate(startTime)}
                                viewClassNames="stroke-black border rounded-md w-28 p-1 bg-white"
                            />
                        </Pressable>
                    </View>
                </View>

                <View className="flex-row items-center">
                    <Text className="text-gray-600 text-xl mb-1 ml-2 mr-1">To</Text>
                    <View className="rounded-md overflow-hidden">
                        <Pressable
                            android_ripple={{color: ''}}
                            onPress={() => {
                                    DateTimePickerAndroid.open({
                                        display: 'spinner',
                                        value: endTime,
                                        mode: 'time',
                                        onChange(event, date) {
                                            if(date){
                                                date.setHours(date.getHours(),0,0,0);
                                                setEndTime(date);
                                            }
                                        },
                                        is24Hour: true
                                    });
                            }}
                        >
                            <TextInputWithIcon
                                editable={false}
                                className="flex-1 text-center text-lg text-gray-800 font-semibold"
                                iconName="time-outline"
                                iconSize={20}
                                front={false}
                                placeholder=""
                                value={getTimeFromDate(endTime)}
                                viewClassNames="stroke-black border rounded-md w-28 p-1 bg-white"
                            />
                        </Pressable>
                    </View>
                </View>
                
            </View>

            {
                endTime.getHours() - startTime.getHours() > 3 ? <View>
                                    <Text className="text-gray-600 self-center text-xl mt-3">Desired length of Reservation:</Text>

                                    <View className="flex flex-row gap-x-4 items-center justify-center mt-2">
                                        <Pressable className={numOfHours == 1 ? selectedHourStyle : hourStyle} onPress={() => setNumOfHours(1)}><Text className="text-center text-2xl font-semibold">1h</Text></Pressable>
                                        <Pressable className={numOfHours == 2 ? selectedHourStyle : hourStyle} onPress={() => setNumOfHours(2)}><Text className="text-center text-2xl font-semibold">2h</Text></Pressable>
                                        <Pressable className={numOfHours == 3 ? selectedHourStyle : hourStyle} onPress={() => setNumOfHours(3)}><Text className="text-center text-2xl font-semibold">3h</Text></Pressable>
                                    </View>
                                </View>
                                : <></>
            }

            <View className="flex-row justify-end items-center px-2 self-center mt-4">
                <CustomButton
                    textStyle="font-bold text-lg text-white tracking-widest"
                    className="w-28 py-2 bg-blue-500 text-center rounded-lg justify-center items-center border border-blue-800 shadow-lg mr-4"
                    android_ripple={{color: ''}}
                >
                    CONFIRM
                </CustomButton>

                <CustomButton
                    onPress={exitModal}
                    textStyle="font-bold text-lg text-gray-800 tracking-widest"
                    className="w-28 py-2 text-center rounded-lg justify-center items-center border border-gray-800 shadow-lg"
                    android_ripple={{color: ''}}
                >
                    CANCEL
                </CustomButton>
            </View>
            
        </View>
    )
}