import pool from '../../database/database.js';

export const addingObjectivesInDB = async (objectives) => {
    const [result] = await pool.query(
        `insert into course_objectives (objective,course_id) values ?`,
        [objectives]
    );
    return result;
};

export const gettingObjectivesFromDB = async (course_id) => {
    const [results] = await pool.query(`select * from course_objectives where course_id=?`, [course_id]);
    return results;
};

export const updateObjectiveInDB = async (data) => {
    const [result] = await pool.query(
        'UPDATE course_objectives set objective=? WHERE id=?',
        [data.objective, data.id]
    );
    return result;
};

export const deleteObj = async (id) => {
    const [result] = await pool.query('DELETE FROM course_objectives WHERE id=?', [id]);
    return result;
};