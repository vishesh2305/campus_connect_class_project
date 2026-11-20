import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { rateLimit } from 'express-rate-limit';
import { pool } from './db/pool.js';
import eventsRouter from './routes/events.js';
import usersRouter from './routes/users.js';
import authRouter from './routes/auth.js';

const app = express();

// Limit login attempts (skipped while tests are running)
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => process.env.NODE_ENV === 'test',
  message: { error: 'Too many attempts, try again later' },
});

// Middleware: runs on every request, in this order
app.use(cors({ exposedHeaders: ['X-Total-Count', 'X-Cache'] }));
app.use(helmet());
app.use(express.json());
if (process.env.NODE_ENV !== 'test' && process.env.LOG_REQUESTS !== 'off') {
  app.use(morgan('dev'));
}

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'CampusConnect API is running' });
});

// Health check: is the app alive and can it reach the database?
app.get('/health', async (req, res) => {
  await pool.query('SELECT 1');
  res.json({ status: 'ok', uptime: process.uptime() });
});

app.use('/auth/login', loginLimiter);
app.use('/auth', authRouter);
app.use('/events', eventsRouter);
app.use('/users', usersRouter);

// 404 handler: runs only if no route matched
app.use((req, res) => {
  res.status(404).json({ error: `Route not found: ${req.method} ${req.url}` });
});

// Error handler: 4 arguments, so Express knows it is for errors
app.use((err, req, res, next) => {
  console.error(err);
  let status = err.status || 500;
  let message = err.message;

  if (err.code === '23505') {
    status = 409;
    message = 'That record already exists';
  } else if (err.code === '23503') {
    status = 400;
    message = 'Referenced record does not exist';
  } else if (['22007', '22008', '22P02', '22003', '23514'].includes(err.code)) {
    status = 400;
    message = 'Invalid data';
  }
  if (status === 500) message = 'Something went wrong on the server';

  res.status(status).json({ error: message });
});

export default app;
