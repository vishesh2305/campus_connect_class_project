import { describe, it, expect, vi } from 'vitest';
import validateEvent from '../middleware/validateEvent.js';

// A fake Express response: status() and json() are spies that remember how they were called
function fakeRes() {
  const res = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
}

const validBody = {
  title: 'Quiz Night',
  club: 'Coding Club',
  category: 'Tech',
  date: '2026-12-30',
  seats: 40,
};

describe('validateEvent middleware', () => {
  it('calls next() when the body is valid', () => {
    const next = vi.fn();
    const res = fakeRes();
    validateEvent({ body: validBody }, res, next);
    expect(next).toHaveBeenCalledOnce();
    expect(res.status).not.toHaveBeenCalled();
  });

  it('replies 400 when seats is negative', () => {
    const next = vi.fn();
    const res = fakeRes();
    validateEvent({ body: { ...validBody, seats: -5 } }, res, next);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(next).not.toHaveBeenCalled();
  });

  it('replies 400 when seats is zero', () => {
    const next = vi.fn();
    const res = fakeRes();
    validateEvent({ body: { ...validBody, seats: 0 } }, res, next);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(next).not.toHaveBeenCalled();
  });

  it('replies 400 when the category is not allowed', () => {
    const next = vi.fn();
    const res = fakeRes();
    validateEvent({ body: { ...validBody, category: 'Music' } }, res, next);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(next).not.toHaveBeenCalled();
  });

  it('replies 400 when the title is empty', () => {
    const next = vi.fn();
    const res = fakeRes();
    validateEvent({ body: { ...validBody, title: '   ' } }, res, next);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('replies 400 when the date has the wrong format', () => {
    const next = vi.fn();
    const res = fakeRes();
    validateEvent({ body: { ...validBody, date: '30-12-2026' } }, res, next);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('replies 400 when there is no body at all', () => {
    const next = vi.fn();
    const res = fakeRes();
    validateEvent({}, res, next);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(next).not.toHaveBeenCalled();
  });
});
