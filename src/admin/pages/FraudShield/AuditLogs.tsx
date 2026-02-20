import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';

interface LogItem {
    id: number;
    action: string;
    user: string;
    details: string;
    date: string;
}

const AuditLogs: React.FC = () => {
    const [logs, setLogs] = useState<LogItem[]>([]);

    useEffect(() => {
        const saved = localStorage.getItem('auditLogs');
        if (saved) {
            setLogs(JSON.parse(saved));
        }
    }, []);

    return (
        <div>
            <div className="admin-header">
                <div>
                    <h1 style={{ fontSize: '2rem' }}>Audit Logs</h1>
                    <p style={{ color: '#a1a1aa' }}>View system events and user actions.</p>
                </div>
            </div>

            <div className="table-card">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Action</th>
                            <th>User</th>
                            <th>Details</th>
                            <th>Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        {logs.length === 0 ? (
                            <tr>
                                <td colSpan={4} style={{ textAlign: 'center', padding: 60, color: '#a1a1aa' }}>
                                    No audit logs found
                                </td>
                            </tr>
                        ) : (
                            logs.map(log => (
                                <tr key={log.id}>
                                    <td style={{ fontWeight: 600, color: '#fff' }}>{log.action}</td>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                            <div style={{
                                                width: 24, height: 24,
                                                background: 'linear-gradient(135deg, var(--primary-color), var(--secondary-color))',
                                                borderRadius: '50%',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                fontSize: '0.6rem', fontWeight: 700
                                            }}>A</div>
                                            {log.user}
                                        </div>
                                    </td>
                                    <td style={{ color: '#a1a1aa', maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                        {log.details}
                                    </td>
                                    <td style={{ color: '#a1a1aa', fontSize: '0.9rem' }}>
                                        {format(new Date(log.date), 'MMM d, yyyy HH:mm:ss')}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AuditLogs;
