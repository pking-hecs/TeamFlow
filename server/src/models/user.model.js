import pool from '../db/connection.js';

export const insertUser = async (name, email, password) => {
    // Generate a random User_ID since schema uses varchar(20)
    const userId = 'U' + Date.now().toString().slice(-8);
    await pool.query(
        'INSERT INTO Users (User_ID, User_Name, Email_ID, Password) VALUES (?, ?, ?, ?)',
        [userId, name, email, password]
    );
};

export const findUser = async (email) => {
    const [rows] = await pool.query('SELECT User_ID as id, User_Name as username, Email_ID as email, Password as password FROM Users WHERE Email_ID = ?', [email]);
    if (rows.length === 0) return null;
    return rows[0];
};