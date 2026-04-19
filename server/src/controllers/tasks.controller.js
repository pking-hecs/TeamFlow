import * as Task from '../models/task.model.js';
import * as Project from '../models/project.model.js';
import * as Team from '../models/team.model.js';

async function requireProjectAccess(projectId, userId, res) {
  const project = await Project.getProject(projectId);
  if (!project) {
    throw new Error('Project not found');
  }
  
  const member = await Team.getMember(project.team_id, userId);
  if (!member) {
    if (res) res.status(403).json({ error: 'You do not have access to this project' });
    throw new Error('Access denied');
  }
  
  return project;
}

export const getTasks = async (filters = {}, userId) => {
  // If filtering by project, check access
  if (filters.project_id) {
    await requireProjectAccess(filters.project_id, userId);
  }
  
  return await Task.getTasks(filters);
};

export const getTask = async (taskId, userId) => {
  const task = await Task.getTask(taskId);
  if (!task) {
    throw new Error('Task not found');
  }
  
  await requireProjectAccess(task.project_id, userId);
  return task;
};

export const createTask = async (taskData, userId) => {
  const { project_id } = taskData;
  
  if (!project_id) {
    throw new Error('project_id is required');
  }
  
  await requireProjectAccess(project_id, userId);
  
  return await Task.createTask(taskData);
};

export const updateTask = async (taskId, taskData, userId) => {
  const task = await Task.getTask(taskId);
  if (!task) {
    throw new Error('Task not found');
  }
  
  await requireProjectAccess(task.project_id, userId);
  
  return await Task.updateTask(taskId, taskData);
};

export const deleteTask = async (taskId, userId) => {
  const task = await Task.getTask(taskId);
  if (!task) {
    return false;
  }
  
  await requireProjectAccess(task.project_id, userId);
  
  return await Task.deleteTask(taskId);
};