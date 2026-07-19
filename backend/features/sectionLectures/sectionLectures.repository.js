import pool from '../../database/database.js';

export const addLectures = async (allLectures) => {
    const rows = allLectures.map(([lesson_name, duration, video_key, section_name, course_id]) => ({
        lesson_name,
        duration,
        video_key,
        section_name,
        course_id
    }));
    const [insertId] = await pool('lesson').insert(rows);
    return { insertId };
};

export const allSectionsbycourseId = async (id) => {
    return pool('lesson').where({ course_id: id });
};
