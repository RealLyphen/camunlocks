import React, { useState, useCallback } from 'react';
import { useStore } from '../../../context/StoreContext';
import type { LayoutBlock } from '../../../context/StoreContext';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useToast } from '../../../context/ToastContext';
import {
    GripVertical, Trash2,
    Plus,
    Undo2, Redo2, ChevronRight, ChevronDown, Eye, EyeOff,
    AlignLeft, AlignCenter, AlignRight,
    Save, X, Copy,
} from 'lucide-react';

/* ─────────────────────────────────────────────────────────────
   TYPES
   ───────────────────────────────────────────────────────────── */
interface StyleConfig {
    paddingTop?: number; paddingBottom?: number; paddingLeft?: number; paddingRight?: number;
    marginTop?: number; marginBottom?: number;
    bgColor?: string; bgOpacity?: number;
    textColor?: string; textAlign?: 'left' | 'center' | 'right';
    fontSize?: number; fontWeight?: string;
    borderRadius?: number;
    hidden?: boolean;
}

interface ExtendedBlock extends LayoutBlock {
    style?: StyleConfig;
}

/* ─────────────────────────────────────────────────────────────
   WIDGET LIBRARY ITEMS
   ───────────────────────────────────────────────────────────── */
const WIDGET_DEFS = [
    { type: 'hero', label: 'Hero Section', icon: '🎯', color: '#6366f1', desc: 'Full-width hero with video bg & character' },
    { type: 'popular_products', label: 'Product Grid', icon: '🛍️', color: '#8b5cf6', desc: 'Product listing with search & filters' },
    { type: 'features', label: 'Features Strip', icon: '⚡', color: '#3b82f6', desc: 'Icon + text feature highlights' },
    { type: 'banner', label: 'Banner', icon: '🖼️', color: '#10b981', desc: 'Full width image banner with CTA' },
    { type: 'text_module', label: 'Text Block', icon: '✍️', color: '#f59e0b', desc: 'Rich text area for announcements' },
] as const;

/* ─────────────────────────────────────────────────────────────
   BLOCK ICON helper
   ───────────────────────────────────────────────────────────── */
const blockEmoji = (type: string) => WIDGET_DEFS.find(w => w.type === type)?.icon ?? '📦';
const blockColor = (type: string) => WIDGET_DEFS.find(w => w.type === type)?.color ?? '#71717a';

/* ─────────────────────────────────────────────────────────────
   SORTABLE CANVAS BLOCK
   ───────────────────────────────────────────────────────────── */
interface SortableCanvasBlockProps {
    block: ExtendedBlock;
    isSelected: boolean;
    onSelect: () => void;
    onDelete: (id: string) => void;
    onDuplicate: (id: string) => void;
    onVisibilityToggle: (id: string) => void;
}

