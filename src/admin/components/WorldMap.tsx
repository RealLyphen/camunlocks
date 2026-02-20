import React, { useState, useCallback } from 'react';
import { ComposableMap, Geographies, Geography, ZoomableGroup } from 'react-simple-maps';

export interface CountryData {
    name: string;
    views: number;
    visitors: number;
}

interface Props {
    data: CountryData[];
}

const GEO_URL = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json';

/* Country name mapping from topojson numeric IDs to display name via Geography properties */

const WorldMap: React.FC<Props> = ({ data }) => {
    const [zoom, setZoom] = useState(1);
    const [center, setCenter] = useState<[number, number]>([0, 20]);
    const [selected, setSelected] = useState<string | null>(null);
    const [tooltip, setTooltip] = useState<{ name: string; x: number; y: number } | null>(null);

    const maxViews = Math.max(1, ...data.map(d => d.views));

    const getCountryData = useCallback((name: string): CountryData =>
        data.find(d => d.name.toLowerCase() === name.toLowerCase()) ||
        { name, views: 0, visitors: 0 }
        , [data]);

    const getColor = (name: string) => {
        const cd = getCountryData(name);
        if (cd.views === 0) return 'rgba(30,34,60,0.9)';
        const intensity = Math.sqrt(cd.views / maxViews);
        const alpha = 0.3 + intensity * 0.7;
        return `rgba(99,102,241,${alpha})`;
    };

    const selectedData = selected ? getCountryData(selected) : null;

    const zoomIn = () => setZoom(z => Math.min(8, z * 1.4));
    const zoomOut = () => setZoom(z => Math.max(1, z / 1.4));
    const reset = () => { setZoom(1); setCenter([0, 20]); setSelected(null); };

    return (
        <div style={{ position: 'relative', width: '100%' }}>
            {/* Zoom controls */}
            <div style={{ position: 'absolute', top: 12, right: 12, zIndex: 20, display: 'flex', flexDirection: 'column', gap: 5 }}>
                {[
                    { label: '+', fn: zoomIn, title: 'Zoom in' },
                    { label: '−', fn: zoomOut, title: 'Zoom out' },
                    { label: '⟳', fn: reset, title: 'Reset view' },
                ].map(({ label, fn, title }) => (
                    <button key={label} onClick={fn} title={title} style={{
                        width: 30, height: 30, borderRadius: 8,
                        background: 'rgba(15,15,25,0.9)', border: '1px solid rgba(99,102,241,0.3)',
                        color: '#a1a1aa', fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        backdropFilter: 'blur(10px)', transition: 'all 0.15s',
                    }}>{label}</button>
                ))}
            </div>

            {/* Tooltip */}
            {tooltip && (
                <div style={{
                    position: 'absolute', left: tooltip.x + 12, top: tooltip.y - 20, zIndex: 30,
                    background: 'rgba(10,10,18,0.95)', border: '1px solid rgba(99,102,241,0.3)',
                    borderRadius: 8, padding: '6px 12px', pointerEvents: 'none',
                    fontSize: '0.78rem', color: '#e4e4e7', backdropFilter: 'blur(14px)',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
                }}>
                    {tooltip.name}
                    {getCountryData(tooltip.name).views > 0 && (
                        <span style={{ color: '#818cf8', marginLeft: 6, fontWeight: 700 }}>
                            · {getCountryData(tooltip.name).views} views
                        </span>
                    )}
                </div>
            )}

            {/* Map */}
            <div style={{
                width: '100%', height: 380, borderRadius: 14, overflow: 'hidden',
                background: 'linear-gradient(160deg, #060914 0%, #0b0f22 100%)',
                border: '1px solid rgba(99,102,241,0.12)',
                position: 'relative', cursor: 'grab',
            }}>
                {/* Grid overlay */}
                <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', opacity: 0.06 }}>
                    {Array.from({ length: 9 }, (_, i) => (
                        <line key={`h${i}`} x1="0%" y1={`${(i + 1) * 10}%`} x2="100%" y2={`${(i + 1) * 10}%`} stroke="#6366f1" strokeWidth="1" />
                    ))}
                    {Array.from({ length: 19 }, (_, i) => (
                        <line key={`v${i}`} x1={`${(i + 1) * 5}%`} y1="0%" x2={`${(i + 1) * 5}%`} y2="100%" stroke="#6366f1" strokeWidth="1" />
                    ))}
                </svg>

                <ComposableMap
                    projection="geoMercator"
                    style={{ width: '100%', height: '100%' }}
                    projectionConfig={{ scale: 140, center: [0, 25] }}
                >
                    <ZoomableGroup
                        zoom={zoom}
                        center={center}
                        onMoveEnd={({ zoom: z, coordinates }) => {
                            setZoom(z);
                            setCenter(coordinates);
                        }}
                    >
                        <Geographies geography={GEO_URL}>
                            {({ geographies }) =>
                                geographies.map(geo => {
                                    const name = geo.properties.name as string;
                                    const cd = getCountryData(name);
                                    const isSelected = selected === name;
                                    const hasData = cd.views > 0;

                                    return (
                                        <Geography
                                            key={geo.rsmKey}
                                            geography={geo}
                                            onClick={() => setSelected(isSelected ? null : name)}
                                            onMouseEnter={(e) => {
                                                const rect = (e.target as SVGElement).closest('div')?.getBoundingClientRect();
                                                setTooltip({ name, x: e.clientX - (rect?.left || 0), y: e.clientY - (rect?.top || 0) });
                                            }}
                                            onMouseLeave={() => setTooltip(null)}
                                            style={{
                                                default: {
                                                    fill: isSelected ? '#818cf8' : getColor(name),
                                                    stroke: isSelected ? '#a5b4fc' : 'rgba(99,102,241,0.2)',
                                                    strokeWidth: isSelected ? 1 : 0.5,
                                                    outline: 'none',
                                                    transition: 'fill 0.2s',
                                                },
                                                hover: {
                                                    fill: hasData ? '#6366f1' : 'rgba(55,60,95,0.95)',
                                                    stroke: 'rgba(99,102,241,0.6)',
                                                    strokeWidth: 0.8,
                                                    outline: 'none',
                                                    cursor: 'pointer',
                                                },
                                                pressed: {
                                                    fill: '#4f46e5',
                                                    outline: 'none',
                                                },
                                            }}
                                        />
                                    );
                                })
                            }
                        </Geographies>
                    </ZoomableGroup>
                </ComposableMap>
            </div>

            {/* Scale info */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 8, flexWrap: 'wrap', gap: 8 }}>
                <div style={{ fontSize: '0.7rem', color: '#3f3f46' }}>
                    Zoom: {Math.round(zoom * 100)}% · Scroll to zoom · Drag to pan · Click country for details
                </div>
                <div style={{ display: 'flex', gap: 14 }}>
                    {[['Active country', 'rgba(99,102,241,0.85)'], ['No traffic', 'rgba(30,34,60,0.9)'], ['Selected', '#818cf8']].map(([label, color]) => (
                        <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                            <div style={{ width: 10, height: 10, borderRadius: 2, background: color, border: '1px solid rgba(99,102,241,0.3)' }} />
                            <span style={{ fontSize: '0.7rem', color: '#52525b' }}>{label}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Selected country panel */}
            {selectedData && (
                <div style={{
                    marginTop: 12,
                    background: 'linear-gradient(135deg, rgba(99,102,241,0.1), rgba(139,92,246,0.08))',
                    border: '1px solid rgba(99,102,241,0.25)',
                    borderRadius: 12, padding: '16px 20px',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12,
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(99,102,241,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>
                            🌍
                        </div>
                        <div>
                            <div style={{ fontWeight: 800, color: '#fff', fontSize: '1rem' }}>{selectedData.name}</div>
                            <div style={{ fontSize: '0.72rem', color: '#71717a' }}>Click map to deselect</div>
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap' }}>
                        {[['Page Views', selectedData.views], ['Unique Visitors', selectedData.visitors]].map(([label, val]) => (
                            <div key={label as string}>
                                <div style={{ fontSize: '0.68rem', color: '#71717a', marginBottom: 2, textTransform: 'uppercase', letterSpacing: 0.8 }}>{label}</div>
                                <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#fff', lineHeight: 1 }}>{(val as number).toLocaleString()}</div>
                            </div>
                        ))}
                    </div>
                    <button onClick={() => setSelected(null)} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '6px 14px', color: '#71717a', cursor: 'pointer', fontSize: '0.78rem' }}>
                        ✕ Close
                    </button>
                </div>
            )}
        </div>
    );
};

export default WorldMap;
