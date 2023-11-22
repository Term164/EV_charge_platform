import React from 'react';
import { StateAction, StateActionKind } from './types';

export function getAuthContextFunctions(dispatch: React.Dispatch<StateAction>) {
    const authContext = React.useMemo(
    () => ({
        signIn: async (_data: string) => {
        // In a production app, we need to send some data (usually username, password) to server and get a token
        // We will also need to handle errors if sign in failed
        // After getting token, we need to persist the token using `SecureStore`
        // In the example, we'll use a dummy token

        dispatch({ type: StateActionKind.SIGN_IN, token: 'dummy-auth-token' });
        },
        signOut: () => dispatch({ type: StateActionKind.SIGN_OUT }),
        signUp: async (_data: string) => {
        // In a production app, we need to send user data to server and get a token
        // We will also need to handle errors if sign up failed
        // After getting token, we need to persist the token using `SecureStore`
        // In the example, we'll use a dummy token

        dispatch({ type: StateActionKind.SIGN_IN, token: 'dummy-auth-token' });
        },
    }),
    []
    );

    return authContext;
}