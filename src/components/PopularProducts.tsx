import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { Flame, Star } from 'lucide-react';
import './PopularProducts.css';

const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

interface PopularProps {
    config?: any;
}

const PopularProducts: React.FC<PopularProps> = ({ config }) => {
    const { settings, products, users } = useStore();
    const [activeFilter, setActiveFilter] = useState<string>('ALL');
    const scrollRef = React.useRef<HTMLDivElement>(null);

    const orders = useMemo(() => users.flatMap(u => u.orders || []), [users]);

    const scroll = (direction: 'left' | 'right') => {
        if (scrollRef.current) {
            const scrollAmount = 200;
            scrollRef.current.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth'
            });
        }
    };

    // Calculate best sellers to award badges
    const { bestSellerId, mostPopularId } = useMemo(() => {
        const sales: Record<string, number> = {};
        orders.forEach((o: any) => {
            o.items.forEach((i: any) => {
                sales[i.id] = (sales[i.id] || 0) + i.quantity;
            });
        });
        const sorted = Object.entries(sales).sort((a, b) => b[1] - a[1]);
        return {
            bestSellerId: sorted.length > 0 ? sorted[0][0] : null,
            mostPopularId: sorted.length > 1 ? sorted[1][0] : null,
        };
    }, [orders]);

    // Filter products
    const availableProducts = settings.hideSoldOutProducts
        ? products.filter((p: any) => !p.stockCap || p.stockCap > 0)
        : products;

    const filteredProducts = activeFilter === 'ALL'
        ? availableProducts
        : availableProducts.filter((product: any) => {
            if (!product.category) return false;
            // Match first letter of category with alphabet filter
            return product.category.charAt(0).toUpperCase() === activeFilter;
        });

    const displayCount = config?.count || 8;
    const finalProducts = filteredProducts.slice(0, displayCount);

    const titleString = config?.title || 'Popular Products';
    const titleWords = titleString.split(' ');
    const firstWords = titleWords.slice(0, -1).join(' ');
    const lastWord = titleWords.length > 0 ? titleWords[titleWords.length - 1] : '';

    return (
        <section className="popular-products" id="products">
            <div className="popular-products-container">
                <div className="products-header">
                    <h2 className="products-title">
                        {titleWords.length > 1 ? <>{firstWords} <span style={{ color: 'var(--primary-color)' }}>{lastWord}</span></> : titleString}
                    </h2>
                    <div className="products-count">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="3" y="3" width="7" height="7" />
                            <rect x="14" y="3" width="7" height="7" />
                            <rect x="14" y="14" width="7" height="7" />
                            <rect x="3" y="14" width="7" height="7" />
                        </svg>
                        <span>{availableProducts.length} PRODUCTS</span>
                    </div>
                </div>

                <div className="filter-container">
                    <button
                        className={`filter-btn static-filter ${activeFilter === 'ALL' ? 'active' : ''}`}
                        onClick={() => setActiveFilter('ALL')}
                    >
                        ALL PRODUCTS
                    </button>
                    <button className="scroll-arrow left" onClick={() => scroll('left')} aria-label="Scroll left">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="15 18 9 12 15 6"></polyline>
                        </svg>
                    </button>
                    <div className="filter-scroll" ref={scrollRef}>
                        {alphabet.map((letter) => (
                            <button
                                key={letter}
                                className={`filter-btn ${activeFilter === letter ? 'active' : ''}`}
                                onClick={() => setActiveFilter(letter)}
                            >
                                {letter}
                            </button>
                        ))}
                    </div>
                    <button className="scroll-arrow right" onClick={() => scroll('right')} aria-label="Scroll right">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="9 18 15 12 9 6"></polyline>
                        </svg>
                    </button>
                </div>

                <div className="products-grid">
                    {finalProducts.map((product, index) => {
                        const isBestSeller = product.id === bestSellerId;
                        const isPopular = product.id === mostPopularId;
                        return (
                            <Link
                                to={`/product/${product.id}`}
                                key={product.id}
                                className="product-card"
                                style={{ animationDelay: `${index * 0.1}s`, textDecoration: 'none', color: 'inherit', position: 'relative' }}
                            >
                                {/* Badges */}
                                {isBestSeller && (
                                    <div style={{ position: 'absolute', top: 10, left: 10, background: 'linear-gradient(135deg, #f59e0b, #d97706)', color: '#fff', padding: '4px 10px', borderRadius: 20, fontSize: '0.7rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 4, zIndex: 10, boxShadow: '0 4px 10px rgba(245, 158, 11, 0.4)' }}>
                                        <Star size={12} fill="currentColor" /> BEST SELLER
                                    </div>
                                )}
                                {!isBestSeller && isPopular && (
                                    <div style={{ position: 'absolute', top: 10, left: 10, background: 'linear-gradient(135deg, #ef4444, #b91c1c)', color: '#fff', padding: '4px 10px', borderRadius: 20, fontSize: '0.7rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 4, zIndex: 10, boxShadow: '0 4px 10px rgba(239, 68, 68, 0.4)' }}>
                                        <Flame size={12} /> POPULAR
                                    </div>
                                )}

                                <img src={product.imageUrl || '/banners/apex.png'} alt={product.name} className="product-banner" style={{ objectFit: 'cover' }} />
                                <div style={{
                                    position: 'absolute',
                                    bottom: 0,
                                    left: 0,
                                    right: 0,
                                    padding: '16px 14px',
                                    background: 'linear-gradient(transparent, rgba(0,0,0,0.95))',
                                    borderRadius: '0 0 12px 12px',
                                    fontSize: '14px',
                                    fontWeight: 700,
                                    letterSpacing: '0.5px',
                                    color: '#fff',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'flex-end'
                                }}>
                                    <span>{product.name}</span>
                                    <span style={{ fontSize: '13px', color: 'var(--primary-color, #818cf8)', fontWeight: 800 }}>${product.price?.toFixed(2) || '0.00'}</span>
                                </div>
                            </Link>
                        );
                    })}
                </div>

                {filteredProducts.length === 0 && (
                    <div className="no-products">
                        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <circle cx="12" cy="12" r="10" />
                            <line x1="12" y1="8" x2="12" y2="12" />
                            <line x1="12" y1="16" x2="12.01" y2="16" />
                        </svg>
                        <p>No products found for letter "{activeFilter}"</p>
                    </div>
                )}
            </div>
        </section>
    );
};

export default PopularProducts;
