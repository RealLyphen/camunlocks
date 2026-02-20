import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts';
import { format, subMinutes } from 'date-fns';
import WorldMap, { type CountryData } from '../../admin/components/WorldMap';

/* ─────────────────────────────────────────────────────────────
   TYPES
   ───────────────────────────────────────────────────────────── */
interface PageView {
    ts: number;
    path: string;
    session: string;
    referrer: string;
    browser: string;
    os: string;
    device: string;
    country: string;
}

/* ─────────────────────────────────────────────────────────────
   TRACKING ENGINE
   ───────────────────────────────────────────────────────────── */
const STORAGE_KEY = 'va_events';
const SESSION_KEY = 'va_session';

function getOrCreateSession(): string {
    let s = sessionStorage.getItem(SESSION_KEY);
    if (!s) {
        s = Math.random().toString(36).slice(2) + Date.now().toString(36);
        sessionStorage.setItem(SESSION_KEY, s);
    }
    return s;
}

function detectBrowser(): string {
    const ua = navigator.userAgent;
    if (ua.includes('Edg')) return 'Edge';
    if (ua.includes('Chrome')) return 'Chrome';
    if (ua.includes('Firefox')) return 'Firefox';
    if (ua.includes('Safari')) return 'Safari';
    if (ua.includes('OPR')) return 'Opera';
    return 'Other';
}

function detectOS(): string {
    const ua = navigator.userAgent;
    if (ua.includes('Win')) return 'Windows';
    if (ua.includes('Mac')) return 'macOS';
    if (ua.includes('Android')) return 'Android';
    if (ua.includes('iPhone') || ua.includes('iPad')) return 'iOS';
    if (ua.includes('Linux')) return 'Linux';
    return 'Other';
}

function detectDevice(): string {
    if (navigator.userAgent.includes('Mobi')) return 'Mobile';
    if (navigator.userAgent.includes('Tablet') || navigator.userAgent.includes('iPad')) return 'Tablet';
    return 'Desktop';
}

function guessCountry(): string {
    try {
        const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
        const map: Record<string, string> = {
            'America/New_York': 'United States', 'America/Los_Angeles': 'United States',
            'America/Chicago': 'United States', 'America/Denver': 'United States',
            'America/Phoenix': 'United States', 'America/Anchorage': 'United States',
            'America/Toronto': 'Canada', 'America/Vancouver': 'Canada', 'America/Winnipeg': 'Canada',
            'America/Mexico_City': 'Mexico', 'America/Bogota': 'Colombia',
            'America/Sao_Paulo': 'Brazil', 'America/Argentina/Buenos_Aires': 'Argentina',
            'Europe/London': 'United Kingdom', 'Europe/Paris': 'France', 'Europe/Berlin': 'Germany',
            'Europe/Madrid': 'Spain', 'Europe/Rome': 'Italy', 'Europe/Amsterdam': 'Netherlands',
            'Europe/Warsaw': 'Poland', 'Europe/Stockholm': 'Sweden', 'Europe/Moscow': 'Russia',
            'Europe/Istanbul': 'Turkey', 'Europe/Kiev': 'Ukraine', 'Europe/Zurich': 'Switzerland',
            'Europe/Lisbon': 'Portugal', 'Europe/Copenhagen': 'Denmark',
            'Asia/Kolkata': 'India', 'Asia/Calcutta': 'India',
            'Asia/Tokyo': 'Japan', 'Asia/Shanghai': 'China', 'Asia/Hong_Kong': 'China',
            'Asia/Seoul': 'South Korea', 'Asia/Singapore': 'Singapore',
            'Asia/Jakarta': 'Indonesia', 'Asia/Bangkok': 'Thailand',
            'Asia/Ho_Chi_Minh': 'Vietnam', 'Asia/Karachi': 'Pakistan',
            'Asia/Dhaka': 'Bangladesh', 'Asia/Dubai': 'UAE', 'Asia/Riyadh': 'Saudi Arabia',
            'Asia/Gaza': 'Palestine', 'Asia/Jerusalem': 'Israel', 'Asia/Beirut': 'Lebanon',
            'Africa/Cairo': 'Egypt', 'Africa/Johannesburg': 'South Africa',
            'Africa/Lagos': 'Nigeria', 'Africa/Nairobi': 'Kenya', 'Africa/Casablanca': 'Morocco',
            'Africa/Accra': 'Ghana',
            'Australia/Sydney': 'Australia', 'Australia/Melbourne': 'Australia', 'Australia/Perth': 'Australia',
            'Pacific/Auckland': 'New Zealand',
        };
        return map[tz] || tz.split('/').pop()?.replace(/_/g, ' ') || 'Unknown';
    } catch { return 'Unknown'; }
}

