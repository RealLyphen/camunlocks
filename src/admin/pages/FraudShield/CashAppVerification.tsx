import React, { useState, useMemo } from 'react';
import {
    Search, RefreshCw, CheckCircle, XCircle, Clock,
    Wifi, WifiOff, Zap, Mail, FileText, Shield
} from 'lucide-react';
import { useStore, type Order } from '../../../context/StoreContext';
import { useToast } from '../../../context/ToastContext';

const CashAppVerification: React.FC = () => {
    const { users, verificationLog, pollerRunning } = useStore();
    const { addToast } = useToast();
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState<'log' | 'pending'>('pending');

    // All pending Cash App orders from all users
    const pendingOrders = useMemo(() => {
        const orders: (Order & { userEmail: string })[] = [];
        users.forEach(u => {
            u.orders.forEach(o => {
                if (o.paymentMethod === 'Cash App' && o.status === 'pending') {
                    orders.push({ ...o, userEmail: u.email });
                }
            });
        });
        return orders.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [users]);

    const filteredPending = pendingOrders.filter(o => {
        if (!searchQuery) return true;
        const q = searchQuery.toLowerCase();
        return (
            o.id.toLowerCase().includes(q) ||
            o.userEmail.toLowerCase().includes(q) ||
            (o.orderNote || '').toLowerCase().includes(q)
        );
    });

    const filteredLog = verificationLog.filter(e => {
        if (!searchQuery) return true;
        const q = searchQuery.toLowerCase();
        return (
            e.orderId.toLowerCase().includes(q) ||
            e.orderNote.toLowerCase().includes(q)
        );
    });

    const verifiedCount = verificationLog.filter(e => e.status === 'verified').length;
    const failedCount = verificationLog.filter(e => e.status === 'failed').length;

    return (
        <div style={{ padding: '0 0 40px' }}>
            {/* ─── Header ─── */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                        <div style={{
                            width: 36, height: 36,
                            borderRadius: 10,
                            background: 'linear-gradient(135deg, #00D632 0%, #00b829 100%)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}>
                            <Zap size={18} color="#000" />
                        </div>
                        <h1 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800, color: '#fff' }}>
                            Cash App Auto-Verification
                        </h1>
                    </div>
                    <p style={{ margin: 0, color: '#71717a', fontSize: '0.875rem' }}>
                        Instant payment verification via 24/7 email receipt scanning
                    </p>
                </div>

                {/* Polling Status Badge */}
                <div style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    padding: '8px 16px',
                    background: pollerRunning ? 'rgba(0, 214, 50, 0.06)' : 'rgba(248, 113, 113, 0.06)',
                    border: `1px solid ${pollerRunning ? 'rgba(0, 214, 50, 0.2)' : 'rgba(248, 113, 113, 0.2)'}`,
                    borderRadius: 12,
                    fontSize: '0.82rem', fontWeight: 600,
                    color: pollerRunning ? '#00D632' : '#f87171',
                }}>
                    {pollerRunning ? (
                        <>
                            <span style={{
                                width: 8, height: 8, borderRadius: '50%',
                                background: '#00D632',
                                boxShadow: '0 0 0 0 rgba(0, 214, 50, 0.4)',
                                animation: 'cashPulse 1.5s ease-in-out infinite',
                                display: 'inline-block'
                            }} />
                            <Wifi size={14} /> Scanner Active
                        </>
                    ) : (
                        <><WifiOff size={14} /> Scanner Offline</>
                    )}
                </div>
            </div>

            {/* ─── Stat Cards ─── */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 24 }}>
                {[
                    {
                        label: 'Pending Verification',
                        value: pendingOrders.length,
                        icon: <Clock size={18} />,
                        color: '#f59e0b',
                        bg: 'rgba(245, 158, 11, 0.08)',
                        border: 'rgba(245, 158, 11, 0.2)'
                    },
                    {
                        label: 'Auto-Verified',
                        value: verifiedCount,
                        icon: <CheckCircle size={18} />,
                        color: '#00D632',
                        bg: 'rgba(0, 214, 50, 0.08)',
                        border: 'rgba(0, 214, 50, 0.2)'
                    },
                    {
                        label: 'Failed Attempts',
                        value: failedCount,
                        icon: <XCircle size={18} />,
                        color: '#f87171',
                        bg: 'rgba(248, 113, 113, 0.08)',
                        border: 'rgba(248, 113, 113, 0.2)'
                    },
                ].map(card => (
                    <div key={card.label} style={{
                        background: card.bg,
                        border: `1px solid ${card.border}`,
                        borderRadius: 16,
                        padding: '16px 20px',
                        display: 'flex', alignItems: 'center', gap: 14,
                    }}>
                        <div style={{
                            width: 40, height: 40, borderRadius: 10,
                            background: card.bg,
                            border: `1px solid ${card.border}`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: card.color, flexShrink: 0
                        }}>
                            {card.icon}
                        </div>
                        <div>
                            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#fff', lineHeight: 1 }}>{card.value}</div>
                            <div style={{ fontSize: '0.78rem', color: '#71717a', marginTop: 3 }}>{card.label}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* ─── Main Card ─── */}
            <div style={{
                background: 'rgba(20, 20, 25, 0.6)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 20,
                overflow: 'hidden'
            }}>
                {/* Toolbar */}
                <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '16px 20px',
                    borderBottom: '1px solid rgba(255,255,255,0.06)'
                }}>
                    {/* Tabs */}
                    <div style={{
                        display: 'flex', gap: 4,
                        background: 'rgba(255,255,255,0.04)',
                        border: '1px solid rgba(255,255,255,0.06)',
                        borderRadius: 10, padding: 3
                    }}>
                        {(['pending', 'log'] as const).map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                style={{
                                    padding: '7px 16px',
                                    borderRadius: 8,
                                    border: 'none',
                                    background: activeTab === tab ? 'rgba(255,255,255,0.08)' : 'transparent',
                                    color: activeTab === tab ? '#fff' : '#71717a',
                                    fontSize: '0.82rem', fontWeight: 600,
                                    cursor: 'pointer',
                                    textTransform: 'capitalize',
                                    transition: 'all 0.15s ease',
                                    display: 'flex', alignItems: 'center', gap: 6,
                                }}
                            >
                                {tab === 'pending' ? <Clock size={13} /> : <Shield size={13} />}
                                {tab === 'pending' ? `Pending (${pendingOrders.length})` : `Activity Log (${verificationLog.length})`}
                            </button>
                        ))}
                    </div>

                    {/* Search */}
                    <div style={{ position: 'relative', width: 280 }}>
                        <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#71717a' }} />
                        <input
                            type="text"
                            placeholder="Search orders, notes, emails…"
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '9px 10px 9px 34px',
                                background: 'rgba(255,255,255,0.03)',
                                border: '1px solid rgba(255,255,255,0.08)',
                                borderRadius: 10, color: '#fff',
                                fontSize: '0.82rem', outline: 'none',
                                fontFamily: 'inherit',
                            }}
                        />
                    </div>
                </div>

                {/* Table */}
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                                {activeTab === 'pending'
                                    ? ['Order ID', 'Date', 'Customer Email', 'Amount', 'Order Note', 'Status'].map(h => (
                                        <th key={h} style={{ padding: '12px 20px', textAlign: 'left', fontSize: '0.73rem', color: '#52525b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>{h}</th>
                                    ))
                                    : ['Event ID', 'Order ID', 'Note', 'Amount', 'Time', 'Result'].map(h => (
                                        <th key={h} style={{ padding: '12px 20px', textAlign: 'left', fontSize: '0.73rem', color: '#52525b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>{h}</th>
                                    ))
                                }
                            </tr>
                        </thead>
                        <tbody>
                            {activeTab === 'pending' ? (
                                filteredPending.length > 0 ? filteredPending.map(order => (
                                    <tr key={order.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', transition: 'background 0.15s' }}
                                        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.02)')}
                                        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                                    >
                                        <td style={{ padding: '14px 20px', fontWeight: 600, color: '#e4e4e7', fontSize: '0.85rem', fontFamily: 'monospace' }}>{order.id}</td>
                                        <td style={{ padding: '14px 20px', color: '#71717a', fontSize: '0.82rem', whiteSpace: 'nowrap' }}>
                                            {new Date(order.date).toLocaleString()}
                                        </td>
                                        <td style={{ padding: '14px 20px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                                                <Mail size={13} style={{ color: '#52525b', flexShrink: 0 }} />
                                                <span style={{ color: '#a1a1aa', fontSize: '0.82rem' }}>{order.userEmail}</span>
                                            </div>
                                        </td>
                                        <td style={{ padding: '14px 20px' }}>
                                            <span style={{ fontWeight: 700, color: '#00D632', fontSize: '0.9rem' }}>${order.total.toFixed(2)}</span>
                                        </td>
                                        <td style={{ padding: '14px 20px' }}>
                                            <span style={{
                                                display: 'inline-flex', alignItems: 'center', gap: 6,
                                                padding: '4px 10px',
                                                background: 'rgba(255,255,255,0.04)',
                                                border: '1px solid rgba(255,255,255,0.08)',
                                                borderRadius: 6,
                                                fontFamily: 'monospace', fontSize: '0.82rem', color: '#e2e8f0',
                                            }}>
                                                <FileText size={11} style={{ color: '#52525b' }} />
                                                {order.orderNote || '—'}
                                            </span>
                                        </td>
                                        <td style={{ padding: '14px 20px' }}>
                                            <span style={{
                                                display: 'inline-flex', alignItems: 'center', gap: 6,
                                                padding: '5px 12px',
                                                background: 'rgba(245, 158, 11, 0.08)',
                                                border: '1px solid rgba(245, 158, 11, 0.2)',
                                                borderRadius: 20, fontSize: '0.75rem', fontWeight: 700, color: '#f59e0b',
                                            }}>
                                                <span style={{
                                                    width: 6, height: 6, borderRadius: '50%', background: '#f59e0b',
                                                    animation: 'cashPulse 1.5s ease-in-out infinite', display: 'inline-block'
                                                }} />
                                                Scanning…
                                            </span>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={6} style={{ padding: '60px 20px', textAlign: 'center' }}>
                                            <CheckCircle size={32} style={{ color: '#00D632', margin: '0 auto 12px', display: 'block', opacity: 0.6 }} />
                                            <p style={{ color: '#71717a', margin: 0, fontSize: '0.875rem' }}>All caught up! No pending Cash App orders.</p>
                                        </td>
                                    </tr>
                                )
                            ) : (
                                filteredLog.length > 0 ? filteredLog.map(event => (
                                    <tr key={event.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', transition: 'background 0.15s' }}
                                        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.02)')}
                                        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                                    >
                                        <td style={{ padding: '14px 20px', fontFamily: 'monospace', fontSize: '0.78rem', color: '#52525b' }}>{event.id}</td>
                                        <td style={{ padding: '14px 20px', fontFamily: 'monospace', fontSize: '0.82rem', fontWeight: 600, color: '#e4e4e7' }}>{event.orderId}</td>
                                        <td style={{ padding: '14px 20px' }}>
                                            <span style={{
                                                display: 'inline-flex', alignItems: 'center', gap: 5,
                                                padding: '3px 9px',
                                                background: 'rgba(255,255,255,0.04)',
                                                border: '1px solid rgba(255,255,255,0.08)',
                                                borderRadius: 5, fontFamily: 'monospace', fontSize: '0.8rem', color: '#e2e8f0'
                                            }}>
                                                {event.orderNote}
                                            </span>
                                        </td>
                                        <td style={{ padding: '14px 20px', fontWeight: 700, color: '#00D632', fontSize: '0.9rem' }}>${event.amount.toFixed(2)}</td>
                                        <td style={{ padding: '14px 20px', color: '#71717a', fontSize: '0.78rem', whiteSpace: 'nowrap' }}>
                                            {new Date(event.verifiedAt).toLocaleString()}
                                        </td>
                                        <td style={{ padding: '14px 20px' }}>
                                            {event.status === 'verified' ? (
                                                <span style={{
                                                    display: 'inline-flex', alignItems: 'center', gap: 5,
                                                    padding: '5px 12px',
                                                    background: 'rgba(0, 214, 50, 0.08)',
                                                    border: '1px solid rgba(0, 214, 50, 0.2)',
                                                    borderRadius: 20, fontSize: '0.75rem', fontWeight: 700, color: '#00D632'
                                                }}>
                                                    <CheckCircle size={12} /> Verified
                                                </span>
                                            ) : (
                                                <span style={{
                                                    display: 'inline-flex', alignItems: 'center', gap: 5,
                                                    padding: '5px 12px',
                                                    background: 'rgba(248, 113, 113, 0.08)',
                                                    border: '1px solid rgba(248, 113, 113, 0.2)',
                                                    borderRadius: 20, fontSize: '0.75rem', fontWeight: 700, color: '#f87171'
                                                }}>
                                                    <XCircle size={12} /> Retry…
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={6} style={{ padding: '60px 20px', textAlign: 'center' }}>
                                            <RefreshCw size={28} style={{ color: '#52525b', margin: '0 auto 12px', display: 'block' }} />
                                            <p style={{ color: '#71717a', margin: 0, fontSize: '0.875rem' }}>No verification events yet.</p>
                                        </td>
                                    </tr>
                                )
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* ─── How It Works ─── */}
            <div style={{
                marginTop: 20,
                background: 'rgba(0, 214, 50, 0.03)',
                border: '1px solid rgba(0, 214, 50, 0.1)',
                borderRadius: 16,
                padding: '16px 20px',
                display: 'flex', alignItems: 'flex-start', gap: 12
            }}>
                <Zap size={16} style={{ color: '#00D632', flexShrink: 0, marginTop: 2 }} />
                <div style={{ fontSize: '0.82rem', color: '#71717a', lineHeight: 1.6 }}>
                    <span style={{ color: '#a1a1aa', fontWeight: 600 }}>Fully Automatic: </span>
                    When a customer submits a Cash App payment, the system instantly monitors email receipts for a matching
                    <strong style={{ color: '#00D632', fontFamily: 'monospace' }}> CAM-XXXX </strong>
                    note and correct total. Orders are automatically approved and fulfilled within seconds — no manual action required.
                </div>
            </div>

            <style>{`
                @keyframes cashPulse {
                    0%, 100% { box-shadow: 0 0 0 0 rgba(0, 214, 50, 0.4); }
                    50% { box-shadow: 0 0 0 5px rgba(0, 214, 50, 0); }
                }
                input:focus { border-color: rgba(129, 140, 248, 0.4) !important; }
            `}</style>
        </div>
    );
};

export default CashAppVerification;
