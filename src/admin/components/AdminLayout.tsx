import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import '../styles/admin.css';

const AdminLayout: React.FC = () => {
    return (
        <div className="admin-wrapper">
            <Sidebar />
            <main className="admin-content">
                <Outlet />
            </main>
        </div>
    );
};

export default AdminLayout;
