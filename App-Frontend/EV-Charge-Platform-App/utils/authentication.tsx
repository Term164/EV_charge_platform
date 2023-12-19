import React from 'react';
import { StateAction, StateActionKind } from './types';
import { Toast } from 'react-native-toast-notifications';
import { serverAddress } from './Constants';
import * as SecureStore from 'expo-secure-store';


function isValidEmail(email: string) {
    return /\S+@\S+\.\S+/.test(email);
  }

function isPasswordStrongEnough(pass: string) {
    return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}/.test(pass);
}

export function getAuthContextFunctions(dispatch: React.Dispatch<StateAction>) {
    const authContext = React.useMemo(
    () => ({
        signIn: async (username: string, password: string) => {
            // In a production app, we need to send some data (usually username, password) to server and get a token
            // We will also need to handle errors if sign in failed
            // After getting token, we need to persist the token using `SecureStore`
            // In the example, we'll use a dummy token

            if (username.length === 0 || password.length === 0) {
                Toast.show('Username and password must be provided.', {type: 'warning', duration: 2000});
                return;
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
                    body: JSON.stringify({
                        "username": username,
                        "password": password
                    })
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
                Toast.show('something went wrong', {type: 'danger'});
            }
            return;
        },
        signOut: () => dispatch({ type: StateActionKind.SIGN_OUT }),
        signUp: async (username: string, email: string, password: string, confirmPassword: string) => {
            // In a production app, we need to send user data to server and get a token
            // We will also need to handle errors if sign up failed
            // After getting token, we need to persist the token using `SecureStore`
            // In the example, we'll use a dummy token


            if (username.length === 0) {
                Toast.show('Username field must not be empty.', {type: 'warning', duration: 2000});
                return false;
            }

            if (username.length < 4) {
                Toast.show('Username must be atleast 4 characters long.', {type: 'warning', duration: 2000});
                return false;
            }

            if (email.length === 0) {
                Toast.show('Email filed must not be empty.', {type: 'warning', duration: 2000});
                return false;
            }

            if(!isValidEmail(email)) {
                Toast.show('You must enter a valid email address.', {type: 'warning', duration: 2000});
                return false;
            }

            if (password.length === 0) {
                Toast.show('Password filed must not be empty.', {type: 'warning', duration: 2000});
                return false;
            }

            if (!isPasswordStrongEnough(password)) {
                Toast.show('Your password must be atleast 8 characters long and contain atleast one uppercase and lowercase letter a digit and a special character.', {type: 'warning', duration: 10000});
                return false;
            }

            if (confirmPassword != password) {
                Toast.show('The two inputed passwords do not match', {type: 'warning', duration: 2000});
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
                console.log(loginResponse);
                if (loginResponse.message === "Registration succesfull") {
                    Toast.show('You have been succesfully registered, please check your email to activate your account.', {type: 'success'});
                    return true;
                } else {
                    Toast.show(loginResponse.message, {type: 'danger'});
                    return false;
                }
            } catch (error) {
                Toast.show('something went wrong', {type: 'danger'});
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