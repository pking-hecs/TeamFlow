import express from 'express';
import { body, validationResult } from 'express-validator';
import {
getTasks,
getTask,
createTask,
updateTask,
deleteTask
} from '../controllers/tasks.controller.js';
import authMiddleware from '../middleware/auth.middleware.js';

const router = express.Router();

const validTaskStatuses = ['To Do', 'In Progress', 'Done'];
const validPriorities = ['Low', 'Medium', 'High'];

const validateTaskCreation = [
  body('title')
    .trim()
    .notEmpty().withMessage('Task title is required')
    .isLength({ max: 255 }).withMessage('Title must be less than 255 characters'),
  body('project_id')
    .notEmpty().withMessage('project_id is required'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 }).withMessage('Description must be less than 1000 characters'),
  body('status')
    .optional()
    .isIn(validTaskStatuses).withMessage(`Status must be one of: ${validTaskStatuses.join(', ')}`),
  body('priority')
    .optional()
    .isIn(validPriorities).withMessage(`Priority must be one of: ${validPriorities.join(', ')}`),
  body('deadline')
    .optional()
    .isISO8601().withMessage('Invalid deadline format (use ISO 8601)')
];

const validateTaskUpdate = [
  body('title')
    .optional()
    .trim()
    .isLength({ max: 255 }).withMessage('Title must be less than 255 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 }).withMessage('Description must be less than 1000 characters'),
  body('status')
    .optional()
    .isIn(validTaskStatuses).withMessage(`Status must be one of: ${validTaskStatuses.join(', ')}`),
  body('priority')
    .optional()
    .isIn(validPriorities).withMessage(`Priority must be one of: ${validPriorities.join(', ')}`),
  body('deadline')
    .optional()
    .isISO8601().withMessage('Invalid deadline format (use ISO 8601)')
];

// GET /api/tasks?projectId=...&status=...&assigneeId=...&priority=...
router.get('/', authMiddleware, async (req, res) => {
try {
const filters = {};

// Validate query parameters
if (req.query.status && !validTaskStatuses.includes(req.query.status)) {
return res.status(400).json({ 
message: `Invalid status. Must be one of: ${validTaskStatuses.join(', ')}` 
    });
  }

if (req.query.priority && !validPriorities.includes(req.query.priority)) {
return res.status(400).json({ 
message: `Invalid priority. Must be one of: ${validPriorities.join(', ')}` 
    });
  }

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
router.post('/', authMiddleware, validateTaskCreation, async (req, res) => {
const errors = validationResult(req);
if (!errors.isEmpty()) {
return res.status(400).json({ errors: errors.array() });
  }

try {
const task = await createTask(req.body, req.user.id);
res.status(201).json(task);
  } catch (error) {
res.status(400).json({ message: error.message });
  }
});

// PUT /api/tasks/:id
router.put('/:id', authMiddleware, validateTaskUpdate, async (req, res) => {
const errors = validationResult(req);
if (!errors.isEmpty()) {
return res.status(400).json({ errors: errors.array() });
  }

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