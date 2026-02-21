import React, { createContext, useContext, useState, useEffect, useRef, type ReactNode } from 'react';
import axios from 'axios';
import { cashAppPoller, type VerificationEvent } from '../services/cashAppPoller';

const API_URL = import.meta.env.VITE_API_URL || '/api';

export interface LayoutBlock {
    id: string;
    type: 'hero' | 'popular_products' | 'features' | 'banner' | 'text_module';
    config: any;
}

interface StoreSettings {
    storeName: string;
    subdomain: string;
    email: string;
    accentColor: string;
    logoUrl: string;
    bannerUrl: string;
    faviconUrl?: string; // NEW
    productsSold: boolean;
    hideSoldOutProducts?: boolean; // NEW
    maintenanceMode: boolean;
    purchaseAlerts: boolean | { enabled: boolean; names: string; products: string; };
    automaticFeedback?: boolean; // NEW
    allowVpnCheckout?: boolean; // NEW
    announcementText?: string; // NEW
    termsOfService?: string; // NEW
    customDomain?: string; // NEW
    storePopup?: { // NEW
        enabled: boolean;
        message: string;
        countdownDays?: number;
    };
    socials: {
        discord?: string;
        telegram?: string;
        youtube?: string;
        tiktok?: string;
    };
    seo: {
        title: string;
        description: string;
    };
    notifications?: {
        orderCompletion: { dashboard: boolean; email: boolean; emailAddress: string; discord: string; telegramBotToken: string; telegramChatId: string };
        outOfStock: { dashboard: boolean; email: boolean; emailAddress: string; discord: string; telegramBotToken: string; telegramChatId: string };
        restock: { dashboard: boolean; email: boolean; emailAddress: string; discord: string; telegramBotToken: string; telegramChatId: string };
    };
    homeLayout?: LayoutBlock[]; // NEW DND PAGE BUILDER
}

export interface CartItem {
    id: number;
    name: string;
    price: number;
    quantity: number;
    image: string;
    originalPrice?: number; // original price before coupon
    appliedCoupon?: string; // coupon code already applied to this item
}

export interface ProductVariant {
    id: string;
    name: string;
    price: number;
}

export interface Product {
    id: string;
    name: string;
    price: number;
    description: string;
    imageUrl?: string;
    images?: string[];
    slug?: string;
    shortDescription?: string;
    status?: 'active' | 'draft' | 'hidden';
    featured?: boolean;
    stockCap?: number | null;
    payWhatYouWant?: boolean;
    variants?: ProductVariant[];
    metaTitle?: string;
    metaDescription?: string;
    categoryIds: string[];
    createdAt: string;
}

export interface Category {
    id: string;
    name: string;
    imageUrl?: string;
    productIds: string[]; // Helper for quick lookup, though we can filter products too
    createdAt: string;
}

export interface Coupon {
    id: string;
    code: string;
    type: 'fixed' | 'percentage';
    value: number;
    status: 'active' | 'expired' | 'disabled';
    usageLimit?: number | null;
    usageCount: number;
    startDate?: string | null;
    expiryDate?: string | null;
    productIds?: string[];
    createdAt: string;
}

export interface Referral {
    id: string;
    code: string;
    userEmail: string;
    referralType: 'first_time' | 'recurring';
    rewardMultiplier: number;
    usageCount: number;
    totalEarned: number;
    status: 'active' | 'disabled';
    createdAt: string;
}

export interface GameStatusProduct {
    name: string;
    status: 'UNDETECTED' | 'UPDATING' | 'RISKY' | 'DOWN' | 'TESTING' | 'OFFLINE';
    details: { label: string; value: string }[];
}

export interface GameStatusGroup {
    id: string;
    game: string;
    products: GameStatusProduct[];
}

export interface GiftCard {
    id: string;
    code: string;
    amount: number;
    currency: string;
    message: string; // HTML content from rich text editor
    status: 'active' | 'redeemed' | 'expired';
    expiryDate: string | null;
    createdAt: string;
    redeemedBy?: string; // User ID or email if redeemed
    redeemedAt?: string;
}

export interface PaymentGateway {
    id: string;
    name: string;
    description: string;
    connected: boolean;
    // Generic
    apiKey?: string;
    secretKey?: string;
    webhookUrl?: string;
    webhookSecret?: string;
    acceptedOptions?: string[];
    testMode?: boolean;
    // Stripe
    publishableKey?: string;
    // PayPal API
    paypalClientId?: string;
    paypalSandboxClientId?: string;
    // PayPal P2P
    paypalMeUrl?: string;
    paypalEmail?: string;
    paypalQrUrl?: string;
    // Square
    squareAppId?: string;
    squareLocationId?: string;
    squareSandboxAppId?: string;
    // Coinbase Commerce
    coinbaseApiKey?: string;
    coinbaseWebhookSecret?: string;
    // CashApp
    cashTag?: string;
    cashAppQrUrl?: string;
    cashAppEmail?: string;
    gmailEmail?: string;
    gmailAppPassword?: string;
    autoDetect?: boolean;
    pollingInterval?: number;
    // Customer Balance
    clientToken?: string;
}

export interface ManualPaymentMethod {
    id: string;
    name: string;
    instructions: string;
    enabled: boolean;
}

export interface CryptoAddress {
    id: string;
    coin: string;
    symbol: string;
    address: string;
    confirmations: number;
    fee: number;
    withdrawAll: boolean;
    color: string;
}

export interface PaymentSettings {
    gateways: PaymentGateway[];
    manualPayments: ManualPaymentMethod[];
    cryptoAddresses: CryptoAddress[];
}

export interface Order {
    id: string;
    date: string;
    items: { name: string; price: number; quantity: number; image: string }[];
    total: number;
    status: 'completed' | 'pending' | 'cancelled';
    paymentMethod: string;
    orderNote?: string;
    customerEmail?: string;
    adminNotes?: { id: string; text: string; createdAt: string }[];
}

export interface User {
    id: string;
    email: string;
    password: string;
    createdAt: string;
    balance: number;
    orders: Order[];
    tags?: string[];
}

interface StoreContextType {
    settings: StoreSettings;
    updateSettings: (newSettings: Partial<StoreSettings>) => void;
    cart: CartItem[];
    addToCart: (item: CartItem) => void;
    removeFromCart: (id: number) => void;
    clearCart: () => void;

    // Products & Categories
    products: Product[];
    categories: Category[];
    addProduct: (product: Omit<Product, 'id' | 'createdAt'>) => void;
    updateProduct: (id: string, updates: Partial<Product>) => void;
    deleteProduct: (id: string) => void;
    addCategory: (category: Omit<Category, 'id' | 'createdAt'>) => void;
    updateCategory: (id: string, updates: Partial<Category>) => void;
    deleteCategory: (id: string) => void;

