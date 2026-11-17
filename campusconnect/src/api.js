const API_URL = 'http://localhost:3001';

async function request(path, options) {
  const res = await fetch(`${API_URL}${path}`, options);
  if (!res.ok) throw new Error(`Request failed with status ${res.status}`);
  return res.json();
}

export const getEvents = () => request('/events');
export const getEvent = (id) => request(`/events/${id}`);
export const createEvent = (event) =>
  request('/events', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(event),
  });

export const deleteEvent = (id) => request(`/events/${id}`, { method: 'DELETE' });