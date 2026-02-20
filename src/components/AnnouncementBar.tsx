import React, { useState, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { X, BellRing, ChevronRight, ChevronLeft } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

const AnnouncementBar: React.FC = () => {
    const { settings } = useStore();
    const [isVisible, setIsVisible] = useState(true);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [animDir, setAnimDir] = useState<'in' | 'out'>('in');

    // Support array of messages or single string (backward compat)
    const messages: { text: string; link?: string }[] = (() => {
        const raw = (settings as any).announcementMessages;
        if (Array.isArray(raw) && raw.length > 0) return raw;
        if (settings.announcementText) return [{ text: settings.announcementText }];
        return [];
    })();

    useEffect(() => {
        if (messages.length <= 1) return;
        const timer = setInterval(() => {
            setAnimDir('out');
            setTimeout(() => {
                setCurrentIndex(i => (i + 1) % messages.length);
                setAnimDir('in');
            }, 300);
        }, 5000);
        return () => clearInterval(timer);
    }, [messages.length]);

    const navigate = (dir: 1 | -1) => {
        setAnimDir('out');
        setTimeout(() => {
            setCurrentIndex(i => (i + dir + messages.length) % messages.length);
            setAnimDir('in');
        }, 200);
    };

    if (!messages.length || !isVisible) return null;

    const current = messages[currentIndex];

    return (
        <>
            <style>{`
                @keyframes abSlideIn { from { opacity: 0; transform: translateY(-6px); } to { opacity: 1; transform: translateY(0); } }
                @keyframes abSlideOut { from { opacity: 1; transform: translateY(0); } to { opacity: 0; transform: translateY(6px); } }
                .ab-text-in { animation: abSlideIn 0.3s ease forwards; }
                .ab-text-out { animation: abSlideOut 0.3s ease forwards; }
                .ab-nav-btn:hover { background: rgba(0,0,0,0.3) !important; }
            `}</style>
            <div style={{
                background: 'linear-gradient(90deg, var(--primary-color,#4f68f8) 0%, var(--secondary-color,#6d28d9) 100%)',
                color: '#fff', position: 'relative', zIndex: 200,
                padding: '9px 52px', textAlign: 'center',
                fontSize: '0.85rem', fontWeight: 500,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                boxShadow: '0 2px 16px rgba(79,104,248,0.35)',
                minHeight: 38,
            }}>
                <BellRing size={14} style={{ flexShrink: 0 }} />
                {/* Multi-message arrows */}
                {messages.length > 1 && (
                    <button className="ab-nav-btn" onClick={() => navigate(-1)} style={{
                        background: 'rgba(0,0,0,0.2)', border: 'none', color: '#fff', borderRadius: 4,
                        width: 22, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center',
                        cursor: 'pointer', padding: 0, flexShrink: 0, transition: 'background 0.2s',
                    }}>
                        <ChevronLeft size={14} />
                    </button>
                )}
                {/* Message content */}
                <div className={animDir === 'in' ? 'ab-text-in' : 'ab-text-out'}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', justifyContent: 'center', maxWidth: '80vw' }}>
                    <span className="announcement-markdown" style={{ display: 'inline' }}>
                        <ReactMarkdown
                            components={{
                                p: ({ node, ...props }) => <span style={{ margin: 0 }} {...props} />,
                                a: ({ node, ...props }) => <a style={{ color: '#fff', textDecoration: 'underline', fontWeight: 700 }} target="_blank" rel="noreferrer" {...props} />,
                                strong: ({ node, ...props }) => <strong style={{ fontWeight: 700 }} {...props} />,
                            }}
                        >{current.text}</ReactMarkdown>
                    </span>
                    {current.link && (
                        <a href={current.link} target="_blank" rel="noreferrer" style={{
                            display: 'inline-flex', alignItems: 'center', gap: 3, color: '#fff',
                            background: 'rgba(255,255,255,0.2)', borderRadius: 20, padding: '2px 10px',
                            fontSize: '0.78rem', fontWeight: 700, textDecoration: 'none', flexShrink: 0,
                            border: '1px solid rgba(255,255,255,0.3)',
                        }}>
                            Learn more <ChevronRight size={12} />
                        </a>
                    )}
                </div>
                {messages.length > 1 && (
                    <button className="ab-nav-btn" onClick={() => navigate(1)} style={{
                        background: 'rgba(0,0,0,0.2)', border: 'none', color: '#fff', borderRadius: 4,
                        width: 22, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center',
                        cursor: 'pointer', padding: 0, flexShrink: 0, transition: 'background 0.2s',
                    }}>
                        <ChevronRight size={14} />
                    </button>
                )}
                {/* Dots */}
                {messages.length > 1 && (
                    <div style={{ display: 'flex', gap: 4, position: 'absolute', bottom: 3, left: '50%', transform: 'translateX(-50%)' }}>
                        {messages.map((_, i) => (
                            <div key={i} onClick={() => setCurrentIndex(i)} style={{
                                width: i === currentIndex ? 16 : 5, height: 5, borderRadius: 3,
                                background: i === currentIndex ? '#fff' : 'rgba(255,255,255,0.4)',
                                cursor: 'pointer', transition: 'all 0.3s',
                            }} />
                        ))}
                    </div>
                )}
                <button onClick={() => setIsVisible(false)} aria-label="Close" style={{
                    position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                    background: 'rgba(0,0,0,0.25)', border: '1px solid rgba(255,255,255,0.25)', color: '#fff',
                    width: 22, height: 22, borderRadius: '50%', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', cursor: 'pointer', padding: 0, flexShrink: 0,
                }}>
                    <X size={11} />
                </button>
            </div>
        </>
    );
};

export default AnnouncementBar;
