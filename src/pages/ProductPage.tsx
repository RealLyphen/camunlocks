import React, { useState, useRef, useLayoutEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaShoppingCart, FaShieldAlt, FaBolt, FaCheck, FaHeadset, FaLock, FaStar, FaTag } from 'react-icons/fa';
import { useStore, type CartItem } from '../context/StoreContext';
// CartItem type is provided via the StoreContext hook
import './ProductPage.css';
import CheckoutPopup from '../components/CheckoutPopup';

const ProductPage: React.FC = () => {
    const { slug } = useParams<{ slug: string }>();
    const navigate = useNavigate();
    const { products, categories, addToCart, applyCoupon } = useStore();

    // Find product by slug (or fallback to id)
    const product = products.find(p => p.slug === slug || p.id === slug);

    const [selectedVariant, setSelectedVariant] = useState(0);
    const [quantity, setQuantity] = useState(1);
    const [activeTab, setActiveTab] = useState('description');
    const [underlineStyle, setUnderlineStyle] = useState({ left: 0, width: 0 });
    const tabRefs = useRef<{ [key: string]: HTMLButtonElement | null }>({});
    const [selectedImage, setSelectedImage] = useState(0);

    // Coupon State
    const [showCouponPopup, setShowCouponPopup] = useState(false);
    const [couponCode, setCouponCode] = useState('');
    const [couponMessage, setCouponMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
    const [appliedDiscount, setAppliedDiscount] = useState(0);
    const [isAdded, setIsAdded] = useState(false);
    const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
    const [directBuyItem, setDirectBuyItem] = useState<CartItem | null>(null);

    useLayoutEffect(() => {
        const currentTab = tabRefs.current[activeTab];
        if (currentTab) {
            setUnderlineStyle({
                left: currentTab.offsetLeft,
                width: currentTab.clientWidth
            });
        }
    }, [activeTab]);

    // If product not found, show 404
    if (!product) {
        return (
            <div className="product-page-container" style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '4rem', marginBottom: 16 }}>🔍</div>
                    <h2 style={{ color: '#fff', fontSize: '1.5rem', marginBottom: 8 }}>Product Not Found</h2>
                    <p style={{ color: '#71717a', marginBottom: 24 }}>The product you're looking for doesn't exist.</p>
                    <button
                        onClick={() => navigate('/')}
                        style={{
                            padding: '10px 24px', borderRadius: 8,
                            background: 'var(--admin-accent-blue, var(--primary-color))',
                            color: '#fff', border: 'none', cursor: 'pointer',
                            fontWeight: 500, fontSize: '0.9rem',
                        }}
                    >
                        Back to Home
                    </button>
                </div>
            </div>
        );
    }

    // Build images array
    const allImages = product.images && product.images.length > 0
        ? product.images
        : product.imageUrl
            ? [product.imageUrl]
            : ['https://placehold.co/800x450/0a0a0c/4f68f8?text=No+Image'];

    // Build variants — use product variants if available, otherwise use price
    const variants = product.variants && product.variants.length > 0
        ? product.variants.map((v, i) => ({
            id: i,
            name: v.name,
            sub: '',
            price: v.price,
            original: v.price * 1.3,  // simulate a "was" price
        }))
        : [{ id: 0, name: product.name, sub: '', price: product.price, original: product.price * 1.3 }];

    // Get category names for this product
    const productCategories = categories.filter(c => product.categoryIds.includes(c.id));

    const currentVariant = variants[selectedVariant] || variants[0];
    const subtotal = currentVariant.price * quantity;
    const finalTotal = Math.max(0, subtotal - appliedDiscount).toFixed(2);

    const handleQuantityChange = (delta: number) => {
        setQuantity(prev => Math.max(1, prev + delta));
    };

    const handleApplyCoupon = () => {
        const subtotal = currentVariant.price * quantity;
        const result = applyCoupon(couponCode, subtotal, product?.id);
        if (result.valid) {
            setAppliedDiscount(result.discount);
            setCouponMessage({ text: result.message, type: 'success' });
            setTimeout(() => setShowCouponPopup(false), 1500);
        } else {
            setCouponMessage({ text: result.message, type: 'error' });
        }
    };

    const handleAddToCart = () => {
        const perUnitDiscount = appliedDiscount / quantity;
        const effectivePrice = appliedDiscount > 0
            ? Math.max(0, currentVariant.price - perUnitDiscount)
            : currentVariant.price;
        addToCart({
            id: selectedVariant,
            name: `${product.name} — ${currentVariant.name}`,
            price: effectivePrice,
            quantity: quantity,
            image: allImages[0],
            ...(appliedDiscount > 0 ? { originalPrice: currentVariant.price, appliedCoupon: couponCode } : {})
        });
        setIsAdded(true);
        setTimeout(() => setIsAdded(false), 2000);
    };

    return (
        <>
            <div className="product-page-container">
                <div className="product-content-wrapper">
                    {/* Left Column */}
                    <div className="product-left-col">
                        <div className="product-banner-wrapper">
                            <div className="product-banner-inner">
                                <img src={allImages[selectedImage]} alt={product.name} className="product-main-image" />
                            </div>
                        </div>

                        {allImages.length > 1 && (
                            <div className="product-gallery">
                                {allImages.map((img, idx) => (
                                    <div
                                        key={idx}
                                        className={`gallery-thumb ${selectedImage === idx ? 'active' : ''}`}
                                        onClick={() => setSelectedImage(idx)}
                                    >
                                        <img src={img} alt={`Thumbnail ${idx + 1}`} />
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="product-tabs-container">
                            <div className="tabs-nav" style={{ position: 'relative' }}>
                                <button
                                    ref={(el) => { tabRefs.current['description'] = el; }}
                                    className={`tab-trigger ${activeTab === 'description' ? 'active' : ''}`}
                                    onClick={() => setActiveTab('description')}
                                >
                                    Description
                                </button>
                                <button
                                    ref={(el) => { tabRefs.current['features'] = el; }}
                                    className={`tab-trigger ${activeTab === 'features' ? 'active' : ''}`}
                                    onClick={() => setActiveTab('features')}
                                >
                                    Features
                                </button>
                                <button
                                    ref={(el) => { tabRefs.current['requirements'] = el; }}
                                    className={`tab-trigger ${activeTab === 'requirements' ? 'active' : ''}`}
                                    onClick={() => setActiveTab('requirements')}
                                >
                                    Requirements
                                </button>
                                <div className="tab-underline" style={underlineStyle} />
                            </div>

                            <div className="tab-content">
                                {activeTab === 'description' && (
                                    <div>
                                        <p>{product.description || 'No description available.'}</p>
                                        {product.shortDescription && (
                                            <p style={{ marginTop: 12, color: '#a1a1aa', fontSize: '0.9rem' }}>{product.shortDescription}</p>
                                        )}
                                    </div>
                                )}
                                {activeTab === 'features' && (
                                    <div className="feature-list">
                                        <div className="feature-item"><FaCheck /> Premium Quality</div>
                                        <div className="feature-item"><FaCheck /> Instant Delivery</div>
                                        <div className="feature-item"><FaCheck /> 24/7 Support</div>
                                        <div className="feature-item"><FaCheck /> Safe & Secure</div>
                                        <div className="feature-item"><FaCheck /> Satisfaction Guaranteed</div>
                                    </div>
                                )}
                                {activeTab === 'requirements' && (
                                    <div>
                                        <ul style={{ listStyle: 'disc', paddingLeft: '20px', color: '#a1a1aa' }}>
                                            <li>Active game account required</li>
                                            <li>Stable Internet Connection</li>
                                            <li>Join our Discord for instructions after purchase</li>
                                        </ul>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Column (Sticky) */}
                    <div className="product-right-col">
                        <div className="purchase-card">
                            <div className="product-title-block">
                                <h1 className="product-title">{product.name}</h1>
                                <div className="product-rating">
                                    <div className="stars">
                                        <FaStar /><FaStar /><FaStar /><FaStar /><FaStar />
                                    </div>
                                    <span className="review-count">5.0 (128 Reviews)</span>
                                </div>
                                <div className="status-badges">
                                    <span className="status-badge undetected"><FaShieldAlt /> Undetected</span>
                                    <span className="status-badge instant"><FaBolt /> Instant Delivery</span>
                                </div>
                                {productCategories.length > 0 && (
                                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 8 }}>
                                        {productCategories.map(cat => (
                                            <span key={cat.id} style={{
                                                padding: '3px 10px', borderRadius: 12,
                                                background: 'rgba(79,104,248,0.12)',
                                                color: '#818cf8', fontSize: '0.72rem',
                                                border: '1px solid rgba(79,104,248,0.2)',
                                            }}>
                                                {cat.name}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="price-display">
                                <span className="current-price">${currentVariant.price.toFixed(2)}</span>
                                {currentVariant.original && (
                                    <>
                                        <span className="original-price">${currentVariant.original.toFixed(2)}</span>
                                        <span className="discount-badge">SAVE {Math.round((1 - currentVariant.price / currentVariant.original) * 100)}%</span>
                                    </>
                                )}
                            </div>

                            {variants.length > 1 && (
                                <div className="options-selector">
                                    <span className="options-label">Select Option</span>
                                    <div className="variant-options">
                                        {variants.map((v, idx) => (
                                            <div
                                                key={v.id}
                                                className={`variant-card ${selectedVariant === idx ? 'selected' : ''}`}
                                                onClick={() => setSelectedVariant(idx)}
                                            >
                                                <div className="variant-info">
                                                    <h4>{v.name}</h4>
                                                    {v.sub && <span>{v.sub}</span>}
                                                </div>
                                                <div className="variant-price">${v.price.toFixed(2)}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="options-selector">
                                <span className="options-label">Quantity</span>
                                <div className="quantity-selector">
                                    <button className="qty-btn" onClick={() => handleQuantityChange(-1)}>-</button>
                                    <span style={{ fontWeight: 'bold' }}>{quantity}</span>
                                    <button className="qty-btn" onClick={() => handleQuantityChange(1)}>+</button>
                                </div>
                            </div>

                            <div className="action-buttons">
                                <button className={`add-to-cart-btn ${isAdded ? 'added' : ''}`} onClick={handleAddToCart}>
                                    {isAdded ? <FaCheck /> : <FaShoppingCart />}
                                    {isAdded ? 'Added to Cart' : 'Add To Cart'}
                                </button>
                                <button className="buy-now-btn" onClick={() => {
                                    const perUnitDiscount = appliedDiscount / quantity;
                                    const effectivePrice = appliedDiscount > 0
                                        ? Math.max(0, currentVariant.price - perUnitDiscount)
                                        : currentVariant.price;
                                    setDirectBuyItem({
                                        id: selectedVariant,
                                        name: `${product.name} — ${currentVariant.name}`,
                                        price: effectivePrice,
                                        quantity,
                                        image: allImages[0],
                                        ...(appliedDiscount > 0 ? { originalPrice: currentVariant.price, appliedCoupon: couponCode } : {})
                                    });
                                    setIsCheckoutOpen(true);
                                }}>
                                    <FaBolt /> Buy Now - ${finalTotal}
                                </button>
                            </div>

                            <div className="coupon-section">
                                <div className="coupon-text" onClick={() => setShowCouponPopup(!showCouponPopup)}>
                                    <FaTag /> {appliedDiscount > 0 ? 'Coupon Applied' : 'Apply Coupon'}
                                </div>

                                {showCouponPopup && (
                                    <div className="coupon-popup">
                                        <div className="coupon-input-group">
                                            <input
                                                type="text"
                                                className="coupon-input"
                                                placeholder="Enter code"
                                                value={couponCode}
                                                onChange={(e) => setCouponCode(e.target.value)}
                                            />
                                            <button className="coupon-apply-btn" onClick={handleApplyCoupon}>Apply</button>
                                        </div>
                                        {couponMessage && (
                                            <div className={`coupon-message ${couponMessage.type}`}>
                                                {couponMessage.text}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            <div className="guarantee-info">
                                <div className="guarantee-item"><FaLock /> Secure Payment</div>
                                <div className="guarantee-item"><FaHeadset /> 24/7 Support</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <CheckoutPopup
                isOpen={isCheckoutOpen}
                onClose={() => { setIsCheckoutOpen(false); setDirectBuyItem(null); }}
                directItems={directBuyItem ? [directBuyItem] : undefined}
            />
        </>
    );
};

export default ProductPage;
