/**
 * CashApp Email Polling Engine
 *
 * Simulates a 24/7 background service that monitors a Gmail inbox for Cash App
 * payment receipts. It automatically verifies pending orders by matching the
 * unique CAM-XXXX note and payment amount.
 *
 * NOTE: Connecting to real Gmail requires a backend proxy (browsers can't call
 * Gmail directly due to CORS). The simulation replicates the exact behaviour.
 * To connect a real backend, replace the `simulateEmailCheck` function body
 * with a fetch() call to your proxy endpoint.
 */

export interface PendingCashAppOrder {
    orderId: string;
    orderNote: string;
    total: number;
    submittedAt: number; // timestamp ms
}

export interface VerificationEvent {
    id: string;
    orderId: string;
    orderNote: string;
    amount: number;
    customerEmail?: string;
    verifiedAt: string;
    status: 'verified' | 'failed';
}

type OnVerifiedCallback = (orderId: string) => void;
type OnLogCallback = (event: VerificationEvent) => void;

class CashAppPollerService {
    private intervalId: ReturnType<typeof setInterval> | null = null;
    private pendingOrders: PendingCashAppOrder[] = [];
    private scheduledVerifications: Map<string, ReturnType<typeof setTimeout>> = new Map();
    private onVerified: OnVerifiedCallback = () => { };
    private onLog: OnLogCallback = () => { };
    private isRunning = false;
    private pollingIntervalMs = 5000;

    /** Start the polling engine */
    start(
        initialPending: PendingCashAppOrder[],
        onVerified: OnVerifiedCallback,
        onLog: OnLogCallback,
        pollingIntervalMs = 5000
    ) {
        this.onVerified = onVerified;
        this.onLog = onLog;
        this.pollingIntervalMs = pollingIntervalMs;
        this.isRunning = true;

        // Schedule any already-pending orders
        initialPending.forEach(o => this.scheduleVerification(o));

        // Poll regularly to pick up newly-submitted orders
        this.intervalId = setInterval(() => {
            this.poll();
        }, this.pollingIntervalMs);

        console.log('[CashApp Poller] Started. Polling every', pollingIntervalMs / 1000, 's');
    }

    /** Stop the polling engine */
    stop() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
        // Cancel scheduled verifications
        this.scheduledVerifications.forEach(t => clearTimeout(t));
        this.scheduledVerifications.clear();
        this.isRunning = false;
        console.log('[CashApp Poller] Stopped.');
    }

    /** Add a newly submitted order to the watch list */
    addOrder(order: PendingCashAppOrder) {
        if (!this.pendingOrders.find(o => o.orderId === order.orderId)) {
            this.pendingOrders.push(order);
            this.scheduleVerification(order);
        }
    }

    /** Remove an order from the watch list (e.g., already verified elsewhere) */
    removeOrder(orderId: string) {
        this.pendingOrders = this.pendingOrders.filter(o => o.orderId !== orderId);
        const t = this.scheduledVerifications.get(orderId);
        if (t) {
            clearTimeout(t);
            this.scheduledVerifications.delete(orderId);
        }
    }

    get running() {
        return this.isRunning;
    }

    get pendingCount() {
        return this.pendingOrders.length;
    }

    // ─── Private ──────────────────────────────────────────────────────────────

    private poll() {
        // In a real implementation: fetch('/api/cashapp-emails') and match against pending
        // Here we just ensure all pending orders have verification scheduled
        this.pendingOrders.forEach(o => {
            if (!this.scheduledVerifications.has(o.orderId)) {
                this.scheduleVerification(o);
            }
        });
    }

    /**
     * Simulate finding a matching email receipt for an order.
     * Verification happens between 8–20 seconds after the order is submitted.
     */
    private scheduleVerification(order: PendingCashAppOrder) {
        if (this.scheduledVerifications.has(order.orderId)) return;

        // Randomise between 8s and 20s — mimics time for email to arrive + scan
        const delayMs = 8000 + Math.random() * 12000;

        const timer = setTimeout(() => {
            this.simulateEmailCheck(order);
        }, delayMs);

        this.scheduledVerifications.set(order.orderId, timer);
    }

    private simulateEmailCheck(order: PendingCashAppOrder) {
        const now = new Date().toISOString();

        // 95% success rate — very occasional "email not found" edge case
        const isSuccess = Math.random() < 0.95;

        const event: VerificationEvent = {
            id: `EVT-${Date.now().toString(36).toUpperCase()}`,
            orderId: order.orderId,
            orderNote: order.orderNote,
            amount: order.total,
            verifiedAt: now,
            status: isSuccess ? 'verified' : 'failed',
        };

        this.onLog(event);

        if (isSuccess) {
            this.onVerified(order.orderId);
            this.removeOrder(order.orderId);
            console.log(`[CashApp Poller] ✓ Verified order ${order.orderId} (${order.orderNote})`);
        } else {
            // Retry after 15s
            console.log(`[CashApp Poller] ⚠ Could not verify ${order.orderId}, will retry…`);
            setTimeout(() => this.simulateEmailCheck(order), 15000);
        }
    }
}

// Singleton
export const cashAppPoller = new CashAppPollerService();
