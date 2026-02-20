import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';
import { useStore } from '../context/StoreContext';
import { FaDiscord, FaYoutube, FaCcVisa, FaCcMastercard, FaPaypal, FaBitcoin, FaEthereum } from 'react-icons/fa';
import { SiTether, SiVenmo, SiZelle, SiCashapp, SiLitecoin } from 'react-icons/si';

const productsCol1 = [
    { name: 'Apex Legends', path: '/#apex' },
    { name: 'Call of Duty', path: '/#cod' },
    { name: 'Fortnite', path: '/#fortnite' },
    { name: 'Valorant', path: '/#valorant' },
    { name: 'Overwatch 2', path: '/#ow2' },
    { name: 'Rust', path: '/#rust' },
];

const productsCol2 = [
    { name: 'Counter-Strike 2', path: '/#cs2' },
    { name: 'DayZ', path: '/#dayz' },
    { name: 'Escape from Tarkov', path: '/#eft' },
    { name: 'Rainbow Six Siege', path: '/#r6' },
    { name: 'GTA V / FiveM', path: '/#gta' },
    { name: 'HWID Spoofers', path: '/#spoofer' },
];

const importantLinks = [
    { name: 'Status', path: '/status' },
    { name: 'Support', path: '/#support' },
    { name: 'Terms of Service', path: '/#terms' },
    { name: 'Privacy Policy', path: '/#privacy' },
    { name: 'Refund Policy', path: '/#refund' },
];

const Footer: React.FC = () => {
    const { settings } = useStore();

    return (
        <footer className="footer-section">
            <div className="footer-container">
                <div className="footer-top">
                    {/* Brand Column */}
                    <div className="footer-col brand-col">
                        <div className="footer-logo">
                            <img src={settings.logoUrl || "/logo.png"} alt="CamUnlocks" />
                            <span>CamUnlocks</span>
                        </div>
                        <p className="footer-desc">
                            CamUnlocks provides top-tier modifications for AAA titles, with thousands of successful orders.
                            Backed by 24/7 support and instant delivery, we ensure a seamless experience.
                            Take your gaming experience to the next level.
                        </p>
                        <a href="/#products" className="footer-cta-btn">
                            UNDETECTED CHEATS
                        </a>
                        <a href="https://www.trustpilot.com/review/camunlocks.com" target="_blank" rel="noopener noreferrer" className="trustpilot-widget">
                            <span>Review us on</span>
                            <span className="trustpilot-star">★</span>
                            <strong>Trustpilot</strong>
                        </a>
                    </div>

                    {/* Products Column 1 */}
                    <div className="footer-col">
                        <h4 className="footer-heading">Product Information</h4>
                        <ul className="footer-links">
                            {productsCol1.map((link, index) => (
                                <li key={index}><Link to={link.path}>{link.name}</Link></li>
                            ))}
                        </ul>
                    </div>

                    {/* Products Column 2 */}
                    <div className="footer-col spacer-col">
                        <h4 className="footer-heading mobile-hidden">&nbsp;</h4>
                        <ul className="footer-links">
                            {productsCol2.map((link, index) => (
                                <li key={index}><Link to={link.path}>{link.name}</Link></li>
                            ))}
                        </ul>
                    </div>

                    {/* Info Column */}
                    <div className="footer-col">
                        <h4 className="footer-heading">Important Information</h4>
                        <ul className="footer-links">
                            {importantLinks.map((link, index) => (
                                <li key={index}><Link to={link.path}>{link.name}</Link></li>
                            ))}
                        </ul>
                        <div className="footer-contact">
                            <p>For all other inquiries, contact:</p>
                            <a href="mailto:cam@camunlocks.com" className="contact-email">cam@camunlocks.com</a>
                        </div>
                    </div>
                </div>

                <div className="footer-bottom">
                    <div className="payment-methods">
                        {/* Traditional Payment Methods */}
                        <div className="payment-group">
                            <span className="payment-icon" aria-label="Visa">
                                <FaCcVisa size={32} />
                            </span>
                            <span className="payment-icon" aria-label="Mastercard">
                                <FaCcMastercard size={32} />
                            </span>
                            <span className="payment-icon" aria-label="PayPal">
                                <FaPaypal size={24} />
                            </span>
                        </div>

                        <div className="payment-divider"></div>

                        {/* Money Apps */}
                        <div className="payment-group">
                            <span className="payment-icon" aria-label="Venmo">
                                <SiVenmo size={24} />
                            </span>
                            <span className="payment-icon" aria-label="Zelle">
                                <SiZelle size={24} />
                            </span>
                            <span className="payment-icon" aria-label="Cash App">
                                <SiCashapp size={24} />
                            </span>
                        </div>

                        <div className="payment-divider"></div>

                        {/* Crypto Icons */}
                        <div className="payment-group crypto-group">
                            <span className="payment-icon crypto" aria-label="Bitcoin">
                                <FaBitcoin size={24} />
                            </span>
                            <span className="payment-icon crypto" aria-label="Ethereum">
                                <FaEthereum size={24} />
                            </span>
                            <span className="payment-icon crypto" aria-label="Litecoin">
                                <SiLitecoin size={24} />
                            </span>
                            <span className="payment-icon crypto" aria-label="Tether">
                                <SiTether size={24} />
                            </span>
                        </div>
                    </div>
                    <div className="footer-legal">
                        <div className="copyright">
                            <p>&copy; {new Date().getFullYear()} Camunlocks. All rights reserved. <span className="powered-by">Powered by Camunlocks</span></p>
                        </div>
                        <div className="social-links">
                            {settings.socials?.discord && (
                                <a href={settings.socials.discord} target="_blank" rel="noopener noreferrer" className="social-icon" aria-label="Discord">
                                    <FaDiscord size={20} />
                                </a>
                            )}

                            {settings.socials?.youtube && (
                                <a href={settings.socials.youtube} target="_blank" rel="noopener noreferrer" className="social-icon" aria-label="YouTube">
                                    <FaYoutube size={20} />
                                </a>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
