/**
 * Send a consistent success response to the client.
 * This keeps the frontend response shape identical across the API.
 */
export const sendSuccess = (res, options = {}) => {
    const {
        statusCode = 200,
        message = 'Request completed successfully.',
        data = null,
        meta = null
    } = options;

    const payload = {
        success: true,
        message
    };

    if (data !== null) {
        payload.data = data;
    }

    if (meta !== null) {
        payload.meta = meta;
    }

    return res.status(statusCode).json(payload);
};

/**
 * Send a consistent error response to the client.
 * Errors always include a success flag and optional details.
 */
export const sendError = (res, options = {}) => {
    const {
        statusCode = 500,
        message = 'Something went wrong.',
        errors = null
    } = options;

    const payload = {
        success: false,
        message
    };

    if (errors !== null) {
        payload.errors = errors;
    }

    return res.status(statusCode).json(payload);
};

/**
 * Create pagination metadata for list endpoints.
 */
export const createPaginationMeta = ({ page, limit, total }) => ({
    page,
    limit,
    total,
    totalPages: total === 0 ? 0 : Math.ceil(total / limit)
});
