import React, { createContext, useContext, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import { X, CheckCircle2, AlertCircle, Info } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

export interface Toast {
    id: string;
    message: string;
    type: ToastType;
}

interface ToastContextType {
    addToast: (message: string, type?: ToastType) => void;
    removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const addToast = useCallback((message: string, type: ToastType = 'info') => {
        const id = Math.random().toString(36).substring(2, 9);
        setToasts(prev => [...prev, { id, message, type }]);

        // Auto remove after 5 seconds
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, 5000);
    }, []);

    const removeToast = useCallback((id: string) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    const getIcon = (type: ToastType) => {
        switch (type) {
            case 'success': return <CheckCircle2 size={18} color="#4ade80" />;
            case 'error': return <AlertCircle size={18} color="#ef4444" />;
            case 'info': return <Info size={18} color="#60a5fa" />;
        }
    };

    const getBorderColor = (type: ToastType) => {
        switch (type) {
            case 'success': return 'rgba(74, 222, 128, 0.3)';
            case 'error': return 'rgba(239, 68, 68, 0.3)';
            case 'info': return 'rgba(96, 165, 250, 0.3)';
        }
    };

    const getBgColor = (type: ToastType) => {
        switch (type) {
            case 'success': return 'rgba(20, 30, 20, 0.8)';
            case 'error': return 'rgba(30, 20, 20, 0.8)';
            case 'info': return 'rgba(20, 25, 30, 0.8)';
        }
    };

    return (
        <ToastContext.Provider value={{ addToast, removeToast }}>
            {children}

            {/* Toast Container */}
            <div style={{
                position: 'fixed',
                top: 24,
                right: 24,
                zIndex: 9999,
                display: 'flex',
                flexDirection: 'column',
                gap: 12,
                pointerEvents: 'none' // Let clicks pass through the container
            }}>
                {toasts.map(toast => (
                    <div
                        key={toast.id}
                        style={{
                            pointerEvents: 'auto', // But catch clicks on the actual toast
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: 12,
                            background: getBgColor(toast.type),
                            backdropFilter: 'blur(12px)',
                            WebkitBackdropFilter: 'blur(12px)',
                            border: `1px solid ${getBorderColor(toast.type)}`,
                            padding: '16px 20px',
                            borderRadius: 12,
                            minWidth: 300,
                            maxWidth: 400,
                            boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                            animation: 'slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards',
                        }}
                    >
                        <div style={{ marginTop: 2 }}>
                            {getIcon(toast.type)}
                        </div>

                        <div style={{ flex: 1 }}>
                            <div style={{ color: '#fff', fontSize: '0.95rem', fontWeight: 500, lineHeight: 1.4 }}>
                                {toast.message}
                            </div>
                        </div>

                        <button
                            onClick={() => removeToast(toast.id)}
                            style={{
                                background: 'transparent',
                                border: 'none',
                                color: '#a1a1aa',
                                cursor: 'pointer',
                                padding: 4,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                borderRadius: 4,
                                transition: 'all 0.2s',
                            }}
                            onMouseOver={(e) => e.currentTarget.style.color = '#fff'}
                            onMouseOut={(e) => e.currentTarget.style.color = '#a1a1aa'}
                        >
                            <X size={16} />
                        </button>
                    </div>
                ))}
            </div>

            <style>
                {`
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                `}
            </style>
        </ToastContext.Provider>
    );
};

export const useToast = () => {
    const context = useContext(ToastContext);
    if (context === undefined) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};
