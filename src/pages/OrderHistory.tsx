import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaSearch, FaTag, FaFilter } from 'react-icons/fa';
import { useStore } from '../context/StoreContext';
import './OrderHistory.css';

type StatusFilter = 'all' | 'completed' | 'pending' | 'cancelled';

const OrderHistory: React.FC = () => {
    const { currentUser } = useStore();
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

    if (!currentUser) {
        return (
            <div className="oh-container">
                <div className="oh-empty-state">
                    <div className="oh-empty-icon">🔒</div>
                    <h2>Sign in to view orders</h2>
                    <p>You need to be signed in to view your order history.</p>
                    <button className="oh-back-btn" onClick={() => navigate('/')}>
                        <FaArrowLeft size={12} /> Back to Home
                    </button>
                </div>
            </div>
        );
    }

    const orders = currentUser.orders || [];

    // Filter orders
    const filteredOrders = orders.filter(order => {
        const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
        const matchesSearch = searchQuery.trim() === '' ||
            order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
            order.items?.some(item => item.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
            order.paymentMethod.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesStatus && matchesSearch;
    });

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed': return '#4ade80';
            case 'pending': return '#facc15';
            case 'cancelled': return '#f87171';
            default: return '#71717a';
        }
    };

    const getStatusBg = (status: string) => {
        switch (status) {
            case 'completed': return 'rgba(74, 222, 128, 0.1)';
            case 'pending': return 'rgba(250, 204, 21, 0.1)';
            case 'cancelled': return 'rgba(248, 113, 113, 0.1)';
            default: return 'rgba(113, 113, 122, 0.1)';
        }
    };

    const formatDate = (dateStr: string) => {
        const d = new Date(dateStr);
        return d.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const statusCounts = {
        all: orders.length,
        completed: orders.filter(o => o.status === 'completed').length,
        pending: orders.filter(o => o.status === 'pending').length,
        cancelled: orders.filter(o => o.status === 'cancelled').length,
    };

    return (
        <div className="oh-container">
            {/* Header */}
            <div className="oh-header">
                <div className="oh-header-top">
                    <button className="oh-back-link" onClick={() => navigate('/')}>
                        <FaArrowLeft size={12} /> Back to Store
                    </button>
                </div>
                <div className="oh-header-content">
                    <div>
                        <h1>Order History</h1>
                        <p>{orders.length} total order{orders.length !== 1 ? 's' : ''}</p>
                    </div>
                </div>

                {/* Search + Filters */}
                <div className="oh-toolbar">
                    <div className="oh-search-wrapper">
                        <FaSearch className="oh-search-icon" size={13} />
                        <input
                            type="text"
                            className="oh-search-input"
                            placeholder="Search orders by ID, product, or payment method..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div className="oh-filters">
                        <FaFilter size={11} style={{ color: '#52525b' }} />
                        {(['all', 'completed', 'pending', 'cancelled'] as StatusFilter[]).map(status => (
                            <button
                                key={status}
                                className={`oh-filter-btn ${statusFilter === status ? 'active' : ''}`}
                                onClick={() => setStatusFilter(status)}
                                style={statusFilter === status ? {
                                    borderColor: status === 'all' ? 'rgba(139, 92, 246, 0.4)' : getStatusColor(status) + '40',
                                    background: status === 'all' ? 'rgba(139, 92, 246, 0.1)' : getStatusBg(status),
                                    color: status === 'all' ? '#a78bfa' : getStatusColor(status)
                                } : {}}
                            >
                                {status.charAt(0).toUpperCase() + status.slice(1)}
                                <span className="oh-filter-count">{statusCounts[status]}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Orders List */}
            <div className="oh-orders">
                {filteredOrders.length === 0 ? (
                    <div className="oh-empty-state">
                        <div className="oh-empty-icon">📦</div>
                        <h2>{searchQuery || statusFilter !== 'all' ? 'No matching orders' : 'No orders yet'}</h2>
                        <p>{searchQuery || statusFilter !== 'all'
                            ? 'Try adjusting your search or filters'
                            : 'Your orders will appear here after you make a purchase.'
                        }</p>
                    </div>
                ) : (
                    filteredOrders.map(order => (
                        <div key={order.id} className="oh-order-card">
                            <div className="oh-order-header">
                                <div className="oh-order-id-row">
                                    <span className="oh-order-id">#{order.id.slice(-8).toUpperCase()}</span>
                                    <span
                                        className="oh-status-badge"
                                        style={{
                                            color: getStatusColor(order.status),
                                            background: getStatusBg(order.status),
                                            borderColor: getStatusColor(order.status) + '30'
                                        }}
                                    >
                                        {order.status}
                                    </span>
                                </div>
                                <div className="oh-order-date">{formatDate(order.date)}</div>
                            </div>

                            {/* Order Items */}
                            <div className="oh-order-items">
                                {order.items?.map((item: any, idx) => (
                                    <div key={idx} className="oh-order-item" style={{ flexWrap: 'wrap' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', width: '100%', gap: '15px' }}>
                                            <div className="oh-item-img">
                                                <img src={item.image} alt={item.name} />
                                            </div>
                                            <div className="oh-item-details" style={{ flex: 1 }}>
                                                <span className="oh-item-name">{item.name}</span>
                                                <span className="oh-item-meta">Qty: {item.quantity}</span>
                                            </div>
                                            <span className="oh-item-price">${(item.price * item.quantity).toFixed(2)}</span>
                                        </div>
                                        
                                        {/* Display License Key if delivered */}
                                        {order.status === 'completed' && item.hasDeliveredKey && item.deliveredKey && (
                                            <div style={{ width: '100%', marginTop: '12px', padding: '12px', background: 'rgba(74, 222, 128, 0.08)', border: '1px solid rgba(74, 222, 128, 0.2)', borderRadius: '8px' }}>
                                                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#4ade80', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>
                                                    Your License Key
                                                </div>
                                                <div style={{ fontFamily: 'monospace', fontSize: '0.95rem', color: '#fff', background: 'rgba(0,0,0,0.3)', padding: '8px 12px', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.05)', userSelect: 'all', wordBreak: 'break-all' }}>
                                                    {item.deliveredKey}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>

                            {/* Order Tracking */}
                            {order.items?.some((i: any) => i.isPhysical) && (
                                <div className="oh-order-tracking" style={{ padding: '12px 16px', background: 'rgba(255,255,255,0.02)', borderTop: '1px solid rgba(255,255,255,0.05)', fontSize: '0.85rem' }}>
                                    <div style={{ color: '#a1a1aa', marginBottom: 4, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: 0.5 }}>Shipping Address</div>
                                    <div style={{ color: '#e4e4e7', marginBottom: 12, whiteSpace: 'pre-wrap', lineHeight: 1.4 }}>{order.shippingAddress || 'Not provided'}</div>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: 'rgba(0,0,0,0.2)', borderRadius: 8, border: '1px solid rgba(255,255,255,0.05)' }}>
                                        <div>
                                            <div style={{ color: '#a1a1aa', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 2 }}>Tracking Info</div>
                                            <div style={{ fontWeight: 600 }}>
                                                {order.trackingId ? (
                                                    order.trackingId.startsWith('http') ? (
                                                        <a href={order.trackingId} target="_blank" rel="noreferrer" style={{ color: '#818cf8', textDecoration: 'none' }}>{order.trackingId}</a>
                                                    ) : (
                                                        <span style={{ color: '#818cf8', letterSpacing: 1 }}>{order.trackingId}</span>
                                                    )
                                                ) : (
                                                    <span style={{ color: '#71717a' }}>Coming soon...</span>
                                                )}
                                            </div>
                                        </div>
                                        <div style={{ fontSize: '1.2rem' }}>📦</div>
                                    </div>
                                </div>
                            )}

                            {/* Order Footer */}
                            <div className="oh-order-footer">
                                <div className="oh-payment-method">
                                    <FaTag size={10} />
                                    <span>{order.paymentMethod}</span>
                                </div>
                                <div className="oh-order-total">
                                    <span>Total</span>
                                    <span className="oh-total-amount">${order.total.toFixed(2)}</span>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default OrderHistory;
