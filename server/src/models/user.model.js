import pool from '../db/connection.js';
import crypto from 'crypto';

export async function createUser({ name, email, password }) {
  const userId = crypto.randomUUID();
  const query = `
    INSERT INTO Users (User_ID, Name, Email_ID, Password)
    VALUES (?, ?, ?, ?)
  `;
  
  await pool.query(query, [userId, name, email, password]);
  
  return findUserById(userId);
}

export async function findUserByEmail(email) {
  const [rows] = await pool.query('SELECT * FROM Users WHERE Email_ID = ?', [email]);
  return rows[0] || null;
}

export async function findUserById(id) {
  const [rows] = await pool.query('SELECT * FROM Users WHERE User_ID = ?', [id]);
  return rows[0] || null;
}
