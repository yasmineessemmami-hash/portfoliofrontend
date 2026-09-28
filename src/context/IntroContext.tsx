import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";

interface IntroContextValue {
  introCompleted: boolean;
  setIntroCompleted: (completed: boolean) => void;
}

const IntroContext = createContext<IntroContextValue>({
  introCompleted: false,
  setIntroCompleted: () => {},
});

interface IntroProviderProps {
  children: ReactNode;
}

export const IntroProvider = ({ children }: IntroProviderProps) => {
  const [introCompleted, setIntroCompleted] = useState(false);

  return (
    <IntroContext.Provider value={{ introCompleted, setIntroCompleted }}>
      {children}
    </IntroContext.Provider>
  );
};

export const useIntroContext = () => useContext(IntroContext);
