import React, { useState } from 'react';
import { useStore } from '../../../context/StoreContext';
import { useToast } from '../../../context/ToastContext';
import { Globe, Search, Share2, FileText, Save, Eye, Tag, ChevronDown, ChevronUp } from 'lucide-react';

const card: React.CSSProperties = {
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 16, padding: 24, marginBottom: 24,
};
const label: React.CSSProperties = { fontSize: '0.8rem', color: '#a1a1aa', fontWeight: 600, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' };
const inp: React.CSSProperties = {
    width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 10, padding: '10px 14px', color: '#fff', fontSize: '0.9rem',
    outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit', transition: 'border-color 0.2s',
};
const textarea: React.CSSProperties = { ...inp, resize: 'vertical', minHeight: 90 };

const ROBOTS_PRESETS = [
    { label: 'Allow all (default)', value: 'User-agent: *\nAllow: /' },
    { label: 'Block all crawlers', value: 'User-agent: *\nDisallow: /' },
    { label: 'Block admin pages', value: 'User-agent: *\nAllow: /\nDisallow: /admin/' },
];

const SEO: React.FC = () => {
    const { settings, updateSettings, products } = useStore();
    const { addToast } = useToast();
    const seo = (settings.seo as any) || {};

    const [ogTitle, setOgTitle] = useState(seo.ogTitle || settings.storeName || '');
    const [ogDesc, setOgDesc] = useState(seo.ogDescription || seo.description || '');
    const [ogImage, setOgImage] = useState(seo.ogImage || '');
    const [metaTitle, setMetaTitle] = useState(seo.title || settings.storeName || '');
    const [metaDesc, setMetaDesc] = useState(seo.description || '');
    const [robots, setRobots] = useState(seo.robots || 'User-agent: *\nAllow: /');
    const [canonical, setCanonical] = useState(seo.canonical || '');
    const [twitterHandle, setTwitterHandle] = useState(seo.twitterHandle || '');
    const [previewTab, setPreviewTab] = useState<'google' | 'og'>('google');
    const [expandedProduct, setExpandedProduct] = useState<string | null>(null);
    const [productSeo, setProductSeo] = useState<Record<string, { metaTitle: string; metaDesc: string }>>({});
    const { updateProduct } = useStore();

    const save = () => {
        updateSettings({
            seo: {
                title: metaTitle,
                description: metaDesc,
                ogTitle, ogDescription: ogDesc, ogImage,
                robots, canonical, twitterHandle,
            } as any,
        });
        addToast('SEO settings saved!', 'success');
    };

    const saveProductSeo = (prodId: string) => {
        const data = productSeo[prodId];
        if (!data) return;
        updateProduct(prodId, { metaTitle: data.metaTitle, metaDescription: data.metaDesc });
        addToast('Product SEO saved!', 'success');
    };

    const getProductSeo = (prodId: string, p: any) => productSeo[prodId] || { metaTitle: p.metaTitle || '', metaDesc: p.metaDescription || '' };

    return (
        <div style={{ maxWidth: 860, margin: '0 auto' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
                <div>
                    <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800, color: '#fff', display: 'flex', alignItems: 'center', gap: 10 }}>
                        <Globe size={22} style={{ color: 'var(--primary-color,#818cf8)' }} /> SEO Settings
                    </h1>
                    <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: '#71717a' }}>Control how your store appears in search engines and social media.</p>
                </div>
                <button onClick={save} style={{
                    display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px',
                    background: 'linear-gradient(135deg, var(--primary-color,#4f68f8), var(--secondary-color,#6d28d9))',
                    border: 'none', borderRadius: 10, color: '#fff', fontWeight: 700, fontSize: '0.9rem',
                    cursor: 'pointer', fontFamily: 'inherit',
                }}>
                    <Save size={15} /> Save Changes
                </button>
            </div>

            {/* 1. Meta Tags */}
            <div style={card}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
                    <Search size={16} style={{ color: '#818cf8' }} />
                    <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#fff' }}>Search Engine Meta Tags</h2>
                </div>
                <div style={{ marginBottom: 16 }}>
                    <div style={label}>Page Title (shown in browser tab &amp; Google)</div>
                    <input value={metaTitle} onChange={e => setMetaTitle(e.target.value)} style={inp} placeholder={settings.storeName} maxLength={70} />
                    <div style={{ fontSize: '0.75rem', color: metaTitle.length > 60 ? '#f87171' : '#71717a', marginTop: 4 }}>
                        {metaTitle.length}/70 characters — ideal: 50-60
                    </div>
                </div>
                <div>
                    <div style={label}>Meta Description</div>
                    <textarea value={metaDesc} onChange={e => setMetaDesc(e.target.value)} style={textarea} placeholder="Short compelling description of your store…" maxLength={160} />
                    <div style={{ fontSize: '0.75rem', color: metaDesc.length > 155 ? '#f87171' : '#71717a', marginTop: 4 }}>
                        {metaDesc.length}/160 characters — ideal: 120-155
                    </div>
                </div>
            </div>

            {/* 2. Open Graph / Social */}
            <div style={card}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
                    <Share2 size={16} style={{ color: '#4ade80' }} />
                    <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#fff' }}>Open Graph (Social Sharing)</h2>
                </div>
                <p style={{ fontSize: '0.82rem', color: '#71717a', marginBottom: 20, marginTop: 0 }}>
                    These tags control how your store looks when shared on Twitter, Discord, Facebook, WhatsApp, etc.
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                    <div>
                        <div style={label}>OG Title</div>
                        <input value={ogTitle} onChange={e => setOgTitle(e.target.value)} style={inp} placeholder="Store name or promo headline" />
                    </div>
                    <div>
                        <div style={label}>Twitter Handle</div>
                        <input value={twitterHandle} onChange={e => setTwitterHandle(e.target.value)} style={inp} placeholder="@yourstorehandle" />
                    </div>
                </div>
                <div style={{ marginBottom: 16 }}>
                    <div style={label}>OG Description</div>
                    <textarea value={ogDesc} onChange={e => setOgDesc(e.target.value)} style={textarea} placeholder="Appears under the title when shared on social media…" />
                </div>
                <div>
                    <div style={label}>OG Image URL (1200×630 recommended)</div>
                    <input value={ogImage} onChange={e => setOgImage(e.target.value)} style={inp} placeholder="https://yourdomain.com/og-image.jpg" />
                    {ogImage && <img src={ogImage} alt="OG Preview" style={{ marginTop: 10, borderRadius: 8, width: '100%', maxHeight: 200, objectFit: 'cover', border: '1px solid rgba(255,255,255,0.1)' }} />}
                </div>
            </div>

            {/* 3. Preview Card */}
            <div style={card}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                    <Eye size={16} style={{ color: '#fbbf24' }} />
                    <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#fff' }}>Live Preview</h2>
                    <div style={{ marginLeft: 'auto', display: 'flex', background: 'rgba(255,255,255,0.05)', borderRadius: 8, overflow: 'hidden' }}>
                        {(['google', 'og'] as const).map(t => (
                            <button key={t} onClick={() => setPreviewTab(t)} style={{
                                padding: '6px 14px', fontSize: '0.8rem', fontWeight: 600, border: 'none', cursor: 'pointer', fontFamily: 'inherit',
                                background: previewTab === t ? 'rgba(255,255,255,0.12)' : 'transparent',
                                color: previewTab === t ? '#fff' : '#71717a', transition: 'all 0.2s',
                            }}>{t === 'google' ? 'Google' : 'Social Card'}</button>
                        ))}
                    </div>
                </div>
                {previewTab === 'google' ? (
                    <div style={{ background: '#fff', borderRadius: 12, padding: '16px 20px', color: '#000' }}>
                        <div style={{ fontSize: '0.7rem', color: '#0d6efd', marginBottom: 2 }}>{canonical || 'https://yourstore.com'}</div>
                        <div style={{ fontSize: '1.1rem', color: '#1a0dab', fontWeight: 500, lineHeight: 1.3, marginBottom: 6 }}>{metaTitle || 'Your Store Title'}</div>
                        <div style={{ fontSize: '0.85rem', color: '#4d5156', lineHeight: 1.4 }}>{metaDesc || 'Your meta description will appear here…'}</div>
                    </div>
                ) : (
                    <div style={{ background: '#1a1a2e', borderRadius: 12, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)', maxWidth: 500 }}>
                        {ogImage && <img src={ogImage} alt="OG" style={{ width: '100%', height: 200, objectFit: 'cover', display: 'block' }} />}
                        {!ogImage && <div style={{ width: '100%', height: 200, background: 'linear-gradient(135deg, var(--primary-color,#4f68f8), var(--secondary-color,#6d28d9))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', opacity: 0.5 }}>No OG Image Set</div>}
                        <div style={{ padding: 14 }}>
                            <div style={{ fontSize: '0.7rem', color: '#71717a', marginBottom: 4, textTransform: 'uppercase' }}>{canonical || 'yourstore.com'}</div>
                            <div style={{ fontWeight: 700, color: '#fff', marginBottom: 4 }}>{ogTitle || metaTitle || 'Your Store'}</div>
                            <div style={{ fontSize: '0.82rem', color: '#a1a1aa' }}>{ogDesc || metaDesc || 'Description…'}</div>
                        </div>
                    </div>
                )}
            </div>

            {/* 4. Robots.txt */}
            <div style={card}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                    <FileText size={16} style={{ color: '#f97316' }} />
                    <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#fff' }}>Robots.txt</h2>
                </div>
                <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
                    {ROBOTS_PRESETS.map(p => (
                        <button key={p.label} onClick={() => setRobots(p.value)} style={{
                            padding: '5px 12px', fontSize: '0.78rem', border: '1px solid rgba(255,255,255,0.12)',
                            borderRadius: 8, background: 'rgba(255,255,255,0.05)', color: '#e4e4e7', cursor: 'pointer', fontFamily: 'inherit',
                        }}>{p.label}</button>
                    ))}
                </div>
                <textarea value={robots} onChange={e => setRobots(e.target.value)} style={{ ...textarea, fontFamily: 'monospace', fontSize: '0.85rem', minHeight: 100 }} />
            </div>

            {/* 5. Canonical URL */}
            <div style={card}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                    <Globe size={16} style={{ color: '#38bdf8' }} />
                    <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#fff' }}>Canonical URL</h2>
                </div>
                <p style={{ fontSize: '0.82rem', color: '#71717a', marginBottom: 12, marginTop: 0 }}>
                    Set your primary domain to avoid duplicate content issues when using custom domains or subdomain redirects.
                </p>
                <input value={canonical} onChange={e => setCanonical(e.target.value)} style={inp} placeholder="https://yourstore.com" />
            </div>

            {/* 6. Per-Product SEO */}
            <div style={card}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <Tag size={16} style={{ color: '#a78bfa' }} />
                    <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#fff' }}>Per-Product SEO</h2>
                </div>
                <p style={{ fontSize: '0.82rem', color: '#71717a', marginBottom: 16, marginTop: 4 }}>Override title &amp; description individually for each product.</p>
                {products.map(p => {
                    const data = getProductSeo(p.id, p);
                    const isOpen = expandedProduct === p.id;
                    return (
                        <div key={p.id} style={{ border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, marginBottom: 10, overflow: 'hidden' }}>
                            <div onClick={() => setExpandedProduct(isOpen ? null : p.id)} style={{
                                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                padding: '12px 16px', cursor: 'pointer', background: 'rgba(255,255,255,0.02)',
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                    {p.imageUrl && <img src={p.imageUrl} alt="" style={{ width: 32, height: 32, borderRadius: 6, objectFit: 'cover' }} />}
                                    <div>
                                        <div style={{ fontWeight: 600, color: '#fff', fontSize: '0.9rem' }}>{p.name}</div>
                                        <div style={{ fontSize: '0.75rem', color: '#52525b' }}>{data.metaTitle ? 'Custom SEO set' : 'Using default'}</div>
                                    </div>
                                </div>
                                {isOpen ? <ChevronUp size={16} style={{ color: '#71717a' }} /> : <ChevronDown size={16} style={{ color: '#71717a' }} />}
                            </div>
                            {isOpen && (
                                <div style={{ padding: '16px', borderTop: '1px solid rgba(255,255,255,0.07)' }}>
                                    <div style={{ marginBottom: 12 }}>
                                        <div style={label}>Meta Title</div>
                                        <input value={data.metaTitle} style={inp} placeholder={`${p.name} – ${settings.storeName}`}
                                            onChange={e => setProductSeo(prev => ({ ...prev, [p.id]: { ...data, metaTitle: e.target.value } }))} />
                                    </div>
                                    <div style={{ marginBottom: 12 }}>
                                        <div style={label}>Meta Description</div>
                                        <textarea value={data.metaDesc} style={textarea} placeholder={p.shortDescription || p.description?.slice(0, 155)}
                                            onChange={e => setProductSeo(prev => ({ ...prev, [p.id]: { ...data, metaDesc: e.target.value } }))} />
                                    </div>
                                    <button onClick={() => saveProductSeo(p.id)} style={{
                                        padding: '8px 16px', background: 'rgba(167,139,250,0.15)', border: '1px solid rgba(167,139,250,0.3)',
                                        borderRadius: 8, color: '#a78bfa', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer', fontFamily: 'inherit',
                                        display: 'flex', alignItems: 'center', gap: 6,
                                    }}>
                                        <Save size={13} /> Save Product SEO
                                    </button>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default SEO;
