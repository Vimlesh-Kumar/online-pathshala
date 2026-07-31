import * as certificateService from './certificate.service.js';
import { sendError, sendSuccess } from '../../utils/apiResponse.js';

/**
 * Public certificate check: anyone holding a key (an employer, say) can
 * confirm it was really issued, and to whom.
 */
export const verifyCertificate = async (req, res) => {
    try {
        const key = certificateService.normalizeKey(req.params.key);
        if (!certificateService.isValidKeyFormat(key)) {
            return sendError(res, { statusCode: 400, message: 'That is not a valid certificate id.' });
        }

        const certificate = await certificateService.verify(key);
        if (!certificate) {
            return sendSuccess(res, {
                message: 'No certificate matches that id.',
                data: { valid: false }
            });
        }

        return sendSuccess(res, {
            message: 'Certificate verified.',
            data: { valid: true, certificate }
        });
    } catch (error) {
        console.error(error);
        return sendError(res, { statusCode: 500, message: 'Unable to verify that certificate.' });
    }
};
