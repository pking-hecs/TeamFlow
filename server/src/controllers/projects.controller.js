// Mock data for projects - replace with database operations later
let mockProjects = [
  {
    _id: '507f1f77bcf86cd799439011',
    team_id: '507f1f77bcf86cd799439010',
    name: 'Sample Project 1',
    description: 'A sample project for demonstration',
    deadline: new Date('2024-12-31'),
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: '507f1f77bcf86cd799439012',
    team_id: '507f1f77bcf86cd799439010',
    name: 'Sample Project 2',
    description: 'Another sample project',
    deadline: null,
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

export const getProjects = async (teamId, userId) => {
  // In real implementation, check if user is member of the team
  // For now, return mock data filtered by team_id
  return mockProjects.filter(project => project.team_id === teamId);
};

export const getProject = async (projectId, userId) => {
  // In real implementation, check permissions
  const project = mockProjects.find(p => p._id === projectId);
  if (!project) {
    throw new Error('Project not found');
  }
  return project;
};

export const createProject = async (projectData, userId) => {
  // In real implementation, validate team membership and create in DB
  const newProject = {
    _id: Date.now().toString(), // Mock ID
    ...projectData,
    createdAt: new Date(),
    updatedAt: new Date()
  };
  mockProjects.push(newProject);
  return newProject;
};

export const updateProject = async (projectId, projectData, userId) => {
  // In real implementation, check permissions and update in DB
  const index = mockProjects.findIndex(p => p._id === projectId);
  if (index === -1) {
    throw new Error('Project not found');
  }
  mockProjects[index] = {
    ...mockProjects[index],
    ...projectData,
    updatedAt: new Date()
  };
  return mockProjects[index];
};

export const deleteProject = async (projectId, userId) => {
  // In real implementation, check permissions and delete from DB
  const index = mockProjects.findIndex(p => p._id === projectId);
  if (index === -1) {
    return false;
  }
  mockProjects.splice(index, 1);
  return true;
};