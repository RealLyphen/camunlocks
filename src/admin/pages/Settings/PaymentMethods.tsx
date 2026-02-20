import React, { useState, useRef } from 'react';
import {
    CreditCard, Wallet, Bitcoin, Plus, Trash2, X,
    ChevronDown, ChevronRight, Copy, AlertTriangle,
    Check, Eye, EyeOff, Zap, Shield, Upload, ExternalLink,
    RefreshCw, Mail, Lock, Link, QrCode, Info, Search,
} from 'lucide-react';
import { useStore } from '../../../context/StoreContext';
import type { PaymentGateway, ManualPaymentMethod } from '../../../context/StoreContext';

/* ─── Shared Styles ─── */
const card: React.CSSProperties = {
    background: 'rgba(20, 20, 25, 0.6)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 16,
    padding: '20px 24px',
    transition: 'all 0.3s ease',
    marginBottom: 12,
};
const inp: React.CSSProperties = {
    width: '100%',
    background: 'rgba(0,0,0,0.4)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 10,
    padding: '10px 14px',
    color: '#fff',
    fontSize: '0.88rem',
    fontFamily: 'inherit',
    outline: 'none',
    transition: 'border-color 0.2s',
    boxSizing: 'border-box',
};
const label: React.CSSProperties = { fontSize: '0.78rem', color: '#a1a1aa', marginBottom: 6, display: 'block', fontWeight: 500 };
const grid2: React.CSSProperties = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 };
const btnSm = (color = 'rgba(255,255,255,0.06)'): React.CSSProperties => ({
    background: color, border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8,
    color: '#fff', padding: '8px 16px', fontSize: '0.82rem', fontWeight: 600,
    cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, transition: 'all 0.2s',
    fontFamily: 'inherit',
});
const primaryBtn: React.CSSProperties = {
    background: 'var(--primary-color)', color: '#fff', border: 'none',
    padding: '10px 20px', borderRadius: 10, fontWeight: 600, fontSize: '0.9rem',
    cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, transition: 'all 0.2s',
    fontFamily: 'inherit',
};

/* ─── Toggle ─── */
const Toggle: React.FC<{ on: boolean; onToggle: () => void }> = ({ on, onToggle }) => (
    <div onClick={onToggle} style={{
        width: 44, height: 24, borderRadius: 44,
        background: on ? 'var(--primary-color)' : 'rgba(255,255,255,0.1)',
        cursor: 'pointer', position: 'relative', transition: 'background 0.3s', flexShrink: 0,
    }}>
        <div style={{
            width: 18, height: 18, borderRadius: '50%', background: '#fff',
            position: 'absolute', top: 3,
            left: on ? 23 : 3, transition: 'left 0.3s',
            boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
        }} />
    </div>
);

/* ─── Masked Input ─── */
const SecretInput: React.FC<{ value: string; onChange: (v: string) => void; placeholder?: string; id?: string }> = ({ value, onChange, placeholder, id }) => {
    const [show, setShow] = useState(false);
    return (
        <div style={{ position: 'relative' }}>
            <input id={id} type={show ? 'text' : 'password'} value={value} onChange={e => onChange(e.target.value)}
                placeholder={placeholder} style={{ ...inp, paddingRight: 40 }} />
            <button onClick={() => setShow(s => !s)} style={{
                position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
                background: 'transparent', border: 'none', color: '#71717a', cursor: 'pointer', padding: 0,
            }}>
                {show ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
        </div>
    );
};

/* ─── Info Box ─── */
const InfoBox: React.FC<{ children: React.ReactNode; color?: string }> = ({ children, color = '#818cf8' }) => (
    <div style={{
        display: 'flex', gap: 10, alignItems: 'flex-start',
        padding: '10px 14px', borderRadius: 10,
        background: `${color}10`, border: `1px solid ${color}25`, marginBottom: 14,
    }}>
        <Info size={14} style={{ color, flexShrink: 0, marginTop: 2 }} />
        <span style={{ fontSize: '0.78rem', color: '#a1a1aa', lineHeight: 1.6 }}>{children}</span>
    </div>
);

/* ─── Copy Row ─── */
const CopyRow: React.FC<{ label: string; value: string }> = ({ label: lbl, value }) => (
    <div style={{ marginBottom: 14 }}>
        <div style={label}>{lbl}</div>
        <div style={{ display: 'flex', gap: 8 }}>
            <input value={value} readOnly style={{ ...inp, color: '#71717a', flex: 1 }} />
            <button onClick={() => navigator.clipboard.writeText(value)} style={btnSm()} title="Copy">
                <Copy size={14} />
            </button>
        </div>
    </div>
);

/* ─── QR Upload ─── */
const QrUpload: React.FC<{ value?: string; onChange: (base64: string) => void; label: string }> = ({ value, onChange, label: lbl }) => {
    const fileRef = useRef<HTMLInputElement>(null);
    const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
        const f = e.target.files?.[0];
        if (!f) return;
        const reader = new FileReader();
        reader.onload = () => onChange(reader.result as string);
        reader.readAsDataURL(f);
    };
    return (
        <div style={{ marginBottom: 14 }}>
            <div style={label}>{lbl}</div>
            <div style={{
                border: '2px dashed rgba(255,255,255,0.12)', borderRadius: 12,
                padding: 20, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12,
                cursor: 'pointer', transition: 'border-color 0.2s',
                background: 'rgba(255,255,255,0.02)',
            }} onClick={() => fileRef.current?.click()}>
                {value ? (
                    <img src={value} alt="QR" style={{ width: 120, height: 120, objectFit: 'contain', borderRadius: 8 }} />
                ) : (
                    <>
                        <QrCode size={40} style={{ color: '#52525b' }} />
                        <span style={{ fontSize: '0.82rem', color: '#71717a' }}>Click to upload QR code image</span>
                    </>
                )}
                <button style={btnSm()} onClick={e => { e.stopPropagation(); fileRef.current?.click(); }}>
                    <Upload size={14} /> {value ? 'Replace Image' : 'Upload QR'}
                </button>
            </div>
            <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} style={{ display: 'none' }} />
        </div>
    );
};

