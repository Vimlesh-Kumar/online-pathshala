import pool from '../../database/database.js';

export const create = async (data) => {
    const [insertId] = await pool('users').insert({
        full_name: data.full_name,
        email: data.email,
        password: data.password,
        user_role: data.user_role
    });
    return { insertId };
};

export const getUserByEmail = async (email) => {
    return pool('users').where({ email }).first();
};

export const getUserById = async (id) => {
    return pool('users').where({ id }).first();
};
