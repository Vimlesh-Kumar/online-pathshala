import { randomUUID } from 'node:crypto';
import * as orderServices from '../services/order.service.js';
import * as cartServices from '../services/cart.service.js';
import * as enrollmentServices from '../services/enrollment.services.js';
import { applyCoupon } from '../utils/coupons.js';
import { sendError, sendSuccess } from '../utils/apiResponse.js';

const round = (n) => Math.round((Number(n) + Number.EPSILON) * 100) / 100;

/**
 * Validate a coupon against the caller's current cart subtotal.
 */
export const validateCoupon = async (req, res) => {
    try {
        const summary = await cartServices.getCartSummary(req.user.id);
        const subtotal = Number(summary.totalAmount) || 0;
        const result = applyCoupon(req.body?.code, subtotal);

        if (!result.valid) {
            return sendError(res, { statusCode: 400, message: result.message || 'Invalid coupon.' });
        }
        return sendSuccess(res, { message: 'Coupon applied.', data: { ...result, subtotal } });
    } catch (err) {
        console.error(err);
        return sendError(res, { statusCode: 500, message: 'Unable to validate coupon.' });
    }
};

/**
 * Free checkout: enroll the user in every cart course, record a receipt
 * (one order_details row per course), and clear the cart.
 */
export const checkout = async (req, res) => {
    try {
        const courses = await cartServices.userCartCourse(req.user.id);
        if (!courses.length) {
            return sendError(res, { statusCode: 400, message: 'Your cart is empty.' });
        }

        const subtotal = round(courses.reduce((sum, c) => sum + Number(c.price), 0));
        const coupon = applyCoupon(req.body?.coupon, subtotal);
        if (!coupon.valid) {
            return sendError(res, { statusCode: 400, message: coupon.message || 'Invalid coupon.' });
        }

        const factor = 1 - (coupon.discountPct || 0) / 100;
        const ref = `TXN-${Date.now().toString(36).toUpperCase()}-${randomUUID().slice(0, 6)}`;
        const paymentMethod = coupon.code ? `Coupon:${coupon.code}`.slice(0, 50) : 'Free';

        const items = courses.map((c) => ({
            course_id: c.id,
            title: c.title,
            price: Number(c.price),
            paid: round(Number(c.price) * factor)
        }));

        await orderServices.createOrderRows({
            ref,
            userId: req.user.id,
            paymentMethod,
            items
        });

        // Enroll in each purchased course (idempotent).
        for (const item of items) {
            await enrollmentServices.enrolling({ course_id: item.course_id, user_id: req.user.id });
        }

        await orderServices.clearUserCart(req.user.id);

        return sendSuccess(res, {
            statusCode: 201,
            message: 'Checkout complete — you are enrolled!',
            data: {
                ref,
                paymentMethod,
                coupon: coupon.code,
                subtotal,
                discount: coupon.discount || 0,
                total: coupon.total ?? subtotal,
                items
            }
        });
    } catch (err) {
        console.error(err);
        return sendError(res, { statusCode: 500, message: 'Checkout failed.' });
    }
};

/**
 * List the authenticated user's past receipts.
 */
export const listOrders = async (req, res) => {
    try {
        const orders = await orderServices.getUserOrders(req.user.id);
        return sendSuccess(res, { message: 'Orders fetched.', data: orders });
    } catch (err) {
        console.error(err);
        return sendError(res, { statusCode: 500, message: 'Unable to fetch orders.' });
    }
};
