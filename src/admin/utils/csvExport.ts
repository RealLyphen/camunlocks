/**
 * CSV Export Utility
 * Pure functions — no dependencies, works in any browser via Blob + anchor click.
 */
import type { Order, User, Coupon, Referral } from '../context/StoreContext';

function downloadCsv(filename: string, rows: string[][]) {
    const escape = (v: string | number | undefined | null) => {
        const s = String(v ?? '');
        return s.includes(',') || s.includes('"') || s.includes('\n')
            ? `"${s.replace(/"/g, '""')}"`
            : s;
    };
    const csv = rows.map(r => r.map(escape).join(',')).join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

export function exportOrders(orders: Order[], filename = `orders-${new Date().toISOString().slice(0, 10)}.csv`) {
    const allOrders: (Order & { customerEmail: string })[] = orders as any;
    const header = ['Order ID', 'Date', 'Customer Email', 'Items', 'Total ($)', 'Status', 'Payment Method', 'Order Note'];
    const rows: string[][] = [header];
    for (const o of allOrders) {
        const itemsStr = o.items.map(i => `${i.quantity}x ${i.name} ($${i.price})`).join(' | ');
        rows.push([
            o.id,
            new Date(o.date).toLocaleString(),
            o.customerEmail || '',
            itemsStr,
            o.total.toFixed(2),
            o.status,
            o.paymentMethod,
            o.orderNote || '',
        ]);
    }
    downloadCsv(filename, rows);
}

export function exportCustomers(users: User[], filename = `customers-${new Date().toISOString().slice(0, 10)}.csv`) {
    const header = ['User ID', 'Email', 'Created At', 'Balance ($)', 'Orders', 'Total Spent ($)', 'Tags'];
    const rows: string[][] = [header];
    for (const u of users) {
        const totalSpent = u.orders.reduce((s, o) => s + o.total, 0);
        rows.push([
            u.id,
            u.email,
            new Date(u.createdAt).toLocaleString(),
            u.balance.toFixed(2),
            String(u.orders.length),
            totalSpent.toFixed(2),
            (u.tags || []).join('; '),
        ]);
    }
    downloadCsv(filename, rows);
}

export function exportCoupons(coupons: Coupon[], orders: Order[], filename = `coupons-${new Date().toISOString().slice(0, 10)}.csv`) {
    const header = ['Code', 'Type', 'Value', 'Status', 'Usage Count', 'Usage Limit', 'Created At', 'Expiry'];
    const rows: string[][] = [header];
    for (const c of coupons) {
        rows.push([
            c.code,
            c.type,
            c.type === 'percentage' ? `${c.value}%` : `$${c.value}`,
            c.status,
            String(c.usageCount),
            c.usageLimit != null ? String(c.usageLimit) : 'Unlimited',
            new Date(c.createdAt).toLocaleString(),
            c.expiryDate ? new Date(c.expiryDate).toLocaleString() : 'None',
        ]);
    }
    downloadCsv(filename, rows);
}

export function exportReferrals(referrals: Referral[], filename = `referrals-${new Date().toISOString().slice(0, 10)}.csv`) {
    const header = ['Code', 'User Email', 'Type', 'Reward Multiplier', 'Usage Count', 'Total Earned ($)', 'Status', 'Created At'];
    const rows: string[][] = [header];
    for (const r of referrals) {
        rows.push([
            r.code,
            r.userEmail,
            r.referralType,
            String(r.rewardMultiplier),
            String(r.usageCount),
            r.totalEarned.toFixed(2),
            r.status,
            new Date(r.createdAt).toLocaleString(),
        ]);
    }
    downloadCsv(filename, rows);
}
