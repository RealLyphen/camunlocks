import React, { useState } from 'react';
import { useStore } from '../../../context/StoreContext';
import { useToast } from '../../../context/ToastContext';
import { AlertCircle, Bell, Mail, RefreshCw, Save, Send } from 'lucide-react';

/* ─── Shared CSS Styles ─── */
const cardStyle: React.CSSProperties = {
    background: 'rgba(20, 20, 25, 0.6)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 16,
    padding: '24px',
    marginBottom: '20px',
    transition: 'all 0.3s ease',
};

const inputStyle: React.CSSProperties = {
    width: '100%',
    background: 'rgba(0,0,0,0.4)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 10,
    padding: '10px 14px',
    color: '#fff',
    fontSize: '0.9rem',
    fontFamily: 'inherit',
    outline: 'none',
    transition: 'border-color 0.2s',
};

const btnPrimary: React.CSSProperties = {
    background: 'var(--primary-color)',
    color: '#fff',
    border: 'none',
    padding: '10px 20px',
    borderRadius: 8,
    fontWeight: 600,
    fontSize: '0.9rem',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    transition: 'all 0.2s',
};

const btnOutline: React.CSSProperties = {
    background: 'rgba(255,255,255,0.05)',
    color: '#e4e4e7',
    border: '1px solid rgba(255,255,255,0.1)',
    padding: '8px 16px',
    borderRadius: 8,
    fontWeight: 500,
    fontSize: '0.85rem',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    transition: 'all 0.2s',
};


/* ─── Toggle Switch Component ─── */
const Toggle: React.FC<{ on: boolean; onToggle: () => void; size?: number }> = ({ on, onToggle, size = 44 }) => (
    <div
        onClick={onToggle}
        style={{
            width: size,
            height: size * 0.55,
            borderRadius: size,
            background: on ? 'var(--primary-color)' : 'rgba(255,255,255,0.1)',
            cursor: 'pointer',
            position: 'relative',
            transition: 'background 0.3s',
            flexShrink: 0,
        }}
    >
        <div style={{
            width: size * 0.45,
            height: size * 0.45,
            borderRadius: '50%',
            background: '#fff',
            position: 'absolute',
            top: '50%',
            left: on ? `calc(100% - ${size * 0.45 + 2}px)` : '2px',
            transform: 'translateY(-50%)',
            transition: 'left 0.3s',
            boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
        }} />
    </div>
);


