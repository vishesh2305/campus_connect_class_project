import express from 'express';
import cors from 'cors';
import eventsRouter from './routes/events.js';
import usersRouter from './routes/users.js';
import authRouter from './routes/auth.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware: runs on every request, in this order
app.use(cors());
app.use(express.json());
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()}  ${req.method} ${req.url}`);
  next();
});

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'CampusConnect API is running' });
});
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

app.listen(PORT, () => {
  console.log(`API running on http://localhost:${PORT}`);
});
