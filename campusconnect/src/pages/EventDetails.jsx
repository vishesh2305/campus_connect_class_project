import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getEvent, deleteEvent } from '../api';
import { useAuth } from '../AuthContext';

export default function EventDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    setError('');
    getEvent(id)
      .then((data) => setEvent(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  async function handleDelete() {
    try {
      await deleteEvent(id);
      navigate('/');
    } catch (err) {
      setError(err.message);
    }
  }

  if (loading) return <main className='container'><p>Loading...</p></main>;
  if (error) return <main className='container'><p role='alert' className='error'>{error}</p></main>;

  return (
    <main className='container'>
      <Link to='/'>Back to events</Link>
      <article className='card details'>
        <span className='badge'>{event.category}</span>
        <h1>{event.title}</h1>
        <p className='muted'>Organised by {event.club}</p>
        <p>Date: {event.date}</p>
        <p>Seats: {event.registered} of {event.seats} taken</p>
        {user && user.role === 'admin' && (
          <button onClick={handleDelete}>Delete event</button>
        )}
      </article>
    </main>
  );
}
