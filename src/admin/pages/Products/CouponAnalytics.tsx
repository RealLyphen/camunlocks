import React, { useMemo } from 'react';
import { useStore } from '../../../context/StoreContext';
import { useNavigate } from 'react-router-dom';
import { Tag, Download, TrendingUp, Award, ArrowLeft } from 'lucide-react';
import { exportCoupons } from '../../utils/csvExport';

const card: React.CSSProperties = {
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 16, padding: 20, marginBottom: 16,
};

const CouponAnalytics: React.FC = () => {
    const { coupons, users } = useStore();
    const navigate = useNavigate();

    // Collect all orders across all users
    const allOrders = useMemo(() => users.flatMap(u => u.orders), [users]);

    // Enrich coupons with discount amount derived from usage
    const enriched = useMemo(() => coupons.map(c => {
        const totalDiscount = c.usageCount * (c.type === 'fixed' ? c.value : 0);
        const statusColor = c.status === 'active' ? '#4ade80' : c.status === 'expired' ? '#f87171' : '#fbbf24';
        return { ...c, totalDiscount, statusColor };
    }).sort((a, b) => b.usageCount - a.usageCount), [coupons]);

    const totalUsage = coupons.reduce((s, c) => s + c.usageCount, 0);
    const totalDiscountGiven = enriched.reduce((s, c) => s + c.totalDiscount, 0);
    const activeCoupons = coupons.filter(c => c.status === 'active').length;
    const topCoupon = enriched[0];

    return (
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 32 }}>
                <button onClick={() => navigate(-1)} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '8px 10px', color: '#a1a1aa', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                    <ArrowLeft size={16} />
                </button>
                <div style={{ flex: 1 }}>
                    <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800, color: '#fff', display: 'flex', alignItems: 'center', gap: 10 }}>
                        <Tag size={22} style={{ color: 'var(--primary-color,#818cf8)' }} /> Coupon Analytics
                    </h1>
                    <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: '#71717a' }}>Track usage and performance of all discount codes.</p>
                </div>
                <button onClick={() => exportCoupons(coupons, allOrders)} style={{
                    display: 'flex', alignItems: 'center', gap: 8, padding: '10px 18px',
                    background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 10, color: '#e4e4e7', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer', fontFamily: 'inherit',
                }}>
                    <Download size={14} /> Export CSV
                </button>
            </div>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 32 }}>
                {[
                    { label: 'Total Coupons', value: coupons.length, color: '#818cf8', icon: <Tag size={20} /> },
                    { label: 'Active', value: activeCoupons, color: '#4ade80', icon: <Award size={20} /> },
                    { label: 'Total Redemptions', value: totalUsage, color: '#fbbf24', icon: <TrendingUp size={20} /> },
                    { label: 'Discount Given', value: `$${totalDiscountGiven.toFixed(2)}`, color: '#f87171', icon: <Tag size={20} /> },
                ].map((stat, i) => (
                    <div key={i} style={{ ...card, marginBottom: 0 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div style={{ padding: 10, borderRadius: 10, background: `${stat.color}18` }}>
                                <span style={{ color: stat.color }}>{stat.icon}</span>
                            </div>
                        </div>
                        <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#fff', marginTop: 12 }}>{stat.value}</div>
                        <div style={{ fontSize: '0.8rem', color: '#71717a', marginTop: 4 }}>{stat.label}</div>
                    </div>
                ))}
            </div>

            {/* Top performer */}
            {topCoupon && (
                <div style={{ ...card, background: 'linear-gradient(135deg, rgba(251,191,36,0.08), rgba(251,191,36,0.02))', border: '1px solid rgba(251,191,36,0.2)', marginBottom: 24 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <Award size={24} style={{ color: '#fbbf24' }} />
                        <div>
                            <div style={{ fontSize: '0.75rem', color: '#fbbf24', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Top Performing Coupon</div>
                            <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fff' }}>{topCoupon.code}</div>
                        </div>
                        <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
                            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fbbf24' }}>{topCoupon.usageCount}</div>
                            <div style={{ fontSize: '0.75rem', color: '#71717a' }}>redemptions</div>
                        </div>
                    </div>
                </div>
            )}

            {/* Coupon Table */}
            <div style={{ ...card, padding: 0, overflow: 'hidden' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 100px 120px 100px 100px 110px', gap: 0 }}>
                    {/* Header */}
                    {['Coupon Code', 'Type', 'Value', 'Used', 'Limit', 'Status'].map(h => (
                        <div key={h} style={{ padding: '14px 16px', fontSize: '0.75rem', fontWeight: 700, color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.06em', borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)' }}>{h}</div>
                    ))}
                    {enriched.length === 0 && (
                        <div style={{ gridColumn: '1/-1', padding: 32, textAlign: 'center', color: '#52525b', fontSize: '0.9rem' }}>
                            No coupons yet. <a href="/admin/products/coupons/create" style={{ color: 'var(--primary-color,#818cf8)' }}>Create one →</a>
                        </div>
                    )}
                    {enriched.map((c, _) => {
                        const barWidth = totalUsage > 0 ? (c.usageCount / totalUsage) * 100 : 0;
                        return (
                            <React.Fragment key={c.id}>
                                <div style={{ padding: '14px 16px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                                    <div style={{ fontWeight: 700, color: '#fff', fontFamily: 'monospace', fontSize: '0.9rem' }}>{c.code}</div>
                                    <div style={{ height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.05)', marginTop: 6 }}>
                                        <div style={{ height: '100%', borderRadius: 2, background: c.statusColor, width: `${barWidth}%`, transition: 'width 0.6s ease' }} />
                                    </div>
                                </div>
                                <div style={{ padding: '14px 16px', borderBottom: '1px solid rgba(255,255,255,0.04)', color: '#a1a1aa', fontSize: '0.85rem', display: 'flex', alignItems: 'center' }}>{c.type}</div>
                                <div style={{ padding: '14px 16px', borderBottom: '1px solid rgba(255,255,255,0.04)', fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center' }}>
                                    {c.type === 'percentage' ? `${c.value}%` : `$${c.value}`}
                                </div>
                                <div style={{ padding: '14px 16px', borderBottom: '1px solid rgba(255,255,255,0.04)', fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center' }}>{c.usageCount}</div>
                                <div style={{ padding: '14px 16px', borderBottom: '1px solid rgba(255,255,255,0.04)', color: '#71717a', display: 'flex', alignItems: 'center' }}>{c.usageLimit ?? '∞'}</div>
                                <div style={{ padding: '14px 16px', borderBottom: '1px solid rgba(255,255,255,0.04)', display: 'flex', alignItems: 'center' }}>
                                    <span style={{ background: `${c.statusColor}18`, color: c.statusColor, padding: '3px 10px', borderRadius: 20, fontSize: '0.75rem', fontWeight: 700, border: `1px solid ${c.statusColor}30` }}>
                                        {c.status}
                                    </span>
                                </div>
                            </React.Fragment>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default CouponAnalytics;
