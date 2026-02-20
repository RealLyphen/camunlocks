import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../../../context/StoreContext';
import { useToast } from '../../../context/ToastContext';
import {
    Save, ArrowLeft, Wand2, Users,
    Star, Sparkles, UserPlus, Gift, Link2
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

const CreateReferral: React.FC = () => {
    const navigate = useNavigate();
    const { settings, users, addReferral } = useStore();
    const { addToast } = useToast();

    // Form state
    const [code, setCode] = useState('');
    const [userEmail, setUserEmail] = useState('');
    const [referralType, setReferralType] = useState<'first_time' | 'recurring'>('first_time');
    const [rewardMultiplier, setRewardMultiplier] = useState('50');

    // Generating a random code
    const generateCode = () => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let result = '';
        for (let i = 0; i < 8; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        setCode(result);
    };

    const handleSave = () => {
        if (!code.trim() || !userEmail.trim() || !rewardMultiplier) return;

        addReferral({
            code: code.toUpperCase().trim(),
            userEmail,
            referralType,
            rewardMultiplier: parseFloat(rewardMultiplier),
            status: 'active'
        });

        addToast('Referral code created successfully!', 'success');

        navigate('/admin/customers/referrals');
    };

    return (
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}
            >
                <div>
                    <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#fff', margin: 0 }}>Create Referral</h1>
                    <p style={{ color: '#71717a', margin: '4px 0 0', fontSize: '0.95rem' }}>Create a new referral link to reward your customers.</p>
                </div>
                <div style={{ display: 'flex', gap: 12 }}>
                    <Link to="/admin/customers/referrals" style={{
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
                    <button onClick={handleSave} disabled={!code.trim() || !userEmail.trim() || !rewardMultiplier} style={{
                        display: 'flex', alignItems: 'center', gap: 8,
                        padding: '10px 24px', borderRadius: 10,
                        background: (!code.trim() || !userEmail.trim() || !rewardMultiplier) ? 'rgba(99,102,241,0.3)' : 'linear-gradient(135deg, #6366f1, var(--secondary-color))',
                        border: '1px solid rgba(99,102,241,0.4)',
                        color: '#fff', fontWeight: 700, fontSize: '0.9rem',
                        cursor: (!code.trim() || !userEmail.trim() || !rewardMultiplier) ? 'not-allowed' : 'pointer',
                        transition: 'all 0.2s',
                        boxShadow: (!code.trim() || !userEmail.trim() || !rewardMultiplier) ? 'none' : '0 4px 20px rgba(99,102,241,0.3)',
                    }}>
                        <Save size={16} /> Save Changes
                    </button>
                </div>
            </motion.div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 24, alignItems: 'start' }}>
                {/* Left Column */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

                    {/* Referral Code */}
                    <Section
                        icon={<Link2 size={18} color="#818cf8" />}
                        title="Referral Code"
                        subtitle="This is the code customers will sign up with."
                        delay={0.05}
                    >
                        <div className="form-group">
                            <label>Code</label>
                            <div style={{ display: 'flex', gap: 12 }}>
                                <input
                                    type="text"
                                    className="admin-input"
                                    placeholder="Code Here"
                                    value={code}
                                    onChange={e => setCode(e.target.value.toUpperCase())}
                                    style={{
                                        fontFamily: "'JetBrains Mono', monospace",
                                        letterSpacing: '2px', fontWeight: 700,
                                        fontSize: '1.1rem',
                                        flex: 1,
                                    }}
                                />
                                <button
                                    onClick={generateCode}
                                    style={{
                                        padding: '0 20px', borderRadius: 12,
                                        background: 'rgba(99,102,241,0.1)',
                                        border: '1px solid rgba(99,102,241,0.2)',
                                        color: '#818cf8', cursor: 'pointer',
                                        display: 'flex', alignItems: 'center', gap: 8,
                                        fontWeight: 600, transition: 'all 0.2s'
                                    }}
                                    onMouseOver={e => e.currentTarget.style.background = 'rgba(99,102,241,0.2)'}
                                    onMouseOut={e => e.currentTarget.style.background = 'rgba(99,102,241,0.1)'}
                                >
                                    <Wand2 size={16} /> Generate
                                </button>
                            </div>
                            <div style={{ fontSize: '0.78rem', color: '#52525b', marginTop: 8, lineHeight: 1.5 }}>
                                Alternatively, you can add "?referral=" to the end of any link to automatically apply the code, for example: <span style={{ color: '#818cf8' }}>https://{settings?.customDomain || 'store.cx'}/?referral={code || '[code]'}</span>
                            </div>
                        </div>
                    </Section>

                    {/* Reward Details */}
                    <Section
                        icon={<Gift size={18} color="#818cf8" />}
                        title="Reward Configuration"
                        subtitle="Set up the user being rewarded and the reward terms."
                        delay={0.1}
                    >
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                            {/* User Email */}
                            <div className="form-group">
                                <label>User E-Mail <span style={{ color: '#71717a', fontWeight: 'normal', fontSize: '0.8rem', marginLeft: 4 }}>The user who will be rewarded.</span></label>
                                <input
                                    type="email"
                                    list="user-emails"
                                    className="admin-input"
                                    placeholder="Enter or select email..."
                                    value={userEmail}
                                    onChange={e => setUserEmail(e.target.value)}
                                />
                                <datalist id="user-emails">
                                    <option value="admin@camunlocks.cx" />
                                    {users?.map(u => (
                                        <option key={u.id} value={u.email} />
                                    ))}
                                </datalist>
                            </div>

                            {/* Reward Multiplier */}
                            <div className="form-group">
                                <label>Reward Multiplier <span style={{ color: '#71717a', fontWeight: 'normal', fontSize: '0.8rem', marginLeft: 4 }}>Percent of each sale.</span></label>
                                <div style={{ position: 'relative' }}>
                                    <div style={{
                                        position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
                                        color: '#71717a', fontWeight: 600, fontSize: '0.9rem',
                                        pointerEvents: 'none',
                                    }}>
                                        %
                                    </div>
                                    <input
                                        type="number"
                                        className="admin-input"
                                        placeholder="50"
                                        value={rewardMultiplier}
                                        onChange={e => setRewardMultiplier(e.target.value.replace(/[^0-9.]/g, ''))}
                                        min="0"
                                        max="100"
                                        style={{ paddingRight: 36, fontWeight: 600 }}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Referral Type Selector */}
                        <div className="form-group" style={{ marginTop: 20 }}>
                            <label>Referral Type <span style={{ color: '#71717a', fontWeight: 'normal', fontSize: '0.8rem', marginLeft: 4 }}>The type of referral this code will track.</span></label>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                                {[
                                    { id: 'first_time', label: 'Only first time customers', icon: <UserPlus size={20} />, desc: 'Reward for new sign ups only' },
                                    { id: 'recurring', label: 'First time & recurring', icon: <Users size={20} />, desc: 'Reward on every purchase' }
                                ].map(t => (
                                    <div
                                        key={t.id}
                                        onClick={() => setReferralType(t.id as 'first_time' | 'recurring')}
                                        style={{
                                            padding: '16px 20px', borderRadius: 12, cursor: 'pointer',
                                            background: referralType === t.id ? 'rgba(99,102,241,0.12)' : 'rgba(255,255,255,0.03)',
                                            border: `1.5px solid ${referralType === t.id ? 'rgba(99,102,241,0.5)' : 'rgba(255,255,255,0.08)'}`,
                                            transition: 'all 0.25s',
                                        }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                                            <div style={{
                                                width: 36, height: 36, borderRadius: 8,
                                                background: referralType === t.id
                                                    ? 'linear-gradient(135deg, #6366f1, var(--secondary-color))'
                                                    : 'rgba(255,255,255,0.06)',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                transition: 'all 0.25s', color: referralType === t.id ? '#fff' : '#71717a'
                                            }}>
                                                {t.icon}
                                            </div>
                                            <div style={{
                                                fontWeight: 700, fontSize: '0.9rem',
                                                color: referralType === t.id ? '#fff' : '#a1a1aa',
                                            }}>
                                                {t.label}
                                            </div>
                                        </div>
                                        <div style={{ fontSize: '0.8rem', color: '#52525b' }}>
                                            {t.desc}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                    </Section>
                </div>

                {/* Right Column — Summary */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 24, position: 'sticky', top: 24 }}>
                    {/* Interactive Preview Card */}
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={code}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.3 }}
                            style={{
                                background: 'linear-gradient(135deg, rgba(99,102,241,0.08), rgba(139,92,246,0.06))',
                                border: '1px solid rgba(99,102,241,0.2)',
                                borderRadius: 16, overflow: 'hidden',
                                padding: '28px',
                                position: 'relative'
                            }}
                        >
                            {/* Decorative elements */}
                            <div style={{ position: 'absolute', top: -40, right: -40, width: 120, height: 120, background: 'rgba(99,102,241,0.2)', filter: 'blur(40px)', borderRadius: '50%' }} />
                            <div style={{ position: 'absolute', bottom: -20, left: -20, width: 80, height: 80, background: 'rgba(139,92,246,0.2)', filter: 'blur(30px)', borderRadius: '50%' }} />

                            <div style={{
                                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                                marginBottom: 20, padding: '32px 0 24px',
                                background: 'rgba(0,0,0,0.2)', borderRadius: 12,
                                border: '1px solid rgba(255,255,255,0.05)',
                                position: 'relative', overflow: 'hidden'
                            }}>
                                <div style={{
                                    position: 'absolute', top: 0, left: 0, right: 0, height: 4,
                                    background: 'linear-gradient(90deg, #6366f1, var(--secondary-color))'
                                }} />

                                <div style={{
                                    width: 56, height: 56, borderRadius: '50%',
                                    background: 'rgba(99,102,241,0.15)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    marginBottom: 16, color: '#818cf8',
                                    border: '1px solid rgba(99,102,241,0.3)'
                                }}>
                                    <Star size={28} />
                                </div>
                                <span style={{
                                    fontFamily: "'JetBrains Mono', monospace",
                                    fontSize: '1.6rem', fontWeight: 800,
                                    color: code.trim() ? '#fff' : '#52525b',
                                    letterSpacing: '2px', textShadow: code.trim() ? '0 0 20px rgba(99,102,241,0.5)' : 'none'
                                }}>
                                    {code.trim() || 'REFERRAL_CODE'}
                                </span>
                            </div>

                            <div style={{
                                textAlign: 'center', fontSize: '2.5rem', fontWeight: 800,
                                color: '#4ade80', marginBottom: 20, lineHeight: 1
                            }}>
                                {rewardMultiplier || '0'}%
                                <span style={{ fontSize: '0.9rem', color: '#a1a1aa', fontWeight: 500, display: 'block', marginTop: 8, letterSpacing: '0.5px', textTransform: 'uppercase' }}>
                                    Reward Cut
                                </span>
                            </div>

                            <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 16 }}>
                                {[
                                    { label: 'Beneficiary', val: userEmail || 'Not selected' },
                                    { label: 'Link Type', val: referralType === 'first_time' ? 'New Customers' : 'Lifetime (All Orders)' },
                                    { label: 'Status', val: (code && userEmail) ? <span style={{ color: '#4ade80' }}>Ready</span> : <span style={{ color: '#f87171' }}>Incomplete</span> },
                                ].map((row, i) => (
                                    <div key={i} style={{
                                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                        padding: '10px 0', fontSize: '0.85rem',
                                    }}>
                                        <span style={{ color: '#71717a' }}>{row.label}</span>
                                        <span style={{ color: '#e4e4e7', fontWeight: 600, textTransform: 'none', maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{row.val}</span>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    </AnimatePresence>

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
                                Pro Tip
                            </span>
                        </div>
                        <p style={{ color: '#71717a', fontSize: '0.82rem', lineHeight: 1.6, margin: 0 }}>
                            Use <strong>First time & recurring</strong> for influencers to keep them motivated, and <strong>Only first time</strong> for basic customer referral programs.
                        </p>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default CreateReferral;
