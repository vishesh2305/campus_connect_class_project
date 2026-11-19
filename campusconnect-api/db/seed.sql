INSERT INTO users (name, email) VALUES
  ('Asha', 'asha@example.com'),
  ('Ravi', 'ravi@example.com'),
  ('Meera', 'meera@example.com');

INSERT INTO events (title, club, category, event_date, seats) VALUES
  ('Hackathon 2026', 'Coding Club', 'Tech', '2026-12-05', 100),
  ('Cultural Night', 'Music Society', 'Cultural', '2026-12-12', 300),
  ('Inter-college Cricket', 'Sports Club', 'Sports', '2026-12-18', 3),
  ('AI Workshop', 'AI Club', 'Tech', '2026-12-20', 80),
  ('Dance Competition', 'Dance Club', 'Cultural', '2026-12-22', 150),
  ('Web Dev Bootcamp', 'Coding Club', 'Tech', '2026-12-28', 50);

INSERT INTO rsvps (user_id, event_id) VALUES
  (1, 1), (2, 1),
  (1, 4), (3, 4),
  (3, 2),
  (2, 6),
  (1, 3), (2, 3), (3, 3);