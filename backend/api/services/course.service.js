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

// Finding all courses from database with pagination and sorting
export const allCourses = async (limit = 20, offset = 0, sortBy = 'Newest') => {
    let orderBy = 'id DESC';
    if (sortBy === 'Price: Low to High') orderBy = 'price ASC';
    else if (sortBy === 'Price: High to Low') orderBy = 'price DESC';
    else if (sortBy === 'Best Rating') orderBy = 'rating DESC';

    const [courses] = await pool.query(`select * from courses ORDER BY ${orderBy} LIMIT ? OFFSET ?`, [limit, offset]);
    const [total] = await pool.query(`SELECT COUNT(*) as count FROM courses`);
    return { courses, total: total[0].count };
};

// course by course-id
export const courseById = async (id) => {
    const [results] = await pool.query(`select * from courses where id=?`, [id]);
    return results[0];
};

// Courses by category with pagination and sorting
export const coursesByCategory = async (category, limit = 20, offset = 0, sortBy = 'Newest') => {
    let orderBy = 'id DESC';
    if (sortBy === 'Price: Low to High') orderBy = 'price ASC';
    else if (sortBy === 'Price: High to Low') orderBy = 'price DESC';
    else if (sortBy === 'Best Rating') orderBy = 'rating DESC';

    const [courses] = await pool.query(`SELECT * FROM courses where category=? ORDER BY ${orderBy} LIMIT ? OFFSET ?`, [category, limit, offset]);
    const [total] = await pool.query(`SELECT COUNT(*) as count FROM courses where category=?`, [category]);
    return { courses, total: total[0].count };
};

// search courses by title or author with pagination and sorting
export const searchCourses = async (query, limit = 20, offset = 0, sortBy = 'Newest') => {
    const q = `%${query}%`;
    let orderBy = 'id DESC';
    if (sortBy === 'Price: Low to High') orderBy = 'price ASC';
    else if (sortBy === 'Price: High to Low') orderBy = 'price DESC';
    else if (sortBy === 'Best Rating') orderBy = 'rating DESC';

    const [courses] = await pool.query(
        `SELECT * FROM courses WHERE title LIKE ? OR author LIKE ? OR category LIKE ? ORDER BY ${orderBy} LIMIT ? OFFSET ?`,
        [q, q, q, limit, offset]
    );
    const [total] = await pool.query(
        'SELECT COUNT(*) as count FROM courses WHERE title LIKE ? OR author LIKE ? OR category LIKE ?',
        [q, q, q]
    );
    return { courses, total: total[0].count };
};

// user by courseID
export const tutorByCourseId = async (id) => {
    const [results] = await pool.query(
        `select users.id from users inner join enrollment on users.id=enrollment.user_id where enrollment.course_id=? and users.user_role='Tutor'`,
        [id]
    );
    return results[0];
};