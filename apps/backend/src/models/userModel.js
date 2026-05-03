import db from '../config/db.js';

export const createUser = async (userData) => {
  const [user] = await db('users')
    .insert(userData)
    .returning(['id', 'email', 'full_name', 'created_at']);
  return user;
};

export const findByEmail = async (email) => {
  return db('users').where({ email }).first();
};
