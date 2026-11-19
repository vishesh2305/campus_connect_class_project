import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { pool } from '../db/pool.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function createToken(user) {
  return jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '2h' });
}

// POST /auth/register
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body || {};
  const errors = [];
  if (typeof name !== 'string' || !name.trim()) {
    errors.push('name is required');
  }
  if (typeof email !== 'string' || !EMAIL_PATTERN.test(email)) {
    errors.push('a valid email is required');
  }
  if (typeof password !== 'string' || password.length < 8) {
    errors.push('password must be at least 8 characters');
  }
  if (errors.length > 0) {
    return res.status(400).json({ error: errors.join('. ') });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  try {
    const result = await pool.query(
      `INSERT INTO users (name, email, password_hash)
       VALUES ($1, $2, $3)
       RETURNING id, name, email, role`,
      [name.trim(), email.trim().toLowerCase(), passwordHash]
    );
    const user = result.rows[0];
    res.status(201).json({ token: createToken(user), user });
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ error: 'Email is already registered' });
    }
    throw err;
  }
});

// POST /auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body || {};
  if (typeof email !== 'string' || typeof password !== 'string') {
    return res.status(400).json({ error: 'email and password are required' });
  }
  const result = await pool.query(
    'SELECT id, name, email, role, password_hash FROM users WHERE email = $1',
    [email.trim().toLowerCase()]
  );
  const row = result.rows[0];
  const ok = row && row.password_hash && (await bcrypt.compare(password, row.password_hash));
  if (!ok) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  const user = { id: row.id, name: row.name, email: row.email, role: row.role };
  res.json({ token: createToken(user), user });
});

// GET /auth/me  (needs a valid token)
router.get('/me', requireAuth, async (req, res) => {
  const result = await pool.query(
    'SELECT id, name, email, role FROM users WHERE id = $1',
    [req.user.id]
  );
  if (result.rows.length === 0) {
    return res.status(401).json({ error: 'User no longer exists' });
  }
  res.json(result.rows[0]);
});

export default router;
