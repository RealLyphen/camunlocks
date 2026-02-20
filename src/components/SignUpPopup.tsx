import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useStore } from '../context/StoreContext';
import './SignUpPopup.css';

interface SignUpPopupProps {
    isOpen: boolean;
    onClose: () => void;
    onSwitchToSignIn: () => void;
}

const SignUpPopup: React.FC<SignUpPopupProps> = ({ isOpen, onClose, onSwitchToSignIn }) => {
    const { signup } = useStore();
    const [isVisible, setIsVisible] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setIsVisible(true);
            document.body.style.overflow = 'hidden';
            setEmail('');
            setPassword('');
            setConfirmPassword('');
            setError('');
        } else {
            const timer = setTimeout(() => setIsVisible(false), 300);
            document.body.style.overflow = 'unset';
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!email.trim()) { setError('Email is required.'); return; }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError('Please enter a valid email.'); return; }
        if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }
        if (password !== confirmPassword) { setError('Passwords do not match.'); return; }

        setLoading(true);
        setTimeout(() => {
            const result = signup(email.trim(), password);
            setLoading(false);
            if (result.success) {
                onClose();
            } else {
                setError(result.message);
            }
        }, 600);
    };

    if (!isVisible && !isOpen) return null;

    return createPortal(
        <div className={`signup-overlay ${isOpen ? 'open' : ''}`} onClick={onClose}>
            <div className="signup-container" onClick={(e) => e.stopPropagation()}>
                <button className="signup-close-btn" onClick={onClose}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                </button>

                <div className="signup-header">
                    <div className="signup-icon">
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                            <circle cx="12" cy="7" r="4" />
                            <line x1="16" y1="3" x2="22" y2="3" /><line x1="19" y1="0" x2="19" y2="6" />
                        </svg>
                    </div>
                    <h2 className="signup-title">Create Account</h2>
                    <p className="signup-subtitle">Join us and start shopping today</p>
                </div>

                <form className="signup-form" onSubmit={handleSubmit}>
                    {error && (
                        <div className="signup-error">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" />
                            </svg>
                            {error}
                        </div>
                    )}

                    <div className="signup-input-group">
                        <label>Email Address</label>
                        <div className="signup-input-wrapper">
                            <svg className="signup-input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                                <polyline points="22,6 12,13 2,6" />
                            </svg>
                            <input
                                type="email"
                                placeholder="you@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                autoComplete="email"
                            />
                        </div>
                    </div>

                    <div className="signup-input-group">
                        <label>Password</label>
                        <div className="signup-input-wrapper">
                            <svg className="signup-input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                            </svg>
                            <input
                                type={showPassword ? 'text' : 'password'}
                                placeholder="Min. 6 characters"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                autoComplete="new-password"
                            />
                            <button type="button" className="signup-toggle-pw" onClick={() => setShowPassword(!showPassword)}>
                                {showPassword ? (
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" /><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" /><line x1="1" y1="1" x2="23" y2="23" /></svg>
                                ) : (
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                                )}
                            </button>
                        </div>
                    </div>

                    <div className="signup-input-group">
                        <label>Confirm Password</label>
                        <div className="signup-input-wrapper">
                            <svg className="signup-input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                            </svg>
                            <input
                                type={showPassword ? 'text' : 'password'}
                                placeholder="Re-enter password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                autoComplete="new-password"
                            />
                        </div>
                    </div>

                    <button type="submit" className="signup-submit-btn" disabled={loading}>
                        {loading ? (
                            <span className="signup-spinner" />
                        ) : (
                            <>Create Account</>
                        )}
                    </button>

                    <div className="signup-switch">
                        Already have an account?{' '}
                        <button type="button" onClick={() => { onClose(); onSwitchToSignIn(); }}>
                            Sign In
                        </button>
                    </div>
                </form>
            </div>
        </div>,
        document.body
    );
};

export default SignUpPopup;
