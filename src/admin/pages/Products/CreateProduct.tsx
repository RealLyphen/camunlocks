import React, { useState, useCallback } from 'react';
import { useStore } from '../../../context/StoreContext';
import type { ProductVariant } from '../../../context/StoreContext';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Save, ArrowLeft, Plus, X, Check, Search,
    Upload, DollarSign, EyeOff, Star, Package,
    Globe, Tag, Layers, Image as ImageIcon, FileText,
    Settings, Sparkles, Trash2, GripVertical, Link as LinkIcon
} from 'lucide-react';

/* ─── Helper: slug from name ─── */
const slugify = (text: string) =>
    text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

/* ─── Animated Section Wrapper ─── */
const Section: React.FC<{
    icon: React.ReactNode;
    title: string;
    subtitle: string;
    children: React.ReactNode;
    delay?: number;
}> = ({ icon, title, subtitle, children, delay = 0 }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay }}
        className="table-card"
        style={{ padding: 0, overflow: 'hidden' }}
    >
        <div style={{
            padding: '20px 28px',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
            display: 'flex',
            alignItems: 'center',
            gap: 14,
        }}>
            <div style={{
                width: 40, height: 40, borderRadius: 10,
                background: 'linear-gradient(135deg, rgba(79,104,248,0.15), rgba(139,92,246,0.15))',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: '1px solid rgba(255,255,255,0.06)',
            }}>
                {icon}
            </div>
            <div>
                <div style={{ fontWeight: 600, fontSize: '0.95rem', color: '#e4e4e7' }}>{title}</div>
                <div style={{ fontSize: '0.8rem', color: '#71717a', marginTop: 2 }}>{subtitle}</div>
            </div>
        </div>
        <div style={{ padding: '24px 28px' }}>
            {children}
        </div>
    </motion.div>
);

/* ─── Toggle Switch ─── */
const Toggle: React.FC<{
    label: string;
    sublabel?: string;
    icon?: React.ReactNode;
    checked: boolean;
    onChange: (v: boolean) => void;
}> = ({ label, sublabel, icon, checked, onChange }) => (
    <div
        style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '14px 0',
            borderBottom: '1px solid rgba(255,255,255,0.04)',
        }}
        onClick={() => onChange(!checked)}
        role="button"
        tabIndex={0}
    >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}>
            {icon && <span style={{ color: '#71717a' }}>{icon}</span>}
            <div>
                <div style={{ fontSize: '0.9rem', fontWeight: 500, color: '#d4d4d8' }}>{label}</div>
                {sublabel && <div style={{ fontSize: '0.78rem', color: '#52525b', marginTop: 2 }}>{sublabel}</div>}
            </div>
        </div>
        <div
            style={{
                width: 44, height: 24, borderRadius: 12, cursor: 'pointer',
                background: checked
                    ? 'linear-gradient(135deg, var(--primary-color), var(--secondary-color))'
                    : 'rgba(255,255,255,0.08)',
                border: `1px solid ${checked ? 'rgba(79,104,248,0.4)' : 'rgba(255,255,255,0.1)'}`,
                transition: 'all 0.3s ease',
                position: 'relative',
                boxShadow: checked ? '0 0 12px rgba(79,104,248,0.3)' : 'none',
            }}
        >
            <motion.div
                animate={{ x: checked ? 20 : 2 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                style={{
                    position: 'absolute', top: 2,
                    width: 18, height: 18, borderRadius: '50%',
                    background: '#fff',
                    boxShadow: '0 1px 4px rgba(0,0,0,0.3)',
                }}
            />
        </div>
    </div>
);

/* ─── Status Badge ─── */
const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
    const colors: Record<string, { bg: string; dot: string; text: string }> = {
        active: { bg: 'rgba(34,197,94,0.1)', dot: '#22c55e', text: '#4ade80' },
        draft: { bg: 'rgba(234,179,8,0.1)', dot: '#eab308', text: '#facc15' },
        hidden: { bg: 'rgba(239,68,68,0.1)', dot: '#ef4444', text: '#f87171' },
    };
    const c = colors[status] || colors.draft;
    return (
        <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '4px 12px', borderRadius: 20,
            background: c.bg,
            fontSize: '0.78rem', fontWeight: 500, color: c.text,
            border: `1px solid ${c.dot}22`,
        }}>
            <span style={{
                width: 7, height: 7, borderRadius: '50%', background: c.dot,
                boxShadow: `0 0 6px ${c.dot}80`,
            }} />
            {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
    );
};


