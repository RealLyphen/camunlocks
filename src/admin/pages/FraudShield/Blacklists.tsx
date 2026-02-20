import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, Plus, Columns, ChevronLeft, ChevronRight, Trash2, X } from 'lucide-react';
import { format } from 'date-fns';

interface BlacklistItem {
    id: number;
    value: string;
    type: 'IP' | 'Email';
    reason: string;
    time: string;
}

const Blacklists: React.FC = () => {
    const [blacklists, setBlacklists] = useState<BlacklistItem[]>([]);

    // Filtering State
    const [filterValue, setFilterValue] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [filters, setFilters] = useState({
        reason: '',
        type: '',
        time: ''
    });

    // Column Visibility State
    const [showColumns, setShowColumns] = useState(false);
    const [visibleColumns, setVisibleColumns] = useState({
        value: true,
        reason: true,
        type: true,
        time: true
    });

    // Refs for click outside handling
    const filterRef = useRef<HTMLDivElement>(null);
    const columnRef = useRef<HTMLDivElement>(null);
    const filterBtnRef = useRef<HTMLButtonElement>(null);
    const columnBtnRef = useRef<HTMLButtonElement>(null);

    // Click Outside Handling
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            // Close Filters dropdown if clicked outside
            if (showFilters &&
                filterRef.current &&
                !filterRef.current.contains(event.target as Node) &&
                filterBtnRef.current &&
                !filterBtnRef.current.contains(event.target as Node)) {
                setShowFilters(false);
            }

            // Close Columns dropdown if clicked outside
            if (showColumns &&
                columnRef.current &&
                !columnRef.current.contains(event.target as Node) &&
                columnBtnRef.current &&
                !columnBtnRef.current.contains(event.target as Node)) {
                setShowColumns(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showFilters, showColumns]);

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    useEffect(() => {
        const saved = localStorage.getItem('blacklists');
        if (saved) {
            setBlacklists(JSON.parse(saved));
        }
    }, []);

    const handleDelete = (id: number) => {
        const updated = blacklists.filter(item => item.id !== id);
        setBlacklists(updated);
        localStorage.setItem('blacklists', JSON.stringify(updated));
    };

    // Filter Logic
    const filteredBlacklists = useMemo(() => {
        return blacklists.filter(item => {
            const matchValue = item.value.toLowerCase().includes(filterValue.toLowerCase());
            const matchReason = filters.reason ? item.reason.toLowerCase().includes(filters.reason.toLowerCase()) : true;
            const matchType = filters.type ? item.type === filters.type : true;
            // Simple date match for now (YYYY-MM-DD)
            const matchTime = filters.time ? item.time.startsWith(filters.time) : true;

            return matchValue && matchReason && matchType && matchTime;
        });
    }, [blacklists, filterValue, filters]);

    // Pagination Logic
    const totalPages = Math.ceil(filteredBlacklists.length / itemsPerPage);
    const paginatedBlacklists = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return filteredBlacklists.slice(start, start + itemsPerPage);
    }, [filteredBlacklists, currentPage]);

    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
        }
    };

    const toggleColumn = (column: keyof typeof visibleColumns) => {
        setVisibleColumns(prev => ({ ...prev, [column]: !prev[column] }));
    };

    return (
        <div className="relative">
            {/* Header / Breadcrumb */}
            <div className="admin-header" style={{ marginBottom: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#a1a1aa', fontSize: '0.9rem' }}>
                    <Link to="/admin" className="hover:text-white"><HomeIcon /></Link> / Fraud Shield / <span style={{ color: '#fff' }}>Blacklists</span>
                </div>
            </div>

            {/* Toolbar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                    <div style={{ position: 'relative', width: 300 }}>
                        <Search size={18} style={{ position: 'absolute', left: 12, top: 12, color: '#71717a' }} />
                        <input
                            type="text"
                            placeholder="Filtering by Value"
                            value={filterValue}
                            onChange={(e) => setFilterValue(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '10px 10px 10px 40px',
                                background: 'rgba(255,255,255,0.03)',
                                border: '1px solid rgba(255,255,255,0.08)',
                                borderRadius: '8px',
                                color: '#fff'
                            }}
                        />
                    </div>

                    <div className="relative">
                        <button
                            ref={filterBtnRef}
                            className={`btn-secondary filter-btn ${showFilters ? 'bg-white/10' : ''}`}
                            style={{ padding: '8px 16px', fontSize: '0.9rem' }}
                            onClick={() => setShowFilters(!showFilters)}
                        >
                            <Filter size={16} style={{ marginRight: 8 }} /> Filters
                        </button>

                        {showFilters && (
                            <div ref={filterRef} className="filter-dropdown absolute top-full left-0 mt-2 w-72 bg-[#09090b] border border-white/10 rounded-xl shadow-2xl shadow-black/50 p-4 z-20">
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-[10px] font-bold text-gray-500 mb-1.5 uppercase tracking-widest">Reason</label>
                                        <input
                                            type="text"
                                            className="w-full bg-[#18181b] border border-white/5 rounded-lg px-3 py-2.5 text-sm text-gray-200 focus:border-purple-500/50 focus:bg-[#18181b] focus:ring-1 focus:ring-purple-500/50 focus:outline-none transition-all placeholder:text-gray-600"
                                            placeholder="Search reason..."
                                            value={filters.reason}
                                            onChange={(e) => setFilters({ ...filters, reason: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-gray-500 mb-1.5 uppercase tracking-widest">Type</label>
                                        <div className="relative">
                                            <select
                                                className="w-full bg-[#18181b] border border-white/5 rounded-lg px-3 py-2.5 text-sm text-gray-200 focus:border-purple-500/50 focus:bg-[#18181b] focus:ring-1 focus:ring-purple-500/50 focus:outline-none transition-all appearance-none cursor-pointer"
                                                value={filters.type}
                                                onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                                            >
                                                <option value="" className="bg-[#18181b]">All Types</option>
                                                <option value="IP" className="bg-[#18181b]">IP</option>
                                                <option value="Email" className="bg-[#18181b]">Email</option>
                                            </select>
                                            <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none text-gray-500">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-gray-500 mb-1.5 uppercase tracking-widest">Time</label>
                                        <input
                                            type="date"
                                            className="w-full bg-[#18181b] border border-white/5 rounded-lg px-3 py-2.5 text-sm text-gray-200 focus:border-purple-500/50 focus:bg-[#18181b] focus:ring-1 focus:ring-purple-500/50 focus:outline-none transition-all [color-scheme:dark]"
                                            value={filters.time}
                                            onChange={(e) => setFilters({ ...filters, time: e.target.value })}
                                        />
                                    </div>
                                    <div className="pt-3 border-t border-white/5 flex justify-end">
                                        <button
                                            className="text-xs font-medium text-red-400/80 hover:text-red-400 flex items-center gap-1.5 px-2 py-1.5 hover:bg-red-500/5 rounded-md transition-all"
                                            onClick={() => setFilters({ reason: '', type: '', time: '' })}
                                        >
                                            <X size={13} /> Clear Filters
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <Link to="/admin/fraud/blacklists/create" className="btn-primary">
                        <Plus size={16} /> Add Blacklist
                    </Link>
                </div>
            </div>

            {/* Table */}
            <div className="table-card" style={{ minHeight: 500 }}>
                <table className="data-table">
                    <thead>
                        <tr>
                            {visibleColumns.value && <th>Value</th>}
                            {visibleColumns.reason && <th>Reason</th>}
                            {visibleColumns.type && <th>Type</th>}
                            {visibleColumns.time && <th>Time</th>}
                            <th style={{ width: 50 }}></th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedBlacklists.length === 0 ? (
                            <tr>
                                <td colSpan={Object.values(visibleColumns).filter(Boolean).length + 1} style={{ textAlign: 'center', padding: 60, color: '#a1a1aa' }}>
                                    No rows to display
                                </td>
                            </tr>
                        ) : (
                            paginatedBlacklists.map(item => (
                                <tr key={item.id}>
                                    {visibleColumns.value && <td style={{ fontWeight: 500, color: '#fff' }}>{item.value}</td>}
                                    {visibleColumns.reason && <td style={{ color: '#a1a1aa' }}>{item.reason}</td>}
                                    {visibleColumns.type && (
                                        <td>
                                            <span style={{
                                                padding: '4px 8px',
                                                borderRadius: 4,
                                                background: item.type === 'IP' ? 'rgba(59, 130, 246, 0.1)' : 'rgba(139, 92, 246, 0.1)',
                                                color: item.type === 'IP' ? '#3b82f6' : 'var(--secondary-color)',
                                                fontSize: '0.8rem',
                                                fontWeight: 600
                                            }}>
                                                {item.type}
                                            </span>
                                        </td>
                                    )}
                                    {visibleColumns.time && (
                                        <td style={{ color: '#a1a1aa', fontSize: '0.9rem' }}>
                                            {format(new Date(item.time), 'MMM d, yyyy HH:mm')}
                                        </td>
                                    )}
                                    <td>
                                        <button
                                            onClick={() => handleDelete(item.id)}
                                            style={{
                                                border: 'none',
                                                width: 32,
                                                minWidth: 32,
                                                height: 32,
                                                borderRadius: 8,
                                                color: '#f87171', // lighter red
                                                background: 'rgba(239, 68, 68, 0.2)', // increased opacity
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                cursor: 'pointer',
                                                padding: 0,
                                                transition: 'background 0.2s'
                                            }}
                                            title="Delete"
                                            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.3)'}
                                            onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)'}
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 20, padding: '0 10px', color: '#a1a1aa', fontSize: '0.85rem' }}>
                    <div>Showing {paginatedBlacklists.length} of {filteredBlacklists.length} row(s).</div>
                    <div style={{ display: 'flex', gap: 10 }}>
                        <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
                            <button
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 1}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    width: 32,
                                    height: 32,
                                    padding: 0,
                                    background: 'transparent',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    borderRadius: 6,
                                    color: currentPage === 1 ? '#52525b' : '#fff',
                                    cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                                    transition: 'all 0.2s'
                                }}
                                onMouseEnter={(e) => currentPage !== 1 && (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')}
                                onMouseLeave={(e) => currentPage !== 1 && (e.currentTarget.style.background = 'transparent')}
                            >
                                <ChevronLeft size={16} />
                            </button>
                            <span style={{ padding: '0 12px', height: 32, display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.05)', borderRadius: 6, color: '#fff', fontSize: '0.85rem' }}>
                                {currentPage} Of {totalPages || 1}
                            </span>
                            <button
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage === totalPages || totalPages === 0}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    width: 32,
                                    height: 32,
                                    padding: 0,
                                    background: 'transparent',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    borderRadius: 6,
                                    color: (currentPage === totalPages || totalPages === 0) ? '#52525b' : '#fff',
                                    cursor: (currentPage === totalPages || totalPages === 0) ? 'not-allowed' : 'pointer',
                                    transition: 'all 0.2s'
                                }}
                                onMouseEnter={(e) => (currentPage !== totalPages && totalPages !== 0) && (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')}
                                onMouseLeave={(e) => (currentPage !== totalPages && totalPages !== 0) && (e.currentTarget.style.background = 'transparent')}
                            >
                                <ChevronRight size={16} />
                            </button>
                        </div>

                        <div className="relative">
                            <button
                                ref={columnBtnRef}
                                className={`btn-secondary column-btn ${showColumns ? 'bg-white/10' : ''}`}
                                style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                                onClick={() => setShowColumns(!showColumns)}
                            >
                                <Columns size={14} style={{ marginRight: 5 }} /> Columns
                            </button>

                            {showColumns && (
                                <div ref={columnRef} className="column-dropdown absolute bottom-full right-0 mb-2 w-48 bg-[#09090b] border border-white/10 rounded-xl shadow-2xl shadow-black/50 p-2 z-20">
                                    <div className="space-y-1">
                                        <label className="flex items-center gap-3 px-3 py-2 hover:bg-[#18181b] rounded-lg cursor-pointer transition-colors group">
                                            <div className="relative flex items-center">
                                                <input
                                                    type="checkbox"
                                                    checked={visibleColumns.value}
                                                    onChange={() => toggleColumn('value')}
                                                    className="peer appearance-none w-4 h-4 border border-gray-600 rounded bg-[#18181b] checked:bg-purple-600 checked:border-purple-600 focus:ring-1 focus:ring-purple-500/50 transition-all"
                                                />
                                                <svg className="absolute w-3 h-3 text-white pointer-events-none opacity-0 peer-checked:opacity-100 left-0.5 top-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                                            </div>
                                            <span className="text-sm text-gray-400 group-hover:text-gray-200 transition-colors">Value</span>
                                        </label>
                                        <label className="flex items-center gap-3 px-3 py-2 hover:bg-[#18181b] rounded-lg cursor-pointer transition-colors group">
                                            <div className="relative flex items-center">
                                                <input
                                                    type="checkbox"
                                                    checked={visibleColumns.reason}
                                                    onChange={() => toggleColumn('reason')}
                                                    className="peer appearance-none w-4 h-4 border border-gray-600 rounded bg-[#18181b] checked:bg-purple-600 checked:border-purple-600 focus:ring-1 focus:ring-purple-500/50 transition-all"
                                                />
                                                <svg className="absolute w-3 h-3 text-white pointer-events-none opacity-0 peer-checked:opacity-100 left-0.5 top-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                                            </div>
                                            <span className="text-sm text-gray-400 group-hover:text-gray-200 transition-colors">Reason</span>
                                        </label>
                                        <label className="flex items-center gap-3 px-3 py-2 hover:bg-[#18181b] rounded-lg cursor-pointer transition-colors group">
                                            <div className="relative flex items-center">
                                                <input
                                                    type="checkbox"
                                                    checked={visibleColumns.type}
                                                    onChange={() => toggleColumn('type')}
                                                    className="peer appearance-none w-4 h-4 border border-gray-600 rounded bg-[#18181b] checked:bg-purple-600 checked:border-purple-600 focus:ring-1 focus:ring-purple-500/50 transition-all"
                                                />
                                                <svg className="absolute w-3 h-3 text-white pointer-events-none opacity-0 peer-checked:opacity-100 left-0.5 top-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                                            </div>
                                            <span className="text-sm text-gray-400 group-hover:text-gray-200 transition-colors">Type</span>
                                        </label>
                                        <label className="flex items-center gap-3 px-3 py-2 hover:bg-[#18181b] rounded-lg cursor-pointer transition-colors group">
                                            <div className="relative flex items-center">
                                                <input
                                                    type="checkbox"
                                                    checked={visibleColumns.time}
                                                    onChange={() => toggleColumn('time')}
                                                    className="peer appearance-none w-4 h-4 border border-gray-600 rounded bg-[#18181b] checked:bg-purple-600 checked:border-purple-600 focus:ring-1 focus:ring-purple-500/50 transition-all"
                                                />
                                                <svg className="absolute w-3 h-3 text-white pointer-events-none opacity-0 peer-checked:opacity-100 left-0.5 top-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                                            </div>
                                            <span className="text-sm text-gray-400 group-hover:text-gray-200 transition-colors">Time</span>
                                        </label>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const HomeIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
        <polyline points="9 22 9 12 15 12 15 22"></polyline>
    </svg>
);

export default Blacklists;
