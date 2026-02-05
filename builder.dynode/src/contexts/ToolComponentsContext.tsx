import React, { createContext, useContext, useEffect } from "react";
import useToolComponents from "../hooks/useToolComponents";

type Ctx = {
  components: any[] | null;
  loading: boolean;
  reload: () => Promise<void> | void;
};

const ToolComponentsContext = createContext<Ctx | null>(null);

export const ToolComponentsProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const { components, loading, reload } = useToolComponents();
  useEffect(() => {
    reload();
  }, [reload]);
  return (
    <ToolComponentsContext.Provider value={{ components, loading, reload }}>
      {children}
    </ToolComponentsContext.Provider>
  );
};

export const useToolComponentsContext = () => {
  const ctx = useContext(ToolComponentsContext);
  if (!ctx)
    throw new Error("useToolComponentsContext must be used inside provider");
  return ctx;
};

export default ToolComponentsContext;
