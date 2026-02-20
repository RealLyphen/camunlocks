import React, { useState, useMemo, useCallback } from 'react';
import { format, subDays, isWithinInterval, startOfDay } from 'date-fns';
import { useStore } from '../../context/StoreContext';
import { exportCustomers } from '../utils/csvExport';

/* ─────────────────────────────────────────────────────────────
   TYPES & UTILS
   ───────────────────────────────────────────────────────────── */
type SortKey = 'email' | 'productsBought' | 'lastPurchaseDate' | 'firstPurchaseDate' | 'amountSpent';
type SortDir = 'asc' | 'desc';
type DateRange = 'today' | '7d' | '30d' | '90d' | 'all';

function initials(email: string) {
    return email.slice(0, 2).toUpperCase();
}

const STATUS_COLORS: Record<string, string> = {
    active: '#10b981',
    inactive: '#71717a',
    banned: '#ef4444',
};

const AVATAR_BG = ['#6366f1', '#8b5cf6', '#3b82f6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899'];
function avatarColor(email: string) {
    let h = 0;
    for (let i = 0; i < email.length; i++) h += email.charCodeAt(i);
    return AVATAR_BG[h % AVATAR_BG.length];
}

/* ─────────────────────────────────────────────────────────────
   SUBCOMPONENTS
   ───────────────────────────────────────────────────────────── */
