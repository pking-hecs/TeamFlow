import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import teamsRouter from './routes/teams.routes.js';
import authRouter from './routes/auth.routes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRouter);
app.use('/api/teams', teamsRouter);

app.use((err, _req, res, _next) => {
  console.error('[Error]', err);
  const status = err.status || 500;
  res.status(status).json({
    error: err.message || 'Internal Server Error',
  });
});

app.listen(PORT, () => {
  console.log(`server running on http://localhost:${PORT}`);
});

export default app;
