import { Router } from 'express';
import { events } from '../data/events.js';
import validateEvent from '../middleware/validateEvent.js';

const router = Router();

// GET /events  (optional filters: ?category=Tech&q=web)
router.get('/', (req, res) => {
  const { category, q } = req.query;
  let result = events;
  if (category) {
    result = result.filter((e) => e.category === category);
  }
  if (q) {
    result = result.filter((e) => e.title.toLowerCase().includes(q.toLowerCase()));
  }
  res.json(result);
});

// GET /events/:id
router.get('/:id', (req, res) => {
  const id = Number(req.params.id);
  const event = events.find((e) => e.id === id);
  if (!event) return res.status(404).json({ error: 'Event not found' });
  res.json(event);
});

// POST /events
router.post('/', validateEvent, (req, res) => {
  const { title, club, category, date, seats } = req.body;
  const newEvent = {
    id: events.length ? Math.max(...events.map((e) => e.id)) + 1 : 1,
    title: title.trim(),
    club: club.trim(),
    category,
    date,
    seats: Number(seats),
    registered: 0,
  };
  events.push(newEvent);
  res.status(201).json(newEvent);
});

// PUT /events/:id
router.put('/:id', validateEvent, (req, res) => {
  const id = Number(req.params.id);
  const index = events.findIndex((e) => e.id === id);
  if (index === -1) return res.status(404).json({ error: 'Event not found' });

  const { title, club, category, date, seats } = req.body;
  events[index] = {
    ...events[index],
    title: title.trim(),
    club: club.trim(),
    category,
    date,
    seats: Number(seats),
  };
  res.json(events[index]);
});

// DELETE /events/:id
router.delete('/:id', (req, res) => {
  const id = Number(req.params.id);
  const index = events.findIndex((e) => e.id === id);
  if (index === -1) return res.status(404).json({ error: 'Event not found' });
  events.splice(index, 1);
  res.json({ message: 'Event deleted' });
});

export default router;