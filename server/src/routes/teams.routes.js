import { Router } from 'express';
import authMiddleware from '../middleware/auth.middleware.js';
import {
  createTeam,
  getTeams,
  getTeam,
  updateTeam,
  deleteTeam,
  addMember,
  updateMemberRole,
  removeMember,
} from '../controllers/teams.controller.js';
const router = Router();
router.use(authMiddleware);
router.post('/', createTeam);
router.get('/', getTeams);
router.get('/:id', getTeam);
router.patch('/:id', updateTeam);
router.delete('/:id', deleteTeam);
router.post('/:id/members', addMember);
router.patch('/:id/members/:userId', updateMemberRole);
router.delete('/:id/members/:userId', removeMember);
export default router;
