import React, { useState, useEffect, useRef } from 'react';
import { useStore } from '../context/StoreContext';
import './Status.css';

const Status: React.FC = () => {
    const { gameStatuses } = useStore();
    const statusData = gameStatuses;

    const [isLoading, setIsLoading] = useState(true);
    const [activeFilter, setActiveFilter] = useState('ALL');
    const [currentDate, setCurrentDate] = useState('');
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Simulate loading
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 1500);

        // Set date
        const date = new Date();
        const options: Intl.DateTimeFormatOptions = {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            timeZoneName: 'short'
        };
        setCurrentDate(date.toLocaleString('en-US', options));

        return () => clearTimeout(timer);
    }, []);

    const scroll = (direction: 'left' | 'right') => {
        if (scrollContainerRef.current) {
            const scrollAmount = 300;
            if (direction === 'left') {
                scrollContainerRef.current.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
            } else {
                scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
            }
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'UNDETECTED': return '#10B981'; // Green
            case 'UPDATING': return '#3B82F6';   // Blue
            case 'RISKY': return '#F59E0B';      // Amber
            case 'DOWN': return '#EF4444';       // Red
            case 'TESTING': return 'var(--secondary-color)';    // Purple
            case 'OFFLINE': return '#6B7280';    // Gray
            default: return '#9CA3AF';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'UNDETECTED': return (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
            );
            case 'UPDATING': return (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M23 4v6h-6"></path>
                    <path d="M1 20v-6h6"></path>
                    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
                </svg>
            );
            case 'RISKY': return (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                    <line x1="12" y1="9" x2="12" y2="13"></line>
                    <line x1="12" y1="17" x2="12.01" y2="17"></line>
                </svg>
            );
            case 'DOWN': return (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="15" y1="9" x2="9" y2="15"></line>
                    <line x1="9" y1="9" x2="15" y2="15"></line>
                </svg>
            );
            case 'TESTING': return (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M2 12h20"></path>
                    <path d="M12 2v20"></path>
                </svg>
            );
            case 'OFFLINE': return (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                </svg>
            );
            default: return null;
        }
    };

    const filteredData = activeFilter === 'ALL'
        ? statusData
        : statusData.filter(group => group.game === activeFilter);

    const filterOptions = ['ALL', ...statusData.map(g => g.game)];

    return (
        <section className="status-page">
            <div className="status-container">

                {/* Header Section */}
                <div className="status-header-section">
                    <h1 className="status-main-title">STATUS</h1>
                    <p className="status-subtitle">
                        <span className="live-dot"></span> Live status of all our gaming enhancements and cheats.
                    </p>
                </div>

                {/* Status Legend */}
                <div className="status-legend">
                    <div className="legend-item undetect" style={{ borderColor: 'rgba(16, 185, 129, 0.5)' }}>
                        <div className="legend-badge" style={{ backgroundColor: '#10B981', color: '#000' }}>
                            {getStatusIcon('UNDETECTED')} UNDETECTED
                        </div>
                        <span className="legend-desc">Fully operational and safe to use</span>
                    </div>
                    <div className="legend-item update" style={{ borderColor: 'rgba(59, 130, 246, 0.5)' }}>
                        <div className="legend-badge" style={{ backgroundColor: '#3B82F6', color: '#000' }}>
                            {getStatusIcon('UPDATING')} UPDATING
                        </div>
                        <span className="legend-desc">Currently being updated for latest patch</span>
                    </div>
                    <div className="legend-item risk" style={{ borderColor: 'rgba(245, 158, 11, 0.5)' }}>
                        <div className="legend-badge" style={{ backgroundColor: '#F59E0B', color: '#000' }}>
                            {getStatusIcon('RISKY')} RISKY
                        </div>
                        <span className="legend-desc">Use with caution - potential detection risk</span>
                    </div>
                    <div className="legend-item down" style={{ borderColor: 'rgba(239, 68, 68, 0.5)' }}>
                        <div className="legend-badge" style={{ backgroundColor: '#EF4444', color: '#000' }}>
                            {getStatusIcon('DOWN')} DOWN
                        </div>
                        <span className="legend-desc">Temporarily unavailable or detected</span>
                    </div>
                </div>

                {/* Filter Menu */}
                <div className="status-filter-container">
                    <button className="filter-arrow left" onClick={() => scroll('left')}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="url(#arrowGradientLeft)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <defs>
                                <linearGradient id="arrowGradientLeft" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stopColor="#0D64FF" />
                                    <stop offset="100%" stopColor="#6B5CE5" />
                                </linearGradient>
                            </defs>
                            <polyline points="15 18 9 12 15 6"></polyline>
                        </svg>
                    </button>

                    <div className="filter-scroll-area" ref={scrollContainerRef}>
                        {filterOptions.map((filter, index) => (
                            <button
                                key={index}
                                className={`filter-btn ${activeFilter === filter ? 'active' : ''}`}
                                onClick={() => setActiveFilter(filter)}
                            >
                                {filter.toUpperCase()}
                            </button>
                        ))}
                    </div>

                    <button className="filter-arrow right" onClick={() => scroll('right')}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="url(#arrowGradientRight)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <defs>
                                <linearGradient id="arrowGradientRight" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stopColor="#0D64FF" />
                                    <stop offset="100%" stopColor="#6B5CE5" />
                                </linearGradient>
                            </defs>
                            <polyline points="9 18 15 12 9 6"></polyline>
                        </svg>
                    </button>
                </div>

                {/* Content Area */}
                <div className="status-content">
                    {isLoading ? (
                        <div className="status-preloader-inline">
                            <div className="loader-content">
                                <div className="spinner"></div>
                                <p>Loading cheats status...</p>
                            </div>
                        </div>
                    ) : (
                        <div className="games-list-container">
                            {filteredData.map((group, index) => (
                                <div key={index} className="game-status-group">
                                    <div className="game-header">
                                        <h2 className="game-title">{group.game}</h2>
                                    </div>
                                    <div className="product-list">
                                        {group.products.map((product, pIndex) => (
                                            <div key={pIndex} className="product-item">
                                                <div className="product-info-col name-col">
                                                    <h4 className="product-name">{product.name}</h4>
                                                </div>

                                                <div className="product-info-col details-col">
                                                    {product.details.map((detail, dIndex) => (
                                                        <div key={dIndex} className="product-detail">
                                                            <span className="detail-label">{detail.label}</span>
                                                            <span className="detail-value">{detail.value}</span>
                                                        </div>
                                                    ))}
                                                </div>

                                                <div className="product-info-col status-col">
                                                    <span
                                                        className="status-badge"
                                                        style={{
                                                            backgroundColor: getStatusColor(product.status),
                                                            color: '#fff',
                                                            boxShadow: `0 0 8px ${getStatusColor(product.status)}55`
                                                        }}
                                                    >
                                                        {getStatusIcon(product.status)}
                                                        {product.status}
                                                    </span>
                                                </div>

                                                <div className="product-info-col action-col">
                                                    <button className="btn-purchase">
                                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                            <circle cx="9" cy="21" r="1"></circle>
                                                            <circle cx="20" cy="21" r="1"></circle>
                                                            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                                                        </svg>
                                                        PURCHASE NOW
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer Timestamp */}
                {!isLoading && (
                    <div className="status-footer">
                        <p>Last updated: <span className="status-date">{currentDate}</span></p>
                    </div>
                )}
            </div>
        </section>
    );
};

export default Status;
