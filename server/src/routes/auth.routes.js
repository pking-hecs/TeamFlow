import { Router } from 'express';

const router = Router();

// Mock endpoints so the server can run without the actual Auth module
router.post('/login', (req, res) => {
  res.json({ token: 'mock_token', user: { id: 1, email: 'test@example.com', name: 'Test User' } });
});

router.post('/register', (req, res) => {
  res.json({ token: 'mock_token', user: { id: 1, email: 'test@example.com', name: 'Test User' } });
});

router.get('/me', (req, res) => {
  res.json({ data: { id: 1, email: 'test@example.com', name: 'Test User' } });
});

export default router;
