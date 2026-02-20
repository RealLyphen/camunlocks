import React from 'react';
import { useStore } from '../context/StoreContext';
import { ShieldAlert } from 'lucide-react';

const Maintenance: React.FC = () => {
    const { settings } = useStore();

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
            background: settings.bannerUrl ? `linear-gradient(rgba(0,0,0,0.8), rgba(0,0,0,0.8)), url(${settings.bannerUrl})` : '#09090b',
            backgroundSize: 'cover', backgroundPosition: 'center',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 99999,
            padding: 20
        }}>
            <div style={{
                background: 'rgba(20, 20, 25, 0.7)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: 24,
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                padding: '48px',
                maxWidth: 480,
                width: '100%',
                textAlign: 'center',
                boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
                animation: 'fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1)'
            }}>
                <div style={{
                    width: 80, height: 80, borderRadius: '50%', background: 'rgba(234, 179, 8, 0.1)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px',
                    border: '1px solid rgba(234, 179, 8, 0.3)'
                }}>
                    <ShieldAlert size={40} color="#eab308" />
                </div>

                <h1 style={{
                    fontSize: '1.8rem', fontWeight: 800, color: '#fff', margin: '0 0 16px', letterSpacing: '-0.5px'
                }}>
                    {settings.storeName} is away
                </h1>

                <p style={{ fontSize: '1rem', color: '#a1a1aa', margin: '0 0 32px', lineHeight: 1.6 }}>
                    We are currently undergoing scheduled maintenance. Please check back soon!
                </p>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#eab308', animation: 'pulse 2s infinite' }} />
                    <span style={{ fontSize: '0.85rem', color: '#eab308', fontWeight: 600, letterSpacing: 1 }}>MAINTENANCE MODE</span>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes pulse {
                    0% { opacity: 1; transform: scale(1); }
                    50% { opacity: 0.5; transform: scale(1.2); }
                    100% { opacity: 1; transform: scale(1); }
                }
            `}} />
        </div>
    );
};

export default Maintenance;
