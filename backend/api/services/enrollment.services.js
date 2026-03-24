import pool from '../../database/database.js';

export const enrolling = async (data) => {
    const [result] = await pool.query(
        `insert into enrollment(is_completed,course_id,user_id) values(true,?,?)`,
        [data.course_id, data.user_id]
    );
    console.log("Enrollment success!!");
    return result;
};