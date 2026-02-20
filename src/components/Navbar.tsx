import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { IoCartOutline } from 'react-icons/io5';
import { useStore } from '../context/StoreContext';
import './Navbar.css';
import SignInPopup from './SignInPopup';
import SignUpPopup from './SignUpPopup';
import CartPopup from './CartPopup';
import CheckoutPopup from './CheckoutPopup';
import ProfileDropdown from './ProfileDropdown';

const menuItems = [
    {
        id: 'home', label: 'Home', path: '/', icon: (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                <polyline points="9 22 9 12 15 12 15 22"></polyline>
            </svg>
        )
    },
    {
        id: 'terms', label: 'Terms', path: '/#terms', icon: (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
                <polyline points="10 9 9 9 8 9"></polyline>
            </svg>
        )
    },
    {
        id: 'status', label: 'Status', path: '/status', icon: (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
            </svg>
        )
    },
    {
        id: 'license-keys', label: 'License Keys', path: '/#license-keys', icon: (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"></path>
            </svg>
        )
    },
    {
        id: 'support', label: 'Support', path: '/#support', icon: (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <circle cx="12" cy="12" r="4"></circle>
                <line x1="4.93" y1="4.93" x2="9.17" y2="9.17"></line>
                <line x1="14.83" y1="14.83" x2="19.07" y2="19.07"></line>
                <line x1="14.83" y1="9.17" x2="19.07" y2="4.93"></line>
                <line x1="14.83" y1="9.17" x2="18.36" y2="5.64"></line>
                <line x1="4.93" y1="19.07" x2="9.17" y2="14.83"></line>
            </svg>
        )
    }
];

const Navbar: React.FC = () => {
    const { settings, cart, currentUser } = useStore();
    const location = useLocation();
    const [activeItem, setActiveItem] = useState('home');
    const [indicatorStyle, setIndicatorStyle] = useState({ width: 0, left: 0 });
    const [isSignInOpen, setIsSignInOpen] = useState(false);
    const [isSignUpOpen, setIsSignUpOpen] = useState(false);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const menuRefs = useRef<{ [key: string]: HTMLAnchorElement | null }>({});

    const cartItemCount = cart ? cart.reduce((total, item) => total + item.quantity, 0) : 0;

    useEffect(() => {
        if (location.pathname === '/status') {
            setActiveItem('status');
        } else {
            setActiveItem('home');
        }
    }, [location]);

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 20) {
                setIsScrolled(true);
            } else {
                setIsScrolled(false);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        const activeElement = menuRefs.current[activeItem];
        if (activeElement && activeElement.parentElement) {
            setIndicatorStyle({
                width: activeElement.offsetWidth,
                left: activeElement.parentElement.offsetLeft
            });
        }
    }, [activeItem]);

    const userInitial = currentUser ? currentUser.email.charAt(0).toUpperCase() : '';

    return (
        <nav className={`navbar ${isScrolled ? 'scrolled' : ''}`}>
            <div className="navbar-container">
                <Link to="/" className="navbar-logo">
                    <img src={settings.logoUrl || "/logo.png"} alt="Logo" />
                </Link>
                <ul className="navbar-menu">
                    {menuItems.map((item) => (
                        <li key={item.id} className={activeItem === item.id ? 'active' : ''}>
                            <Link
                                to={item.path}
                                ref={(el) => (menuRefs.current[item.id] = el as any)}
                                onClick={() => setActiveItem(item.id)}
                            >
                                {item.icon}
                                <span>{item.label}</span>
                            </Link>
                        </li>
                    ))}
                    <div
                        className="menu-indicator"
                        style={{
                            width: `${indicatorStyle.width}px`,
                            transform: `translateX(${indicatorStyle.left}px)`
                        }}
                    />
                </ul>
                <div className="navbar-auth">
                    {currentUser ? (
                        /* ─── Logged in: show profile avatar ─── */
                        <div className="profile-wrapper">
                            <button
                                className="profile-avatar-btn"
                                onClick={() => setIsProfileOpen(!isProfileOpen)}
                                title={currentUser.email}
                            >
                                {userInitial}
                            </button>
                            <ProfileDropdown
                                isOpen={isProfileOpen}
                                onClose={() => setIsProfileOpen(false)}
                            />
                        </div>
                    ) : (
                        /* ─── Not logged in: show Sign In / Sign Up ─── */
                        <>
                            <span className="auth-text">Existing user?
                                <a href="#signin" onClick={(e) => {
                                    e.preventDefault();
                                    setIsSignInOpen(true);
                                }}>Sign In</a>
                            </span>
                            <button className="auth-signup-btn" onClick={() => setIsSignUpOpen(true)}>Sign Up</button>
                        </>
                    )}
                    <button className="navbar-cart-btn" onClick={() => setIsCartOpen(true)}>
                        <IoCartOutline />
                        {cartItemCount > 0 && <span className="cart-badge">{cartItemCount}</span>}
                    </button>
                </div>
            </div>
            <SignInPopup
                isOpen={isSignInOpen}
                onClose={() => setIsSignInOpen(false)}
                onSwitchToSignUp={() => { setIsSignInOpen(false); setTimeout(() => setIsSignUpOpen(true), 100); }}
            />
            <SignUpPopup
                isOpen={isSignUpOpen}
                onClose={() => setIsSignUpOpen(false)}
                onSwitchToSignIn={() => { setIsSignUpOpen(false); setTimeout(() => setIsSignInOpen(true), 100); }}
            />
            <CartPopup isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} onCheckout={() => { setIsCartOpen(false); setTimeout(() => setIsCheckoutOpen(true), 150); }} />
            <CheckoutPopup isOpen={isCheckoutOpen} onClose={() => setIsCheckoutOpen(false)} onOpenSignIn={() => { setIsCheckoutOpen(false); setTimeout(() => setIsSignInOpen(true), 200); }} />
        </nav>
    );
};

export default Navbar;
