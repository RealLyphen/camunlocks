import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import '../styles/admin.css';

const AdminLayout: React.FC = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const location = useLocation();

    // Close sidebar on route change (mobile)
    useEffect(() => {
        setSidebarOpen(false);
    }, [location.pathname]);

    // Close sidebar on resize to desktop
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth > 1024) setSidebarOpen(false);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Prevent body scroll when sidebar is open on mobile
    useEffect(() => {
        if (sidebarOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [sidebarOpen]);

    return (
        <div className="admin-wrapper">
            {/* Mobile Header Bar */}
            <div className="admin-mobile-header">
                <button
                    className="admin-hamburger"
                    onClick={() => setSidebarOpen(prev => !prev)}
                    aria-label="Toggle menu"
                >
                    <span className={`hamburger-line ${sidebarOpen ? 'open' : ''}`} />
                    <span className={`hamburger-line ${sidebarOpen ? 'open' : ''}`} />
                    <span className={`hamburger-line ${sidebarOpen ? 'open' : ''}`} />
                </button>
                <div className="admin-mobile-brand">
                    <img src="/logo.png" alt="Logo" style={{ width: 24, height: 24 }} />
                    <span>Camunlocks</span>
                </div>
                <div style={{ width: 40 }} /> {/* Spacer for centering */}
            </div>

            {/* Sidebar Overlay (mobile only) */}
            {sidebarOpen && (
                <div
                    className="admin-sidebar-overlay"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
            <main className="admin-content">
                <Outlet />
            </main>
        </div>
    );
};

export default AdminLayout;
