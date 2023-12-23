import React, { useContext } from 'react';
import { AppState, Building, Language, StateAction, StateActionKind } from './types';
import { Profile } from './databaseTypes';

export type userSettingsContext = {
  colorScheme: string
  language: Language
  notifications: string,
  selectedChargingTypes: Array<string>
  toggleColorScheme: () => void
  setColorScheme: (colorScheme: string) => void
  updateSettingsContext: (settingsContext: userSettingsContext) => void
}

type authContextFunctions = {
  signIn: (username: string, password: string) => Promise<void>
  signOut: () => void
  signUp: (username: string, email: string, password: string, confirmPassword: string) => Promise<boolean>
}

type userData= {
  header: object,
  userData: Profile,
  buildings: Array<Building>
}

export const SettingsContext = React.createContext<userSettingsContext | null>(null);
export const AuthContext = React.createContext<authContextFunctions | null>(null);
export const UserDataContext = React.createContext<userData | null>(null);

export const useCurrentSettings  = () => {
  const currentSettings = useContext(SettingsContext);

  if (!currentSettings) {
    throw new Error("useCurrentSettings has to be used within <SettingsContext.Provider>");
  }

  return currentSettings;
}

export const useUserData = () => {
  const currentUserData = useContext(UserDataContext);

  if (!currentUserData) {
    throw new Error("useCurrentSettings has to be used within <SettingsContext.Provider>");
  }

  return currentUserData;
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
        isLoading: false,
        isSignout: true,
        userToken: null
      };
    default: return prevState
  }
}