const GlassCard = ({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) => (
    <div style={{ background: 'rgba(15,15,20,0.6)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, ...style }}>
        {children}
    </div>
);

const StatCard = ({ label, value, icon, color, sub }: { label: string; value: string | number; icon: React.ReactNode; color: string; sub?: string }) => (
    <GlassCard style={{ padding: '22px 24px', flex: 1, minWidth: 0, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -20, right: -20, width: 90, height: 90, borderRadius: '50%', background: color, opacity: 0.1, filter: 'blur(20px)' }} />
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: `${color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', color, flexShrink: 0 }}>{icon}</div>
        </div>
        <div style={{ fontSize: '2.2rem', fontWeight: 900, color: '#fff', lineHeight: 1, marginBottom: 6 }}>{value}</div>
        <div style={{ fontSize: '0.78rem', fontWeight: 600, color: '#71717a', textTransform: 'uppercase', letterSpacing: 0.8 }}>{label}</div>
        {sub && <div style={{ fontSize: '0.72rem', color: '#3f3f46', marginTop: 4 }}>{sub}</div>}
    </GlassCard>
);

const SortIcon = ({ active, dir }: { active: boolean; dir: SortDir }) => (
    <span style={{ opacity: active ? 1 : 0.35, marginLeft: 4, fontSize: '0.7rem', color: active ? '#6366f1' : '#71717a' }}>
        {active && dir === 'asc' ? '↑' : '↓'}
    </span>
);

/* ─────────────────────────────────────────────────────────────
   ADD CUSTOMER MODAL
   ───────────────────────────────────────────────────────────── */
interface AddModalProps {
    onClose: () => void;
    onAdd: (c: Customer) => void;
}
const AddModal: React.FC<AddModalProps> = ({ onClose, onAdd }) => {
    const [form, setForm] = useState({ email: '', productsBought: '0', amountSpent: '0', country: '', status: 'active' as Customer['status'] });
    const [err, setErr] = useState('');

    const submit = () => {
        if (!form.email || !form.email.includes('@')) { setErr('Valid email required'); return; }
        onAdd({
            id: makeId(),
            email: form.email.trim().toLowerCase(),
            productsBought: Math.max(0, parseInt(form.productsBought) || 0),
            amountSpent: Math.max(0, parseFloat(form.amountSpent) || 0),
            country: form.country.trim() || 'Unknown',
            status: form.status,
            firstPurchaseDate: new Date().toISOString(),
            lastPurchaseDate: parseInt(form.productsBought) > 0 ? new Date().toISOString() : null,
        });
        onClose();
    };

    const field = (label: string, key: keyof typeof form, type = 'text', placeholder = '') => (
        <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: '0.78rem', color: '#71717a', marginBottom: 6, fontWeight: 600 }}>{label}</label>
            {key === 'status' ? (
                <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as any }))}
                    style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '9px 12px', color: '#e4e4e7', fontSize: '0.85rem' }}>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="banned">Banned</option>
                </select>
            ) : (
                <input type={type} placeholder={placeholder} value={form[key]}
                    onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                    style={{ width: '100%', boxSizing: 'border-box', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '9px 12px', color: '#e4e4e7', fontSize: '0.85rem', outline: 'none' }} />
            )}
        </div>
    );

    return (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ background: 'rgba(12,12,18,0.98)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 20, padding: 32, width: 460, maxWidth: '90vw', boxShadow: '0 30px 80px rgba(0,0,0,0.7)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
                    <h2 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#fff' }}>Add Customer</h2>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#71717a', cursor: 'pointer', fontSize: '1.4rem', lineHeight: 1 }}>✕</button>
                </div>
                {field('Email Address', 'email', 'email', 'customer@example.com')}
                {field('Products Bought', 'productsBought', 'number', '0')}
                {field('Amount Spent ($)', 'amountSpent', 'number', '0.00')}
                {field('Country', 'country', 'text', 'United States')}
                {field('Status', 'status')}
                {err && <div style={{ color: '#f87171', fontSize: '0.78rem', marginBottom: 12 }}>{err}</div>}
                <div style={{ display: 'flex', gap: 10 }}>
                    <button onClick={onClose} style={{ flex: 1, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '10px 0', color: '#a1a1aa', cursor: 'pointer', fontWeight: 600 }}>Cancel</button>
                    <button onClick={submit} style={{ flex: 2, background: 'linear-gradient(135deg,var(--primary-color),var(--secondary-color))', border: 'none', borderRadius: 10, padding: '10px 0', color: '#fff', cursor: 'pointer', fontWeight: 700, boxShadow: '0 4px 15px rgba(99,102,241,0.35)' }}>Add Customer</button>
                </div>
            </div>
        </div>
    );
};

/* ─────────────────────────────────────────────────────────────
   CUSTOMER DETAIL DRAWER
   ───────────────────────────────────────────────────────────── */
const CustomerDrawer: React.FC<{ customer: any; onClose: () => void }> = ({ customer, onClose }) => {
    const { updateUser } = useStore();
    const [editing, setEditing] = useState(false);
    const [tab, setTab] = useState<'overview' | 'orders' | 'credit'>('overview');
    const [form, setForm] = useState({ tags: (customer.tags || []).join(', ') });
    const [creditAmt, setCreditAmt] = useState('');

    const save = () => {
        const tags = form.tags.split(',').map((t: string) => t.trim()).filter(Boolean);
        updateUser(customer.id, { tags });
        setEditing(false);
    };

    const handleAddCredit = () => {
        const amt = parseFloat(creditAmt);
        if (isNaN(amt) || amt === 0) return;
        updateUser(customer.id, { balance: (customer.balance || 0) + amt });
        setCreditAmt('');
        alert(`Successfully added $${amt.toFixed(2)} store credit to ${customer.email}.`);
    };

    const bg = avatarColor(customer.email);

    return (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', justifyContent: 'flex-end' }}>
            <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }} />
            <div style={{ position: 'relative', width: 450, maxWidth: '90vw', height: '100vh', background: 'rgba(10,10,18,0.98)', borderLeft: '1px solid rgba(255,255,255,0.08)', boxShadow: '-20px 0 60px rgba(0,0,0,0.5)', overflowY: 'auto', padding: 28 }}>
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
                    <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: '#e4e4e7' }}>Customer Profile</h3>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#71717a', cursor: 'pointer', fontSize: '1.3rem' }}>✕</button>
                </div>

                {/* Avatar & Basic Info */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 20 }}>
                    <div style={{ width: 72, height: 72, borderRadius: 20, background: `linear-gradient(135deg,${bg},${bg}aa)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.6rem', fontWeight: 800, color: '#fff', marginBottom: 14, boxShadow: `0 8px 24px ${bg}50` }}>
                        {initials(customer.email)}
                    </div>
                    <div style={{ fontWeight: 700, color: '#fff', fontSize: '1.1rem' }}>{customer.email}</div>
                    <div style={{ display: 'flex', gap: 6, marginTop: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
                        {(customer.tags || []).map((t: string) => (
                            <span key={t} style={{ padding: '4px 12px', borderRadius: 20, background: 'rgba(99,102,241,0.15)', color: '#818cf8', fontSize: '0.75rem', fontWeight: 600 }}>{t}</span>
                        ))}
                    </div>
                </div>

                {/* Tabs */}
                <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.08)', marginBottom: 24 }}>
                    {[
                        { id: 'overview', label: 'Overview' },
                        { id: 'orders', label: `Orders (${customer.orders.length})` },
                        { id: 'credit', label: 'Store Credit' },
                    ].map(t => (
                        <button key={t.id} onClick={() => setTab(t.id as any)} style={{
                            flex: 1, background: 'none', border: 'none', padding: '12px 0', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600,
                            color: tab === t.id ? '#fff' : '#71717a',
                            borderBottom: tab === t.id ? '2px solid var(--primary-color)' : '2px solid transparent',
                        }}>
                            {t.label}
                        </button>
                    ))}
                </div>

                {tab === 'overview' && (
                    <>
                        {/* Stats */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 24 }}>
                            {[
                                ['Products Bought', customer.productsBought],
                                ['Amount Spent', `$${customer.amountSpent.toFixed(2)}`],
                                ['Current Balance', `$${(customer.balance || 0).toFixed(2)}`],
                                ['Customer Since', customer.firstPurchaseDate ? format(new Date(customer.firstPurchaseDate), 'dd MMM yyyy') : '—'],
                            ].map(([label, val]) => (
                                <div key={label as string} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10, padding: '14px 16px' }}>
                                    <div style={{ fontSize: '0.68rem', color: '#71717a', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.8 }}>{label}</div>
                                    <div style={{ fontWeight: 700, color: '#fff', fontSize: '1.05rem' }}>{val}</div>
                                </div>
                            ))}
                        </div>
                        {/* Edit form */}
                        {editing ? (
                            <>
                                <div style={{ marginBottom: 12 }}>
                                    <label style={{ display: 'block', fontSize: '0.75rem', color: '#71717a', marginBottom: 6 }}>Tags (comma separated)</label>
                                    <input value={form.tags} onChange={e => setForm({ tags: e.target.value })}
                                        placeholder="VIP, Wholesale, Banned..."
                                        style={{ width: '100%', boxSizing: 'border-box', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8, padding: '10px 12px', color: '#e4e4e7', fontSize: '0.85rem' }} />
                                </div>
                                <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
                                    <button onClick={() => setEditing(false)} style={{ flex: 1, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '9px 0', color: '#a1a1aa', cursor: 'pointer' }}>Cancel</button>
                                    <button onClick={save} style={{ flex: 2, background: 'var(--primary-color)', border: 'none', borderRadius: 8, padding: '9px 0', color: '#fff', cursor: 'pointer', fontWeight: 700 }}>Save Changes</button>
                                </div>
                            </>
                        ) : (
                            <button onClick={() => setEditing(true)} style={{ width: '100%', background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.25)', borderRadius: 10, padding: '12px 0', color: '#818cf8', cursor: 'pointer', fontWeight: 600 }}>
                                ✏️ Edit Customer Tags
                            </button>
                        )}
                    </>
                )}

                {tab === 'orders' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {customer.orders.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '30px', color: '#71717a' }}>No orders found for this customer.</div>
                        ) : (
                            customer.orders.map((o: any) => (
                                <div key={o.id} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: 16 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: '0.85rem' }}>
                                        <span style={{ color: '#fff', fontWeight: 700 }}>#{o.id}</span>
                                        <span style={{ color: '#a1a1aa' }}>{format(new Date(o.date), 'dd MMM yyyy')}</span>
                                    </div>
                                    <div style={{ fontSize: '0.8rem', color: '#71717a', marginBottom: 8 }}>
                                        {o.items.map((i: any) => `${i.quantity}x ${i.name}`).join(', ')}
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ color: '#4ade80', fontWeight: 700 }}>${o.total.toFixed(2)}</span>
                                        <span style={{ padding: '2px 8px', borderRadius: 4, background: 'rgba(16,185,129,0.15)', color: '#10b981', fontSize: '0.7rem' }}>PAID</span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}

                {tab === 'credit' && (
                    <div>
                        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: 20, textAlign: 'center', marginBottom: 20 }}>
                            <div style={{ fontSize: '0.8rem', color: '#71717a', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 6 }}>Current Balance</div>
                            <div style={{ fontSize: '2.5rem', fontWeight: 900, color: '#fff' }}>${(customer.balance || 0).toFixed(2)}</div>
                        </div>

                        <label style={{ display: 'block', fontSize: '0.8rem', color: '#e4e4e7', marginBottom: 8, fontWeight: 600 }}>Adjust Store Credit (+/-)</label>
                        <div style={{ display: 'flex', gap: 10 }}>
                            <input
                                type="number"
                                step="0.01"
                                placeholder="E.g. 50 or -10"
                                value={creditAmt}
                                onChange={e => setCreditAmt(e.target.value)}
                                style={{ flex: 1, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8, padding: '10px 12px', color: '#fff', fontSize: '0.9rem' }}
                            />
                            <button onClick={handleAddCredit} style={{ background: 'linear-gradient(135deg,var(--primary-color),var(--secondary-color))', border: 'none', borderRadius: 8, padding: '0 20px', color: '#fff', fontWeight: 700, cursor: 'pointer' }}>Apply</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