    // Coupons
    coupons: Coupon[];
    addCoupon: (coupon: Omit<Coupon, 'id' | 'createdAt' | 'usageCount'>) => void;
    updateCoupon: (id: string, updates: Partial<Coupon>) => void;
    deleteCoupon: (id: string) => void;
    applyCoupon: (code: string, subtotal: number, productId?: string) => { valid: boolean; discount: number; message: string };

    // Referrals
    referrals: Referral[];
    addReferral: (referral: Omit<Referral, 'id' | 'createdAt' | 'usageCount' | 'totalEarned'>) => void;
    updateReferral: (id: string, updates: Partial<Referral>) => void;
    deleteReferral: (id: string) => void;

    // Game Statuses
    gameStatuses: GameStatusGroup[];
    addGameStatus: (game: string, products?: GameStatusProduct[]) => void;
    updateGameStatus: (id: string, updates: Partial<GameStatusGroup>) => void;
    deleteGameStatus: (id: string) => void;
    addServiceToGame: (gameId: string, service: GameStatusProduct) => void;
    updateServiceInGame: (gameId: string, serviceIndex: number, updates: Partial<GameStatusProduct>) => void;
    deleteServiceFromGame: (gameId: string, serviceIndex: number) => void;

    // Gift Cards
    giftCards: GiftCard[];
    addGiftCard: (card: Omit<GiftCard, 'id' | 'createdAt' | 'status'>) => void;
    updateGiftCard: (id: string, updates: Partial<GiftCard>) => void;
    deleteGiftCard: (id: string) => void;

    // Payment Settings
    paymentSettings: PaymentSettings;
    updatePaymentGateway: (id: string, updates: Partial<PaymentGateway>) => void;
    addManualPayment: (payment: Omit<ManualPaymentMethod, 'id'>) => void;
    updateManualPayment: (id: string, updates: Partial<ManualPaymentMethod>) => void;
    deleteManualPayment: (id: string) => void;
    addCryptoAddress: (address: Omit<CryptoAddress, 'id'>) => void;
    updateCryptoAddress: (id: string, updates: Partial<CryptoAddress>) => void;
    deleteCryptoAddress: (id: string) => void;

    // Auth
    users: User[];
    currentUser: User | null;
    signup: (email: string, password: string) => { success: boolean; message: string };
    login: (email: string, password: string) => { success: boolean; message: string };
    logout: () => void;
    addOrder: (order: Omit<Order, 'id' | 'date'>) => void;
    markOrderPaid: (orderId: string) => void;
    updateBalance: (amount: number) => void;

    // CashApp auto-verification
    verificationLog: VerificationEvent[];
    pollerRunning: boolean;
    // New actions
    addOrderNote: (orderId: string, text: string) => void;
    updateUser: (userId: string, updates: Partial<User>) => void;
}

