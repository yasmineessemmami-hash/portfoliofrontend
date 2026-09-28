import { createContext, useContext } from "react";
import type { ReactNode } from "react";
import type { CommonResponse } from "@/types/common.types";

interface CommonContextValue {
  common: CommonResponse | null;
}

const CommonContext = createContext<CommonContextValue>({ common: null });

interface CommonProviderProps {
  value: CommonResponse | null;
  children: ReactNode;
}

export const CommonProvider = ({ value, children }: CommonProviderProps) => {
  return (
    <CommonContext.Provider value={{ common: value }}>
      {children}
    </CommonContext.Provider>
  );
};

export const useCommonContext = () => useContext(CommonContext);


