import React, { useState } from 'react';
import { useStore } from '../../../context/StoreContext';
import { useToast } from '../../../context/ToastContext';
import { Save, RefreshCw, Image, Eye, X, Sparkles } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

/* ─── Shared Glassmorphism Styles ─── */
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

const CustomizeStore: React.FC = () => {
    const { settings, updateSettings } = useStore();
    const { addToast } = useToast();
    const [isSaving, setIsSaving] = useState(false);
    const [showPopupPreview, setShowPopupPreview] = useState(false);

    const [localSettings, setLocalSettings] = useState(settings);

    const handleChange = (field: keyof typeof settings, value: any) => {
        setLocalSettings(prev => ({ ...prev, [field]: value }));
    };

    const handleNestedChange = (parent: 'seo' | 'storePopup' | 'socials' | 'purchaseAlerts', field: string, value: any) => {
        setLocalSettings((prev: any) => ({
            ...prev,
            [parent]: {
                ...prev[parent],
                [field]: value
            }
        }));
    };

    const handleSave = () => {
        setIsSaving(true);
        updateSettings(localSettings);
        setTimeout(() => {
            setIsSaving(false);
            addToast("Store customizations saved successfully!", 'success');
        }, 600);
    };

    return (
        <div style={{ maxWidth: 1000, margin: '0 auto', paddingBottom: 60 }}>
            {/* Header Area */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 32 }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#71717a', fontSize: '0.85rem', marginBottom: 12 }}>
                        <span>⚙️ Store</span>
                        <span style={{ fontSize: '10px' }}>▶</span>
                        <span style={{ color: '#a1a1aa' }}>Customize Store</span>
                    </div>
                    <h1 style={{
                        fontSize: '1.8rem', fontWeight: 800, margin: 0,
                        background: 'linear-gradient(135deg, #ffffff 0%, #a1a1aa 100%)',
                        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                    }}>
                        Customize Store
                    </h1>
                </div>
                <button
                    onClick={handleSave}
                    disabled={isSaving}
                    style={{ ...btnPrimary, background: isSaving ? '#3f51b5' : 'var(--primary-color)' }}
                >
                    {isSaving ? <RefreshCw size={18} className="spin" /> : <Save size={18} />}
                    {isSaving ? 'Saving...' : 'Update Store'}
                </button>
            </div>

            {/* Maintenance Mode Prominent Card */}
            <div style={{
                ...cardStyle,
                background: localSettings.maintenanceMode ? 'rgba(239, 68, 68, 0.1)' : 'rgba(20, 20, 25, 0.6)',
                border: localSettings.maintenanceMode ? '1px solid rgba(239, 68, 68, 0.3)' : cardStyle.border,
                display: 'flex', alignItems: 'center', justifyContent: 'space-between'
            }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: localSettings.maintenanceMode ? '#fca5a5' : '#fff', margin: 0 }}>Maintenance Mode</h3>
                        {localSettings.maintenanceMode && <span style={{ background: '#ef4444', color: '#fff', fontSize: '0.7rem', fontWeight: 800, padding: '2px 8px', borderRadius: 12, textTransform: 'uppercase' }}>ACTIVE</span>}
                    </div>
                    <p style={{ fontSize: '0.85rem', color: localSettings.maintenanceMode ? '#f87171' : '#a1a1aa', margin: 0 }}>
                        {localSettings.maintenanceMode
                            ? 'Your store is currently offline. Only administrators can view the storefront.'
                            : 'Enable this to temporarily hide your store from the public while you make updates.'}
                    </p>
                </div>
                <Toggle on={localSettings.maintenanceMode} onToggle={() => handleChange('maintenanceMode', !localSettings.maintenanceMode)} size={52} />
            </div>

            {/* Store Settings Toggles */}
            <div style={cardStyle}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 600, color: '#fff', marginBottom: 4 }}>Store Settings</h3>
                <p style={{ fontSize: '0.85rem', color: '#a1a1aa', margin: 0, marginBottom: 24 }}>Enable or disable options for your store according to your needs.</p>

                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: '20px' }}>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: 'rgba(0,0,0,0.2)', borderRadius: 10, border: '1px solid rgba(255,255,255,0.05)' }}>
                        <span style={{ fontSize: '0.9rem', color: '#e4e4e7', fontWeight: 500 }}>Automatic Feedback</span>
                        <Toggle on={localSettings.automaticFeedback || false} onToggle={() => handleChange('automaticFeedback', !localSettings.automaticFeedback)} size={36} />
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: 'rgba(0,0,0,0.2)', borderRadius: 10, border: '1px solid rgba(255,255,255,0.05)' }}>
                        <span style={{ fontSize: '0.9rem', color: '#e4e4e7', fontWeight: 500 }}>Show Products Sold</span>
                        <Toggle on={localSettings.productsSold} onToggle={() => handleChange('productsSold', !localSettings.productsSold)} size={36} />
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: 'rgba(0,0,0,0.2)', borderRadius: 10, border: '1px solid rgba(255,255,255,0.05)' }}>
                        <span style={{ fontSize: '0.9rem', color: '#e4e4e7', fontWeight: 500 }}>Purchase Alerts</span>
                        <Toggle
                            on={typeof localSettings.purchaseAlerts === 'object' ? localSettings.purchaseAlerts.enabled : localSettings.purchaseAlerts}
                            onToggle={() => {
                                const isEnabled = typeof localSettings.purchaseAlerts === 'object' ? localSettings.purchaseAlerts.enabled : localSettings.purchaseAlerts;
                                if (typeof localSettings.purchaseAlerts !== 'object') {
                                    handleChange('purchaseAlerts', { enabled: !isEnabled, names: 'Mikki, Alex', products: 'Premium Subscription' });
                                } else {
                                    handleNestedChange('purchaseAlerts', 'enabled', !isEnabled);
                                }
                            }}
                            size={36}
                        />
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: 'rgba(0,0,0,0.2)', borderRadius: 10, border: '1px solid rgba(255,255,255,0.05)' }}>
                        <span style={{ fontSize: '0.9rem', color: '#e4e4e7', fontWeight: 500 }}>Hide Sold Out Products</span>
                        <Toggle on={localSettings.hideSoldOutProducts || false} onToggle={() => handleChange('hideSoldOutProducts', !localSettings.hideSoldOutProducts)} size={36} />
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: 'rgba(0,0,0,0.2)', borderRadius: 10, border: '1px solid rgba(255,255,255,0.05)' }}>
                        <span style={{ fontSize: '0.9rem', color: '#e4e4e7', fontWeight: 500 }}>Allow Checking Out With A VPN</span>
                        <Toggle on={localSettings.allowVpnCheckout || false} onToggle={() => handleChange('allowVpnCheckout', !localSettings.allowVpnCheckout)} size={36} />
                    </div>
                </div>
            </div>

            {/* Store Information */}
            <div style={cardStyle}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 600, color: '#fff', marginBottom: 4 }}>Store Information</h3>
                <p style={{ fontSize: '0.85rem', color: '#a1a1aa', margin: 0, marginBottom: 24 }}>Enter information of your store.</p>

                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: '20px' }}>
                    <div>
                        <label style={{ fontSize: '0.85rem', color: '#a1a1aa', fontWeight: 500, display: 'block', marginBottom: 8 }}>Store Name</label>
                        <input
                            value={localSettings.storeName}
                            onChange={(e) => handleChange('storeName', e.target.value)}
                            style={inputStyle}
                            placeholder="Enter store name"
                        />
                    </div>

                    <div>
                        <label style={{ fontSize: '0.85rem', color: '#a1a1aa', fontWeight: 500, display: 'block', marginBottom: 8 }}>Store Accent Color</label>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', ...inputStyle, padding: '6px 14px' }}>
                            <div style={{
                                width: 28, height: 28, borderRadius: 6, background: localSettings.accentColor, cursor: 'pointer',
                                border: '1px solid rgba(255,255,255,0.2)', overflow: 'hidden', position: 'relative'
                            }}>
                                <input
                                    type="color"
                                    value={localSettings.accentColor}
                                    onChange={(e) => handleChange('accentColor', e.target.value)}
                                    style={{
                                        position: 'absolute', top: -10, left: -10, width: 60, height: 60,
                                        cursor: 'pointer', opacity: 0
                                    }}
                                />
                            </div>
                            <span style={{ fontFamily: 'monospace', textTransform: 'uppercase', color: '#e4e4e7' }}>{localSettings.accentColor}</span>
                        </div>
                    </div>

                    <div>
                        <label style={{ fontSize: '0.85rem', color: '#a1a1aa', fontWeight: 500, display: 'block', marginBottom: 8 }}>Store Subdomain</label>
                        <input
                            value={localSettings.subdomain}
                            onChange={(e) => handleChange('subdomain', e.target.value)}
                            style={inputStyle}
                            placeholder="Enter store subdomain"
                        />
                    </div>

                    <div>
                        <label style={{ fontSize: '0.85rem', color: '#a1a1aa', fontWeight: 500, display: 'block', marginBottom: 8 }}>Support Email</label>
                        <input
                            value={localSettings.email}
                            onChange={(e) => handleChange('email', e.target.value)}
                            style={inputStyle}
                            placeholder="Enter support email"
                        />
                    </div>
                </div>
                {/* Store Announcement */}
                <div style={cardStyle}>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 600, color: '#fff', marginBottom: 4 }}>Store Announcement</h3>
                    <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
                        <div style={{ background: 'rgba(79, 104, 248, 0.2)', color: 'var(--primary-color)', padding: '2px 8px', borderRadius: 4, fontSize: '0.75rem', fontWeight: 600 }}>MARKDOWN SUPPORTED</div>
                    </div>

                    <div style={{
                        background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, overflow: 'hidden'
                    }}>
                        {/* Fake Editor Toolbar */}
                        <div style={{ display: 'flex', gap: 12, padding: '10px 14px', borderBottom: '1px solid rgba(255,255,255,0.08)', color: '#a1a1aa' }}>
                            <span style={{ cursor: 'pointer', fontWeight: 600 }}>B</span>
                            <span style={{ cursor: 'pointer', fontStyle: 'italic' }}>I</span>
                            <span style={{ cursor: 'pointer', textDecoration: 'line-through' }}>S</span>
                            <div style={{ width: 1, height: 20, background: 'rgba(255,255,255,0.1)' }} />
                            <span style={{ cursor: 'pointer' }}>🔗</span>
                            <span style={{ cursor: 'pointer' }}>📷</span>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
                            <textarea
                                value={localSettings.announcementText || ''}
                                onChange={(e) => handleChange('announcementText', e.target.value)}
                                placeholder="Write your store announcement here..."
                                style={{
                                    width: '100%', height: 200, background: 'transparent', border: 'none', color: '#fff',
                                    padding: '16px', fontSize: '0.9rem', outline: 'none', resize: 'vertical', fontFamily: 'monospace',
                                    borderRight: '1px solid rgba(255,255,255,0.08)'
                                }}
                            />
                            <div style={{ padding: '16px', background: 'rgba(0,0,0,0.4)', height: 200, overflowY: 'auto' }}>
                                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#a1a1aa', marginBottom: 8, letterSpacing: 1 }}>LIVE PREVIEW</div>
                                <div style={{
                                    background: 'linear-gradient(90deg, var(--primary-color) 0%, var(--secondary-color) 100%)',
                                    padding: '8px 12px', borderRadius: 8, color: '#fff', fontSize: '0.85rem', fontWeight: 500, textAlign: 'center'
                                }}>
                                    <ReactMarkdown
                                        components={{
                                            p: ({ node, ...props }: any) => <span style={{ margin: 0, padding: 0 }} {...props} />,
                                            a: ({ node, ...props }: any) => <a style={{ color: '#fff', textDecoration: 'underline', fontWeight: 600 }} {...props} />
                                        }}
                                    >
                                        {localSettings.announcementText || ''}
                                    </ReactMarkdown>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Store Popup */}
                <div style={cardStyle}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
                        <h3 style={{ fontSize: '1.05rem', fontWeight: 600, color: '#fff', margin: 0 }}>Store Popup</h3>
                        <div style={{ background: 'rgba(234, 179, 8, 0.2)', color: '#eab308', padding: '2px 8px', borderRadius: 4, fontSize: '0.75rem', fontWeight: 600 }}>NEW</div>
                    </div>
                    <p style={{ fontSize: '0.85rem', color: '#a1a1aa', margin: 0, marginBottom: 24 }}>Notify your visitors with a popup.</p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', background: 'rgba(0,0,0,0.2)', borderRadius: 10, border: '1px solid rgba(255,255,255,0.05)' }}>
                            <div>
                                <span style={{ fontSize: '0.95rem', color: '#e4e4e7', fontWeight: 600, display: 'block' }}>Enable Popup</span>
                                <span style={{ fontSize: '0.8rem', color: '#a1a1aa' }}>Show a popup to all new visitors.</span>
                            </div>
                            <Toggle on={localSettings.storePopup?.enabled || false} onToggle={() => handleNestedChange('storePopup', 'enabled', !(localSettings.storePopup?.enabled))} size={44} />
                        </div>

                        {(localSettings.storePopup?.enabled) && (
                            <div style={{ animation: 'fadeIn 0.2s ease' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                                    <label style={{ fontSize: '0.85rem', color: '#a1a1aa', fontWeight: 500, display: 'block' }}>Popup Message</label>
                                    <button
                                        onClick={() => setShowPopupPreview(true)}
                                        style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', padding: '4px 12px', borderRadius: 6, fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
                                    >
                                        <Eye size={14} /> Preview Popup
                                    </button>
                                </div>
                                <textarea
                                    value={localSettings.storePopup.message}
                                    onChange={(e) => handleNestedChange('storePopup', 'message', e.target.value)}
                                    style={{ ...inputStyle, height: 100, resize: 'vertical' }}
                                    placeholder="Enter popup message..."
                                />
                            </div>
                        )}
                    </div>
                </div>

                {/* The Fullscreen Preview Modal */}
                {showPopupPreview && (
                    <div style={{
                        position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
                        background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999999
                    }}>
                        <div style={{
                            background: 'rgba(20, 20, 25, 0.95)', border: '1px solid rgba(255, 255, 255, 0.1)',
                            borderRadius: 20, padding: '40px', maxWidth: 440, width: '90%', textAlign: 'center',
                            boxShadow: '0 24px 48px rgba(0,0,0,0.5)', position: 'relative'
                        }}>
                            <button
                                onClick={() => setShowPopupPreview(false)}
                                style={{
                                    position: 'absolute', top: 16, right: 16, background: 'rgba(255,255,255,0.05)', border: 'none',
                                    color: '#a1a1aa', width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
                                }}
                            >
                                <X size={16} />
                            </button>

                            <div style={{
                                width: 64, height: 64, borderRadius: '50%', background: 'rgba(var(--primary-color-rgb, 139, 92, 246), 0.1)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px',
                                border: '1px solid rgba(255,255,255, 0.1)', color: 'var(--primary-color)'
                            }}>
                                <Sparkles size={32} />
                            </div>

                            <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#fff', margin: '0 0 16px', letterSpacing: '-0.5px' }}>
                                Welcome to {localSettings.storeName}
                            </h2>

                            <p style={{ fontSize: '1rem', color: '#a1a1aa', margin: '0 0 32px', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                                {localSettings.storePopup?.message}
                            </p>

                            <button onClick={() => setShowPopupPreview(false)} style={{
                                background: 'var(--primary-color)', color: '#fff', border: 'none', padding: '14px 24px', borderRadius: 12, fontSize: '1rem', fontWeight: 600, width: '100%', cursor: 'pointer'
                            }}>
                                Close Preview
                            </button>
                        </div>
                    </div>
                )}

                {/* Purchase Alerts Module */}
                <div style={cardStyle}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
                        <h3 style={{ fontSize: '1.05rem', fontWeight: 600, color: '#fff', margin: 0 }}>Purchase Alerts Configuration</h3>
                        <div style={{ background: 'rgba(79, 104, 248, 0.2)', color: 'var(--primary-color)', padding: '2px 8px', borderRadius: 4, fontSize: '0.75rem', fontWeight: 600 }}>CUSTOMIZABLE</div>
                    </div>
                    <p style={{ fontSize: '0.85rem', color: '#a1a1aa', margin: 0, marginBottom: 24 }}>Customize the names and products displayed in the recent purchase popup.</p>

                    {(typeof localSettings.purchaseAlerts === 'object' && localSettings.purchaseAlerts.enabled) ? (
                        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: '20px', animation: 'fadeIn 0.2s ease' }}>
                            <div>
                                <label style={{ fontSize: '0.85rem', color: '#a1a1aa', fontWeight: 500, display: 'block', marginBottom: 8 }}>Mock Buyer Names (Comma Separated)</label>
                                <textarea
                                    value={localSettings.purchaseAlerts.names || ''}
                                    onChange={(e) => handleNestedChange('purchaseAlerts', 'names', e.target.value)}
                                    style={{ ...inputStyle, height: 100, resize: 'vertical' }}
                                    placeholder="e.g. Alex, Sam, Taylor"
                                />
                            </div>
                            <div>
                                <label style={{ fontSize: '0.85rem', color: '#a1a1aa', fontWeight: 500, display: 'block', marginBottom: 8 }}>Mock Products (Comma Separated)</label>
                                <textarea
                                    value={localSettings.purchaseAlerts.products || ''}
                                    onChange={(e) => handleNestedChange('purchaseAlerts', 'products', e.target.value)}
                                    style={{ ...inputStyle, height: 100, resize: 'vertical' }}
                                    placeholder="e.g. Lifetime License, API Access"
                                />
                            </div>
                        </div>
                    ) : (
                        <div style={{ color: '#a1a1aa', fontSize: '0.85rem' }}>Enable "Purchase Alerts" in Store Settings to customize.</div>
                    )}
                </div>

                {/* Images Module */}
                <div style={cardStyle}>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 600, color: '#fff', marginBottom: 4 }}>Images</h3>
                    <p style={{ fontSize: '0.85rem', color: '#a1a1aa', margin: 0, marginBottom: 24 }}>Upload images for your store's branding.</p>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>

                        {/* Background Image */}
                        <div>
                            <label style={{ fontSize: '0.85rem', color: '#a1a1aa', fontWeight: 500, display: 'block', marginBottom: 8 }}>Background Image URL</label>
                            <div style={{
                                border: '1px dashed rgba(255,255,255,0.2)', borderRadius: 12, padding: 24, textAlign: 'center',
                                background: localSettings.bannerUrl ? `linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url(${localSettings.bannerUrl})` : 'rgba(0,0,0,0.2)',
                                backgroundSize: 'cover', backgroundPosition: 'center', cursor: 'pointer', transition: 'all 0.2s', position: 'relative'
                            }}>
                                <Image size={24} color="#a1a1aa" style={{ margin: '0 auto 8px' }} />
                                <div style={{ fontSize: '0.85rem', color: '#e4e4e7', fontWeight: 500 }}>Upload Background</div>
                                <div style={{ fontSize: '0.7rem', color: '#a1a1aa', marginTop: 4 }}>1920x1080px</div>
                                <input
                                    value={localSettings.bannerUrl}
                                    onChange={(e) => handleChange('bannerUrl', e.target.value)}
                                    placeholder="Paste Image URL..."
                                    style={{ ...inputStyle, background: 'rgba(0,0,0,0.6)', marginTop: 12, border: '1px solid rgba(255,255,255,0.1)' }}
                                />
                            </div>
                        </div>

                        {/* Logo/Icon Image */}
                        <div>
                            <label style={{ fontSize: '0.85rem', color: '#a1a1aa', fontWeight: 500, display: 'block', marginBottom: 8 }}>Store Logo URL</label>
                            <div style={{
                                border: '1px dashed rgba(255,255,255,0.2)', borderRadius: 12, padding: 24, textAlign: 'center',
                                background: localSettings.logoUrl ? `linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url(${localSettings.logoUrl})` : 'rgba(0,0,0,0.2)',
                                backgroundSize: 'cover', backgroundPosition: 'center', cursor: 'pointer', transition: 'all 0.2s', position: 'relative'
                            }}>
                                <Image size={24} color="#a1a1aa" style={{ margin: '0 auto 8px' }} />
                                <div style={{ fontSize: '0.85rem', color: '#e4e4e7', fontWeight: 500 }}>Upload Logo</div>
                                <div style={{ fontSize: '0.7rem', color: '#a1a1aa', marginTop: 4 }}>500x500px</div>
                                <input
                                    value={localSettings.logoUrl}
                                    onChange={(e) => handleChange('logoUrl', e.target.value)}
                                    placeholder="Paste Image URL..."
                                    style={{ ...inputStyle, background: 'rgba(0,0,0,0.6)', marginTop: 12, border: '1px solid rgba(255,255,255,0.1)' }}
                                />
                            </div>
                        </div>

                        {/* Favicon Image */}
                        <div>
                            <label style={{ fontSize: '0.85rem', color: '#a1a1aa', fontWeight: 500, display: 'block', marginBottom: 8 }}>Favicon URL</label>
                            <div style={{
                                border: '1px dashed rgba(255,255,255,0.2)', borderRadius: 12, padding: 24, textAlign: 'center',
                                background: localSettings.faviconUrl ? `linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url(${localSettings.faviconUrl})` : 'rgba(0,0,0,0.2)',
                                backgroundSize: 'cover', backgroundPosition: 'center', cursor: 'pointer', transition: 'all 0.2s', position: 'relative'
                            }}>
                                <Image size={24} color="#a1a1aa" style={{ margin: '0 auto 8px' }} />
                                <div style={{ fontSize: '0.85rem', color: '#e4e4e7', fontWeight: 500 }}>Upload Favicon</div>
                                <div style={{ fontSize: '0.7rem', color: '#a1a1aa', marginTop: 4 }}>64x64px</div>
                                <input
                                    value={localSettings.faviconUrl || ''}
                                    onChange={(e) => handleChange('faviconUrl', e.target.value)}
                                    placeholder="Paste Image URL..."
                                    style={{ ...inputStyle, background: 'rgba(0,0,0,0.6)', marginTop: 12, border: '1px solid rgba(255,255,255,0.1)' }}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Store Social Connections */}
                <div style={cardStyle}>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 600, color: '#fff', marginBottom: 4 }}>Store Social Connections</h3>
                    <p style={{ fontSize: '0.85rem', color: '#a1a1aa', margin: 0, marginBottom: 24 }}>Connect social media accounts to your store.</p>

                    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: '16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <div style={{ width: 100, fontSize: '0.85rem', color: '#e4e4e7', fontWeight: 500 }}>Discord</div>
                            <input value={localSettings.socials?.discord || ''} onChange={(e) => handleNestedChange('socials', 'discord', e.target.value)} placeholder="Discord Invite URL" style={inputStyle} />
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <div style={{ width: 100, fontSize: '0.85rem', color: '#e4e4e7', fontWeight: 500 }}>Telegram</div>
                            <input value={localSettings.socials?.telegram || ''} onChange={(e) => handleNestedChange('socials', 'telegram', e.target.value)} placeholder="Telegram Invite URL" style={inputStyle} />
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <div style={{ width: 100, fontSize: '0.85rem', color: '#e4e4e7', fontWeight: 500 }}>YouTube</div>
                            <input value={localSettings.socials?.youtube || ''} onChange={(e) => handleNestedChange('socials', 'youtube', e.target.value)} placeholder="YouTube Channel URL" style={inputStyle} />
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <div style={{ width: 100, fontSize: '0.85rem', color: '#e4e4e7', fontWeight: 500 }}>TikTok</div>
                            <input value={localSettings.socials?.tiktok || ''} onChange={(e) => handleNestedChange('socials', 'tiktok', e.target.value)} placeholder="TikTok Profile URL" style={inputStyle} />
                        </div>
                    </div>
                </div>

                {/* Store Policy */}
                <div style={cardStyle}>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 600, color: '#fff', marginBottom: 4 }}>Store Policy</h3>
                    <p style={{ fontSize: '0.85rem', color: '#a1a1aa', margin: 0, marginBottom: 24 }}>Customize your Terms of Service.</p>
                    <textarea
                        value={localSettings.termsOfService || ''}
                        onChange={(e) => handleChange('termsOfService', e.target.value)}
                        placeholder="Enter Terms of Service..."
                        style={{ ...inputStyle, height: 150, resize: 'vertical' }}
                    />
                </div>

                {/* Metadata and SEO Preview */}
                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: '20px' }}>
                    <div style={cardStyle}>
                        <h3 style={{ fontSize: '1.05rem', fontWeight: 600, color: '#fff', marginBottom: 4 }}>Metadata</h3>
                        <p style={{ fontSize: '0.85rem', color: '#a1a1aa', margin: 0, marginBottom: 24 }}>Information that search engines read.</p>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            <div>
                                <label style={{ fontSize: '0.85rem', color: '#a1a1aa', fontWeight: 500, display: 'block', marginBottom: 8 }}>Meta Title</label>
                                <input value={localSettings.seo?.title || ''} onChange={(e) => handleNestedChange('seo', 'title', e.target.value)} style={inputStyle} />
                            </div>
                            <div>
                                <label style={{ fontSize: '0.85rem', color: '#a1a1aa', fontWeight: 500, display: 'block', marginBottom: 8 }}>Meta Description</label>
                                <textarea
                                    value={localSettings.seo?.description || ''}
                                    onChange={(e) => handleNestedChange('seo', 'description', e.target.value)}
                                    style={{ ...inputStyle, height: 100, resize: 'none' }}
                                />
                            </div>
                        </div>
                    </div>

                    <div style={cardStyle}>
                        <h3 style={{ fontSize: '1.05rem', fontWeight: 600, color: '#fff', marginBottom: 4 }}>Previews</h3>
                        <p style={{ fontSize: '0.85rem', color: '#a1a1aa', margin: 0, marginBottom: 24 }}>How your store appears externally.</p>

                        {/* Google Search Mockup */}
                        <div style={{ marginBottom: 20 }}>
                            <span style={{ fontSize: '0.85rem', color: '#e4e4e7', fontWeight: 600, display: 'block', marginBottom: 8 }}>Google Search</span>
                            <div style={{ background: 'rgba(0,0,0,0.3)', padding: 16, borderRadius: 10, border: '1px solid rgba(255,255,255,0.05)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                                    <div style={{ width: 24, height: 24, borderRadius: '50%', background: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10 }}>🌐</div>
                                    <div>
                                        <div style={{ fontSize: '0.85rem', color: '#e4e4e7' }}>{localSettings.storeName}</div>
                                        <div style={{ fontSize: '0.75rem', color: '#a1a1aa' }}>https://{localSettings.subdomain}</div>
                                    </div>
                                </div>
                                <div style={{ fontSize: '1.1rem', color: 'var(--secondary-color)', margin: '4px 0', fontWeight: 500 }}>{localSettings.seo?.title || 'Store Title'}</div>
                                <div style={{ fontSize: '0.85rem', color: '#d4d4d8', lineHeight: 1.4, WebkitLineClamp: 2, display: '-webkit-box', WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{localSettings.seo?.description || 'Your store description will appear here on search engines.'}</div>
                            </div>
                        </div>

                        {/* Discord Embed Mockup */}
                        <div>
                            <span style={{ fontSize: '0.85rem', color: '#e4e4e7', fontWeight: 600, display: 'block', marginBottom: 8 }}>Discord Embed</span>
                            <div style={{ borderLeft: `4px solid ${localSettings.accentColor || 'var(--secondary-color)'}`, background: 'rgba(43, 45, 49, 0.4)', padding: 16, borderRadius: '0 10px 10px 0' }}>
                                <div style={{ fontSize: '0.8rem', color: '#a1a1aa', marginBottom: 4 }}>{localSettings.storeName}</div>
                                <div style={{ fontSize: '1rem', color: '#0ea5e9', fontWeight: 600, marginBottom: 4 }}>{localSettings.seo?.title || 'Store Title'}</div>
                                <div style={{ fontSize: '0.85rem', color: '#d4d4d8', lineHeight: 1.4 }}>{localSettings.seo?.description || 'Your store description will appear here on Discord embeds.'}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div> {/* <-- Main Container closing div */}
        </div> // <-- Entire page wrapper closing div
    );
};

export default CustomizeStore;