const SortableCanvasBlock: React.FC<SortableCanvasBlockProps> = ({
    block, isSelected, onSelect, onDelete, onDuplicate, onVisibilityToggle
}) => {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: block.id });

    const style: React.CSSProperties = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 100 : 1,
        opacity: isDragging ? 0.6 : 1,
    };

    const blockStyle = block.style || {};
    const hidden = blockStyle.hidden;

    const previewHeight = block.type === 'hero' ? 280
        : block.type === 'popular_products' ? 200
            : block.type === 'banner' ? 140
                : block.type === 'features' ? 100
                    : 80;

    const bgC = blockStyle.bgColor || blockColor(block.type) + '18';

    return (
        <div ref={setNodeRef} style={style}>
            <div
                onClick={onSelect}
                style={{
                    position: 'relative',
                    marginBottom: 12,
                    border: isSelected ? `2px solid ${blockColor(block.type)}` : '2px solid transparent',
                    borderRadius: 12,
                    transition: 'border-color 0.2s, box-shadow 0.2s',
                    boxShadow: isSelected ? `0 0 0 3px ${blockColor(block.type)}30` : '0 2px 8px rgba(0,0,0,0.3)',
                    cursor: 'pointer',
                    overflow: 'hidden',
                    opacity: hidden ? 0.35 : 1,
                }}
            >
                {/* Drag handle row */}
                <div
                    style={{
                        background: isSelected ? blockColor(block.type) : 'rgba(30,30,35,0.95)',
                        padding: '8px 12px',
                        display: 'flex', alignItems: 'center', gap: 8,
                        borderBottom: '1px solid rgba(255,255,255,0.06)',
                        transition: 'background 0.2s',
                    }}
                >
                    <div
                        {...attributes} {...listeners}
                        style={{ cursor: 'grab', color: 'rgba(255,255,255,0.5)', display: 'flex', alignItems: 'center', touchAction: 'none' }}
                        onClick={e => e.stopPropagation()}
                    >
                        <GripVertical size={14} />
                    </div>
                    <span style={{ fontSize: 14 }}>{blockEmoji(block.type)}</span>
                    <span style={{ flex: 1, fontSize: '0.78rem', fontWeight: 600, color: '#fff', textTransform: 'capitalize' }}>
                        {block.type.replace('_', ' ')}
                    </span>
                    {isSelected && (
                        <div style={{ display: 'flex', gap: 4 }} onClick={e => e.stopPropagation()}>
                            <ActionBtn icon={<Copy size={12} />} onClick={() => onDuplicate(block.id)} title="Duplicate" />
                            <ActionBtn icon={hidden ? <Eye size={12} /> : <EyeOff size={12} />} onClick={() => onVisibilityToggle(block.id)} title={hidden ? 'Show' : 'Hide'} />
                            <ActionBtn icon={<Trash2 size={12} />} onClick={() => onDelete(block.id)} title="Delete" danger />
                        </div>
                    )}
                </div>

                {/* Visual preview area */}
                <div style={{
                    height: previewHeight,
                    background: bgC,
                    position: 'relative',
                    padding: `${blockStyle.paddingTop ?? 24}px ${blockStyle.paddingLeft ?? 24}px ${blockStyle.paddingBottom ?? 24}px`,
                    display: 'flex', flexDirection: 'column', justifyContent: 'center',
                    textAlign: (blockStyle.textAlign || 'left') as any,
                }}>
                    {block.type === 'hero' && <HeroPreview block={block} />}
                    {block.type === 'popular_products' && <ProductsPreview block={block} />}
                    {block.type === 'banner' && <BannerPreview block={block} />}
                    {block.type === 'features' && <FeaturesPreview block={block} />}
                    {block.type === 'text_module' && <TextPreview block={block} />}

                    {/* Selection overlay hint */}
                    {!isSelected && (
                        <div style={{
                            position: 'absolute', inset: 0,
                            background: 'rgba(0,0,0,0)',
                            transition: 'background 0.15s',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}
                            className="canvas-hover-overlay"
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

const ActionBtn = ({ icon, onClick, title, danger }: { icon: React.ReactNode; onClick: () => void; title: string; danger?: boolean }) => (
    <button
        title={title}
        onClick={onClick}
        style={{
            background: danger ? 'rgba(239,68,68,0.2)' : 'rgba(255,255,255,0.12)',
            border: 'none', borderRadius: 6, width: 24, height: 24,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: danger ? '#f87171' : '#fff', cursor: 'pointer', transition: 'background 0.2s',
        }}
    >{icon}</button>
);

/* Mini preview components */
const HeroPreview = ({ block }: { block: ExtendedBlock }) => (
    <div style={{ display: 'flex', gap: 16, alignItems: 'center', height: '100%' }}>
        <div style={{ flex: 1 }}>
            <div style={{ width: '60%', height: 10, borderRadius: 4, background: 'rgba(255,255,255,0.5)', marginBottom: 8 }} />
            <div style={{ width: '80%', height: 8, borderRadius: 4, background: 'rgba(255,255,255,0.25)', marginBottom: 6 }} />
            <div style={{ width: '70%', height: 8, borderRadius: 4, background: 'rgba(255,255,255,0.25)', marginBottom: 16 }} />
            <div style={{ width: 80, height: 28, borderRadius: 8, background: 'var(--primary-color)' }} />
        </div>
        <div style={{ width: 100, height: 160, background: 'rgba(255,255,255,0.1)', borderRadius: 8, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36 }}>
            {block.config?.image ? <img src={block.config.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: 8 }} /> : '🎮'}
        </div>
    </div>
);

const ProductsPreview = ({ block }: { block: ExtendedBlock }) => (
    <>
        <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fff', marginBottom: 12 }}>{block.config?.title || 'Product Grid'}</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
            {[...Array(4)].map((_, i) => (
                <div key={i} style={{ height: 64, background: 'rgba(255,255,255,0.08)', borderRadius: 8 }} />
            ))}
        </div>
    </>
);

const BannerPreview = ({ block }: { block: ExtendedBlock }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 16, height: '100%' }}>
        <div style={{ flex: 1 }}>
            <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#fff', marginBottom: 6 }}>{block.config?.title || 'Banner Title'}</div>
            <div style={{ width: 60, height: 24, borderRadius: 6, background: '#10b981' }} />
        </div>
        {block.config?.image && <img src={block.config.image} alt="" style={{ width: 80, height: 60, objectFit: 'cover', borderRadius: 8 }} />}
    </div>
);

const FeaturesPreview = (_: { block: ExtendedBlock }) => (
    <div style={{ display: 'flex', gap: 16, justifyContent: 'center' }}>
        {['🛡️ Undetected', '⚡ Fast', '💬 Support'].map(f => (
            <div key={f} style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.7)', display: 'flex', alignItems: 'center', gap: 4 }}>
                {f}
            </div>
        ))}
    </div>
);

const TextPreview = ({ block }: { block: ExtendedBlock }) => (
    <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)', lineHeight: 1.5 }}>
        {block.config?.title || 'Text block content...'}
    </div>
);

/* ─────────────────────────────────────────────────────────────
   INSPECTOR PANEL COMPONENTS
   ───────────────────────────────────────────────────────────── */
const Slider = ({ label, value, min, max, unit = 'px', onChange }: { label: string; value: number; min: number; max: number; unit?: string; onChange: (v: number) => void }) => (
    <div style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <label style={{ fontSize: '0.78rem', color: '#a1a1aa', fontWeight: 500 }}>{label}</label>
            <span style={{ fontSize: '0.78rem', color: '#fff', fontWeight: 600, minWidth: 36, textAlign: 'right' }}>{value}{unit}</span>
        </div>
        <input
            type="range" min={min} max={max} value={value}
            onChange={e => onChange(Number(e.target.value))}
            style={{ width: '100%', accentColor: 'var(--primary-color)', cursor: 'pointer', height: 4 }}
        />
    </div>
);

