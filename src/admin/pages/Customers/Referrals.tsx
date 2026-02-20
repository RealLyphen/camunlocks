import React, { useState, useMemo } from 'react';
import { useStore } from '../../../context/StoreContext';
import { Link } from 'react-router-dom';
import { Plus, Search, Trash2, Link2, Users, UserPlus } from 'lucide-react';
import { motion } from 'framer-motion';

const Referrals: React.FC = () => {
    const { referrals, deleteReferral, settings } = useStore();
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const itemsPerPage = 8;

    const filteredReferrals = useMemo(() => {
        return referrals.filter(r =>
            r.code.toLowerCase().includes(search.toLowerCase()) ||
            r.userEmail.toLowerCase().includes(search.toLowerCase())
        );
    }, [referrals, search]);

    const totalPages = Math.ceil(filteredReferrals.length / itemsPerPage);
    const displayedReferrals = filteredReferrals.slice(
        (page - 1) * itemsPerPage,
        page * itemsPerPage
    );

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'active': return { bg: 'rgba(74, 222, 128, 0.1)', color: '#4ade80', border: 'rgba(74, 222, 128, 0.25)' };
            case 'disabled': return { bg: 'rgba(248, 113, 113, 0.1)', color: '#f87171', border: 'rgba(248, 113, 113, 0.25)' };
            default: return { bg: 'rgba(161, 161, 170, 0.1)', color: '#a1a1aa', border: 'rgba(161, 161, 170, 0.25)' };
        }
    };

    const getTypeStyle = (type: string) => {
        return type === 'first_time'
            ? { bg: 'rgba(99, 102, 241, 0.12)', color: '#818cf8', border: 'rgba(99, 102, 241, 0.25)', icon: <UserPlus size={12} />, label: 'First Time' }
            : { bg: 'rgba(139, 92, 246, 0.12)', color: '#a78bfa', border: 'rgba(139, 92, 246, 0.25)', icon: <Users size={12} />, label: 'Recurring' };
    };

    return (
        <div className="relative">
            {/* Header */}
            <div className="admin-header">
                <div className="welcome-text">
                    <h1>Referral Codes/Links</h1>
                    <p>Manage and track your customer referrals.</p>
                </div>
                <Link to="/admin/customers/referrals/create" className="btn-primary">
                    <Plus size={18} /> Create Referral
                </Link>
            </div>

            {/* Stats Row */}
            <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}
            >
                {[
                    { label: 'Total Referrals', value: referrals.length, color: '#818cf8' },
                    { label: 'Active', value: referrals.filter(r => r.status === 'active').length, color: '#4ade80' },
                    { label: 'Total Uses', value: referrals.reduce((sum, r) => sum + (r.usageCount || 0), 0), color: '#fbbf24' },
                ].map((stat, i) => (
                    <div key={i} style={{
                        background: 'rgba(255,255,255,0.03)',
                        border: '1px solid rgba(255,255,255,0.06)',
                        borderRadius: 14,
                        padding: '20px 24px',
                        backdropFilter: 'blur(12px)',
                    }}>
                        <div style={{ fontSize: '0.8rem', color: '#71717a', marginBottom: 6, letterSpacing: '0.5px', textTransform: 'uppercase', fontWeight: 600 }}>
                            {stat.label}
                        </div>
                        <div style={{ fontSize: '1.75rem', fontWeight: 700, color: stat.color }}>
                            {stat.value}
                        </div>
                    </div>
                ))}
            </motion.div>

            {/* Search Bar */}
            <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
                className="table-card"
                style={{ padding: '16px 24px', marginBottom: 24 }}
            >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ position: 'relative', width: 380 }}>
                        <Search
                            size={18}
                            style={{
                                position: 'absolute', left: 12, top: '50%',
                                transform: 'translateY(-50%)', color: '#71717a',
                                pointerEvents: 'none',
                            }}
                        />
                        <input
                            type="text"
                            placeholder="Search by code or email..."
                            className="admin-input"
                            style={{ paddingLeft: 40 }}
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#52525b', fontSize: '0.85rem' }}>
                        <Link2 size={16} />
                        <span>{filteredReferrals.length} referral{filteredReferrals.length !== 1 ? 's' : ''}</span>
                    </div>
                </div>
            </motion.div>

            {/* Data Table */}
            <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.2 }}
                className="table-card"
                style={{ padding: 0, overflow: 'hidden' }}
            >
                <table className="data-table">
                    <thead>
                        <tr>
                            <th style={{ paddingLeft: 24 }}>Referral Link</th>
                            <th>User E-Mail</th>
                            <th>Type</th>
                            <th>Reward Cut</th>
                            <th>Status</th>
                            <th>Usage</th>
                            <th style={{ paddingRight: 24, textAlign: 'right' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {displayedReferrals.length > 0 ? (
                            displayedReferrals.map((referral) => {
                                const statusStyle = getStatusStyle(referral.status);
                                const typeStyle = getTypeStyle(referral.referralType);
                                return (
                                    <tr key={referral.id} style={{ transition: 'background 0.2s' }}
                                        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.03)')}
                                        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                                    >
                                        <td style={{ paddingLeft: 24 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                                <div style={{
                                                    width: 40, height: 40, borderRadius: 10,
                                                    background: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(139,92,246,0.15))',
                                                    border: '1px solid rgba(99,102,241,0.2)',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    color: '#818cf8', flexShrink: 0,
                                                }}>
                                                    <Link2 size={18} />
                                                </div>
                                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                    <span style={{
                                                        fontWeight: 700, color: '#fff',
                                                        fontFamily: "'JetBrains Mono', monospace",
                                                        letterSpacing: '1px', fontSize: '0.95rem',
                                                    }}>
                                                        {referral.code}
                                                    </span>
                                                    <span style={{ fontSize: '0.75rem', color: '#71717a', whiteSpace: 'nowrap' }}>
                                                        {settings.customDomain ? `https://${settings.customDomain}/?referral=${referral.code}` : `https://store.cx/?referral=${referral.code}`}
                                                    </span>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <span style={{ color: '#e4e4e7', fontSize: '0.875rem' }}>
                                                {referral.userEmail}
                                            </span>
                                        </td>
                                        <td>
                                            <span style={{
                                                padding: '4px 12px', borderRadius: 20,
                                                background: typeStyle.bg, color: typeStyle.color,
                                                border: `1px solid ${typeStyle.border}`,
                                                fontSize: '0.75rem', fontWeight: 600,
                                                display: 'inline-flex', alignItems: 'center', gap: 4,
                                                whiteSpace: 'nowrap',
                                            }}>
                                                {typeStyle.icon} {typeStyle.label}
                                            </span>
                                        </td>
                                        <td>
                                            <span style={{ fontWeight: 600, color: '#4ade80', fontSize: '0.95rem' }}>
                                                {referral.rewardMultiplier}%
                                            </span>
                                        </td>
                                        <td>
                                            <span style={{
                                                padding: '4px 12px', borderRadius: 20,
                                                background: statusStyle.bg, color: statusStyle.color,
                                                border: `1px solid ${statusStyle.border}`,
                                                fontSize: '0.75rem', fontWeight: 600,
                                                textTransform: 'capitalize',
                                            }}>
                                                ● {referral.status}
                                            </span>
                                        </td>
                                        <td>
                                            <span style={{ color: '#a1a1aa', fontSize: '0.875rem' }}>
                                                {referral.usageCount || 0}
                                            </span>
                                        </td>
                                        <td style={{ paddingRight: 24 }}>
                                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                                                {/* Edit Link is optional for now, can implement later */}
                                                <button
                                                    onClick={() => {
                                                        if (confirm('Are you sure you want to delete this referral?')) {
                                                            deleteReferral(referral.id);
                                                        }
                                                    }}
                                                    style={{
                                                        padding: 8, borderRadius: 8, color: '#a1a1aa',
                                                        background: 'transparent', border: 'none', cursor: 'pointer',
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                        transition: 'all 0.2s',
                                                    }}
                                                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.1)'; e.currentTarget.style.color = '#f87171'; }}
                                                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#a1a1aa'; }}
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })
                        ) : (
                            <tr>
                                <td colSpan={7} style={{ padding: '48px 0', textAlign: 'center' }}>
                                    <div style={{
                                        display: 'flex', flexDirection: 'column',
                                        alignItems: 'center', justifyContent: 'center',
                                        color: '#71717a', gap: 12,
                                    }}>
                                        <div style={{
                                            width: 64, height: 64, borderRadius: '50%',
                                            background: 'rgba(255,255,255,0.04)',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        }}>
                                            <Link2 size={32} style={{ opacity: 0.5 }} />
                                        </div>
                                        <p>{search ? `No referrals matching "${search}"` : 'No referrals yet. Create your first referral!'}</p>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div style={{
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        padding: '16px 24px',
                        borderTop: '1px solid rgba(255,255,255,0.05)',
                        background: 'rgba(255,255,255,0.01)',
                    }}>
                        <div style={{ fontSize: '0.875rem', color: '#71717a' }}>
                            Showing {((page - 1) * itemsPerPage) + 1} to {Math.min(page * itemsPerPage, filteredReferrals.length)} of {filteredReferrals.length} results
                        </div>
                        <div style={{ display: 'flex', gap: 8 }}>
                            <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                                style={{
                                    padding: '6px 14px', borderRadius: 8,
                                    background: 'rgba(255,255,255,0.05)',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    fontSize: '0.875rem', color: '#a1a1aa',
                                    cursor: page === 1 ? 'not-allowed' : 'pointer',
                                    opacity: page === 1 ? 0.5 : 1,
                                    transition: 'all 0.2s',
                                }}
                            >
                                Previous
                            </button>
                            <button
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages}
                                style={{
                                    padding: '6px 14px', borderRadius: 8,
                                    background: 'rgba(255,255,255,0.05)',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    fontSize: '0.875rem', color: '#a1a1aa',
                                    cursor: page === totalPages ? 'not-allowed' : 'pointer',
                                    opacity: page === totalPages ? 0.5 : 1,
                                    transition: 'all 0.2s',
                                }}
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </motion.div>
        </div>
    );
};

export default Referrals;
