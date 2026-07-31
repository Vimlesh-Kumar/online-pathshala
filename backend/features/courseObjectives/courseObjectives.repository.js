import pool from '../../database/database.js';

export const addingObjectivesInDB = async (objectives) => {
    const rows = objectives.map(([objective, course_id]) => ({ objective, course_id }));
    const [insertId] = await pool('course_objectives').insert(rows);
    return { insertId };
};

export const gettingObjectivesFromDB = async (course_id) => {
    return pool('course_objectives').where({ course_id });
};

export const updateObjectiveInDB = async (data) => {
    const affectedRows = await pool('course_objectives')
        .where({ id: data.id })
        .update({ objective: data.objective });
    return { affectedRows };
};

export const deleteObj = async (id) => {
    const affectedRows = await pool('course_objectives')
        .where({ id })
        .del();
    return { affectedRows };
};
