import React, { createContext, useMemo, useState } from "react";

type LoadingContextValue = {
  visible: boolean;
  show: () => void;
  hide: () => void;
};

export const LoadingContext = createContext<LoadingContextValue | null>(null);

export function LoadingProvider({ children }: { children: React.ReactNode }) {
  const [visible, setVisible] = useState(false);

  const value = useMemo<LoadingContextValue>(() => {
    return {
      visible,
      show: () => setVisible(true),
      hide: () => setVisible(false),
    };
  }, [visible]);

  return (
    <LoadingContext.Provider value={value}>{children}</LoadingContext.Provider>
  );
}
