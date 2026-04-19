import pool from '../db/connection.js';
import { randomBytes } from 'crypto';

const generateTaskId = () => {
  const timestamp = Date.now().toString().slice(-8);
  const random = randomBytes(2).toString('hex');
  return `T${timestamp}${random}`;
};

const mapTaskRow = (row) => ({
  id: row.id,
  project_id: row.project_id,
  team_id: row.team_id,
  title: row.task_text,
  description: row.task_text,
  status: row.status,
  status_id: row.status_id,
  assignee_id: row.assignee_id,
  assignee_name: row.assignee_name,
  deadline: row.deadline,
  priority: null,
});

const getStatusIdByName = async (statusName) => {
  const [rows] = await pool.query(
    'SELECT Status_ID as id, Status_Name as name FROM Status WHERE Status_Name = ?',
    [statusName]
  );

  if (rows.length > 0) {
    return rows[0].id;
  }

  const [countRows] = await pool.query('SELECT COUNT(*) as count FROM Status');
  const nextId = `S${Number(countRows[0].count) + 1}`;

  await pool.query(
    'INSERT INTO Status (Status_ID, Status_Name) VALUES (?, ?)',
    [nextId, statusName]
  );

  return nextId;
};

export const createTask = async ({ projectId, project_id, title, description, status = 'In Progress', priority = 'Medium', assigneeId, assignee_id, deadline }) => {
  const taskId = generateTaskId();
  const resolvedProjectId = projectId || project_id;
  const resolvedAssigneeId = assigneeId || assignee_id || null;
  const statusId = await getStatusIdByName(status);
  const taskText = description || title;
  
  await pool.query(
    'INSERT INTO Tasks (Task_ID, Task_Desc, Deadline, Part_Of, Assigned_To, Status_ID) VALUES (?, ?, ?, ?, ?, ?)',
    [taskId, taskText, deadline || null, resolvedProjectId, resolvedAssigneeId, statusId]
  );
  
  return {
    id: taskId,
    project_id: resolvedProjectId,
    title,
    description: taskText,
    status,
    status_id: statusId,
    priority: priority || null,
    assignee_id: resolvedAssigneeId,
    deadline
  };
};

export const getTasks = async (filters = {}) => {
  let query = `SELECT
    t.Task_ID as id,
    t.Part_Of as project_id,
    p.Team_ID as team_id,
    t.Task_Desc as task_text,
    t.Assigned_To as assignee_id,
    u.User_Name as assignee_name,
    t.Deadline as deadline,
    t.Status_ID as status_id,
    s.Status_Name as status
  FROM Tasks t
  JOIN Projects p ON t.Part_Of = p.Project_ID
  LEFT JOIN Status s ON t.Status_ID = s.Status_ID
  LEFT JOIN Users u ON t.Assigned_To = u.User_ID
  WHERE 1=1`;
  const values = [];
  
  if (filters.project_id) {
    query += ' AND t.Part_Of = ?';
    values.push(filters.project_id);
  }
  if (filters.status) {
    query += ' AND s.Status_Name = ?';
    values.push(filters.status);
  }
  if (filters.assignee_id) {
    query += ' AND t.Assigned_To = ?';
    values.push(filters.assignee_id);
  }
  
  const [rows] = await pool.query(query, values);
  return rows.map(mapTaskRow);
};

export const getTask = async (taskId) => {
  const [rows] = await pool.query(
    `SELECT
      t.Task_ID as id,
      t.Part_Of as project_id,
      p.Team_ID as team_id,
      t.Task_Desc as task_text,
      t.Assigned_To as assignee_id,
      u.User_Name as assignee_name,
      t.Deadline as deadline,
      t.Status_ID as status_id,
      s.Status_Name as status
    FROM Tasks t
    JOIN Projects p ON t.Part_Of = p.Project_ID
    LEFT JOIN Status s ON t.Status_ID = s.Status_ID
    LEFT JOIN Users u ON t.Assigned_To = u.User_ID
    WHERE t.Task_ID = ?`,
    [taskId]
  );
  
  if (rows.length === 0) return null;
  return mapTaskRow(rows[0]);
};

export const updateTask = async (taskId, { title, description, status, priority, assigneeId, assignee_id, deadline }) => {
  const updates = [];
  const values = [];
  
  if (title !== undefined || description !== undefined) {
    updates.push('Task_Desc = ?');
    values.push(description ?? title);
  }
  if (status !== undefined) {
    const statusId = await getStatusIdByName(status);
    updates.push('Status_ID = ?');
    values.push(statusId);
  }
  if (assigneeId !== undefined || assignee_id !== undefined) {
    updates.push('Assigned_To = ?');
    values.push(assigneeId ?? assignee_id);
  }
  if (deadline !== undefined) {
    updates.push('Deadline = ?');
    values.push(deadline);
  }
  
  if (updates.length === 0) return null;
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
