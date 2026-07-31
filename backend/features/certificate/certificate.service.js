import * as certificateRepository from './certificate.repository.js';

/** Certificate keys look like OP-1A2B-3C4D. */
const KEY_PATTERN = /^[A-Z0-9-]{4,50}$/;

export const normalizeKey = (value) => String(value || '').trim().toUpperCase();

export const isValidKeyFormat = (key) => KEY_PATTERN.test(key);

/**
 * Look a certificate up by its printed key.
 * Returns null when no certificate carries that key.
 */
export const verify = async (key) => {
    const certificate = await certificateRepository.findByKey(key);
    if (!certificate) return null;

    return {
        certificateKey: certificate.certificate_key,
        holder: certificate.holder,
        courseTitle: certificate.course_title,
        instructor: certificate.instructor,
        category: certificate.category,
        grantedAt: certificate.granted_at
    };
};
