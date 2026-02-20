import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
    LayoutDashboard,
    Settings,
    ShoppingCart,
    Users,
    CreditCard,
    ShieldAlert,
    Code,
    Home,
    LogOut,
    ChevronDown,
    ChevronRight,
    Ban,
    FileText,
    LayoutGrid,
    Bell,
    Mail,
    Palette,
    SwatchBook,
    Globe,
    TrendingUp,
    Trophy,
} from 'lucide-react';
import { Activity } from 'lucide-react';

const Sidebar: React.FC = () => {
    const [expandedMenu, setExpandedMenu] = useState<string | null>(null);

    const toggleMenu = (label: string) => {
        setExpandedMenu(expandedMenu === label ? null : label);
    };

    const menuItems = [
        {
            icon: <LayoutDashboard />,
            label: 'Dashboard',
            path: '/admin',
            children: [
                { icon: <LayoutDashboard size={18} />, label: 'Overview', path: '/admin' },
                { icon: <Activity size={18} />, label: 'Analytics', path: '/admin/store-analytics' },
                { icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /></svg>, label: 'Visitor Analytics', path: '/admin/analytics' },
            ]
        },
        {
            icon: <Settings />,
            label: 'Store Settings',
            path: '/admin/settings',
            children: [
                { icon: <Bell size={18} />, label: 'Notifications', path: '/admin/settings/notifications' },
                { icon: <Mail size={18} />, label: 'Delivery Email', path: '/admin/settings/email' },
                { icon: <SwatchBook size={18} />, label: 'Customize Store', path: '/admin/settings/customize' },
                { icon: <SwatchBook size={18} />, label: 'Theme Selection', path: '/admin/settings/theme' },
                { icon: <CreditCard size={18} />, label: 'Payments Setup', path: '/admin/settings/payments' },
                { icon: <LayoutGrid size={18} />, label: 'App Store', path: '/admin/settings/apps' },
                { icon: <Palette size={18} />, label: 'Visual Editor', path: '/admin/settings/builder' },
                { icon: <Globe size={18} />, label: 'SEO', path: '/admin/settings/seo' },
            ]
        },
        {
            icon: <ShoppingCart />,
            label: 'Products',
            path: '/admin/products',
            children: [
                { icon: <ShoppingCart size={18} />, label: 'Products', path: '/admin/products' },
                { icon: <LayoutGrid size={18} />, label: 'Categories', path: '/admin/products/categories' },
                { icon: <FileText size={18} />, label: 'Coupons', path: '/admin/products/coupons' },
                { icon: <TrendingUp size={18} />, label: 'Coupon Analytics', path: '/admin/products/coupon-analytics' },
                { icon: <Activity size={18} />, label: 'Status', path: '/admin/products/status' },
                { icon: <CreditCard size={18} />, label: 'Giftcards', path: '/admin/products/giftcards' },
            ]
        },
        { icon: <Users />, label: 'Team & Discord', path: '/admin/team' },
        {
            icon: <Users />,
            label: 'Customers',
            path: '/admin/customers',
            children: [
                { icon: <Users size={18} />, label: 'Customers', path: '/admin/customers' },
                { icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" /></svg>, label: 'Referral Codes/Links', path: '/admin/customers/referrals' },
                { icon: <Trophy size={18} />, label: 'Referral Leaderboard', path: '/admin/customers/leaderboard' },
                { icon: <FileText size={18} />, label: 'Product Reports', path: '/admin/customers/reports' },
                { icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="17 1 21 5 17 9" /><path d="M3 11V9a4 4 0 0 1 4-4h14" /><polyline points="7 23 3 19 7 15" /><path d="M21 13v2a4 4 0 0 1-4 4H3" /></svg>, label: 'Resell Requests', path: '/admin/customers/resell' },
            ]
        },
        { icon: <CreditCard />, label: 'Financials', path: '/admin/financials' },
        {
            icon: <ShieldAlert />,
            label: 'Fraud Shield',
            path: '/admin/fraud',
            children: [
                { icon: <Ban size={18} />, label: 'Blacklists', path: '/admin/fraud/blacklists' },
                { icon: <FileText size={18} />, label: 'Audit Logs', path: '/admin/fraud/audit-logs' },
                { icon: <CreditCard size={18} />, label: 'Cash App Verification', path: '/admin/fraud/cashapp' },
            ]
        },
        {
            icon: <Code />,
            label: 'Developers',
            path: '/admin/developers',
            children: [
                { icon: <FileText size={18} />, label: 'Documentation', path: '/docs' },
            ]
        },
    ];

    return (
        <aside className="admin-sidebar">
            <div className="sidebar-brand">
                <img src="/logo.png" alt="Logo" style={{ width: 30, height: 30 }} />
                <span>Camunlocks</span>
            </div>

            <div style={{ marginBottom: 20 }}>
                <a href="/" className="menu-item" style={{ background: 'rgba(79, 104, 248, 0.1)', color: 'var(--primary-color)', justifyContent: 'space-between', border: '1px solid rgba(79, 104, 248, 0.2)' }}>
                    <span>Visit Store</span>
                    <Home size={16} />
                </a>
            </div>

            <nav className="sidebar-menu">
                {menuItems.map((item, index) => (
                    <div key={index}>
                        {item.children ? (
                            <>
                                <div
                                    className={`menu-item ${expandedMenu === item.label ? 'expanded' : ''}`}
                                    onClick={() => toggleMenu(item.label)}
                                    style={{ cursor: 'pointer', justifyContent: 'space-between' }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                                        {item.icon}
                                        <span>{item.label}</span>
                                    </div>
                                    {expandedMenu === item.label ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                                </div>
                                {expandedMenu === item.label && (
                                    <div className="submenu" style={{ paddingLeft: 20, marginTop: 5, borderLeft: '1px solid rgba(255,255,255,0.1)', marginLeft: 22 }}>
                                        {item.children.map((sub, subIndex) => (
                                            <NavLink
                                                key={subIndex}
                                                to={sub.path}
                                                end={sub.path === item.path}
                                                className={({ isActive }) => `menu-item ${isActive ? 'active' : ''}`}
                                                style={{ fontSize: '0.9rem', padding: '10px 12px' }}
                                            >
                                                {sub.icon}
                                                <span>{sub.label}</span>
                                            </NavLink>
                                        ))}
                                    </div>
                                )}
                            </>
                        ) : (
                            <NavLink
                                to={item.path}
                                className={({ isActive }) => `menu-item ${isActive && item.path !== '/admin/settings' ? 'active' : ''}`}
                                end={item.path === '/admin'}
                            >
                                {item.icon}
                                <span>{item.label}</span>
                            </NavLink>
                        )}
                    </div>
                ))}
            </nav>

            <div className="sidebar-user">
                <div className="user-avatar">AD</div>
                <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>Admin User</div>
                    <div style={{ fontSize: '0.75rem', color: '#a1a1aa' }}>admin@camunlocks.cx</div>
                </div>
                <LogOut size={16} style={{ color: '#ef4444' }} />
            </div>
        </aside>
    );
};

export default Sidebar;
