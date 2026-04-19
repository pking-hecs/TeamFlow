import express from 'express';
import cors from 'cors';
import './config/env.js';

// Your routes
import teamsRouter from './routes/teams.routes.js';
import authRouter from './routes/auth.routes.js';

// Teammate routes (ONLY if they don't depend on mongoose)
import projectRoutes from './routes/projects.routes.js';
import taskRoutes from './routes/tasks.routes.js';

const app = express();
const PORT = process.env.PORT || 5000;

// CORS (important for frontend)
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/auth', authRouter);
app.use('/api/teams', teamsRouter);

// Add these ONLY if they are NOT using mongoose
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);

// Error handling
app.use((err, _req, res, _next) => {
  console.error('[Error]', err);
  const status = err.status || 500;
  res.status(status).json({
    error: err.message || 'Internal Server Error',
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`server running on http://localhost:${PORT}`);
});

export default app;