/* ════════════════════════════════════════════════════
   MAIN COMPONENT
   ════════════════════════════════════════════════════ */
const CreateProduct: React.FC = () => {
    const { addProduct, categories } = useStore();
    const navigate = useNavigate();

    // — Core fields
    const [name, setName] = useState('');
    const [slug, setSlug] = useState('');
    const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
    const [price, setPrice] = useState('');
    const [shortDescription, setShortDescription] = useState('');
    const [description, setDescription] = useState('');
    const [status, setStatus] = useState<'active' | 'draft' | 'hidden'>('active');

    // — Settings toggles
    const [hideProduct, setHideProduct] = useState(false);
    const [featured, setFeatured] = useState(false);
    const [capStock, setCapStock] = useState(false);
    const [stockQty, setStockQty] = useState('');
    const [payWhatYouWant, setPayWhatYouWant] = useState(false);

    // — Images
    const [images, setImages] = useState<string[]>([]);
    const [dragOver, setDragOver] = useState(false);

    // — Variants
    const [variants, setVariants] = useState<ProductVariant[]>([]);

    // — Categories
    const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
    const [categorySearch, setCategorySearch] = useState('');
    const [catSearchFocused, setCatSearchFocused] = useState(false);

    // — SEO
    const [metaTitle, setMetaTitle] = useState('');
    const [metaDescription, setMetaDescription] = useState('');

    /* ─── Handlers ─── */
    const handleNameChange = (val: string) => {
        setName(val);
        if (!slugManuallyEdited) setSlug(slugify(val));
        if (!metaTitle) setMetaTitle(val);
    };

    const handleSlugChange = (val: string) => {
        setSlugManuallyEdited(true);
        setSlug(slugify(val));
    };

    const handleImageUpload = useCallback((files: FileList | null) => {
        if (!files) return;
        Array.from(files).forEach(file => {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImages(prev => [...prev, reader.result as string]);
            };
            reader.readAsDataURL(file);
        });
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(false);
        handleImageUpload(e.dataTransfer.files);
    }, [handleImageUpload]);

    const removeImage = (index: number) => {
        setImages(prev => prev.filter((_, i) => i !== index));
    };

    const addVariant = () => {
        setVariants(prev => [...prev, {
            id: crypto.randomUUID(),
            name: `Variant ${prev.length + 1}`,
            price: parseFloat(price) || 0,
        }]);
    };

    const updateVariant = (id: string, updates: Partial<ProductVariant>) => {
        setVariants(prev => prev.map(v => v.id === id ? { ...v, ...updates } : v));
    };

    const removeVariant = (id: string) => {
        setVariants(prev => prev.filter(v => v.id !== id));
    };

    const toggleCategory = (id: string) => {
        setSelectedCategoryIds(prev =>
            prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
        );
    };

    const handleSubmit = () => {
        if (!name.trim() || !price) return;
        addProduct({
            name,
            price: parseFloat(price),
            description,
            imageUrl: images[0] || '',
            images,
            slug,
            shortDescription,
            status: hideProduct ? 'hidden' : status,
            featured,
            stockCap: capStock ? parseInt(stockQty) || null : null,
            payWhatYouWant,
            variants: variants.length > 0 ? variants : undefined,
            metaTitle: metaTitle || name,
            metaDescription,
            categoryIds: selectedCategoryIds,
        });
        navigate('/admin/products');
    };

    const isValid = name.trim().length > 0 && parseFloat(price) > 0;

    return (
        <div className="relative">
            {/* ── Header ── */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="admin-header"
            >
                <div className="welcome-text">
                    <h1>New Product</h1>
                    <p>Add a new product to your store</p>
                </div>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                    <StatusBadge status={status} />
                    <Link to="/admin/products" className="btn-secondary">
                        <ArrowLeft size={16} /> Cancel
                    </Link>
                    <button
                        onClick={handleSubmit}
                        className="btn-primary"
                        disabled={!isValid}
                        style={{ opacity: isValid ? 1 : 0.5 }}
                    >
                        <Save size={16} /> Save Product
                    </button>
                </div>
            </motion.div>

            {/* ── Two‑Column Layout ── */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 24, alignItems: 'start' }}>

                {/* ═══ LEFT COLUMN ═══ */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

                    {/* ── 1. Product Settings ── */}
                    <Section
                        icon={<Settings size={18} color="#818cf8" />}
                        title="Product Settings"
                        subtitle="Control visibility and pricing behavior"
                        delay={0.05}
                    >
                        <Toggle
                            label="Hide Product"
                            sublabel="Product won't be visible to customers"
                            icon={<EyeOff size={16} />}
                            checked={hideProduct}
                            onChange={setHideProduct}
                        />
                        <Toggle
                            label="Featured Product"
                            sublabel="Highlight this product on your storefront"
                            icon={<Star size={16} />}
                            checked={featured}
                            onChange={setFeatured}
                        />
                        <Toggle
                            label="Cap Stock"
                            sublabel="Limit the available quantity"
                            icon={<Package size={16} />}
                            checked={capStock}
                            onChange={setCapStock}
                        />
                        <AnimatePresence>
                            {capStock && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.25 }}
                                    style={{ overflow: 'hidden' }}
                                >
                                    <div style={{ paddingTop: 12, paddingBottom: 8 }}>
                                        <input
                                            type="number"
                                            className="admin-input"
                                            placeholder="Enter stock quantity..."
                                            value={stockQty}
                                            onChange={e => setStockQty(e.target.value)}
                                            min="0"
                                            style={{ maxWidth: 220 }}
                                        />
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                        <Toggle
                            label="Pay What You Want"
                            sublabel="Let customers choose their price"
                            icon={<DollarSign size={16} />}
                            checked={payWhatYouWant}
                            onChange={setPayWhatYouWant}
                        />
                    </Section>

                    {/* ── 2. Product Information ── */}
                    <Section
                        icon={<FileText size={18} color="#818cf8" />}
                        title="Product Information"
                        subtitle="Core details displayed to your customers"
                        delay={0.1}
                    >
                        <div className="form-group">
                            <label>Product Name</label>
                            <input
                                type="text"
                                className="admin-input"
                                placeholder="e.g. COD Black Ops 6 Bot Lobby"
                                value={name}
                                onChange={e => handleNameChange(e.target.value)}
                                autoFocus
                            />
                        </div>

                        <div className="form-group">
                            <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                <LinkIcon size={14} style={{ color: '#71717a' }} /> Product URL
                            </label>
                            <div style={{
                                display: 'flex', alignItems: 'center',
                                background: 'rgba(0,0,0,0.2)',
                                borderRadius: 8, border: '1px solid rgba(255,255,255,0.08)',
                                overflow: 'hidden',
                            }}>
                                <span style={{
                                    padding: '12px 14px',
                                    fontSize: '0.85rem', color: '#52525b',
                                    background: 'rgba(255,255,255,0.03)',
                                    borderRight: '1px solid rgba(255,255,255,0.06)',
                                    whiteSpace: 'nowrap',
                                }}>
                                    camunlocks.com/product/
                                </span>
                                <input
                                    type="text"
                                    className="admin-input"
                                    style={{ border: 'none', borderRadius: 0, background: 'transparent' }}
                                    value={slug}
                                    onChange={e => handleSlugChange(e.target.value)}
                                    placeholder="product-url"
                                />
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                            <div className="form-group" style={{ marginBottom: 0 }}>
                                <label>Price</label>
                                <div className="relative">
                                    <DollarSign size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                                    <input
                                        type="number"
                                        className="admin-input"
                                        placeholder="0.00"
                                        style={{ paddingLeft: 36 }}
                                        value={price}
                                        onChange={e => setPrice(e.target.value)}
                                        min="0"
                                        step="0.01"
                                    />
                                </div>
                            </div>

                            <div className="form-group" style={{ marginBottom: 0 }}>
                                <label>Status</label>
                                <select
                                    className="admin-input"
                                    value={status}
                                    onChange={e => setStatus(e.target.value as 'active' | 'draft' | 'hidden')}
                                    style={{ cursor: 'pointer', appearance: 'none' }}
                                >
                                    <option value="active">🟢 Active</option>
                                    <option value="draft">🟡 Draft</option>
                                    <option value="hidden">🔴 Hidden</option>
                                </select>
                            </div>
                        </div>
                    </Section>

                    {/* ── 3. Short Description ── */}
                    <Section
                        icon={<Tag size={18} color="#818cf8" />}
                        title="Short Description"
                        subtitle="Brief summary shown in product listings"
                        delay={0.15}
                    >
                        <div style={{ position: 'relative' }}>
                            <textarea
                                className="admin-input"
                                rows={2}
                                placeholder="A concise one-liner about your product..."
                                style={{ resize: 'none' }}
                                value={shortDescription}
                                onChange={e => setShortDescription(e.target.value.slice(0, 160))}
                                maxLength={160}
                            />
                            <span style={{
                                position: 'absolute', bottom: 10, right: 14,
                                fontSize: '0.72rem',
                                color: shortDescription.length > 140 ? '#f87171' : '#52525b',
                            }}>
                                {shortDescription.length}/160
                            </span>
                        </div>
                    </Section>

                    {/* ── 4. Full Description ── */}
                    <Section
                        icon={<Sparkles size={18} color="#818cf8" />}
                        title="Product Description"
                        subtitle="Detailed description displayed on the product page"
                        delay={0.2}
                    >
                        <textarea
                            className="admin-input"
                            rows={8}
                            placeholder="Write a compelling product description..."
                            style={{ resize: 'vertical', minHeight: 160 }}
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                        />
                    </Section>

                    {/* ── 5. Variants ── */}
                    <Section
                        icon={<Layers size={18} color="#818cf8" />}
                        title="Variants"
                        subtitle="Different versions of this product"
                        delay={0.25}
                    >
                        <AnimatePresence mode="popLayout">
                            {variants.map((v, i) => (
                                <motion.div
                                    key={v.id}
                                    layout
                                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                                    transition={{ duration: 0.25 }}
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: 12,
                                        padding: '14px 16px', marginBottom: 10,
                                        borderRadius: 12,
                                        background: 'rgba(255,255,255,0.03)',
                                        border: '1px solid rgba(255,255,255,0.06)',
                                    }}
                                >
                                    <GripVertical size={16} style={{ color: '#3f3f46', cursor: 'grab', flexShrink: 0 }} />
                                    <span style={{
                                        width: 26, height: 26, borderRadius: 6,
                                        background: 'rgba(79,104,248,0.12)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: '0.75rem', fontWeight: 600, color: '#818cf8', flexShrink: 0,
                                    }}>
                                        {i + 1}
                                    </span>
                                    <input
                                        type="text"
                                        className="admin-input"
                                        style={{ flex: 1 }}
                                        value={v.name}
                                        onChange={e => updateVariant(v.id, { name: e.target.value })}
                                        placeholder="Variant name"
                                    />
                                    <div className="relative" style={{ width: 120, flexShrink: 0 }}>
                                        <DollarSign size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-600" />
                                        <input
                                            type="number"
                                            className="admin-input"
                                            style={{ paddingLeft: 28 }}
                                            value={v.price}
                                            onChange={e => updateVariant(v.id, { price: parseFloat(e.target.value) || 0 })}
                                            min="0"
                                            step="0.01"
                                        />
                                    </div>
                                    <button
                                        onClick={() => removeVariant(v.id)}
                                        style={{
                                            background: 'rgba(239,68,68,0.08)',
                                            border: '1px solid rgba(239,68,68,0.15)',
                                            color: '#f87171', borderRadius: 8,
                                            padding: 6, cursor: 'pointer',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            transition: 'all 0.2s',
                                            flexShrink: 0,
                                        }}
                                        onMouseEnter={e => {
                                            (e.target as HTMLElement).style.background = 'rgba(239,68,68,0.18)';
                                        }}
                                        onMouseLeave={e => {
                                            (e.target as HTMLElement).style.background = 'rgba(239,68,68,0.08)';
                                        }}
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </motion.div>
                            ))}
                        </AnimatePresence>

                        <motion.button
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.99 }}
                            onClick={addVariant}
                            style={{
                                width: '100%', padding: '14px 0',
                                borderRadius: 12, cursor: 'pointer',
                                background: 'transparent',
                                border: '1px dashed rgba(79,104,248,0.25)',
                                color: '#818cf8', fontSize: '0.85rem', fontWeight: 500,
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                                transition: 'all 0.2s',
                            }}
                            onMouseEnter={e => {
                                (e.currentTarget as HTMLElement).style.background = 'rgba(79,104,248,0.06)';
                                (e.currentTarget as HTMLElement).style.borderColor = 'rgba(79,104,248,0.4)';
                            }}
                            onMouseLeave={e => {
                                (e.currentTarget as HTMLElement).style.background = 'transparent';
                                (e.currentTarget as HTMLElement).style.borderColor = 'rgba(79,104,248,0.25)';
                            }}
                        >
                            <Plus size={16} /> Add Variant
                        </motion.button>
                    </Section>

                    {/* ── 6. SEO / Metadata ── */}
                    <Section
                        icon={<Globe size={18} color="#818cf8" />}
                        title="SEO & Metadata"
                        subtitle="Optimize how your product appears in search engines"
                        delay={0.3}
                    >
                        <div className="form-group">
                            <label>Meta Title</label>
                            <input
                                type="text"
                                className="admin-input"
                                placeholder={name || 'Product title'}
                                value={metaTitle}
                                onChange={e => setMetaTitle(e.target.value)}
                            />
                        </div>
                        <div className="form-group">
                            <label>Meta Description</label>
                            <textarea
                                className="admin-input"
                                rows={3}
                                placeholder="Describe this product for search engines..."
                                style={{ resize: 'none' }}
                                value={metaDescription}
                                onChange={e => setMetaDescription(e.target.value.slice(0, 300))}
                                maxLength={300}
                            />
                            <span style={{ fontSize: '0.72rem', color: '#52525b', float: 'right', marginTop: 4 }}>
                                {metaDescription.length}/300
                            </span>
                        </div>

                        {/* Google Preview */}
                        <div style={{
                            marginTop: 8, padding: '18px 20px',
                            borderRadius: 12,
                            background: 'rgba(255,255,255,0.03)',
                            border: '1px solid rgba(255,255,255,0.06)',
                        }}>
                            <div style={{ fontSize: '0.72rem', color: '#52525b', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 1, fontWeight: 600 }}>
                                Google Preview
                            </div>
                            <div style={{ fontSize: '0.82rem', color: '#4ade80', marginBottom: 2 }}>
                                camunlocks.com › product › {slug || 'product-url'}
                            </div>
                            <div style={{ fontSize: '1.05rem', color: '#93c5fd', fontWeight: 500, marginBottom: 4, lineHeight: 1.3 }}>
                                {metaTitle || name || 'Product Title'}
                            </div>
                            <div style={{ fontSize: '0.82rem', color: '#a1a1aa', lineHeight: 1.5 }}>
                                {metaDescription || shortDescription || 'No description provided...'}
                            </div>
                        </div>
                    </Section>
                </div>

                {/* ═══ RIGHT COLUMN (Sidebar) ═══ */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 24, position: 'sticky', top: 24 }}>

                    {/* ── Images ── */}
                    <Section
                        icon={<ImageIcon size={18} color="#818cf8" />}
                        title="Images"
                        subtitle="Upload product images"
                        delay={0.08}
                    >
                        {/* Upload Zone */}
                        <div
                            onDrop={handleDrop}
                            onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                            onDragLeave={() => setDragOver(false)}
                            style={{
                                position: 'relative',
                                border: `2px dashed ${dragOver ? 'rgba(79,104,248,0.6)' : 'rgba(255,255,255,0.08)'}`,
                                borderRadius: 16,
                                padding: images.length > 0 ? 12 : '32px 20px',
                                transition: 'all 0.3s',
                                background: dragOver ? 'rgba(79,104,248,0.06)' : 'transparent',
                                cursor: 'pointer',
                                textAlign: 'center',
                            }}
                        >
                            <input
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={e => handleImageUpload(e.target.files)}
                                style={{
                                    position: 'absolute', inset: 0, width: '100%', height: '100%',
                                    opacity: 0, cursor: 'pointer', zIndex: 5,
                                }}
                            />

                            {images.length > 0 ? (
                                <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(3, 1fr)',
                                    gap: 8,
                                }}>
                                    {images.map((img, i) => (
                                        <motion.div
                                            key={i}
                                            initial={{ opacity: 0, scale: 0.8 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            style={{
                                                position: 'relative', borderRadius: 10, overflow: 'hidden',
                                                aspectRatio: '1',
                                                border: i === 0 ? '2px solid rgba(79,104,248,0.4)' : '1px solid rgba(255,255,255,0.06)',
                                            }}
                                        >
                                            <img src={img} alt={`Product ${i + 1}`} style={{
                                                width: '100%', height: '100%', objectFit: 'cover',
                                            }} />
                                            {i === 0 && (
                                                <span style={{
                                                    position: 'absolute', bottom: 4, left: 4,
                                                    background: 'rgba(79,104,248,0.9)',
                                                    padding: '2px 8px', borderRadius: 6,
                                                    fontSize: '0.65rem', fontWeight: 600, color: '#fff',
                                                }}>
                                                    MAIN
                                                </span>
                                            )}
                                            <button
                                                onClick={e => { e.preventDefault(); e.stopPropagation(); removeImage(i); }}
                                                style={{
                                                    position: 'absolute', top: 4, right: 4, zIndex: 10,
                                                    width: 22, height: 22, borderRadius: '50%',
                                                    background: 'rgba(0,0,0,0.7)', border: 'none',
                                                    color: '#f87171', cursor: 'pointer',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                }}
                                            >
                                                <X size={12} />
                                            </button>
                                        </motion.div>
                                    ))}
                                    {/* Add more slot */}
                                    <div style={{
                                        borderRadius: 10, aspectRatio: '1',
                                        border: '1px dashed rgba(255,255,255,0.1)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        color: '#52525b',
                                    }}>
                                        <Plus size={20} />
                                    </div>
                                </div>
                            ) : (
                                <div style={{ pointerEvents: 'none' }}>
                                    <div style={{
                                        width: 52, height: 52, borderRadius: '50%',
                                        background: 'rgba(79,104,248,0.08)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        margin: '0 auto 14px',
                                        border: '1px solid rgba(79,104,248,0.15)',
                                    }}>
                                        <Upload size={22} color="#818cf8" />
                                    </div>
                                    <div style={{ fontSize: '0.88rem', fontWeight: 500, color: '#d4d4d8', marginBottom: 4 }}>
                                        Drop images here
                                    </div>
                                    <div style={{ fontSize: '0.78rem', color: '#52525b' }}>
                                        or click to browse • JPG, PNG, WEBP
                                    </div>
                                </div>
                            )}
                        </div>

                        {images.length > 0 && (
                            <div style={{ marginTop: 10, fontSize: '0.78rem', color: '#52525b', textAlign: 'center' }}>
                                {images.length} image{images.length !== 1 ? 's' : ''} • First image is the main cover
                            </div>
                        )}
                    </Section>

                    {/* ── Categories ── */}
                    <Section
                        icon={<Tag size={18} color="#818cf8" />}
                        title="Categories"
                        subtitle="Assign to one or more categories"
                        delay={0.15}
                    >
                        {/* Search bar */}
                        <div style={{ position: 'relative', marginBottom: 14 }}>
                            <div style={{
                                position: 'absolute', inset: '-4px', borderRadius: 50,
                                background: 'radial-gradient(ellipse at center, rgba(79,104,248,0.15), transparent 70%)',
                                filter: 'blur(16px)', opacity: catSearchFocused ? 1 : 0,
                                transition: 'opacity 0.4s', pointerEvents: 'none',
                            }} />
                            <div style={{
                                position: 'relative', display: 'flex', alignItems: 'center',
                                background: catSearchFocused ? 'rgba(10,10,15,0.7)' : 'rgba(10,10,15,0.5)',
                                backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
                                border: catSearchFocused
                                    ? '1px solid rgba(79,104,248,0.4)'
                                    : '1px solid rgba(255,255,255,0.08)',
                                borderRadius: 50, padding: 4, transition: 'all 0.3s ease',
                                boxShadow: catSearchFocused
                                    ? '0 0 0 2px rgba(79,104,248,0.1), 0 8px 32px rgba(0,0,0,0.4)'
                                    : '0 4px 20px rgba(0,0,0,0.3)',
                            }}>
                                <div style={{
                                    width: 34, height: 34, minWidth: 34, borderRadius: '50%',
                                    background: catSearchFocused
                                        ? 'linear-gradient(135deg, rgba(79,104,248,0.35), rgba(139,92,246,0.35))'
                                        : 'linear-gradient(135deg, rgba(79,104,248,0.2), rgba(139,92,246,0.2))',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    border: '1px solid rgba(255,255,255,0.08)',
                                    transition: 'all 0.3s',
                                }}>
                                    <Search size={14} color={catSearchFocused ? '#a5b4fc' : '#71717a'} />
                                </div>
                                <input
                                    type="text"
                                    placeholder="Search..."
                                    value={categorySearch}
                                    onChange={e => setCategorySearch(e.target.value)}
                                    onFocus={() => setCatSearchFocused(true)}
                                    onBlur={() => setCatSearchFocused(false)}
                                    style={{
                                        flex: 1, background: 'transparent', border: 'none', outline: 'none',
                                        paddingLeft: 10, paddingRight: 14, paddingTop: 8, paddingBottom: 8,
                                        fontSize: '0.85rem', color: '#e4e4e7', fontFamily: 'inherit',
                                    }}
                                />
                            </div>
                        </div>

                        {/* Category list */}
                        <div style={{ maxHeight: 260, overflowY: 'auto', marginRight: -8, paddingRight: 8 }}>
                            {categories.length === 0 ? (
                                <div style={{ padding: 24, textAlign: 'center', color: '#52525b', fontSize: '0.85rem' }}>
                                    No categories yet
                                </div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                    {categories
                                        .filter(c => c.name.toLowerCase().includes(categorySearch.toLowerCase()))
                                        .map(cat => {
                                            const selected = selectedCategoryIds.includes(cat.id);
                                            return (
                                                <motion.div
                                                    key={cat.id}
                                                    whileTap={{ scale: 0.98 }}
                                                    onClick={() => toggleCategory(cat.id)}
                                                    style={{
                                                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                                        padding: '10px 14px', borderRadius: 10, cursor: 'pointer',
                                                        background: selected ? 'rgba(79,104,248,0.08)' : 'transparent',
                                                        border: `1px solid ${selected ? 'rgba(79,104,248,0.2)' : 'transparent'}`,
                                                        transition: 'all 0.2s',
                                                    }}
                                                >
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                                        <div style={{
                                                            width: 8, height: 8, borderRadius: '50%',
                                                            background: selected ? '#818cf8' : '#3f3f46',
                                                            boxShadow: selected ? '0 0 8px rgba(129,140,248,0.6)' : 'none',
                                                            transition: 'all 0.2s',
                                                        }} />
                                                        <span style={{
                                                            fontSize: '0.85rem',
                                                            color: selected ? '#fff' : '#a1a1aa',
                                                            fontWeight: selected ? 500 : 400,
                                                        }}>
                                                            {cat.name}
                                                        </span>
                                                    </div>
                                                    {selected && (
                                                        <div style={{
                                                            background: 'rgba(99,102,241,0.2)',
                                                            padding: 3, borderRadius: '50%',
                                                        }}>
                                                            <Check size={12} color="#818cf8" />
                                                        </div>
                                                    )}
                                                </motion.div>
                                            );
                                        })}
                                </div>
                            )}
                        </div>
                    </Section>

                    {/* ── Quick Summary ── */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.25 }}
                        className="table-card"
                        style={{
                            padding: '20px 24px',
                            background: 'linear-gradient(135deg, rgba(79,104,248,0.06), rgba(139,92,246,0.04))',
                        }}
                    >
                        <div style={{ fontSize: '0.78rem', color: '#52525b', textTransform: 'uppercase', letterSpacing: 1, fontWeight: 600, marginBottom: 14 }}>
                            Summary
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                            {[
                                { label: 'Name', value: name || '—' },
                                { label: 'Price', value: price ? `$${parseFloat(price).toFixed(2)}` : '—' },
                                { label: 'Status', value: status },
                                { label: 'Images', value: `${images.length} uploaded` },
                                { label: 'Variants', value: `${variants.length}` },
                                { label: 'Categories', value: `${selectedCategoryIds.length} selected` },
                            ].map(item => (
                                <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                                    <span style={{ color: '#71717a' }}>{item.label}</span>
                                    <span style={{ color: '#d4d4d8', fontWeight: 500 }}>{item.value}</span>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default CreateProduct;
