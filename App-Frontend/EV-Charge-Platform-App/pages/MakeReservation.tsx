import { Building, ChargingType, MakeReservationPageProps } from "../utils/types";
import { Pressable, Text, View } from "react-native";
import { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import CustomButton from "../components/CustomButton";
import { useContext, useState } from "react";
import { TextInputWithIcon } from "../components/TextInputWithIcon";
import DropDownPicker, { ThemeNameType } from "react-native-dropdown-picker";
import { combineDateAndTime, getChargingTypeID, getConnectorIcon, getLabelFromChargingTypeValue, getTimeFromDate } from "../utils/utils";
import { useTranslation } from "react-i18next";
import { UserDataContext, useCurrentSettings } from "../utils/GlobalStateContext";
import { serverAddress } from "../utils/Constants";
import { useColorScheme } from "nativewind";
import { useToast } from "react-native-toast-notifications";
import { APIResponse } from "../utils/databaseTypes";


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

    const { t } = useTranslation();

    const toast = useToast();

    const { colorScheme, toggleColorScheme } = useColorScheme();

    const [selectedDate, setSelectedDate] = useState<Date>(tommorow);
    const [startTime, setStartTime] = useState<Date>(startTimeDate);
    const [endTime, setEndTime] = useState<Date>(endTimeDate);
    const [numOfHours, setNumOfHours] = useState(1);

    const getChargingTypeItems = (building: Building) => {
        let connectorTypesArray;
        const setOfTypes = new Set<ChargingType>();
        building.Connectors.forEach(connector => {
            setOfTypes.add(connector.chargingType);
        });
    
        connectorTypesArray = Array.from(setOfTypes).map(type => {
            const value = type.toString();
            return {label: getLabelFromChargingTypeValue(value), value: value, icon: () => getConnectorIcon(type, colorScheme)}
        })
        return connectorTypesArray;
    }


    const [open, setOpen] = useState(false);
    const [value, setValue] = useState(null);
    const [items, setItems] = useState(getChargingTypeItems(building));

    const userData = useContext(UserDataContext);

    const makeReservationRequest = async () => {

        let data;

        if (value) {
            data = {
                userID: userData?.userData.id,
                desiredBuildingID: building.id,
                chargingTime: numOfHours,
                desiredFrom: combineDateAndTime(selectedDate, startTime),
                desiredTo: combineDateAndTime(selectedDate, endTime),
                desiredChargingTypeID: getChargingTypeID(value)
              }
        } else {
            data = {
                userID: userData?.userData.id,
                desiredBuildingID: building.id,
                chargingTime: numOfHours,
                desiredFrom: combineDateAndTime(selectedDate, startTime),
                desiredTo: combineDateAndTime(selectedDate, endTime),
              }
        }

        try {
            exitModal();
            const response = await fetch(
                `${serverAddress}/api/v1/reservation/post/new`,
                {
                  method: 'POST',
                  headers: userData?.header as HeadersInit,
                  body: JSON.stringify(data)
                }
            );
            if (response.status === 200) {
                toast.show(t('reservationCreated'), {type: 'success', textStyle: {textAlign: 'center'}});
            } else {
                toast.show(t('somethingWrong'), {type: 'danger', textStyle: {textAlign: 'center'}});
            }
        } catch (error) {
            console.log(error);
            toast.show(t('somethingWrong'), {type: 'danger', textStyle: {textAlign: 'center'}});
        }
    }

    const selectedHourStyle = "basis-4/12 bg-blue-200 dark:bg-blue-500 py-4 rounded-md shadow-lg shadow-black";
    const hourStyle = "basis-3/12 bg-gray-200 dark:bg-slate-600 py-2 rounded-md shadow-lg";

    return(
        <View className="flex-1 p-5 bg-slate-100 dark:bg-slate-800">
            <Text className="self-center mb-2 text-gray-500 dark:text-slate-400 text-2xl font-semibold">{t('makeReservationTitle')}</Text>
            <Text className="text-lg font-semibold text-gray-800 dark:text-slate-100 uppercase">{building.name}</Text>
            <Text className="text-base font-medium text-gray-500 dark:text-slate-300">{building.address}</Text>
            <Text className="font-semibold text-lg text-gray-600 dark:text-slate-400 mb-2">{t('availabilityStatus')} <Text className={getTextColorBasedOnAvailability(building.availability)}>{building.availability}</Text>%</Text>

            <Text className="text-gray-600 dark:text-slate-500 text-xl mb-1">{t('type')}</Text>
            <DropDownPicker
                        placeholder={t('chargerType')}
                        placeholderStyle={{color: colorScheme === 'light' ? '#6b7280' : '#e2e8f0', fontSize: 20}}
                        labelStyle={{fontSize: 20}}
                        style={{backgroundColor: colorScheme === 'dark' ? '#334155' : 'white'}}
                        theme={colorScheme.toUpperCase() as ThemeNameType}
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
                <Text className="text-gray-600 dark:text-slate-500 text-xl mb-1">{t('date')}</Text>
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
                            className="flex-1 text-center text-lg text-gray-800 dark:text-slate-200 font-medium"
                            iconName="calendar-outline"
                            iconSize={20}
                            iconColor={colorScheme === 'dark' ? '#d1d5db' : "#1f2937"}
                            front={false}
                            placeholder="Select a date"
                            value={String(selectedDate.toLocaleDateString('sl-SI'))}
                            viewClassNames="stroke-black border dark:border-white dark:border-1 rounded-md p-2 bg-white dark:bg-slate-700 dark:border-black"
                        />
                    </Pressable>
                    
                </View>
            </View>


            <View className="flex flex-row mt-4 justify-evenly w-full">
                <View className="flex-row items-center">
                    <Text className="text-gray-600 dark:text-slate-500 text-xl mb-1 mr-1">{t('from')}</Text>
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
                                className="flex-1 text-center text-lg text-gray-800 dark:text-slate-200 font-semibold"
                                iconName="time-outline"
                                iconSize={20}
                                iconColor={colorScheme === 'dark' ? '#d1d5db' : "#1f2937"}
                                front={false}
                                placeholder=""
                                value={getTimeFromDate(startTime)}
                                viewClassNames="stroke-black border dark:border-white dark:border-1 rounded-md w-28 p-1 bg-white dark:bg-slate-700 dark:border-black"
                            />
                        </Pressable>
                    </View>
                </View>

                <View className="flex-row items-center">
                    <Text className="text-gray-600 dark:text-slate-500 text-xl mb-1 ml-2 mr-1">{t('to')}</Text>
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
                                className="flex-1 text-center text-lg text-gray-800 dark:text-slate-200 font-semibold"
                                iconName="time-outline"
                                iconSize={20}
                                iconColor={colorScheme === 'dark' ? '#d1d5db' : "#1f2937"}
                                front={false}
                                placeholder=""
                                value={getTimeFromDate(endTime)}
                                viewClassNames="stroke-black border dark:border-white dark:border-1 rounded-md w-28 p-1 bg-white dark:bg-slate-700 dark:border-black"
                            />
                        </Pressable>
                    </View>
                </View>
                
            </View>

            {
                endTime.getHours() - startTime.getHours() > 3 ? <View>
                                    <Text className="text-gray-600 dark:text-slate-400 self-center text-xl mt-3">{t('desiredLength')}</Text>

                                    <View className="flex flex-row gap-x-4 items-center justify-center mt-2">
                                        <Pressable className={numOfHours == 1 ? selectedHourStyle : hourStyle} onPress={() => setNumOfHours(1)}><Text className="text-center text-2xl font-semibold dark:text-slate-200">1h</Text></Pressable>
                                        <Pressable className={numOfHours == 2 ? selectedHourStyle : hourStyle} onPress={() => setNumOfHours(2)}><Text className="text-center text-2xl font-semibold dark:text-slate-200">2h</Text></Pressable>
                                        <Pressable className={numOfHours == 3 ? selectedHourStyle : hourStyle} onPress={() => setNumOfHours(3)}><Text className="text-center text-2xl font-semibold dark:text-slate-200">3h</Text></Pressable>
                                    </View>
                                </View>
                                : <></>
            }

            <View className="flex-row justify-end items-center px-2 self-center mt-4">
                <CustomButton
                    onPress={makeReservationRequest}
                    textStyle="font-bold text-lg text-white dark:text-slate-200 tracking-widest"
                    className="w-28 py-2 bg-blue-500 dark:bg-blue-700 text-center rounded-lg justify-center items-center border border-blue-800 shadow-lg mr-4"
                    android_ripple={{color: ''}}
                >
                    {t('confirm')}
                </CustomButton>

                <CustomButton
                    onPress={exitModal}
                    textStyle="font-bold text-lg text-gray-800 dark:text-slate-200 tracking-widest"
                    className="w-28 py-2 text-center rounded-lg justify-center items-center border border-gray-800 dark:border-slate-200 shadow-lg"
                    android_ripple={{color: ''}}
                >
                    {t('cancel')}
                </CustomButton>
            </View>
            
        </View>
    )
}