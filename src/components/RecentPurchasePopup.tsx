import React, { useEffect, useState, useCallback } from 'react';
import { useStore } from '../context/StoreContext';
import { ShoppingBag, X, Zap } from 'lucide-react';

const MOCK_LOCATIONS = ['🇺🇸 New York', '🇬🇧 London', '🇨🇦 Toronto', '🇦🇺 Sydney', '🇩🇪 Berlin', '🇫🇷 Paris', '🇯🇵 Tokyo', '🇧🇷 São Paulo'];

const RecentPurchasePopup: React.FC = () => {
    const { settings, users, products } = useStore();
    const [isVisible, setIsVisible] = useState(false);
    const [purchaseData, setPurchaseData] = useState({ name: '', location: '', product: '', time: '', isLive: false });

    const alertsConfig = typeof settings.purchaseAlerts === 'object'
        ? settings.purchaseAlerts
        : { enabled: settings.purchaseAlerts, names: 'Mikki, Alex, Jordan', products: 'Premium Subscription', mode: 'demo' };

    const isLiveMode = (alertsConfig as any).mode === 'live';

    const getLiveActivity = useCallback(() => {
        // Collect all real orders across all users, sorted newest first
        const allOrders: { order: any; user: any }[] = [];
        users.forEach(u => {
            u.orders.forEach(o => allOrders.push({ order: o, user: u }));
        });
        allOrders.sort((a, b) => new Date(b.order.date).getTime() - new Date(a.order.date).getTime());

        if (allOrders.length === 0) return null;

        // Pick a random one from the top 10 most recent
        const pool = allOrders.slice(0, 10);
        const pick = pool[Math.floor(Math.random() * pool.length)];
        const { order, user } = pick;

        const email = user.email;
        const maskedEmail = email.replace(/(.{1,2})(.*)(@.*)/, (_, a, b, c) => a + '*'.repeat(Math.min(b.length, 4)) + c);
        const productName = order.items[0]?.name || 'a product';
        const msAgo = Date.now() - new Date(order.date).getTime();
        const minsAgo = Math.floor(msAgo / 60000);
        const timeStr = minsAgo < 1 ? 'just now' : minsAgo < 60 ? `${minsAgo}m ago` : `${Math.floor(minsAgo / 60)}h ago`;
        const location = MOCK_LOCATIONS[Math.floor(Math.random() * MOCK_LOCATIONS.length)];

        return { name: maskedEmail, location, product: productName, time: timeStr, isLive: true };
    }, [users]);

    const getDemoActivity = useCallback(() => {
        const namesArray = (alertsConfig.names || '').split(',').map((s: string) => s.trim()).filter(Boolean);
        const productsArray = (alertsConfig.products || '').split(',').map((s: string) => s.trim()).filter(Boolean);
        const name = namesArray.length > 0 ? namesArray[Math.floor(Math.random() * namesArray.length)] : 'Someone';
        const location = MOCK_LOCATIONS[Math.floor(Math.random() * MOCK_LOCATIONS.length)];
        const product = productsArray.length > 0
            ? productsArray[Math.floor(Math.random() * productsArray.length)]
            : (products[0]?.name || 'a product');
        const hoursAgo = Math.floor(Math.random() * 24) + 1;
        return { name, location, product, time: `${hoursAgo}h ago`, isLive: false };
    }, [alertsConfig, products]);

    useEffect(() => {
        if (!alertsConfig.enabled) return;

        const triggerPopup = () => {
            const data = isLiveMode ? (getLiveActivity() || getDemoActivity()) : getDemoActivity();
            setPurchaseData(data);
            setIsVisible(true);
            setTimeout(() => setIsVisible(false), 7000);
        };

        const initialTimer = setTimeout(triggerPopup, 4000);
        const interval = setInterval(triggerPopup, Math.floor(Math.random() * 30000) + 20000);
        return () => { clearTimeout(initialTimer); clearInterval(interval); };
    }, [alertsConfig, isLiveMode, getLiveActivity, getDemoActivity]);

    if (!alertsConfig.enabled || !isVisible) return null;

    return (
        <>
            <style>{`
                @keyframes slideUpActivity {
                    from { opacity: 0; transform: translateY(24px) scale(0.95); }
                    to { opacity: 1; transform: translateY(0) scale(1); }
                }
                .rpp-close:hover { background: rgba(255,255,255,0.15) !important; }
            `}</style>
            <div style={{
                position: 'fixed', bottom: 24, left: 24, zIndex: 9000,
                background: 'rgba(14,14,20,0.92)',
                backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 18, padding: '14px 16px',
                width: 340, boxShadow: '0 16px 48px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04)',
                display: 'flex', alignItems: 'center', gap: 14,
                animation: 'slideUpActivity 0.5s cubic-bezier(0.16,1,0.3,1)',
            }}>
                {/* Icon */}
                <div style={{
                    background: 'linear-gradient(135deg, var(--primary-color,#4f68f8), var(--secondary-color,#6d28d9))',
                    width: 46, height: 46, borderRadius: 12, display: 'flex', alignItems: 'center',
                    justifyContent: 'center', flexShrink: 0,
                    boxShadow: '0 4px 16px rgba(79,104,248,0.35)',
                }}>
                    <ShoppingBag size={20} color="#fff" />
                </div>
                {/* Content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '0.85rem', color: '#e4e4e7', lineHeight: 1.45 }}>
                        <span style={{ fontWeight: 700, color: '#fff' }}>{purchaseData.name}</span>
                        {' '}from {purchaseData.location} just purchased{' '}
                        <span style={{ fontWeight: 700, color: 'var(--primary-color,#818cf8)' }}>{purchaseData.product}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6 }}>
                        {purchaseData.isLive ? (
                            <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.72rem', color: '#4ade80', fontWeight: 600 }}>
                                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#4ade80', display: 'inline-block', boxShadow: '0 0 6px #4ade80' }} />
                                LIVE
                            </span>
                        ) : (
                            <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.72rem', color: '#a1a1aa' }}>
                                <Zap size={10} style={{ color: '#fbbf24' }} /> Demo
                            </span>
                        )}
                        <span style={{ fontSize: '0.75rem', color: '#71717a' }}>{purchaseData.time}</span>
                    </div>
                </div>
                {/* Close */}
                <button className="rpp-close" onClick={() => setIsVisible(false)} style={{
                    position: 'absolute', top: 8, right: 8,
                    background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)',
                    width: 22, height: 22, borderRadius: '50%', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', color: '#71717a', cursor: 'pointer', padding: 0, transition: 'background 0.2s',
                }}>
                    <X size={11} />
                </button>
            </div>
        </>
    );
};

export default RecentPurchasePopup;
