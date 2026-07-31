import { put, del, list, head, get } from '@vercel/blob';
import '../config/env.js';

const token = process.env.BLOB_READ_WRITE_TOKEN;

/**
 * Uploads a file (Buffer, Blob, or string) to Vercel Blob store.
 * @param {string} filename - The target filename/path (e.g. 'users/avatar-123.jpg')
 * @param {Buffer | Blob | string} body - The file content
 * @param {object} [options] - Additional Vercel Blob options
 * @returns {Promise<object>} The uploaded blob metadata (url, pathname, contentType, etc.)
 */
export const uploadFile = async (filename, body, options = {}) => {
    return await put(filename, body, {
        access: 'private', // default to private access as configured in store
        token,
        ...options
    });
};

/**
 * Deletes a file or files from Vercel Blob store.
 * @param {string | string[]} url - The URL or array of URLs to delete
 * @param {object} [options] - Additional options
 */
export const deleteFile = async (url, options = {}) => {
    return await del(url, {
        token,
        ...options
    });
};

/**
 * Lists files in the Vercel Blob store.
 * @param {object} [options] - List options (prefix, limit, cursor, etc.)
 */
export const listFiles = async (options = {}) => {
    return await list({
        token,
        ...options
    });
};

/**
 * Retrieves metadata for a specific blob.
 * @param {string} url - The blob URL
 * @param {object} [options] - Additional options
 */
export const headFile = async (url, options = {}) => {
    return await head(url, {
        token,
        ...options
    });
};

/**
 * Downloads/fetches a private file from Vercel Blob store.
 * @param {string} url - The private blob URL
 * @param {object} [options] - Additional options
 */
export const downloadFile = async (url, options = {}) => {
    return await get(url, {
        access: 'private', // required for private stores
        token,
        ...options
    });
};
