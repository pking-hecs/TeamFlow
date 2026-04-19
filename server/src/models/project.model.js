import pool from '../db/connection.js';
import { randomBytes } from 'crypto';

let projectDeadlineColumnReady;

const generateProjectId = () => {
  const timestamp = Date.now().toString().slice(-8);
  const random = randomBytes(2).toString('hex');
  return `P${timestamp}${random}`;
};

const ensureProjectDeadlineColumn = async () => {
  if (!projectDeadlineColumnReady) {
    projectDeadlineColumnReady = (async () => {
      const [rows] = await pool.query("SHOW COLUMNS FROM Projects LIKE 'Deadline'");
      if (!rows.length) {
        await pool.query('ALTER TABLE Projects ADD COLUMN Deadline DATE NULL');
      }
    })().catch((error) => {
      projectDeadlineColumnReady = null;
      throw error;
    });
  }

  await projectDeadlineColumnReady;
};

export const createProject = async (teamId, { name, description, deadline }) => {
  await ensureProjectDeadlineColumn();

  const projectId = generateProjectId();
  
  await pool.query(
    'INSERT INTO Projects (Project_ID, Title, Team_ID, Handled_By, Deadline) VALUES (?, ?, ?, ?, ?)',
    [projectId, name, teamId, teamId, deadline || null]
  );
  
  return {
    id: projectId,
    team_id: teamId,
    name,
    description: description || null,
    deadline: deadline || null,
    handled_by: teamId
  };
};

export const getProjects = async (teamId) => {
  await ensureProjectDeadlineColumn();

  const [rows] = await pool.query(
    `SELECT
      Project_ID as id,
      Team_ID as team_id,
      Title as name,
      Handled_By as handled_by,
      NULL as description,
      Deadline as deadline
     FROM Projects
     WHERE Team_ID = ?`,
    [teamId]
  );
  
  return rows;
};

export const getProject = async (projectId) => {
  await ensureProjectDeadlineColumn();

  const [rows] = await pool.query(
    `SELECT
      Project_ID as id,
      Team_ID as team_id,
      Title as name,
      Handled_By as handled_by,
      NULL as description,
      Deadline as deadline
     FROM Projects
     WHERE Project_ID = ?`,
    [projectId]
  );
  
  if (rows.length === 0) return null;
  return rows[0];
};

export const updateProject = async (projectId, { name, description, deadline }) => {
  await ensureProjectDeadlineColumn();

  const updates = [];
  const values = [];
  
  if (name !== undefined) {
    updates.push('Title = ?');
    values.push(name);
  }
  if (deadline !== undefined) {
    updates.push('Deadline = ?');
    values.push(deadline || null);
  }
  
  if (updates.length === 0) return null;
  values.push(projectId);
  
  const query = `UPDATE Projects SET ${updates.join(', ')} WHERE Project_ID = ?`;
  await pool.query(query, values);
  
  return await getProject(projectId);
};

export const deleteProject = async (projectId) => {
  const [result] = await pool.query(
    'DELETE FROM Projects WHERE Project_ID = ?',
    [projectId]
  );
  
  return result.affectedRows > 0;
};
