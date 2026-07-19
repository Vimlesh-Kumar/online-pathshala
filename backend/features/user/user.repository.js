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

export const updateProfile = async (id, data) => {
    await pool('users').where({ id }).update({
        full_name: data.full_name,
        email: data.email,
        avatar_url: data.avatar_url,
        headline: data.headline,
        bio: data.bio,
        website_url: data.website_url,
        twitter_url: data.twitter_url,
        linkedin_url: data.linkedin_url,
        github_url: data.github_url,
        youtube_url: data.youtube_url,
        phone: data.phone,
        address: data.address,
        gender: data.gender
    });
    return getUserById(id);
};

export const updatePassword = async (id, hashedPassword) => {
    return pool('users').where({ id }).update({
        password: hashedPassword
    });
};
