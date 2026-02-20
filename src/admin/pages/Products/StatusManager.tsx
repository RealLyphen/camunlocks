import React, { useState } from 'react';
import { useStore, type GameStatusProduct } from '../../../context/StoreContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search, Plus, Trash2, ChevronDown, ChevronRight, Edit3, Save, X, Gamepad2,
    Shield, AlertTriangle, RefreshCw, XCircle, FlaskConical, WifiOff, Activity
} from 'lucide-react';

type StatusType = GameStatusProduct['status'];

const STATUS_OPTIONS: { value: StatusType; label: string; color: string; icon: React.ReactNode }[] = [
    { value: 'UNDETECTED', label: 'Undetected', color: '#10B981', icon: <Shield size={14} /> },
    { value: 'UPDATING', label: 'Updating', color: '#3B82F6', icon: <RefreshCw size={14} /> },
    { value: 'RISKY', label: 'Risky', color: '#F59E0B', icon: <AlertTriangle size={14} /> },
    { value: 'DOWN', label: 'Down', color: '#EF4444', icon: <XCircle size={14} /> },
    { value: 'TESTING', label: 'Testing', color: 'var(--secondary-color)', icon: <FlaskConical size={14} /> },
    { value: 'OFFLINE', label: 'Offline', color: '#6B7280', icon: <WifiOff size={14} /> },
];

const getStatusColor = (status: string) => {
    return STATUS_OPTIONS.find(s => s.value === status)?.color || '#9CA3AF';
};

