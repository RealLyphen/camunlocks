import React, { useMemo } from 'react';
import { AreaChart, Area, XAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Calendar, Info, TrendingUp, DollarSign, ShoppingBag, Users as UsersIcon } from 'lucide-react';
import { format, subDays, isSameDay } from 'date-fns';
import { useStore } from '../../context/StoreContext';

const Dashboard: React.FC = () => {
    const { products, users, referrals } = useStore();
    const orders = useMemo(() => users.flatMap(u => u.orders || []), [users]);

    // 1. Top Level Stats
    const totalRevenue = useMemo(() => orders.reduce((sum: number, o: any) => sum + o.total, 0), [orders]);
    const totalItemsSold = useMemo(() => orders.reduce((sum: number, o: any) => sum + o.items.reduce((s: number, i: any) => s + i.quantity, 0), 0), [orders]);
    const totalOrders = orders.length;
    const newCustomers = users.filter((u: any) => new Date(u.createdAt) > subDays(new Date(), 30)).length;

    // 2. Chart Data (Last 30 Days)
    const chartData = useMemo(() => {
        const data = [];
        for (let i = 29; i >= 0; i--) {
            const d = subDays(new Date(), i);
            const dayOrders = orders.filter((o: any) => isSameDay(new Date(o.date), d));
            data.push({
                name: format(d, 'MMM dd'),
                revenue: dayOrders.reduce((sum: number, o: any) => sum + o.total, 0),
                orders: dayOrders.length,
            });
        }
        return data;
    }, [orders]);

    // 3. Conversion Rate (Purchasing Users / Total Users)
    const purchasers = users.filter((u: any) => u.orders && u.orders.length > 0).length;
    const conversionRate = users.length > 0 ? (purchasers / users.length) * 100 : 0;
    const pieData = [
        { name: 'Purchasers', value: purchasers, color: 'var(--primary-color, #818cf8)' },
        { name: 'Non-Purchasers', value: users.length - purchasers, color: '#27272a' }
    ];

    // 4. Top Referrers
    const topReferrers = useMemo(() => {
        return [...referrals]
            .sort((a, b) => b.usageCount - a.usageCount)
            .slice(0, 5);
    }, [referrals]);

    // 5. Top Customers
    const topCustomers = useMemo(() => {
        return [...users]
            .map((u: any) => ({ ...u, spent: u.orders.reduce((s: number, o: any) => s + o.total, 0) }))
            .sort((a, b) => b.spent - a.spent)
            .slice(0, 5);
    }, [users]);

    // 6. Top Products
    const topProducts = useMemo(() => {
        const productSales: Record<string, { name: string; revenue: number; quantity: number }> = {};
        products.forEach((p: any) => {
            productSales[p.id] = { name: p.name, revenue: 0, quantity: 0 };
        });
        orders.forEach((o: any) => {
            o.items.forEach((item: any) => {
                if (productSales[item.id]) {
                    productSales[item.id].quantity += item.quantity;
                    productSales[item.id].revenue += item.price * item.quantity;
                }
            });
        });
        return Object.values(productSales)
            .sort((a, b) => b.revenue - a.revenue)
            .slice(0, 5);
    }, [orders, products]);

    return (
        <div>
            {/* Header */}
            <div className="admin-header">
                <div className="welcome-text">
                    <h1>Welcome to Dashboard <span style={{ WebkitTextFillColor: 'initial' }}>🚀</span></h1>
                    <p>Here's what is happening in your store today.</p>
                </div>
                <div className="date-range-picker">
                    <Calendar size={16} />
                    <span>Last 30 Days</span>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="dashboard-grid">
                <div className="stats-card">
                    <span className="stats-label"><DollarSign size={14} /> Revenue</span>
                    <div className="stats-value">${totalRevenue.toFixed(2)}</div>
                    <span className="stats-sub" style={{ color: '#4ade80' }}><TrendingUp size={12} /> Lifetime</span>
                </div>
                <div className="stats-card">
                    <span className="stats-label"><ShoppingBag size={14} /> Products Sold</span>
                    <div className="stats-value">{totalItemsSold}</div>
                    <span className="stats-sub" style={{ color: '#4ade80' }}><TrendingUp size={12} /> Lifetime</span>
                </div>
                <div className="stats-card">
                    <span className="stats-label"><ShoppingBag size={14} /> Total Orders</span>
                    <div className="stats-value">{totalOrders}</div>
                    <span className="stats-sub" style={{ color: '#4ade80' }}><TrendingUp size={12} /> Lifetime</span>
                </div>
                <div className="stats-card">
                    <span className="stats-label"><UsersIcon size={14} /> New Customers (30d)</span>
                    <div className="stats-value">{newCustomers}</div>
                    <span className="stats-sub" style={{ color: '#4ade80' }}><TrendingUp size={12} /> Recent</span>
                </div>
            </div>

            {/* Charts Row */}
            <div className="charts-row">
                {/* Revenue Chart */}
                <div className="chart-card">
                    <div className="chart-header">
                        <div className="chart-title">Revenue (Last 30 Days)</div>
                        <div style={{ display: 'flex', gap: 15, fontSize: '0.8rem' }}>
                            <span style={{ color: 'var(--primary-color, #818cf8)' }}>● Revenue</span>
                        </div>
                    </div>
                    <div style={{ height: 300, width: '100%' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="var(--primary-color, #818cf8)" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="var(--primary-color, #818cf8)" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                                <XAxis dataKey="name" stroke="#52525b" tick={{ fill: '#a1a1aa', fontSize: 11 }} minTickGap={20} />
                                <Tooltip
                                    contentStyle={{ background: 'rgba(20, 20, 25, 0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }}
                                    itemStyle={{ color: '#fff' }}
                                    cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1 }}
                                    formatter={(value: any) => {
                                        const num = typeof value === 'number' ? value : 0;
                                        return [`$${num.toFixed(2)}`, 'Revenue'] as any;
                                    }}
                                />
                                <Area type="monotone" dataKey="revenue" stroke="var(--primary-color, #818cf8)" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Conversion Rate */}
                <div className="chart-card">
                    <div className="chart-header">
                        <div className="chart-title">Conversion Rate <Info size={16} style={{ opacity: 0.5 }} /></div>
                    </div>
                    <div style={{ height: 250, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={pieData} cx="50%" cy="50%" innerRadius={80} outerRadius={95}
                                    paddingAngle={5} dataKey="value" stroke="none"
                                >
                                    {pieData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <text x="50%" y="50%" dy={-10} textAnchor="middle" fill="#fff" style={{ fontSize: '2.5rem', fontWeight: '800', fontFamily: 'Satoshi' }}>{conversionRate.toFixed(1)}%</text>
                                <text x="50%" y="50%" dy={20} textAnchor="middle" fill="#a1a1aa" style={{ fontSize: '0.85rem' }}>Purchasers</text>
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 20, fontSize: '0.9rem', color: '#a1a1aa' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}><span style={{ color: 'var(--primary-color, #818cf8)' }}>●</span> Purchasers</span>
                        <span style={{ color: '#fff', fontWeight: 'bold' }}>{purchasers} users</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: '0.9rem', color: '#a1a1aa' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}><span style={{ color: '#27272a' }}>●</span> Non-Purchasers</span>
                        <span style={{ color: '#fff', fontWeight: 'bold' }}>{users.length - purchasers} users</span>
                    </div>
                </div>
            </div>

            {/* Tables Row */}
            <div className="tables-row">
                <div className="table-card">
                    <div className="chart-header">
                        <div className="chart-title">Top Referrers <Info size={14} /></div>
                    </div>
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Code</th>
                                <th style={{ textAlign: 'center' }}>Referrals</th>
                                <th style={{ textAlign: 'right' }}>Earned</th>
                            </tr>
                        </thead>
                        <tbody>
                            {topReferrers.length === 0 && <tr><td colSpan={3} style={{ textAlign: 'center', color: '#71717a' }}>No referrals yet.</td></tr>}
                            {topReferrers.map(r => (
                                <tr key={r.id}>
                                    <td style={{ fontFamily: 'monospace', color: '#fff' }}>{r.code}</td>
                                    <td style={{ textAlign: 'center' }}>{r.usageCount}</td>
                                    <td style={{ textAlign: 'right', color: '#4ade80' }}>${r.totalEarned.toFixed(2)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="table-card">
                    <div className="chart-header">
                        <div className="chart-title">Top Customers</div>
                    </div>
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Email</th>
                                <th style={{ textAlign: 'center' }}>Orders</th>
                                <th style={{ textAlign: 'right' }}>Spent</th>
                            </tr>
                        </thead>
                        <tbody>
                            {topCustomers.length === 0 && <tr><td colSpan={3} style={{ textAlign: 'center', color: '#71717a' }}>No customers yet.</td></tr>}
                            {topCustomers.map((u, i) => (
                                <tr key={u.id}>
                                    <td style={{ color: i === 0 ? '#fbbf24' : '#fff' }}>{i === 0 ? '👑 ' : ''}{u.email}</td>
                                    <td style={{ textAlign: 'center' }}>{u.orders.length}</td>
                                    <td style={{ textAlign: 'right', fontWeight: 'bold' }}>${u.spent.toFixed(2)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Top Products Section */}
            <div className="table-card" style={{ marginTop: 24, marginBottom: 40 }}>
                <div className="chart-header">
                    <div className="chart-title">Top Selling Products <Info size={14} /></div>
                </div>
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Product Name</th>
                            <th style={{ textAlign: 'center' }}>Units Sold</th>
                            <th style={{ textAlign: 'right' }}>Total Revenue</th>
                        </tr>
                    </thead>
                    <tbody>
                        {topProducts.length === 0 && <tr><td colSpan={3} style={{ textAlign: 'center', color: '#71717a' }}>No product sales yet.</td></tr>}
                        {topProducts.map((p, i) => (
                            <tr key={i}>
                                <td style={{ fontWeight: 500, color: '#fff' }}>{p.name}</td>
                                <td style={{ textAlign: 'center' }}>{p.quantity}</td>
                                <td style={{ textAlign: 'right', color: '#4ade80', fontWeight: 'bold' }}>${p.revenue.toFixed(2)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Dashboard;
