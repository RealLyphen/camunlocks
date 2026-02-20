import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaTimes } from 'react-icons/fa';
import { useStore } from '../context/StoreContext';
import './ProfileDropdown.css';

interface ProfileDropdownProps {
    isOpen: boolean;
    onClose: () => void;
}

const ProfileDropdown: React.FC<ProfileDropdownProps> = ({ isOpen, onClose }) => {
    const { currentUser, logout } = useStore();
    const dropdownRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                onClose();
            }
        };
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        if (isOpen) {
            setTimeout(() => document.addEventListener('mousedown', handleClickOutside), 10);
            document.addEventListener('keydown', handleEscape);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleEscape);
        };
    }, [isOpen, onClose]);

    if (!isOpen || !currentUser) return null;

    const initial = currentUser.email.charAt(0).toUpperCase();
    const recentOrders = currentUser.orders.slice(0, 5);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed': return '#4ade80';
            case 'pending': return '#facc15';
            case 'cancelled': return '#f87171';
            default: return '#71717a';
        }
    };

    const formatDate = (dateStr: string) => {
        const d = new Date(dateStr);
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    return (
        <div className={`profile-dropdown ${isOpen ? 'open' : ''}`} ref={dropdownRef}>
            {/* Close Button */}
            <button className="pd-close-btn" onClick={onClose} title="Close">
                <FaTimes size={12} />
            </button>

            {/* Header */}
            <div className="pd-header">
                <div className="pd-avatar-lg">{initial}</div>
                <div className="pd-user-info">
                    <span className="pd-email">{currentUser.email}</span>
                    <span className="pd-member-since">
                        Member since {new Date(currentUser.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                    </span>
                </div>
            </div>

            <div className="pd-divider" />

            {/* Balance */}
            <div className="pd-section">
                <div className="pd-section-label">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="2" y="4" width="20" height="16" rx="2" />
                        <path d="M2 10h20" />
                    </svg>
                    Account Balance
                </div>
                <div className="pd-balance">
                    <span className="pd-balance-amount">${currentUser.balance.toFixed(2)}</span>
                </div>
            </div>

            <div className="pd-divider" />

            {/* Order History */}
            <div className="pd-section">
                <div className="pd-section-label">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                    Order History
                </div>
                {recentOrders.length === 0 ? (
                    <div className="pd-empty-orders">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.3 }}>
                            <circle cx="12" cy="12" r="10" />
                            <path d="M8 12h8" />
                        </svg>
                        <span>No orders yet</span>
                    </div>
                ) : (
                    <div className="pd-orders-list">
                        {recentOrders.map(order => (
                            <div key={order.id} className="pd-order-item">
                                <div className="pd-order-info">
                                    <span className="pd-order-id">#{order.id.slice(-6).toUpperCase()}</span>
                                    <span className="pd-order-date">{formatDate(order.date)}</span>
                                </div>
                                <div className="pd-order-meta">
                                    <span className="pd-order-total">${order.total.toFixed(2)}</span>
                                    <span
                                        className="pd-order-status"
                                        style={{ color: getStatusColor(order.status), borderColor: getStatusColor(order.status) + '40' }}
                                    >
                                        {order.status}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
                {/* View All Orders Button */}
                <button
                    className="pd-view-all-btn"
                    onClick={() => {
                        onClose();
                        navigate('/orders');
                    }}
                >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                        <polyline points="14 2 14 8 20 8" />
                        <line x1="16" y1="13" x2="8" y2="13" />
                        <line x1="16" y1="17" x2="8" y2="17" />
                    </svg>
                    View All Orders
                </button>
            </div>

            <div className="pd-divider" />

            {/* Logout */}
            <button className="pd-logout-btn" onClick={() => { logout(); onClose(); }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                    <polyline points="16,17 21,12 16,7" />
                    <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
                Sign Out
            </button>
        </div>
    );
};

export default ProfileDropdown;