export function trackPageView(path: string) {
    try {
        const events: PageView[] = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
        events.push({
            ts: Date.now(), path,
            session: getOrCreateSession(),
            referrer: document.referrer || 'Direct',
            browser: detectBrowser(),
            os: detectOS(),
            device: detectDevice(),
            country: guessCountry(),
        });
        if (events.length > 50000) events.splice(0, events.length - 50000);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
    } catch (_) {/* silent */ }
}

/* ─────────────────────────────────────────────────────────────
   TIMEFRAME CONFIG
   ───────────────────────────────────────────────────────────── */
interface TF { label: string; key: string; minutes: number; buckets: number; bucketLabel: (d: Date) => string; }
const TIMEFRAMES: TF[] = [
    { label: '5m', key: '5m', minutes: 5, buckets: 5, bucketLabel: d => format(d, 'HH:mm') },
    { label: '15m', key: '15m', minutes: 15, buckets: 15, bucketLabel: d => format(d, 'HH:mm') },
    { label: '30m', key: '30m', minutes: 30, buckets: 10, bucketLabel: d => format(d, 'HH:mm') },
    { label: '60m', key: '60m', minutes: 60, buckets: 12, bucketLabel: d => format(d, 'HH:mm') },
    { label: '3h', key: '3h', minutes: 180, buckets: 12, bucketLabel: d => format(d, 'HH:mm') },
    { label: '6h', key: '6h', minutes: 360, buckets: 12, bucketLabel: d => format(d, 'HH:mm') },
    { label: '12h', key: '12h', minutes: 720, buckets: 12, bucketLabel: d => format(d, 'HH:mm') },
    { label: '24h', key: '24h', minutes: 1440, buckets: 24, bucketLabel: d => format(d, 'HH:mm') },
    { label: '1d', key: '1d', minutes: 1440, buckets: 24, bucketLabel: d => format(d, 'HH:mm') },
    { label: '2d', key: '2d', minutes: 2880, buckets: 24, bucketLabel: d => format(d, 'MMM d') },
    { label: '3d', key: '3d', minutes: 4320, buckets: 18, bucketLabel: d => format(d, 'MMM d') },
    { label: '7d', key: '7d', minutes: 10080, buckets: 14, bucketLabel: d => format(d, 'MMM d') },
    { label: '15d', key: '15d', minutes: 21600, buckets: 15, bucketLabel: d => format(d, 'MMM d') },
    { label: '30d', key: '30d', minutes: 43200, buckets: 15, bucketLabel: d => format(d, 'MMM d') },
    { label: '60d', key: '60d', minutes: 86400, buckets: 15, bucketLabel: d => format(d, 'MMM d') },
    { label: '90d', key: '90d', minutes: 129600, buckets: 15, bucketLabel: d => format(d, 'MMM d') },
];

const CUSTOM_LABEL = 'Custom';

/* ─────────────────────────────────────────────────────────────
   DATA HELPERS
   ───────────────────────────────────────────────────────────── */
function filterByRange(events: PageView[], from: number, to: number) {
    return events.filter(e => e.ts >= from && e.ts <= to);
}

function buildChart(events: PageView[], from: number, to: number, buckets: number, labelFn: (d: Date) => string) {
    const rangeMs = to - from;
    const bucketMs = rangeMs / buckets;
    return Array.from({ length: buckets }, (_, i) => {
        const bStart = from + i * bucketMs;
        const bEnd = bStart + bucketMs;
        const inside = events.filter(e => e.ts >= bStart && e.ts < bEnd);
        return {
            time: labelFn(new Date(bStart + bucketMs / 2)),
            views: inside.length,
            visitors: new Set(inside.map(e => e.session)).size,
        };
    });
}

