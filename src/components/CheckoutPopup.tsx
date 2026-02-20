import React, { useState, useEffect, useRef, useCallback } from 'react';
import ReactDOM from 'react-dom';
import {
    FaTimes, FaEnvelope, FaUsers, FaTag, FaLock,
    FaArrowLeft, FaArrowRight, FaCheck, FaChevronDown,
    FaCreditCard, FaPaypal, FaBitcoin, FaWallet, FaUserPlus
} from 'react-icons/fa';
import { SiCashapp } from 'react-icons/si';
import { useStore, type CartItem } from '../context/StoreContext';
import { useToast } from '../context/ToastContext';
import './CheckoutPopup.css';

declare global {
    interface Window { Square: any; }
}

interface CheckoutPopupProps {
    isOpen: boolean;
    onClose: () => void;
    onOpenSignIn?: () => void;
    /** When provided, checkout uses these items instead of the persisted cart (e.g. Buy Now) */
    directItems?: CartItem[];
}

const SQUARE_APP_ID = 'sq0idp-XcM36OkRBy82-Qswp0CJmg';
const SQUARE_LOCATION_ID = 'LN30A2M5GG0CD';

type PaymentMethod = 'cashapp' | 'card' | 'crypto' | 'paypal' | 'balance' | 'flick';

interface PaymentOption {
    id: PaymentMethod;
    Icon: React.ElementType;
    iconColor: string;
    label: string;
    sub: string;
}

const PAYMENT_METHODS: PaymentOption[] = [
    { id: 'cashapp', Icon: SiCashapp, iconColor: '#00D632', label: 'Cash App', sub: 'Instant · No fees' },
    { id: 'card', Icon: FaCreditCard, iconColor: '#818cf8', label: 'Credit / Debit Card', sub: 'Visa · Mastercard · Amex' },
    { id: 'crypto', Icon: FaBitcoin, iconColor: '#f7931a', label: 'Crypto', sub: 'BTC · ETH · USDT' },
    { id: 'paypal', Icon: FaPaypal, iconColor: '#003087', label: 'PayPal', sub: 'Friends & Family' },
    { id: 'balance', Icon: FaWallet, iconColor: '#4ade80', label: 'Account Balance', sub: 'Use your wallet' },
    { id: 'flick', Icon: FaUserPlus, iconColor: '#007f31', label: 'Flik (NZ Open Banking)', sub: 'Direct bank transfer · NZ only' },
];

