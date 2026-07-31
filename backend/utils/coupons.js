/**
 * Simple coupon catalogue. In a real app this would live in the database,
 * but a static map keeps the free demo self-contained.
 */
const COUPONS = {
    WELCOME10: { discountPct: 10, label: '10% off — welcome offer' },
    LEARN50: { discountPct: 50, label: '50% off — learner special' },
    FREE100: { discountPct: 100, label: '100% off — everything free' }
};

/**
 * Validate a coupon code against a subtotal and return the pricing breakdown.
 * Returns { valid:false } for unknown/empty codes.
 */
export const applyCoupon = (code, subtotal) => {
    const amount = Number(subtotal) || 0;

    if (!code) {
        return { valid: true, code: null, discountPct: 0, discount: 0, total: round(amount) };
    }

    const key = String(code).trim().toUpperCase();
    const coupon = COUPONS[key];
    if (!coupon) {
        return { valid: false, code: key, message: 'Invalid coupon code.' };
    }

    const discount = round((amount * coupon.discountPct) / 100);
    return {
        valid: true,
        code: key,
        label: coupon.label,
        discountPct: coupon.discountPct,
        discount,
        total: round(amount - discount)
    };
};

const round = (n) => Math.round((Number(n) + Number.EPSILON) * 100) / 100;
