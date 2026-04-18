// Mock data for tasks - replace with database operations later
let mockTasks = [
  {
    _id: '507f1f77bcf86cd799439021',
    project_id: '507f1f77bcf86cd799439011',
    title: 'Sample Task 1',
    description: 'A sample task',
    status: 'To Do',
    priority: 'Medium',
    assignee_id: '507f1f77bcf86cd799439001',
    deadline: new Date('2024-11-30'),
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: '507f1f77bcf86cd799439022',
    project_id: '507f1f77bcf86cd799439011',
    title: 'Sample Task 2',
    description: 'Another sample task',
    status: 'In Progress',
    priority: 'High',
    assignee_id: '507f1f77bcf86cd799439002',
    deadline: null,
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

export const getTasks = async (filters = {}, userId) => {
  // In real implementation, check permissions and query DB with filters
  let tasks = [...mockTasks];

  if (filters.project_id) {
    tasks = tasks.filter(task => task.project_id === filters.project_id);
  }
  if (filters.status) {
    tasks = tasks.filter(task => task.status === filters.status);
  }
  if (filters.assignee_id) {
    tasks = tasks.filter(task => task.assignee_id === filters.assignee_id);
  }
  if (filters.priority) {
    tasks = tasks.filter(task => task.priority === filters.priority);
  }

  return tasks;
};

export const getTask = async (taskId, userId) => {
  // In real implementation, check permissions
  const task = mockTasks.find(t => t._id === taskId);
  if (!task) {
    throw new Error('Task not found');
  }
  return task;
};

export const createTask = async (taskData, userId) => {
  // In real implementation, validate project membership and create in DB
  const newTask = {
    _id: Date.now().toString(), // Mock ID
    ...taskData,
    createdAt: new Date(),
    updatedAt: new Date()
  };
  mockTasks.push(newTask);
  return newTask;
};

export const updateTask = async (taskId, taskData, userId) => {
  // In real implementation, check permissions and update in DB
  const index = mockTasks.findIndex(t => t._id === taskId);
  if (index === -1) {
    throw new Error('Task not found');
  }
  mockTasks[index] = {
    ...mockTasks[index],
    ...taskData,
    updatedAt: new Date()
  };
  return mockTasks[index];
};

export const deleteTask = async (taskId, userId) => {
  // In real implementation, check permissions and delete from DB
  const index = mockTasks.findIndex(t => t._id === taskId);
  if (index === -1) {
    return false;
  }
  mockTasks.splice(index, 1);
  return true;
};