const CheckoutPopup: React.FC<CheckoutPopupProps> = ({ isOpen, onClose, onOpenSignIn, directItems }) => {
    const { cart, applyCoupon, clearCart, addOrder, settings, currentUser, updateBalance, paymentSettings } = useStore();
    const { addToast } = useToast();

    // In "Buy Now" mode we use directItems; in cart mode we use the persisted cart.
    const items = directItems ?? cart;

    const [step, setStep] = useState(1);
    const [email, setEmail] = useState('');
    const [referralCode, setReferralCode] = useState('');
    const [couponCode, setCouponCode] = useState('');
    const [couponMsg, setCouponMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
    const [discount, setDiscount] = useState(0);
    const [couponApplied, setCouponApplied] = useState(false);

    const [selectedPayment, setSelectedPayment] = useState<PaymentMethod>('cashapp');
    const [paymentDropdownOpen, setPaymentDropdownOpen] = useState(false);
    const [paymentLoading, setPaymentLoading] = useState(false);

    const [orderNote, setOrderNote] = useState<string>('');
    const cashAppConfig = paymentSettings.gateways.find(g => g.id === 'cashapp');
    const cashTag = cashAppConfig?.cashTag || 'YOUR_CASHTAG';

    const cardRef = useRef<HTMLDivElement>(null);
    const cardInstanceRef = useRef<any>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const [orderId, setOrderId] = useState('');
    const [paidTotal, setPaidTotal] = useState(0);
    const [cashAppVerified, setCashAppVerified] = useState(false); // auto-verification flag

    // Cart price calculation — items already have discounted prices baked in
    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    // The savings from per-item coupons — for display only
    const itemSavings = items.reduce((sum, item) => {
        if (item.originalPrice) {
            return sum + (item.originalPrice - item.price) * item.quantity;
        }
        return sum;
    }, 0);

    const cartHasCoupon = items.some(item => item.appliedCoupon);
    const allItemsHaveCoupon = items.length > 0 && items.every(item => item.appliedCoupon);
    // Only calculate checkout-coupon on items WITHOUT a pre-applied coupon
    const nonCouponSubtotal = items
        .filter(item => !item.appliedCoupon)
        .reduce((sum, item) => sum + item.price * item.quantity, 0);
    const total = Math.max(0, subtotal - discount);

    useEffect(() => {
        if (!isOpen) {
            const t = setTimeout(() => {
                setStep(1); setEmail(''); setReferralCode('');
                setCouponCode(''); setCouponMsg(null); setDiscount(0);
                setCouponApplied(false); setPaymentLoading(false);
                setOrderId(''); setOrderNote(''); setCashAppVerified(false);
                setPaymentDropdownOpen(false);
                if (cardInstanceRef.current) { try { cardInstanceRef.current.destroy?.(); } catch { } cardInstanceRef.current = null; }
            }, 400);
            return () => clearTimeout(t);
        }
    }, [isOpen]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setPaymentDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    // Lock body scroll when open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [isOpen]);

    const handleApplyCoupon = () => {
        if (!couponCode.trim() || couponApplied) return;
        // Only compute against items that don't already have a coupon
        const result = applyCoupon(couponCode, nonCouponSubtotal);
        if (result.valid) {
            setDiscount(result.discount);
            setCouponMsg({ text: result.message, type: 'success' });
            setCouponApplied(true);
        } else {
            setCouponMsg({ text: result.message, type: 'error' });
        }
    };

    const handleProceed = () => {
        if (!email.trim()) return;
        if (settings.allowVpnCheckout === false) {
            const isVpnDetected = Math.random() > 0.5;
            if (isVpnDetected) {
                addToast('High Risk IP: VPN or Proxy detected. Please disable it to proceed.', 'error');
                return;
            }
        }
        if (selectedPayment === 'cashapp') {
            setOrderNote(`CAM-${Math.random().toString(36).substring(2, 6).toUpperCase()}`);
        }
        setStep(2);
    };



    const initCard = useCallback(async () => {
        if (!window.Square || !cardRef.current) return;
        setPaymentLoading(true);
        try {
            const payments = window.Square.payments(SQUARE_APP_ID, SQUARE_LOCATION_ID);
            const card = await payments.card();
            cardInstanceRef.current = card;
            if (cardRef.current) { cardRef.current.innerHTML = ''; await card.attach(cardRef.current); }
            setPaymentLoading(false);
        } catch { setPaymentLoading(false); }
    }, []);

    const handleCardPay = async () => {
        if (!cardInstanceRef.current) return;
        setPaymentLoading(true);
        try {
            const result = await cardInstanceRef.current.tokenize();
            if (result.status === 'OK') handlePaymentSuccess(result.token, 'Credit/Debit Card');
            else setPaymentLoading(false);
        } catch { setPaymentLoading(false); }
    };

    const handlePaymentSuccess = (_token: string, method: string, customStatus: 'completed' | 'pending' | 'cancelled' = 'completed', customNote?: string) => {
        const oid = `ORD-${Date.now().toString(36).toUpperCase()}`;
        setOrderId(oid); setPaidTotal(total);
        addOrder({
            items: items.map(i => ({ name: i.name, price: i.price, quantity: i.quantity, image: i.image })),
            total,
            status: customStatus,
            paymentMethod: method,
            orderNote: customNote
        });
        // Only clear the persisted cart in normal cart-checkout mode
        if (!directItems) clearCart();
        setStep(3);
    };

    useEffect(() => {
        if (step === 2) {
            const t = setTimeout(() => {
                if (selectedPayment === 'card') initCard();
            }, 100);
            return () => clearTimeout(t);
        }
    }, [step, selectedPayment, initCard]);

    // Watch for auto-verification of a pending Cash App order
    useEffect(() => {
        if (!orderId || selectedPayment !== 'cashapp') return;
        const order = currentUser?.orders.find(o => o.id === orderId);
        if (order?.status === 'completed') {
            setCashAppVerified(true);
        }
    }, [currentUser, orderId, selectedPayment]);

    if (!isOpen && step === 1) return null;

    const canProceed = email.trim().length > 0;
    const isEmpty = items.length === 0;
    const selectedMethod = PAYMENT_METHODS.find(m => m.id === selectedPayment)!;

    const content = (
        <div className={`co-overlay ${isOpen ? 'open' : ''}`} onClick={onClose}>
            <div className="co-container" onClick={e => e.stopPropagation()}>
                {/* Close */}
                <button className="co-close" onClick={onClose}><FaTimes size={13} /></button>

                {/* ═══ STEP 1 ═══ */}
                {step === 1 && (
                    <div className="co-body co-fade-in">
                        {/* ── LEFT COLUMN ── */}
                        <div className="co-left">
                            <div className="co-col-header">
                                <span className="co-step-badge">Step 1</span>
                                <h2 className="co-title">Checkout</h2>
                                <p className="co-subtitle">Fill in your details to continue</p>
                            </div>

                            <div className="co-field">
                                <label className="co-label"><FaEnvelope size={11} /> Delivery Email <span className="required">*</span></label>
                                <input className="co-input" type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} autoFocus />
                            </div>

                            <div className="co-field">
                                <label className="co-label"><FaUsers size={11} /> Referral Code <span className="optional">(optional)</span></label>
                                <input className="co-input" type="text" placeholder="Enter referral code" value={referralCode} onChange={e => setReferralCode(e.target.value)} />
                            </div>

                            <div className="co-divider"><span>Payment Method</span></div>

                            {/* Payment Dropdown */}
                            <div className="co-field" ref={dropdownRef} style={{ position: 'relative', zIndex: 10 }}>
                                <label className="co-label"><FaLock size={11} /> Select Payment</label>
                                <div
                                    className={`co-dropdown-trigger ${paymentDropdownOpen ? 'open' : ''}`}
                                    onClick={() => setPaymentDropdownOpen(v => !v)}
                                >
                                    <span className="co-dropdown-icon" style={{ color: selectedMethod.iconColor }}>
                                        <selectedMethod.Icon size={18} />
                                    </span>
                                    <div className="co-dropdown-text">
                                        <span className="co-dropdown-label">{selectedMethod.label}</span>
                                        <span className="co-dropdown-sub">
                                            {selectedPayment === 'balance' && currentUser
                                                ? `Balance: $${currentUser.balance.toFixed(2)}`
                                                : selectedMethod.sub}
                                        </span>
                                    </div>
                                    <FaChevronDown className={`co-dropdown-chevron ${paymentDropdownOpen ? 'rotated' : ''}`} size={12} />
                                </div>

                                {/* Dropdown Panel — rendered inline but with absolute positioning */}
                                <div className={`co-dropdown-menu ${paymentDropdownOpen ? 'open' : ''}`}>
                                    {PAYMENT_METHODS.map((m, i) => (
                                        <div
                                            key={m.id}
                                            className={`co-dropdown-item ${selectedPayment === m.id ? 'selected' : ''}`}
                                            style={{ animationDelay: `${i * 0.04}s` }}
                                            onClick={() => { setSelectedPayment(m.id); setPaymentDropdownOpen(false); }}
                                        >
                                            <span className="co-dropdown-icon" style={{ color: m.iconColor }}>
                                                <m.Icon size={18} />
                                            </span>
                                            <div className="co-dropdown-text">
                                                <span className="co-dropdown-label">{m.label}</span>
                                                <span className="co-dropdown-sub">
                                                    {m.id === 'balance' && currentUser
                                                        ? `Available: $${currentUser.balance.toFixed(2)}`
                                                        : m.sub}
                                                </span>
                                            </div>
                                            {selectedPayment === m.id && <FaCheck size={11} className="co-dropdown-check" />}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="co-secure-badge">
                                <FaLock size={9} /> Secured · 256-bit encryption
                            </div>
                        </div>

                        {/* ── RIGHT COLUMN ── */}
                        <div className="co-right">
                            <div className="co-col-header">
                                <span className="co-step-badge">Order</span>
                                <h2 className="co-title">Summary</h2>
                            </div>

                            <div className="co-items">
                                {isEmpty ? (
                                    <div className="co-empty">🛒 Your cart is empty</div>
                                ) : items.map(item => (
                                    <div key={item.id} className="co-item">
                                        <img src={item.image} alt={item.name} className="co-item-img" />
                                        <div className="co-item-info">
                                            <div className="co-item-name">{item.name}</div>
                                            <div className="co-item-qty">Qty {item.quantity}</div>
                                            {item.appliedCoupon && (
                                                <div className="co-item-coupon-tag">🏷️ {item.appliedCoupon}</div>
                                            )}
                                        </div>
                                        <div className="co-item-price-col">
                                            {item.originalPrice && (
                                                <div className="co-item-original-price">${(item.originalPrice * item.quantity).toFixed(2)}</div>
                                            )}
                                            <div className={`co-item-price ${item.appliedCoupon ? 'discounted' : ''}`}>${(item.price * item.quantity).toFixed(2)}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="co-totals">
                                <div className="co-total-row"><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
                                {itemSavings > 0 && (
                                    <div className="co-total-row discount">
                                        <span>Item Coupon Savings</span>
                                        <span>-${itemSavings.toFixed(2)}</span>
                                    </div>
                                )}
                                {discount > 0 && (
                                    <div className="co-total-row discount">
                                        <span>Coupon Discount</span>
                                        <span>-${discount.toFixed(2)}</span>
                                    </div>
                                )}
                                <div className="co-total-divider" />
                                <div className="co-total-row grand"><span>Total</span><span>${total.toFixed(2)}</span></div>
                            </div>

                            <div className="co-coupon-section">
                                {allItemsHaveCoupon ? (
                                    <div className="co-coupon-locked">
                                        <FaTag size={11} />
                                        <span>All items already have coupon discounts applied</span>
                                    </div>
                                ) : couponApplied ? (
                                    <div className="co-coupon-applied"><FaCheck size={11} /><span>{couponMsg?.text}</span></div>
                                ) : (
                                    <>
                                        {cartHasCoupon && !allItemsHaveCoupon && (
                                            <div className="co-coupon-partial-note">
                                                <FaTag size={10} /> Coupon applies to uncouponed items only
                                            </div>
                                        )}
                                        <div className="co-coupon-row">
                                            <div className="co-coupon-input-wrap">
                                                <FaTag className="co-coupon-icon" size={11} />
                                                <input className="co-coupon-input" type="text" placeholder="Coupon code" value={couponCode} onChange={e => setCouponCode(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleApplyCoupon()} />
                                            </div>
                                            <button className="co-coupon-btn" onClick={handleApplyCoupon}>Apply</button>
                                        </div>
                                        {couponMsg && !couponApplied && (
                                            <div className={`co-coupon-msg ${couponMsg.type}`}>{couponMsg.text}</div>
                                        )}
                                    </>
                                )}
                            </div>

                            <button className="co-proceed-btn" disabled={!canProceed || items.length === 0} onClick={handleProceed}>
                                Proceed to Payment <FaArrowRight size={13} className="btn-arrow" />
                            </button>
                        </div>
                    </div>
                )}

                {/* ═══ STEP 2: Payment ═══ */}
                {step === 2 && (
                    <div className="co-payment-step co-fade-in">
                        <div className="co-payment-header">
                            <button className="co-back-btn" onClick={() => { setStep(1); setPaymentLoading(false); }}>
                                <FaArrowLeft size={12} /> Back
                            </button>
                            <div>
                                <h2 className="co-title">Payment</h2>
                                <p className="co-subtitle" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                    <selectedMethod.Icon size={14} style={{ color: selectedMethod.iconColor }} />
                                    {selectedMethod.label} · ${total.toFixed(2)}
                                </p>
                            </div>
                        </div>

                        {selectedPayment === 'cashapp' && (
                            <div className="co-payment-body">
                                <p className="co-payment-hint">Send exact amount via Cash App. You must include your unique Order Note so we can verify the payment automatically.</p>

                                <div className="co-qr-box">
                                    <img src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=https://cash.app/$${cashTag.replace('$', '')}/${total.toFixed(2)}`} alt="Cash App QR" />
                                    <div className="co-qr-info">
                                        Amount: <span className="co-qr-highlight">${total.toFixed(2)}</span>
                                    </div>
                                    <div className="co-qr-info" style={{ marginTop: 2 }}>
                                        Cashtag: <span className="co-qr-highlight">${cashTag.replace('$', '')}</span>
                                    </div>
                                </div>

                                <div className="co-order-note-box">
                                    <span style={{ fontSize: '0.8rem', color: '#a1a1aa' }}>REQUIRED ORDER NOTE:</span>
                                    <div className="co-order-note-value">{orderNote}</div>
                                </div>

                                <button
                                    className="co-proceed-btn"
                                    style={{ background: 'linear-gradient(135deg, #00D632, #00b829)', marginTop: 20 }}
                                    onClick={() => handlePaymentSuccess('manual_cashapp', 'Cash App', 'pending', orderNote)}
                                >
                                    <SiCashapp size={16} /> I have paid ${total.toFixed(2)}
                                </button>
                            </div>
                        )}

                        {selectedPayment === 'card' && (
                            <div className="co-payment-body">
                                <p className="co-payment-hint">Enter your card details</p>
                                <div className="co-card-container">
                                    {paymentLoading && <div className="co-loading"><div className="co-spinner" /><span>Loading card form…</span></div>}
                                    <div ref={cardRef} style={{ display: paymentLoading ? 'none' : 'block' }} />
                                </div>
                                {!paymentLoading && (
                                    <button className="co-proceed-btn" onClick={handleCardPay} disabled={paymentLoading}>
                                        <FaLock size={12} /> Pay ${total.toFixed(2)}
                                    </button>
                                )}
                            </div>
                        )}

                        {/* Account Balance / PayPal / Crypto - sim UI */}
                        {(selectedPayment === 'crypto' || selectedPayment === 'paypal' || selectedPayment === 'balance') && (
                            <div className="co-payment-body">
                                {selectedPayment === 'balance' ? (
                                    // Account Balance flow
                                    !currentUser ? (
                                        // Not signed in
                                        <div className="co-balance-signin">
                                            <FaWallet size={40} color="#4ade80" style={{ opacity: 0.7 }} />
                                            <p className="co-balance-msg">You need an account to use your balance.</p>
                                            <button
                                                className="co-proceed-btn"
                                                style={{ background: 'linear-gradient(135deg,#818cf8,#6d28d9)', maxWidth: 280 }}
                                                onClick={() => { onClose(); onOpenSignIn?.(); }}
                                            >
                                                <FaUserPlus size={13} /> Create / Sign In
                                            </button>
                                        </div>
                                    ) : (
                                        // Signed in — show real balance
                                        <>
                                            <div className="co-sim-payment">
                                                <FaWallet size={52} style={{ color: '#4ade80' }} />
                                                <div className="co-sim-amount">${total.toFixed(2)}</div>
                                                <div className="co-sim-label">Deduct from Account Balance</div>
                                                <div className="co-balance-available">
                                                    Available: <strong>${currentUser.balance.toFixed(2)}</strong>
                                                    {currentUser.balance < total && (
                                                        <span className="co-balance-warn"> · Insufficient funds</span>
                                                    )}
                                                </div>
                                            </div>
                                            <button
                                                className="co-proceed-btn"
                                                disabled={currentUser.balance < total}
                                                onClick={() => {
                                                    updateBalance(-total);
                                                    handlePaymentSuccess('balance_' + Date.now(), 'Account Balance');
                                                }}
                                            >
                                                <FaCheck size={12} /> Confirm Payment
                                            </button>
                                        </>
                                    )
                                ) : (
                                    // Crypto / PayPal
                                    <>
                                        <p className="co-payment-hint">
                                            {selectedPayment === 'crypto' && 'Send the exact amount to the wallet address below'}
                                            {selectedPayment === 'paypal' && 'Send payment via PayPal Friends & Family'}
                                        </p>
                                        <div className="co-sim-payment">
                                            <selectedMethod.Icon size={52} style={{ color: selectedMethod.iconColor }} />
                                            <div className="co-sim-amount">${total.toFixed(2)}</div>
                                            <div className="co-sim-label">{selectedMethod.label}</div>
                                        </div>
                                        <button className="co-proceed-btn" onClick={() => handlePaymentSuccess('sim_' + Date.now(), selectedMethod.label)}>
                                            <FaCheck size={12} /> Confirm Payment
                                        </button>
                                    </>
                                )}
                            </div>
                        )}

                        {selectedPayment === 'flick' && (() => {
                            const flickConfig = paymentSettings.gateways.find(g => g.id === 'flick');
                            const flickClientId = flickConfig?.apiKey || '';
                            const flickRef = orderNote || `ORDER-${Date.now()}`;
                            // Flik payment request URL (test environment by default)
                            const flickBaseUrl = flickConfig?.testMode
                                ? 'https://test.flik.co.nz/pay'
                                : 'https://flik.co.nz/pay';
                            return (
                                <div className="co-payment-body">
                                    <div style={{
                                        display: 'flex', alignItems: 'center', gap: 12,
                                        marginBottom: 16,
                                        padding: '10px 14px',
                                        background: 'rgba(0,127,49,0.06)',
                                        border: '1px solid rgba(0,127,49,0.2)',
                                        borderRadius: 12,
                                    }}>
                                        <div style={{
                                            width: 40, height: 40, borderRadius: 10,
                                            background: 'linear-gradient(135deg, #007f31, #00b347)',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            fontSize: '1.2rem', fontWeight: 900, color: '#fff',
                                        }}>F</div>
                                        <div>
                                            <div style={{ fontWeight: 700, color: '#fff', fontSize: '0.92rem' }}>Flik — NZ Open Banking</div>
                                            <div style={{ fontSize: '0.75rem', color: '#71717a' }}>Direct bank transfer · ANZ · ASB · BNZ · Westpac</div>
                                        </div>
                                    </div>
                                    <p className="co-payment-hint">
                                        Click below to open the Flik secure payment page. You'll be redirected to your bank to authorise the payment of <strong>${total.toFixed(2)}</strong>.
                                    </p>
                                    <div className="co-order-note-box" style={{ marginBottom: 20 }}>
                                        <span style={{ fontSize: '0.8rem', color: '#a1a1aa' }}>PAYMENT REFERENCE:</span>
                                        <div className="co-order-note-value">{flickRef}</div>
                                    </div>
                                    <button
                                        className="co-proceed-btn"
                                        style={{ background: 'linear-gradient(135deg, #007f31, #00b347)', marginBottom: 12 }}
                                        onClick={() => {
                                            // Open Flik payment page with merchant details
                                            const params = new URLSearchParams({
                                                amount: (total * 100).toFixed(0), // Flik uses cents
                                                reference: flickRef,
                                                ...(flickClientId ? { client_id: flickClientId } : {}),
                                            });
                                            window.open(`${flickBaseUrl}?${params.toString()}`, '_blank', 'width=480,height=700');
                                        }}
                                    >
                                        <FaUserPlus size={14} /> Open Flik Payment Page
                                    </button>
                                    <button
                                        className="co-proceed-btn"
                                        style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#a1a1aa', marginTop: 0 }}
                                        onClick={() => handlePaymentSuccess('flik_' + Date.now(), 'Flik (NZ Open Banking)', 'pending', flickRef)}
                                    >
                                        <FaCheck size={12} /> I've Completed Payment
                                    </button>
                                    <p style={{ fontSize: '0.72rem', color: '#52525b', marginTop: 10, textAlign: 'center' }}>
                                        {flickConfig?.testMode ? '⚠ Test mode — no real charge' : 'Payments processed by Flik.co.nz · NZ only'}
                                    </p>
                                </div>
                            );
                        })()}

                        <div className="co-secure-badge" style={{ marginTop: 16 }}>
                            <FaLock size={9} /> Secured · 256-bit encryption
                        </div>

                    </div>
                )}

                {/* ═══ STEP 3: Success ═══ */}
                {step === 3 && (
                    <div className="co-success co-fade-in">
                        {selectedPayment === 'cashapp' && !cashAppVerified ? (
                            // Auto-verification in progress
                            <>
                                <div className="co-verifying-ring">
                                    <div className="co-verifying-spinner" />
                                </div>
                                <h2 className="co-success-title" style={{ color: '#00D632', marginTop: 20 }}>Verifying Payment…</h2>
                                <p className="co-success-msg">
                                    We're scanning your Cash App receipt. Please wait — this usually takes under <strong>20 seconds</strong>.
                                </p>
                                <div className="co-order-note-box" style={{ marginTop: 16, marginBottom: 0 }}>
                                    <span style={{ fontSize: '0.8rem', color: '#a1a1aa' }}>LOOKING FOR NOTE:</span>
                                    <div className="co-order-note-value">{orderNote}</div>
                                </div>
                                <p style={{ fontSize: '0.78rem', color: '#71717a', marginTop: 12, textAlign: 'center' }}>
                                    You can close this window — your order will be fulfilled automatically.
                                </p>
                                <button className="co-done-btn" style={{ marginTop: 8, background: 'rgba(255,255,255,0.05)', color: '#a1a1aa', border: '1px solid rgba(255,255,255,0.1)' }} onClick={onClose}>
                                    Close
                                </button>
                            </>
                        ) : (
                            // Verified or non-CashApp payment
                            <>
                                <div className="co-success-ring">
                                    <div className="co-success-icon">✓</div>
                                </div>
                                <h2 className="co-success-title">
                                    {selectedPayment === 'cashapp' ? 'Payment Verified! 🎉' : 'Order Confirmed!'}
                                </h2>
                                <p className="co-success-msg">
                                    Your confirmation and product details will be sent to <strong>{email}</strong>.
                                </p>
                                <div className="co-success-details">
                                    {[
                                        { label: 'Order ID', value: orderId },
                                        { label: 'Amount Paid', value: `$${paidTotal.toFixed(2)}` },
                                        { label: 'Payment Method', value: selectedMethod.label },
                                        { label: 'Delivery Email', value: email },
                                    ].map(row => (
                                        <div key={row.label} className="co-success-row">
                                            <span className="co-success-row-label">{row.label}</span>
                                            <span className="co-success-row-value">{row.value}</span>
                                        </div>
                                    ))}
                                </div>
                                <button className="co-done-btn" onClick={onClose}>
                                    <FaCheck size={12} /> Done
                                </button>
                            </>
                        )}
                    </div>
                )}
            </div>
        </div>
    );

    // Use portal so the modal always renders at document.body level,
    // preventing clipping by parent elements (nav, etc.)
    return ReactDOM.createPortal(content, document.body);
};

export default CheckoutPopup;
