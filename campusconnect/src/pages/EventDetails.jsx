
import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getEvent, deleteEvent } from '../api';

export default function EventDetails() {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleDelete = () => {
    if (!window.confirm(`Delete "${event.title}"?`)) return;
    deleteEvent(id)
      .then(() => navigate('/'))
      .catch((err) => setError(err.message));
  };

  useEffect(() => {
    setLoading(true);
    setError('');
    getEvent(id)
      .then((data) => setEvent(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <main className='container'><p>Loading...</p></main>;
  if (error) return <main className='container'><p role='alert' className='error'>{error}</p></main>;

  return (
    <main className='container'>
      <Link to='/'>← Back to events</Link>
      <article className='card details'>
        <span className='badge'>{event.category}</span>
        <h1>{event.title}</h1>
        <p className='muted'>Organised by {event.club}</p>
        <p>Date: {event.date}</p>
        <p>Seats: {event.registered} of {event.seats} taken</p>
        <button type='button' onClick={handleDelete}>Delete Event</button>
      </article>
    </main>
  );
}