const StatusManager: React.FC = () => {
    const {
        gameStatuses, addGameStatus, updateGameStatus, deleteGameStatus,
        addServiceToGame, updateServiceInGame, deleteServiceFromGame
    } = useStore();

    const [search, setSearch] = useState('');
    const [expandedGames, setExpandedGames] = useState<Set<string>>(new Set());
    const [editingGameId, setEditingGameId] = useState<string | null>(null);
    const [editGameName, setEditGameName] = useState('');

    // Add game modal
    const [showAddGame, setShowAddGame] = useState(false);
    const [newGameName, setNewGameName] = useState('');

    // Add service state
    const [addingServiceTo, setAddingServiceTo] = useState<string | null>(null);
    const [newServiceName, setNewServiceName] = useState('');
    const [newServiceStatus, setNewServiceStatus] = useState<StatusType>('UNDETECTED');
    const [newServiceDetail, setNewServiceDetail] = useState('Release');

    // Inline edit service
    const [editingService, setEditingService] = useState<{ gameId: string; index: number } | null>(null);
    const [editServiceName, setEditServiceName] = useState('');
    const [editServiceStatus, setEditServiceStatus] = useState<StatusType>('UNDETECTED');
    const [editServiceDetail, setEditServiceDetail] = useState('');

    const filteredGames = gameStatuses.filter(g =>
        g.game.toLowerCase().includes(search.toLowerCase()) ||
        g.products.some(p => p.name.toLowerCase().includes(search.toLowerCase()))
    );

    const totalServices = gameStatuses.reduce((sum, g) => sum + g.products.length, 0);
    const statusCounts = gameStatuses.reduce((acc, g) => {
        g.products.forEach(p => {
            acc[p.status] = (acc[p.status] || 0) + 1;
        });
        return acc;
    }, {} as Record<string, number>);

    const toggleExpand = (id: string) => {
        setExpandedGames(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const handleAddGame = () => {
        if (!newGameName.trim()) return;
        addGameStatus(newGameName.trim());
        setNewGameName('');
        setShowAddGame(false);
    };

    const handleDeleteGame = (id: string) => {
        if (confirm('Delete this game and all its services?')) {
            deleteGameStatus(id);
        }
    };

    const handleSaveGameName = (id: string) => {
        if (editGameName.trim()) {
            updateGameStatus(id, { game: editGameName.trim() });
        }
        setEditingGameId(null);
    };

    const handleAddService = (gameId: string) => {
        if (!newServiceName.trim()) return;
        addServiceToGame(gameId, {
            name: newServiceName.trim(),
            status: newServiceStatus,
            details: [{ label: 'Undetected Since', value: newServiceDetail || 'Release' }]
        });
        setNewServiceName('');
        setNewServiceStatus('UNDETECTED');
        setNewServiceDetail('Release');
        setAddingServiceTo(null);
    };

    const handleStartEditService = (gameId: string, index: number, service: GameStatusProduct) => {
        setEditingService({ gameId, index });
        setEditServiceName(service.name);
        setEditServiceStatus(service.status);
        setEditServiceDetail(service.details[0]?.value || '');
    };

    const handleSaveService = () => {
        if (!editingService || !editServiceName.trim()) return;
        updateServiceInGame(editingService.gameId, editingService.index, {
            name: editServiceName.trim(),
            status: editServiceStatus,
            details: [{ label: 'Undetected Since', value: editServiceDetail || 'Release' }]
        });
        setEditingService(null);
    };

    const handleDeleteService = (gameId: string, index: number) => {
        deleteServiceFromGame(gameId, index);
    };

    const handleQuickStatusChange = (gameId: string, serviceIndex: number, newStatus: StatusType) => {
        updateServiceInGame(gameId, serviceIndex, { status: newStatus });
    };

    return (
        <div style={{ padding: '30px', maxWidth: 1400, margin: '0 auto' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 30 }}>
                <div>
                    <h1 style={{ fontSize: '2rem', fontWeight: 700, color: '#fff', margin: 0 }}>Game Status</h1>
                    <p style={{ color: '#a1a1aa', margin: '6px 0 0', fontSize: '0.95rem' }}>Manage game services and their detection status</p>
                </div>
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowAddGame(true)}
                    style={{
                        background: 'linear-gradient(135deg, var(--primary-color), #6c5ce7)',
                        color: '#fff',
                        border: 'none',
                        borderRadius: 10,
                        padding: '12px 24px',
                        fontSize: '0.9rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8
                    }}
                >
                    <Plus size={18} /> Add Game
                </motion.button>
            </div>

            {/* Stats Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 28 }}>
                <div style={{
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.06)',
                    borderRadius: 14,
                    padding: '20px 22px',
                }}>
                    <div style={{ fontSize: '0.75rem', color: '#a1a1aa', textTransform: 'uppercase', letterSpacing: 1, fontWeight: 600, marginBottom: 8 }}>Total Games</div>
                    <div style={{ fontSize: '1.8rem', fontWeight: 700, color: '#fff' }}>{gameStatuses.length}</div>
                </div>
                <div style={{
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.06)',
                    borderRadius: 14,
                    padding: '20px 22px',
                }}>
                    <div style={{ fontSize: '0.75rem', color: '#a1a1aa', textTransform: 'uppercase', letterSpacing: 1, fontWeight: 600, marginBottom: 8 }}>Total Services</div>
                    <div style={{ fontSize: '1.8rem', fontWeight: 700, color: '#818cf8' }}>{totalServices}</div>
                </div>
                {STATUS_OPTIONS.slice(0, 4).map(s => (
                    <div key={s.value} style={{
                        background: 'rgba(255,255,255,0.03)',
                        border: `1px solid ${s.color}22`,
                        borderRadius: 14,
                        padding: '20px 22px',
                    }}>
                        <div style={{ fontSize: '0.75rem', color: '#a1a1aa', textTransform: 'uppercase', letterSpacing: 1, fontWeight: 600, marginBottom: 8 }}>{s.label}</div>
                        <div style={{ fontSize: '1.8rem', fontWeight: 700, color: s.color }}>{statusCounts[s.value] || 0}</div>
                    </div>
                ))}
            </div>

            {/* Search */}
            <div style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: 12,
                padding: '14px 20px',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                marginBottom: 24
            }}>
                <Search size={18} style={{ color: '#71717a' }} />
                <input
                    type="text"
                    placeholder="Search by game or service name..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    style={{
                        background: 'transparent',
                        border: 'none',
                        outline: 'none',
                        color: '#fff',
                        fontSize: '0.9rem',
                        flex: 1,
                        fontFamily: 'inherit'
                    }}
                />
                <span style={{ color: '#52525b', fontSize: '0.82rem' }}>{filteredGames.length} games</span>
            </div>

            {/* Add Game Modal */}
            <AnimatePresence>
                {showAddGame && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        style={{
                            background: 'rgba(15, 15, 25, 0.95)',
                            border: '1px solid rgba(79, 104, 248, 0.2)',
                            borderRadius: 14,
                            padding: 24,
                            marginBottom: 24,
                            backdropFilter: 'blur(20px)',
                        }}
                    >
                        <h3 style={{ color: '#fff', margin: '0 0 16px', fontSize: '1rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
                            <Gamepad2 size={18} style={{ color: '#818cf8' }} /> Add New Game
                        </h3>
                        <div style={{ display: 'flex', gap: 12 }}>
                            <input
                                type="text"
                                placeholder="Game title (e.g. Valorant, Apex Legends)"
                                value={newGameName}
                                onChange={(e) => setNewGameName(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleAddGame()}
                                autoFocus
                                style={{
                                    flex: 1,
                                    background: 'rgba(255,255,255,0.05)',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    borderRadius: 8,
                                    padding: '10px 14px',
                                    color: '#fff',
                                    fontSize: '0.9rem',
                                    outline: 'none',
                                    fontFamily: 'inherit',
                                }}
                            />
                            <button
                                onClick={handleAddGame}
                                style={{
                                    background: 'linear-gradient(135deg, var(--primary-color), #6c5ce7)',
                                    color: '#fff',
                                    border: 'none',
                                    borderRadius: 8,
                                    padding: '10px 20px',
                                    cursor: 'pointer',
                                    fontWeight: 600,
                                    fontSize: '0.85rem',
                                    fontFamily: 'inherit',
                                }}
                            >
                                Add Game
                            </button>
                            <button
                                onClick={() => { setShowAddGame(false); setNewGameName(''); }}
                                style={{
                                    background: 'rgba(255,255,255,0.05)',
                                    color: '#a1a1aa',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    borderRadius: 8,
                                    padding: '10px 16px',
                                    cursor: 'pointer',
                                    fontSize: '0.85rem',
                                    fontFamily: 'inherit',
                                }}
                            >
                                Cancel
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Game Groups */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {filteredGames.map((group) => {
                    const isExpanded = expandedGames.has(group.id);
                    const isEditingName = editingGameId === group.id;

                    return (
                        <motion.div
                            key={group.id}
                            layout
                            style={{
                                background: 'rgba(255,255,255,0.02)',
                                border: `1px solid ${isExpanded ? 'rgba(79, 104, 248, 0.15)' : 'rgba(255,255,255,0.05)'}`,
                                borderRadius: 14,
                                overflow: 'hidden',
                                transition: 'border-color 0.3s',
                            }}
                        >
                            {/* Game Header */}
                            <div
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    padding: '16px 20px',
                                    cursor: 'pointer',
                                    gap: 12,
                                }}
                                onClick={() => !isEditingName && toggleExpand(group.id)}
                            >
                                <div style={{ color: '#71717a', transition: 'transform 0.2s', transform: isExpanded ? 'rotate(0deg)' : 'rotate(0deg)' }}>
                                    {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                                </div>

                                <Gamepad2 size={18} style={{ color: '#818cf8' }} />

                                {isEditingName ? (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1 }} onClick={(e) => e.stopPropagation()}>
                                        <input
                                            type="text"
                                            value={editGameName}
                                            onChange={(e) => setEditGameName(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && handleSaveGameName(group.id)}
                                            autoFocus
                                            style={{
                                                background: 'rgba(255,255,255,0.05)',
                                                border: '1px solid rgba(79, 104, 248, 0.3)',
                                                borderRadius: 6,
                                                padding: '4px 10px',
                                                color: '#fff',
                                                fontSize: '0.95rem',
                                                fontWeight: 600,
                                                outline: 'none',
                                                fontFamily: 'inherit',
                                            }}
                                        />
                                        <button onClick={() => handleSaveGameName(group.id)} style={{ background: 'none', border: 'none', color: '#10B981', cursor: 'pointer', padding: 4 }}><Save size={16} /></button>
                                        <button onClick={() => setEditingGameId(null)} style={{ background: 'none', border: 'none', color: '#71717a', cursor: 'pointer', padding: 4 }}><X size={16} /></button>
                                    </div>
                                ) : (
                                    <span style={{ flex: 1, color: '#fff', fontSize: '0.95rem', fontWeight: 600 }}>{group.game}</span>
                                )}

                                {/* Status summary pills */}
                                <div style={{ display: 'flex', gap: 6, marginRight: 8 }}>
                                    {Object.entries(
                                        group.products.reduce((acc, p) => {
                                            acc[p.status] = (acc[p.status] || 0) + 1;
                                            return acc;
                                        }, {} as Record<string, number>)
                                    ).map(([status, count]) => (
                                        <span key={status} style={{
                                            background: `${getStatusColor(status)}18`,
                                            color: getStatusColor(status),
                                            fontSize: '0.7rem',
                                            fontWeight: 600,
                                            padding: '2px 8px',
                                            borderRadius: 20,
                                            border: `1px solid ${getStatusColor(status)}33`,
                                        }}>
                                            {count} {status.charAt(0) + status.slice(1).toLowerCase()}
                                        </span>
                                    ))}
                                </div>

                                <span style={{ color: '#52525b', fontSize: '0.8rem' }}>{group.products.length} service{group.products.length !== 1 ? 's' : ''}</span>

                                {/* Edit / Delete game */}
                                <div style={{ display: 'flex', gap: 4 }} onClick={(e) => e.stopPropagation()}>
                                    <button
                                        onClick={() => { setEditingGameId(group.id); setEditGameName(group.game); }}
                                        style={{ background: 'none', border: 'none', color: '#71717a', cursor: 'pointer', padding: 6, borderRadius: 6 }}
                                        title="Edit game name"
                                    >
                                        <Edit3 size={15} />
                                    </button>
                                    <button
                                        onClick={() => handleDeleteGame(group.id)}
                                        style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: 6, borderRadius: 6 }}
                                        title="Delete game"
                                    >
                                        <Trash2 size={15} />
                                    </button>
                                </div>
                            </div>

                            {/* Expanded Services */}
                            <AnimatePresence>
                                {isExpanded && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.2 }}
                                        style={{ overflow: 'hidden' }}
                                    >
                                        <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', padding: '0 20px 16px' }}>
                                            {/* Service Header Row */}
                                            <div style={{
                                                display: 'grid',
                                                gridTemplateColumns: '1fr 160px 150px 80px',
                                                gap: 12,
                                                padding: '12px 0 8px',
                                                borderBottom: '1px solid rgba(255,255,255,0.04)',
                                            }}>
                                                <span style={{ fontSize: '0.7rem', color: '#52525b', textTransform: 'uppercase', letterSpacing: 1, fontWeight: 600 }}>Service Name</span>
                                                <span style={{ fontSize: '0.7rem', color: '#52525b', textTransform: 'uppercase', letterSpacing: 1, fontWeight: 600 }}>Status</span>
                                                <span style={{ fontSize: '0.7rem', color: '#52525b', textTransform: 'uppercase', letterSpacing: 1, fontWeight: 600 }}>Since</span>
                                                <span style={{ fontSize: '0.7rem', color: '#52525b', textTransform: 'uppercase', letterSpacing: 1, fontWeight: 600, textAlign: 'right' }}>Actions</span>
                                            </div>

                                            {/* Service Rows */}
                                            {group.products.map((service, sIdx) => {
                                                const isEditing = editingService?.gameId === group.id && editingService?.index === sIdx;

                                                return (
                                                    <div
                                                        key={sIdx}
                                                        style={{
                                                            display: 'grid',
                                                            gridTemplateColumns: '1fr 160px 150px 80px',
                                                            gap: 12,
                                                            alignItems: 'center',
                                                            padding: '10px 0',
                                                            borderBottom: '1px solid rgba(255,255,255,0.03)',
                                                        }}
                                                    >
                                                        {isEditing ? (
                                                            <>
                                                                <input
                                                                    type="text"
                                                                    value={editServiceName}
                                                                    onChange={(e) => setEditServiceName(e.target.value)}
                                                                    style={{
                                                                        background: 'rgba(255,255,255,0.05)',
                                                                        border: '1px solid rgba(79, 104, 248, 0.3)',
                                                                        borderRadius: 6,
                                                                        padding: '6px 10px',
                                                                        color: '#fff',
                                                                        fontSize: '0.85rem',
                                                                        outline: 'none',
                                                                        fontFamily: 'inherit',
                                                                    }}
                                                                />
                                                                <select
                                                                    value={editServiceStatus}
                                                                    onChange={(e) => setEditServiceStatus(e.target.value as StatusType)}
                                                                    style={{
                                                                        background: 'rgba(255,255,255,0.05)',
                                                                        border: '1px solid rgba(255,255,255,0.1)',
                                                                        borderRadius: 6,
                                                                        padding: '6px 8px',
                                                                        color: '#fff',
                                                                        fontSize: '0.82rem',
                                                                        outline: 'none',
                                                                        fontFamily: 'inherit',
                                                                        cursor: 'pointer',
                                                                    }}
                                                                >
                                                                    {STATUS_OPTIONS.map(opt => (
                                                                        <option key={opt.value} value={opt.value} style={{ background: '#0f0f19', color: '#fff' }}>
                                                                            {opt.label}
                                                                        </option>
                                                                    ))}
                                                                </select>
                                                                <input
                                                                    type="text"
                                                                    value={editServiceDetail}
                                                                    onChange={(e) => setEditServiceDetail(e.target.value)}
                                                                    placeholder="e.g. Release"
                                                                    style={{
                                                                        background: 'rgba(255,255,255,0.05)',
                                                                        border: '1px solid rgba(255,255,255,0.1)',
                                                                        borderRadius: 6,
                                                                        padding: '6px 10px',
                                                                        color: '#fff',
                                                                        fontSize: '0.82rem',
                                                                        outline: 'none',
                                                                        fontFamily: 'inherit',
                                                                    }}
                                                                />
                                                                <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end' }}>
                                                                    <button onClick={handleSaveService} style={{ background: 'none', border: 'none', color: '#10B981', cursor: 'pointer', padding: 4 }}><Save size={15} /></button>
                                                                    <button onClick={() => setEditingService(null)} style={{ background: 'none', border: 'none', color: '#71717a', cursor: 'pointer', padding: 4 }}><X size={15} /></button>
                                                                </div>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <span style={{ color: '#e4e4e7', fontSize: '0.88rem', fontWeight: 500 }}>{service.name}</span>

                                                                {/* Quick status dropdown */}
                                                                <select
                                                                    value={service.status}
                                                                    onChange={(e) => handleQuickStatusChange(group.id, sIdx, e.target.value as StatusType)}
                                                                    style={{
                                                                        background: `${getStatusColor(service.status)}15`,
                                                                        border: `1px solid ${getStatusColor(service.status)}40`,
                                                                        borderRadius: 6,
                                                                        padding: '5px 8px',
                                                                        color: getStatusColor(service.status),
                                                                        fontSize: '0.78rem',
                                                                        fontWeight: 600,
                                                                        outline: 'none',
                                                                        fontFamily: 'inherit',
                                                                        cursor: 'pointer',
                                                                        appearance: 'auto',
                                                                    }}
                                                                >
                                                                    {STATUS_OPTIONS.map(opt => (
                                                                        <option key={opt.value} value={opt.value} style={{ background: '#0f0f19', color: '#fff' }}>
                                                                            {opt.label}
                                                                        </option>
                                                                    ))}
                                                                </select>

                                                                <span style={{ color: '#71717a', fontSize: '0.82rem' }}>{service.details[0]?.value || '—'}</span>

                                                                <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end' }}>
                                                                    <button
                                                                        onClick={() => handleStartEditService(group.id, sIdx, service)}
                                                                        style={{ background: 'none', border: 'none', color: '#71717a', cursor: 'pointer', padding: 4 }}
                                                                        title="Edit service"
                                                                    >
                                                                        <Edit3 size={14} />
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleDeleteService(group.id, sIdx)}
                                                                        style={{ background: 'none', border: 'none', color: '#ef444480', cursor: 'pointer', padding: 4 }}
                                                                        title="Delete service"
                                                                    >
                                                                        <Trash2 size={14} />
                                                                    </button>
                                                                </div>
                                                            </>
                                                        )}
                                                    </div>
                                                );
                                            })}

                                            {/* Add Service Row */}
                                            {addingServiceTo === group.id ? (
                                                <motion.div
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    style={{
                                                        display: 'grid',
                                                        gridTemplateColumns: '1fr 160px 150px 80px',
                                                        gap: 12,
                                                        alignItems: 'center',
                                                        padding: '12px 0',
                                                        borderTop: '1px solid rgba(79, 104, 248, 0.1)',
                                                    }}
                                                >
                                                    <input
                                                        type="text"
                                                        placeholder="Service name"
                                                        value={newServiceName}
                                                        onChange={(e) => setNewServiceName(e.target.value)}
                                                        onKeyDown={(e) => e.key === 'Enter' && handleAddService(group.id)}
                                                        autoFocus
                                                        style={{
                                                            background: 'rgba(255,255,255,0.05)',
                                                            border: '1px solid rgba(79, 104, 248, 0.25)',
                                                            borderRadius: 6,
                                                            padding: '6px 10px',
                                                            color: '#fff',
                                                            fontSize: '0.85rem',
                                                            outline: 'none',
                                                            fontFamily: 'inherit',
                                                        }}
                                                    />
                                                    <select
                                                        value={newServiceStatus}
                                                        onChange={(e) => setNewServiceStatus(e.target.value as StatusType)}
                                                        style={{
                                                            background: 'rgba(255,255,255,0.05)',
                                                            border: '1px solid rgba(255,255,255,0.1)',
                                                            borderRadius: 6,
                                                            padding: '6px 8px',
                                                            color: '#fff',
                                                            fontSize: '0.82rem',
                                                            outline: 'none',
                                                            fontFamily: 'inherit',
                                                            cursor: 'pointer',
                                                        }}
                                                    >
                                                        {STATUS_OPTIONS.map(opt => (
                                                            <option key={opt.value} value={opt.value} style={{ background: '#0f0f19', color: '#fff' }}>
                                                                {opt.label}
                                                            </option>
                                                        ))}
                                                    </select>
                                                    <input
                                                        type="text"
                                                        placeholder="e.g. Release"
                                                        value={newServiceDetail}
                                                        onChange={(e) => setNewServiceDetail(e.target.value)}
                                                        style={{
                                                            background: 'rgba(255,255,255,0.05)',
                                                            border: '1px solid rgba(255,255,255,0.1)',
                                                            borderRadius: 6,
                                                            padding: '6px 10px',
                                                            color: '#fff',
                                                            fontSize: '0.82rem',
                                                            outline: 'none',
                                                            fontFamily: 'inherit',
                                                        }}
                                                    />
                                                    <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end' }}>
                                                        <button onClick={() => handleAddService(group.id)} style={{ background: 'none', border: 'none', color: '#10B981', cursor: 'pointer', padding: 4 }}><Save size={15} /></button>
                                                        <button onClick={() => setAddingServiceTo(null)} style={{ background: 'none', border: 'none', color: '#71717a', cursor: 'pointer', padding: 4 }}><X size={15} /></button>
                                                    </div>
                                                </motion.div>
                                            ) : (
                                                <button
                                                    onClick={() => setAddingServiceTo(group.id)}
                                                    style={{
                                                        background: 'none',
                                                        border: '1px dashed rgba(255,255,255,0.08)',
                                                        borderRadius: 8,
                                                        padding: '10px',
                                                        color: '#52525b',
                                                        cursor: 'pointer',
                                                        width: '100%',
                                                        marginTop: 8,
                                                        fontSize: '0.82rem',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        gap: 6,
                                                        fontFamily: 'inherit',
                                                        transition: 'all 0.2s',
                                                    }}
                                                    onMouseOver={(e) => { e.currentTarget.style.color = '#818cf8'; e.currentTarget.style.borderColor = 'rgba(79, 104, 248, 0.2)'; }}
                                                    onMouseOut={(e) => { e.currentTarget.style.color = '#52525b'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; }}
                                                >
                                                    <Plus size={14} /> Add Service
                                                </button>
                                            )}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    );
                })}
            </div>

            {filteredGames.length === 0 && (
                <div style={{
                    textAlign: 'center',
                    padding: '60px 20px',
                    color: '#52525b',
                }}>
                    <Activity size={48} style={{ marginBottom: 16, opacity: 0.3 }} />
                    <p style={{ fontSize: '1rem', margin: 0 }}>No games found</p>
                    <p style={{ fontSize: '0.85rem', marginTop: 6 }}>Try a different search or add a new game</p>
                </div>
            )}
        </div>
    );
};

export default StatusManager;
