import React, { useState } from 'react';
import { useStore } from '../../../context/StoreContext';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Save, ArrowLeft, Ticket, DollarSign, Percent,
    Calendar, Hash, Package, Search, Check,
    Sparkles, Shield, Clock, Tag
} from 'lucide-react';

// Reusable Section component
const Section: React.FC<{
    icon: React.ReactNode; title: string; subtitle: string;
    delay?: number; children: React.ReactNode;
}> = ({ icon, title, subtitle, delay = 0, children }) => (
    <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay }}
        style={{
            background: 'rgba(255,255,255,0.025)',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: 16,
            overflow: 'hidden',
            backdropFilter: 'blur(12px)',
        }}
    >
        <div style={{
            padding: '20px 28px',
            borderBottom: '1px solid rgba(255,255,255,0.05)',
            display: 'flex', alignItems: 'center', gap: 14,
        }}>
            <div style={{
                width: 38, height: 38, borderRadius: 10,
                background: 'rgba(99,102,241,0.12)',
                border: '1px solid rgba(99,102,241,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
                {icon}
            </div>
            <div>
                <div style={{ fontSize: '1rem', fontWeight: 700, color: '#fff' }}>{title}</div>
                <div style={{ fontSize: '0.8rem', color: '#71717a' }}>{subtitle}</div>
            </div>
        </div>
        <div style={{ padding: '24px 28px' }}>
            {children}
        </div>
    </motion.div>
);

// Toggle component
const Toggle: React.FC<{
    icon: React.ReactNode; label: string; sublabel: string;
    value: boolean; onChange: (v: boolean) => void;
}> = ({ icon, label, sublabel, value, onChange }) => (
    <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '14px 0',
        borderBottom: '1px solid rgba(255,255,255,0.04)',
    }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ color: '#71717a' }}>{icon}</div>
            <div>
                <div style={{ fontSize: '0.9rem', fontWeight: 500, color: '#e4e4e7' }}>{label}</div>
                <div style={{ fontSize: '0.78rem', color: '#52525b' }}>{sublabel}</div>
            </div>
        </div>
        <div
            onClick={() => onChange(!value)}
            style={{
                width: 44, height: 24, borderRadius: 12, cursor: 'pointer',
                background: value ? '#6366f1' : 'rgba(255,255,255,0.1)',
                border: `1px solid ${value ? '#818cf8' : 'rgba(255,255,255,0.15)'}`,
                transition: 'all 0.25s', position: 'relative',
            }}
        >
            <div style={{
                width: 18, height: 18, borderRadius: '50%', background: '#fff',
                position: 'absolute', top: 2,
                left: value ? 22 : 2,
                transition: 'left 0.25s',
                boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
            }} />
        </div>
    </div>
);

