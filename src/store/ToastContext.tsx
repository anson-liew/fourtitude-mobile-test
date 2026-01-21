import React, { createContext, useMemo, useState } from "react";

export type ToastType = "success" | "error" | "info";

export type ToastData = {
  type?: ToastType;
  message: string;
};

type ToastContextValue = {
  toast: ToastData | null;
  show: (data: ToastData) => void;
  hide: () => void;

  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
};

export const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toast, setToast] = useState<ToastData | null>(null);

  const value = useMemo<ToastContextValue>(() => {
    return {
      toast,

      show: (data) => setToast(data),
      hide: () => setToast(null),

      success: (message) => setToast({ type: "success", message }),
      error: (message) => setToast({ type: "error", message }),
      info: (message) => setToast({ type: "info", message }),
    };
  }, [toast]);

  return (
    <ToastContext.Provider value={value}>{children}</ToastContext.Provider>
  );
}
