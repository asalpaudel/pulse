import { createContext, useContext, useCallback, useState } from "react";

const ToastContext = createContext(null);

let idSeq = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => {
    setToasts((t) => t.filter((x) => x.id !== id));
  }, []);

  const push = useCallback(
    (toast) => {
      const id = ++idSeq;
      const entry = {
        id,
        title: toast.title || "",
        message: toast.message || "",
        variant: toast.variant || "info", // info | success | error | alert
        duration: toast.duration ?? 5000,
      };
      setToasts((t) => [...t, entry]);
      if (entry.duration > 0) {
        setTimeout(() => dismiss(id), entry.duration);
      }
      return id;
    },
    [dismiss],
  );

  const toast = {
    info: (message, title) => push({ message, title, variant: "info" }),
    success: (message, title) => push({ message, title, variant: "success" }),
    error: (message, title) => push({ message, title, variant: "error" }),
    alert: (message, title) =>
      push({ message, title, variant: "alert", duration: 9000 }),
    push,
  };

  return (
    <ToastContext.Provider value={{ toasts, toast, dismiss }}>
      {children}
    </ToastContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