/* ─── Test Mode Banner ─── */
const TestModeBanner: React.FC<{ on: boolean; onToggle: () => void }> = ({ on, onToggle }) => (
    <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '10px 14px', borderRadius: 10, marginBottom: 14,
        background: on ? 'rgba(245,158,11,0.08)' : 'rgba(74,222,128,0.06)',
        border: `1px solid ${on ? 'rgba(245,158,11,0.2)' : 'rgba(74,222,128,0.15)'}`,
    }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Shield size={14} style={{ color: on ? '#f59e0b' : '#4ade80' }} />
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: on ? '#f59e0b' : '#4ade80' }}>
                {on ? 'Test / Sandbox Mode' : 'Live / Production Mode'}
            </span>
            <span style={{ fontSize: '0.75rem', color: '#71717a' }}>
                {on ? '— no real charges will be made' : '— real payments enabled'}
            </span>
        </div>
        <Toggle on={on} onToggle={onToggle} />
    </div>
);

/* ─── Gateway icon map ─── */
const gatewayIcons: Record<string, { icon: React.ReactNode; bg: string; accent: string }> = {
    'stripe': { icon: <span style={{ fontSize: '1.3rem' }}>💳</span>, bg: 'linear-gradient(135deg, #635BFF, #4B45C6)', accent: '#635BFF' },
    'paypal-p2p': { icon: <span style={{ fontSize: '1.3rem' }}>🅿️</span>, bg: 'linear-gradient(135deg, #003087, #009CDE)', accent: '#009CDE' },
    'paypal-api': { icon: <span style={{ fontSize: '1.3rem' }}>🅿️</span>, bg: 'linear-gradient(135deg, #003087, #009CDE)', accent: '#009CDE' },
    'square': { icon: <span style={{ fontSize: '1.3rem' }}>⬛</span>, bg: 'linear-gradient(135deg, #006AFF, #0050C5)', accent: '#006AFF' },
    'coinbase': { icon: <span style={{ fontSize: '1.3rem' }}>🪙</span>, bg: 'linear-gradient(135deg, #0052FF, #003BB5)', accent: '#0052FF' },
    'cashapp': { icon: <span style={{ fontSize: '1.3rem' }}>💲</span>, bg: 'linear-gradient(135deg, #00D632, #00A825)', accent: '#00D632' },
    'customer-balance': { icon: <span style={{ fontSize: '1.3rem' }}>👛</span>, bg: 'linear-gradient(135deg, #8B5CF6, #6D28D9)', accent: '#8B5CF6' },
    'flick': { icon: <span style={{ fontWeight: 900, fontSize: '1.1rem', color: '#fff' }}>F</span>, bg: 'linear-gradient(135deg, #007f31, #00b347)', accent: '#007f31' },
};

/* ══════════════════════════════════════════════
   PER-GATEWAY CONFIG PANELS
   ══════════════════════════════════════════════ */

const StripeConfig: React.FC<{ gw: PaymentGateway; update: (p: Partial<PaymentGateway>) => void }> = ({ gw, update }) => (
    <div>
        <TestModeBanner on={!!gw.testMode} onToggle={() => update({ testMode: !gw.testMode })} />
        <InfoBox>
            Get your API keys from the{' '}
            <a href="https://dashboard.stripe.com/apikeys" target="_blank" rel="noreferrer" style={{ color: '#818cf8' }}>
                Stripe Dashboard → Developers → API Keys
            </a>. Use <strong>test keys</strong> (pk_test_ / sk_test_) for sandbox mode.
        </InfoBox>
        <div style={grid2}>
            <div>
                <div style={label}>Publishable Key</div>
                <input value={gw.publishableKey || ''} onChange={e => update({ publishableKey: e.target.value })}
                    placeholder={gw.testMode ? 'pk_test_...' : 'pk_live_...'} style={inp} />
            </div>
            <div>
                <div style={label}>Secret Key</div>
                <SecretInput value={gw.secretKey || ''} onChange={v => update({ secretKey: v })}
                    placeholder={gw.testMode ? 'sk_test_...' : 'sk_live_...'} />
            </div>
        </div>
        <div style={{ marginBottom: 14 }}>
            <div style={label}>Webhook Signing Secret</div>
            <SecretInput value={gw.webhookSecret || ''} onChange={v => update({ webhookSecret: v })}
                placeholder="whsec_..." />
        </div>
        <CopyRow label="Webhook Endpoint URL (paste in Stripe Dashboard)" value={`https://api.yourstore.com/webhooks/stripe`} />
        <div style={{ marginBottom: 14 }}>
            <div style={label}>Accepted Payment Methods</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {['Visa', 'Mastercard', 'Amex', 'Discover', 'Apple Pay', 'Google Pay', 'Link'].map(opt => {
                    const active = gw.acceptedOptions?.includes(opt);
                    return (
                        <button key={opt} onClick={() => {
                            const cur = gw.acceptedOptions || [];
                            update({ acceptedOptions: active ? cur.filter(o => o !== opt) : [...cur, opt] });
                        }} style={{
                            padding: '5px 12px', borderRadius: 8, fontSize: '0.78rem', fontWeight: 500,
                            background: active ? 'rgba(99,91,255,0.15)' : 'rgba(255,255,255,0.04)',
                            color: active ? '#818cf8' : '#71717a',
                            border: `1px solid ${active ? 'rgba(99,91,255,0.3)' : 'rgba(255,255,255,0.08)'}`,
                            cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: 5,
                            fontFamily: 'inherit',
                        }}>
                            {active && <Check size={11} />}{opt}
                        </button>
                    );
                })}
            </div>
        </div>
        <a href="https://dashboard.stripe.com/test/payments" target="_blank" rel="noreferrer" style={{ ...btnSm(), textDecoration: 'none', display: 'inline-flex' }}>
            <ExternalLink size={13} /> Open Stripe Dashboard
        </a>
    </div>
);

