import { useState, useCallback, useEffect } from "react";

export interface Toast {
  id: string;
  title?: string;
  description?: string;
  action?: React.ReactNode;
  duration?: number;
}

export interface ToastState {
  toasts: Toast[];
}

export interface UseToastReturn {
  toast: (props: Omit<Toast, "id">) => void;
  dismiss: (id?: string) => void;
}

let toasts: Toast[] = [];
const listeners = new Set<() => void>();

const dispatch = (action: { type: "ADD_TOAST" | "DISMISS_TOAST"; toast?: Toast; id?: string }) => {
  switch (action.type) {
    case "ADD_TOAST":
      if (action.toast) {
        toasts = [...toasts, action.toast];
      }
      break;
    case "DISMISS_TOAST":
      if (action.id) {
        toasts = toasts.filter((toast) => toast.id !== action.id);
      } else {
        toasts = [];
      }
      break;
  }
  listeners.forEach((listener) => listener());
};

export function useToast(): UseToastReturn {
  const [, setState] = useState<ToastState>({ toasts });

  const toast = useCallback((props: Omit<Toast, "id">) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast: Toast = {
      id,
      duration: 5000,
      ...props,
    };
    dispatch({ type: "ADD_TOAST", toast: newToast });

    if (newToast.duration && newToast.duration > 0) {
      setTimeout(() => {
        dispatch({ type: "DISMISS_TOAST", id });
      }, newToast.duration);
    }
  }, []);

  const dismiss = useCallback((id?: string) => {
    dispatch({ type: "DISMISS_TOAST", id });
  }, []);

  useEffect(() => {
    const listener = () => setState({ toasts });
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);

  return { toast, dismiss };
}
