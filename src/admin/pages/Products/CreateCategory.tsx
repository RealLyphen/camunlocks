import React, { useState } from 'react';
import { useStore } from '../../../context/StoreContext';
import { useNavigate, Link } from 'react-router-dom';
import { Save, Search, X, Check, ArrowLeft, Upload } from 'lucide-react';

const CreateCategory: React.FC = () => {
    const { addCategory, products } = useStore();
    const navigate = useNavigate();

    const [name, setName] = useState('');
    const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
    const [productSearch, setProductSearch] = useState('');
    const [description, setDescription] = useState('');
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [searchFocused, setSearchFocused] = useState(false);

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const removeImage = () => {
        setImagePreview(null);
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return;

        addCategory({
            name,
            imageUrl: imagePreview || '',
            productIds: selectedProductIds
        });

        navigate('/admin/products/categories');
    };

    const toggleProduct = (productId: string) => {
        setSelectedProductIds(prev =>
            prev.includes(productId)
                ? prev.filter(id => id !== productId)
                : [...prev, productId]
        );
    };

    return (
        <div className="relative">
            {/* Header */}
            <div className="admin-header">
                <div className="welcome-text">
                    <h1>Create Category</h1>
                    <p>Add a new category to organize your products</p>
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                    <Link to="/admin/products/categories" className="btn-secondary">
                        <ArrowLeft size={16} /> Cancel
                    </Link>
                    <button onClick={handleSubmit} className="btn-primary" disabled={!name.trim()}>
                        <Save size={16} /> Save Category
                    </button>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: 24 }}>
                {/* Main Form */}
                <div className="table-card" style={{ padding: 30 }}>
                    <div className="form-group">
                        <label>Category Name</label>
                        <input
                            type="text"
                            className="admin-input"
                            placeholder="e.g. Electronics, Bundles"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            autoFocus
                        />
                    </div>

                    {/* Category Image — glassmorphism card */}
                    <div className="table-card" style={{ padding: 0, overflow: 'hidden' }}>
                        {/* Section header */}
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
                                <Upload size={18} color="#818cf8" />
                            </div>
                            <div>
                                <div style={{ fontWeight: 600, fontSize: '0.95rem', color: '#e4e4e7' }}>Images</div>
                                <div style={{ fontSize: '0.8rem', color: '#71717a', marginTop: 2 }}>Upload product images</div>
                            </div>
                        </div>

                        {/* Upload zone */}
                        <div style={{ padding: '24px 28px' }}>
                            <div
                                className="group"
                                style={{
                                    position: 'relative',
                                    border: '2px dashed rgba(255,255,255,0.08)',
                                    borderRadius: 16,
                                    padding: imagePreview ? 12 : '40px 20px',
                                    transition: 'all 0.3s',
                                    cursor: 'pointer',
                                    textAlign: 'center',
                                }}
                                onMouseEnter={e => {
                                    (e.currentTarget as HTMLElement).style.borderColor = 'rgba(79,104,248,0.35)';
                                    (e.currentTarget as HTMLElement).style.background = 'rgba(79,104,248,0.04)';
                                }}
                                onMouseLeave={e => {
                                    (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.08)';
                                    (e.currentTarget as HTMLElement).style.background = 'transparent';
                                }}
                            >
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                    style={{
                                        position: 'absolute', inset: 0, width: '100%', height: '100%',
                                        opacity: 0, cursor: 'pointer', zIndex: 5,
                                    }}
                                />

                                {imagePreview ? (
                                    <div style={{ position: 'relative', zIndex: 0, height: 200, width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <img src={imagePreview} alt="Preview" style={{ height: '100%', objectFit: 'contain', borderRadius: 10 }} />
                                        <button
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                removeImage();
                                            }}
                                            style={{
                                                position: 'absolute', top: 8, right: 8, zIndex: 20,
                                                width: 30, height: 30, borderRadius: '50%',
                                                background: 'rgba(0,0,0,0.7)', border: 'none',
                                                color: '#f87171', cursor: 'pointer',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                backdropFilter: 'blur(8px)',
                                                transition: 'all 0.2s',
                                            }}
                                            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(239,68,68,0.6)'; (e.currentTarget as HTMLElement).style.color = '#fff'; }}
                                            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(0,0,0,0.7)'; (e.currentTarget as HTMLElement).style.color = '#f87171'; }}
                                            title="Remove Image"
                                        >
                                            <X size={14} />
                                        </button>
                                    </div>
                                ) : (
                                    <div style={{ pointerEvents: 'none' }}>
                                        <div style={{
                                            width: 56, height: 56, borderRadius: '50%',
                                            background: 'rgba(79,104,248,0.08)',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            margin: '0 auto 16px',
                                            border: '1px solid rgba(79,104,248,0.15)',
                                        }}>
                                            <Upload size={24} color="#818cf8" />
                                        </div>
                                        <div style={{ fontSize: '0.9rem', fontWeight: 500, color: '#d4d4d8', marginBottom: 6 }}>
                                            Drop images here
                                        </div>
                                        <div style={{ fontSize: '0.78rem', color: '#52525b' }}>
                                            or click to browse • JPG, PNG, WEBP
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Description (Optional)</label>
                        <textarea
                            className="admin-input"
                            rows={4}
                            placeholder="Describe this category..."
                            style={{ resize: 'none' }}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </div>
                </div>

                {/* Product Selection Side Panel */}
                <div className="table-card" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ padding: '20px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                        {/* Glassmorphism Search Bar — matching admin theme */}
                        <div style={{ position: 'relative' }}>
                            {/* Glow layer behind search bar */}
                            <div style={{
                                position: 'absolute',
                                inset: '-4px',
                                borderRadius: '50px',
                                background: 'radial-gradient(ellipse at center, rgba(79,104,248,0.15), rgba(139,92,246,0.1), transparent 70%)',
                                filter: 'blur(16px)',
                                opacity: searchFocused ? 1 : 0,
                                transition: 'opacity 0.4s ease',
                                pointerEvents: 'none',
                            }} />

                            {/* Main search container */}
                            <div style={{
                                position: 'relative',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0px',
                                background: searchFocused
                                    ? 'rgba(10, 10, 15, 0.7)'
                                    : 'rgba(10, 10, 15, 0.5)',
                                backdropFilter: 'blur(20px)',
                                WebkitBackdropFilter: 'blur(20px)',
                                border: searchFocused
                                    ? '1px solid rgba(79, 104, 248, 0.4)'
                                    : '1px solid rgba(255, 255, 255, 0.08)',
                                borderRadius: '50px',
                                padding: '4px',
                                transition: 'all 0.3s ease',
                                boxShadow: searchFocused
                                    ? '0 0 0 2px rgba(79, 104, 248, 0.1), 0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255,255,255,0.05)'
                                    : '0 4px 20px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255,255,255,0.04)',
                            }}>
                                {/* Icon circle */}
                                <div style={{
                                    width: '38px',
                                    height: '38px',
                                    minWidth: '38px',
                                    borderRadius: '50%',
                                    background: searchFocused
                                        ? 'linear-gradient(135deg, rgba(79,104,248,0.35), rgba(139,92,246,0.35))'
                                        : 'linear-gradient(135deg, rgba(79,104,248,0.2), rgba(139,92,246,0.2))',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    border: '1px solid rgba(255, 255, 255, 0.08)',
                                    transition: 'all 0.3s ease',
                                    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.06)',
                                }}>
                                    <Search
                                        size={16}
                                        color={searchFocused ? '#a5b4fc' : '#71717a'}
                                        style={{ transition: 'color 0.3s ease' }}
                                    />
                                </div>

                                {/* Text input */}
                                <input
                                    type="text"
                                    placeholder="Search..."
                                    value={productSearch}
                                    onChange={(e) => setProductSearch(e.target.value)}
                                    onFocus={() => setSearchFocused(true)}
                                    onBlur={() => setSearchFocused(false)}
                                    style={{
                                        flex: 1,
                                        background: 'transparent',
                                        border: 'none',
                                        outline: 'none',
                                        paddingLeft: '12px',
                                        paddingRight: '16px',
                                        paddingTop: '10px',
                                        paddingBottom: '10px',
                                        fontSize: '0.9rem',
                                        color: '#e4e4e7',
                                        fontFamily: 'inherit',
                                        fontWeight: 400,
                                        letterSpacing: '0.3px',
                                    }}
                                />
                            </div>
                        </div>
                    </div>

                    <div style={{ flex: 1, overflowY: 'auto', maxHeight: 400, padding: 16 }}>
                        {products.length === 0 ? (
                            <div style={{ padding: 40, textAlign: 'center', color: '#a1a1aa', fontSize: '0.9rem' }}>
                                No products available
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                {products
                                    .filter(p => p.name.toLowerCase().includes(productSearch.toLowerCase()))
                                    .map(product => (
                                        <div
                                            key={product.id}
                                            onClick={() => toggleProduct(product.id)}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'space-between',
                                                padding: '12px 16px',
                                                borderRadius: '12px',
                                                cursor: 'pointer',
                                                fontSize: '0.875rem',
                                                transition: 'all 0.2s',
                                                border: '1px solid',
                                                background: selectedProductIds.includes(product.id) ? 'rgba(79, 104, 248, 0.08)' : 'transparent',
                                                borderColor: selectedProductIds.includes(product.id) ? 'rgba(79, 104, 248, 0.2)' : 'transparent'
                                            }}
                                        >
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                <div style={{
                                                    width: '8px',
                                                    height: '8px',
                                                    borderRadius: '50%',
                                                    background: selectedProductIds.includes(product.id) ? '#818cf8' : '#3f3f46',
                                                    boxShadow: selectedProductIds.includes(product.id) ? '0 0 8px rgba(129,140,248,0.6)' : 'none',
                                                    transition: 'all 0.2s'
                                                }}></div>
                                                <span style={{
                                                    color: selectedProductIds.includes(product.id) ? '#fff' : '#a1a1aa',
                                                    fontWeight: selectedProductIds.includes(product.id) ? 500 : 400
                                                }}>
                                                    {product.name}
                                                </span>
                                            </div>
                                            {selectedProductIds.includes(product.id) && (
                                                <div style={{
                                                    background: 'rgba(99, 102, 241, 0.2)',
                                                    padding: '4px',
                                                    borderRadius: '50%'
                                                }}>
                                                    <Check size={14} color="#818cf8" />
                                                </div>
                                            )}
                                        </div>
                                    ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};


export default CreateCategory;
