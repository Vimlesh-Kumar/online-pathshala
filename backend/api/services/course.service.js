import pool from '../../database/database.js';

// Adding a course in database
export const addCourseInDB = async (data) => {
    const [result] = await pool.query(
        `insert into courses(author,category,price,subtitle,thumb_url,title) values(?,?,?,?,?,?)`,
        [data.author, data.category, data.price, data.subtitle, data.thumb_url, data.title]
    );
    return result;
};

// All courses by user's id
export const courseByUserId = async (id) => {
    const [results] = await pool.query(
        `select courses.* from courses inner join enrollment on courses.id=enrollment.course_id inner join users on users.id=enrollment.user_id where users.id=?`,
        [id]
    );
    return results;
};

// Finding all courses from database
export const allCourses = async () => {
    const [results] = await pool.query(`select * from courses`);
    return results;
};

// course by course-id
export const courseById = async (id) => {
    const [results] = await pool.query(`select * from courses where id=?`, [id]);
    return results[0];
};

export const coursesByCategory = async (category) => {
    const [results] = await pool.query('SELECT * FROM courses where category=?', [category]);
    return results;
};

// search courses by title or author
export const searchCourses = async (query) => {
    const q = `%${query}%`;
    const [results] = await pool.query(
        'SELECT * FROM courses WHERE title LIKE ? OR author LIKE ? OR category LIKE ?',
        [q, q, q]
    );
    return results;
};

// user by courseID
export const tutorByCourseId = async (id) => {
    const [results] = await pool.query(
        `select users.id from users inner join enrollment on users.id=enrollment.user_id where enrollment.course_id=? and users.user_role='Tutor'`,
        [id]
    );
    return results[0];
};