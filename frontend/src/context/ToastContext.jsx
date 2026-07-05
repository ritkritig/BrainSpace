import { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';

const ToastContext = createContext(null);

let toastIdCounter = 0;

// ── TOAST ICONS ────────────────────────────────────────────────────────────────
function SuccessIcon() {
  return (
    <svg className="w-5 h-5 text-emerald-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}

function ErrorIcon() {
  return (
    <svg className="w-5 h-5 text-red-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

function InfoIcon() {
  return (
    <svg className="w-5 h-5 text-primary-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

// ── SINGLE TOAST ───────────────────────────────────────────────────────────────
const toastStyles = {
  success: 'border-emerald-200 bg-emerald-50 dark:border-emerald-800/50 dark:bg-emerald-900/20',
  error: 'border-red-200 bg-red-50 dark:border-red-800/50 dark:bg-red-900/20',
  info: 'border-primary-200 bg-primary-50 dark:border-primary-800/50 dark:bg-primary-900/20',
};

const toastIcons = {
  success: SuccessIcon,
  error: ErrorIcon,
  info: InfoIcon,
};

function ToastItem({ toast, onRemove }) {
  const [isExiting, setIsExiting] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    timerRef.current = setTimeout(() => {
      setIsExiting(true);
      setTimeout(() => onRemove(toast.id), 200);
    }, toast.duration);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [toast.id, toast.duration, onRemove]);

  const handleClose = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setIsExiting(true);
    setTimeout(() => onRemove(toast.id), 200);
  };

  const Icon = toastIcons[toast.type] || InfoIcon;
  const style = toastStyles[toast.type] || toastStyles.info;

  return (
    <div
      className={`
        flex items-start gap-3 w-80 px-4 py-3 rounded-xl border shadow-lg backdrop-blur-sm
        transition-all duration-200
        ${style}
        ${isExiting ? 'opacity-0 translate-x-full' : 'opacity-100 translate-x-0'}
      `}
      style={{
        animation: isExiting ? undefined : 'slideInRight 0.3s ease-out',
      }}
      role="alert"
    >
      <Icon />
      <p className="flex-1 text-sm font-medium text-dark-800 dark:text-dark-200 leading-snug">
        {toast.message}
      </p>
      <button
        onClick={handleClose}
        className="shrink-0 p-0.5 rounded-md text-dark-400 hover:text-dark-600 hover:bg-dark-200/50 dark:text-dark-500 dark:hover:text-dark-300 dark:hover:bg-dark-700/50 transition-colors"
        aria-label="Close notification"
      >
        <CloseIcon />
      </button>
    </div>
  );
}

// ── TOAST CONTAINER ────────────────────────────────────────────────────────────
function ToastContainer({ toasts, removeToast }) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-3 pointer-events-auto">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onRemove={removeToast} />
      ))}
    </div>
  );
}

// ── PROVIDER ───────────────────────────────────────────────────────────────────
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((message, type = 'success', duration = 3000) => {
    const id = ++toastIdCounter;
    setToasts((prev) => [...prev, { id, message, type, duration }]);
    return id;
  }, []);

  const value = {
    addToast,
    removeToast,
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

export default ToastContext;
