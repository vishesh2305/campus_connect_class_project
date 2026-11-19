import { Router } from 'express';
import { pool } from '../db/pool.js';
import validateEvent from '../middleware/validateEvent.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();

// One query that builds an event exactly as React expects it
const SELECT_EVENTS = `
  SELECT e.id, e.title, e.club, e.category,
         to_char(e.event_date, 'YYYY-MM-DD') AS date,
         e.seats,
         COUNT(r.id)::int AS registered
  FROM events e
  LEFT JOIN rsvps r ON r.event_id = e.id
`;

// Checks that :id is a positive whole number
function parseId(req, res, next) {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id < 1) {
    return res.status(404).json({ error: 'Event not found' });
  }
  req.eventId = id;
  next();
}

async function findEvent(id) {
  const result = await pool.query(`${SELECT_EVENTS} WHERE e.id = $1 GROUP BY e.id`, [id]);
  return result.rows[0];
}

// GET /events  (public)  optional filters: ?category=Tech&q=web
router.get('/', async (req, res) => {
  const { category, q } = req.query;
  const conditions = [];
  const values = [];
  if (category) {
    values.push(category);
    conditions.push(`e.category = $${values.length}`);
  }
  if (q) {
    values.push(`%${q}%`);
    conditions.push(`e.title ILIKE $${values.length}`);
  }
  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const result = await pool.query(`${SELECT_EVENTS} ${where} GROUP BY e.id ORDER BY e.id`, values);
  res.json(result.rows);
});

// GET /events/:id  (public)
router.get('/:id', parseId, async (req, res) => {
  const event = await findEvent(req.eventId);
  if (!event) return res.status(404).json({ error: 'Event not found' });
  res.json(event);
});

// POST /events  (admin only)
router.post('/', requireAuth, requireRole('admin'), validateEvent, async (req, res) => {
  const { title, club, category, date, seats } = req.body;
  const inserted = await pool.query(
    `INSERT INTO events (title, club, category, event_date, seats)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id`,
    [title.trim(), club.trim(), category, date, Number(seats)]
  );
  const created = await findEvent(inserted.rows[0].id);
  res.status(201).json(created);
});

// PUT /events/:id  (admin only)
router.put('/:id', requireAuth, requireRole('admin'), parseId, validateEvent, async (req, res) => {
  const { title, club, category, date, seats } = req.body;
  const updated = await pool.query(
    `UPDATE events
     SET title = $1, club = $2, category = $3, event_date = $4, seats = $5
     WHERE id = $6`,
    [title.trim(), club.trim(), category, date, Number(seats), req.eventId]
  );
  if (updated.rowCount === 0) return res.status(404).json({ error: 'Event not found' });
  res.json(await findEvent(req.eventId));
});

// DELETE /events/:id  (admin only)
router.delete('/:id', requireAuth, requireRole('admin'), parseId, async (req, res) => {
  const result = await pool.query('DELETE FROM events WHERE id = $1', [req.eventId]);
  if (result.rowCount === 0) return res.status(404).json({ error: 'Event not found' });
  res.json({ message: 'Event deleted' });
});

// POST /events/:id/rsvp  (any logged-in user, always for themselves)
router.post('/:id/rsvp', requireAuth, parseId, async (req, res) => {
  const event = await findEvent(req.eventId);
  if (!event) return res.status(404).json({ error: 'Event not found' });
  if (event.registered >= event.seats) {
    return res.status(409).json({ error: 'Event is full' });
  }
  try {
    await pool.query(
      'INSERT INTO rsvps (user_id, event_id) VALUES ($1, $2)',
      [req.user.id, req.eventId]
    );
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ error: 'You have already registered for this event' });
    }
    throw err;
  }
  res.json(await findEvent(req.eventId));
});

// DELETE /events/:id/rsvp  (cancel my own RSVP)
router.delete('/:id/rsvp', requireAuth, parseId, async (req, res) => {
  const result = await pool.query(
    'DELETE FROM rsvps WHERE user_id = $1 AND event_id = $2',
    [req.user.id, req.eventId]
  );
  if (result.rowCount === 0) {
    return res.status(404).json({ error: 'You have not registered for this event' });
  }
  res.json(await findEvent(req.eventId));
});

export default router;

