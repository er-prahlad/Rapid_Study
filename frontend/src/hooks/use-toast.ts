"use client";
import { useState, useCallback } from "react";

export type ToastVariant = "default" | "destructive";

export interface Toast {
  id: string;
  title?: string;
  description?: string;
  variant?: ToastVariant;
}

let toastListeners: ((toasts: Toast[]) => void)[] = [];
let toastList: Toast[] = [];

function notify() {
  toastListeners.forEach((fn) => fn([...toastList]));
}

export function toast(opts: Omit<Toast, "id">) {
  const id = Math.random().toString(36).slice(2);
  toastList = [...toastList, { id, ...opts }];
  notify();
  setTimeout(() => {
    toastList = toastList.filter((t) => t.id !== id);
    notify();
  }, 4000);
}

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const subscribe = useCallback(() => {
    const fn = (t: Toast[]) => setToasts(t);
    toastListeners.push(fn);
    return () => { toastListeners = toastListeners.filter((l) => l !== fn); };
  }, []);

  // Subscribe on first use
  useState(() => { const unsub = subscribe(); return unsub; });

  const dismiss = useCallback((id: string) => {
    toastList = toastList.filter((t) => t.id !== id);
    notify();
  }, []);

  return { toasts, dismiss, toast };
}
