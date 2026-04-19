import express from 'express';
import { body, validationResult } from 'express-validator';
import {
getProjects,
getProject,
createProject,
updateProject,
deleteProject
} from '../controllers/projects.controller.js';
import authMiddleware from '../middleware/auth.middleware.js';

const router = express.Router();

// Validation middleware
const validateProjectCreation = [
  body('name')
    .trim()
    .notEmpty().withMessage('Project name is required')
    .isLength({ max: 255 }).withMessage('Name must be less than 255 characters'),
  body('team_id')
    .notEmpty().withMessage('team_id is required'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 }).withMessage('Description must be less than 1000 characters'),
  body('deadline')
    .optional()
    .isISO8601().withMessage('Invalid deadline format (use ISO 8601)')
];

const validateProjectUpdate = [
  body('name')
    .optional()
    .trim()
    .isLength({ max: 255 }).withMessage('Name must be less than 255 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 }).withMessage('Description must be less than 1000 characters'),
  body('deadline')
    .optional()
    .isISO8601().withMessage('Invalid deadline format (use ISO 8601)')
];

// GET /api/projects?teamId=...
router.get('/', authMiddleware, async (req, res) => {
try {
const { teamId } = req.query;
if (!teamId) {
return res.status(400).json({ message: 'teamId query parameter is required' });
    }
const projects = await getProjects(teamId, req.user.id);
res.json(projects);
  } catch (error) {
res.status(500).json({ message: error.message });
  }
});

// GET /api/projects/:id
router.get('/:id', authMiddleware, async (req, res) => {
try {
const project = await getProject(req.params.id, req.user.id);
res.json(project);
  } catch (error) {
if (error.message === 'Project not found') {
return res.status(404).json({ message: error.message });
    }
res.status(500).json({ message: error.message });
  }
});

// POST /api/projects
router.post('/', authMiddleware, validateProjectCreation, async (req, res) => {
const errors = validationResult(req);
if (!errors.isEmpty()) {
return res.status(400).json({ errors: errors.array() });
  }

try {
const project = await createProject(req.body, req.user.id);
res.status(201).json(project);
  } catch (error) {
res.status(400).json({ message: error.message });
  }
});

// PUT /api/projects/:id
router.put('/:id', authMiddleware, validateProjectUpdate, async (req, res) => {
const errors = validationResult(req);
if (!errors.isEmpty()) {
return res.status(400).json({ errors: errors.array() });
  }

try {
const project = await updateProject(req.params.id, req.body, req.user.id);
res.json(project);
  } catch (error) {
if (error.message === 'Project not found') {
return res.status(404).json({ message: error.message });
    }
res.status(400).json({ message: error.message });
  }
});

// DELETE /api/projects/:id
router.delete('/:id', authMiddleware, async (req, res) => {
try {
const deleted = await deleteProject(req.params.id, req.user.id);
if (!deleted) {
return res.status(404).json({ message: 'Project not found' });
    }
res.json({ message: 'Project deleted successfully' });
  } catch (error) {
res.status(500).json({ message: error.message });
  }
});

export default router;