const PayPalP2PConfig: React.FC<{ gw: PaymentGateway; update: (p: Partial<PaymentGateway>) => void }> = ({ gw, update }) => (
    <div>
        <InfoBox color="#009CDE">
            PayPal Friends &amp; Family (P2P) requires no API key. Customers are shown your PayPal.me link and QR code. Verification is manual or via email notifications.
        </InfoBox>
        <div style={grid2}>
            <div>
                <div style={label}>PayPal.me URL</div>
                <div style={{ position: 'relative' }}>
                    <Link size={13} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#71717a' }} />
                    <input value={gw.paypalMeUrl || ''} onChange={e => update({ paypalMeUrl: e.target.value })}
                        placeholder="https://paypal.me/yourname" style={{ ...inp, paddingLeft: 34 }} />
                </div>
            </div>
            <div>
                <div style={label}>Receiving Email</div>
                <div style={{ position: 'relative' }}>
                    <Mail size={13} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#71717a' }} />
                    <input value={gw.paypalEmail || ''} onChange={e => update({ paypalEmail: e.target.value })}
                        placeholder="you@paypal.com" style={{ ...inp, paddingLeft: 34 }} />
                </div>
            </div>
        </div>
        <QrUpload label="PayPal QR Code (shown to customers at checkout)" value={gw.paypalQrUrl} onChange={v => update({ paypalQrUrl: v })} />
    </div>
);

const PayPalAPIConfig: React.FC<{ gw: PaymentGateway; update: (p: Partial<PaymentGateway>) => void }> = ({ gw, update }) => (
    <div>
        <TestModeBanner on={!!gw.testMode} onToggle={() => update({ testMode: !gw.testMode })} />
        <InfoBox>
            Get your Client ID and Secret from{' '}
            <a href="https://developer.paypal.com/dashboard/applications" target="_blank" rel="noreferrer" style={{ color: '#818cf8' }}>
                PayPal Developer Dashboard → Apps &amp; Credentials
            </a>. Use <strong>Sandbox credentials</strong> for test mode.
        </InfoBox>
        <div style={grid2}>
            <div>
                <div style={label}>{gw.testMode ? 'Sandbox' : 'Live'} Client ID</div>
                <input value={gw.testMode ? (gw.paypalSandboxClientId || '') : (gw.paypalClientId || '')}
                    onChange={e => update(gw.testMode ? { paypalSandboxClientId: e.target.value } : { paypalClientId: e.target.value })}
                    placeholder="AXXXxxxxxxx..." style={inp} />
            </div>
            <div>
                <div style={label}>{gw.testMode ? 'Sandbox' : 'Live'} Secret</div>
                <SecretInput value={gw.secretKey || ''} onChange={v => update({ secretKey: v })}
                    placeholder="EXXXxxxxxxx..." />
            </div>
        </div>
        <CopyRow label="Return URL" value="https://yourstore.com/paypal/return" />
        <CopyRow label="Cancel URL" value="https://yourstore.com/paypal/cancel" />
        <a href="https://developer.paypal.com/dashboard" target="_blank" rel="noreferrer" style={{ ...btnSm(), textDecoration: 'none', display: 'inline-flex' }}>
            <ExternalLink size={13} /> Open PayPal Developer Dashboard
        </a>
    </div>
);

const SquareConfig: React.FC<{ gw: PaymentGateway; update: (p: Partial<PaymentGateway>) => void }> = ({ gw, update }) => (
    <div>
        <TestModeBanner on={!!gw.testMode} onToggle={() => update({ testMode: !gw.testMode })} />
        <InfoBox color="#006AFF">
            Get your credentials from the{' '}
            <a href="https://developer.squareup.com/apps" target="_blank" rel="noreferrer" style={{ color: '#60a5fa' }}>
                Square Developer Dashboard
            </a>. Use <strong>Sandbox Application ID</strong> and <strong>Sandbox Access Token</strong> for test mode.
        </InfoBox>
        <div style={grid2}>
            <div>
                <div style={label}>Application ID ({gw.testMode ? 'Sandbox' : 'Production'})</div>
                <input value={gw.testMode ? (gw.squareSandboxAppId || '') : (gw.squareAppId || '')}
                    onChange={e => update(gw.testMode ? { squareSandboxAppId: e.target.value } : { squareAppId: e.target.value })}
                    placeholder={gw.testMode ? 'sandbox-sq0idb-...' : 'sq0idp-...'} style={inp} />
            </div>
            <div>
                <div style={label}>Location ID</div>
                <input value={gw.squareLocationId || ''} onChange={e => update({ squareLocationId: e.target.value })}
                    placeholder="LXXXxxxxxxx" style={inp} />
            </div>
        </div>
        <div style={{ marginBottom: 14 }}>
            <div style={label}>Access Token ({gw.testMode ? 'Sandbox' : 'Production'})</div>
            <SecretInput value={gw.secretKey || ''} onChange={v => update({ secretKey: v })}
                placeholder={gw.testMode ? 'EAAAExxxxxxx (sandbox)' : 'EAAAExxxxxxx (prod)'} />
        </div>
        <CopyRow label="Webhook URL (register in Square Dashboard)" value="https://api.yourstore.com/webhooks/square" />
        <div style={{ marginBottom: 14 }}>
            <div style={label}>Webhook Signature Key</div>
            <SecretInput value={gw.webhookSecret || ''} onChange={v => update({ webhookSecret: v })}
                placeholder="sq_webhook_..." />
        </div>
        <a href="https://developer.squareup.com/apps" target="_blank" rel="noreferrer" style={{ ...btnSm(), textDecoration: 'none', display: 'inline-flex' }}>
            <ExternalLink size={13} /> Open Square Developer Dashboard
        </a>
    </div>
);

