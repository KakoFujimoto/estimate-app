import React from 'react';

type AuthProviderProps = {
  children: React.ReactNode;
};

export function AuthProvider({ children }: AuthProviderProps): JSX.Element {
  return <>{children}</>;
}