function computeStats(events: PageView[]) {
    const pageViews = events.length;
    const sessions = new Set(events.map(e => e.session));
    const visits = sessions.size;
    const sessionMap: Record<string, number> = {};
    events.forEach(e => { sessionMap[e.session] = (sessionMap[e.session] || 0) + 1; });
    const bounced = Object.values(sessionMap).filter(c => c === 1).length;
    return { pageViews, visits, uniqueVisitors: visits, bounceRate: visits > 0 ? (bounced / visits) * 100 : 0 };
}

function topN(items: string[], n = 7) {
    const c: Record<string, number> = {};
    items.forEach(i => { c[i] = (c[i] || 0) + 1; });
    const total = items.length;
    return Object.entries(c).sort(([, a], [, b]) => b - a).slice(0, n)
        .map(([label, count]) => ({ label, count, pct: total ? (count / total) * 100 : 0 }));
}

/* ─────────────────────────────────────────────────────────────
   COLORS / ICONS
   ───────────────────────────────────────────────────────────── */
const P = ['#6366f1', '#8b5cf6', '#3b82f6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'];
const BROWSER_ICONS: Record<string, string> = { Chrome: '🌐', Firefox: '🦊', Safari: '🧭', Edge: '🔷', Opera: '🔴', Other: '❓' };
const OS_ICONS: Record<string, string> = { Windows: '🪟', macOS: '🍎', Linux: '🐧', Android: '🤖', iOS: '📱', Other: '❓' };
const DEVICE_ICONS: Record<string, string> = { Desktop: '🖥️', Mobile: '📱', Tablet: '📱' };
const REF_ICONS: Record<string, string> = { Direct: '🔗', Google: '🔍', Twitter: '🐦', Facebook: '👥', Reddit: '🤖', GitHub: '🐙', YouTube: '▶️' };

/* ─────────────────────────────────────────────────────────────
   SUB-COMPONENTS
   ───────────────────────────────────────────────────────────── */
const StatCard = ({ label, value, sub, icon, color }: { label: string; value: string; sub?: string; icon: React.ReactNode; color: string }) => (
    <div style={{ background: 'rgba(15,15,20,0.6)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: '22px 24px', flex: 1, minWidth: 0, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', bottom: -20, left: -20, width: 80, height: 80, borderRadius: '50%', background: color, opacity: 0.12, filter: 'blur(20px)' }} />
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#71717a', textTransform: 'uppercase', letterSpacing: 0.8 }}>{label}</span>
            <div style={{ width: 34, height: 34, borderRadius: 10, background: `${color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', color }}>{icon}</div>
        </div>
        <div style={{ fontSize: '2rem', fontWeight: 800, color: '#fff', lineHeight: 1, marginBottom: 8 }}>{value}</div>
        {sub && <span style={{ fontSize: '0.75rem', color: '#52525b' }}>{sub}</span>}
    </div>
);

const GlassCard = ({ title, children, style }: { title: string; children: React.ReactNode; style?: React.CSSProperties }) => (
    <div style={{ background: 'rgba(15,15,20,0.6)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: '22px 24px', ...style }}>
        <h3 style={{ margin: '0 0 18px', fontSize: '0.9rem', fontWeight: 700, color: '#e4e4e7', letterSpacing: 0.3 }}>{title}</h3>
        {children}
    </div>
);

const BarRow = ({ label, count, pct, color, icon }: { label: string; count: number; pct: number; color: string; icon?: string }) => (
    <div style={{ marginBottom: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
            <span style={{ fontSize: '0.82rem', color: '#d4d4d8', display: 'flex', alignItems: 'center', gap: 6 }}>
                {icon && <span>{icon}</span>}{label}
            </span>
            <span style={{ fontSize: '0.78rem', color: '#71717a', fontVariantNumeric: 'tabular-nums' }}>{count} <span style={{ color: '#52525b' }}>({pct.toFixed(1)}%)</span></span>
        </div>
        <div style={{ height: 5, background: 'rgba(255,255,255,0.06)', borderRadius: 3, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${Math.max(pct, 0)}%`, background: `linear-gradient(90deg,${color},${color}80)`, borderRadius: 3, transition: 'width 0.6s' }} />
        </div>
    </div>
);

