import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { X, ChevronUp } from 'lucide-react';

// Discord logo SVG as inline component
const DiscordIcon: React.FC<{ size?: number; color?: string }> = ({ size = 20, color = '#fff' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
        <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
    </svg>
);

const DiscordWidget: React.FC = () => {
    const { settings } = useStore();
    const [expanded, setExpanded] = useState(false);

    // Get Discord server ID from socials config
    const discordServerId = (settings.socials as any)?.discordServerId;
    const discordEnabled = (settings.socials as any)?.discordWidgetEnabled !== false;

    if (!discordEnabled || !discordServerId) return null;

    return (
        <>
            <style>{`
                @keyframes discordSlideIn {
                    from { opacity: 0; transform: translateY(16px) scale(0.96); }
                    to { opacity: 1; transform: translateY(0) scale(1); }
                }
                .discord-pill:hover { background: #5865F2 !important; transform: scale(1.05); }
                .discord-pill { transition: all 0.2s cubic-bezier(0.34,1.56,0.64,1); }
            `}</style>
            <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 8998, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 10 }}>
                {/* Expanded widget panel */}
                {expanded && (
                    <div style={{
                        animation: 'discordSlideIn 0.35s cubic-bezier(0.16,1,0.3,1)',
                        borderRadius: 18, overflow: 'hidden',
                        border: '1px solid rgba(88,101,242,0.3)',
                        boxShadow: '0 20px 60px rgba(0,0,0,0.7), 0 0 0 1px rgba(88,101,242,0.1)',
                        background: 'rgba(10,10,18,0.98)',
                        backdropFilter: 'blur(20px)',
                    }}>
                        {/* Header */}
                        <div style={{
                            background: 'linear-gradient(135deg, #5865F2, #4752C4)',
                            padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <DiscordIcon size={18} />
                                <span style={{ fontWeight: 700, color: '#fff', fontSize: '0.9rem' }}>Join our Discord</span>
                            </div>
                            <button onClick={() => setExpanded(false)} style={{
                                background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: 6,
                                padding: '4px 6px', cursor: 'pointer', color: '#fff', display: 'flex', alignItems: 'center',
                                transition: 'background 0.2s',
                            }}>
                                <ChevronUp size={14} />
                            </button>
                        </div>
                        {/* Discord iframe widget */}
                        <iframe
                            src={`https://discord.com/widget?id=${discordServerId}&theme=dark`}
                            width="350"
                            height="500"
                            allowTransparency={true}
                            frameBorder="0"
                            sandbox="allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts"
                            title="Discord Server Widget"
                            style={{ display: 'block' }}
                        />
                    </div>
                )}
                {/* Pill button */}
                {!expanded && (
                    <button
                        className="discord-pill"
                        onClick={() => setExpanded(true)}
                        style={{
                            background: '#5865F2',
                            border: 'none', borderRadius: 50,
                            padding: '12px 20px', display: 'flex', alignItems: 'center', gap: 10,
                            cursor: 'pointer', color: '#fff', fontWeight: 700, fontSize: '0.9rem',
                            boxShadow: '0 6px 24px rgba(88,101,242,0.45)',
                            fontFamily: 'inherit',
                        }}
                    >
                        <DiscordIcon size={20} />
                        <span>Join Discord</span>
                        {/* Pulse dot */}
                        <span style={{ position: 'relative', display: 'flex' }}>
                            <span style={{
                                width: 8, height: 8, borderRadius: '50%', background: '#4ade80',
                                boxShadow: '0 0 8px #4ade80', display: 'block',
                            }} />
                        </span>
                    </button>
                )}
            </div>
        </>
    );
};

export default DiscordWidget;