const Notifications: React.FC = () => {
    const { settings, updateSettings } = useStore();
    const { addToast } = useToast();
    const [isSaving, setIsSaving] = useState(false);

    // Test states
    const [testingDiscord, setTestingDiscord] = useState<string | null>(null);
    const [testingTelegram, setTestingTelegram] = useState<string | null>(null);

    // Initialize local state from global context, merging with defaults to prevent TS errors on old data
    const [localNotifications, setLocalNotifications] = useState({
        orderCompletion: { emailAddress: '', ...settings.notifications?.orderCompletion, dashboard: settings.notifications?.orderCompletion.dashboard ?? false, email: settings.notifications?.orderCompletion.email ?? false, discord: settings.notifications?.orderCompletion.discord ?? '', telegramBotToken: settings.notifications?.orderCompletion.telegramBotToken ?? '', telegramChatId: settings.notifications?.orderCompletion.telegramChatId ?? '' },
        outOfStock: { emailAddress: '', ...settings.notifications?.outOfStock, dashboard: settings.notifications?.outOfStock.dashboard ?? false, email: settings.notifications?.outOfStock.email ?? false, discord: settings.notifications?.outOfStock.discord ?? '', telegramBotToken: settings.notifications?.outOfStock.telegramBotToken ?? '', telegramChatId: settings.notifications?.outOfStock.telegramChatId ?? '' },
        restock: { emailAddress: '', ...settings.notifications?.restock, dashboard: settings.notifications?.restock.dashboard ?? false, email: settings.notifications?.restock.email ?? false, discord: settings.notifications?.restock.discord ?? '', telegramBotToken: settings.notifications?.restock.telegramBotToken ?? '', telegramChatId: settings.notifications?.restock.telegramChatId ?? '' }
    });

    const handleToggle = (eventKey: string, field: 'dashboard' | 'email') => {
        setLocalNotifications(prev => ({
            ...prev,
            [eventKey]: {
                ...prev[eventKey as keyof typeof prev],
                [field]: !prev[eventKey as keyof typeof prev][field]
            }
        }));
    };

    const handleChange = (eventKey: string, field: 'discord' | 'telegramBotToken' | 'telegramChatId', value: string) => {
        setLocalNotifications(prev => ({
            ...prev,
            [eventKey]: {
                ...prev[eventKey as keyof typeof prev],
                [field]: value
            }
        }));
    };

    const handleSave = () => {
        // Validate emails if toggled ON
        for (const [key, rawConfig] of Object.entries(localNotifications)) {
            const config = rawConfig as { email: boolean, emailAddress: string };
            if (config.email && !config.emailAddress.trim()) {
                addToast(`Please enter an email address for ${key.replace(/([A-Z])/g, ' $1').toLowerCase()}`, 'error');
                return;
            }
        }

        setIsSaving(true);
        updateSettings({ notifications: localNotifications });
        setTimeout(() => {
            setIsSaving(false);
            addToast("Settings saved successfully!", 'success');
        }, 600);
    };

    const testDiscord = async (eventKey: string, url: string) => {
        if (!url) return addToast("Please enter a Discord Webhook URL first.", 'error');
        setTestingDiscord(eventKey);

        try {
            const res = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    content: `🔔 **Test Notification** from CamUnlocks for: ${eventKey.replace(/([A-Z])/g, ' $1').toUpperCase()}`
                })
            });

            if (res.ok) addToast("Discord test message sent successfully!", 'success');
            else addToast("Failed to send Discord message. Check the URL.", 'error');
        } catch (error) {
            addToast("Error sending to Discord. Check console.", 'error');
            console.error(error);
        } finally {
            setTestingDiscord(null);
        }
    };

    const testTelegram = async (eventKey: string, token: string, chatId: string) => {
        if (!token || !chatId) return addToast("Please enter both Bot Token and Chat ID for Telegram.", 'error');
        setTestingTelegram(eventKey);

        const url = `https://api.telegram.org/bot${token}/sendMessage`;
        try {
            const res = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    chat_id: chatId,
                    text: `🔔 *Test Notification* from CamUnlocks for: ${eventKey.replace(/([A-Z])/g, ' $1').toUpperCase()}`,
                    parse_mode: 'Markdown'
                })
            });

            if (res.ok) addToast("Telegram test message sent successfully!", 'success');
            else addToast("Failed to send Telegram message. Check token and Chat ID.", 'error');
        } catch (error) {
            addToast("Error sending to Telegram. Check console.", 'error');
            console.error(error);
        } finally {
            setTestingTelegram(null);
        }
    };


    const renderEventSection = (
        title: string,
        description: string,
        eventKey: 'orderCompletion' | 'outOfStock' | 'restock'
    ) => {
        const config = localNotifications[eventKey];

        return (
            <div style={{ ...cardStyle }}>
                {/* Section Header */}
                <div style={{ paddingBottom: '20px', borderBottom: '1px solid rgba(255,255,255,0.08)', marginBottom: '20px' }}>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 600, color: '#fff', marginBottom: 4 }}>{title}</h3>
                    <p style={{ fontSize: '0.85rem', color: '#a1a1aa', margin: 0 }}>{description}</p>
                </div>

                {/* Toggles */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', marginBottom: '24px' }}>
                    {/* Dashboard */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: 'rgba(0,0,0,0.2)', borderRadius: 10, border: '1px solid rgba(255,255,255,0.05)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <Bell size={18} color="#a1a1aa" />
                            <span style={{ fontSize: '0.9rem', color: '#e4e4e7', fontWeight: 500 }}>Dashboard</span>
                        </div>
                        <Toggle on={config.dashboard} onToggle={() => handleToggle(eventKey, 'dashboard')} size={36} />
                    </div>
                    {/* Email */}
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: 'rgba(0,0,0,0.2)', borderRadius: 10, border: '1px solid rgba(255,255,255,0.05)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                <Mail size={18} color="#a1a1aa" />
                                <span style={{ fontSize: '0.9rem', color: '#e4e4e7', fontWeight: 500 }}>Email</span>
                            </div>
                            <Toggle on={config.email} onToggle={() => handleToggle(eventKey, 'email')} size={36} />
                        </div>

                        {config.email && (
                            <div style={{ animation: 'fadeIn 0.2s ease', marginTop: '12px' }}>
                                <input
                                    type="email"
                                    value={(config as any).emailAddress || ''}
                                    onChange={e => handleChange(eventKey, 'emailAddress' as any, e.target.value)}
                                    placeholder="Enter email address..."
                                    style={{ ...inputStyle, background: 'rgba(0,0,0,0.2)' }}
                                />
                            </div>
                        )}
                    </div>
                </div>

                {/* Discord Webhook */}
                <div style={{ marginBottom: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                        <label style={{ fontSize: '0.85rem', color: '#a1a1aa', fontWeight: 500 }}>Discord Webhook URL</label>
                        <button
                            onClick={() => testDiscord(eventKey, config.discord)}
                            disabled={testingDiscord === eventKey}
                            style={btnOutline}
                        >
                            {testingDiscord === eventKey ? <RefreshCw size={14} className="spin" /> : <Send size={14} />}
                            Test Discord
                        </button>
                    </div>
                    <input
                        value={config.discord}
                        onChange={e => handleChange(eventKey, 'discord', e.target.value)}
                        placeholder="https://discord.com/api/webhooks/..."
                        style={inputStyle}
                    />
                </div>

                {/* Telegram */}
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                        <label style={{ fontSize: '0.85rem', color: '#a1a1aa', fontWeight: 500 }}>Telegram Configuration</label>
                        <button
                            onClick={() => testTelegram(eventKey, config.telegramBotToken, config.telegramChatId)}
                            disabled={testingTelegram === eventKey}
                            style={btnOutline}
                        >
                            {testingTelegram === eventKey ? <RefreshCw size={14} className="spin" /> : <Send size={14} />}
                            Test Telegram
                        </button>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <input
                            value={config.telegramBotToken}
                            onChange={e => handleChange(eventKey, 'telegramBotToken', e.target.value)}
                            placeholder="Bot Token (e.g. 123456:ABC-DEF)"
                            style={inputStyle}
                        />
                        <input
                            value={config.telegramChatId}
                            onChange={e => handleChange(eventKey, 'telegramChatId', e.target.value)}
                            placeholder="Channel / Chat ID (e.g. -100123...)"
                            style={inputStyle}
                        />
                    </div>
                </div>

            </div>
        );
    };

    return (
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
            {/* Header Area */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 32 }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#71717a', fontSize: '0.85rem', marginBottom: 12 }}>
                        <span>⚙️ Store</span>
                        <span style={{ fontSize: '10px' }}>▶</span>
                        <span style={{ color: '#a1a1aa' }}>Notifications</span>
                    </div>
                    <h1 style={{
                        fontSize: '1.8rem', fontWeight: 800, margin: 0,
                        background: 'linear-gradient(135deg, #ffffff 0%, #a1a1aa 100%)',
                        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                    }}>
                        Notifications
                    </h1>
                </div>
                <button
                    onClick={handleSave}
                    disabled={isSaving}
                    style={{ ...btnPrimary, background: isSaving ? '#3f51b5' : 'var(--primary-color)' }}
                >
                    {isSaving ? <RefreshCw size={18} className="spin" /> : <Save size={18} />}
                    {isSaving ? 'Saving...' : 'Update Changes'}
                </button>
            </div>

            {/* Note alert */}
            <div style={{
                background: 'rgba(239, 68, 68, 0.08)',
                border: '1px solid rgba(239, 68, 68, 0.2)',
                borderRadius: 12,
                padding: '16px 20px',
                marginBottom: 24,
                display: 'flex',
                alignItems: 'flex-start',
                gap: 12
            }}>
                <AlertCircle size={20} color="#ef4444" style={{ marginTop: 2 }} />
                <div>
                    <strong style={{ color: '#ef4444', fontSize: '0.95rem', display: 'block', marginBottom: 4 }}>Note:</strong>
                    <span style={{ color: '#fca5a5', fontSize: '0.85rem' }}>
                        Discord notifications are sent to the channel configured in the webhook URL. Ensure your Telegram Bot Token and Chat ID are correct and your bot has permission to message the chat.
                    </span>
                </div>
            </div>

            <div style={{ color: '#fff', fontSize: '1rem', fontWeight: 600, marginBottom: 16 }}>
                Event Notifications
            </div>

            {/* Event Sections */}
            {renderEventSection(
                'Order Completion',
                'When an order is completed by a customer',
                'orderCompletion'
            )}

            {renderEventSection(
                'Product Out of Stock',
                'When a product goes out of stock in the store',
                'outOfStock'
            )}

            {renderEventSection(
                'Product Restock',
                'When a product is restocked in the store',
                'restock'
            )}
        </div>
    );
};

export default Notifications;