const defaultSettings: StoreSettings = {
    storeName: 'Lyphen',
    subdomain: 'Lyphen.camunlocks.cx',
    email: 'support@lyphen.com',
    accentColor: 'var(--secondary-color)',
    logoUrl: '/logo.png',
    bannerUrl: '',
    faviconUrl: '',
    productsSold: false,
    hideSoldOutProducts: false,
    maintenanceMode: false,
    purchaseAlerts: {
        enabled: true,
        names: 'Mikki, Alex, Jordan, Sam, Taylor, Casey, Riley',
        products: 'Premium Subscription, Lifetime License, API Access Token, Starter Pack'
    },
    automaticFeedback: true,
    allowVpnCheckout: true,
    announcementText: 'This is where you can write your store announcement!\n\n- You can use markdown to style your text\n- You can add images and videos\n- You can add links',
    termsOfService: '',
    customDomain: '',
    storePopup: {
        enabled: false,
        message: 'Welcome to our store!',
        countdownDays: 0
    },
    socials: {},
    seo: {
        title: 'Lyphen',
        description: 'Best game store'
    },
    notifications: {
        orderCompletion: { dashboard: false, email: false, emailAddress: '', discord: '', telegramBotToken: '', telegramChatId: '' },
        outOfStock: { dashboard: false, email: false, emailAddress: '', discord: '', telegramBotToken: '', telegramChatId: '' },
        restock: { dashboard: false, email: false, emailAddress: '', discord: '', telegramBotToken: '', telegramChatId: '' }
    },
    homeLayout: [
        {
            id: 'block-1',
            type: 'hero',
            config: {
                title: 'Fastest <span class="orb-icon"><svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" /></svg></span> Safest<br />Cheats Marketplace',
                subtitle: 'Unleash your potential with powerful cheats. Dominate every match, outsmart opponents, and claim victory effortlessly. Win like never before!',
                buttonText: 'Shop Now',
                buttonLink: '#products',
                image: '/char.png'
            }
        },
        {
            id: 'block-2',
            type: 'popular_products',
            config: {
                title: 'Most Popular',
                count: 8
            }
        }
    ]
};

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [settings, setSettings] = useState<StoreSettings>(() => {
        const saved = localStorage.getItem('storeSettings');
        if (saved) {
            const parsed = JSON.parse(saved);
            // Handle legacy boolean purchaseAlerts migration
            if (typeof parsed.purchaseAlerts === 'boolean') {
                parsed.purchaseAlerts = {
                    enabled: parsed.purchaseAlerts,
                    names: 'Mikki, Alex, Jordan, Sam, Taylor, Casey, Riley',
                    products: 'Premium Subscription, Lifetime License, API Access Token, Starter Pack'
                };
            }
            if (!parsed.homeLayout) {
                parsed.homeLayout = defaultSettings.homeLayout;
            } else {
                // Migrate: fix broken /character.png → /char.png in any saved layout
                parsed.homeLayout = parsed.homeLayout.map((block: any) => {
                    if (block.config?.image === '/character.png') {
                        block = { ...block, config: { ...block.config, image: '/char.png' } };
                    }
                    // Restore original hero title if stale placeholder is found
                    if (block.type === 'hero' && block.config?.title === 'Dominate Every Match') {
                        block = { ...block, config: { ...block.config, ...defaultSettings.homeLayout![0].config } };
                    }
                    return block;
                });
            }
            return parsed;
        }
        return defaultSettings;
    });

    const [cart, setCart] = useState<CartItem[]>(() => {
        const saved = localStorage.getItem('cart');
        return saved ? JSON.parse(saved) : [];
    });

    const [products, setProducts] = useState<Product[]>(() => {
        const saved = localStorage.getItem('storeProducts');
        if (saved) {
            const parsed = JSON.parse(saved);
            if (parsed.length > 0) return parsed;
        }
        // Seed demo product
        return [{
            id: 'demo-bo6',
            name: 'BO6 AFK Bot Lobbies',
            price: 9.98,
            description: 'Maximize gameplay with our premium COD BO6 Bot Lobbies! Earn Camos, Weapon XP, and Player XP safely in live Activision matches. 300+ kills per match, no hacks/mods required on your end. Operates 24/7.',
            shortDescription: 'Premium bot lobbies for COD Black Ops 6. Safe, fast, 24/7.',
            imageUrl: '/demo-product-1.png',
            images: [
                '/demo-product-1.png',
                'https://placehold.co/800x450/0d0d12/818cf8?text=Gameplay+Preview&font=roboto',
                'https://placehold.co/800x450/0d0d12/4ade80?text=Camo+Unlocks&font=roboto',
            ],
            slug: 'cod-bo6-bot-lobby',
            status: 'active' as const,
            featured: true,
            variants: [
                { id: 'v1', name: 'Bot Lobby (Host)', price: 9.98 },
                { id: 'v2', name: '1 Hour Bot Lobby', price: 10.99 },
                { id: 'v3', name: 'Camo Unlock Service', price: 29.99 },
            ],
            metaTitle: 'BO6 AFK Bot Lobbies – COD Black Ops 6',
            metaDescription: 'Get 300+ kills per match with our premium bot lobbies. Unlock camos fast.',
            categoryIds: ['cat-fps'],
            createdAt: new Date().toISOString(),
        }];
    });

    const [categories, setCategories] = useState<Category[]>(() => {
        const saved = localStorage.getItem('storeCategories');
        if (saved) {
            const parsed = JSON.parse(saved);
            if (parsed.length > 1) return parsed; // more than just "All"
        }
        // Seed default categories
        return [
            { id: 'all', name: 'All', productIds: [], createdAt: new Date().toISOString() },
            { id: 'cat-fps', name: 'FPS Games', imageUrl: '', productIds: ['demo-bo6'], createdAt: new Date().toISOString() },
            { id: 'cat-rpg', name: 'RPG Games', imageUrl: '', productIds: [], createdAt: new Date().toISOString() },
        ];
    });

    const [coupons, setCoupons] = useState<Coupon[]>(() => {
        const saved = localStorage.getItem('storeCoupons');
        if (saved) {
            const parsed = JSON.parse(saved);
            if (parsed.length > 0) return parsed;
        }
        // Seed demo coupon
        return [{
            id: 'coupon-demo',
            code: 'DEMO',
            type: 'fixed' as const,
            value: 5,
            status: 'active' as const,
            usageLimit: null,
            usageCount: 0,
            startDate: null,
            expiryDate: null,
            productIds: [],
            createdAt: new Date().toISOString(),
        }];
    });

    const [referrals, setReferrals] = useState<Referral[]>(() => {
        const saved = localStorage.getItem('storeReferrals');
        return saved ? JSON.parse(saved) : [];
    });

    const [gameStatuses, setGameStatuses] = useState<GameStatusGroup[]>(() => {
        const saved = localStorage.getItem('gameStatuses');
        if (saved) {
            const parsed = JSON.parse(saved);
            if (parsed.length > 0) return parsed;
        }
        return [
            { id: 'gs-1', game: 'Active Matter', products: [{ name: 'Haze', status: 'UNDETECTED', details: [{ label: 'Undetected Since', value: 'Release' }] }] },
            { id: 'gs-2', game: 'Apex Legends', products: [{ name: 'Enhanced DMA', status: 'UNDETECTED', details: [{ label: 'Undetected Since', value: 'Release' }] }, { name: 'Fellas Apex', status: 'UNDETECTED', details: [{ label: 'Undetected Since', value: 'Release' }] }] },
            { id: 'gs-3', game: 'Arc Raiders', products: [{ name: 'Eden DMA', status: 'UNDETECTED', details: [{ label: 'Undetected Since', value: 'Release' }] }, { name: 'Enhanced DMA', status: 'UNDETECTED', details: [{ label: 'Undetected Since', value: 'Release' }] }, { name: 'BBC DMA', status: 'UPDATING', details: [{ label: 'Undetected Since', value: 'Release' }] }, { name: 'Kern', status: 'UNDETECTED', details: [{ label: 'Undetected Since', value: '11/06/2025' }] }, { name: 'Sentinel', status: 'UPDATING', details: [{ label: 'Undetected Since', value: 'Release' }] }] },
            { id: 'gs-4', game: 'Arena Breakout: Infinite', products: [{ name: 'BBC DMA', status: 'UNDETECTED', details: [{ label: 'Undetected Since', value: 'Release' }] }, { name: 'Crooked Arms', status: 'RISKY', details: [{ label: 'Undetected Since', value: 'Release' }] }, { name: 'EZ ABI DMA', status: 'UNDETECTED', details: [{ label: 'Undetected Since', value: 'Release' }] }, { name: 'Rage', status: 'UNDETECTED', details: [{ label: 'Undetected Since', value: 'Release' }] }, { name: 'Unnamed', status: 'RISKY', details: [{ label: 'Undetected Since', value: '10/10/25' }] }] },
            { id: 'gs-5', game: 'Arma Reforger', products: [{ name: 'Kern', status: 'UNDETECTED', details: [{ label: 'Undetected Since', value: 'Release' }] }] },
            { id: 'gs-6', game: 'Battlefield', products: [{ name: 'BF1 Enhanced DMA', status: 'UNDETECTED', details: [{ label: 'Undetected Since', value: 'Release' }] }, { name: 'BFV Enhanced DMA', status: 'UNDETECTED', details: [{ label: 'Undetected Since', value: 'Release' }] }, { name: 'BF2042 Enhanced DMA', status: 'UNDETECTED', details: [{ label: 'Undetected Since', value: 'Release' }] }, { name: 'BF6 Enhanced DMA', status: 'UNDETECTED', details: [{ label: 'Undetected Since', value: 'Release' }] }, { name: 'Fecurity', status: 'RISKY', details: [{ label: 'Undetected Since', value: 'Release' }] }, { name: 'BF4 Satano', status: 'UNDETECTED', details: [{ label: 'Undetected Since', value: 'Release' }] }] },
            { id: 'gs-7', game: 'Black Squad', products: [{ name: 'Enhanced DMA', status: 'UNDETECTED', details: [{ label: 'Undetected Since', value: 'Release' }] }] },
            { id: 'gs-8', game: 'Borderlands', products: [{ name: 'BL4', status: 'UNDETECTED', details: [{ label: 'Undetected Since', value: 'Release' }] }] },
            { id: 'gs-9', game: 'Call of Duty', products: [{ name: 'Blurred DMA', status: 'UNDETECTED', details: [{ label: 'Undetected Since', value: 'Release' }] }, { name: 'Enhanced DMA BO7', status: 'UNDETECTED', details: [{ label: 'Undetected Since', value: 'Release' }] }, { name: 'Enhanced DMA COD Series', status: 'UNDETECTED', details: [{ label: 'Undetected Since', value: 'Release' }] }, { name: 'Fecurity', status: 'RISKY', details: [{ label: 'Undetected Since', value: '8/11/25' }] }, { name: 'Kern Black Ops 6', status: 'UNDETECTED', details: [{ label: 'Undetected Since', value: 'Release' }] }, { name: 'Kern Black Ops 7', status: 'TESTING', details: [{ label: 'Undetected Since', value: 'Release' }] }, { name: 'Kern MW3', status: 'UNDETECTED', details: [{ label: 'Undetected Since', value: 'Release' }] }] },
            { id: 'gs-10', game: 'Counter Strike 2', products: [{ name: 'Enhanced DMA', status: 'UNDETECTED', details: [{ label: 'Undetected Since', value: 'Release' }] }, { name: 'Kern', status: 'UNDETECTED', details: [{ label: 'Undetected Since', value: 'Release' }] }] },
            { id: 'gs-11', game: 'DMA Firmware', products: [{ name: 'Basic', status: 'UNDETECTED', details: [{ label: 'Undetected Since', value: 'Unknown' }] }, { name: 'Standard', status: 'UNDETECTED', details: [{ label: 'Undetected Since', value: 'Unknown' }] }, { name: 'Advanced', status: 'UNDETECTED', details: [{ label: 'Undetected Since', value: 'Unknown' }] }] },
            { id: 'gs-12', game: 'Dark and Darker', products: [{ name: 'Enhanced DMA', status: 'UNDETECTED', details: [{ label: 'Undetected Since', value: 'Release' }] }] },
            { id: 'gs-13', game: 'DayZ', products: [{ name: 'Crooked Arms', status: 'UNDETECTED', details: [{ label: 'Undetected Since', value: 'Release' }] }, { name: 'Kern', status: 'UNDETECTED', details: [{ label: 'Undetected Since', value: '1/1/2024' }] }, { name: 'Next Cheat Pro', status: 'UNDETECTED', details: [{ label: 'Undetected Since', value: 'Release' }] }] },
            { id: 'gs-14', game: 'Dead By Daylight', products: [{ name: 'Enhanced DMA', status: 'UNDETECTED', details: [{ label: 'Undetected Since', value: 'Release' }] }, { name: 'Rage', status: 'UNDETECTED', details: [{ label: 'Undetected Since', value: 'Release' }] }, { name: 'Sentinel', status: 'UPDATING', details: [{ label: 'Undetected Since', value: 'Release' }] }] },
            { id: 'gs-15', game: 'Deadlock', products: [{ name: 'Umbrella', status: 'UNDETECTED', details: [{ label: 'Undetected Since', value: 'Release' }] }] },
            { id: 'gs-16', game: 'Delta Force', products: [{ name: 'Eden DMA', status: 'UNDETECTED', details: [{ label: 'Undetected Since', value: 'Release' }] }, { name: 'Ez DF DMA', status: 'UNDETECTED', details: [{ label: 'Undetected Since', value: 'Release' }] }] },
            { id: 'gs-17', game: 'Destiny 2', products: [{ name: 'Eden DMA', status: 'UNDETECTED', details: [{ label: 'Undetected Since', value: 'Release' }] }, { name: 'Savage', status: 'UPDATING', details: [{ label: 'Undetected Since', value: 'Release' }] }] },
            { id: 'gs-18', game: 'Dota 2', products: [{ name: 'Umbrella', status: 'UNDETECTED', details: [{ label: 'Undetected Since', value: 'Release' }] }] },
            { id: 'gs-19', game: 'Dune Awakening', products: [{ name: 'Dull', status: 'UNDETECTED', details: [{ label: 'Undetected Since', value: 'Release' }] }] },
            { id: 'gs-20', game: 'Escape From Tarkov', products: [{ name: 'Crooked Arms', status: 'UPDATING', details: [{ label: 'Undetected Since', value: 'Release' }] }, { name: 'Fanta', status: 'UNDETECTED', details: [{ label: 'Undetected Since', value: '2/3/2023' }] }, { name: 'Fecurity', status: 'UNDETECTED', details: [{ label: 'Undetected Since', value: 'Release' }] }, { name: 'Flea Bot', status: 'UPDATING', details: [{ label: 'Undetected Since', value: 'Release' }] }, { name: 'KD Dropper', status: 'UPDATING', details: [{ label: 'Undetected Since', value: 'Release' }] }, { name: 'Kern', status: 'UNDETECTED', details: [{ label: 'Undetected Since', value: '1/1/2024' }] }, { name: 'Next Cheat Pro', status: 'UNDETECTED', details: [{ label: 'Undetected Since', value: '4/2/2025' }] }, { name: 'Revo DMA', status: 'UNDETECTED', details: [{ label: 'Undetected Since', value: 'Release' }] }] },
            { id: 'gs-21', game: 'Fortnite', products: [{ name: 'Blurred DMA', status: 'UNDETECTED', details: [{ label: 'Undetected Since', value: 'Release' }] }, { name: 'Sentinel', status: 'UPDATING', details: [{ label: 'Undetected Since', value: '10/10/25' }] }] },
            { id: 'gs-22', game: 'GTA V', products: [{ name: 'Elusive DMA', status: 'UNDETECTED', details: [{ label: 'Undetected Since', value: 'Release' }] }, { name: 'Macho FiveM', status: 'UNDETECTED', details: [{ label: 'Undetected Since', value: 'Release' }] }] },
            { id: 'gs-23', game: 'Hardware & Spoofers', products: [{ name: 'DMA Cards', status: 'UNDETECTED', details: [{ label: 'Undetected Since', value: 'Release' }] }, { name: 'BE Spoofer', status: 'UNDETECTED', details: [{ label: 'Undetected Since', value: 'Release' }] }] },
            { id: 'gs-24', game: 'Hell Divers 2', products: [{ name: 'Hell Tool', status: 'UNDETECTED', details: [{ label: 'Undetected Since', value: 'Release' }] }, { name: 'V2', status: 'UNDETECTED', details: [{ label: 'Undetected Since', value: 'Release' }] }] },
            { id: 'gs-25', game: 'Hell Let Loose', products: [{ name: 'Enhanced DMA', status: 'UNDETECTED', details: [{ label: 'Undetected Since', value: 'Release' }] }] },
            { id: 'gs-26', game: 'Hunt: Showdown', products: [{ name: 'Enhanced DMA', status: 'UNDETECTED', details: [{ label: 'Undetected Since', value: 'Release' }] }, { name: 'Satan', status: 'UNDETECTED', details: [{ label: 'Undetected Since', value: 'Release' }] }] },
            { id: 'gs-27', game: 'Kovaaks', products: [{ name: 'Enhanced DMA', status: 'UNDETECTED', details: [{ label: 'Undetected Since', value: 'Release' }] }] },
            { id: 'gs-28', game: 'Marvel Rivals', products: [{ name: 'Eden DMA', status: 'UNDETECTED', details: [{ label: 'Undetected Since', value: 'Release' }] }, { name: 'Kern', status: 'UNDETECTED', details: [{ label: 'Undetected Since', value: 'Release' }] }] },
            { id: 'gs-29', game: 'Mistfall Hunter', products: [{ name: 'Enhanced DMA', status: 'UPDATING', details: [{ label: 'Undetected Since', value: 'Release' }] }] },
            { id: 'gs-30', game: 'Off The Grid', products: [{ name: 'Enhanced DMA', status: 'UNDETECTED', details: [{ label: 'Undetected Since', value: 'Release' }] }] },
            { id: 'gs-31', game: 'Once Human', products: [{ name: 'Crusader', status: 'UNDETECTED', details: [{ label: 'Undetected Since', value: 'Release' }] }] },
            { id: 'gs-32', game: 'Overwatch 2', products: [{ name: 'Eden DMA', status: 'UNDETECTED', details: [{ label: 'Undetected Since', value: 'Release' }] }, { name: 'Enhanced DMA', status: 'UNDETECTED', details: [{ label: 'Undetected Since', value: 'Release' }] }] },
            { id: 'gs-33', game: 'PUBG', products: [{ name: 'Enhanced DMA', status: 'OFFLINE', details: [{ label: 'Undetected Since', value: 'Release' }] }] },
            { id: 'gs-34', game: 'Polygon', products: [{ name: 'Enhanced DMA', status: 'UNDETECTED', details: [{ label: 'Undetected Since', value: 'Release' }] }] },
            { id: 'gs-35', game: 'Rainbow 6: Siege', products: [{ name: 'Crusader', status: 'RISKY', details: [{ label: 'Undetected Since', value: 'Release' }] }] },
            { id: 'gs-36', game: 'Rocket League', products: [{ name: 'Phantom AI', status: 'RISKY', details: [{ label: 'Undetected Since', value: 'Release' }] }] },
            { id: 'gs-37', game: 'Rust', products: [{ name: 'Disconnect', status: 'RISKY', details: [{ label: 'Undetected Since', value: '3/2/2025' }] }, { name: 'Blurred DMA', status: 'UNDETECTED', details: [{ label: 'Undetected Since', value: 'Release' }] }] },
            { id: 'gs-38', game: 'Scum', products: [{ name: 'Santano', status: 'UNDETECTED', details: [{ label: 'Undetected Since', value: 'Release' }] }] },
            { id: 'gs-39', game: 'Sea of Thieves', products: [{ name: 'Sanction', status: 'UNDETECTED', details: [{ label: 'Undetected Since', value: 'Release' }] }] },
            { id: 'gs-40', game: 'The Finals', products: [{ name: 'Eden DMA', status: 'UNDETECTED', details: [{ label: 'Undetected Since', value: 'Release' }] }, { name: 'Enhanced DMA', status: 'UNDETECTED', details: [{ label: 'Undetected Since', value: 'Release' }] }, { name: 'Kern', status: 'UNDETECTED', details: [{ label: 'Undetected Since', value: 'Release' }] }] },
            { id: 'gs-41', game: 'Valorant', products: [{ name: 'Unnamed', status: 'RISKY', details: [{ label: 'Undetected Since', value: '12/13/2025' }] }] },
            { id: 'gs-42', game: 'War Thunder', products: [{ name: 'BallistaX', status: 'RISKY', details: [{ label: 'Undetected Since', value: '1/19/2026' }] }, { name: 'LC DMA', status: 'UNDETECTED', details: [{ label: 'Undetected Since', value: 'Release' }] }, { name: 'LC Pro', status: 'UPDATING', details: [{ label: 'Undetected Since', value: 'Release' }] }] },
            { id: 'gs-43', game: 'Where Wind Meets', products: [{ name: 'Trainer', status: 'RISKY', details: [{ label: 'Undetected Since', value: 'Release' }] }] },
        ] as GameStatusGroup[];
    });

    useEffect(() => {
        localStorage.setItem('storeSettings', JSON.stringify(settings));
        document.documentElement.style.setProperty('--accent-color', settings.accentColor);
        axios.put(`${API_URL}/store/sync`, { key: 'storeSettings', data: settings }).catch(() => { });
    }, [settings]);

    useEffect(() => {
        localStorage.setItem('cart', JSON.stringify(cart));
    }, [cart]);

    useEffect(() => {
        localStorage.setItem('storeProducts', JSON.stringify(products));
        axios.put(`${API_URL}/store/sync`, { key: 'storeProducts', data: products }).catch(() => { });
    }, [products]);

    useEffect(() => {
        localStorage.setItem('storeCategories', JSON.stringify(categories));
        axios.put(`${API_URL}/store/sync`, { key: 'storeCategories', data: categories }).catch(() => { });
    }, [categories]);

    useEffect(() => {
        localStorage.setItem('storeCoupons', JSON.stringify(coupons));
        axios.put(`${API_URL}/store/sync`, { key: 'storeCoupons', data: coupons }).catch(() => { });
    }, [coupons]);

    useEffect(() => {
        localStorage.setItem('storeReferrals', JSON.stringify(referrals));
        axios.put(`${API_URL}/store/sync`, { key: 'storeReferrals', data: referrals }).catch(() => { });
    }, [referrals]);

    useEffect(() => {
        localStorage.setItem('gameStatuses', JSON.stringify(gameStatuses));
        axios.put(`${API_URL}/store/sync`, { key: 'gameStatuses', data: gameStatuses }).catch(() => { });
    }, [gameStatuses]);

    const [giftCards, setGiftCards] = useState<GiftCard[]>(() => {
        const saved = localStorage.getItem('giftCards');
        return saved ? JSON.parse(saved) : [];
    });

    useEffect(() => {
        localStorage.setItem('giftCards', JSON.stringify(giftCards));
        axios.put(`${API_URL}/store/sync`, { key: 'giftCards', data: giftCards }).catch(() => { });
    }, [giftCards]);

    const defaultGateways: PaymentGateway[] = [
        { id: 'stripe', name: 'Stripe', description: 'Accept credit and debit cards via Stripe.', connected: false, acceptedOptions: ['Visa', 'Mastercard', 'Amex', 'Discover'] },
        { id: 'paypal-p2p', name: 'PayPal Friends & Family (P2P)', description: 'Accept PayPal P2P payments for zero transaction fees.', connected: false },
        { id: 'paypal-api', name: 'PayPal by API', description: 'Connect your PayPal business API for automated payments.', connected: false },
        { id: 'square', name: 'Square', description: 'Accept payments via your Square account.', connected: false },
        { id: 'coinbase', name: 'Coinbase Commerce', description: 'Accept cryptocurrency payments via Coinbase.', connected: false },
        { id: 'cashapp', name: 'Cash App', description: 'Automated Cash App payment detection via email receipt scanning.', connected: true, cashTag: '$camunlocksofficial', autoDetect: true, pollingInterval: 15, cashAppEmail: '', gmailEmail: '', gmailAppPassword: '' },
        { id: 'customer-balance', name: 'Customer Balance', description: 'Allow customers to pay using their account balance.', connected: false },
    ];

    const [paymentSettings, setPaymentSettings] = useState<PaymentSettings>(() => {
        const saved = localStorage.getItem('paymentSettings');
        if (saved) return JSON.parse(saved);
        return { gateways: defaultGateways, manualPayments: [], cryptoAddresses: [] };
    });

    useEffect(() => {
        localStorage.setItem('paymentSettings', JSON.stringify(paymentSettings));
        axios.put(`${API_URL}/store/sync`, { key: 'paymentSettings', data: paymentSettings }).catch(() => { });
    }, [paymentSettings]);

    // ─── Auth State ───
    const [users, setUsers] = useState<User[]>(() => {
        const saved = localStorage.getItem('storeUsers');
        return saved ? JSON.parse(saved) : [];
    });

    const [currentUser, setCurrentUser] = useState<User | null>(() => {
        const saved = localStorage.getItem('currentUser');
        return saved ? JSON.parse(saved) : null;
    });

    // ─── CashApp Auto-Verification ───
    const [verificationLog, setVerificationLog] = useState<VerificationEvent[]>([]);
    const [pollerRunning, setPollerRunning] = useState(false);
    const markOrderPaidRef = useRef<(id: string) => void>(() => { });

    // Boot the poller once on mount
    useEffect(() => {
        setPollerRunning(true);

        // Collect any pre-existing pending CashApp orders
        const saved = localStorage.getItem('storeUsers');
        const allUsers: User[] = saved ? JSON.parse(saved) : [];
        const pending = allUsers.flatMap(u =>
            u.orders
                .filter(o => o.paymentMethod === 'Cash App' && o.status === 'pending' && o.orderNote)
                .map(o => ({
                    orderId: o.id,
                    orderNote: o.orderNote!,
                    total: o.total,
                    submittedAt: new Date(o.date).getTime(),
                }))
        );

        cashAppPoller.start(
            pending,
            (orderId) => markOrderPaidRef.current(orderId),
            (event) => setVerificationLog(prev => [event, ...prev].slice(0, 100)),
        );

        // Fetch from MongoDB on load
        axios.get(`${API_URL}/store`)
            .then(res => {
                const data = res.data;
                if (!data) return;
                if (data.settings && Object.keys(data.settings).length > 0) setSettings(data.settings);
                if (data.products && data.products.length > 0) setProducts(data.products);
                if (data.categories && data.categories.length > 0) setCategories(data.categories);
                if (data.coupons && data.coupons.length > 0) setCoupons(data.coupons);
                if (data.referrals && data.referrals.length > 0) setReferrals(data.referrals);
                if (data.gameStatuses && data.gameStatuses.length > 0) setGameStatuses(data.gameStatuses);
                if (data.giftCards && data.giftCards.length > 0) setGiftCards(data.giftCards);
                if (data.paymentSettings && Object.keys(data.paymentSettings).length > 0) setPaymentSettings(data.paymentSettings);
                if (data.users && data.users.length > 0) setUsers(data.users);
            })
            .catch(err => console.error('Failed to load from MongoDB:', err));

        return () => {
            cashAppPoller.stop();
            setPollerRunning(false);
        };
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        localStorage.setItem('storeUsers', JSON.stringify(users));
        axios.put(`${API_URL}/store/sync`, { key: 'storeUsers', data: users }).catch(() => { });
        // Keep currentUser in sync with users array
        if (currentUser) {
            const fresh = users.find(u => u.id === currentUser.id);
            if (fresh && JSON.stringify(fresh) !== JSON.stringify(currentUser)) {
                setCurrentUser(fresh);
            }
        }
    }, [users]);

    useEffect(() => {
        if (currentUser) {
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
        } else {
            localStorage.removeItem('currentUser');
        }
    }, [currentUser]);

    const signup = (email: string, password: string): { success: boolean; message: string } => {
        const exists = users.find(u => u.email.toLowerCase() === email.toLowerCase());
        if (exists) return { success: false, message: 'An account with this email already exists.' };
        const newUser: User = {
            id: `user-${Date.now()}`,
            email,
            password,
            createdAt: new Date().toISOString(),
            balance: 0,
            orders: [],
        };
        setUsers(prev => [...prev, newUser]);
        setCurrentUser(newUser);
        return { success: true, message: 'Account created successfully!' };
    };

    const login = (email: string, password: string): { success: boolean; message: string } => {
        const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
        if (!user) return { success: false, message: 'No account found with this email.' };
        if (user.password !== password) return { success: false, message: 'Incorrect password.' };
        setCurrentUser(user);
        return { success: true, message: 'Logged in successfully!' };
    };

    const logout = () => {
        setCurrentUser(null);
    };

    const addOrder = (order: Omit<Order, 'id' | 'date'>) => {
        if (!currentUser) return;
        const newOrder: Order = {
            ...order,
            id: `ord-${Date.now()}`,
            date: new Date().toISOString(),
            customerEmail: currentUser.email
        };
        setUsers(prev => prev.map(u => u.id === currentUser.id ? { ...u, orders: [newOrder, ...u.orders] } : u));
        setCurrentUser(prev => prev ? { ...prev, orders: [newOrder, ...prev.orders] } : prev);

        // If this is a pending CashApp order, register it with the poller for auto-verification
        if (order.paymentMethod === 'Cash App' && order.status === 'pending' && order.orderNote) {
            cashAppPoller.addOrder({
                orderId: newOrder.id,
                orderNote: order.orderNote,
                total: order.total,
                submittedAt: Date.now(),
            });
        }
    };

    const markOrderPaid = (orderId: string) => {
        setUsers(prevUsers => {
            const updated = prevUsers.map(user => {
                const hasOrder = user.orders.some(o => o.id === orderId);
                if (!hasOrder) return user;
                return {
                    ...user,
                    orders: user.orders.map(o => o.id === orderId ? { ...o, status: 'completed' as const } : o)
                };
            });
            // Also sync current user if affected
            if (currentUser && currentUser.orders.some(o => o.id === orderId)) {
                setCurrentUser(updated.find(u => u.id === currentUser.id) || null);
            }
            return updated;
        });
    };

    // Keep markOrderPaidRef always pointing to the latest markOrderPaid so the
    // poller callback (set up once on mount) always uses the current function closure
    useEffect(() => { markOrderPaidRef.current = markOrderPaid; });

    const updateBalance = (amount: number) => {
        if (!currentUser) return;
        setUsers(prev => prev.map(u => u.id === currentUser.id ? { ...u, balance: u.balance + amount } : u));
        setCurrentUser(prev => prev ? { ...prev, balance: prev.balance + amount } : prev);
    };

    useEffect(() => {
        localStorage.setItem('paymentSettings', JSON.stringify(paymentSettings));
    }, [paymentSettings]);

    // Cross-tab sync: listen for localStorage changes from other tabs
    useEffect(() => {
        const handleStorageChange = (e: StorageEvent) => {
            if (!e.newValue) return;
            try {
                const parsed = JSON.parse(e.newValue);
                switch (e.key) {
                    case 'gameStatuses':
                        setGameStatuses(parsed);
                        break;
                    case 'storeProducts':
                        setProducts(parsed);
                        break;
                    case 'storeCategories':
                        setCategories(parsed);
                        break;
                    case 'storeCoupons':
                        setCoupons(parsed);
                        break;
                    case 'storeReferrals':
                        setReferrals(parsed);
                        break;
                    case 'storeSettings':
                        setSettings(parsed);
                        break;
                    case 'giftCards':
                        setGiftCards(parsed);
                        break;
                    case 'paymentSettings':
                        setPaymentSettings(parsed);
                        break;
                }
            } catch { /* ignore parse errors */ }
        };
        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    const addToCart = (item: CartItem) => {
        setCart(prev => {
            const existing = prev.find(i => i.id === item.id);
            if (existing) {
                return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + item.quantity } : i);
            }
            return [...prev, item];
        });
    };

    const removeFromCart = (id: number) => {
        setCart(prev => prev.filter(i => i.id !== id));
    };

    const clearCart = () => {
        setCart([]);
    };

    const updateSettings = (newSettings: Partial<StoreSettings>) => {
        setSettings(prev => ({
            ...prev,
            ...newSettings
        }));
    };

    // Product Actions
    const addProduct = (product: Omit<Product, 'id' | 'createdAt'>) => {
        const newProduct: Product = {
            ...product,
            id: crypto.randomUUID(),
            createdAt: new Date().toISOString()
        };
        setProducts(prev => [...prev, newProduct]);
    };

    const updateProduct = (id: string, updates: Partial<Product>) => {
        setProducts(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
    };

    const deleteProduct = (id: string) => {
        setProducts(prev => prev.filter(p => p.id !== id));
    };

    const addCategory = (category: Omit<Category, 'id' | 'createdAt'>) => {
        const newCategory: Category = {
            ...category,
            id: crypto.randomUUID(),
            createdAt: new Date().toISOString()
        };
        setCategories(prev => [...prev, newCategory]);
    };

    const updateCategory = (id: string, updates: Partial<Category>) => {
        setCategories(prev => prev.map(cat => cat.id === id ? { ...cat, ...updates } : cat));
    };

    const deleteCategory = (id: string) => {
        if (id === 'all') return; // Prevent deleting default
        setCategories(prev => prev.filter(cat => cat.id !== id));
    };

    // Coupon Actions
    const addCoupon = (coupon: Omit<Coupon, 'id' | 'createdAt' | 'usageCount'>) => {
        const newCoupon: Coupon = {
            ...coupon,
            id: crypto.randomUUID(),
            usageCount: 0,
            createdAt: new Date().toISOString(),
        };
        setCoupons(prev => [...prev, newCoupon]);
    };

    const updateCoupon = (id: string, updates: Partial<Coupon>) => {
        setCoupons(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
    };

    const deleteCoupon = (id: string) => {
        setCoupons(prev => prev.filter(c => c.id !== id));
    };

    const applyCoupon = (code: string, subtotal: number, productId?: string): { valid: boolean; discount: number; message: string } => {
        const coupon = coupons.find(c => c.code.toUpperCase() === code.toUpperCase());
        if (!coupon) return { valid: false, discount: 0, message: 'Invalid coupon code' };
        if (coupon.status !== 'active') return { valid: false, discount: 0, message: 'This coupon is no longer active' };

        const now = new Date();
        if (coupon.startDate && new Date(coupon.startDate) > now) return { valid: false, discount: 0, message: 'This coupon is not available yet' };
        if (coupon.expiryDate && new Date(coupon.expiryDate) < now) return { valid: false, discount: 0, message: 'This coupon has expired' };
        if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) return { valid: false, discount: 0, message: 'This coupon has reached its usage limit' };
        if (coupon.productIds && coupon.productIds.length > 0 && productId && !coupon.productIds.includes(productId)) {
            return { valid: false, discount: 0, message: 'This coupon is not valid for this product' };
        }

        let discount = 0;
        if (coupon.type === 'fixed') {
            discount = Math.min(coupon.value, subtotal);
        } else {
            discount = Math.round((subtotal * coupon.value / 100) * 100) / 100;
            discount = Math.min(discount, subtotal);
        }

        // Increment usage count
        updateCoupon(coupon.id, { usageCount: coupon.usageCount + 1 });

        const label = coupon.type === 'fixed' ? `$${coupon.value.toFixed(2)}` : `${coupon.value}%`;
        return { valid: true, discount, message: `Coupon Applied: -${label} off` };
    };

    // Referral Actions
    const addReferral = (referral: Omit<Referral, 'id' | 'createdAt' | 'usageCount' | 'totalEarned'>) => {
        const newReferral: Referral = {
            ...referral,
            id: `ref-${Date.now()}`,
            usageCount: 0,
            totalEarned: 0,
            createdAt: new Date().toISOString()
        };
        setReferrals(prev => [...prev, newReferral]);
    };

    const updateReferral = (id: string, updates: Partial<Referral>) => {
        setReferrals(prev => prev.map(r => r.id === id ? { ...r, ...updates } : r));
    };

    const deleteReferral = (id: string) => {
        setReferrals(prev => prev.filter(r => r.id !== id));
    };

    // Game Status Actions
    const addGameStatus = (game: string, products: GameStatusProduct[] = []) => {
        const newGroup: GameStatusGroup = {
            id: crypto.randomUUID(),
            game,
            products,
        };
        setGameStatuses(prev => [...prev, newGroup]);
    };

    const updateGameStatus = (id: string, updates: Partial<GameStatusGroup>) => {
        setGameStatuses(prev => prev.map(g => g.id === id ? { ...g, ...updates } : g));
    };

    const deleteGameStatus = (id: string) => {
        setGameStatuses(prev => prev.filter(g => g.id !== id));
    };

    const addServiceToGame = (gameId: string, service: GameStatusProduct) => {
        setGameStatuses(prev => prev.map(g => g.id === gameId ? { ...g, products: [...g.products, service] } : g));
    };

    const updateServiceInGame = (gameId: string, serviceIndex: number, updates: Partial<GameStatusProduct>) => {
        setGameStatuses(prev => prev.map(g => {
            if (g.id !== gameId) return g;
            const newProducts = [...g.products];
            newProducts[serviceIndex] = { ...newProducts[serviceIndex], ...updates };
            return { ...g, products: newProducts };
        }));
    };

    const deleteServiceFromGame = (gameId: string, serviceIndex: number) => {
        setGameStatuses(prev => prev.map(g => {
            if (g.id === gameId) {
                const newProducts = [...g.products];
                newProducts.splice(serviceIndex, 1);
                return { ...g, products: newProducts };
            }
            return g;
        }));
    };

    // Gift Card Actions
    const addGiftCard = (card: Omit<GiftCard, 'id' | 'createdAt' | 'status'>) => {
        const newCard: GiftCard = {
            ...card,
            id: `gc-${Date.now()}`,
            status: 'active',
            createdAt: new Date().toISOString()
        };
        setGiftCards(prev => [...prev, newCard]);
    };

    const updateGiftCard = (id: string, updates: Partial<GiftCard>) => {
        setGiftCards(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
    };

    const deleteGiftCard = (id: string) => {
        setGiftCards(prev => prev.filter(c => c.id !== id));
    };

    // Payment Settings Actions
    const updatePaymentGateway = (id: string, updates: Partial<PaymentGateway>) => {
        setPaymentSettings(prev => {
            const exists = prev.gateways.some(g => g.id === id);
            if (exists) {
                return { ...prev, gateways: prev.gateways.map(g => g.id === id ? { ...g, ...updates } : g) };
            }
            // New gateway from marketplace — append with safe defaults
            const newGateway: PaymentGateway = {
                id,
                name: updates.name ?? id,
                description: updates.description ?? '',
                connected: false,
                ...updates,
            };
            return { ...prev, gateways: [...prev.gateways, newGateway] };
        });
    };

    const addManualPayment = (payment: Omit<ManualPaymentMethod, 'id'>) => {
        const newPayment: ManualPaymentMethod = { ...payment, id: `mp-${Date.now()}` };
        setPaymentSettings(prev => ({ ...prev, manualPayments: [...prev.manualPayments, newPayment] }));
    };

    const updateManualPayment = (id: string, updates: Partial<ManualPaymentMethod>) => {
        setPaymentSettings(prev => ({
            ...prev,
            manualPayments: prev.manualPayments.map(m => m.id === id ? { ...m, ...updates } : m)
        }));
    };

    const deleteManualPayment = (id: string) => {
        setPaymentSettings(prev => ({ ...prev, manualPayments: prev.manualPayments.filter(m => m.id !== id) }));
    };

    const addCryptoAddress = (address: Omit<CryptoAddress, 'id'>) => {
        const newAddr: CryptoAddress = { ...address, id: `ca-${Date.now()}` };
        setPaymentSettings(prev => ({ ...prev, cryptoAddresses: [...prev.cryptoAddresses, newAddr] }));
    };

    const updateCryptoAddress = (id: string, updates: Partial<CryptoAddress>) => {
        setPaymentSettings(prev => ({
            ...prev,
            cryptoAddresses: prev.cryptoAddresses.map(a => a.id === id ? { ...a, ...updates } : a)
        }));
    };

    const deleteCryptoAddress = (id: string) => {
        setPaymentSettings(prev => ({ ...prev, cryptoAddresses: prev.cryptoAddresses.filter(a => a.id !== id) }));
    };

    const addOrderNote = (orderId: string, text: string) => {
        setUsers(prev => prev.map(u => ({
            ...u,
            orders: u.orders.map(o => o.id === orderId ? {
                ...o,
                adminNotes: [...(o.adminNotes || []), { id: `n-${Date.now()}`, text, createdAt: new Date().toISOString() }]
            } : o)
        })));
    };

    const updateUser = (userId: string, updates: Partial<User>) => {
        setUsers(prev => prev.map(u => u.id === userId ? { ...u, ...updates } : u));
    };

    return (
        <StoreContext.Provider value={{
            settings, updateSettings,
            cart, addToCart, removeFromCart, clearCart,
            products, categories, addProduct, updateProduct, deleteProduct, addCategory, updateCategory, deleteCategory,
            coupons, addCoupon, updateCoupon, deleteCoupon, applyCoupon,
            gameStatuses, addGameStatus, updateGameStatus, deleteGameStatus, addServiceToGame, updateServiceInGame, deleteServiceFromGame,
            giftCards, addGiftCard, updateGiftCard, deleteGiftCard,
            paymentSettings, updatePaymentGateway, addManualPayment, updateManualPayment, deleteManualPayment, addCryptoAddress, updateCryptoAddress, deleteCryptoAddress,
            users, currentUser, signup, login, logout, addOrder, markOrderPaid, updateBalance,
            addOrderNote, updateUser,
            referrals, addReferral, updateReferral, deleteReferral,
            verificationLog, pollerRunning
        }}>
            {children}
        </StoreContext.Provider>
    );
};

export const useStore = () => {
    const context = useContext(StoreContext);
    if (context === undefined) {
        throw new Error('useStore must be used within a StoreProvider');
    }
    return context;
};
