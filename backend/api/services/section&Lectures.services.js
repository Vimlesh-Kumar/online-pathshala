import pool from '../../database/database.js';

export const addLectures = async (allLectures) => {
    const [result] = await pool.query(
        'insert into lesson (lesson_name,duration,video_key,section_name,course_id) values ?',
        [allLectures]
    );
    return result;
};

export const allSectionsbycourseId = async (id) => {
    const [results] = await pool.query('SELECT * FROM lesson where course_id=?', [id]);
    return results;
};