const InspInput = ({ label, value, onChange, placeholder, type = 'text', half = false }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string; half?: boolean }) => (
    <div style={{ marginBottom: 14, width: half ? '48%' : '100%' }}>
        <label style={{ display: 'block', fontSize: '0.75rem', color: '#a1a1aa', fontWeight: 500, marginBottom: 5 }}>{label}</label>
        <input
            type={type} value={value}
            onChange={e => onChange(e.target.value)}
            placeholder={placeholder}
            style={{
                width: '100%', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 8, padding: '9px 12px', color: '#fff', fontSize: '0.85rem', fontFamily: 'inherit',
                boxSizing: 'border-box',
            }}
        />
    </div>
);

const InspTextarea = ({ label, value, onChange, rows = 3 }: { label: string; value: string; onChange: (v: string) => void; rows?: number }) => (
    <div style={{ marginBottom: 14 }}>
        <label style={{ display: 'block', fontSize: '0.75rem', color: '#a1a1aa', fontWeight: 500, marginBottom: 5 }}>{label}</label>
        <textarea
            value={value} rows={rows}
            onChange={e => onChange(e.target.value)}
            style={{
                width: '100%', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 8, padding: '9px 12px', color: '#fff', fontSize: '0.85rem', fontFamily: 'inherit',
                resize: 'vertical' as const, boxSizing: 'border-box',
            }}
        />
    </div>
);

