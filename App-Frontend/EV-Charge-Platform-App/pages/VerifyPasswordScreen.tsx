import { Image, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { useTranslation } from "react-i18next";
import CustomButton from "../components/CustomButton";
import { VerifyScreenProps } from "../utils/types";
import { CodeField, Cursor, useBlurOnFulfill, useClearByFocusCell } from "react-native-confirmation-code-field";
import React, { useState } from "react";
import { serverAddress } from "../utils/Constants";
import { Toast } from "react-native-toast-notifications";
import { APIResponse, forgotPasswordResponse } from "../utils/databaseTypes";

const CELL_COUNT = 6;

export default function VerifyPasswordScreen({route, navigation}: VerifyScreenProps) {
    const { t } = useTranslation();
    const { email, accountID } = route.params;
    const [counter, setCounter] = React.useState(30);

    const [value, setValue] = useState('');
    const ref = useBlurOnFulfill({value, cellCount: CELL_COUNT});
    const [props, getCellOnLayoutHandler] = useClearByFocusCell({
      value,
      setValue,
    });

    const sendResetPasswordRequest = async () => {
      try {
          const response = await fetch(
              `${serverAddress}/api/v1/auth/forgotPassword`,
              {
              method: 'POST',
              headers: {
                  Accept: '*/*',
                  'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                  email: email.toLowerCase()
              })
              }
          );
          const loginResponse = await response.json() as forgotPasswordResponse;

          if (loginResponse.status === 200) {
              Toast.show(loginResponse.message, {type: 'success'});
              setCounter(60);
          } else {
              Toast.show(loginResponse.message, {type: 'danger', textStyle: {textAlign: 'center'} });
          }
      } catch (error) {
          Toast.show(t('somethingWrong'), {type: 'danger'});
      }
    }

  const validateCode = async () => {
    try {
        const response = await fetch(
            `${serverAddress}/api/v1/auth/confirmValidationCode`,
            {
            method: 'POST',
            headers: {
                Accept: '*/*',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                accountID: accountID,
                validationCode: Number.parseInt(value)
            })
            }
        );
        const loginResponse = await response.json() as APIResponse;

        if (loginResponse.status === 200) {
            Toast.show(loginResponse.message, {type: 'success'});
            navigation.navigate('ResetPasswordScreen', {accountID: accountID});
        } else {
            Toast.show(loginResponse.message, {type: 'danger', textStyle: {textAlign: 'center'} });
        }
    } catch (error) {
        Toast.show(t('somethingWrong'), {type: 'danger'});
    }
  }

    // Third Attempts
    React.useEffect(() => {
      const timer =
        counter > 0 && setInterval(() => setCounter(counter - 1), 1000);
      return () => clearInterval(timer);
    }, [counter]);

    const focusedCellStyle = 'w-10 h-20 justify-center items-center border-b-2 border-b-blue-700';
    const cellStlye = 'w-10 h-20 justify-center items-center border-b border-b-slate-800 dark:border-b-slate-300'

    return (
        <View className="flex-1 p-3 items-center justify-center dark:bg-slate-800">
            <Text className="mt-8 text-3xl mb-10 font-semibold text-gray-800 dark:text-slate-300">{t('verification')}</Text>
            <Image 
                source={require('../assets/icons/data-security.png')}
                style={{width: '60%', height: '27%', marginLeft: 15, resizeMode: 'cover'}}
            />
            <Text className="mt-8 text-xl text-center font-semibold text-gray-800 dark:text-slate-300">{t('verificationMessage')}</Text>

            <CodeField
                ref={ref}
                {...props}
                value={value}
                onChangeText={setValue}
                cellCount={CELL_COUNT}
                rootStyle={styles.codeFieldRoot}
                keyboardType="number-pad"
                textContentType="oneTimeCode"
                renderCell={({index, symbol, isFocused}) => (
                <View
                    // Make sure that you pass onLayout={getCellOnLayoutHandler(index)} prop to root component of "Cell"
                    onLayout={getCellOnLayoutHandler(index)}
                    key={index}
                    className={isFocused ? focusedCellStyle : cellStlye}
                    >
                    <Text className="text-4xl text-center text-slate-800 dark:text-slate-300" >
                    {symbol || (isFocused ? <Cursor /> : null)}
                    </Text>
                </View>
                )}
            />
            <View className="flex-row">
                <Text className="mt-8 text-lg text-center font-normal text-gray-800 dark:text-slate-400">{t('verificationCode')}</Text>
                {counter == 0 ? <Pressable onPress={sendResetPasswordRequest} className="mt-8"><Text className="text-lg font-bold text-center dark:text-slate-200 underline">{t('resend')}</Text></Pressable>
                : <Text className="mt-8 text-lg text-center font-normal text-gray-800 dark:text-slate-400">{t('resendin')} {counter}</Text>}
            </View>
            

            <CustomButton
                onPress={validateCode}
                textStyle="font-bold text-lg text-white dark:text-slate-300 tracking-widest"
                className="h-12 w-6/12 text-center flex-row items-center justify-center rounded-full mt-8 bg-blue-500 dark:bg-blue-700/80" 
                android_ripple={{color: ''}}>{t('verify')}</CustomButton>
        </View>
    );
}

const styles = StyleSheet.create({
    codeFieldRoot: {
      width: 300,
      marginLeft: 'auto',
      marginRight: 'auto',
    },
  });