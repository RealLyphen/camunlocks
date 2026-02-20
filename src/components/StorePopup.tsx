import React, { useState, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { X, Sparkles } from 'lucide-react';

const StorePopup: React.FC = () => {
    const { settings } = useStore();
    const [isVisible, setIsVisible] = useState(false);
    const [hasMounted, setHasMounted] = useState(false);

    useEffect(() => {
        // Only show if enabled and hasn't been dismissed in this session
        if (settings.storePopup?.enabled && !sessionStorage.getItem('storePopupDismissed')) {
            const timer = setTimeout(() => {
                setIsVisible(true);
                setHasMounted(true);
            }, 1000); // 1s delay on load
            return () => clearTimeout(timer);
        }
    }, [settings.storePopup?.enabled]);

    const handleClose = () => {
        setIsVisible(false);
        sessionStorage.setItem('storePopupDismissed', 'true');
    };

    if (!hasMounted || !settings.storePopup?.enabled) return null;

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
            background: 'rgba(0,0,0,0.6)',
            backdropFilter: 'blur(4px)',
            WebkitBackdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 99999,
            opacity: isVisible ? 1 : 0,
            pointerEvents: isVisible ? 'auto' : 'none',
            transition: 'opacity 0.3s ease'
        }}>
            <div style={{
                background: 'rgba(20, 20, 25, 0.9)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: 20,
                padding: '40px',
                maxWidth: 440,
                width: '90%',
                textAlign: 'center',
                boxShadow: '0 24px 48px rgba(0,0,0,0.5)',
                position: 'relative',
                transform: isVisible ? 'translateY(0) scale(1)' : 'translateY(20px) scale(0.95)',
                transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
            }}>
                <button
                    onClick={handleClose}
                    style={{
                        position: 'absolute', top: 16, right: 16,
                        background: 'rgba(255,255,255,0.05)', border: 'none',
                        color: '#a1a1aa', width: 32, height: 32, borderRadius: '50%',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        cursor: 'pointer', transition: 'all 0.2s'
                    }}
                    onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = '#fff'; }}
                    onMouseOut={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = '#a1a1aa'; }}
                >
                    <X size={16} />
                </button>

                <div style={{
                    width: 64, height: 64, borderRadius: '50%', background: 'rgba(139, 92, 246, 0.1)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px',
                    border: '1px solid rgba(139, 92, 246, 0.3)', color: '#a78bfa'
                }}>
                    <Sparkles size={32} />
                </div>

                <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#fff', margin: '0 0 16px', letterSpacing: '-0.5px' }}>
                    Welcome to {settings.storeName}
                </h2>

                <p style={{ fontSize: '1rem', color: '#a1a1aa', margin: '0 0 32px', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                    {settings.storePopup.message}
                </p>

                <button
                    onClick={handleClose}
                    style={{
                        background: 'var(--primary-color)', color: '#fff', border: 'none',
                        padding: '14px 24px', borderRadius: 12, fontSize: '1rem', fontWeight: 600,
                        width: '100%', cursor: 'pointer', transition: 'background 0.2s',
                        boxShadow: '0 4px 12px rgba(79, 104, 248, 0.3)'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.background = '#3f51b5'}
                    onMouseOut={(e) => e.currentTarget.style.background = 'var(--primary-color)'}
                >
                    Got it!
                </button>
            </div>
        </div>
    );
};

export default StorePopup;
