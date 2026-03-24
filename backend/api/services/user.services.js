import pool from '../../database/database.js';

// inserting user data into users table at signup
export const create = async (data) => {
    const [result] = await pool.query(
        `insert into users(full_name,email,password,user_role) values(?,?,?,?)`,
        [data.full_name, data.email, data.password, data.user_role]
    );
    return result;
};

// Finding user by email from database
export const getUserByEmail = async (email) => {
    const [results] = await pool.query(`select * from users where email=?`, [email]);
    return results[0];
};

// find user by id
export const getUserById = async (id) => {
    const [results] = await pool.query(`select * from users where id=?`, [id]);
    return results[0];
};