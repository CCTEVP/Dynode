import React, { createContext, useContext } from "react";
import type { Creative } from "../types/creative";

type Ctx = {
  creative: Creative | null;
  loading: boolean;
  error: Error | null;
  reload: () => Promise<void> | void;
};

const CreativeContext = createContext<Ctx | null>(null);

export const CreativeProvider: React.FC<{
  value: Ctx;
  children: React.ReactNode;
}> = ({ value, children }) => {
  return (
    <CreativeContext.Provider value={value}>
      {children}
    </CreativeContext.Provider>
  );
};

export const useCreativeContext = () => {
  const ctx = useContext(CreativeContext);
  if (!ctx)
    throw new Error("useCreativeContext must be used inside CreativeProvider");
  return ctx;
};

export default CreativeContext;
