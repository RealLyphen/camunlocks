import React, { useState, useEffect } from 'react';
import { useStore } from '../../../context/StoreContext';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import RichTextEditor from '../../../components/RichTextEditor';
import {
    Save, ArrowLeft, CreditCard, Calendar,
    Shield, RefreshCw, AlignLeft, AlertCircle
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

const EditGiftCard: React.FC = () => {
    const { id } = useParams();
    const { giftCards, updateGiftCard } = useStore();
    const navigate = useNavigate();

    const [amount, setAmount] = useState('');
    const [currency, setCurrency] = useState('USD');
    const [code, setCode] = useState('');
    const [message, setMessage] = useState('');
    const [enableExpiry, setEnableExpiry] = useState(false);
    const [expiryDate, setExpiryDate] = useState('');
    const [status, setStatus] = useState<'active' | 'redeemed' | 'expired'>('active');

    useEffect(() => {
        const card = giftCards.find(c => c.id === id);
        if (card) {
            setAmount(card.amount.toString());
            setCurrency(card.currency);
            setCode(card.code);
            setMessage(card.message);
            setStatus(card.status);
            if (card.expiryDate) {
                setEnableExpiry(true);
                // Format for datetime-local input: YYYY-MM-DDThh:mm
                setExpiryDate(new Date(card.expiryDate).toISOString().slice(0, 16));
            }
        } else {
            navigate('/admin/products/giftcards');
        }
    }, [id, giftCards, navigate]);

    const generateCode = () => {
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
        let result = '';
        for (let i = 0; i < 16; i++) {
            if (i > 0 && i % 4 === 0) result += '-';
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        setCode(result);
    };

    const handleSave = () => {
        if (!code.trim() || !amount || !id) return;

        updateGiftCard(id, {
            code: code.trim(),
            amount: parseFloat(amount),
            currency,
            message,
            expiryDate: enableExpiry && expiryDate ? new Date(expiryDate).toISOString() : null,
        });

        navigate('/admin/products/giftcards');
    };

    const modules = {
        toolbar: [
            [{ 'header': [1, 2, false] }],
            ['bold', 'italic', 'underline', 'strike'],
            [{ 'list': 'ordered' }, { 'list': 'bullet' }],
            ['link', 'clean']
        ],
    };

    const isEditable = status === 'active';



    return (
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}
            >
                <div>
                    <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#fff', margin: 0 }}>Edit Gift Card</h1>
                    <p style={{ color: '#71717a', margin: '4px 0 0', fontSize: '0.95rem' }}>Modify gift card details</p>
                </div>
                <div style={{ display: 'flex', gap: 12 }}>
                    <Link to="/admin/products/giftcards" style={{
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
                    <button onClick={handleSave} disabled={!code.trim() || !amount} style={{
                        display: 'flex', alignItems: 'center', gap: 8,
                        padding: '10px 24px', borderRadius: 10,
                        background: (!code.trim() || !amount) ? 'rgba(99,102,241,0.3)' : 'linear-gradient(135deg, #6366f1, var(--secondary-color))',
                        border: '1px solid rgba(99,102,241,0.4)',
                        color: '#fff', fontWeight: 700, fontSize: '0.9rem',
                        cursor: (!code.trim() || !amount) ? 'not-allowed' : 'pointer',
                        transition: 'all 0.2s',
                        boxShadow: (!code.trim() || !amount) ? 'none' : '0 4px 20px rgba(99,102,241,0.3)',
                    }}>
                        <Save size={16} /> Save Changes
                    </button>
                </div>
            </motion.div>

            {!isEditable && (
                <div style={{
                    marginBottom: 24, padding: '16px 20px', borderRadius: 12,
                    background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.2)',
                    display: 'flex', alignItems: 'center', gap: 12, color: '#f87171'
                }}>
                    <AlertCircle size={20} />
                    <span style={{ fontWeight: 500 }}>
                        This gift card is {status}. Some fields may not be editable if it has already been used.
                    </span>
                </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 24, alignItems: 'start' }}>
                {/* Left Column */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

                    {/* Basic Info */}
                    <Section
                        icon={<CreditCard size={18} color="#818cf8" />}
                        title="Card Details"
                        subtitle="Set the value and code for this card"
                        delay={0.05}
                    >
                        <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: 16, marginBottom: 20 }}>
                            <div className="form-group">
                                <label>Currency</label>
                                <select
                                    className="admin-input"
                                    value={currency}
                                    onChange={e => setCurrency(e.target.value)}
                                    disabled={!isEditable}
                                >
                                    <option value="USD">USD ($)</option>
                                    <option value="EUR">EUR (€)</option>
                                    <option value="GBP">GBP (£)</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Gift Card Value</label>
                                <div style={{ position: 'relative' }}>
                                    <div style={{
                                        position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
                                        color: '#6366f1', fontWeight: 700
                                    }}>
                                        {currency === 'USD' ? '$' : currency === 'EUR' ? '€' : '£'}
                                    </div>
                                    <input
                                        type="number"
                                        className="admin-input"
                                        placeholder="0.00"
                                        value={amount}
                                        onChange={e => setAmount(e.target.value)}
                                        style={{ paddingLeft: 32 }}
                                        min="0"
                                        step="0.01"
                                        disabled={!isEditable}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Gift Card Code</label>
                            <div style={{ display: 'flex', gap: 10 }}>
                                <input
                                    type="text"
                                    className="admin-input"
                                    placeholder="Enter or generate code"
                                    value={code}
                                    onChange={e => setCode(e.target.value)}
                                    style={{ fontFamily: "'JetBrains Mono', monospace", letterSpacing: '1px' }}
                                    disabled={!isEditable}
                                />
                                <button
                                    onClick={generateCode}
                                    disabled={!isEditable}
                                    style={{
                                        padding: '0 16px', borderRadius: 10,
                                        background: 'rgba(255,255,255,0.05)',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        color: '#fff', cursor: isEditable ? 'pointer' : 'not-allowed',
                                        display: 'flex', alignItems: 'center', gap: 8,
                                        fontSize: '0.9rem', fontWeight: 500,
                                        transition: 'all 0.2s',
                                        flexShrink: 0,
                                        opacity: isEditable ? 1 : 0.5
                                    }}
                                    className="hover-bg-white-10"
                                >
                                    <RefreshCw size={16} /> Generate
                                </button>
                            </div>
                        </div>
                    </Section>

                    {/* Message */}
                    <Section
                        icon={<AlignLeft size={18} color="#818cf8" />}
                        title="Personalization"
                        subtitle="Add a message for the recipient"
                        delay={0.1}
                    >
                        <div className="form-group rich-text-container">
                            <label>Message</label>
                            <div style={{
                                background: 'rgba(0,0,0,0.2)',
                                borderRadius: 12,
                                border: '1px solid rgba(255,255,255,0.08)',
                                overflow: 'hidden'
                            }}>
                                <RichTextEditor
                                    theme="snow"
                                    value={message}
                                    onChange={setMessage}
                                    modules={modules}
                                    style={{ color: '#e4e4e7' }}
                                    readOnly={!isEditable}
                                />
                            </div>
                            <style>{`
                                .ql-toolbar { border-color: rgba(255,255,255,0.08) !important; background: rgba(255,255,255,0.02); }
                                .ql-container { border: none !important; font-family: inherit; font-size: 1rem; }
                                .ql-editor { min-height: 120px; color: #e4e4e7; }
                                .ql-picker { color: #a1a1aa !important; }
                                .ql-stroke { stroke: #a1a1aa !important; }
                                .ql-fill { fill: #a1a1aa !important; }
                            `}</style>
                        </div>
                    </Section>

                    {/* Settings */}
                    <Section
                        icon={<Shield size={18} color="#818cf8" />}
                        title="Settings"
                        subtitle="Configure expiration rules"
                        delay={0.15}
                    >
                        <Toggle
                            icon={<Calendar size={18} />}
                            label="Expiry Date"
                            sublabel="Set an expiration date for this card"
                            value={enableExpiry}
                            onChange={setEnableExpiry}
                        />
                        <AnimatePresence>
                            {enableExpiry && (
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
                                        disabled={!isEditable}
                                    />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </Section>

                </div>

                {/* Right Column - Preview */}
                <div style={{ position: 'sticky', top: 24, display: 'flex', flexDirection: 'column', gap: 24 }}>
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
                            marginBottom: 24,
                            background: 'linear-gradient(135deg, #6366f1 0%, var(--secondary-color) 100%)',
                            borderRadius: 16,
                            padding: 24,
                            boxShadow: '0 10px 30px rgba(99,102,241,0.4)',
                            border: '1px solid rgba(255,255,255,0.2)',
                            position: 'relative',
                            overflow: 'hidden'
                        }}>
                            {/* Decorative circles */}
                            <div style={{ position: 'absolute', top: -20, right: -20, width: 100, height: 100, borderRadius: '50%', background: 'rgba(255,255,255,0.1)' }} />
                            <div style={{ position: 'absolute', bottom: -10, left: -10, width: 60, height: 60, borderRadius: '50%', background: 'rgba(255,255,255,0.1)' }} />

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 30 }}>
                                <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fff', textShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>GIFT CARD</div>
                                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#fff' }}>
                                    {currency === 'USD' ? '$' : currency === 'EUR' ? '€' : '£'}
                                    {amount ? parseFloat(amount).toFixed(2) : '0.00'}
                                </div>
                            </div>

                            <div style={{
                                fontFamily: "'JetBrains Mono', monospace",
                                fontSize: '1.1rem', fontWeight: 600, color: 'rgba(255,255,255,0.9)',
                                letterSpacing: '2px',
                                textShadow: '0 1px 2px rgba(0,0,0,0.1)',
                                marginBottom: 12
                            }}>
                                {code || 'XXXX-XXXX-XXXX-XXXX'}
                            </div>
                        </div>

                        <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 16 }}>
                            <div style={{ fontSize: '0.85rem', color: '#71717a', marginBottom: 8 }}>Message:</div>
                            <div
                                style={{ fontSize: '0.9rem', color: '#e4e4e7', lineHeight: 1.6 }}
                                dangerouslySetInnerHTML={{ __html: message || '<span style="color:#52525b; font-style:italic">No message added</span>' }}
                            />
                        </div>

                        {enableExpiry && expiryDate && (
                            <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.06)', fontSize: '0.8rem', color: '#f87171' }}>
                                Expires on {new Date(expiryDate).toLocaleDateString()}
                            </div>
                        )}

                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default EditGiftCard;
