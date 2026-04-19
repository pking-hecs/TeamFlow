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

async function requireProjectAdmin(projectId, userId, res) {
  const project = await requireProjectAccess(projectId, userId, res);
  const member = await Team.getMember(project.team_id, userId);

  if (member?.role !== 'admin') {
    if (res) res.status(403).json({ error: 'Only team admins can manage tasks' });
    throw new Error('Admin privileges required');
  }

  return project;
}

async function ensureAssigneeIsTeamMember(teamId, assigneeId) {
  if (!assigneeId) return;

  const member = await Team.getMember(teamId, assigneeId);
  if (!member) {
    throw new Error('Assigned user must be a member of the team');
  }
}

function isStatusOnlyUpdate(taskData = {}) {
  const allowedKeys = ['status'];
  const presentKeys = Object.keys(taskData).filter((key) => taskData[key] !== undefined);

  return presentKeys.length > 0 && presentKeys.every((key) => allowedKeys.includes(key));
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
  const { project_id, assignee_id, assigneeId } = taskData;
  
  if (!project_id) {
    throw new Error('project_id is required');
  }
  
  const project = await requireProjectAdmin(project_id, userId);
  await ensureAssigneeIsTeamMember(project.team_id, assignee_id || assigneeId);
  
  return await Task.createTask(taskData);
};

export const updateTask = async (taskId, taskData, userId) => {
  const task = await Task.getTask(taskId);
  if (!task) {
    throw new Error('Task not found');
  }

  const project = await requireProjectAccess(task.project_id, userId);
  const membership = await Team.getMember(project.team_id, userId);
  const isAdmin = membership?.role === 'admin';
  const isAssignee = String(task.assignee_id) === String(userId);

  if (!isAdmin) {
    if (!(isAssignee && isStatusOnlyUpdate(taskData))) {
      throw new Error('Only team admins can edit tasks, except an assignee may move their own task status');
    }
  } else {
    await ensureAssigneeIsTeamMember(project.team_id, taskData.assignee_id || taskData.assigneeId);
  }
  
  return await Task.updateTask(taskId, taskData);
};

export const deleteTask = async (taskId, userId) => {
  const task = await Task.getTask(taskId);
  if (!task) {
    return false;
  }
  
  await requireProjectAdmin(task.project_id, userId);
  
  return await Task.deleteTask(taskId);
};