/* ─────────────────────────────────────────────────────────────
   MAIN PAGE
   ───────────────────────────────────────────────────────────── */
const COLUMNS = [
    { key: 'email' as SortKey, label: 'Email' },
    { key: 'productsBought' as SortKey, label: 'Products Bought' },
    { key: 'lastPurchaseDate' as SortKey, label: 'Last Purchase' },
    { key: 'firstPurchaseDate' as SortKey, label: 'First Purchase' },
    { key: 'amountSpent' as SortKey, label: 'Amount Spent' },
];

const DATE_RANGES: { label: string; value: DateRange }[] = [
    { label: 'Today', value: 'today' },
    { label: '7 Days', value: '7d' },
    { label: '30 Days', value: '30d' },
    { label: '90 Days', value: '90d' },
    { label: 'All Time', value: 'all' },
];

const Customers: React.FC = () => {
    const { users } = useStore();

    // Map store users to table customer format
    const customers = useMemo(() => {
        return users.map(u => {
            const productsBought = u.orders.reduce((sum, o) => sum + o.items.reduce((s, i) => s + i.quantity, 0), 0);
            const amountSpent = u.orders.reduce((sum, o) => sum + o.total, 0);
            const orderDates = u.orders.map(o => new Date(o.date).getTime()).sort((a, b) => a - b);
            const status = (u.tags || []).map(t => t.toLowerCase()).includes('banned') ? 'banned' : 'active';
            return {
                ...u,
                productsBought,
                amountSpent,
                firstPurchaseDate: orderDates.length > 0 ? new Date(orderDates[0]).toISOString() : u.createdAt,
                lastPurchaseDate: orderDates.length > 0 ? new Date(orderDates[orderDates.length - 1]).toISOString() : null,
                country: 'Unknown',
                status,
            };
        });
    }, [users]);

    const [search, setSearch] = useState('');

    /* date range filter */
    const dateFrom = useMemo(() => {
        if (dateRange === 'today') return startOfDay(new Date());
        if (dateRange === '7d') return startOfDay(subDays(new Date(), 7));
        if (dateRange === '30d') return startOfDay(subDays(new Date(), 30));
        if (dateRange === '90d') return startOfDay(subDays(new Date(), 90));
        return null;
    }, [dateRange]);

    /* filtered + sorted */
    const filtered = useMemo(() => {
        let list = [...customers];
        if (search) list = list.filter(c => c.email.toLowerCase().includes(search.toLowerCase()));
        if (statusFilter !== 'all') list = list.filter(c => c.status === statusFilter);
        if (dateFrom) {
            list = list.filter(c => {
                const d = c.firstPurchaseDate ? new Date(c.firstPurchaseDate) : null;
                return d && d >= dateFrom!;
            });
        }
        if (customFrom && customTo) {
            const cf = new Date(customFrom), ct = new Date(customTo);
            if (!isNaN(cf.getTime()) && !isNaN(ct.getTime())) {
                list = list.filter(c => {
                    const d = c.firstPurchaseDate ? new Date(c.firstPurchaseDate) : null;
                    return d && isWithinInterval(d, { start: cf, end: ct });
                });
            }
        }
        list.sort((a, b) => {
            const av = a[sortKey] ?? '';
            const bv = b[sortKey] ?? '';
            const cmp = av < bv ? -1 : av > bv ? 1 : 0;
            return sortDir === 'asc' ? cmp : -cmp;
        });
        return list;
    }, [customers, search, statusFilter, dateFrom, customFrom, customTo, sortKey, sortDir]);

    const total = filtered.length;
    const pages = Math.max(1, Math.ceil(total / pageSize));
    const pageData = filtered.slice((page - 1) * pageSize, page * pageSize);

    const recurringCount = customers.filter(c => c.productsBought > 1).length;

    const toggleSort = (key: SortKey) => {
        if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
        else { setSortKey(key); setSortDir('desc'); }
        setPage(1);
    };

    const formatDate = (d: string | null) => d ? format(new Date(d), 'dd MMM yyyy') : '—';
    const formatCurrency = (n: number) => `$${n.toFixed(2)}`;

    return (
        <div style={{ padding: '0 0 48px', fontFamily: 'Inter,sans-serif', color: '#fff' }}>

            {/* Modals */}
            {selected && <CustomerDrawer customer={selected} onClose={() => setSelected(null)} />}

            {/* ── HEADER ── */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28, gap: 12, flexWrap: 'wrap' }}>
                <div>
                    <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 900, background: 'linear-gradient(135deg,#fff,#a1a1aa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                        Customers
                    </h1>
                    <div style={{ marginTop: 4, fontSize: '0.78rem', color: '#52525b' }}>
                        {customers.length.toLocaleString()} total · {recurringCount} recurring
                    </div>
                </div>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                    {/* Date range pills */}
                    <div style={{ background: 'rgba(15,15,20,0.6)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 10, padding: 4, display: 'flex', gap: 3 }}>
                        {DATE_RANGES.map(r => (
                            <button key={r.value} onClick={() => { setDateRange(r.value); setPage(1); }} style={{
                                background: dateRange === r.value ? 'var(--primary-color)' : 'transparent',
                                border: 'none', borderRadius: 7, padding: '5px 12px', color: dateRange === r.value ? '#fff' : '#71717a',
                                fontWeight: dateRange === r.value ? 700 : 400, fontSize: '0.78rem', cursor: 'pointer',
                            }}>{r.label}</button>
                        ))}
                    </div>
                    <button onClick={() => exportCustomers(customers)} style={{
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '8px 18px', color: '#fff', fontWeight: 700,
                        fontSize: '0.84rem', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', gap: 7,
                    }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
                        Export CSV
                    </button>
                </div>
            </div>

            {/* ── STAT CARDS ── */}
            <div style={{ display: 'flex', gap: 14, marginBottom: 22, flexWrap: 'wrap' }}>
                <StatCard label="Total Customers" value={customers.length} color="#6366f1"
                    icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>}
                />
                <StatCard label="Recurring Customers" value={recurringCount} color="#8b5cf6" sub="Bought more than once"
                    icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="17 1 21 5 17 9" /><path d="M3 11V9a4 4 0 0 1 4-4h14" /><polyline points="7 23 3 19 7 15" /><path d="M21 13v2a4 4 0 0 1-4 4H3" /></svg>}
                />
                <StatCard label="Total Revenue" value={`$${customers.reduce((s, c) => s + c.amountSpent, 0).toFixed(2)}`} color="#3b82f6"
                    icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>}
                />
                <StatCard label="Avg. Spend" value={`$${customers.length ? (customers.reduce((s, c) => s + c.amountSpent, 0) / customers.length).toFixed(2) : '0.00'}`} color="#10b981" sub="Per customer"
                    icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg>}
                />
            </div>

            {/* ── FILTER / SEARCH BAR ── */}
            <GlassCard style={{ padding: '14px 18px', marginBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                    {/* Search */}
                    <div style={{ flex: 1, minWidth: 220, display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '0 12px' }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#71717a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
                        <input
                            value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
                            placeholder="Filter by email…"
                            style={{ flex: 1, background: 'none', border: 'none', outline: 'none', color: '#e4e4e7', fontSize: '0.84rem', padding: '9px 0' }}
                        />
                        {search && <button onClick={() => setSearch('')} style={{ background: 'none', border: 'none', color: '#52525b', cursor: 'pointer', fontSize: '1rem' }}>✕</button>}
                    </div>

                    {/* Status filter */}
                    <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value as any); setPage(1); }}
                        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 9, padding: '8px 12px', color: '#e4e4e7', fontSize: '0.82rem', cursor: 'pointer' }}>
                        <option value="all">All Status</option>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                        <option value="banned">Banned</option>
                    </select>

                    {/* Custom date range */}
                    <div style={{ position: 'relative' }}>
                        <button onClick={() => setFilterOpen(p => !p)} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 9, padding: '8px 14px', color: '#a1a1aa', cursor: 'pointer', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: 7 }}>
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" /></svg>
                            Filters
                        </button>
                        {filterOpen && (
                            <div style={{ position: 'absolute', top: 'calc(100% + 8px)', right: 0, zIndex: 100, background: 'rgba(10,10,16,0.98)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 14, padding: 20, minWidth: 280, backdropFilter: 'blur(30px)', boxShadow: '0 20px 60px rgba(0,0,0,0.7)' }}>
                                <div style={{ fontSize: '0.7rem', color: '#52525b', fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 10 }}>Custom Date Range</div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                    <input type="date" value={customFrom} onChange={e => setCustomFrom(e.target.value)}
                                        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '6px 10px', color: '#d4d4d8', fontSize: '0.78rem', colorScheme: 'dark' }} />
                                    <input type="date" value={customTo} onChange={e => setCustomTo(e.target.value)}
                                        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '6px 10px', color: '#d4d4d8', fontSize: '0.78rem', colorScheme: 'dark' }} />
                                    <button onClick={() => { setDateRange('all'); setFilterOpen(false); setPage(1); }}
                                        style={{ background: 'var(--primary-color)', border: 'none', borderRadius: 8, padding: '7px 0', color: '#fff', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer' }}>
                                        Apply
                                    </button>
                                    {(customFrom || customTo) && (
                                        <button onClick={() => { setCustomFrom(''); setCustomTo(''); }}
                                            style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, padding: '7px 0', color: '#f87171', fontSize: '0.78rem', cursor: 'pointer' }}>
                                            Clear Custom Range
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    <div style={{ fontSize: '0.78rem', color: '#52525b', marginLeft: 'auto' }}>
                        {total.toLocaleString()} result{total !== 1 ? 's' : ''}
                    </div>
                </div>
            </GlassCard>

            {/* ── TABLE ── */}
            <GlassCard style={{ overflow: 'hidden', marginBottom: 14 }}>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '0.72rem', color: '#52525b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.8, whiteSpace: 'nowrap' }}>Customer</th>
                                {COLUMNS.filter(c => visibleCols.has(c.key) && c.key !== 'email').map(col => (
                                    <th key={col.key} onClick={() => toggleSort(col.key)} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '0.72rem', color: sortKey === col.key ? '#818cf8' : '#52525b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.8, whiteSpace: 'nowrap', cursor: 'pointer', userSelect: 'none' }}>
                                        {col.label}<SortIcon active={sortKey === col.key} dir={sortDir} />
                                    </th>
                                ))}
                                <th style={{ padding: '12px 16px', textAlign: 'right', fontSize: '0.72rem', color: '#52525b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.8 }}>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {pageData.length === 0 ? (
                                <tr>
                                    <td colSpan={COLUMNS.length + 2} style={{ padding: '60px 20px', textAlign: 'center' }}>
                                        <div style={{ fontSize: 32, marginBottom: 12 }}>👥</div>
                                        <div style={{ fontSize: '0.9rem', color: '#52525b', fontWeight: 600 }}>No customers found</div>
                                        <div style={{ fontSize: '0.78rem', color: '#3f3f46', marginTop: 4 }}>Add your first customer or adjust your filters</div>
                                    </td>
                                </tr>
                            ) : pageData.map((c) => {
                                const bg = avatarColor(c.email);
                                return (
                                    <tr key={c.id} onClick={() => setSelected(c)} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', cursor: 'pointer', transition: 'background 0.15s' }}
                                        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(99,102,241,0.06)')}
                                        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                                        {/* Customer cell */}
                                        <td style={{ padding: '13px 16px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                                <div style={{ width: 36, height: 36, borderRadius: 10, background: `linear-gradient(135deg,${bg},${bg}aa)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.85rem', color: '#fff', flexShrink: 0, boxShadow: `0 4px 10px ${bg}40` }}>
                                                    {initials(c.email)}
                                                </div>
                                                <div>
                                                    <div style={{ fontWeight: 600, color: '#e4e4e7', fontSize: '0.85rem' }}>{c.email}</div>
                                                    <div style={{ fontSize: '0.72rem', color: '#52525b' }}>{c.country}</div>
                                                </div>
                                            </div>
                                        </td>
                                        {visibleCols.has('productsBought') && (
                                            <td style={{ padding: '13px 16px', fontSize: '0.85rem', color: '#d4d4d8', fontVariantNumeric: 'tabular-nums' }}>
                                                <span style={{ background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 6, padding: '3px 10px', fontWeight: 700, color: '#818cf8' }}>{c.productsBought}</span>
                                            </td>
                                        )}
                                        {visibleCols.has('lastPurchaseDate') && (
                                            <td style={{ padding: '13px 16px', fontSize: '0.84rem', color: '#a1a1aa', fontVariantNumeric: 'tabular-nums' }}>{formatDate(c.lastPurchaseDate)}</td>
                                        )}
                                        {visibleCols.has('firstPurchaseDate') && (
                                            <td style={{ padding: '13px 16px', fontSize: '0.84rem', color: '#a1a1aa', fontVariantNumeric: 'tabular-nums' }}>{formatDate(c.firstPurchaseDate)}</td>
                                        )}
                                        {visibleCols.has('amountSpent') && (
                                            <td style={{ padding: '13px 16px', fontSize: '0.88rem', fontWeight: 700, color: '#10b981', fontVariantNumeric: 'tabular-nums' }}>{formatCurrency(c.amountSpent)}</td>
                                        )}
                                        <td style={{ padding: '13px 16px', textAlign: 'right' }}>
                                            <span style={{ padding: '4px 12px', borderRadius: 20, background: `${STATUS_COLORS[c.status]}15`, border: `1px solid ${STATUS_COLORS[c.status]}35`, fontSize: '0.72rem', fontWeight: 700, color: STATUS_COLORS[c.status], textTransform: 'capitalize', whiteSpace: 'nowrap' }}>
                                                {c.status}
                                            </span>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </GlassCard>

            {/* ── PAGINATION ── */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                <div style={{ fontSize: '0.78rem', color: '#52525b' }}>
                    Showing {Math.min((page - 1) * pageSize + 1, total)}–{Math.min(page * pageSize, total)} of {total.toLocaleString()} row{total !== 1 ? 's' : ''}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    {/* Page size */}
                    <select value={pageSize} onChange={e => { setPageSize(+e.target.value); setPage(1); }}
                        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '6px 10px', color: '#d4d4d8', fontSize: '0.78rem' }}>
                        {PAGE_SIZES.map(s => <option key={s} value={s}>{s} / page</option>)}
                    </select>

                    {/* Pagination */}
                    <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                        <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                            style={{ width: 30, height: 30, borderRadius: 7, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: page === 1 ? '#3f3f46' : '#a1a1aa', cursor: page === 1 ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem' }}>‹</button>
                        {Array.from({ length: Math.min(pages, 7) }, (_, idx) => {
                            let p = idx + 1;
                            if (pages > 7) {
                                if (page <= 4) p = idx + 1;
                                else if (page >= pages - 3) p = pages - 6 + idx;
                                else p = page - 3 + idx;
                            }
                            return (
                                <button key={p} onClick={() => setPage(p)} style={{
                                    width: 30, height: 30, borderRadius: 7, background: page === p ? 'var(--primary-color)' : 'rgba(255,255,255,0.05)',
                                    border: page === p ? 'none' : '1px solid rgba(255,255,255,0.1)',
                                    color: page === p ? '#fff' : '#a1a1aa', cursor: 'pointer', fontSize: '0.78rem', fontWeight: page === p ? 700 : 400,
                                }}>{p}</button>
                            );
                        })}
                        <button onClick={() => setPage(p => Math.min(pages, p + 1))} disabled={page === pages}
                            style={{ width: 30, height: 30, borderRadius: 7, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: page === pages ? '#3f3f46' : '#a1a1aa', cursor: page === pages ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem' }}>›</button>
                    </div>

                    {/* Column visibility */}
                    <div style={{ position: 'relative' }}>
                        <button onClick={() => setColMenuOpen(p => !p)} style={{ display: 'flex', alignItems: 'center', gap: 7, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 9, padding: '7px 14px', color: '#a1a1aa', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600 }}>
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /></svg>
                            Columns
                        </button>
                        {colMenuOpen && (
                            <div style={{ position: 'absolute', bottom: 'calc(100% + 8px)', right: 0, zIndex: 100, background: 'rgba(10,10,16,0.98)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 14, padding: 16, minWidth: 190, backdropFilter: 'blur(20px)', boxShadow: '0 -10px 40px rgba(0,0,0,0.6)' }}>
                                <div style={{ fontSize: '0.63rem', color: '#52525b', fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 10 }}>Columns</div>
                                {COLUMNS.map(col => (
                                    <label key={col.key} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10, cursor: 'pointer' }}>
                                        <div onClick={() => setVisibleCols(prev => {
                                            const n = new Set(prev);
                                            n.has(col.key) ? n.delete(col.key) : n.add(col.key);
                                            return n;
                                        })}
                                            style={{ width: 16, height: 16, borderRadius: 4, background: visibleCols.has(col.key) ? 'var(--primary-color)' : 'rgba(255,255,255,0.06)', border: `1px solid ${visibleCols.has(col.key) ? 'var(--primary-color)' : 'rgba(255,255,255,0.12)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                            {visibleCols.has(col.key) && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>}
                                        </div>
                                        <span style={{ fontSize: '0.82rem', color: '#d4d4d8' }}>{col.label}</span>
                                    </label>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Customers;