const CreateCoupon: React.FC = () => {
    const { addCoupon, products } = useStore();
    const navigate = useNavigate();

    // Form state
    const [code, setCode] = useState('');
    const [type, setType] = useState<'fixed' | 'percentage'>('fixed');
    const [value, setValue] = useState('');
    const [status, setStatus] = useState<'active' | 'disabled'>('active');

    // Optional settings
    const [enableStartDate, setEnableStartDate] = useState(false);
    const [startDate, setStartDate] = useState('');
    const [enableExpiryDate, setEnableExpiryDate] = useState(false);
    const [expiryDate, setExpiryDate] = useState('');
    const [enableUsageLimit, setEnableUsageLimit] = useState(false);
    const [usageLimit, setUsageLimit] = useState('');
    const [enableProductRestriction, setEnableProductRestriction] = useState(false);
    const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
    const [productSearch, setProductSearch] = useState('');

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(productSearch.toLowerCase())
    );

    const toggleProduct = (id: string) => {
        setSelectedProductIds(prev =>
            prev.includes(id) ? prev.filter(pid => pid !== id) : [...prev, id]
        );
    };

    const handleSave = () => {
        if (!code.trim() || !value) return;

        addCoupon({
            code: code.toUpperCase().trim(),
            type,
            value: parseFloat(value),
            status,
            usageLimit: enableUsageLimit && usageLimit ? parseInt(usageLimit) : null,
            startDate: enableStartDate && startDate ? new Date(startDate).toISOString() : null,
            expiryDate: enableExpiryDate && expiryDate ? new Date(expiryDate).toISOString() : null,
            productIds: enableProductRestriction ? selectedProductIds : [],
        });

        navigate('/admin/products/coupons');
    };

    const discountPreview = value
        ? type === 'fixed' ? `$${parseFloat(value).toFixed(2)} off` : `${value}% off`
        : '—';

    return (
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}
            >
                <div>
                    <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#fff', margin: 0 }}>Create Coupon</h1>
                    <p style={{ color: '#71717a', margin: '4px 0 0', fontSize: '0.95rem' }}>Add a new discount coupon for your store</p>
                </div>
                <div style={{ display: 'flex', gap: 12 }}>
                    <Link to="/admin/products/coupons" style={{
                        display: 'flex', alignItems: 'center', gap: 8,
                        padding: '10px 20px', borderRadius: 10,
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        color: '#a1a1aa', textDecoration: 'none',
                        fontWeight: 600, fontSize: '0.9rem',
                        transition: 'all 0.2s',
                    }}>
                        <ArrowLeft size={16} /> Cancel
                    </Link>
                    <button onClick={handleSave} disabled={!code.trim() || !value} style={{
                        display: 'flex', alignItems: 'center', gap: 8,
                        padding: '10px 24px', borderRadius: 10,
                        background: (!code.trim() || !value) ? 'rgba(99,102,241,0.3)' : 'linear-gradient(135deg, #6366f1, var(--secondary-color))',
                        border: '1px solid rgba(99,102,241,0.4)',
                        color: '#fff', fontWeight: 700, fontSize: '0.9rem',
                        cursor: (!code.trim() || !value) ? 'not-allowed' : 'pointer',
                        transition: 'all 0.2s',
                        boxShadow: (!code.trim() || !value) ? 'none' : '0 4px 20px rgba(99,102,241,0.3)',
                    }}>
                        <Save size={16} /> Create Coupon
                    </button>
                </div>
            </motion.div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 24, alignItems: 'start' }}>
                {/* Left Column */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

                    {/* Coupon Code */}
                    <Section
                        icon={<Ticket size={18} color="#818cf8" />}
                        title="Coupon Code"
                        subtitle="The code customers will enter at checkout"
                        delay={0.05}
                    >
                        <div className="form-group">
                            <label>Code</label>
                            <input
                                type="text"
                                className="admin-input"
                                placeholder="e.g. SUMMER20, WELCOME10"
                                value={code}
                                onChange={e => setCode(e.target.value.toUpperCase())}
                                style={{
                                    fontFamily: "'JetBrains Mono', monospace",
                                    letterSpacing: '2px', fontWeight: 700,
                                    fontSize: '1.1rem',
                                }}
                            />
                            <div style={{ fontSize: '0.78rem', color: '#52525b', marginTop: 6 }}>
                                Code will be auto-uppercased. No spaces allowed.
                            </div>
                        </div>
                    </Section>

                    {/* Coupon Value */}
                    <Section
                        icon={<Tag size={18} color="#818cf8" />}
                        title="Coupon Value"
                        subtitle="Set the discount type and amount"
                        delay={0.1}
                    >
                        {/* Type Selector */}
                        <div className="form-group" style={{ marginBottom: 20 }}>
                            <label>Discount Type</label>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                                {(['fixed', 'percentage'] as const).map(t => (
                                    <div
                                        key={t}
                                        onClick={() => setType(t)}
                                        style={{
                                            padding: '16px 20px', borderRadius: 12, cursor: 'pointer',
                                            background: type === t ? 'rgba(99,102,241,0.12)' : 'rgba(255,255,255,0.03)',
                                            border: `1.5px solid ${type === t ? 'rgba(99,102,241,0.5)' : 'rgba(255,255,255,0.08)'}`,
                                            transition: 'all 0.25s',
                                            display: 'flex', alignItems: 'center', gap: 14,
                                        }}
                                    >
                                        <div style={{
                                            width: 40, height: 40, borderRadius: 10,
                                            background: type === t
                                                ? 'linear-gradient(135deg, #6366f1, var(--secondary-color))'
                                                : 'rgba(255,255,255,0.06)',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            transition: 'all 0.25s',
                                        }}>
                                            {t === 'fixed'
                                                ? <DollarSign size={20} color={type === t ? '#fff' : '#71717a'} />
                                                : <Percent size={20} color={type === t ? '#fff' : '#71717a'} />
                                            }
                                        </div>
                                        <div>
                                            <div style={{
                                                fontWeight: 700, fontSize: '0.9rem',
                                                color: type === t ? '#fff' : '#a1a1aa',
                                            }}>
                                                {t === 'fixed' ? 'Fixed Amount' : 'Percentage'}
                                            </div>
                                            <div style={{ fontSize: '0.75rem', color: '#52525b' }}>
                                                {t === 'fixed' ? 'Flat dollar discount' : 'Percentage-based discount'}
                                            </div>
                                        </div>
                                        {type === t && (
                                            <div style={{ marginLeft: 'auto' }}>
                                                <Check size={18} color="#6366f1" />
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Value Input */}
                        <div className="form-group">
                            <label>Discount Value</label>
                            <div style={{ position: 'relative' }}>
                                <div style={{
                                    position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
                                    color: '#6366f1', fontWeight: 700, fontSize: '1rem',
                                    pointerEvents: 'none',
                                }}>
                                    {type === 'fixed' ? '$' : '%'}
                                </div>
                                <input
                                    type="number"
                                    className="admin-input"
                                    placeholder={type === 'fixed' ? '5.00' : '20'}
                                    value={value}
                                    onChange={e => setValue(e.target.value)}
                                    min="0"
                                    max={type === 'percentage' ? '100' : undefined}
                                    step={type === 'fixed' ? '0.01' : '1'}
                                    style={{ paddingLeft: 36, fontWeight: 600 }}
                                />
                            </div>
                        </div>

                        {/* Status */}
                        <div className="form-group" style={{ marginTop: 16 }}>
                            <label>Status</label>
                            <div style={{ display: 'flex', gap: 12 }}>
                                {(['active', 'disabled'] as const).map(s => (
                                    <button
                                        key={s}
                                        onClick={() => setStatus(s)}
                                        style={{
                                            padding: '8px 20px', borderRadius: 8,
                                            background: status === s
                                                ? s === 'active' ? 'rgba(74,222,128,0.12)' : 'rgba(248,113,113,0.12)'
                                                : 'rgba(255,255,255,0.04)',
                                            border: `1px solid ${status === s
                                                ? s === 'active' ? 'rgba(74,222,128,0.3)' : 'rgba(248,113,113,0.3)'
                                                : 'rgba(255,255,255,0.08)'}`,
                                            color: status === s
                                                ? s === 'active' ? '#4ade80' : '#f87171'
                                                : '#71717a',
                                            fontWeight: 600, fontSize: '0.85rem',
                                            cursor: 'pointer', transition: 'all 0.2s',
                                            textTransform: 'capitalize',
                                        }}
                                    >
                                        ● {s}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </Section>

                    {/* Optional Settings */}
                    <Section
                        icon={<Shield size={18} color="#818cf8" />}
                        title="Restrictions & Limits"
                        subtitle="Optional usage limits and date restrictions"
                        delay={0.15}
                    >
                        <Toggle
                            icon={<Calendar size={18} />}
                            label="Start Date"
                            sublabel="Set a release date for this coupon"
                            value={enableStartDate}
                            onChange={setEnableStartDate}
                        />
                        <AnimatePresence>
                            {enableStartDate && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    style={{ overflow: 'hidden', paddingTop: 12, paddingBottom: 8 }}
                                >
                                    <input
                                        type="datetime-local"
                                        className="admin-input"
                                        value={startDate}
                                        onChange={e => setStartDate(e.target.value)}
                                    />
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <Toggle
                            icon={<Clock size={18} />}
                            label="Expiry Date"
                            sublabel="Set an expiration date for this coupon"
                            value={enableExpiryDate}
                            onChange={setEnableExpiryDate}
                        />
                        <AnimatePresence>
                            {enableExpiryDate && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    style={{ overflow: 'hidden', paddingTop: 12, paddingBottom: 8 }}
                                >
                                    <input
                                        type="datetime-local"
                                        className="admin-input"
                                        value={expiryDate}
                                        onChange={e => setExpiryDate(e.target.value)}
                                    />
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <Toggle
                            icon={<Hash size={18} />}
                            label="Limit Quantity"
                            sublabel="Limit the number of times this coupon can be used"
                            value={enableUsageLimit}
                            onChange={setEnableUsageLimit}
                        />
                        <AnimatePresence>
                            {enableUsageLimit && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    style={{ overflow: 'hidden', paddingTop: 12, paddingBottom: 8 }}
                                >
                                    <input
                                        type="number"
                                        className="admin-input"
                                        placeholder="e.g. 100"
                                        value={usageLimit}
                                        onChange={e => setUsageLimit(e.target.value)}
                                        min="1"
                                    />
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <Toggle
                            icon={<Package size={18} />}
                            label="Product Restrictions"
                            sublabel="Limit coupon to specific products"
                            value={enableProductRestriction}
                            onChange={setEnableProductRestriction}
                        />
                    </Section>

                    {/* Product Selection (if restriction enabled) */}
                    <AnimatePresence>
                        {enableProductRestriction && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                style={{ overflow: 'hidden' }}
                            >
                                <Section
                                    icon={<Package size={18} color="#818cf8" />}
                                    title="Select Products"
                                    subtitle="Choose which products this coupon applies to"
                                    delay={0}
                                >
                                    <div style={{ position: 'relative', marginBottom: 16 }}>
                                        <Search size={16} style={{
                                            position: 'absolute', left: 12, top: '50%',
                                            transform: 'translateY(-50%)', color: '#52525b',
                                            pointerEvents: 'none',
                                        }} />
                                        <input
                                            type="text"
                                            className="admin-input"
                                            placeholder="Search products..."
                                            value={productSearch}
                                            onChange={e => setProductSearch(e.target.value)}
                                            style={{ paddingLeft: 36 }}
                                        />
                                    </div>
                                    <div style={{ maxHeight: 240, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 6 }}>
                                        {filteredProducts.map(product => {
                                            const selected = selectedProductIds.includes(product.id);
                                            return (
                                                <div
                                                    key={product.id}
                                                    onClick={() => toggleProduct(product.id)}
                                                    style={{
                                                        padding: '10px 14px', borderRadius: 10,
                                                        background: selected ? 'rgba(99,102,241,0.1)' : 'rgba(255,255,255,0.02)',
                                                        border: `1px solid ${selected ? 'rgba(99,102,241,0.3)' : 'rgba(255,255,255,0.06)'}`,
                                                        cursor: 'pointer', transition: 'all 0.2s',
                                                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                                    }}
                                                >
                                                    <span style={{ color: selected ? '#818cf8' : '#a1a1aa', fontWeight: 500, fontSize: '0.875rem' }}>
                                                        {product.name}
                                                    </span>
                                                    {selected && <Check size={16} color="#6366f1" />}
                                                </div>
                                            );
                                        })}
                                        {filteredProducts.length === 0 && (
                                            <div style={{ padding: 20, textAlign: 'center', color: '#52525b', fontSize: '0.85rem' }}>
                                                No products found
                                            </div>
                                        )}
                                    </div>
                                </Section>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Right Column — Summary */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 24, position: 'sticky', top: 24 }}>
                    {/* Coupon Preview */}
                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.45, delay: 0.2 }}
                        style={{
                            background: 'linear-gradient(135deg, rgba(99,102,241,0.08), rgba(139,92,246,0.06))',
                            border: '1px solid rgba(99,102,241,0.2)',
                            borderRadius: 16, overflow: 'hidden',
                            padding: '28px',
                        }}
                    >
                        <div style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            marginBottom: 20, padding: '24px 0',
                            background: 'rgba(0,0,0,0.2)', borderRadius: 12,
                            border: '1px dashed rgba(99,102,241,0.3)',
                        }}>
                            <Ticket size={28} color="#818cf8" style={{ marginRight: 12 }} />
                            <span style={{
                                fontFamily: "'JetBrains Mono', monospace",
                                fontSize: '1.5rem', fontWeight: 800,
                                color: code.trim() ? '#fff' : '#52525b',
                                letterSpacing: '3px',
                            }}>
                                {code.trim() || 'CODE'}
                            </span>
                        </div>

                        <div style={{
                            textAlign: 'center', fontSize: '2rem', fontWeight: 800,
                            color: '#4ade80', marginBottom: 20,
                        }}>
                            {discountPreview}
                        </div>

                        <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 16 }}>
                            {[
                                { label: 'Type', val: type === 'fixed' ? 'Fixed Amount' : 'Percentage' },
                                { label: 'Status', val: status },
                                { label: 'Usage Limit', val: enableUsageLimit && usageLimit ? usageLimit : '∞' },
                                { label: 'Products', val: enableProductRestriction ? `${selectedProductIds.length} selected` : 'All products' },
                                { label: 'Start Date', val: enableStartDate && startDate ? new Date(startDate).toLocaleDateString() : 'Immediately' },
                                { label: 'Expiry', val: enableExpiryDate && expiryDate ? new Date(expiryDate).toLocaleDateString() : 'Never' },
                            ].map((row, i) => (
                                <div key={i} style={{
                                    display: 'flex', justifyContent: 'space-between',
                                    padding: '8px 0', fontSize: '0.85rem',
                                }}>
                                    <span style={{ color: '#71717a' }}>{row.label}</span>
                                    <span style={{ color: '#e4e4e7', fontWeight: 500, textTransform: 'capitalize' }}>{row.val}</span>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Quick Tip */}
                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.45, delay: 0.3 }}
                        style={{
                            background: 'rgba(255,255,255,0.025)',
                            border: '1px solid rgba(255,255,255,0.06)',
                            borderRadius: 16, padding: '20px 24px',
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                            <Sparkles size={16} color="#fbbf24" />
                            <span style={{ fontWeight: 700, color: '#fbbf24', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                Quick Tip
                            </span>
                        </div>
                        <p style={{ color: '#71717a', fontSize: '0.82rem', lineHeight: 1.6, margin: 0 }}>
                            Coupon codes are case-insensitive. Customers can enter "demo" or "DEMO" — both will work. Use memorable codes for better conversion.
                        </p>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default CreateCoupon;
