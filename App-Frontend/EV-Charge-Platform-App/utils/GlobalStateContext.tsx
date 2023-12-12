import React, { useContext } from 'react';
import { AppState, StateAction, StateActionKind } from './types';

type userSettingsContext = {
  colorScheme: string
  toggleColorScheme: () => void
}

type authContextFunctions = {
  signIn: (username: string, password: string) => Promise<void>,
  signOut: () => void,
  signUp: (_data: string) => Promise<void>
}

export const SettingsContext = React.createContext<userSettingsContext | null>(null);
export const AuthContext = React.createContext<authContextFunctions | null>(null);

export const useCurrentSettings  = () => {
  const currentSettings = useContext(SettingsContext);

  if (!currentSettings) {
    throw new Error("useCurrentSettings has to be used within <SettingsContext.Provider>");
  }

  return currentSettings;
}

export const useCurrentAuth = () => {
  const currentAuthContext = useContext(AuthContext);

  if (!currentAuthContext) {
    throw new Error("useCurrentAuth has to be used within <AuthContext.Provider>");
  }

  return currentAuthContext;
}

export function AppStateReducer(prevState: AppState, action: StateAction) {
  switch (action.type) {
    case StateActionKind.RESTORE_TOKEN:
      return {
        ...prevState,
        userToken: action.token,
        isLoading: false,
      };
    case StateActionKind.SIGN_IN:
      return {
        ...prevState,
        isSignout: false,
        userToken: action.token,
      };
    case StateActionKind.SIGN_OUT:
      return {
        ...prevState,
        isSignout: true,
        userToken: null
      };
    default: return prevState
  }
}