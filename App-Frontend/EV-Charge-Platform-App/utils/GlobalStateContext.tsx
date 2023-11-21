import React from 'react';

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