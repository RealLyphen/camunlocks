import React, { useState, useMemo } from 'react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar
} from 'recharts';
import { format, eachDayOfInterval } from 'date-fns';
import { useStore } from '../../context/StoreContext';

/* ─── helpers ─── */
const P = ['#6366f1', '#8b5cf6', '#3b82f6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'];

const GlassCard = ({ title, children, style }: { title?: string; children: React.ReactNode; style?: React.CSSProperties }) => (
    <div style={{ background: 'rgba(15,15,20,0.6)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: '22px 24px', ...style }}>
        {title && <h3 style={{ margin: '0 0 18px', fontSize: '0.9rem', fontWeight: 700, color: '#e4e4e7', letterSpacing: 0.3 }}>{title}</h3>}
        {children}
    </div>
);

const StatCard = ({ label, value, sub, icon, color, delta }: { label: string; value: string; sub?: string; icon: React.ReactNode; color: string; delta?: string }) => (
    <div style={{ background: 'rgba(15,15,20,0.6)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: '22px 24px', flex: 1, minWidth: 0, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', bottom: -20, left: -20, width: 80, height: 80, borderRadius: '50%', background: color, opacity: 0.12, filter: 'blur(20px)' }} />
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#71717a', textTransform: 'uppercase', letterSpacing: 0.8 }}>{label}</span>
            <div style={{ width: 34, height: 34, borderRadius: 10, background: `${color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', color }}>{icon}</div>
        </div>
        <div style={{ fontSize: '2rem', fontWeight: 800, color: '#fff', lineHeight: 1, marginBottom: 8 }}>{value}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {delta && <span style={{ fontSize: '0.72rem', color: '#10b981', fontWeight: 600, background: '#10b98120', padding: '2px 7px', borderRadius: 20 }}>{delta}</span>}
            {sub && <span style={{ fontSize: '0.72rem', color: '#52525b' }}>{sub}</span>}
        </div>
    </div>
);

const ChartTip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
        <div style={{ background: 'rgba(10,10,16,0.97)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '10px 14px' }}>
            <div style={{ fontSize: '0.72rem', color: '#71717a', marginBottom: 6 }}>{label}</div>
            {payload.map((p: any) => (
                <div key={p.name} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: p.color }} />
                    <span style={{ fontSize: '0.8rem', color: '#d4d4d8' }}>{p.name}:</span>
                    <span style={{ fontSize: '0.8rem', color: '#fff', fontWeight: 700 }}>{typeof p.value === 'number' && p.name.toLowerCase().includes('rev') ? `$${p.value.toFixed(2)}` : p.value}</span>
                </div>
            ))}
        </div>
    );
};

const Empty = ({ text = 'No data for this period' }: { text?: string }) => (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 48, gap: 8 }}>
        <span style={{ fontSize: 28 }}>📭</span>
        <div style={{ fontSize: '0.82rem', color: '#52525b' }}>{text}</div>
    </div>
);

/* ─── time bucket options ─── */
const BUCKETS = [
    { label: '1h', days: 0, hours: 1 },
    { label: '6h', days: 0, hours: 6 },
    { label: '24h', days: 1, hours: 0 },
    { label: '7d', days: 7, hours: 0 },
    { label: '30d', days: 30, hours: 0 },
    { label: '90d', days: 90, hours: 0 },
];

/* ─── main component ─── */
const Analytics: React.FC = () => {
    const { settings } = useStore();
    const products = (settings as any).products || [];

    const [bucketIdx, setBucketIdx] = useState(3); // default 7d
    const [customFrom, setCustomFrom] = useState('');
    const [customTo, setCustomTo] = useState('');
    const [useCustom, setUseCustom] = useState(false);
    const [chartType, setChartType] = useState<'area' | 'bar'>('area');

    /* date range */
    const { from, to } = useMemo(() => {
        if (useCustom && customFrom && customTo) {
            const f = new Date(customFrom), t = new Date(customTo);
            if (!isNaN(f.getTime()) && !isNaN(t.getTime()) && t > f) return { from: f, to: t };
        }
        const b = BUCKETS[bucketIdx];
        const t = new Date();
        const f = new Date(t.getTime() - (b.days * 86400 + b.hours * 3600) * 1000);
        return { from: f, to: t };
    }, [bucketIdx, useCustom, customFrom, customTo]);

    /* generate daily buckets for chart */
    const chartData = useMemo(() => {
        const diffMs = to.getTime() - from.getTime();
        const diffDays = diffMs / 86400000;
        if (diffDays <= 2) {
            // hourly buckets
            const hours = Math.ceil(diffMs / 3600000);
            return Array.from({ length: Math.min(hours, 48) }, (_, i) => ({
                time: format(new Date(from.getTime() + i * 3600000), 'HH:mm'),
                revenue: 0, orders: 0,
            }));
        }
        // daily buckets
        const days = eachDayOfInterval({ start: from, end: to });
        return days.map(d => ({ time: format(d, 'MMM d'), revenue: 0, orders: 0 }));
    }, [from, to]);

    /* stats  (all 0 since no real orders – ready for integration) */
    const stats = { revenue: 0, orders: 0, avgOrderValue: 0, newCustomers: 0, recurringRate: 0, refundRate: 0 };

    return (
        <div style={{ padding: '0 0 48px', fontFamily: 'Inter,sans-serif', color: '#fff' }}>

            {/* ── HEADER ── */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
                <div>
                    <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800, background: 'linear-gradient(135deg,#fff,#a1a1aa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                        Store Analytics
                    </h1>
                    <p style={{ margin: '4px 0 0', fontSize: '0.78rem', color: '#52525b' }}>
                        Revenue · Orders · Customers
                    </p>
                </div>

                {/* Controls */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                    {/* Date range display */}
                    <div style={{ background: 'rgba(15,15,20,0.7)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '8px 14px', fontSize: '0.78rem', color: '#71717a' }}>
                        📅 {format(from, 'dd MMM yyyy HH:mm')} → {format(to, 'dd MMM yyyy HH:mm')}
                    </div>

                    {/* Time bucket pills */}
                    <div style={{ background: 'rgba(15,15,20,0.6)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 10, padding: 4, display: 'flex', gap: 3 }}>
                        {BUCKETS.map((b, i) => (
                            <button key={b.label} onClick={() => { setBucketIdx(i); setUseCustom(false); }} style={{
                                background: (!useCustom && bucketIdx === i) ? 'var(--primary-color)' : 'transparent',
                                border: 'none', borderRadius: 7, padding: '5px 11px', color: (!useCustom && bucketIdx === i) ? '#fff' : '#71717a',
                                fontWeight: (!useCustom && bucketIdx === i) ? 700 : 400, fontSize: '0.78rem', cursor: 'pointer',
                            }}>{b.label}</button>
                        ))}
                    </div>

                    {/* Chart type toggle */}
                    <div style={{ background: 'rgba(15,15,20,0.6)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 10, padding: 4, display: 'flex', gap: 3 }}>
                        {(['area', 'bar'] as const).map(t => (
                            <button key={t} onClick={() => setChartType(t)} style={{
                                background: chartType === t ? 'rgba(99,102,241,0.2)' : 'transparent',
                                border: chartType === t ? '1px solid rgba(99,102,241,0.3)' : '1px solid transparent',
                                borderRadius: 7, padding: '5px 11px', color: chartType === t ? '#818cf8' : '#71717a',
                                fontSize: '0.78rem', cursor: 'pointer', fontWeight: chartType === t ? 700 : 400,
                            }}>{t === 'area' ? '〰 Area' : '▦ Bar'}</button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Custom date range */}
            <div style={{ marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.78rem', color: '#52525b' }}>Custom range:</span>
                <input type="datetime-local" value={customFrom} onChange={e => setCustomFrom(e.target.value)}
                    style={{ background: 'rgba(15,15,20,0.7)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '6px 10px', color: '#d4d4d8', fontSize: '0.78rem', colorScheme: 'dark' }} />
                <span style={{ color: '#52525b', fontSize: '0.78rem' }}>→</span>
                <input type="datetime-local" value={customTo} onChange={e => setCustomTo(e.target.value)}
                    style={{ background: 'rgba(15,15,20,0.7)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '6px 10px', color: '#d4d4d8', fontSize: '0.78rem', colorScheme: 'dark' }} />
                <button onClick={() => { if (customFrom && customTo) setUseCustom(true); }}
                    style={{ background: 'var(--primary-color)', border: 'none', borderRadius: 8, padding: '7px 14px', color: '#fff', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer' }}>
                    Apply
                </button>
                {useCustom && (
                    <button onClick={() => { setUseCustom(false); setCustomFrom(''); setCustomTo(''); }}
                        style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, padding: '7px 12px', color: '#f87171', fontSize: '0.78rem', cursor: 'pointer' }}>
                        Clear
                    </button>
                )}
            </div>

            {/* ── STAT CARDS ── */}
            <div style={{ display: 'flex', gap: 14, marginBottom: 20, flexWrap: 'wrap' }}>
                <StatCard label="Revenue" value={`$${stats.revenue.toFixed(2)}`} sub="Total earnings" color="#6366f1" delta="+0%"
                    icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>} />
                <StatCard label="Orders" value={stats.orders.toLocaleString()} sub="Total completed" color="#8b5cf6" delta="+0%"
                    icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 0 1-8 0" /></svg>} />
                <StatCard label="Avg Order Value" value={`$${stats.avgOrderValue.toFixed(2)}`} sub="Per transaction" color="#3b82f6"
                    icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg>} />
                <StatCard label="New Customers" value={stats.newCustomers.toLocaleString()} sub="This period" color="#10b981"
                    icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><line x1="19" y1="8" x2="19" y2="14" /><line x1="22" y1="11" x2="16" y2="11" /></svg>} />
            </div>

            {/* ── SALES VOLUME CHART ── */}
            <GlassCard style={{ marginBottom: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18, flexWrap: 'wrap', gap: 8 }}>
                    <div>
                        <h3 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 700, color: '#e4e4e7' }}>📈 Sales Volume</h3>
                        <div style={{ fontSize: '2rem', fontWeight: 800, color: '#fff', marginTop: 6 }}>
                            ${stats.revenue.toFixed(2)}
                            <span style={{ fontSize: '0.85rem', fontWeight: 400, color: '#52525b', marginLeft: 10 }}>from $0.00</span>
                        </div>
                    </div>
                </div>
                {chartData.every(d => d.revenue === 0) ? (
                    <Empty text="No sales data — orders will appear here once customers start buying" />
                ) : (
                    <ResponsiveContainer width="100%" height={220}>
                        {chartType === 'area' ? (
                            <AreaChart data={chartData} margin={{ top: 0, right: 0, left: -15, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="gRev" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.35} />
                                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                                <XAxis dataKey="time" tick={{ fill: '#52525b', fontSize: 11 }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fill: '#52525b', fontSize: 11 }} axisLine={false} tickLine={false} />
                                <Tooltip content={<ChartTip />} />
                                <Area type="monotone" dataKey="revenue" name="Revenue (USD)" stroke="#6366f1" strokeWidth={2} fill="url(#gRev)" dot={false} />
                            </AreaChart>
                        ) : (
                            <BarChart data={chartData} margin={{ top: 0, right: 0, left: -15, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                                <XAxis dataKey="time" tick={{ fill: '#52525b', fontSize: 11 }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fill: '#52525b', fontSize: 11 }} axisLine={false} tickLine={false} />
                                <Tooltip content={<ChartTip />} />
                                <Bar dataKey="revenue" name="Revenue (USD)" fill="#6366f1" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        )}
                    </ResponsiveContainer>
                )}
            </GlassCard>

            {/* ── ORDER VOLUME CHART ── */}
            <GlassCard style={{ marginBottom: 20 }}>
                <div style={{ marginBottom: 18 }}>
                    <h3 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 700, color: '#e4e4e7' }}>🛍️ Order Volume</h3>
                    <div style={{ fontSize: '2rem', fontWeight: 800, color: '#fff', marginTop: 6 }}>
                        {stats.orders}
                        <span style={{ fontSize: '0.85rem', fontWeight: 400, color: '#52525b', marginLeft: 10 }}>total orders</span>
                    </div>
                </div>
                <Empty text="Orders will appear here once customers start buying" />
            </GlassCard>

            {/* ── BOTTOM ROW ── */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                {/* Top Products */}
                <GlassCard title="🏆 Top Products">
                    {products.length === 0 ? <Empty text="No products yet — add products to see performance" /> : (
                        products.slice(0, 6).map((p: any, i: number) => (
                            <div key={p.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, padding: '10px 12px', background: 'rgba(255,255,255,0.03)', borderRadius: 10 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                    <div style={{ width: 28, height: 28, borderRadius: 8, background: `${P[i % P.length]}25`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 800, color: P[i % P.length] }}>{i + 1}</div>
                                    <div>
                                        <div style={{ fontSize: '0.82rem', color: '#e4e4e7', fontWeight: 600 }}>{p.name}</div>
                                        <div style={{ fontSize: '0.72rem', color: '#52525b' }}>{p.status}</div>
                                    </div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontSize: '0.88rem', color: '#fff', fontWeight: 700 }}>${p.price?.toFixed(2)}</div>
                                    <div style={{ fontSize: '0.7rem', color: '#52525b' }}>0 sold</div>
                                </div>
                            </div>
                        ))
                    )}
                </GlassCard>

                {/* Conversion + Recurring */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <GlassCard title="🔁 Recurring Customer Rate">
                        <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#fff', marginBottom: 4 }}>0%</div>
                        <div style={{ fontSize: '0.78rem', color: '#52525b', marginBottom: 18 }}>from 0%</div>
                        <div style={{ height: 6, background: 'rgba(255,255,255,0.05)', borderRadius: 3 }}>
                            <div style={{ height: '100%', width: '0%', background: 'linear-gradient(90deg,#10b981,#06b6d4)', borderRadius: 3 }} />
                        </div>
                    </GlassCard>
                    <GlassCard title="⚡ Conversion Funnel">
                        {[
                            { label: 'Browsed', value: 0, color: '#6366f1' },
                            { label: 'Added to Cart', value: 0, color: '#8b5cf6' },
                            { label: 'Checked Out', value: 0, color: '#3b82f6' },
                            { label: 'Purchased', value: 0, color: '#10b981' },
                        ].map(row => (
                            <div key={row.label} style={{ marginBottom: 10 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                                    <span style={{ fontSize: '0.8rem', color: '#d4d4d8' }}>{row.label}</span>
                                    <span style={{ fontSize: '0.78rem', color: '#71717a' }}>{row.value} (0%)</span>
                                </div>
                                <div style={{ height: 5, background: 'rgba(255,255,255,0.05)', borderRadius: 3 }}>
                                    <div style={{ height: '100%', width: '0%', background: `linear-gradient(90deg,${row.color},${row.color}80)`, borderRadius: 3 }} />
                                </div>
                            </div>
                        ))}
                    </GlassCard>
                </div>
            </div>
        </div>
    );
};

export default Analytics;
