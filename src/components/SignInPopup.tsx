import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useStore } from '../context/StoreContext';
import './SignInPopup.css';

interface SignInPopupProps {
    isOpen: boolean;
    onClose: () => void;
    onSwitchToSignUp?: () => void;
}

const SignInPopup: React.FC<SignInPopupProps> = ({ isOpen, onClose, onSwitchToSignUp }) => {
    const { login } = useStore();
    const [isVisible, setIsVisible] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setIsVisible(true);
            document.body.style.overflow = 'hidden';
            setEmail('');
            setPassword('');
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
        if (!password) { setError('Password is required.'); return; }

        setLoading(true);
        setTimeout(() => {
            const result = login(email.trim(), password);
            setLoading(false);
            if (result.success) {
                onClose();
            } else {
                setError(result.message);
            }
        }, 500);
    };

    if (!isVisible && !isOpen) return null;

    return createPortal(
        <div className={`signin-overlay ${isOpen ? 'open' : ''}`} onClick={onClose}>
            <div className="signin-container" onClick={(e) => e.stopPropagation()}>
                <button className="close-btn" onClick={onClose}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>

                <div className="signin-header">
                    <div className="signin-icon">
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                            <polyline points="10,17 15,12 10,7" />
                            <line x1="15" y1="12" x2="3" y2="12" />
                        </svg>
                    </div>
                    <h2 className="signin-title">Welcome Back</h2>
                    <p className="signin-subtitle">Sign in to your account</p>
                </div>

                <form className="signin-form" onSubmit={handleSubmit}>
                    {error && (
                        <div className="signin-error">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" />
                            </svg>
                            {error}
                        </div>
                    )}

                    <div className="signin-input-group">
                        <label>Email Address</label>
                        <div className="signin-input-wrapper">
                            <svg className="signin-input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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

                    <div className="signin-input-group">
                        <label>Password</label>
                        <div className="signin-input-wrapper">
                            <svg className="signin-input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                            </svg>
                            <input
                                type={showPassword ? 'text' : 'password'}
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                autoComplete="current-password"
                            />
                            <button type="button" className="signin-toggle-pw" onClick={() => setShowPassword(!showPassword)}>
                                {showPassword ? (
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" /><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" /><line x1="1" y1="1" x2="23" y2="23" /></svg>
                                ) : (
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                                )}
                            </button>
                        </div>
                    </div>

                    <div className="checkbox-group">
                        <label className="custom-checkbox">
                            <input type="checkbox" />
                            <span className="checkmark"></span>
                            Remember me
                        </label>
                        <p className="checkbox-subtext">Not recommended on shared computers</p>
                    </div>

                    <button type="submit" className="signin-btn" disabled={loading}>
                        {loading ? (
                            <span className="signin-spinner" />
                        ) : (
                            <>Sign In</>
                        )}
                    </button>

                    <a href="#" className="forgot-password" onClick={(e) => e.preventDefault()}>Forgot your password?</a>

                    {onSwitchToSignUp && (
                        <div className="signin-switch">
                            Don't have an account?{' '}
                            <button type="button" onClick={() => { onClose(); onSwitchToSignUp(); }}>
                                Sign Up
                            </button>
                        </div>
                    )}
                </form>
            </div>
        </div>,
        document.body
    );
};

export default SignInPopup;
