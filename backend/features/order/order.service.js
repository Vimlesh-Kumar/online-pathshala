import * as orderRepository from './order.repository.js';

/**
 * Persist one order_details row per purchased course.
 * order_details.tranaction_id is UNIQUE, so each row gets `<ref>#<courseId>`
 * and receipts are grouped back together by the shared `<ref>` prefix.
 */
export const createOrderRows = async ({ ref, userId, paymentMethod, items }) => orderRepository.createOrderRows({ ref, userId, paymentMethod, items });

/**
 * List a user's receipts (grouped checkouts), newest first.
 */
export const getUserOrders = async (userId) => {
    const rows = await orderRepository.getUserOrders(userId);

    return rows.map((r) => ({
        ref: r.ref,
        createdAt: r.created_at,
        paymentMethod: r.payment_method,
        total: Number(r.total_paid) || 0,
        itemCount: r.item_count,
        titles: r.titles ? r.titles.split('||') : []
    }));
};

/**
 * Empty the user's cart after a successful checkout.
 */
export const clearUserCart = async (userId) => orderRepository.clearUserCart(userId);
