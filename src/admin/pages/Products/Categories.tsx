
import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../../../context/StoreContext';
import { Search, Plus, Trash2, Edit2, ChevronLeft, ChevronRight, Package } from 'lucide-react';
import { format } from 'date-fns';

const Categories: React.FC = () => {
    const { categories, products, deleteCategory } = useStore();
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Filter Logic
    const filteredCategories = useMemo(() => {
        return categories.filter(category =>
            category.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [categories, searchTerm]);

    // Pagination Logic
    const totalPages = Math.ceil(filteredCategories.length / itemsPerPage);
    const paginatedCategories = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return filteredCategories.slice(start, start + itemsPerPage);
    }, [filteredCategories, currentPage]);

    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
        }
    };

    const getProductCount = (categoryId: string) => {
        if (categoryId === 'all') return products.length;
        return products.filter(p => p.categoryIds.includes(categoryId)).length;
    };

    return (
        <div className="relative">
            {/* Header / Breadcrumb */}
            <div className="admin-header">
                <div className="welcome-text">
                    <h1>Categories</h1>
                    <p>Manage your product categories and organization</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#a1a1aa', fontSize: '0.9rem' }}>
                    <span className="hover:text-white cursor-pointer">Products</span> / <span style={{ color: '#fff' }}>Categories</span>
                </div>
            </div>

            {/* Toolbar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                    <div style={{ position: 'relative', width: 300 }}>
                        <Search size={18} style={{ position: 'absolute', left: 12, top: 12, color: '#71717a' }} />
                        <input
                            type="text"
                            placeholder="Search categories..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="admin-input"
                            style={{ paddingLeft: 40 }}
                        />
                    </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <Link to="/admin/products/categories/create" className="btn-primary">
                        <Plus size={16} /> Create Category
                    </Link>
                </div>
            </div>

            {/* Table */}
            <div className="table-card" style={{ minHeight: 500 }}>
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Products</th>
                            <th>Created At</th>
                            <th style={{ width: 100, textAlign: 'right' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedCategories.length === 0 ? (
                            <tr>
                                <td colSpan={4} style={{ textAlign: 'center', padding: 60, color: '#a1a1aa' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
                                        <Package size={40} style={{ opacity: 0.5 }} />
                                        <div>No categories found</div>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            paginatedCategories.map(category => (
                                <tr key={category.id}>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                            <div style={{
                                                width: 32, height: 32, borderRadius: 8,
                                                background: 'rgba(255,255,255,0.05)',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                color: '#a1a1aa'
                                            }}>
                                                <Package size={16} />
                                            </div>
                                            <span style={{ fontWeight: 500, color: '#fff' }}>{category.name}</span>
                                        </div>
                                    </td>
                                    <td style={{ color: '#a1a1aa' }}>
                                        {getProductCount(category.id)} Products
                                    </td>
                                    <td style={{ color: '#a1a1aa', fontSize: '0.9rem' }}>
                                        {format(new Date(category.createdAt), 'MMM d, yyyy')}
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                                            {category.id !== 'all' && (
                                                <>
                                                    <button
                                                        className="icon-btn"
                                                        title="Edit"
                                                    >
                                                        <Edit2 size={16} />
                                                    </button>
                                                    <button
                                                        className="icon-btn"
                                                        style={{ color: '#f87171', borderColor: 'rgba(248, 113, 113, 0.2)', background: 'rgba(248, 113, 113, 0.1)' }}
                                                        onClick={() => deleteCategory(category.id)}
                                                        title="Delete"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>

                {/* Pagination */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 20, padding: '0 10px', color: '#a1a1aa', fontSize: '0.85rem' }}>
                    <div>Showing {paginatedCategories.length} of {filteredCategories.length} row(s).</div>
                    <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
                        <button
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="icon-btn"
                            style={{ opacity: currentPage === 1 ? 0.5 : 1, cursor: currentPage === 1 ? 'not-allowed' : 'pointer' }}
                        >
                            <ChevronLeft size={16} />
                        </button>
                        <span style={{ padding: '0 12px', height: 32, display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.05)', borderRadius: 6, color: '#fff', fontSize: '0.85rem' }}>
                            {currentPage} / {totalPages || 1}
                        </span>
                        <button
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages || totalPages === 0}
                            className="icon-btn"
                            style={{ opacity: (currentPage === totalPages || totalPages === 0) ? 0.5 : 1, cursor: (currentPage === totalPages || totalPages === 0) ? 'not-allowed' : 'pointer' }}
                        >
                            <ChevronRight size={16} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Categories;
