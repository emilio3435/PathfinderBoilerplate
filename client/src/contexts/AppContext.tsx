import { createContext, useContext } from "react";

export interface User {
  id: string;
  name: string;
  email: string;
  totalPoints: number;
  streakDays: number;
}

export interface AppContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  currentPath: any;
  setCurrentPath: (path: any) => void;
}

export const AppContext = createContext<AppContextType | null>(null);

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within AppProvider");
  }
  return context;
};