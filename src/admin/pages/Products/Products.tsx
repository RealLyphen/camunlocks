import React, { useState, useMemo } from 'react';
import { useStore } from '../../../context/StoreContext';
import { Link } from 'react-router-dom';
import { Plus, Search, Edit2, Trash2, Package } from 'lucide-react';

const Products: React.FC = () => {
    const { products, categories, deleteProduct } = useStore();
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const itemsPerPage = 8;

    const filteredProducts = useMemo(() => {
        return products.filter(p =>
            p.name.toLowerCase().includes(search.toLowerCase()) ||
            p.description.toLowerCase().includes(search.toLowerCase())
        );
    }, [products, search]);

    const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
    const displayedProducts = filteredProducts.slice(
        (page - 1) * itemsPerPage,
        page * itemsPerPage
    );

    const getCategoryName = (catId: string) => {
        const cat = categories.find(c => c.id === catId);
        return cat ? cat.name : 'Unknown';
    };

    return (
        <div className="relative">
            {/* Header */}
            <div className="admin-header">
                <div className="welcome-text">
                    <h1>Products</h1>
                    <p>Manage your digital products and listings</p>
                </div>
                <Link to="/admin/products/create" className="btn-primary">
                    <Plus size={18} /> Add Product
                </Link>
            </div>

            {/* Toolbar */}
            <div className="table-card" style={{ padding: '16px 24px', marginBottom: 24 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ position: 'relative', width: 380 }}>
                        <Search
                            size={18}
                            style={{
                                position: 'absolute', left: 12, top: '50%',
                                transform: 'translateY(-50%)', color: '#71717a',
                                pointerEvents: 'none',
                            }}
                        />
                        <input
                            type="text"
                            placeholder="Search products..."
                            className="admin-input"
                            style={{ paddingLeft: 40 }}
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {/* Data Table */}
            <div className="table-card" style={{ padding: 0, overflow: 'hidden' }}>
                <table className="data-table">
                    <thead>
                        <tr>
                            <th style={{ paddingLeft: 24 }}>Product Name</th>
                            <th>Price</th>
                            <th>Categories</th>
                            <th>Created</th>
                            <th style={{ paddingRight: 24, textAlign: 'right' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {displayedProducts.length > 0 ? (
                            displayedProducts.map((product) => (
                                <tr key={product.id} style={{ transition: 'background 0.2s' }}
                                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.03)')}
                                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                                >
                                    <td style={{ paddingLeft: 24 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                            <div style={{
                                                width: 40, height: 40, borderRadius: 8,
                                                background: '#27272a',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                color: '#71717a', flexShrink: 0,
                                            }}>
                                                <Package size={20} />
                                            </div>
                                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                <span style={{ fontWeight: 500, color: '#fff' }}>{product.name}</span>
                                                <span style={{
                                                    fontSize: '0.75rem', color: '#71717a',
                                                    overflow: 'hidden', textOverflow: 'ellipsis',
                                                    whiteSpace: 'nowrap', maxWidth: 200,
                                                }}>
                                                    {product.description}
                                                </span>
                                            </div>
                                        </div>
                                    </td>
                                    <td style={{ fontWeight: 500, color: '#4ade80' }}>
                                        ${product.price.toFixed(2)}
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                                            {product.categoryIds.length > 0 ? product.categoryIds.slice(0, 2).map(catId => (
                                                <span key={catId} style={{
                                                    padding: '2px 10px', borderRadius: 20,
                                                    background: 'rgba(99,102,241,0.1)',
                                                    color: '#818cf8', fontSize: '0.75rem',
                                                    border: '1px solid rgba(99,102,241,0.2)',
                                                }}>
                                                    {getCategoryName(catId)}
                                                </span>
                                            )) : (
                                                <span style={{ color: '#52525b', fontSize: '0.75rem' }}>Uncategorized</span>
                                            )}
                                            {product.categoryIds.length > 2 && (
                                                <span style={{
                                                    padding: '2px 10px', borderRadius: 20,
                                                    background: '#27272a', color: '#71717a',
                                                    fontSize: '0.75rem',
                                                }}>
                                                    +{product.categoryIds.length - 2}
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td style={{ color: '#71717a', fontSize: '0.875rem' }}>
                                        {new Date(product.createdAt).toLocaleDateString()}
                                    </td>
                                    <td style={{ paddingRight: 24 }}>
                                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                                            <Link
                                                to={`/admin/products/edit/${product.id}`}
                                                style={{
                                                    padding: 8, borderRadius: 8, color: '#a1a1aa',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    transition: 'all 0.2s', textDecoration: 'none',
                                                }}
                                                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = '#fff'; }}
                                                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#a1a1aa'; }}
                                            >
                                                <Edit2 size={16} />
                                            </Link>
                                            <button
                                                onClick={() => {
                                                    if (confirm('Are you sure you want to delete this product?')) {
                                                        deleteProduct(product.id);
                                                    }
                                                }}
                                                style={{
                                                    padding: 8, borderRadius: 8, color: '#a1a1aa',
                                                    background: 'transparent', border: 'none', cursor: 'pointer',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    transition: 'all 0.2s',
                                                }}
                                                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.1)'; e.currentTarget.style.color = '#f87171'; }}
                                                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#a1a1aa'; }}
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={5} style={{ padding: '48px 0', textAlign: 'center' }}>
                                    <div style={{
                                        display: 'flex', flexDirection: 'column',
                                        alignItems: 'center', justifyContent: 'center',
                                        color: '#71717a', gap: 12,
                                    }}>
                                        <div style={{
                                            width: 64, height: 64, borderRadius: '50%',
                                            background: 'rgba(255,255,255,0.04)',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        }}>
                                            <Search size={32} style={{ opacity: 0.5 }} />
                                        </div>
                                        <p>No products found matching "{search}"</p>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div style={{
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        padding: '16px 24px',
                        borderTop: '1px solid rgba(255,255,255,0.05)',
                        background: 'rgba(255,255,255,0.01)',
                    }}>
                        <div style={{ fontSize: '0.875rem', color: '#71717a' }}>
                            Showing {((page - 1) * itemsPerPage) + 1} to {Math.min(page * itemsPerPage, filteredProducts.length)} of {filteredProducts.length} results
                        </div>
                        <div style={{ display: 'flex', gap: 8 }}>
                            <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                                style={{
                                    padding: '6px 14px', borderRadius: 8,
                                    background: 'rgba(255,255,255,0.05)',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    fontSize: '0.875rem', color: '#a1a1aa',
                                    cursor: page === 1 ? 'not-allowed' : 'pointer',
                                    opacity: page === 1 ? 0.5 : 1,
                                    transition: 'all 0.2s',
                                }}
                            >
                                Previous
                            </button>
                            <button
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages}
                                style={{
                                    padding: '6px 14px', borderRadius: 8,
                                    background: 'rgba(255,255,255,0.05)',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    fontSize: '0.875rem', color: '#a1a1aa',
                                    cursor: page === totalPages ? 'not-allowed' : 'pointer',
                                    opacity: page === totalPages ? 0.5 : 1,
                                    transition: 'all 0.2s',
                                }}
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Products;
