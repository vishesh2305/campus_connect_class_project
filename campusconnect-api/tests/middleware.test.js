import { describe, it, expect, vi } from 'vitest';
import { requireRole } from '../middleware/auth.js';

function fakeRes() {
  const res = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
}

describe('requireRole middleware', () => {
  it('lets a user with the right role through', () => {
    const next = vi.fn();
    const res = fakeRes();
    requireRole('admin')({ user: { id: 1, role: 'admin' } }, res, next);
    expect(next).toHaveBeenCalledOnce();
  });

  it('blocks a student with 403', () => {
    const next = vi.fn();
    const res = fakeRes();
    requireRole('admin')({ user: { id: 2, role: 'student' } }, res, next);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });

  it('blocks a request that has no user with 403', () => {
    const next = vi.fn();
    const res = fakeRes();
    requireRole('admin')({}, res, next);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });
});
