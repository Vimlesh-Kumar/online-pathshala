import pool from '../../database/database.js';

/**
 * Resolve a certificate key to the learner, course and issue date.
 * Public lookup — only the fields printed on the certificate are selected.
 */
export const findByKey = async (certificateKey) => {
    const result = await pool('certificates as cert')
        .select(
            'cert.certificate_key',
            'cert.granted_at',
            'u.full_name as holder',
            'c.title as course_title',
            'c.author as instructor',
            'c.category'
        )
        .join('enrollment as e', 'e.id', 'cert.enrollment_id')
        .join('users as u', 'u.id', 'e.user_id')
        .join('courses as c', 'c.id', 'e.course_id')
        .where('cert.certificate_key', certificateKey)
        .first();
    return result || null;
};
