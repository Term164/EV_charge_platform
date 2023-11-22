import React from 'react';
import { AppState, StateAction, StateActionKind } from './types';

type authContextFunctions = {
  signIn: (_data: string) => Promise<void>,
  signOut: () => void,
  signUp: (_data: string) => Promise<void>
}
  
export const AuthContext = React.createContext<authContextFunctions>({
  signIn: async (test) => {},
  signOut: () => {},
  signUp: async (test) => {},
});

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