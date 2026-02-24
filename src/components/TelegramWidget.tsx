import React from 'react';
import { useStore } from '../context/StoreContext';
import { Send } from 'lucide-react';

const TelegramWidget: React.FC = () => {
    const { settings } = useStore();
    const telegramUsername = settings.apps?.telegramUsername;

    if (!telegramUsername) return null;

    return (
        <a
            href={`https://t.me/${telegramUsername}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
                position: 'fixed',
                bottom: '24px',
                right: '24px',
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                backgroundColor: '#229ED9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(34, 158, 217, 0.4)',
                cursor: 'pointer',
                zIndex: 9999,
                transition: 'transform 0.2s',
            }}
            onMouseOver={(e) => (e.currentTarget.style.transform = 'scale(1.1)')}
            onMouseOut={(e) => (e.currentTarget.style.transform = 'scale(1)')}
        >
            <Send size={28} color="#ffffff" style={{ marginLeft: '-2px', marginTop: '2px' }} />
        </a>
    );
};

export default TelegramWidget;
