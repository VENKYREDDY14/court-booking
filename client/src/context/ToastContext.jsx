import { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext(null);

export function useToast() {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
}

export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([]);

    const addToast = useCallback((message, type = 'info', duration = 4000) => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, message, type }]);

        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, duration);
    }, []);

    const removeToast = useCallback((id) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    const toast = {
        success: (msg) => addToast(msg, 'success'),
        error: (msg) => addToast(msg, 'error'),
        info: (msg) => addToast(msg, 'info'),
        warning: (msg) => addToast(msg, 'warning'),
    };

    return (
        <ToastContext.Provider value={toast}>
            {children}
            <ToastContainer toasts={toasts} removeToast={removeToast} />
        </ToastContext.Provider>
    );
}

function ToastContainer({ toasts, removeToast }) {
    if (toasts.length === 0) return null;

    return (
        <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-3 max-w-sm w-full">
            {toasts.map(t => (
                <div
                    key={t.id}
                    className={`
                        p-4 rounded-xl shadow-lg border flex items-start gap-3 animate-slide-in
                        ${t.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' : ''}
                        ${t.type === 'error' ? 'bg-red-50 border-red-200 text-red-800' : ''}
                        ${t.type === 'info' ? 'bg-blue-50 border-blue-200 text-blue-800' : ''}
                        ${t.type === 'warning' ? 'bg-yellow-50 border-yellow-200 text-yellow-800' : ''}
                    `}
                >
                    <span className="text-lg">
                        {t.type === 'success' && '✓'}
                        {t.type === 'error' && '✕'}
                        {t.type === 'info' && 'ℹ'}
                        {t.type === 'warning' && '⚠'}
                    </span>
                    <p className="flex-1 text-sm font-medium">{t.message}</p>
                    <button
                        onClick={() => removeToast(t.id)}
                        className="text-current opacity-50 hover:opacity-100 transition-opacity"
                    >
                        ✕
                    </button>
                </div>
            ))}
        </div>
    );
}
