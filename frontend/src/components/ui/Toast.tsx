import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { X, CheckCircle2, AlertCircle } from 'lucide-react';

type ToastType = 'success' | 'error';

interface Toast {
  id: string;
  type: ToastType;
  message: string;
}

interface ToastContextValue {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: (id: string) => void }) {
  useEffect(() => {
    const t = setTimeout(() => onDismiss(toast.id), 3000);
    return () => clearTimeout(t);
  }, [toast.id, onDismiss]);

  return (
    <div
      role="alert"
      aria-live="polite"
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '0.75rem',
        padding: '0.875rem 1rem',
        background: toast.type === 'success' ? 'var(--teal)' : 'var(--coral)',
        color: '#fff',
        borderRadius: 'var(--control-radius)',
        boxShadow: '0 4px 16px rgba(0,0,0,0.18)',
        minWidth: 280,
        maxWidth: 360,
        animation: 'toast-slide-in 250ms ease forwards',
        fontFamily: 'var(--font-body)',
        fontSize: '0.875rem',
        lineHeight: 1.5,
      }}
    >
      {toast.type === 'success' ? (
        <CheckCircle2 size={18} style={{ flexShrink: 0, marginTop: 2 }} aria-hidden="true" />
      ) : (
        <AlertCircle size={18} style={{ flexShrink: 0, marginTop: 2 }} aria-hidden="true" />
      )}
      <span style={{ flex: 1 }}>{toast.message}</span>
      <button
        onClick={() => onDismiss(toast.id)}
        aria-label="Dismiss notification"
        style={{
          background: 'transparent',
          border: 'none',
          color: 'rgba(255,255,255,0.8)',
          cursor: 'pointer',
          padding: '0 2px',
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <X size={14} />
      </button>
    </div>
  );
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((message: string, type: ToastType = 'success') => {
    const id = Date.now().toString(36) + Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { id, type, message }]);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div
        aria-label="Notifications"
        style={{
          position: 'fixed',
          top: '1.25rem',
          right: '1.25rem',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem',
          pointerEvents: 'none',
        }}
      >
        {toasts.map((t) => (
          <div key={t.id} style={{ pointerEvents: 'all' }}>
            <ToastItem toast={t} onDismiss={dismiss} />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
