const mongoose = require('mongoose');

// Unified Schema approach for rapid migration from StoreContext
const storeSchema = new mongoose.Schema({
    // We store the exact same JSON structures as the frontend expects
    settings: { type: Object, default: {} },
    products: { type: Array, default: [] },
    categories: { type: Array, default: [] },
    coupons: { type: Array, default: [] },
    referrals: { type: Array, default: [] },
    gameStatuses: { type: Array, default: [] },
    giftCards: { type: Array, default: [] },
    paymentSettings: { type: Object, default: {} },
    users: { type: Array, default: [] },
    verificationLog: { type: Array, default: [] }
}, { strict: false, timestamps: true });

const Store = mongoose.model('Store', storeSchema);

module.exports = { Store };