const CoinbaseConfig: React.FC<{ gw: PaymentGateway; update: (p: Partial<PaymentGateway>) => void }> = ({ gw, update }) => {
    const [testing, setTesting] = useState(false);
    const [testResult, setTestResult] = useState<'ok' | 'err' | null>(null);

    const testConnection = async () => {
        if (!gw.coinbaseApiKey) return;
        setTesting(true); setTestResult(null);
        try {
            const res = await fetch('https://api.commerce.coinbase.com/charges', {
                method: 'GET',
                headers: { 'X-CC-Api-Key': gw.coinbaseApiKey, 'X-CC-Version': '2018-03-22' },
            });
            setTestResult(res.ok ? 'ok' : 'err');
        } catch { setTestResult('err'); }
        setTesting(false);
    };

    return (
        <div>
            <InfoBox color="#0052FF">
                Get your API key from{' '}
                <a href="https://commerce.coinbase.com/settings/security" target="_blank" rel="noreferrer" style={{ color: '#60a5fa' }}>
                    Coinbase Commerce → Settings → Security
                </a>. The Coinbase Commerce API key can be validated directly from the browser.
            </InfoBox>
            <div style={{ marginBottom: 14 }}>
                <div style={label}>Coinbase Commerce API Key</div>
                <SecretInput value={gw.coinbaseApiKey || ''} onChange={v => update({ coinbaseApiKey: v })} placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx" />
            </div>
            <div style={{ marginBottom: 14 }}>
                <div style={label}>Webhook Shared Secret</div>
                <SecretInput value={gw.coinbaseWebhookSecret || ''} onChange={v => update({ coinbaseWebhookSecret: v })} placeholder="xxxxxxxxxxxxxxxx" />
            </div>
            <CopyRow label="Webhook URL (register in Coinbase Commerce → Settings → Webhook)" value="https://api.yourstore.com/webhooks/coinbase" />
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                <button onClick={testConnection} disabled={!gw.coinbaseApiKey || testing} style={btnSm('rgba(0,82,255,0.12)')}>
                    {testing ? <RefreshCw size={13} style={{ animation: 'spin 1s linear infinite' }} /> : <Zap size={13} />}
                    Test API Key
                </button>
                {testResult === 'ok' && <span style={{ fontSize: '0.8rem', color: '#4ade80', display: 'flex', alignItems: 'center', gap: 5 }}><Check size={13} /> Connected successfully!</span>}
                {testResult === 'err' && <span style={{ fontSize: '0.8rem', color: '#f87171', display: 'flex', alignItems: 'center', gap: 5 }}><X size={13} /> Invalid API key</span>}
            </div>
            <a href="https://commerce.coinbase.com" target="_blank" rel="noreferrer" style={{ ...btnSm(), textDecoration: 'none', display: 'inline-flex' }}>
                <ExternalLink size={13} /> Open Coinbase Commerce
            </a>
        </div>
    );
};

