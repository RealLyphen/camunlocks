import React from 'react';
import './Hero.css';
import { useStore } from '../context/StoreContext';

interface HeroProps {
    config?: any;
}

const Hero: React.FC<HeroProps> = ({ config }) => {
    const { settings } = useStore();

    // Mapping dynamic config or falling back to defaults for exact parity
    const title = config?.title || 'Fastest <span class="orb-icon"><svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" /></svg></span> Safest<br />Cheats Marketplace';
    const subtitle = config?.subtitle || 'Unleash your potential with powerful cheats. Dominate every match, outsmart opponents, and claim victory effortlessly. Win like never before!';
    const buttonText = config?.buttonText || 'Shop Now';
    const buttonLink = config?.buttonLink || '#';
    const image = config?.image || '/char.png';

    return (
        <section className="hero" id={buttonLink.replace('#', '')}>
            <div className="hero-video-wrapper">
                <video className="hero-video" autoPlay loop muted playsInline>
                    <source src="/gameplay.MP4" type="video/mp4" />
                </video>
                <div className="hero-overlay"></div>
                <div className="hero-container">
                    <div className="hero-content">
                        <div className="active-badge">
                            <div className="badge-icon">
                                <div className="ripple-container">
                                    <span className="ripple-dot" style={{ backgroundColor: settings.accentColor }}></span>
                                    <span className="ripple-wave" style={{ borderColor: settings.accentColor }}></span>
                                    <span className="ripple-wave delay" style={{ borderColor: settings.accentColor }}></span>
                                </div>
                            </div>
                            <span>12 Active Players</span>
                        </div>

                        <h1 className="hero-title" dangerouslySetInnerHTML={{ __html: title.replace('currentColor', settings.accentColor) }}>
                        </h1>

                        <p className="hero-description">
                            {subtitle}
                        </p>

                        <div className="hero-buttons">
                            <a href={buttonLink} style={{ textDecoration: 'none' }}>
                                <button className="btn-marketplace" style={{ background: `linear-gradient(45deg, var(--primary-color), var(--secondary-color))` }}>
                                    <span className="cart-icon">🛒</span>
                                    <span>{buttonText}</span>
                                    <span className="arrow-icon">→</span>
                                </button>
                            </a>
                            <button className="btn-guide">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '4px' }}>
                                    <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                                    <line x1="2" y1="20" x2="22" y2="20" />
                                </svg>
                                DMA Products
                            </button>
                        </div>

                        <div className="hero-pills">
                            <div className="hero-pill">
                                <svg className="pill-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M12 2L3 7V12C3 17.41 6.84 21.03 12 22C17.16 21.03 21 17.41 21 12V7L12 2Z" stroke={settings.accentColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    <path d="M12 12V17" stroke={settings.accentColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    <circle cx="12" cy="9" r="1" fill={settings.accentColor} />
                                </svg>
                                <span>Undetected</span>
                            </div>
                            <div className="hero-pill">
                                <svg className="pill-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" fill={settings.accentColor} stroke={settings.accentColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                                <span>Quick Setup</span>
                            </div>
                            <div className="hero-pill">
                                <svg className="pill-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M3 18V10C3 5.02944 7.02944 1 12 1C16.9706 1 21 5.02944 21 10V18" stroke={settings.accentColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    <path d="M21 19C21 20.1046 20.1046 21 19 21H18C16.8954 21 16 20.1046 16 19V16C16 14.8954 16.8954 14 18 14H21V19Z" fill={settings.accentColor} stroke={settings.accentColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    <path d="M3 19C3 20.1046 3.89543 21 5 21H6C7.10457 21 8 20.1046 8 19V16C8 14.8954 7.10457 14 6 14H3V19Z" fill={settings.accentColor} stroke={settings.accentColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                                <span>24/7 Support</span>
                            </div>
                        </div>
                    </div>

                    <div className="hero-character">
                        <img
                            src={image}
                            alt="Hero Character"
                            onError={(e) => {
                                const t = e.currentTarget;
                                if (!t.src.endsWith('/char.png')) {
                                    t.src = '/char.png';
                                }
                            }}
                        />
                    </div>
                </div>

                <div className="notice-bar-container">
                    <div className="notice-bar">
                        <div className="notice-left">
                            <img src={settings.logoUrl || "/logo.png"} alt="Logo" className="notice-logo" />
                            <div className="notice-text">
                                <h3>Instant Delivery With Credit Card & Crypto!</h3>
                                <p>For PayPal, Venmo, or Zelle follow the steps at checkout.</p>
                            </div>
                        </div>
                        <button className="btn-discord">
                            <svg className="discord-logo" viewBox="0 0 127.14 96.36">
                                <path fill="currentColor" d="M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.68,97.68,0,0,0,49,6.83,72.37,72.37,0,0,0,45.64,0,105.89,105.89,0,0,0,19.39,8.09C2.71,32.65-1.77,56.63.48,80.1a105.73,105.73,0,0,0,32.2,16.14,77.7,77.7,0,0,0,6.89-11.11,68.42,68.42,0,0,1-10.85-5.18c.91-.66,1.8-1.34,2.66-2a75.57,75.57,0,0,0,64.32,0c.87.71,1.76,1.39,2.66,2a68.68,68.68,0,0,1-10.87,5.19,77,77,0,0,0,6.89,11.1,105.25,105.25,0,0,0,32.19-16.14c2.72-27.09-4.5-50.85-19.16-72.03ZM42.45,65.69C36.18,65.69,31,60,31,53s5-12.74,11.43-12.74S54,45.91,53.87,53,48.72,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.25,60,73.25,53s5-12.74,11.44-12.74S96.23,45.91,96.11,53,91,65.69,84.69,65.69Z" />
                            </svg>
                            <span>Join Discord</span>
                        </button>
                    </div>
                </div>

                <div className="feature-boxes-container">
                    <div className="feature-boxes">
                        <div className="feature-box">
                            <img src="/banners/hero banner 1.png" alt="Feature 1" className="feature-banner" />
                            <div className="feature-overlay">
                                <div className="overlay-content">
                                    <h3>COD Accounts</h3>
                                    <div className="feature-divider"></div>
                                    <p>Explore our curated selection of premium Call of Duty accounts, each tailored to give you a head startin the action.</p>
                                </div>
                            </div>
                        </div>
                        <div className="feature-box">
                            <img src="/banners/hero banner 2.png" alt="Feature 2" className="feature-banner" />
                            <div className="feature-overlay">
                                <div className="overlay-content">
                                    <h3>DMA Products</h3>
                                    <div className="feature-divider"></div>
                                    <p>Explore a range of DMA hardware and firmware options</p>
                                </div>
                            </div>
                        </div>
                        <div className="feature-box">
                            <img src="/banners/hero banner 3.png" alt="Feature 3" className="feature-banner" />
                            <div className="feature-overlay">
                                <div className="overlay-content">
                                    <h3>UPGRADE SERVICE</h3>
                                    <div className="feature-divider"></div>
                                    <p>Upgrade your digital experience with our premium services!</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section >
    );
};

export default Hero;