const Empty = () => (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 40, color: '#3f3f46', gap: 8 }}>
        <span style={{ fontSize: 28 }}>📭</span>
        <div style={{ fontSize: '0.82rem', color: '#52525b' }}>No data for this period</div>
    </div>
);

const ChartTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
        <div style={{ background: 'rgba(10,10,16,0.97)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '10px 14px', backdropFilter: 'blur(20px)' }}>
            <div style={{ fontSize: '0.72rem', color: '#71717a', marginBottom: 6 }}>{label}</div>
            {payload.map((p: any) => (
                <div key={p.name} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: p.color }} />
                    <span style={{ fontSize: '0.8rem', color: '#d4d4d8' }}>{p.name}:</span>
                    <span style={{ fontSize: '0.8rem', color: '#fff', fontWeight: 700 }}>{p.value}</span>
                </div>
            ))}
        </div>
    );
};

/* ─────────────────────────────────────────────────────────────
   MAIN PAGE
   ───────────────────────────────────────────────────────────── */
const VisitorAnalytics: React.FC = () => {
    /* state */
    const [allEvents, setAllEvents] = useState<PageView[]>([]);
    const [selectedTf, setSelectedTf] = useState<TF>(TIMEFRAMES[7]);  // 24h default
    const [isCustom, setIsCustom] = useState(false);
    const [customFrom, setCustomFrom] = useState<string>('');
    const [customTo, setCustomTo] = useState<string>('');
    const [now, setNow] = useState(new Date());
    const [tfOpen, setTfOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<'overview' | 'map' | 'referrers'>('overview');

    /* live clock */
    useEffect(() => {
        const iv = setInterval(() => setNow(new Date()), 1000);
        return () => clearInterval(iv);
    }, []);

    /* load events */
    const load = useCallback(() => {
        try { setAllEvents(JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')); }
        catch { setAllEvents([]); }
    }, []);

    useEffect(() => { load(); const iv = setInterval(load, 10000); return () => clearInterval(iv); }, [load]);

    /* time window */
    const { rangeFrom, rangeTo, buckets, bucketLabelFn } = useMemo(() => {
        if (isCustom && customFrom && customTo) {
            const from = new Date(customFrom).getTime();
            const to = new Date(customTo).getTime();
            if (!isNaN(from) && !isNaN(to) && to > from) {
                const diffMin = (to - from) / 60000;
                const bk = diffMin <= 120 ? 12 : diffMin <= 1440 ? 24 : 15;
                const labelFn = diffMin <= 1440
                    ? (d: Date) => format(d, 'HH:mm')
                    : (d: Date) => format(d, 'MMM d');
                return { rangeFrom: from, rangeTo: to, buckets: bk, bucketLabelFn: labelFn };
            }
        }
        const to = Date.now();
        const from = subMinutes(new Date(), selectedTf.minutes).getTime();
        return { rangeFrom: from, rangeTo: to, buckets: selectedTf.buckets, bucketLabelFn: selectedTf.bucketLabel };
    }, [isCustom, customFrom, customTo, selectedTf, now]);

    const events = useMemo(() => filterByRange(allEvents, rangeFrom, rangeTo), [allEvents, rangeFrom, rangeTo]);
    const { pageViews, visits, uniqueVisitors, bounceRate } = useMemo(() => computeStats(events), [events]);
    const chartData = useMemo(() => buildChart(events, rangeFrom, rangeTo, buckets, bucketLabelFn), [events, rangeFrom, rangeTo, buckets, bucketLabelFn]);

    const topPages = useMemo(() => topN(events.map(e => e.path)), [events]);
    const topBrowsers = useMemo(() => topN(events.map(e => e.browser), 5), [events]);
    const topOS = useMemo(() => topN(events.map(e => e.os), 5), [events]);
    const topDevices = useMemo(() => topN(events.map(e => e.device), 3), [events]);
    const topReferrers = useMemo(() => topN(events.map(e => {
        const r = e.referrer;
        if (!r || r === 'Direct') return 'Direct';
        try {
            const host = new URL(r).hostname.replace('www.', '');
            if (host.includes('google')) return 'Google';
            if (host.includes('twitter') || host.includes('t.co')) return 'Twitter';
            if (host.includes('facebook')) return 'Facebook';
            if (host.includes('reddit')) return 'Reddit';
            if (host.includes('github')) return 'GitHub';
            if (host.includes('youtube')) return 'YouTube';
            return host;
        } catch { return r; }
    }), 7), [events]);

    /* Country map data */
    const countryMapData: CountryData[] = useMemo(() => {
        const c: Record<string, { views: number; visitors: Set<string> }> = {};
        events.forEach(e => {
            if (!c[e.country]) c[e.country] = { views: 0, visitors: new Set() };
            c[e.country].views++;
            c[e.country].visitors.add(e.session);
        });
        return Object.entries(c).map(([name, d]) => ({ name, views: d.views, visitors: d.visitors.size }));
    }, [events]);

    const devicePie = topDevices.map((d, i) => ({ name: d.label, value: d.count, fill: P[i] }));

    const tfGroups = [
        { label: 'Minutes', items: TIMEFRAMES.slice(0, 4) },
        { label: 'Hours', items: TIMEFRAMES.slice(4, 8) },
        { label: 'Days', items: TIMEFRAMES.slice(8) },
    ];

    return (
        <div style={{ padding: '0 0 48px', fontFamily: 'Inter,sans-serif', color: '#fff' }}>

            {/* ── HEADER ── */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
                <div>
                    <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800, background: 'linear-gradient(135deg,#fff,#a1a1aa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                        Visitor Analytics
                    </h1>
                    <p style={{ margin: '4px 0 0', fontSize: '0.78rem', color: '#52525b' }}>
                        Real-time · Auto-refreshes every 10s
                    </p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                    {/* Live clock */}
                    <div style={{ background: 'rgba(15,15,20,0.7)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '8px 14px', display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#10b981', boxShadow: '0 0 6px #10b981', animation: 'pulseGreen 2s infinite' }} />
                        <span style={{ fontSize: '0.78rem', color: '#a1a1aa', fontVariantNumeric: 'tabular-nums' }}>
                            {format(now, 'dd MMM yyyy')} <span style={{ color: '#6366f1', fontWeight: 700 }}>{format(now, 'HH:mm:ss')}</span>
                        </span>
                    </div>

                    {/* Date range display */}
                    <div style={{ background: 'rgba(15,15,20,0.7)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '8px 14px', fontSize: '0.78rem', color: '#71717a' }}>
                        📅 {format(rangeFrom, 'dd MMM HH:mm')} → {format(rangeTo, 'dd MMM HH:mm')}
                    </div>

                    {/* Timeframe dropdown */}
                    <div style={{ position: 'relative' }}>
                        <button onClick={() => setTfOpen(p => !p)} style={{
                            background: 'linear-gradient(135deg,var(--primary-color),var(--secondary-color))',
                            border: 'none', borderRadius: 10, padding: '8px 16px', color: '#fff',
                            fontWeight: 700, fontSize: '0.83rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
                            boxShadow: '0 4px 15px rgba(99,102,241,0.3)',
                        }}>
                            ⏱ {isCustom ? CUSTOM_LABEL : selectedTf.label}
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9" /></svg>
                        </button>
                        {tfOpen && (
                            <div style={{
                                position: 'absolute', top: '100%', right: 0, marginTop: 8, zIndex: 200,
                                background: 'rgba(10,10,16,0.98)', border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: 14, padding: 16, minWidth: 260, backdropFilter: 'blur(30px)',
                                boxShadow: '0 20px 60px rgba(0,0,0,0.7)',
                            }}>
                                {tfGroups.map(g => (
                                    <div key={g.label} style={{ marginBottom: 12 }}>
                                        <div style={{ fontSize: '0.63rem', color: '#52525b', fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 6 }}>{g.label}</div>
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                                            {g.items.map(tf => (
                                                <button key={tf.key} onClick={() => { setSelectedTf(tf); setIsCustom(false); setTfOpen(false); }} style={{
                                                    background: (!isCustom && selectedTf.key === tf.key) ? 'var(--primary-color)' : 'rgba(255,255,255,0.05)',
                                                    border: (!isCustom && selectedTf.key === tf.key) ? 'none' : '1px solid rgba(255,255,255,0.08)',
                                                    borderRadius: 8, padding: '5px 11px', color: '#fff', fontSize: '0.77rem',
                                                    fontWeight: (!isCustom && selectedTf.key === tf.key) ? 700 : 400, cursor: 'pointer',
                                                }}>{tf.label}</button>
                                            ))}
                                        </div>
                                    </div>
                                ))}

                                {/* Custom range */}
                                <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)', paddingTop: 12, marginTop: 4 }}>
                                    <div style={{ fontSize: '0.63rem', color: '#52525b', fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8 }}>Custom Range</div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                        <input type="datetime-local" value={customFrom} onChange={e => setCustomFrom(e.target.value)}
                                            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '6px 10px', color: '#d4d4d8', fontSize: '0.78rem', colorScheme: 'dark' }} />
                                        <input type="datetime-local" value={customTo} onChange={e => setCustomTo(e.target.value)}
                                            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '6px 10px', color: '#d4d4d8', fontSize: '0.78rem', colorScheme: 'dark' }} />
                                        <button onClick={() => { if (customFrom && customTo) { setIsCustom(true); setTfOpen(false); } }}
                                            style={{ background: 'var(--primary-color)', border: 'none', borderRadius: 8, padding: '7px 0', color: '#fff', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer' }}>
                                            Apply Custom Range
                                        </button>
                                    </div>
                                </div>
                                <button onClick={() => { localStorage.removeItem(STORAGE_KEY); setAllEvents([]); setTfOpen(false); }}
                                    style={{ width: '100%', marginTop: 10, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, padding: '7px 0', color: '#f87171', fontSize: '0.75rem', cursor: 'pointer', fontWeight: 600 }}>
                                    🗑 Clear All Data
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* ── CUSTOM DATE RANGE BAR (always visible) ── */}
            <div style={{
                display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20, flexWrap: 'wrap',
                background: 'rgba(15,15,20,0.55)', border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: 14, padding: '12px 16px',
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
                    </svg>
                    <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#71717a' }}>Custom Range:</span>
                </div>
                <input
                    type="datetime-local" value={customFrom}
                    onChange={e => setCustomFrom(e.target.value)}
                    style={{ background: 'rgba(255,255,255,0.05)', border: `1px solid ${isCustom ? 'rgba(99,102,241,0.5)' : 'rgba(255,255,255,0.1)'}`, borderRadius: 8, padding: '6px 10px', color: '#d4d4d8', fontSize: '0.78rem', colorScheme: 'dark' }}
                />
                <span style={{ color: '#3f3f46', fontSize: '0.78rem' }}>→</span>
                <input
                    type="datetime-local" value={customTo}
                    onChange={e => setCustomTo(e.target.value)}
                    style={{ background: 'rgba(255,255,255,0.05)', border: `1px solid ${isCustom ? 'rgba(99,102,241,0.5)' : 'rgba(255,255,255,0.1)'}`, borderRadius: 8, padding: '6px 10px', color: '#d4d4d8', fontSize: '0.78rem', colorScheme: 'dark' }}
                />
                <button
                    onClick={() => { if (customFrom && customTo && new Date(customTo) > new Date(customFrom)) { setIsCustom(true); setTfOpen(false); } }}
                    style={{ background: 'var(--primary-color)', border: 'none', borderRadius: 8, padding: '7px 16px', color: '#fff', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer', boxShadow: '0 2px 8px rgba(99,102,241,0.3)' }}>
                    Apply
                </button>
                {isCustom && (
                    <button
                        onClick={() => { setIsCustom(false); setCustomFrom(''); setCustomTo(''); }}
                        style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 8, padding: '7px 14px', color: '#f87171', fontSize: '0.78rem', cursor: 'pointer', fontWeight: 600 }}>
                        ✕ Clear Custom
                    </button>
                )}
                {isCustom && (
                    <span style={{ fontSize: '0.72rem', color: '#6366f1', fontWeight: 600, marginLeft: 'auto', background: 'rgba(99,102,241,0.1)', padding: '4px 10px', borderRadius: 20, border: '1px solid rgba(99,102,241,0.2)' }}>
                        Custom range active
                    </span>
                )}
            </div>

            {/* ── STAT CARDS ── */}
            <div style={{ display: 'flex', gap: 14, marginBottom: 20, flexWrap: 'wrap' }}>
                <StatCard label="Page Views" value={pageViews.toLocaleString()} sub="Total page loads" color="#6366f1"
                    icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>} />
                <StatCard label="Visits" value={visits.toLocaleString()} sub="Total sessions" color="#8b5cf6"
                    icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg>} />
                <StatCard label="Unique Visitors" value={uniqueVisitors.toLocaleString()} sub="Distinct sessions" color="#3b82f6"
                    icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>} />
                <StatCard label="Bounce Rate" value={`${bounceRate.toFixed(2)}%`} sub="Single-page sessions" color="#f59e0b"
                    icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="17 1 21 5 17 9" /><path d="M3 11V9a4 4 0 0 1 4-4h14" /><polyline points="7 23 3 19 7 15" /><path d="M21 13v2a4 4 0 0 1-4 4H3" /></svg>} />
            </div>

            {/* ── TRAFFIC CHART ── */}
            <GlassCard title="📈 Traffic Overview" style={{ marginBottom: 20 }}>
                {chartData.every(d => d.views === 0) ? <Empty /> : (
                    <ResponsiveContainer width="100%" height={220}>
                        <AreaChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                            <defs>
                                <linearGradient id="gV" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="gU" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.2} />
                                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                            <XAxis dataKey="time" tick={{ fill: '#52525b', fontSize: 11 }} axisLine={false} tickLine={false} />
                            <YAxis allowDecimals={false} tick={{ fill: '#52525b', fontSize: 11 }} axisLine={false} tickLine={false} />
                            <Tooltip content={<ChartTooltip />} />
                            <Area type="monotone" dataKey="views" name="Views" stroke="#6366f1" strokeWidth={2} fill="url(#gV)" dot={false} />
                            <Area type="monotone" dataKey="visitors" name="Visitors" stroke="#8b5cf6" strokeWidth={2} fill="url(#gU)" dot={false} />
                        </AreaChart>
                    </ResponsiveContainer>
                )}
            </GlassCard>

            {/* ── TABS: Overview | Map | Referrers ── */}
            <div style={{ display: 'flex', gap: 6, marginBottom: 16, background: 'rgba(15,15,20,0.5)', borderRadius: 12, padding: 5, width: 'fit-content' }}>
                {(['overview', 'map', 'referrers'] as const).map(tab => (
                    <button key={tab} onClick={() => setActiveTab(tab)} style={{
                        background: activeTab === tab ? 'var(--primary-color)' : 'transparent',
                        border: 'none', borderRadius: 8, padding: '7px 18px', color: activeTab === tab ? '#fff' : '#71717a',
                        fontWeight: activeTab === tab ? 700 : 400, fontSize: '0.82rem', cursor: 'pointer', transition: 'all 0.15s', textTransform: 'capitalize',
                    }}>{tab === 'map' ? '🗺 World Map' : tab === 'referrers' ? '🔗 Referrers' : '📊 Overview'}</button>
                ))}
            </div>

            {/* ── OVERVIEW TAB ── */}
            {activeTab === 'overview' && (
                <>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
                        <GlassCard title="📄 Top Pages">
                            {topPages.length === 0 ? <Empty /> : topPages.map((p, i) => <BarRow key={p.label} label={p.label} count={p.count} pct={p.pct} color={P[i % P.length]} />)}
                        </GlassCard>
                        <GlassCard title="🌐 Visitor Browsers">
                            {topBrowsers.length === 0 ? <Empty /> : topBrowsers.map((b, i) => <BarRow key={b.label} label={b.label} count={b.count} pct={b.pct} color={P[i % P.length]} icon={BROWSER_ICONS[b.label]} />)}
                        </GlassCard>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                        <GlassCard title="💻 Visitor OS">
                            {topOS.length === 0 ? <Empty /> : topOS.map((o, i) => <BarRow key={o.label} label={o.label} count={o.count} pct={o.pct} color={P[i % P.length]} icon={OS_ICONS[o.label]} />)}
                        </GlassCard>
                        <GlassCard title="📱 Devices">
                            {topDevices.length === 0 ? <Empty /> : (
                                <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
                                    <PieChart width={120} height={120}>
                                        <Pie data={devicePie} cx={55} cy={55} innerRadius={35} outerRadius={55} dataKey="value" strokeWidth={0}>
                                            {devicePie.map((e, i) => <Cell key={i} fill={e.fill} />)}
                                        </Pie>
                                    </PieChart>
                                    <div style={{ flex: 1 }}>
                                        {topDevices.map((d, i) => (
                                            <div key={d.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                                                <span style={{ fontSize: '0.82rem', color: '#d4d4d8', display: 'flex', alignItems: 'center', gap: 6 }}>
                                                    <div style={{ width: 9, height: 9, borderRadius: '50%', background: P[i] }} />{DEVICE_ICONS[d.label]} {d.label}
                                                </span>
                                                <span style={{ fontSize: '0.78rem', color: '#71717a' }}>{d.pct.toFixed(1)}%</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </GlassCard>
                    </div>
                </>
            )}

            {/* ── MAP TAB ── */}
            {activeTab === 'map' && (
                <GlassCard title="🌍 Visitor Countries — Interactive World Map">
                    <WorldMap data={countryMapData} />
                    <div style={{ marginTop: 20 }}>
                        {topN(events.map(e => e.country)).length === 0 ? <Empty /> :
                            topN(events.map(e => e.country)).map((c, i) => <BarRow key={c.label} label={c.label} count={c.count} pct={c.pct} color={P[i % P.length]} />)
                        }
                    </div>
                </GlassCard>
            )}

            {/* ── REFERRERS TAB ── */}
            {activeTab === 'referrers' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                    <GlassCard title="🔗 Top Referrers">
                        {topReferrers.length === 0 ? <Empty /> : topReferrers.map((r, i) => (
                            <BarRow key={r.label} label={r.label} count={r.count} pct={r.pct} color={P[i % P.length]} icon={REF_ICONS[r.label] || '🌐'} />
                        ))}
                    </GlassCard>
                    <GlassCard title="📊 Referrer Sources — Breakdown">
                        {topReferrers.length === 0 ? <Empty /> : (
                            <>
                                <PieChart width={160} height={160} style={{ margin: '0 auto 16px', display: 'block' }}>
                                    <Pie data={topReferrers.map((r, i) => ({ name: r.label, value: r.count, fill: P[i % P.length] }))} cx={75} cy={75} innerRadius={45} outerRadius={72} dataKey="value" strokeWidth={0}>
                                        {topReferrers.map((_, i) => <Cell key={i} fill={P[i % P.length]} />)}
                                    </Pie>
                                </PieChart>
                                {topReferrers.map((r, i) => (
                                    <div key={r.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                            <div style={{ width: 10, height: 10, borderRadius: '50%', background: P[i % P.length], flexShrink: 0 }} />
                                            <span style={{ fontSize: '0.82rem', color: '#d4d4d8' }}>{REF_ICONS[r.label] || '🌐'} {r.label}</span>
                                        </div>
                                        <span style={{ fontSize: '0.78rem', color: '#71717a' }}>{r.pct.toFixed(1)}%</span>
                                    </div>
                                ))}
                            </>
                        )}
                    </GlassCard>
                </div>
            )}

            <style>{`@keyframes pulseGreen { 0%,100%{box-shadow:0 0 6px #10b981;opacity:1}50%{box-shadow:0 0 14px #10b981;opacity:0.7}}`}</style>
        </div>
    );
};

export default VisitorAnalytics;