const CashAppConfig: React.FC<{ gw: PaymentGateway; update: (p: Partial<PaymentGateway>) => void }> = ({ gw, update }) => (
    <div>
        {/* Auto-detect status */}
        <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '12px 16px', borderRadius: 12, marginBottom: 14,
            background: 'rgba(0,214,50,0.06)', border: '1px solid rgba(0,214,50,0.15)',
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Zap size={15} style={{ color: '#00D632' }} />
                <div>
                    <div style={{ fontWeight: 600, color: '#4ade80', fontSize: '0.85rem' }}>Email-Based Auto-Verification</div>
                    <div style={{ fontSize: '0.75rem', color: '#71717a', marginTop: 2 }}>
                        Scans your linked Gmail inbox for Cash App receipts matching the order note
                    </div>
                </div>
            </div>
            <Toggle on={!!gw.autoDetect} onToggle={() => update({ autoDetect: !gw.autoDetect })} />
        </div>

        {/* CashTag + QR */}
        <div style={grid2}>
            <div>
                <div style={label}>$Cashtag (your Cash App handle)</div>
                <input value={gw.cashTag || ''} onChange={e => update({ cashTag: e.target.value })}
                    placeholder="$yourCashTag" style={inp} />
            </div>
            <div>
                <div style={label}>Polling Interval (seconds)</div>
                <input type="number" value={gw.pollingInterval || 15} min={5} max={120}
                    onChange={e => update({ pollingInterval: parseInt(e.target.value) || 15 })} style={inp} />
            </div>
        </div>

        <QrUpload label="Cash App QR Code (shown to customers at checkout)" value={gw.cashAppQrUrl} onChange={v => update({ cashAppQrUrl: v })} />

        {/* Gmail Config */}
        <div style={{
            borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 16, marginTop: 6, marginBottom: 14,
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <Mail size={14} style={{ color: '#818cf8' }} />
                <span style={{ fontWeight: 600, color: '#a1a1aa', fontSize: '0.85rem' }}>Gmail Inbox Monitoring</span>
            </div>
            <InfoBox>
                Provide your Gmail address and an <strong>App Password</strong> (not your Google password). Generate one at{' '}
                <a href="https://myaccount.google.com/apppasswords" target="_blank" rel="noreferrer" style={{ color: '#818cf8' }}>
                    myaccount.google.com/apppasswords
                </a>. A backend proxy is required to call Gmail API — these credentials will be used server-side.
            </InfoBox>
            <div style={grid2}>
                <div>
                    <div style={label}>Gmail Address</div>
                    <div style={{ position: 'relative' }}>
                        <Mail size={13} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#71717a' }} />
                        <input value={gw.gmailEmail || ''} onChange={e => update({ gmailEmail: e.target.value })}
                            placeholder="you@gmail.com" style={{ ...inp, paddingLeft: 34 }} />
                    </div>
                </div>
                <div>
                    <div style={label}>Gmail App Password</div>
                    <div style={{ position: 'relative' }}>
                        <Lock size={13} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#71717a' }} />
                        <SecretInput value={gw.gmailAppPassword || ''} onChange={v => update({ gmailAppPassword: v })}
                            placeholder="xxxx xxxx xxxx xxxx" />
                    </div>
                </div>
            </div>
            <div>
                <div style={label}>Cash App Notification Email (sender to filter)</div>
                <input value={gw.cashAppEmail || ''} onChange={e => update({ cashAppEmail: e.target.value })}
                    placeholder="cash@square.com" style={inp} />
            </div>
        </div>
    </div>
);

const CustomerBalanceConfig: React.FC = () => (
    <div>
        <InfoBox color="#8B5CF6">
            Customer Balance allows customers to pay using their store credit. Balances are managed in the{' '}
            <strong style={{ color: '#c4b5fd' }}>Customers</strong> section. No external API required.
        </InfoBox>
        <div style={{
            padding: '14px 18px', borderRadius: 12,
            background: 'rgba(139,92,246,0.06)', border: '1px solid rgba(139,92,246,0.15)',
        }}>
            <div style={{ fontWeight: 600, color: '#c4b5fd', fontSize: '0.88rem', marginBottom: 4 }}>Internal Credit System</div>
            <div style={{ fontSize: '0.78rem', color: '#71717a' }}>
                Balances are stored in-app via StoreContext. Admins can credit/debit customer accounts from the Customers page. Purchases draw from the balance automatically.
            </div>
        </div>
    </div>
);

const FlickConfig: React.FC<{ gw: PaymentGateway; update: (p: Partial<PaymentGateway>) => void }> = ({ gw, update }) => (
    <div>
        <TestModeBanner on={!!gw.testMode} onToggle={() => update({ testMode: !gw.testMode })} />
        <InfoBox color="#007f31">
            Flik is a New Zealand open-banking payment gateway. Get your <strong>Client ID</strong> and <strong>Client Secret</strong> from the{' '}
            <a href="https://flik.co.nz" target="_blank" rel="noreferrer" style={{ color: '#4ade80' }}>Flik merchant portal</a>{' '}
            after signing up. Use Test Mode to trial the integration without real charges.
        </InfoBox>
        <div style={grid2}>
            <div>
                <div style={label}>Client ID (API Key)</div>
                <input value={gw.apiKey || ''} onChange={e => update({ apiKey: e.target.value })}
                    placeholder="flik_client_id_..." style={inp} />
            </div>
            <div>
                <div style={label}>Client Secret</div>
                <SecretInput value={gw.secretKey || ''} onChange={v => update({ secretKey: v })} placeholder="flik_secret_..." />
            </div>
        </div>
        <CopyRow label="Redirect / Callback URL (register in Flik portal)" value="https://yourstore.com/payments/flik/callback" />
        <div style={{ marginBottom: 14 }}>
            <div style={label}>Merchant Name (shown to customers on Flik page)</div>
            <input value={(gw as any).merchantName || ''} onChange={e => update({ ...(gw as any), merchantName: e.target.value })}
                placeholder="Your Store Name" style={inp} />
        </div>
        <a href="https://docs.flik.co.nz" target="_blank" rel="noreferrer" style={{ ...btnSm('rgba(0,127,49,0.12)'), textDecoration: 'none', display: 'inline-flex', color: '#4ade80', border: '1px solid rgba(0,127,49,0.3)' }}>
            <ExternalLink size={13} /> View Flik API Docs
        </a>
    </div>
);

/* ── App Marketplace ── */
const APP_LIST = [
    {
        id: 'flick',
        name: 'Flik',
        tagline: 'NZ Open Banking — direct bank payment',
        url: 'https://flik.co.nz',
        tags: ['NZ', 'Open Banking', 'Direct Transfer'],
        accent: '#007f31',
    },
];

const AppMarketplace: React.FC<{
    gateways: { id: string }[];
    onInstall: (id: string, name: string, desc: string) => void;
    onExpand: (id: string) => void;
}> = ({ gateways, onInstall, onExpand }) => {
    const [search, setSearch] = React.useState('');
    const installed = (id: string) => gateways.some(g => g.id === id);
    const filtered = APP_LIST.filter(a =>
        !search ||
        a.name.toLowerCase().includes(search.toLowerCase()) ||
        a.tagline.toLowerCase().includes(search.toLowerCase()) ||
        a.tags.some(t => t.toLowerCase().includes(search.toLowerCase()))
    );
    return (
        <>
            <div style={{ position: 'relative', marginBottom: 16 }}>
                <Search size={14} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#71717a' }} />
                <input value={search} onChange={e => setSearch(e.target.value)}
                    placeholder="Search payment apps…"
                    style={{ ...inp, paddingLeft: 38, borderRadius: 12, fontSize: '0.88rem' }} />
            </div>
            {filtered.length === 0 && (
                <div style={{ ...card, textAlign: 'center', padding: '24px', color: '#52525b', fontSize: '0.85rem' }}>
                    No payment apps match "{search}".
                </div>
            )}
            {filtered.map(app => (
                <div key={app.id} style={{ ...card, display: 'flex', alignItems: 'center', gap: 16 }}>
                    <div style={{
                        width: 48, height: 48, borderRadius: 12, flexShrink: 0,
                        background: `linear-gradient(135deg, ${app.accent}, ${app.accent}bb)`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: 900, fontSize: '1.3rem', color: '#fff',
                    }}>{app.name.charAt(0)}</div>
                    <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                            <span style={{ fontWeight: 700, color: '#fff', fontSize: '0.95rem' }}>{app.name}</span>
                            {app.tags.map(t => (
                                <span key={t} style={{
                                    fontSize: '0.65rem', padding: '2px 7px', borderRadius: 20,
                                    background: `${app.accent}18`, color: app.accent,
                                    border: `1px solid ${app.accent}30`, fontWeight: 600,
                                }}>{t}</span>
                            ))}
                        </div>
                        <div style={{ fontSize: '0.8rem', color: '#71717a', marginTop: 3 }}>{app.tagline}</div>
                        <a href={app.url} target="_blank" rel="noreferrer" style={{ fontSize: '0.72rem', color: '#818cf8', marginTop: 4, display: 'block' }}>
                            {app.url} ↗
                        </a>
                    </div>
                    <div style={{ flexShrink: 0 }}>
                        {installed(app.id) ? (
                            <span style={{
                                display: 'flex', alignItems: 'center', gap: 5,
                                padding: '7px 16px', borderRadius: 8, fontSize: '0.8rem', fontWeight: 600,
                                background: 'rgba(74,222,128,0.1)', color: '#4ade80',
                                border: '1px solid rgba(74,222,128,0.2)',
                            }}><Check size={13} /> Installed</span>
                        ) : (
                            <button
                                onClick={() => { onInstall(app.id, app.name, app.tagline); onExpand(app.id); }}
                                style={{ ...btnSm(`${app.accent}18`), color: app.accent, border: `1px solid ${app.accent}40`, padding: '7px 16px' }}
                            >
                                <Plus size={13} /> Install
                            </button>
                        )}
                    </div>
                </div>
            ))}
        </>
    );
};

/* ─── Crypto ─── */
const cryptoCoins = [
    { coin: 'Bitcoin', symbol: 'BTC', color: '#F7931A' },
    { coin: 'Ethereum', symbol: 'ETH', color: '#627EEA' },
    { coin: 'Litecoin', symbol: 'LTC', color: '#BFBBBB' },
    { coin: 'Bitcoin Cash', symbol: 'BCH', color: '#8DC351' },
    { coin: 'BNB', symbol: 'BNB', color: '#F3BA2F' },
    { coin: 'Tron', symbol: 'TRX', color: '#FF0013' },
    { coin: 'Polygon', symbol: 'MATIC', color: '#8247E5' },
];

/* ══════════════════════════════════════════════
   MAIN COMPONENT
   ══════════════════════════════════════════════ */
const PaymentMethods: React.FC = () => {
    const { paymentSettings, updatePaymentGateway, addManualPayment, updateManualPayment, deleteManualPayment, addCryptoAddress, updateCryptoAddress, deleteCryptoAddress } = useStore();
    const [expanded, setExpanded] = useState<string | null>('cashapp');
    const [showManualForm, setShowManualForm] = useState(false);
    const [manualName, setManualName] = useState('');
    const [manualInst, setManualInst] = useState('');
    const [newCrypto, setNewCrypto] = useState<Record<string, string>>({});

    const renderGatewayConfig = (gw: PaymentGateway) => {
        const up = (p: Partial<PaymentGateway>) => updatePaymentGateway(gw.id, p);
        switch (gw.id) {
            case 'stripe': return <StripeConfig gw={gw} update={up} />;
            case 'paypal-p2p': return <PayPalP2PConfig gw={gw} update={up} />;
            case 'paypal-api': return <PayPalAPIConfig gw={gw} update={up} />;
            case 'square': return <SquareConfig gw={gw} update={up} />;
            case 'coinbase': return <CoinbaseConfig gw={gw} update={up} />;
            case 'cashapp': return <CashAppConfig gw={gw} update={up} />;
            case 'customer-balance': return <CustomerBalanceConfig />;
            case 'flick': return <FlickConfig gw={gw} update={up} />;
            default: return null;
        }
    };

    const renderGateway = (gw: PaymentGateway) => {
        const iconInfo = gatewayIcons[gw.id] || { icon: '💰', bg: '#555', accent: '#fff' };
        const isOpen = expanded === gw.id;

        return (
            <div key={gw.id} style={card}>
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div style={{
                        width: 46, height: 46, borderRadius: 12,
                        background: iconInfo.bg,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    }}>
                        {iconInfo.icon}
                    </div>
                    <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700, color: '#fff', fontSize: '0.95rem' }}>
                            {gw.name}
                            {gw.connected && (
                                <span style={{
                                    fontSize: '0.68rem', padding: '2px 8px', borderRadius: 20,
                                    background: 'rgba(74,222,128,0.12)', color: '#4ade80', fontWeight: 600,
                                }}>● Connected</span>
                            )}
                            {gw.testMode && (
                                <span style={{
                                    fontSize: '0.68rem', padding: '2px 8px', borderRadius: 20,
                                    background: 'rgba(245,158,11,0.12)', color: '#f59e0b', fontWeight: 600,
                                }}>Sandbox</span>
                            )}
                        </div>
                        <div style={{ fontSize: '0.8rem', color: '#71717a', marginTop: 2 }}>{gw.description}</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                        <button onClick={() => updatePaymentGateway(gw.id, { connected: !gw.connected })} style={{
                            ...btnSm(gw.connected ? 'rgba(239,68,68,0.1)' : `${iconInfo.accent}20`),
                            color: gw.connected ? '#ef4444' : iconInfo.accent,
                            border: `1px solid ${gw.connected ? 'rgba(239,68,68,0.2)' : `${iconInfo.accent}40`}`,
                            padding: '7px 16px',
                        }}>
                            {gw.connected ? 'Disconnect' : 'Connect'}
                        </button>
                        <button onClick={() => setExpanded(isOpen ? null : gw.id)} style={{
                            background: 'transparent', border: 'none', color: '#a1a1aa', cursor: 'pointer', padding: 4,
                        }}>
                            {isOpen ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                        </button>
                    </div>
                </div>

                {/* Expanded Config */}
                {isOpen && (
                    <div style={{ marginTop: 18, paddingTop: 18, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                        {renderGatewayConfig(gw)}
                        {gw.connected && (
                            <div style={{
                                display: 'flex', alignItems: 'center', gap: 8, marginTop: 16,
                                padding: '10px 14px', borderRadius: 10,
                                background: 'rgba(74,222,128,0.05)', border: '1px solid rgba(74,222,128,0.15)',
                            }}>
                                <Check size={14} style={{ color: '#4ade80' }} />
                                <span style={{ fontSize: '0.8rem', color: '#4ade80', fontWeight: 500 }}>
                                    {gw.id === 'cashapp' ? 'Cash App auto-verification is active' : 'Gateway connected — payments will be processed'}
                                </span>
                            </div>
                        )}
                    </div>
                )}
            </div>
        );
    };

    const renderManual = (mp: ManualPaymentMethod) => (
        <div key={mp.id} style={{ ...card, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, color: '#fff', fontSize: '0.9rem' }}>{mp.name}</div>
                <div style={{ fontSize: '0.8rem', color: '#71717a', marginTop: 3 }}>{mp.instructions}</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <Toggle on={mp.enabled} onToggle={() => updateManualPayment(mp.id, { enabled: !mp.enabled })} />
                <button onClick={() => { if (confirm('Delete this payment method?')) deleteManualPayment(mp.id); }}
                    style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', padding: 4 }}>
                    <Trash2 size={15} />
                </button>
            </div>
        </div>
    );

    const renderCrypto = (coin: typeof cryptoCoins[number]) => {
        const addrs = paymentSettings.cryptoAddresses.filter(a => a.symbol === coin.symbol);
        return (
            <div key={coin.symbol} style={card}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: addrs.length > 0 ? 14 : 0 }}>
                    <div style={{
                        width: 38, height: 38, borderRadius: '50%', background: coin.color,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: 800, color: '#000', fontSize: '0.8rem',
                    }}>{coin.symbol.charAt(0)}</div>
                    <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, color: '#fff', fontSize: '0.9rem' }}>{coin.coin} ({coin.symbol})</div>
                        <div style={{ fontSize: '0.75rem', color: '#71717a' }}>Set wallet address to receive {coin.symbol} payments</div>
                    </div>
                    {addrs.length > 0 && (
                        <span style={{ fontSize: '0.72rem', padding: '3px 10px', borderRadius: 6, background: 'rgba(74,222,128,0.1)', color: '#4ade80' }}>
                            {addrs.length} address{addrs.length > 1 ? 'es' : ''}
                        </span>
                    )}
                </div>
                {addrs.map(addr => (
                    <div key={addr.id} style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                        <input value={addr.address} onChange={e => updateCryptoAddress(addr.id, { address: e.target.value })}
                            style={{ ...inp, fontSize: '0.82rem', fontFamily: 'monospace' }} placeholder={`${coin.symbol} wallet address`} />
                        <button onClick={() => deleteCryptoAddress(addr.id)} style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', flexShrink: 0 }}>
                            <X size={14} />
                        </button>
                    </div>
                ))}
                <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                    <input value={newCrypto[coin.symbol] || ''} onChange={e => setNewCrypto(p => ({ ...p, [coin.symbol]: e.target.value }))}
                        placeholder={`Add ${coin.symbol} wallet address`} style={{ ...inp, fontSize: '0.82rem', fontFamily: 'monospace' }} />
                    <button onClick={() => {
                        const addr = newCrypto[coin.symbol]?.trim();
                        if (!addr) return;
                        addCryptoAddress({ coin: coin.coin, symbol: coin.symbol, address: addr, confirmations: 6, fee: 0, withdrawAll: false, color: coin.color });
                        setNewCrypto(p => ({ ...p, [coin.symbol]: '' }));
                    }} style={{ ...primaryBtn, padding: '10px 14px', flexShrink: 0 }}>
                        <Plus size={15} />
                    </button>
                </div>
            </div>
        );
    };

    return (
        <div style={{ maxWidth: 920, margin: '0 auto' }}>
            {/* Page Header */}
            <div style={{ marginBottom: 32 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#71717a', fontSize: '0.82rem', marginBottom: 12 }}>
                    <span>⚙️ Store</span>
                    <ChevronRight size={14} />
                    <span style={{ color: '#a1a1aa' }}>Payment Methods</span>
                </div>
                <h1 style={{
                    fontSize: '1.8rem', fontWeight: 800, margin: 0,
                    background: 'linear-gradient(135deg, #ffffff 0%, #a1a1aa 100%)',
                    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                }}>Payment Methods</h1>
                <p style={{ color: '#71717a', fontSize: '0.85rem', marginTop: 6, marginBottom: 0 }}>
                    Configure your payment gateways, manual methods, and crypto wallets.
                </p>
            </div>

            {/* ── Section 1: Gateways ── */}
            <div style={{ marginBottom: 40 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                    <CreditCard size={18} style={{ color: '#a1a1aa' }} />
                    <h2 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: '#fff' }}>Payment Gateways</h2>
                </div>
                <p style={{ fontSize: '0.82rem', color: '#71717a', marginBottom: 18, marginTop: 4 }}>
                    Connect and configure each payment provider. Click a gateway to expand its configuration.
                </p>
                {paymentSettings.gateways.map(renderGateway)}
            </div>

            {/* ── Section 2: Manual Payments ── */}
            <div style={{ marginBottom: 40 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                    <Wallet size={18} style={{ color: '#a1a1aa' }} />
                    <h2 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: '#fff' }}>Manual Payment Methods</h2>
                </div>
                <p style={{ fontSize: '0.82rem', color: '#71717a', marginBottom: 18, marginTop: 4 }}>
                    Create custom payment methods (Zelle, Venmo, bank transfer) with instructions for customers.
                </p>
                {paymentSettings.manualPayments.length === 0 && !showManualForm && (
                    <div style={{ ...card, textAlign: 'center', padding: '24px 20px', marginBottom: 12 }}>
                        <AlertTriangle size={22} style={{ color: '#ef4444', marginBottom: 8 }} />
                        <div style={{ color: '#a1a1aa', fontSize: '0.85rem' }}>No manual payment methods yet.</div>
                    </div>
                )}
                {paymentSettings.manualPayments.map(renderManual)}
                {showManualForm && (
                    <div style={card}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                            <span style={{ fontWeight: 600, color: '#fff' }}>New Payment Method</span>
                            <button onClick={() => { setShowManualForm(false); setManualName(''); setManualInst(''); }}
                                style={{ background: 'transparent', border: 'none', color: '#71717a', cursor: 'pointer' }}>
                                <X size={18} />
                            </button>
                        </div>
                        <div style={{ marginBottom: 12 }}>
                            <div style={label}>Method Name</div>
                            <input value={manualName} onChange={e => setManualName(e.target.value)}
                                placeholder="e.g. Zelle, Venmo, Bank Transfer" style={inp} />
                        </div>
                        <div style={{ marginBottom: 16 }}>
                            <div style={label}>Instructions for Customer</div>
                            <textarea value={manualInst} onChange={e => setManualInst(e.target.value)}
                                placeholder="e.g. Send to user@zelle.com, note your order ID" rows={3}
                                style={{ ...inp, resize: 'vertical' }} />
                        </div>
                        <button onClick={() => {
                            if (!manualName.trim()) return;
                            addManualPayment({ name: manualName.trim(), instructions: manualInst.trim(), enabled: true });
                            setManualName(''); setManualInst(''); setShowManualForm(false);
                        }} style={primaryBtn}>
                            <Plus size={15} /> Add Method
                        </button>
                    </div>
                )}
                <button onClick={() => setShowManualForm(true)} style={{
                    width: '100%', padding: '12px', borderRadius: 12,
                    background: 'rgba(255,255,255,0.03)', border: '1px dashed rgba(255,255,255,0.12)',
                    color: '#a1a1aa', fontSize: '0.88rem', fontWeight: 500, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    fontFamily: 'inherit', transition: 'all 0.2s',
                }}>
                    <Plus size={15} /> Add New Method
                </button>
            </div>

            {/* ── Section 2.5: Add Payment App Marketplace ── */}
            <div style={{ marginBottom: 40 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                    <Plus size={18} style={{ color: '#a1a1aa' }} />
                    <h2 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: '#fff' }}>Add Payment App</h2>
                </div>
                <p style={{ fontSize: '0.82rem', color: '#71717a', marginBottom: 14, marginTop: 4 }}>
                    Search and install additional payment providers from the marketplace.
                </p>

                <AppMarketplace
                    gateways={paymentSettings.gateways}
                    onInstall={(id, name, desc) => updatePaymentGateway(id, { id, name, description: desc, connected: false } as any)}
                    onExpand={(id) => setExpanded(id)}
                />
            </div>

            {/* ── Section 3: Crypto ── */}
            <div style={{ marginBottom: 60 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                    <Bitcoin size={18} style={{ color: '#a1a1aa' }} />
                    <h2 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: '#fff' }}>Direct Crypto Wallets</h2>
                </div>
                <p style={{ fontSize: '0.82rem', color: '#71717a', marginBottom: 18, marginTop: 4 }}>
                    Add wallet addresses to accept crypto payments with no third-party fees.
                </p>
                <div style={{
                    ...card, background: 'rgba(79,104,248,0.06)', border: '1px solid rgba(79,104,248,0.18)',
                    display: 'flex', alignItems: 'center', gap: 12, padding: '14px 18px', marginBottom: 16,
                }}>
                    <Zap size={16} style={{ color: '#818cf8', flexShrink: 0 }} />
                    <div>
                        <div style={{ fontWeight: 600, color: '#c4b5fd', fontSize: '0.85rem' }}>On-chain verification</div>
                        <div style={{ fontSize: '0.75rem', color: '#a1a1aa', marginTop: 2 }}>
                            Payments are confirmed on-chain. Wallets are monitored automatically for incoming deposits.
                        </div>
                    </div>
                </div>
                {cryptoCoins.map(renderCrypto)}
            </div>

            <style>{`
                @keyframes spin { to { transform: rotate(360deg); } }
                input:focus, textarea:focus { border-color: rgba(129,140,248,0.4) !important; }
            `}</style>
        </div>
    );
};

export default PaymentMethods;
