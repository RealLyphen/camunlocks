import React, { useMemo } from 'react';
import { useStore } from '../../../context/StoreContext';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Trophy, Download, Star } from 'lucide-react';
import { exportReferrals } from '../../utils/csvExport';

const card: React.CSSProperties = {
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 16, padding: 20, marginBottom: 16,
};

const RANK_STYLES: Record<number, { bg: string; color: string; label: string }> = {
    0: { bg: 'linear-gradient(135deg, #ffd700, #f59e0b)', color: '#1a1100', label: '🥇' },
    1: { bg: 'linear-gradient(135deg, #c0c0c0, #9ca3af)', color: '#111', label: '🥈' },
    2: { bg: 'linear-gradient(135deg, #cd7f32, #b45309)', color: '#1a0800', label: '🥉' },
};

const ReferralLeaderboard: React.FC = () => {
    const { referrals } = useStore();
    const navigate = useNavigate();

    const sorted = useMemo(() =>
        [...referrals].sort((a, b) => b.usageCount - a.usageCount || b.totalEarned - a.totalEarned),
        [referrals]
    );

    const totalUsage = referrals.reduce((s, r) => s + r.usageCount, 0);
    const totalEarned = referrals.reduce((s, r) => s + r.totalEarned, 0);

    return (
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 32 }}>
                <button onClick={() => navigate(-1)} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '8px 10px', color: '#a1a1aa', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                    <ArrowLeft size={16} />
                </button>
                <div style={{ flex: 1 }}>
                    <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800, color: '#fff', display: 'flex', alignItems: 'center', gap: 10 }}>
                        <Trophy size={22} style={{ color: '#fbbf24' }} /> Referral Leaderboard
                    </h1>
                    <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: '#71717a' }}>Top referrers ranked by signups and revenue driven.</p>
                </div>
                <button onClick={() => exportReferrals(referrals)} style={{
                    display: 'flex', alignItems: 'center', gap: 8, padding: '10px 18px',
                    background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 10, color: '#e4e4e7', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer', fontFamily: 'inherit',
                }}>
                    <Download size={14} /> Export CSV
                </button>
            </div>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 32 }}>
                {[
                    { label: 'Total Referrers', value: referrals.length, color: '#818cf8' },
                    { label: 'Total Referrals', value: totalUsage, color: '#4ade80' },
                    { label: 'Total Earned', value: `$${totalEarned.toFixed(2)}`, color: '#fbbf24' },
                ].map((s, i) => (
                    <div key={i} style={{ ...card, marginBottom: 0, textAlign: 'center' }}>
                        <div style={{ fontSize: '2rem', fontWeight: 900, color: s.color }}>{s.value}</div>
                        <div style={{ fontSize: '0.8rem', color: '#71717a', marginTop: 4 }}>{s.label}</div>
                    </div>
                ))}
            </div>

            {/* Top 3 podium */}
            {sorted.length >= 1 && (
                <div style={{ display: 'flex', gap: 16, justifyContent: 'center', marginBottom: 32, flexWrap: 'wrap' }}>
                    {sorted.slice(0, 3).map((r, i) => {
                        const rank = RANK_STYLES[i] || { bg: 'rgba(255,255,255,0.05)', color: '#fff', label: `#${i + 1}` };
                        return (
                            <div key={r.id} style={{
                                ...card, marginBottom: 0, minWidth: 200, flex: 1, maxWidth: 280, textAlign: 'center',
                                background: i === 0 ? 'rgba(251,191,36,0.07)' : i === 1 ? 'rgba(192,192,192,0.05)' : 'rgba(205,127,50,0.05)',
                                border: i === 0 ? '1px solid rgba(251,191,36,0.25)' : card.border,
                            }}>
                                <div style={{ width: 48, height: 48, borderRadius: '50%', background: rank.bg, color: rank.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', margin: '0 auto 12px', fontWeight: 900 }}>
                                    {rank.label}
                                </div>
                                <div style={{ fontWeight: 700, color: '#fff', fontSize: '0.9rem', marginBottom: 4 }}>{r.code}</div>
                                <div style={{ fontSize: '0.75rem', color: '#71717a', marginBottom: 8 }}>{r.userEmail}</div>
                                <div style={{ display: 'flex', justifyContent: 'center', gap: 20 }}>
                                    <div style={{ textAlign: 'center' }}>
                                        <div style={{ fontWeight: 800, color: '#fff', fontSize: '1.1rem' }}>{r.usageCount}</div>
                                        <div style={{ fontSize: '0.7rem', color: '#71717a' }}>referrals</div>
                                    </div>
                                    <div style={{ textAlign: 'center' }}>
                                        <div style={{ fontWeight: 800, color: '#4ade80', fontSize: '1.1rem' }}>${r.totalEarned.toFixed(2)}</div>
                                        <div style={{ fontSize: '0.7rem', color: '#71717a' }}>earned</div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Full table */}
            <div style={{ ...card, padding: 0, overflow: 'hidden' }}>
                <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Star size={15} style={{ color: '#fbbf24' }} />
                    <span style={{ fontWeight: 700, color: '#fff', fontSize: '0.95rem' }}>Full Rankings</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '48px 100px 1fr 100px 80px 100px 80px', gap: 0 }}>
                    {['#', 'Code', 'Email', 'Type', 'Referrals', 'Earned', 'Status'].map(h => (
                        <div key={h} style={{ padding: '12px 14px', fontSize: '0.72rem', fontWeight: 700, color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.06em', borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)' }}>{h}</div>
                    ))}
                    {sorted.length === 0 && (
                        <div style={{ gridColumn: '1/-1', padding: 32, textAlign: 'center', color: '#52525b', fontSize: '0.9rem' }}>
                            No referrals yet. <a href="/admin/customers/referrals/create" style={{ color: 'var(--primary-color,#818cf8)' }}>Create codes →</a>
                        </div>
                    )}
                    {sorted.map((r, i) => {
                        const rankEmoji = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`;
                        const barW = totalUsage > 0 ? (r.usageCount / totalUsage) * 100 : 0;
                        return (
                            <React.Fragment key={r.id}>
                                <div style={{ padding: '14px 14px', borderBottom: '1px solid rgba(255,255,255,0.04)', display: 'flex', alignItems: 'center', fontSize: '1rem' }}>{rankEmoji}</div>
                                <div style={{ padding: '14px 14px', borderBottom: '1px solid rgba(255,255,255,0.04)', display: 'flex', alignItems: 'center' }}>
                                    <span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#fff', fontSize: '0.85rem' }}>{r.code}</span>
                                </div>
                                <div style={{ padding: '14px 14px', borderBottom: '1px solid rgba(255,255,255,0.04)', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                                    <div style={{ color: '#e4e4e7', fontSize: '0.85rem' }}>{r.userEmail}</div>
                                    <div style={{ height: 3, borderRadius: 2, background: 'rgba(255,255,255,0.05)', marginTop: 5 }}>
                                        <div style={{ height: '100%', borderRadius: 2, background: 'var(--primary-color,#818cf8)', width: `${barW}%', transition: 'width 0.6s ease` }} />
                                    </div>
                                </div>
                                <div style={{ padding: '14px 14px', borderBottom: '1px solid rgba(255,255,255,0.04)', color: '#a1a1aa', display: 'flex', alignItems: 'center', fontSize: '0.82rem' }}>{r.referralType}</div>
                                <div style={{ padding: '14px 14px', borderBottom: '1px solid rgba(255,255,255,0.04)', fontWeight: 800, color: '#fff', display: 'flex', alignItems: 'center' }}>{r.usageCount}</div>
                                <div style={{ padding: '14px 14px', borderBottom: '1px solid rgba(255,255,255,0.04)', fontWeight: 700, color: '#4ade80', display: 'flex', alignItems: 'center' }}>${r.totalEarned.toFixed(2)}</div>
                                <div style={{ padding: '14px 14px', borderBottom: '1px solid rgba(255,255,255,0.04)', display: 'flex', alignItems: 'center' }}>
                                    <span style={{ background: r.status === 'active' ? 'rgba(74,222,128,0.1)' : 'rgba(248,113,113,0.1)', color: r.status === 'active' ? '#4ade80' : '#f87171', padding: '2px 8px', borderRadius: 20, fontSize: '0.72rem', fontWeight: 700 }}>{r.status}</span>
                                </div>
                            </React.Fragment>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default ReferralLeaderboard;
