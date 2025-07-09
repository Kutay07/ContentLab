import React, { createContext, useContext } from "react";

interface AppContextType {
  appId: string;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{
  appId: string;
  children: React.ReactNode;
}> = ({ appId, children }) => {
  return (
    <AppContext.Provider value={{ appId }}>{children}</AppContext.Provider>
  );
};

export function useAppContext(): AppContextType {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error("useAppContext must be used within AppProvider");
  }
  return ctx;
}
