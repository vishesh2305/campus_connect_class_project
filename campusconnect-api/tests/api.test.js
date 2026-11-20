import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../app.js';
import { pool } from '../db/pool.js';

// Unique test accounts, so tests never touch real users
const stamp = Date.now();
const studentEmail = `test-student-${stamp}@example.com`;
const adminEmail = `test-admin-${stamp}@example.com`;
const password = 'password123';

let studentToken;
let adminToken;

const asStudent = (req) => req.set('Authorization', `Bearer ${studentToken}`);
const asAdmin = (req) => req.set('Authorization', `Bearer ${adminToken}`);

beforeAll(async () => {
  // A student
  const s = await request(app)
    .post('/auth/register')
    .send({ name: 'Test Student', email: studentEmail, password });
  expect(s.status).toBe(201);
  studentToken = s.body.token;

  // An admin: register, promote in the database, then log in again for a fresh token
  await request(app)
    .post('/auth/register')
    .send({ name: 'Test Admin', email: adminEmail, password });
  await pool.query("UPDATE users SET role = 'admin' WHERE email = $1", [adminEmail]);
  const a = await request(app).post('/auth/login').send({ email: adminEmail, password });
  expect(a.status).toBe(200);
  adminToken = a.body.token;
});

afterAll(async () => {
  // Clean up everything the tests created, then close the database connections
  await pool.query("DELETE FROM events WHERE title LIKE 'TEST %'");
  await pool.query("DELETE FROM users WHERE email LIKE 'test-%@example.com'");
  await pool.end();
});

describe('public routes', () => {
  it('GET / says the API is running', async () => {
    const res = await request(app).get('/');
    expect(res.status).toBe(200);
    expect(res.body.message).toMatch(/running/);
  });

  it('GET /health checks the database', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });

  it('GET /events returns an array of events', async () => {
    const res = await request(app).get('/events');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body[0]).toHaveProperty('title');
    expect(res.body[0]).toHaveProperty('registered');
  });

  it('GET /events?category=Tech returns only Tech events', async () => {
    const res = await request(app).get('/events?category=Tech');
    expect(res.status).toBe(200);
    res.body.forEach((e) => expect(e.category).toBe('Tech'));
  });

  it('GET /events/999999 returns 404', async () => {
    const res = await request(app).get('/events/999999');
    expect(res.status).toBe(404);
  });

  it('GET /events/abc returns 404', async () => {
    const res = await request(app).get('/events/abc');
    expect(res.status).toBe(404);
  });

  it('an unknown route returns a JSON 404', async () => {
    const res = await request(app).get('/nothing-here');
    expect(res.status).toBe(404);
    expect(res.body.error).toMatch(/not found/i);
  });
});

describe('pagination and caching', () => {
  it('GET /events?page=1&limit=2 returns at most 2 events and the total', async () => {
    const res = await request(app).get('/events?page=1&limit=2');
    expect(res.status).toBe(200);
    expect(res.body.length).toBeLessThanOrEqual(2);
    expect(Number(res.headers['x-total-count'])).toBeGreaterThanOrEqual(res.body.length);
  });

  it('serves the second identical request from the cache', async () => {
    const first = await request(app).get('/events?category=Sports');
    const second = await request(app).get('/events?category=Sports');
    expect(first.status).toBe(200);
    expect(second.headers['x-cache']).toBe('HIT');
  });
});

describe('authentication', () => {
  it('rejects a duplicate email with 409', async () => {
    const res = await request(app)
      .post('/auth/register')
      .send({ name: 'Again', email: studentEmail, password });
    expect(res.status).toBe(409);
  });

  it('rejects a short password with 400', async () => {
    const res = await request(app)
      .post('/auth/register')
      .send({ name: 'Short', email: `test-short-${stamp}@example.com`, password: '123' });
    expect(res.status).toBe(400);
  });

  it('rejects a wrong password with 401', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({ email: studentEmail, password: 'wrong-password' });
    expect(res.status).toBe(401);
  });

  it('GET /auth/me needs a token', async () => {
    const res = await request(app).get('/auth/me');
    expect(res.status).toBe(401);
  });

  it('GET /auth/me returns the logged-in user', async () => {
    const res = await asStudent(request(app).get('/auth/me'));
    expect(res.status).toBe(200);
    expect(res.body.email).toBe(studentEmail);
    expect(res.body.role).toBe('student');
  });
});

describe('authorization', () => {
  const newEvent = {
    title: 'TEST Forbidden Event',
    club: 'Test Club',
    category: 'Tech',
    date: '2026-12-31',
    seats: 10,
  };

  it('blocks creating an event without a token (401)', async () => {
    const res = await request(app).post('/events').send(newEvent);
    expect(res.status).toBe(401);
  });

  it('blocks a student from creating an event (403)', async () => {
    const res = await asStudent(request(app).post('/events')).send(newEvent);
    expect(res.status).toBe(403);
  });

  it('blocks a student from deleting an event (403)', async () => {
    const res = await asStudent(request(app).delete('/events/1'));
    expect(res.status).toBe(403);
  });

  it('blocks a student from listing users (403)', async () => {
    const res = await asStudent(request(app).get('/users'));
    expect(res.status).toBe(403);
  });

  it('lets an admin list users (200)', async () => {
    const res = await asAdmin(request(app).get('/users'));
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});

describe('full flow: create, RSVP, cancel, delete', () => {
  it('works from start to finish', async () => {
    // 1. The admin creates an event
    const created = await asAdmin(request(app).post('/events')).send({
      title: 'TEST Flow Event',
      club: 'Test Club',
      category: 'Tech',
      date: '2026-12-31',
      seats: 2,
    });
    expect(created.status).toBe(201);
    expect(created.body.registered).toBe(0);
    const id = created.body.id;

    // 2. The student RSVPs
    const rsvp = await asStudent(request(app).post(`/events/${id}/rsvp`));
    expect(rsvp.status).toBe(200);
    expect(rsvp.body.registered).toBe(1);

    // 3. A second RSVP by the same student is refused
    const again = await asStudent(request(app).post(`/events/${id}/rsvp`));
    expect(again.status).toBe(409);

    // 4. The event shows up in "my RSVPs"
    const mine = await asStudent(request(app).get('/users/me/rsvps'));
    expect(mine.status).toBe(200);
    expect(mine.body.map((e) => e.id)).toContain(id);

    // 5. The student cancels
    const cancel = await asStudent(request(app).delete(`/events/${id}/rsvp`));
    expect(cancel.status).toBe(200);
    expect(cancel.body.registered).toBe(0);

    // 6. The admin deletes the event
    const removed = await asAdmin(request(app).delete(`/events/${id}`));
    expect(removed.status).toBe(200);

    // 7. It is gone
    const gone = await request(app).get(`/events/${id}`);
    expect(gone.status).toBe(404);
  });
});
