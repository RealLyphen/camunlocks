import React, { useState, useMemo } from 'react';
import { useStore } from '../../../context/StoreContext';
import { Link } from 'react-router-dom';
import { Plus, Search, Edit2, Trash2, CreditCard, Copy, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';

const GiftCards: React.FC = () => {
    const { giftCards, deleteGiftCard } = useStore();
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const itemsPerPage = 8;

    const filteredCards = useMemo(() => {
        return giftCards.filter(c =>
            c.code.toLowerCase().includes(search.toLowerCase())
        );
    }, [giftCards, search]);

    const totalPages = Math.ceil(filteredCards.length / itemsPerPage);
    const displayedCards = filteredCards.slice(
        (page - 1) * itemsPerPage,
        page * itemsPerPage
    );

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'active': return { bg: 'rgba(74, 222, 128, 0.1)', color: '#4ade80', border: 'rgba(74, 222, 128, 0.25)' };
            case 'redeemed': return { bg: 'rgba(96, 165, 250, 0.1)', color: '#60a5fa', border: 'rgba(96, 165, 250, 0.25)' };
            case 'expired': return { bg: 'rgba(248, 113, 113, 0.1)', color: '#f87171', border: 'rgba(248, 113, 113, 0.25)' };
            default: return { bg: 'rgba(161, 161, 170, 0.1)', color: '#a1a1aa', border: 'rgba(161, 161, 170, 0.25)' };
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        // Could add toast notification here
    };

    return (
        <div className="relative">
            {/* Header */}
            <div className="admin-header">
                <div className="welcome-text">
                    <h1>Gift Cards</h1>
                    <p>Manage digital gift cards and balances</p>
                </div>
                <Link to="/admin/products/giftcards/create" className="btn-primary">
                    <Plus size={18} /> Create Gift Card
                </Link>
            </div>

            {/* Stats Row */}
            <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}
            >
                {[
                    { label: 'Total Cards', value: giftCards.length, color: '#818cf8' },
                    { label: 'Active', value: giftCards.filter(c => c.status === 'active').length, color: '#4ade80' },
                    { label: 'Redeemed', value: giftCards.filter(c => c.status === 'redeemed').length, color: '#60a5fa' },
                    { label: 'Total Value', value: `$${giftCards.reduce((sum, c) => sum + c.amount, 0).toFixed(2)}`, color: '#fbbf24' },
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
                            placeholder="Search by code..."
                            className="admin-input"
                            style={{ paddingLeft: 40 }}
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#52525b', fontSize: '0.85rem' }}>
                        <CreditCard size={16} />
                        <span>{filteredCards.length} card{filteredCards.length !== 1 ? 's' : ''}</span>
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
                            <th style={{ paddingLeft: 24 }}>Code</th>
                            <th>Amount</th>
                            <th>Status</th>
                            <th>Expiry</th>
                            <th>Created</th>
                            <th style={{ paddingRight: 24, textAlign: 'right' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {displayedCards.length > 0 ? (
                            displayedCards.map((card) => {
                                const statusStyle = getStatusStyle(card.status);
                                return (
                                    <tr key={card.id} style={{ transition: 'background 0.2s' }}
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
                                                    <CreditCard size={18} />
                                                </div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                    <span style={{
                                                        fontWeight: 700, color: '#fff',
                                                        fontFamily: "'JetBrains Mono', monospace",
                                                        letterSpacing: '1px', fontSize: '0.95rem',
                                                    }}>
                                                        {card.code}
                                                    </span>
                                                    <button
                                                        onClick={() => copyToClipboard(card.code)}
                                                        style={{ background: 'none', border: 'none', padding: 4, cursor: 'pointer', color: '#52525b', display: 'flex', transition: 'color 0.2s' }}
                                                        onMouseEnter={e => e.currentTarget.style.color = '#a1a1aa'}
                                                        onMouseLeave={e => e.currentTarget.style.color = '#52525b'}
                                                        title="Copy Code"
                                                    >
                                                        <Copy size={12} />
                                                    </button>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <span style={{ fontWeight: 600, color: '#4ade80', fontSize: '0.95rem' }}>
                                                {card.currency} {card.amount.toFixed(2)}
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
                                                ● {card.status}
                                            </span>
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#a1a1aa', fontSize: '0.875rem' }}>
                                                {card.expiryDate ? (
                                                    <>
                                                        <Calendar size={14} />
                                                        {new Date(card.expiryDate).toLocaleDateString()}
                                                    </>
                                                ) : (
                                                    <span style={{ color: '#52525b' }}>Never</span>
                                                )}
                                            </div>
                                        </td>
                                        <td style={{ color: '#71717a', fontSize: '0.875rem' }}>
                                            {new Date(card.createdAt).toLocaleDateString()}
                                        </td>
                                        <td style={{ paddingRight: 24 }}>
                                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                                                <Link
                                                    to={`/admin/products/giftcards/edit/${card.id}`}
                                                    style={{
                                                        padding: 8, borderRadius: 8, color: '#a1a1aa',
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                        transition: 'all 0.2s', textDecoration: 'none',
                                                    }}
                                                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = '#fff'; }}
                                                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#a1a1aa'; }}
                                                >
                                                    <Edit2 size={16} />
                                                </Link>
                                                <button
                                                    onClick={() => {
                                                        if (confirm('Are you sure you want to delete this gift card?')) {
                                                            deleteGiftCard(card.id);
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
                                <td colSpan={6} style={{ padding: '48px 0', textAlign: 'center' }}>
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
                                            <CreditCard size={32} style={{ opacity: 0.5 }} />
                                        </div>
                                        <p>{search ? `No gift cards matching "${search}"` : 'No gift cards created yet.'}</p>
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
                            Showing {((page - 1) * itemsPerPage) + 1} to {Math.min(page * itemsPerPage, filteredCards.length)} of {filteredCards.length} results
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

export default GiftCards;
