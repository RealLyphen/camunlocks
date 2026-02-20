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
                                {order.items?.map((item, idx) => (
                                    <div key={idx} className="oh-order-item">
                                        <div className="oh-item-img">
                                            <img src={item.image} alt={item.name} />
                                        </div>
                                        <div className="oh-item-details">
                                            <span className="oh-item-name">{item.name}</span>
                                            <span className="oh-item-meta">Qty: {item.quantity}</span>
                                        </div>
                                        <span className="oh-item-price">${(item.price * item.quantity).toFixed(2)}</span>
                                    </div>
                                ))}
                            </div>

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
