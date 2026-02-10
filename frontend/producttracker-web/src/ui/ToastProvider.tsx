import { createContext, useCallback, useContext, useMemo, useState } from "react";
import "./toast.css";

type Toast = {
    id: string;
    message: string;
    status: number;
};

type ToastContextValue = {
    pushToast: (toast: Omit<Toast, "id">) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

function statusClass(status: number) {
    if (status >= 500) return "danger";
    if (status >= 400) return "warn";
    if (status >= 200 && status < 300) return "success";
    return "neutral";
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const pushToast = useCallback(({ message, status }: Omit<Toast, "id">) => {
        const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
        setToasts((prev) => [...prev, { id, message, status }]);
        setTimeout(() => {
            setToasts((prev) => prev.filter((toast) => toast.id !== id));
        }, 3500);
    }, []);

    const value = useMemo(() => ({ pushToast }), [pushToast]);

    return (
        <ToastContext.Provider value={value}>
            {children}
            <div className="toast-container" aria-live="polite">
                {toasts.map((toast) => (
                    <div key={toast.id} className={`toast-card ${statusClass(toast.status)}`}>
                        <div className="toast-status">{toast.status}</div>
                        <div className="toast-message">{toast.message}</div>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
}

export function useToast() {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error("useToast must be used within ToastProvider.");
    }
    return context;
}
