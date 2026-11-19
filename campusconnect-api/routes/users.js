import { Router } from 'express';
import { pool } from '../db/pool.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();

// GET /users  (admin only)
router.get('/', requireAuth, requireRole('admin'), async (req, res) => {
  const result = await pool.query('SELECT id, name, email, role FROM users ORDER BY id');
  res.json(result.rows);
});

// GET /users/me/rsvps  (events the logged-in user has RSVPed to)
router.get('/me/rsvps', requireAuth, async (req, res) => {
  const result = await pool.query(
    `SELECT e.id, e.title, e.club, e.category,
            to_char(e.event_date, 'YYYY-MM-DD') AS date, e.seats
     FROM rsvps r
     JOIN events e ON e.id = r.event_id
     WHERE r.user_id = $1
     ORDER BY e.event_date`,
    [req.user.id]
  );
  res.json(result.rows);
});

export default router;
