import pool from '../db/connection.js';
import { randomBytes } from 'crypto';

const generateTaskId = () => {
  const timestamp = Date.now().toString().slice(-8);
  const random = randomBytes(2).toString('hex');
  return `T${timestamp}${random}`;
};

export const createTask = async ({ projectId, title, description, status = 'To Do', priority = 'Medium', assigneeId, deadline }) => {
  const taskId = generateTaskId();
  
  await pool.query(
    'INSERT INTO Tasks (Task_ID, Project_ID, Title, Description, Status, Priority, Assignee_ID, Deadline) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    [taskId, projectId, title, description || null, status, priority, assigneeId || null, deadline || null]
  );
  
  return {
    id: taskId,
    project_id: projectId,
    title,
    description,
    status,
    priority,
    assignee_id: assigneeId,
    deadline,
    createdAt: new Date(),
    updatedAt: new Date()
  };
};

export const getTasks = async (filters = {}) => {
  let query = 'SELECT Task_ID as id, Project_ID as project_id, Title as title, Description as description, Status as status, Priority as priority, Assignee_ID as assignee_id, Deadline as deadline, Created_At as createdAt, Updated_At as updatedAt FROM Tasks WHERE 1=1';
  const values = [];
  
  if (filters.project_id) {
    query += ' AND Project_ID = ?';
    values.push(filters.project_id);
  }
  if (filters.status) {
    query += ' AND Status = ?';
    values.push(filters.status);
  }
  if (filters.assignee_id) {
    query += ' AND Assignee_ID = ?';
    values.push(filters.assignee_id);
  }
  if (filters.priority) {
    query += ' AND Priority = ?';
    values.push(filters.priority);
  }
  
  const [rows] = await pool.query(query, values);
  return rows;
};

export const getTask = async (taskId) => {
  const [rows] = await pool.query(
    'SELECT Task_ID as id, Project_ID as project_id, Title as title, Description as description, Status as status, Priority as priority, Assignee_ID as assignee_id, Deadline as deadline, Created_At as createdAt, Updated_At as updatedAt FROM Tasks WHERE Task_ID = ?',
    [taskId]
  );
  
  if (rows.length === 0) return null;
  return rows[0];
};

export const updateTask = async (taskId, { title, description, status, priority, assigneeId, deadline }) => {
  const updates = [];
  const values = [];
  
  if (title !== undefined) {
    updates.push('Title = ?');
    values.push(title);
  }
  if (description !== undefined) {
    updates.push('Description = ?');
    values.push(description);
  }
  if (status !== undefined) {
    updates.push('Status = ?');
    values.push(status);
  }
  if (priority !== undefined) {
    updates.push('Priority = ?');
    values.push(priority);
  }
  if (assigneeId !== undefined) {
    updates.push('Assignee_ID = ?');
    values.push(assigneeId);
  }
  if (deadline !== undefined) {
    updates.push('Deadline = ?');
    values.push(deadline);
  }
  
  if (updates.length === 0) return null;
  
  updates.push('Updated_At = NOW()');
  values.push(taskId);
  
  const query = `UPDATE Tasks SET ${updates.join(', ')} WHERE Task_ID = ?`;
  await pool.query(query, values);
  
  return await getTask(taskId);
};

export const deleteTask = async (taskId) => {
  const [result] = await pool.query(
    'DELETE FROM Tasks WHERE Task_ID = ?',
    [taskId]
  );
  
  return result.affectedRows > 0;
};