import React, { useState } from 'react';
import { useStore } from '../../../context/StoreContext';
import { useToast } from '../../../context/ToastContext';
import { Save, MessageSquare, MonitorPlay, Check, LayoutGrid, Search, Settings2, Plus, Zap, ArrowRight, X, Send } from 'lucide-react';

// Define the apps available in the store
const APP_CATALOG = [
    {
        id: 'crisp',
        name: 'Crisp Live Chat',
        category: 'Customer Service',
        description: 'Add a live chat widget to your store to talk to visitors in real-time.',
        icon: <MessageSquare size={24} />,
        bg: 'linear-gradient(135deg, rgba(79, 104, 248, 0.1), rgba(79, 104, 248, 0.05))',
        color: '#4f68f8',
        developer: 'Crisp IM',
    },
    {
        id: 'discord',
        name: 'Discord Widget',
        category: 'Community',
        description: 'Show an interactive widget for your Discord server on your store.',
        icon: <MonitorPlay size={24} />,
        bg: 'linear-gradient(135deg, rgba(88, 101, 242, 0.1), rgba(88, 101, 242, 0.05))',
        color: '#5865F2',
        developer: 'Discord Inc.',
    },
    {
        id: 'telegram',
        name: 'Telegram Float',
        category: 'Customer Service',
        description: 'Add a floating Telegram chat bubble to your storefront.',
        icon: <Send size={24} />,
        bg: 'linear-gradient(135deg, rgba(34, 158, 217, 0.1), rgba(34, 158, 217, 0.05))',
        color: '#229ED9',
        developer: 'Telegram',
    }
];

const CATEGORIES = ['All Apps', 'Customer Service', 'Community', 'Payments'];

