import React from 'react';
import { StateAction, StateActionKind } from './types';
import { Toast } from 'react-native-toast-notifications';
import { serverAddress } from './Constants';
import * as SecureStore from 'expo-secure-store';
import { APIResponse, LoginResponse } from './databaseTypes';
import { useTranslation } from 'react-i18next';


function isValidEmail(email: string) {
    return /\S+@\S+\.\S+/.test(email);
  }

function isPasswordStrongEnough(pass: string) {
    return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}/.test(pass);
}

export function getAuthContextFunctions(dispatch: React.Dispatch<StateAction>) {
    const { t } = useTranslation();
    const authContext = React.useMemo(
    () => ({
        signIn: async (username: string, password: string) => {

            if (username.length === 0 || password.length === 0) {
                Toast.show(t('usernamePassProvided'), {type: 'warning', duration: 2000, textStyle: {textAlign: 'center'}});
                return;
            }

            let JSONdata;
            
            if (isValidEmail(username)) {
                JSONdata = {
                    "email": username,
                    "password": password
                }
            } else {
                JSONdata = {
                    "username": username,
                    "password": password
                }
            }

            try {
                const response = await fetch(
                    `${serverAddress}/api/v1/auth/login`,
                    {
                    method: 'POST',
                    headers: {
                        Accept: '*/*',
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(JSONdata)
                    }
                );
                const loginResponse = await response.json() as LoginResponse;
                if (loginResponse.data != null) {
                    await SecureStore.setItemAsync('sessionID', loginResponse.data.sessionID);
                    dispatch({ type: StateActionKind.SIGN_IN, token: loginResponse.data.sessionID });
                    //Toast.show(loginResponse.data.sessionID, {type: 'success'});
                } else {
                    Toast.show(loginResponse.message, {type: 'danger'});
                }
            } catch (error) {
                Toast.show(t('somethingWrong'), {type: 'danger'});
            }
            return;
        },
        signOut: () => dispatch({ type: StateActionKind.SIGN_OUT }),
        signUp: async (username: string, email: string, password: string, confirmPassword: string) => {

            if (username.length === 0) {
                Toast.show(t('usernameFieldEmpty'), {type: 'warning', duration: 2000, textStyle: {textAlign: 'center'}});
                return false;
            }

            if (username.length < 4) {
                Toast.show(t('username4'), {type: 'warning', duration: 2000, textStyle: {textAlign: 'center'}});
                return false;
            }

            if (email.length === 0) {
                Toast.show(t('emailFieldEmtpy'), {type: 'warning', duration: 2000, textStyle: {textAlign: 'center'}});
                return false;
            }

            if(!isValidEmail(email)) {
                Toast.show(t('validEmailAddress'), {type: 'warning', duration: 2000, textStyle: {textAlign: 'center'}});
                return false;
            }

            if (password.length === 0) {
                Toast.show(t('passwordFieldEmpty'), {type: 'warning', duration: 2000, textStyle: {textAlign: 'center'}});
                return false;
            }

            if (!isPasswordStrongEnough(password)) {
                Toast.show(t('passwordStrength'), {type: 'warning', duration: 10000, textStyle: {textAlign: 'center'}});
                return false;
            }

            if (confirmPassword != password) {
                Toast.show(t('passwordsNotMatching'), {type: 'warning', duration: 2000, textStyle: {textAlign: 'center'}});
                return false;
            }

            try {
                const response = await fetch(
                    `${serverAddress}/api/v1/auth/register/step1`,
                    {
                    method: 'POST',
                    headers: {
                        Accept: '*/*',
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        "username": username,
                        "email_account": email.toLowerCase(),
                        "password": password
                    })
                    }
                );
                const loginResponse = await response.json() as APIResponse;
                if (loginResponse.message === "Registration succesfull") {
                    Toast.show(t('registrationSuccess'), {type: 'success'});
                    return true;
                } else {
                    Toast.show(loginResponse.message, {type: 'danger'});
                    return false;
                }
            } catch (error) {
                Toast.show(t('somethingWrong'), {type: 'danger'});
                if (error instanceof Error )
                    console.trace(error.message, error.stack, error.name ,error.cause);
                return false;
            }
        },
    }),
    []
    );

    return authContext;
}