const ColorSwatch = ({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) => (
    <div style={{ marginBottom: 14 }}>
        <label style={{ display: 'block', fontSize: '0.75rem', color: '#a1a1aa', fontWeight: 500, marginBottom: 5 }}>{label}</label>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <input type="color" value={value || '#000000'} onChange={e => onChange(e.target.value)}
                style={{ width: 36, height: 36, borderRadius: 8, border: '1px solid rgba(255,255,255,0.15)', cursor: 'pointer', padding: 2, background: 'transparent' }}
            />
            <input type="text" value={value || ''} onChange={e => onChange(e.target.value)} placeholder="#hex or rgba()"
                style={{ flex: 1, background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '8px 12px', color: '#fff', fontSize: '0.82rem', fontFamily: 'monospace' }}
            />
        </div>
    </div>
);

const AlignButtons = ({ value, onChange }: { value: string; onChange: (v: 'left' | 'center' | 'right') => void }) => (
    <div style={{ marginBottom: 14 }}>
        <label style={{ display: 'block', fontSize: '0.75rem', color: '#a1a1aa', fontWeight: 500, marginBottom: 5 }}>Text Align</label>
        <div style={{ display: 'flex', gap: 6 }}>
            {(['left', 'center', 'right'] as const).map(align => (
                <button key={align} onClick={() => onChange(align)} style={{
                    flex: 1, height: 32, borderRadius: 8, border: 'none', cursor: 'pointer',
                    background: value === align ? 'var(--primary-color)' : 'rgba(255,255,255,0.07)',
                    color: value === align ? '#fff' : '#71717a', transition: 'all 0.15s',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                    {align === 'left' ? <AlignLeft size={14} /> : align === 'center' ? <AlignCenter size={14} /> : <AlignRight size={14} />}
                </button>
            ))}
        </div>
    </div>
);

const SpacingControl = ({ label, values, onChange }: {
    label: string;
    values: { top: number; bottom: number; left: number; right: number };
    onChange: (side: string, v: number) => void;
}) => (
    <div style={{ marginBottom: 16 }}>
        <label style={{ display: 'block', fontSize: '0.75rem', color: '#a1a1aa', fontWeight: 500, marginBottom: 8 }}>{label}</label>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {[['top', values.top], ['right', values.right], ['bottom', values.bottom], ['left', values.left]].map(([side, val]) => (
                <div key={side as string}>
                    <div style={{ fontSize: '0.68rem', color: '#71717a', textTransform: 'capitalize', marginBottom: 3 }}>{side}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <input type="number" min={0} max={200} value={val as number}
                            onChange={e => onChange(side as string, Number(e.target.value))}
                            style={{ width: '100%', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 6, padding: '5px 8px', color: '#fff', fontSize: '0.82rem', textAlign: 'center' }}
                        />
                        <span style={{ fontSize: '0.68rem', color: '#52525b' }}>px</span>
                    </div>
                </div>
            ))}
        </div>
    </div>
);


/* Collapsible panel section */
const PanelSection = ({ label, defaultOpen = true, children }: { label: string; defaultOpen?: boolean; children: React.ReactNode }) => {
    const [open, setOpen] = useState(defaultOpen);
    return (
        <div style={{ marginBottom: 4 }}>
            <button onClick={() => setOpen(!open)} style={{
                width: '100%', background: 'rgba(0,0,0,0.2)', border: 'none', color: '#e4e4e7', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '10px 16px', fontSize: '0.75rem', fontWeight: 700, letterSpacing: 0.8, textTransform: 'uppercase',
                borderBottom: '1px solid rgba(255,255,255,0.04)',
                borderRadius: open ? '8px 8px 0 0' : 8, transition: 'border-radius 0.2s',
            }}>
                {label}
                {open ? <ChevronDown size={13} style={{ color: '#71717a' }} /> : <ChevronRight size={13} style={{ color: '#71717a' }} />}
            </button>
            {open && (
                <div style={{ background: 'rgba(0,0,0,0.12)', border: '1px solid rgba(255,255,255,0.04)', borderTop: 'none', borderRadius: '0 0 8px 8px', padding: '16px 16px 4px', marginBottom: 8 }}>
                    {children}
                </div>
            )}
        </div>
    );
};

/* ─────────────────────────────────────────────────────────────
   CONTENT INSPECTOR (per block type)
   ───────────────────────────────────────────────────────────── */
const ContentInspector = ({ block, updateConfig }: { block: ExtendedBlock; updateConfig: (key: string, value: any) => void }) => {
    const cfg = block.config || {};
    const common = (
        <PanelSection label="Content">
            <InspInput label="Section Title" value={cfg.title || ''} onChange={v => updateConfig('title', v)} placeholder="Enter title..." />
            {(block.type === 'hero' || block.type === 'banner' || block.type === 'text_module') && (
                <InspTextarea label="Subtitle / Description" value={cfg.subtitle || ''} onChange={v => updateConfig('subtitle', v)} rows={3} />
            )}
        </PanelSection>
    );

    if (block.type === 'hero') return (
        <>
            {common}
            <PanelSection label="Button">
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <div style={{ width: '48%' }}>
                        <InspInput label="Button Text" value={cfg.buttonText || ''} onChange={v => updateConfig('buttonText', v)} placeholder="Shop Now" />
                    </div>
                    <div style={{ width: '48%' }}>
                        <InspInput label="Button Link" value={cfg.buttonLink || ''} onChange={v => updateConfig('buttonLink', v)} placeholder="#products" />
                    </div>
                </div>
            </PanelSection>
            <PanelSection label="Character Image">
                <InspInput label="Image URL" value={cfg.image || ''} onChange={v => updateConfig('image', v)} placeholder="/char.png" />
                {cfg.image && <img src={cfg.image} alt="" style={{ width: '100%', height: 80, objectFit: 'contain', marginTop: 4, background: 'rgba(255,255,255,0.03)', borderRadius: 8 }} />}
            </PanelSection>
        </>
    );

    if (block.type === 'popular_products') return (
        <>
            {common}
            <PanelSection label="Grid Config">
                <Slider label="Max Products" value={cfg.count || 8} min={4} max={24} unit="" onChange={v => updateConfig('count', v)} />
                <div style={{ fontSize: '0.75rem', color: '#71717a', marginTop: -8, marginBottom: 12 }}>
                    Showing up to <b style={{ color: '#fff' }}>{cfg.count || 8}</b> products in the grid.
                </div>
            </PanelSection>
        </>
    );

    if (block.type === 'banner') return (
        <>
            {common}
            <PanelSection label="Banner Image">
                <InspInput label="Image URL" value={cfg.image || ''} onChange={v => updateConfig('image', v)} placeholder="https://..." />
                {cfg.image && <img src={cfg.image} alt="" style={{ width: '100%', height: 80, objectFit: 'cover', marginTop: 4, borderRadius: 8 }} />}
            </PanelSection>
            <PanelSection label="Call To Action" defaultOpen={false}>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <div style={{ width: '48%' }}>
                        <InspInput label="Button Text" value={cfg.buttonText || ''} onChange={v => updateConfig('buttonText', v)} />
                    </div>
                    <div style={{ width: '48%' }}>
                        <InspInput label="Button Link" value={cfg.buttonLink || ''} onChange={v => updateConfig('buttonLink', v)} />
                    </div>
                </div>
            </PanelSection>
        </>
    );

    return (
        <>
            {common}
        </>
    );
};

/* ─────────────────────────────────────────────────────────────
   STYLE INSPECTOR
   ───────────────────────────────────────────────────────────── */
const StyleInspector = ({ block, updateStyle }: { block: ExtendedBlock; updateStyle: (key: keyof StyleConfig, value: any) => void }) => {
    const s = block.style || {};
    return (
        <>
            <PanelSection label="Spacing — Padding">
                <SpacingControl
                    label="Padding"
                    values={{ top: s.paddingTop ?? 24, bottom: s.paddingBottom ?? 24, left: s.paddingLeft ?? 24, right: s.paddingRight ?? 24 }}
                    onChange={(side, v) => updateStyle(`padding${side.charAt(0).toUpperCase() + side.slice(1)}` as keyof StyleConfig, v)}
                />
            </PanelSection>
            <PanelSection label="Spacing — Margin" defaultOpen={false}>
                <SpacingControl
                    label="Margin"
                    values={{ top: s.marginTop ?? 0, bottom: s.marginBottom ?? 0, left: 0, right: 0 }}
                    onChange={(side, v) => updateStyle(`margin${side.charAt(0).toUpperCase() + side.slice(1)}` as keyof StyleConfig, v)}
                />
            </PanelSection>
            <PanelSection label="Background">
                <ColorSwatch label="Background Color" value={s.bgColor || ''} onChange={v => updateStyle('bgColor', v)} />
                <Slider label="Background Opacity" value={s.bgOpacity ?? 100} min={0} max={100} unit="%" onChange={v => updateStyle('bgOpacity', v)} />
            </PanelSection>
            <PanelSection label="Typography" defaultOpen={false}>
                <ColorSwatch label="Text Color" value={s.textColor || '#ffffff'} onChange={v => updateStyle('textColor', v)} />
                <AlignButtons value={s.textAlign || 'left'} onChange={v => updateStyle('textAlign', v)} />
                <Slider label="Font Size" value={s.fontSize ?? 16} min={10} max={72} onChange={v => updateStyle('fontSize', v)} />
                <div style={{ marginBottom: 14 }}>
                    <label style={{ display: 'block', fontSize: '0.75rem', color: '#a1a1aa', fontWeight: 500, marginBottom: 5 }}>Font Weight</label>
                    <select value={s.fontWeight || '400'} onChange={e => updateStyle('fontWeight', e.target.value)} style={{ width: '100%', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '8px 12px', color: '#fff', fontSize: '0.85rem' }}>
                        {['300', '400', '500', '600', '700', '800', '900'].map(w => (
                            <option key={w} value={w}>{w === '300' ? 'Light' : w === '400' ? 'Regular' : w === '500' ? 'Medium' : w === '600' ? 'Semi Bold' : w === '700' ? 'Bold' : w === '800' ? 'Extra Bold' : 'Black'} ({w})</option>
                        ))}
                    </select>
                </div>
            </PanelSection>
            <PanelSection label="Border" defaultOpen={false}>
                <Slider label="Border Radius" value={s.borderRadius ?? 0} min={0} max={40} onChange={v => updateStyle('borderRadius', v)} />
            </PanelSection>
        </>
    );
};

/* ─────────────────────────────────────────────────────────────
   ADVANCED INSPECTOR
   ───────────────────────────────────────────────────────────── */
const AdvancedInspector = ({ block, updateStyle }: { block: ExtendedBlock; updateStyle: (key: keyof StyleConfig, value: any) => void }) => {
    const s = block.style || {};
    return (
        <PanelSection label="Visibility">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                <span style={{ fontSize: '0.85rem', color: '#d4d4d8' }}>Hidden</span>
                <button onClick={() => updateStyle('hidden', !s.hidden)} style={{
                    width: 44, height: 24, borderRadius: 12, border: 'none', cursor: 'pointer', position: 'relative',
                    background: s.hidden ? 'var(--primary-color)' : 'rgba(255,255,255,0.08)',
                    transition: 'background 0.2s',
                }}>
                    <div style={{
                        position: 'absolute', top: 3, left: s.hidden ? 22 : 3, width: 18, height: 18, borderRadius: '50%', background: '#fff',
                        transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.4)',
                    }} />
                </button>
            </div>
            <p style={{ fontSize: '0.75rem', color: '#52525b', marginBottom: 0 }}>Hidden sections won't show to visitors but are still saved.</p>
        </PanelSection>
    );
};

/* ─────────────────────────────────────────────────────────────
   MAIN PAGE BUILDER
   ───────────────────────────────────────────────────────────── */
const PageBuilder: React.FC = () => {
    const { settings, updateSettings } = useStore();
    const { addToast } = useToast();

    // Layout state with history for undo/redo
    const [history, setHistory] = useState<ExtendedBlock[][]>([settings.homeLayout || []]);
    const [histIdx, setHistIdx] = useState(0);
    const layout = history[histIdx];

    const pushHistory = useCallback((newLayout: ExtendedBlock[]) => {
        setHistory(prev => {
            const trimmed = prev.slice(0, histIdx + 1);
            return [...trimmed, newLayout];
        });
        setHistIdx(prev => prev + 1);
    }, [histIdx]);

    const undo = () => { if (histIdx > 0) setHistIdx(h => h - 1); };
    const redo = () => { if (histIdx < history.length - 1) setHistIdx(h => h + 1); };
    const canUndo = histIdx > 0;
    const canRedo = histIdx < history.length - 1;

    // UI state
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const selectedBlock = layout.find(b => b.id === selectedId) as ExtendedBlock | undefined;
    const [inspectorTab, setInspectorTab] = useState<'content' | 'style' | 'advanced'>('content');
    const [deviceMode, setDeviceMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
    const [leftTab, setLeftTab] = useState<'widgets' | 'layers'>('widgets');
    type SearchTerm = string;
    const [widgetSearch, setWidgetSearch] = useState<SearchTerm>('');

    const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }));

    /* ─ Helpers ─ */
    const setLayout = (newLayout: ExtendedBlock[]) => pushHistory(newLayout);

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (over && active.id !== over.id) {
            const oldIdx = layout.findIndex(b => b.id === active.id);
            const newIdx = layout.findIndex(b => b.id === over.id);
            setLayout(arrayMove(layout, oldIdx, newIdx));
        }
    };

    const addBlock = (type: LayoutBlock['type']) => {
        const def = WIDGET_DEFS.find(w => w.type === type);
        const newBlock: ExtendedBlock = {
            id: `block-${Math.random().toString(36).substring(2, 9)}`,
            type,
            config: { title: def?.label ?? 'New Block', count: 8 },
            style: { paddingTop: 40, paddingBottom: 40, paddingLeft: 24, paddingRight: 24 },
        };
        const newLayout = [...layout, newBlock];
        setLayout(newLayout);
        setSelectedId(newBlock.id);
        setInspectorTab('content');
    };

    const deleteBlock = (id: string) => {
        setLayout(layout.filter(b => b.id !== id));
        if (selectedId === id) setSelectedId(null);
    };

    const duplicateBlock = (id: string) => {
        const src = layout.find(b => b.id === id);
        if (!src) return;
        const copy: ExtendedBlock = { ...src, id: `block-${Math.random().toString(36).substring(2, 9)}` };
        const idx = layout.findIndex(b => b.id === id);
        const newLayout = [...layout];
        newLayout.splice(idx + 1, 0, copy);
        setLayout(newLayout);
        setSelectedId(copy.id);
    };

    const toggleVisibility = (id: string) => {
        setLayout(layout.map(b => b.id === id ? { ...b, style: { ...b.style, hidden: !b.style?.hidden } } : b));
    };

    const updateConfig = (key: string, value: any) => {
        if (!selectedId) return;
        setLayout(layout.map(b => b.id === selectedId ? { ...b, config: { ...b.config, [key]: value } } : b));
    };

    const updateStyle = (key: keyof StyleConfig, value: any) => {
        if (!selectedId) return;
        setLayout(layout.map(b => b.id === selectedId ? { ...b, style: { ...b.style, [key]: value } } : b));
    };

    const handleSave = () => {
        updateSettings({ ...settings, homeLayout: layout });
        addToast('✅ Page layout saved and published!', 'success');
    };

    const canvasWidth = deviceMode === 'desktop' ? '100%' : deviceMode === 'tablet' ? 768 : 390;

    const filteredWidgets = WIDGET_DEFS.filter(w =>
        w.label.toLowerCase().includes(widgetSearch.toLowerCase()) ||
        w.desc.toLowerCase().includes(widgetSearch.toLowerCase())
    );

    /* ─────────── RENDER ─────────── */
    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 60px)', background: '#09090b', overflow: 'hidden', fontFamily: 'Inter, sans-serif' }}>

            {/* ── Top Bar ── */}
            <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '0 20px', height: 52,
                background: 'rgba(12,12,15,0.98)', borderBottom: '1px solid rgba(255,255,255,0.06)',
                flexShrink: 0, zIndex: 20,
            }}>
                {/* Left: title */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ background: 'linear-gradient(135deg, var(--primary-color), var(--secondary-color))', width: 28, height: 28, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>✦</div>
                    <span style={{ fontWeight: 700, fontSize: '0.9rem', color: '#fff' }}>Visual Editor</span>
                    <span style={{ fontSize: '0.72rem', color: '#52525b', background: 'rgba(255,255,255,0.04)', padding: '2px 8px', borderRadius: 20, border: '1px solid rgba(255,255,255,0.06)' }}>Homepage</span>
                </div>

                {/* Center: device toggle */}
                <div style={{ display: 'flex', gap: 4, background: 'rgba(255,255,255,0.04)', borderRadius: 10, padding: 3 }}>
                    {([
                        ['desktop', <svg key="d" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" /></svg>],
                        ['tablet', <svg key="t" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="2" width="16" height="20" rx="2" /><line x1="12" y1="18" x2="12.01" y2="18" /></svg>],
                        ['mobile', <svg key="m" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="2" width="14" height="20" rx="2" /><line x1="12" y1="18" x2="12.01" y2="18" /></svg>],
                    ] as const).map(([d, icon]) => (
                        <button key={d} onClick={() => setDeviceMode(d as any)} style={{
                            background: deviceMode === d ? 'var(--primary-color)' : 'transparent',
                            border: 'none', borderRadius: 7, color: deviceMode === d ? '#fff' : '#71717a',
                            width: 32, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.15s',
                        }}>{icon}</button>
                    ))}
                </div>

                {/* Right: undo/redo + save */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <button onClick={undo} disabled={!canUndo} style={{ background: 'none', border: 'none', color: canUndo ? '#a1a1aa' : '#3f3f46', cursor: canUndo ? 'pointer' : 'default', display: 'flex', alignItems: 'center', padding: 6, borderRadius: 6 }} title="Undo"><Undo2 size={16} /></button>
                    <button onClick={redo} disabled={!canRedo} style={{ background: 'none', border: 'none', color: canRedo ? '#a1a1aa' : '#3f3f46', cursor: canRedo ? 'pointer' : 'default', display: 'flex', alignItems: 'center', padding: 6, borderRadius: 6 }} title="Redo"><Redo2 size={16} /></button>
                    <div style={{ width: 1, height: 20, background: 'rgba(255,255,255,0.08)' }} />
                    <button onClick={handleSave} style={{
                        background: 'linear-gradient(135deg, var(--primary-color), var(--secondary-color))',
                        border: 'none', color: '#fff', borderRadius: 8, padding: '7px 18px',
                        fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
                        boxShadow: '0 2px 12px rgba(79,104,248,0.35)',
                    }}>
                        <Save size={14} /> Publish
                    </button>
                </div>
            </div>

            {/* ── Main 3-panel area ── */}
            <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>

                {/* ── LEFT PANEL: Widget Library + Layers ── */}
                <div style={{ width: 260, flexShrink: 0, background: 'rgba(10,10,12,0.98)', borderRight: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                    {/* Tabs */}
                    <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.05)', flexShrink: 0 }}>
                        {[['widgets', '⊞ Widgets'], ['layers', '≡ Layers']].map(([tab, label]) => (
                            <button key={tab} onClick={() => setLeftTab(tab as any)} style={{
                                flex: 1, background: 'none', border: 'none', color: leftTab === tab ? '#fff' : '#52525b',
                                borderBottom: leftTab === tab ? '2px solid var(--primary-color)' : '2px solid transparent',
                                padding: '10px 0', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', transition: 'color 0.15s', letterSpacing: 0.3,
                            }}>{label}</button>
                        ))}
                    </div>

                    {leftTab === 'widgets' && (
                        <div style={{ flex: 1, overflowY: 'auto', padding: 12 }}>
                            <div style={{ position: 'relative', marginBottom: 12 }}>
                                <input
                                    value={widgetSearch} onChange={e => setWidgetSearch(e.target.value)}
                                    placeholder="Search widgets..."
                                    style={{ width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: '7px 12px 7px 32px', color: '#fff', fontSize: '0.8rem', boxSizing: 'border-box' }}
                                />
                                <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#52525b', pointerEvents: 'none', fontSize: 12 }}>🔍</span>
                            </div>
                            <div style={{ fontSize: '0.68rem', color: '#52525b', fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8, paddingLeft: 2 }}>SECTIONS</div>
                            {filteredWidgets.map(w => (
                                <button key={w.type} onClick={() => addBlock(w.type as LayoutBlock['type'])} style={{
                                    width: '100%', marginBottom: 6, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
                                    borderRadius: 10, padding: '10px 12px', cursor: 'pointer', textAlign: 'left',
                                    transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: 10,
                                    color: '#a1a1aa',
                                }}
                                    onMouseEnter={e => {
                                        (e.currentTarget as HTMLButtonElement).style.background = `${w.color}18`;
                                        (e.currentTarget as HTMLButtonElement).style.borderColor = `${w.color}50`;
                                    }}
                                    onMouseLeave={e => {
                                        (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.03)';
                                        (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.06)';
                                    }}
                                >
                                    <div style={{ width: 36, height: 36, borderRadius: 8, background: `${w.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>{w.icon}</div>
                                    <div>
                                        <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#fff', marginBottom: 2 }}>{w.label}</div>
                                        <div style={{ fontSize: '0.7rem', color: '#71717a', lineHeight: 1.3 }}>{w.desc}</div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}

                    {leftTab === 'layers' && (
                        <div style={{ flex: 1, overflowY: 'auto', padding: 12 }}>
                            <div style={{ fontSize: '0.68rem', color: '#52525b', fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 10, paddingLeft: 2 }}>LAYOUT LAYERS</div>
                            {layout.length === 0 && <div style={{ color: '#3f3f46', fontSize: '0.8rem', textAlign: 'center', marginTop: 20 }}>No blocks yet. Add from Widgets.</div>}
                            {layout.map((block, idx) => (
                                <div key={block.id} onClick={() => setSelectedId(block.id)} style={{
                                    display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', borderRadius: 8,
                                    marginBottom: 4, cursor: 'pointer',
                                    background: selectedId === block.id ? `${blockColor(block.type)}20` : 'rgba(255,255,255,0.02)',
                                    border: selectedId === block.id ? `1px solid ${blockColor(block.type)}50` : '1px solid transparent',
                                    transition: 'all 0.15s', opacity: block.style?.hidden ? 0.4 : 1,
                                }}>
                                    <span style={{ fontSize: 14 }}>{blockEmoji(block.type)}</span>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#e4e4e7', textTransform: 'capitalize' }}>{block.type.replace('_', ' ')}</div>
                                        <div style={{ fontSize: '0.65rem', color: '#52525b' }}>Layer {idx + 1}</div>
                                    </div>
                                    {block.style?.hidden && <EyeOff size={12} color="#52525b" />}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* ── CENTER CANVAS ── */}
                <div style={{ flex: 1, overflowY: 'auto', background: '#131316', position: 'relative' }}>
                    <div style={{ maxWidth: typeof canvasWidth === 'number' ? canvasWidth : '100%', margin: '0 auto', padding: '24px 20px', transition: 'max-width 0.3s' }}>
                        {layout.length === 0 && (
                            <div style={{ border: '2px dashed rgba(255,255,255,0.08)', borderRadius: 16, padding: 60, textAlign: 'center', color: '#3f3f46' }}>
                                <div style={{ fontSize: 48, marginBottom: 16 }}>✦</div>
                                <div style={{ fontWeight: 700, fontSize: '1.1rem', color: '#52525b', marginBottom: 8 }}>Your canvas is empty</div>
                                <div style={{ fontSize: '0.85rem' }}>Add a section from the Widgets panel on the left</div>
                            </div>
                        )}

                        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                            <SortableContext items={layout.map(b => b.id)} strategy={verticalListSortingStrategy}>
                                {layout.map(b => (
                                    <SortableCanvasBlock
                                        key={b.id}
                                        block={b as ExtendedBlock}
                                        isSelected={selectedId === b.id}
                                        onSelect={() => { setSelectedId(b.id); setInspectorTab('content'); }}
                                        onDelete={deleteBlock}
                                        onDuplicate={duplicateBlock}
                                        onVisibilityToggle={toggleVisibility}
                                        scaleFactor={1}
                                    />
                                ))}
                            </SortableContext>
                        </DndContext>

                        {/* Add Section button at bottom */}
                        <button onClick={() => setLeftTab('widgets')} style={{
                            width: '100%', marginTop: 8, padding: '14px 0', borderRadius: 12, cursor: 'pointer',
                            background: 'transparent', border: '2px dashed rgba(255,255,255,0.08)', color: '#52525b',
                            fontSize: '0.85rem', fontWeight: 500, transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                        }}
                            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--primary-color)'; (e.currentTarget as HTMLButtonElement).style.color = '#fff'; }}
                            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.08)'; (e.currentTarget as HTMLButtonElement).style.color = '#52525b'; }}
                        >
                            <Plus size={16} /> Add Section
                        </button>
                    </div>
                </div>

                {/* ── RIGHT PANEL: Inspector ── */}
                <div style={{ width: 300, flexShrink: 0, background: 'rgba(10,10,12,0.98)', borderLeft: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                    {selectedBlock ? (
                        <>
                            {/* Block identity header */}
                            <div style={{ padding: '14px 16px', borderBottom: '1px solid rgba(255,255,255,0.05)', flexShrink: 0 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                    <div style={{ width: 36, height: 36, borderRadius: 10, background: `${blockColor(selectedBlock.type)}25`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>
                                        {blockEmoji(selectedBlock.type)}
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fff', textTransform: 'capitalize' }}>{selectedBlock.type.replace('_', ' ')}</div>
                                        <div style={{ fontSize: '0.7rem', color: '#52525b' }}>ID: {selectedBlock.id.slice(-8)}</div>
                                    </div>
                                    <button onClick={() => setSelectedId(null)} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: '#52525b', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: 4 }}>
                                        <X size={14} />
                                    </button>
                                </div>
                            </div>

                            {/* Tab bar */}
                            <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.05)', flexShrink: 0 }}>
                                {([['content', '📝', 'Content'], ['style', '🎨', 'Style'], ['advanced', '⚙️', 'Advanced']] as const).map(([tab, icon, label]) => (
                                    <button key={tab} onClick={() => setInspectorTab(tab)} style={{
                                        flex: 1, background: 'none', border: 'none', color: inspectorTab === tab ? '#fff' : '#52525b',
                                        borderBottom: inspectorTab === tab ? '2px solid var(--primary-color)' : '2px solid transparent',
                                        padding: '9px 4px', fontSize: '0.72rem', fontWeight: 600, cursor: 'pointer', transition: 'color 0.15s',
                                        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
                                    }}>
                                        <span>{icon}</span>
                                        <span>{label}</span>
                                    </button>
                                ))}
                            </div>

                            {/* Tab content */}
                            <div style={{ flex: 1, overflowY: 'auto', padding: '12px 0' }}>
                                {inspectorTab === 'content' && (
                                    <ContentInspector block={selectedBlock} updateConfig={updateConfig} />
                                )}
                                {inspectorTab === 'style' && (
                                    <StyleInspector block={selectedBlock} updateStyle={updateStyle} />
                                )}
                                {inspectorTab === 'advanced' && (
                                    <AdvancedInspector block={selectedBlock} updateStyle={updateStyle} />
                                )}
                            </div>
                        </>
                    ) : (
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#3f3f46', padding: 24, textAlign: 'center' }}>
                            <div style={{ fontSize: 48, marginBottom: 16, opacity: 0.5 }}>🖱️</div>
                            <div style={{ fontWeight: 700, color: '#52525b', marginBottom: 8 }}>Select a section</div>
                            <div style={{ fontSize: '0.8rem' }}>Click any section in the canvas to edit its content and styles</div>
                        </div>
                    )}
                </div>
            </div>

            <style>{`
        .canvas-hover-overlay:hover { background: rgba(255,255,255,0.02) !important; }
        input[type=range] { -webkit-appearance: none; appearance: none; height: 4px; border-radius: 2px; outline: none; background: rgba(255,255,255,0.1); }
        input[type=range]::-webkit-slider-thumb { -webkit-appearance: none; width: 16px; height: 16px; border-radius: 50%; background: var(--primary-color); cursor: pointer; border: 2px solid rgba(255,255,255,0.2); }
        ::-webkit-scrollbar { width: 4px; height: 4px; } ::-webkit-scrollbar-track { background: transparent; } ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 2px; }
        select option { background: #1c1c1e; color: #fff; }
      `}</style>
        </div>
    );
};

export default PageBuilder;
