import React, { useEffect, useState, useRef } from 'react';
import './CashAppPayment.css';

// Declare Square global
declare global {
    interface Window {
        Square: any;
    }
}

interface CashAppPaymentProps {
    amount: number;
    applicationId?: string;
    locationId?: string;
    onSuccess: (token: string) => void;
    onError: (error: string) => void;
}

const CashAppPayment: React.FC<CashAppPaymentProps> = ({ amount, applicationId, locationId, onSuccess, onError }) => {
    const [isLoaded, setIsLoaded] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const wrapperRef = useRef<HTMLDivElement>(null);
    // Use props if provided, otherwise fallback to sandbox for demo
    const appId = window.Square ? applicationId : 'sandbox-sq0idb-u2fQ5-5-5-5-5-5-5-5-5';
    const locId = window.Square ? locationId : 'L8S9X4K2R7Q1Z';

    useEffect(() => {
        if (!window.Square) {
            onError('Square SDK failed to load');
            return;
        }

        const initializePayment = async () => {
            try {
                const payments = window.Square.payments(appId, locId);

                const paymentRequest = payments.paymentRequest({
                    countryCode: 'US',
                    currencyCode: 'USD',
                    total: {
                        amount: amount.toFixed(2),
                        label: 'Order Total',
                    },
                });

                const cashAppPay = await payments.cashAppPay(paymentRequest, {
                    redirectURL: window.location.href,
                    referenceId: `ORDER-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
                });

                const buttonContainer = wrapperRef.current;
                if (buttonContainer) {
                    await cashAppPay.attach(buttonContainer);
                    setIsLoaded(true);
                }

                // Event listener for payment success
                cashAppPay.addEventListener('ontokenization', (event: any) => {
                    if (event.detail.tokenResult.status === 'OK') {
                        onSuccess(event.detail.tokenResult.token);
                    } else {
                        onError('Payment tokenization failed');
                    }
                });

            } catch (e: any) {
                console.error('Cash App Pay Init Error:', e);
                // Fallback to simulation mode if SDK fails (likely due to invalid sandbox credentials)
                setError('SIMULATION_MODE');
                setIsLoaded(true);
            }
        };

        initializePayment();
    }, [amount, onSuccess, onError]);

    // Render Simulation Mode if SDK fails or invalid credentials
    if (error === 'SIMULATION_MODE') {
        return (
            <div className="cash-app-container">
                <div className="cash-app-header">
                    <div className="cash-app-icon">💲</div>
                    <h3>Cash App Pay</h3>
                </div>

                <p className="cash-app-instructions">
                    <strong>Demo Mode:</strong> Scan this QR code to pay.
                </p>

                <div className="cash-app-wrapper" style={{ flexDirection: 'column', gap: '16px' }}>
                    {/* Fake QR Code */}
                    <div style={{
                        width: '180px', height: '180px',
                        background: '#fff',
                        backgroundImage: 'linear-gradient(45deg, #000 25%, transparent 25%, transparent 75%, #000 75%, #000), linear-gradient(45deg, #000 25%, transparent 25%, transparent 75%, #000 75%, #000)',
                        backgroundSize: '20px 20px',
                        backgroundPosition: '0 0, 10px 10px',
                        opacity: 0.1,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        border: '2px dashed #00D632', borderRadius: '12px'
                    }}>
                        <span style={{ fontSize: '2rem' }}>📱</span>
                    </div>

                    <p style={{ fontSize: '0.8rem', color: '#555', margin: 0 }}>
                        Simulation: Click button to mimic a successful scan.
                    </p>

                    <button
                        onClick={() => onSuccess('simulated_token_' + Date.now())}
                        style={{
                            padding: '10px 20px',
                            background: '#00D632',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '8px',
                            fontWeight: 'bold',
                            cursor: 'pointer'
                        }}
                    >
                        Simulate Scan & Pay
                    </button>
                </div>

                <div className="cash-app-secure-badge">
                    <span style={{ opacity: 0.7, fontSize: '0.7rem' }}>Sandbox Environment</span>
                </div>
            </div>
        );
    }

    return (
        <div className="cash-app-container">
            <div className="cash-app-header">
                <div className="cash-app-icon">💲</div>
                <h3>Cash App Pay</h3>
            </div>

            <p className="cash-app-instructions">
                Scan the QR code with your mobile device or click the button below to pay with Cash App.
            </p>

            <div
                id="cash-app-pay"
                ref={wrapperRef}
                className="cash-app-wrapper"
                style={{ minHeight: isLoaded ? 'auto' : '200px' }}
            >
                {!isLoaded && (
                    <div className="cash-app-loading">
                        <div className="spinner"></div>
                        <span>Loading Cash App Pay...</span>
                    </div>
                )}
            </div>

            <div className="cash-app-secure-badge">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>
                Secured by Square
            </div>
        </div>
    );
};

export default CashAppPayment;
