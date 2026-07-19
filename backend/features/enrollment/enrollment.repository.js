import pool from '../../database/database.js';

export const enrolling = async (data) => {
    const existing = await pool('enrollment')
        .where({ course_id: data.course_id, user_id: data.user_id })
        .first();
    if (existing) return existing;

    const [insertId] = await pool('enrollment').insert({
        is_completed: false,
        progress: 0,
        course_id: data.course_id,
        user_id: data.user_id
    });
    return { id: insertId, course_id: data.course_id, user_id: data.user_id, progress: 0, is_completed: 0 };
};

export const getEnrollment = async (courseId, userId) => {
    const row = await pool('enrollment')
        .where({ course_id: courseId, user_id: userId })
        .first();
    return row || null;
};

export const getCompletedLessonIds = async (enrollmentId) => {
    const rows = await pool('enroll_progress')
        .select('lesson_id')
        .where({ enrollment_id: enrollmentId });
    return rows.map((r) => r.lesson_id);
};

export const countCourseLessons = async (courseId) => {
    const row = await pool('lesson')
        .count('* as count')
        .where({ course_id: courseId })
        .first();
    return row.count;
};

export const markLessonComplete = async (enrollmentId, lessonId) => {
    const existing = await pool('enroll_progress')
        .select('id')
        .where({ enrollment_id: enrollmentId, lesson_id: lessonId })
        .first();
    if (!existing) {
        await pool('enroll_progress').insert({
            enrollment_id: enrollmentId,
            lesson_id: lessonId
        });
    }
};

export const updateProgress = async (enrollmentId, progress, isCompleted) => {
    await pool('enrollment')
        .update({ progress, is_completed: isCompleted })
        .where({ id: enrollmentId });
};

export const getCertificate = async (enrollmentId) => {
    const row = await pool('certificates')
        .where({ enrollment_id: enrollmentId })
        .first();
    return row || null;
};

export const issueCertificate = async (enrollmentId, certificateKey) => {
    const existing = await getCertificate(enrollmentId);
    if (existing) return existing;

    const [insertId] = await pool('certificates').insert({
        enrollment_id: enrollmentId,
        certificate_key: certificateKey
    });
    return { id: insertId, enrollment_id: enrollmentId, certificate_key: certificateKey };
};
