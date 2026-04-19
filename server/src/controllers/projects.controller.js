import * as Project from '../models/project.model.js';
import * as Team from '../models/team.model.js';

async function requireTeamAccess(teamId, userId, res) {
  const member = await Team.getMember(teamId, userId);
  if (!member) {
    if (res) res.status(403).json({ error: 'You are not a member of this team' });
    return null;
  }
  return member;
}

async function requireTeamAdmin(teamId, userId, res) {
  const member = await requireTeamAccess(teamId, userId, res);
  if (!member) return null;
  if (member.role !== 'admin') {
    if (res) res.status(403).json({ error: 'Only team admins can manage projects' });
    throw new Error('Admin privileges required');
  }
  return member;
}

export const getProjects = async (teamId, userId) => {
  await requireTeamAccess(teamId, userId, null);
  return await Project.getProjects(teamId);
};

export const getProject = async (projectId, userId) => {
  const project = await Project.getProject(projectId);
  if (!project) {
    throw new Error('Project not found');
  }
  
  await requireTeamAccess(project.team_id, userId, null);
  return project;
};

export const createProject = async (projectData, userId) => {
  const { team_id, name, description, deadline } = projectData;
  
  if (!team_id) {
    throw new Error('team_id is required');
  }
  
  await requireTeamAdmin(team_id, userId, null);
  
  return await Project.createProject(team_id, { name, description, deadline });
};

export const updateProject = async (projectId, projectData, userId) => {
  const project = await Project.getProject(projectId);
  if (!project) {
    throw new Error('Project not found');
  }
  
  await requireTeamAdmin(project.team_id, userId, null);
  
  return await Project.updateProject(projectId, projectData);
};

export const deleteProject = async (projectId, userId) => {
  const project = await Project.getProject(projectId);
  if (!project) {
    return false;
  }
  
  await requireTeamAdmin(project.team_id, userId, null);
  
  return await Project.deleteProject(projectId);
};
