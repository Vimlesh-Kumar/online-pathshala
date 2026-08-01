import * as linkPreviewService from './linkPreview.service.js';
import { sendError, sendSuccess } from '../../utils/apiResponse.js';

/**
 * Preview one or more profile links.
 *
 * Accepts `{ url }` or `{ urls: [...] }` so the profile form can refresh a
 * single field on blur, or load every saved link in one request.
 */
export const preview = async (req, res) => {
    try {
        const { url, urls } = req.body;
        const list = Array.isArray(urls) ? urls : [url];
        const cleaned = list.filter((value) => typeof value === 'string' && value.trim());

        if (!cleaned.length) {
            return sendError(res, { statusCode: 400, message: 'Provide at least one link.' });
        }
        if (cleaned.length > linkPreviewService.MAX_URLS) {
            return sendError(res, {
                statusCode: 400,
                message: `Up to ${linkPreviewService.MAX_URLS} links can be previewed at once.`
            });
        }

        const previews = await linkPreviewService.previewMany(cleaned);
        return sendSuccess(res, { message: 'Link previews fetched.', data: { previews } });
    } catch (error) {
        console.error(error);
        return sendError(res, { statusCode: 500, message: 'Unable to preview those links.' });
    }
};
