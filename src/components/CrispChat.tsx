import React, { useEffect } from 'react';
import { useStore } from '../context/StoreContext';

const CrispChat: React.FC = () => {
    const { settings } = useStore();
    const websiteId = settings.apps?.crispWebsiteId;

    useEffect(() => {
        if (!websiteId) return;

        // Initialize Crisp
        window.$crisp = [];
        window.CRISP_WEBSITE_ID = websiteId;

        const d = document;
        const s = d.createElement("script");
        s.src = "https://client.crisp.chat/l.js";
        s.async = 1;
        d.getElementsByTagName("head")[0].appendChild(s);

        return () => {
            // Optional: cleanup crisp script if needed, though usually it just stays injected
        };
    }, [websiteId]);

    return null; // This component doesn't render anything visible directly
};

export default CrispChat;
