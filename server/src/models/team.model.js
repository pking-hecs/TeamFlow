import pool from '../db/connection.js';

export const getMember = async (teamId, userId) => {
  const [rows] = await pool.query(
    'SELECT * FROM Membership WHERE Team_ID = ? AND User_ID = ?',
    [teamId, userId]
  );
  if (rows.length === 0) return null;
  return {
    userId: rows[0].User_ID,
    teamId: rows[0].Team_ID,
    role: rows[0].Is_Admin ? 'admin' : 'member'
  };
};

export const createTeam = async ({ name, description, userId }) => {
  const teamId = 'T' + Date.now().toString().slice(-8);

  await pool.query(
    'INSERT INTO Teams (Team_ID, Team_Name, Creator_ID) VALUES (?, ?, ?)',
    [teamId, name, userId]
  );

  await pool.query(
    'INSERT INTO Membership (User_ID, Team_ID, Is_Admin) VALUES (?, ?, 1)',
    [userId, teamId]
  );

  return {
    id: teamId,
    name,
    description: description || null,
    userId,
    role: 'admin'
  };
};

export const getTeamsByUser = async (userId) => {
  const [rows] = await pool.query(
    `SELECT t.Team_ID as id, t.Team_Name as name, m.Is_Admin
     FROM Teams t
     JOIN Membership m ON t.Team_ID = m.Team_ID
     WHERE m.User_ID = ?`,
    [userId]
  );

  return rows.map(r => ({
    id: r.id,
    name: r.name,
    role: r.Is_Admin ? 'admin' : 'member'
  }));
};

export const getTeamById = async (teamId, userId) => {
  const [rows] = await pool.query(
    `SELECT t.Team_ID as id, t.Team_Name as name, m.Is_Admin
     FROM Teams t
     JOIN Membership m ON t.Team_ID = m.Team_ID
     WHERE t.Team_ID = ? AND m.User_ID = ?`,
    [teamId, userId]
  );

  if (rows.length === 0) return null;

  const team = rows[0];

  const [members] = await pool.query(
    `SELECT u.User_ID as id, u.User_Name as name, u.Email_ID as email, m.Is_Admin
     FROM Users u
     JOIN Membership m ON u.User_ID = m.User_ID
     WHERE m.Team_ID = ?`,
    [teamId]
  );

  return {
    id: team.id,
    name: team.name,
    role: team.Is_Admin ? 'admin' : 'member',
    member_count: members.length,
    members: members.map(m => ({
      id: m.id,
      name: m.name,
      email: m.email,
      role: m.Is_Admin ? 'admin' : 'member'
    }))
  };
};

export const updateTeam = async (teamId, { name, description }) => {
  if (name) {
    await pool.query(
      'UPDATE Teams SET Team_Name = ? WHERE Team_ID = ?',
      [name, teamId]
    );
  }
};

export const deleteTeam = async (teamId) => {
  await pool.query('DELETE FROM Teams WHERE Team_ID = ?', [teamId]);
};

export const findUserByEmail = async (email) => {
  const [rows] = await pool.query(
    'SELECT User_ID as id, Email_ID as email, User_Name as name FROM Users WHERE Email_ID = ?',
    [email]
  );

  if (rows.length === 0) return null;
  return rows[0];
};

export const addMember = async (teamId, userId, role) => {
  try {
    const isAdmin = role === 'admin' ? 1 : 0;

    await pool.query(
      'INSERT INTO Membership (User_ID, Team_ID, Is_Admin) VALUES (?, ?, ?)',
      [userId, teamId, isAdmin]
    );

    const [rows] = await pool.query(
      'SELECT User_Name as name, Email_ID as email FROM Users WHERE User_ID = ?',
      [userId]
    );

    return {
      id: userId,
      name: rows[0].name,
      email: rows[0].email,
      role
    };
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return { alreadyMember: true };
    }
    throw err;
  }
};

export const countAdmins = async (teamId) => {
  const [rows] = await pool.query(
    'SELECT COUNT(*) as count FROM Membership WHERE Team_ID = ? AND Is_Admin = 1',
    [teamId]
  );
  return rows[0].count;
};

export const updateMemberRole = async (teamId, userId, role) => {
  const isAdmin = role === 'admin' ? 1 : 0;

  await pool.query(
    'UPDATE Membership SET Is_Admin = ? WHERE Team_ID = ? AND User_ID = ?',
    [isAdmin, teamId, userId]
  );
};

export const removeMember = async (teamId, userId) => {
  await pool.query(
    'DELETE FROM Membership WHERE Team_ID = ? AND User_ID = ?',
    [teamId, userId]
  );
};