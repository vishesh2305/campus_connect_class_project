import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createEvent } from '../api';

const emptyForm = { title: '', club: '', category: 'Tech', date: '', seats: '' };

export default function CreateEvent() {
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.title.trim() || !form.club.trim() || !form.date || Number(form.seats) <= 0) {
      setError('Please fill all fields. Seats must be more than 0.');
      return;
    }
    try {
      setSaving(true);
      setError('');
      await createEvent({ ...form, seats: Number(form.seats), registered: 0 });
      navigate('/');
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  }

  return (
    <main className='container'>
      <h1>Create Event</h1>
      <form className='form' onSubmit={handleSubmit}>
        <label>Title
          <input name='title' value={form.title} onChange={handleChange} />
        </label>
        <label>Club
          <input name='club' value={form.club} onChange={handleChange} />
        </label>
        <label>Category
          <select name='category' value={form.category} onChange={handleChange}>
            <option>Tech</option>
            <option>Cultural</option>
            <option>Sports</option>
          </select>
        </label>
        <label>Date
          <input type='date' name='date' value={form.date} onChange={handleChange} />
        </label>
        <label>Seats
          <input type='number' name='seats' value={form.seats} onChange={handleChange} />
        </label>
        {error && <p role='alert' className='error'>{error}</p>}
        <button type='submit' disabled={saving}>{saving ? 'Saving...' : 'Create event'}</button>
      </form>
    </main>
  );
}
