import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useToast } from '../../../context/ToastContext';

const CreateBlacklist: React.FC = () => {
    const navigate = useNavigate();
    const { addToast } = useToast();
    const [formData, setFormData] = useState({
        value: '',
        type: 'IP',
        reason: ''
    });

    const handleSubmit = () => {
        if (!formData.value || !formData.reason) {
            addToast('Please fill in all fields', 'error');
            return;
        }

        // Save Blacklist
        const newBlacklist = {
            id: Date.now(),
            ...formData,
            time: new Date().toISOString()
        };

        const existingBlacklists = JSON.parse(localStorage.getItem('blacklists') || '[]');
        localStorage.setItem('blacklists', JSON.stringify([newBlacklist, ...existingBlacklists]));

        // Create Audit Log
        const newLog = {
            id: Date.now(),
            action: 'Blacklisted ' + formData.type + ': ' + formData.value,
            user: 'Admin',
            details: formData.reason,
            date: new Date().toISOString()
        };

        const existingLogs = JSON.parse(localStorage.getItem('auditLogs') || '[]');
        localStorage.setItem('auditLogs', JSON.stringify([newLog, ...existingLogs]));

        // Navigate back
        navigate('/admin/fraud/blacklists');
    };

    return (
        <div style={{ maxWidth: 800 }}>
            {/* Header / Breadcrumb */}
            <div className="admin-header" style={{ display: 'flex', flexDirection: 'column', gap: 15, marginBottom: 30 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#a1a1aa', fontSize: '0.9rem' }}>
                    <Link to="/admin" style={{ color: '#a1a1aa', textDecoration: 'none' }}>Home</Link> /
                    <span style={{ color: '#a1a1aa' }}>Fraud Shield</span> /
                    <Link to="/admin/fraud/blacklists" style={{ color: '#a1a1aa', textDecoration: 'none' }}>Blacklists</Link> /
                    <span style={{ color: '#fff' }}>Create</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h1 style={{ fontSize: '1.8rem', fontWeight: 700, margin: 0 }}>Create Blacklist</h1>
                    <button className="btn-primary" onClick={handleSubmit}>Save Changes</button>
                </div>
            </div>

            <div className="table-card" style={{ padding: 40 }}>
                <div style={{ marginBottom: 30 }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: 8, color: '#fff' }}>Blacklist Information</h3>
                    <p style={{ color: '#a1a1aa', fontSize: '0.9rem', margin: 0 }}>Blacklist a value to prevent it from being used in the store.</p>
                </div>

                <div className="form-group">
                    <label>Blocked Value</label>
                    <input
                        type="text"
                        placeholder={formData.type === 'IP' ? "Enter an IP address" : "Enter an Email address"}
                        className="admin-input"
                        value={formData.value}
                        onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                    />
                </div>

                <div className="form-group">
                    <label>Type</label>
                    <select
                        className="admin-input"
                        value={formData.type}
                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    >
                        <option value="IP">IP</option>
                        <option value="Email">Email</option>
                    </select>
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                    <label>Reason</label>
                    <textarea
                        placeholder="Enter a reason for blacklisting"
                        className="admin-input"
                        style={{ height: 120, resize: 'none' }}
                        value={formData.reason}
                        onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                    />
                </div>
            </div>
        </div>
    );
};

export default CreateBlacklist;
