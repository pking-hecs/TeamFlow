import pool from '../db/connection.js';
import { randomBytes } from 'crypto';

const generateProjectId = () => {
  const timestamp = Date.now().toString().slice(-8);
  const random = randomBytes(2).toString('hex');
  return `P${timestamp}${random}`;
};

export const createProject = async (teamId, { name, description, deadline }) => {
  const projectId = generateProjectId();
  
  await pool.query(
    'INSERT INTO Projects (Project_ID, Team_ID, Project_Name, Description, Deadline) VALUES (?, ?, ?, ?, ?)',
    [projectId, teamId, name, description || null, deadline || null]
  );
  
  return {
    id: projectId,
    team_id: teamId,
    name,
    description,
    deadline,
    createdAt: new Date(),
    updatedAt: new Date()
  };
};

export const getProjects = async (teamId) => {
  const [rows] = await pool.query(
    'SELECT Project_ID as id, Team_ID as team_id, Project_Name as name, Description as description, Deadline as deadline, Created_At as createdAt, Updated_At as updatedAt FROM Projects WHERE Team_ID = ?',
    [teamId]
  );
  
  return rows;
};

export const getProject = async (projectId) => {
  const [rows] = await pool.query(
    'SELECT Project_ID as id, Team_ID as team_id, Project_Name as name, Description as description, Deadline as deadline, Created_At as createdAt, Updated_At as updatedAt FROM Projects WHERE Project_ID = ?',
    [projectId]
  );
  
  if (rows.length === 0) return null;
  return rows[0];
};

export const updateProject = async (projectId, { name, description, deadline }) => {
  const updates = [];
  const values = [];
  
  if (name !== undefined) {
    updates.push('Project_Name = ?');
    values.push(name);
  }
  if (description !== undefined) {
    updates.push('Description = ?');
    values.push(description);
  }
  if (deadline !== undefined) {
    updates.push('Deadline = ?');
    values.push(deadline);
  }
  
  if (updates.length === 0) return null;
  
  updates.push('Updated_At = NOW()');
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