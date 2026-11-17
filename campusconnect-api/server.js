import express from 'express';
import cors from 'cors';
import eventsRouter from './routes/events.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware: runs on every request, in this order
app.use(cors("*"));
app.use(express.json());
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()}  ${req.method} ${req.url}`);
  next();
});

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'CampusConnect API is running' });
});
app.use('/events', eventsRouter);

// 404 handler: runs only if no route matched
app.use((req, res) => {
  res.status(404).json({ error: `Route not found: ${req.method} ${req.url}` });
});

// Error handler: 4 arguments, so Express knows it is for errors
app.use((err, req, res, next) => {
  console.error(err);
  const status = err.status || 500;
  res.status(status).json({
    error: status === 500 ? 'Something went wrong on the server' : err.message,
  });
});

app.listen(PORT, () => {
  console.log(`API running on http://localhost:${PORT}`);
});