import * as enrollmentRepository from './enrollment.repository.js';

/**
 * Create an enrollment if one does not already exist for this user+course.
 * Returns the enrollment row (existing or newly created).
 */
export const enrolling = async (data) => enrollmentRepository.enrolling(data);

/**
 * Fetch a single enrollment for a user+course (or null).
 */
export const getEnrollment = async (courseId, userId) => enrollmentRepository.getEnrollment(courseId, userId);

/**
 * Ids of lessons the learner has already completed for an enrollment.
 */
export const getCompletedLessonIds = async (enrollmentId) => enrollmentRepository.getCompletedLessonIds(enrollmentId);

/**
 * Total number of lessons in a course.
 */
export const countCourseLessons = async (courseId) => enrollmentRepository.countCourseLessons(courseId);

/**
 * Mark a lesson complete for an enrollment (idempotent — no duplicate rows).
 */
export const markLessonComplete = async (enrollmentId, lessonId) => enrollmentRepository.markLessonComplete(enrollmentId, lessonId);

/**
 * Recompute and persist the progress percentage + completion flag.
 */
export const recalculateProgress = async (enrollmentId, courseId) => {
    const total = await countCourseLessons(courseId);
    const completedIds = await getCompletedLessonIds(enrollmentId);
    const completed = completedIds.length;
    const progress = total > 0 ? Math.round((completed / total) * 100) : 0;
    const isCompleted = total > 0 && completed >= total;

    await enrollmentRepository.updateProgress(enrollmentId, progress, isCompleted);

    return { progress, isCompleted, total, completed, completedIds };
};

export const getCertificate = async (enrollmentId) => enrollmentRepository.getCertificate(enrollmentId);

export const issueCertificate = async (enrollmentId, certificateKey) => enrollmentRepository.issueCertificate(enrollmentId, certificateKey);
