const CATEGORIES = ['Tech', 'Cultural', 'Sports'];

export default function validateEvent(req, res, next) {
  const { title, club, category, date, seats } = req.body || {};
  const errors = [];

  if (typeof title !== 'string' || !title.trim()) {
    errors.push('title is required');
  }
  if (typeof club !== 'string' || !club.trim()) {
    errors.push('club is required');
  }
  if (!CATEGORIES.includes(category)) {
    errors.push(`category must be one of: ${CATEGORIES.join(', ')}`);
  }
  if (typeof date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    errors.push('date must look like 2026-12-30');
  }
  if (!Number.isInteger(Number(seats)) || Number(seats) <= 0) {
    errors.push('seats must be a whole number greater than 0');
  }

  if (errors.length > 0) {
    return res.status(400).json({ error: errors.join('. ') });
  }
  next();
}