const AppStore: React.FC = () => {
    const { settings, updateSettings, paymentSettings, updatePaymentGateway } = useStore();
    const { addToast } = useToast();

    // Local states
    const [activeCategory, setActiveCategory] = useState('All Apps');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedApp, setSelectedApp] = useState<string | null>(null);

    // Form states for modals
    const [crispWebsiteId, setCrispWebsiteId] = useState(settings.apps?.crispWebsiteId || '');
    const [discordServerId, setDiscordServerId] = useState(settings.socials?.discordServerId || '');

    const [telegramUsername, setTelegramUsername] = useState(settings.apps?.telegramUsername || '');

    // Filter apps
    const filteredApps = APP_CATALOG.filter(app => {
        const matchesCat = activeCategory === 'All Apps' || app.category === activeCategory;
        const matchesSearch = app.name.toLowerCase().includes(searchQuery.toLowerCase()) || app.description.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCat && matchesSearch;
    });

    const isInstalled = (appId: string) => {
        if (appId === 'crisp') return !!settings.apps?.crispWebsiteId;
        if (appId === 'discord') return !!settings.socials?.discordServerId;
        if (appId === 'telegram') return !!settings.apps?.telegramUsername;
        return false;
    };

    const handleSave = () => {
        if (selectedApp === 'crisp' || selectedApp === 'discord' || selectedApp === 'telegram') {
            updateSettings({
                apps: { ...settings.apps, crispWebsiteId, telegramUsername },
                socials: { ...settings.socials, discordServerId }
            });
            addToast(`Settings saved successfully`, 'success');
        }
        setSelectedApp(null);
    };

    const handleUninstall = () => {
        if (selectedApp === 'crisp') {
            setCrispWebsiteId('');
            updateSettings({ apps: { ...settings.apps, crispWebsiteId: '' } });
        } else if (selectedApp === 'discord') {
            setDiscordServerId('');
            updateSettings({ socials: { ...settings.socials, discordServerId: '' } });
        } else if (selectedApp === 'telegram') {
            setTelegramUsername('');
            updateSettings({ apps: { ...settings.apps, telegramUsername: '' } });
        }
        addToast('App uninstalled successfully', 'success');
        setSelectedApp(null);
    };

    return (
        <div style={{ padding: '32px 40px', maxWidth: '1400px', margin: '0 auto', height: '100%', display: 'flex', flexDirection: 'column' }}>

            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
                <div>
                    <h1 style={{ fontSize: '2rem', fontWeight: 800, margin: 0, letterSpacing: '-0.5px' }}>App Store</h1>
                    <p style={{ color: '#a1a1aa', margin: '4px 0 0', fontSize: '1rem' }}>Supercharge your store with powerful integrations</p>
                </div>
            </div>

            {/* Main Layout Area */}
            <div style={{ display: 'flex', gap: 32, flex: 1, alignItems: 'flex-start' }}>

                {/* Left Sidebar - Categories */}
                <div style={{ width: '240px', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <div style={{ marginBottom: 16 }}>
                        <div style={{ position: 'relative' }}>
                            <Search size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#71717a' }} />
                            <input
                                type="text"
                                placeholder="Search apps..."
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                style={{
                                    width: '100%', padding: '12px 14px 12px 40px',
                                    background: 'rgba(0, 0, 0, 0.2)', border: '1px solid rgba(255, 255, 255, 0.08)',
                                    borderRadius: 12, color: '#fff', fontSize: '0.9rem', outline: 'none',
                                    transition: 'border-color 0.2s', boxSizing: 'border-box'
                                }}
                            />
                        </div>
                    </div>
                    {CATEGORIES.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setActiveCategory(cat)}
                            style={{
                                display: 'flex', alignItems: 'center', gap: 12,
                                width: '100%', padding: '12px 16px', borderRadius: 12,
                                background: activeCategory === cat ? 'rgba(255,255,255,0.08)' : 'transparent',
                                border: 'none', color: activeCategory === cat ? '#fff' : '#a1a1aa',
                                fontWeight: activeCategory === cat ? 600 : 500,
                                fontSize: '0.95rem', cursor: 'pointer', textAlign: 'left',
                                transition: 'all 0.2s',
                            }}
                        >
                            {cat === 'All Apps' ? <LayoutGrid size={18} /> : null}
                            {cat}
                        </button>
                    ))}
                </div>

                {/* Right Content - App Grid */}
                <div style={{ flex: 1 }}>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                        gap: 24
                    }}>
                        {filteredApps.map(app => {
                            const installed = isInstalled(app.id);
                            return (
                                <div key={app.id}
                                    onClick={() => setSelectedApp(app.id)}
                                    style={{
                                        background: 'rgba(20, 20, 25, 0.6)',
                                        border: '1px solid rgba(255, 255, 255, 0.08)',
                                        borderRadius: 16, padding: 24,
                                        cursor: 'pointer', transition: 'all 0.3s ease',
                                        boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
                                        display: 'flex', flexDirection: 'column',
                                        height: '240px'
                                    }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                                        <div style={{
                                            width: 56, height: 56, borderRadius: 14,
                                            background: app.bg, color: app.color,
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            boxShadow: `0 4px 12px ${app.color}20`
                                        }}>
                                            {app.icon}
                                        </div>
                                        {installed && (
                                            <div style={{
                                                display: 'flex', alignItems: 'center', gap: 4,
                                                padding: '4px 10px', borderRadius: 20,
                                                background: 'rgba(74, 222, 128, 0.1)', color: '#4ade80',
                                                fontSize: '0.75rem', fontWeight: 600
                                            }}>
                                                <Check size={14} /> Installed
                                            </div>
                                        )}
                                    </div>
                                    <h3 style={{ margin: '0 0 6px 0', fontSize: '1.2rem', fontWeight: 700, color: '#fff' }}>{app.name}</h3>
                                    <p style={{ margin: 0, color: '#a1a1aa', fontSize: '0.9rem', lineHeight: 1.5, flex: 1 }}>
                                        {app.description}
                                    </p>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 16, paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                                        <span style={{ fontSize: '0.8rem', color: '#71717a' }}>By {app.developer}</span>
                                        <button style={{
                                            background: installed ? 'rgba(255,255,255,0.05)' : app.color,
                                            color: installed ? '#fff' : '#000',
                                            border: installed ? '1px solid rgba(255,255,255,0.1)' : 'none',
                                            padding: '8px 16px', borderRadius: 8, fontSize: '0.85rem', fontWeight: 600,
                                            display: 'flex', alignItems: 'center', gap: 6, transition: 'all 0.2s',
                                            boxShadow: installed ? 'none' : `0 4px 12px ${app.color}40`
                                        }}>
                                            {installed ? <Settings2 size={16} /> : <Plus size={16} />}
                                            {installed ? 'Configure' : 'Install'}
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    {filteredApps.length === 0 && (
                        <div style={{ textAlign: 'center', padding: '60px', color: '#71717a' }}>
                            <Zap size={48} style={{ opacity: 0.2, marginBottom: 16 }} />
                            <h3 style={{ margin: '0 0 8px 0', color: '#e4e4e7' }}>No apps found</h3>
                            <p style={{ margin: 0 }}>Try adjusting your search or category filter.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal Overlay for App Configuration */}
            {selectedApp && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', zIndex: 1000,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    padding: 24
                }}>
                    <div style={{
                        background: '#141419', border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: 24, width: '100%', maxWidth: 540, overflow: 'hidden',
                        boxShadow: '0 24px 48px rgba(0,0,0,0.5)'
                    }}>
                        {/* Modal Header */}
                        {(() => {
                            const app = APP_CATALOG.find(a => a.id === selectedApp)!;
                            const installed = isInstalled(app.id);
                            return (
                                <>
                                    <div style={{ padding: '24px 32px', borderBottom: '1px solid rgba(255,255,255,0.06)', position: 'relative' }}>
                                        <button onClick={() => setSelectedApp(null)} style={{
                                            position: 'absolute', right: 24, top: 24, background: 'rgba(255,255,255,0.05)',
                                            border: 'none', color: '#a1a1aa', borderRadius: '50%', width: 32, height: 32,
                                            display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
                                        }}><X size={16} /></button>

                                        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                                            <div style={{
                                                width: 48, height: 48, borderRadius: 12,
                                                background: app.bg, color: app.color, display: 'flex', alignItems: 'center', justifyContent: 'center'
                                            }}>
                                                {app.icon}
                                            </div>
                                            <div>
                                                <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 700, color: '#fff' }}>{installed ? 'Configure' : 'Install'} {app.name}</h2>
                                                <p style={{ margin: '4px 0 0 0', color: '#a1a1aa', fontSize: '0.9rem' }}>{app.description}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Modal Body */}
                                    <div style={{ padding: '32px' }}>
                                        {selectedApp === 'crisp' && (
                                            <div>
                                                <label style={{ display: 'block', marginBottom: 8, fontSize: '0.9rem', color: '#e4e4e7', fontWeight: 500 }}>Crisp Website ID</label>
                                                <input
                                                    type="text"
                                                    value={crispWebsiteId}
                                                    onChange={(e) => setCrispWebsiteId(e.target.value)}
                                                    placeholder="e.g. 1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d"
                                                    style={{ width: '100%', padding: '14px 16px', background: 'rgba(0, 0, 0, 0.3)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: 12, color: '#fff', fontSize: '1rem', boxSizing: 'border-box' }}
                                                />
                                                <p style={{ color: '#71717a', fontSize: '0.85rem', marginTop: 12, lineHeight: 1.5 }}>
                                                    Find your Website ID in your Crisp dashboard settings under Workspace Settings &gt; Setup Instructions.
                                                </p>
                                            </div>
                                        )}
                                        {selectedApp === 'discord' && (
                                            <div>
                                                <label style={{ display: 'block', marginBottom: 8, fontSize: '0.9rem', color: '#e4e4e7', fontWeight: 500 }}>Discord Server ID</label>
                                                <input
                                                    type="text"
                                                    value={discordServerId}
                                                    onChange={(e) => setDiscordServerId(e.target.value)}
                                                    placeholder="e.g. 123456789012345678"
                                                    style={{ width: '100%', padding: '14px 16px', background: 'rgba(0, 0, 0, 0.3)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: 12, color: '#fff', fontSize: '1rem', boxSizing: 'border-box' }}
                                                />
                                                <p style={{ color: '#71717a', fontSize: '0.85rem', marginTop: 12, lineHeight: 1.5 }}>
                                                    Enable the widget in Discord Server Settings &gt; Widget and copy the Server ID.
                                                </p>
                                            </div>
                                        )}
                                        {selectedApp === 'telegram' && (
                                            <div>
                                                <label style={{ display: 'block', marginBottom: 8, fontSize: '0.9rem', color: '#e4e4e7', fontWeight: 500 }}>Telegram Username</label>
                                                <input
                                                    type="text"
                                                    value={telegramUsername}
                                                    onChange={(e) => setTelegramUsername(e.target.value)}
                                                    placeholder="e.g. your_username (without @)"
                                                    style={{ width: '100%', padding: '14px 16px', background: 'rgba(0, 0, 0, 0.3)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: 12, color: '#fff', fontSize: '1rem', boxSizing: 'border-box' }}
                                                />
                                                <p style={{ color: '#71717a', fontSize: '0.85rem', marginTop: 12, lineHeight: 1.5 }}>
                                                    Enter your Telegram username. A floating chat button will appear in the bottom right of your store, directing customers to message you.
                                                </p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Modal Footer */}
                                    <div style={{ padding: '24px 32px', background: 'rgba(0,0,0,0.2)', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        {installed && (
                                            <button
                                                onClick={handleUninstall}
                                                style={{ background: 'transparent', border: 'none', color: '#ef4444', fontWeight: 600, cursor: 'pointer', padding: '8px 0' }}
                                            >
                                                Uninstall App
                                            </button>
                                        )}
                                        <div style={{ display: 'flex', gap: 12, marginLeft: installed ? 0 : 'auto' }}>
                                            <button onClick={() => setSelectedApp(null)} style={{
                                                background: 'rgba(255,255,255,0.05)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)',
                                                padding: '10px 20px', borderRadius: 10, fontWeight: 600, cursor: 'pointer'
                                            }}>Cancel</button>
                                            <button onClick={handleSave} style={{
                                                background: app.color, color: '#000', border: 'none',
                                                padding: '10px 20px', borderRadius: 10, fontWeight: 700, cursor: 'pointer',
                                                display: 'flex', alignItems: 'center', gap: 8, boxShadow: `0 4px 14px ${app.color}40`
                                            }}>
                                                {installed ? <Save size={18} /> : <Check size={18} />}
                                                {installed ? 'Save Settings' : 'Install App'}
                                            </button>
                                        </div>
                                    </div>
                                </>
                            );
                        })()}
                    </div>
                </div>
            )}
        </div>
    );
};

export default AppStore;
