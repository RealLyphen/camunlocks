import React, { useState } from 'react';
import { ChevronRight, FileText, Search, Book, Sparkles, Settings } from 'lucide-react';

/* ─── Shared Theme Styles ─── */
const glassCard: React.CSSProperties = {
    background: 'rgba(20, 20, 25, 0.6)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: 16,
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    padding: '24px',
};

const inputStyle: React.CSSProperties = {
    width: '100%',
    background: 'rgba(0,0,0,0.4)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 20,
    padding: '12px 20px 12px 42px',
    color: '#fff',
    fontSize: '0.9rem',
    outline: 'none',
    transition: 'border-color 0.2s',
};

// --- Doc Content Database ---
const DOCS_DATA = [
    {
        id: 'getting-started',
        category: 'QuickStart',
        icon: <Sparkles size={18} />,
        title: 'Getting Started',
        content: (
            <div className="doc-content">
                <h1>Welcome to CamUnlocks 🚀</h1>
                <p>CamUnlocks provides the most premium, high-performance checkout experience for your digital products. Built on a cutting-edge glassmorphism design system, your store will stand out instantly.</p>

                <h2>Prerequisites</h2>
                <div style={{ background: 'rgba(139, 92, 246, 0.1)', border: '1px solid rgba(139, 92, 246, 0.3)', padding: '16px', borderRadius: '12px', margin: '20px 0' }}>
                    <h4 style={{ margin: '0 0 8px 0', color: '#a78bfa', display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ background: 'var(--secondary-color)', color: '#fff', width: 20, height: 20, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12 }}>i</span>
                        Important Requirement
                    </h4>
                    <p style={{ margin: 0, fontSize: '0.9rem', color: '#d4d4d8' }}>To process live payments, make sure you configure your Payment Methods (Stripe, PayPal, Cash App, or Crypto) in the Settings panel before launching.</p>
                </div>

                <h2>Basic Concepts</h2>
                <ul>
                    <li><strong>Products:</strong> The core items you sell. They can have variants, stock limits, and custom SEO.</li>
                    <li><strong>Fraud Shield:</strong> An automated system that cross-references IP addresses, proxy usage, and known bad-actors.</li>
                    <li><strong>Store Customization:</strong> Live-edit your store's appearance, popup messages, and maintenance modes.</li>
                </ul>

                <button style={{ background: 'var(--primary-color)', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', marginTop: 20 }}>
                    Configure Store Now
                </button>
            </div>
        )
    },
    {
        id: 'adding-products',
        category: 'Products',
        icon: <Book size={18} />,
        title: 'Adding Products',
        content: (
            <div className="doc-content">
                <h1>Adding Products</h1>
                <p>Creating products in CamUnlocks is seamless. You can manage everything from pricing and stock limits to associated variants entirely through the UI.</p>

                <h2>Step-by-Step Guide</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 24 }}>
                    <div style={{ background: 'rgba(255,255,255,0.03)', padding: 16, borderRadius: 12, border: '1px solid rgba(255,255,255,0.05)' }}>
                        <h3 style={{ margin: '0 0 8px 0', fontSize: '1rem', color: '#fff' }}>1. Navigate to Products</h3>
                        <p style={{ margin: 0, fontSize: '0.85rem', color: '#a1a1aa' }}>Open the Admin Dashboard and click on "Products" in the left sidebar, then click "Create Product".</p>
                    </div>
                    <div style={{ background: 'rgba(255,255,255,0.03)', padding: 16, borderRadius: 12, border: '1px solid rgba(255,255,255,0.05)' }}>
                        <h3 style={{ margin: '0 0 8px 0', fontSize: '1rem', color: '#fff' }}>2. Fill Core Details</h3>
                        <p style={{ margin: 0, fontSize: '0.85rem', color: '#a1a1aa' }}>Provide a Title, internal Slug, Price, and comprehensive markdown Description. Upload high-res images to make it pop.</p>
                    </div>
                    <div style={{ background: 'rgba(255,255,255,0.03)', padding: 16, borderRadius: 12, border: '1px solid rgba(255,255,255,0.05)' }}>
                        <h3 style={{ margin: '0 0 8px 0', fontSize: '1rem', color: '#fff' }}>3. Advanced Settings</h3>
                        <p style={{ margin: 0, fontSize: '0.85rem', color: '#a1a1aa' }}>Toggle "Pay what you want", set hard Stock Caps, or add functional Variants (like Size or Color) to offer tiered pricing.</p>
                    </div>
                </div>

                <h2>Code Example (API)</h2>
                <div style={{ background: '#1e1e24', borderRadius: 12, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)', marginTop: 16 }}>
                    <div style={{ padding: '8px 16px', background: 'rgba(0,0,0,0.3)', borderBottom: '1px solid rgba(255,255,255,0.05)', fontSize: '0.8rem', color: '#a1a1aa', fontFamily: 'monospace' }}>
                        POST /api/products
                    </div>
                    <pre style={{ margin: 0, padding: 16, color: '#e4e4e7', fontSize: '0.85rem', overflowX: 'auto' }}>
                        {`{
  "name": "Premium Subscription",
  "price": 29.99,
  "stockCap": 100,
  "variants": [
    { "name": "1 Month", "price": 29.99 },
    { "name": "Lifetime", "price": 199.99 }
  ]
}`}
                    </pre>
                </div>
            </div>
        )
    },
    {
        id: 'store-customization',
        category: 'Settings',
        icon: <Settings size={18} />,
        title: 'Store Customization',
        content: (
            <div className="doc-content">
                <h1>Store Customization</h1>
                <p>The "Customize Store" panel lets you completely re-brand your storefront and toggle vital global settings without touching code.</p>

                <h2>Global Behaviors</h2>
                <ul>
                    <li><strong>Maintenance Mode:</strong> Kick all active users out of the store and display a locked screen. Admin routes remain accessible.</li>
                    <li><strong>VPN Checkout:</strong> Prevent high-risk users from placing orders by detecting VPN IP ranges.</li>
                    <li><strong>Show Products Sold:</strong> Triggers beautiful floating popups in the bottom corner indicating recent purchases by fake or real users to build urgency.</li>
                    <li><strong>Global Popup:</strong> Force a welcome dialog on all new sessions (e.g., "Use code WINTER for 20% off").</li>
                </ul>

                <h2>SEO & MetaData</h2>
                <p>Ensure you fill out the SEO Title and Description. These dynamically adjust the HTML <code>&lt;meta&gt;</code> tags so Google, Discord, and Telegram render beautiful preview cards when you share your link.</p>
            </div>
        )
    }
];

const Docs: React.FC = () => {
    const [activeDoc, setActiveDoc] = useState(DOCS_DATA[0].id);
    const [searchQuery, setSearchQuery] = useState('');

    const currentDoc = DOCS_DATA.find(d => d.id === activeDoc) || DOCS_DATA[0];

    // Grouping for sidebar
    const categories = Array.from(new Set(DOCS_DATA.map(d => d.category)));

    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#09090b', color: '#fff', fontFamily: 'Inter, sans-serif' }}>
            <div style={{ flex: 1, display: 'flex', maxWidth: 1400, margin: '0 auto', width: '100%', paddingTop: 40 }}>

                {/* Sidebar Navigation */}
                <div style={{ width: 280, padding: '32px 24px', borderRight: '1px solid rgba(255,255,255,0.05)', height: 'calc(100vh - 80px)', position: 'sticky', top: 0, overflowY: 'auto' }}>

                    <div style={{ position: 'relative', marginBottom: 32 }}>
                        <Search size={18} color="#a1a1aa" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
                        <input
                            placeholder="Search docs..."
                            style={inputStyle}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    {categories.map(category => (
                        <div key={category} style={{ marginBottom: 24 }}>
                            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#a1a1aa', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12, paddingLeft: 12 }}>
                                {category}
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                                {DOCS_DATA.filter(d => d.category === category).map(doc => {
                                    const isActive = activeDoc === doc.id;
                                    return (
                                        <button
                                            key={doc.id}
                                            onClick={() => setActiveDoc(doc.id)}
                                            style={{
                                                display: 'flex', alignItems: 'center', gap: 10,
                                                background: isActive ? 'rgba(79, 104, 248, 0.15)' : 'transparent',
                                                color: isActive ? '#fff' : '#a1a1aa',
                                                border: isActive ? '1px solid rgba(79, 104, 248, 0.3)' : '1px solid transparent',
                                                padding: '10px 14px', borderRadius: 10, cursor: 'pointer',
                                                textAlign: 'left', fontSize: '0.9rem', fontWeight: isActive ? 600 : 500,
                                                transition: 'all 0.2s'
                                            }}
                                        >
                                            <span style={{ color: isActive ? 'var(--primary-color)' : '#71717a' }}>{doc.icon}</span>
                                            {doc.title}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Main Content Area */}
                <div style={{ flex: 1, padding: '40px 60px', maxWidth: 900, position: 'relative' }}>

                    {/* Breadcrumbs */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.85rem', color: '#a1a1aa', marginBottom: 24 }}>
                        <FileText size={14} />
                        <span>Docs</span>
                        <ChevronRight size={14} />
                        <span>{currentDoc.category}</span>
                        <ChevronRight size={14} />
                        <span style={{ color: '#fff' }}>{currentDoc.title}</span>
                    </div>

                    {/* Document Container */}
                    <div style={{ ...glassCard, minHeight: 600 }}>
                        <style dangerouslySetInnerHTML={{
                            __html: `
                            .doc-content h1 { font-size: 2.2rem; font-weight: 800; margin-top: 0; margin-bottom: 1rem; color: #fff; letter-spacing: -0.5px; }
                            .doc-content h2 { font-size: 1.4rem; font-weight: 600; margin-top: 2rem; margin-bottom: 1rem; color: #f4f4f5; padding-bottom: 8px; border-bottom: 1px solid rgba(255,255,255,0.05); }
                            .doc-content p { color: #a1a1aa; line-height: 1.7; font-size: 0.95rem; margin-bottom: 1.2rem; }
                            .doc-content ul { color: #a1a1aa; line-height: 1.7; font-size: 0.95rem; padding-left: 1.5rem; margin-bottom: 1.2rem; }
                            .doc-content li { margin-bottom: 0.5rem; }
                            .doc-content strong { color: #fff; font-weight: 600; }
                        ` }} />
                        {currentDoc.content}
                    </div>

                    {/* Footer Paginators */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 32, gap: 20 }}>
                        <button style={{ flex: 1, ...glassCard, padding: 20, textAlign: 'left', cursor: 'pointer', border: '1px solid rgba(255,255,255,0.05)', transition: 'border-color 0.2s', alignSelf: 'stretch' }}>
                            <div style={{ fontSize: '0.75rem', color: '#a1a1aa', marginBottom: 4 }}>PREVIOUS</div>
                            <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#fff' }}>Introduction</div>
                        </button>
                        <button style={{ flex: 1, ...glassCard, padding: 20, textAlign: 'right', cursor: 'pointer', border: '1px solid rgba(255,255,255,0.05)', transition: 'border-color 0.2s', alignSelf: 'stretch' }}>
                            <div style={{ fontSize: '0.75rem', color: '#a1a1aa', marginBottom: 4 }}>NEXT</div>
                            <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#fff' }}>Advanced Settings</div>
                        </button>
                    </div>
                </div>

                {/* Right Table of Contents (Desktop only) */}
                <div style={{ width: 240, padding: '40px 24px', position: 'sticky', top: 80, height: 'calc(100vh - 80px)' }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#e4e4e7', marginBottom: 16 }}>On This Page</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        <span style={{ fontSize: '0.85rem', color: 'var(--primary-color)', cursor: 'pointer' }}>Overview</span>
                        <span style={{ fontSize: '0.85rem', color: '#a1a1aa', cursor: 'pointer', transition: 'color 0.2s' }}>Prerequisites</span>
                        <span style={{ fontSize: '0.85rem', color: '#a1a1aa', cursor: 'pointer', transition: 'color 0.2s' }}>Concepts</span>
                        <span style={{ fontSize: '0.85rem', color: '#a1a1aa', cursor: 'pointer', transition: 'color 0.2s' }}>API</span>
                    </div>

                    <div style={{ height: 1, background: 'rgba(255,255,255,0.05)', margin: '24px 0' }} />

                    <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#e4e4e7', marginBottom: 16 }}>Questions?</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        <span style={{ fontSize: '0.85rem', color: '#a1a1aa', cursor: 'pointer' }}>FAQ</span>
                        <span style={{ fontSize: '0.85rem', color: '#a1a1aa', cursor: 'pointer' }}>Contact Support</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Docs;
