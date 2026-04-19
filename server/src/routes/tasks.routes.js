import express from 'express';
import {
  getTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask
} from '../controllers/tasks.controller.js';
import authMiddleware from '../middleware/auth.middleware.js';

const router = express.Router();

// GET /api/tasks?projectId=...&status=...&assigneeId=...&priority=...
router.get('/', authMiddleware, async (req, res) => {
  try {
    const filters = {};
    if (req.query.projectId) filters.project_id = req.query.projectId;
    if (req.query.status) filters.status = req.query.status;
    if (req.query.assigneeId) filters.assignee_id = req.query.assigneeId;
    if (req.query.priority) filters.priority = req.query.priority;

    const tasks = await getTasks(filters, req.user.id);
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/tasks/:id
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const task = await getTask(req.params.id, req.user.id);
    res.json(task);
  } catch (error) {
    if (error.message === 'Task not found') {
      return res.status(404).json({ message: error.message });
    }
    res.status(500).json({ message: error.message });
  }
});

// POST /api/tasks
router.post('/', authMiddleware, async (req, res) => {
  try {
    const task = await createTask(req.body, req.user.id);
    res.status(201).json(task);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// PUT /api/tasks/:id
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const task = await updateTask(req.params.id, req.body, req.user.id);
    res.json(task);
  } catch (error) {
    if (error.message === 'Task not found') {
      return res.status(404).json({ message: error.message });
    }
    res.status(400).json({ message: error.message });
  }
});

// DELETE /api/tasks/:id
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const deleted = await deleteTask(req.params.id, req.user.id);
    if (!deleted) {
      return res.status(404).json({ message: 'Task not found' });
    }
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;