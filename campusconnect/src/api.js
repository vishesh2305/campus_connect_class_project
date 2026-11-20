const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
const TOKEN_KEY = 'campus_token';

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}
export function saveToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}
export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

async function request(path, options = {}) {
  const token = getToken();
  const headers = { ...(options.headers || {}) };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });
  if (!res.ok) {
    let message = `Request failed with status ${res.status}`;
    try {
      const body = await res.json();
      if (body.error) message = body.error;
    } catch {
      // the body was not JSON, keep the default message
    }
    throw new Error(message);
  }
  return res.json();
}

function sendJson(method, body) {
  return {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  };
}

// events
export const getEvents = () => request('/events');
export const getEvent = (id) => request(`/events/${id}`);
export const createEvent = (event) => request('/events', sendJson('POST', event));
export const deleteEvent = (id) => request(`/events/${id}`, { method: 'DELETE' });

// rsvps
export const rsvpEvent = (id) => request(`/events/${id}/rsvp`, { method: 'POST' });
export const cancelRsvp = (id) => request(`/events/${id}/rsvp`, { method: 'DELETE' });
export const getMyRsvps = () => request('/users/me/rsvps');

// auth
export const registerUser = (data) => request('/auth/register', sendJson('POST', data));
export const loginUser = (data) => request('/auth/login', sendJson('POST', data));
export const getMe = () => request('/auth/me');
