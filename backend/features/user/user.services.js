import * as userRepository from './user.repository.js';

// inserting user data into users table at signup
export const create = async (data) => userRepository.create(data);

// Finding user by email from database
export const getUserByEmail = async (email) => userRepository.getUserByEmail(email);

// find user by id
export const getUserById = async (id) => userRepository.getUserById(id);