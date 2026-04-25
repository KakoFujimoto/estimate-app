import React, { createContext, useContext } from 'react';

export type UserContextValue = {
  userId: string | null;
  companyId: string | null;
};

const defaultUserContext: UserContextValue = {
  userId: null,
  companyId: null
};

const UserContext = createContext<UserContextValue>(defaultUserContext);

type UserProviderProps = {
  children: React.ReactNode;
};

export function UserProvider({ children }: UserProviderProps): JSX.Element {
  return <UserContext.Provider value={defaultUserContext}>{children}</UserContext.Provider>;
}

export function useUserContext(): UserContextValue {
  return useContext(UserContext);
}
