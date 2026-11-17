import { useState, useEffect } from 'react';
import { getEvents } from '../api';
import EventCard from '../components/EventCard';
import StatCard from '../components/StatCard';

const categories = ['All', 'Tech', 'Cultural', 'Sports'];

export default function Home() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [registeredIds, setRegisteredIds] = useState([]);

  useEffect(() => {
    getEvents()
      .then((data) => setEvents(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const filtered = events.filter(
    (e) =>
      e.title.toLowerCase().includes(search.toLowerCase()) &&
      (category === 'All' || e.category === category)
  );

  function toggleRegister(id) {
    setRegisteredIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  if (loading) {
    return <main className='container'><p>Loading events...</p></main>;
  }
  if (error) {
    return (
      <main className='container'>
        <p role='alert' className='error'>Could not load events: {error}</p>
      </main>
    );
  }

  return (
    <main className='container'>
      <h1>CampusConnect</h1>
      <p className='muted'>Discover and RSVP to campus events</p>

      <section className='stats'>
        <StatCard label='Total events' value={events.length} />
        <StatCard label='Showing' value={filtered.length} />
        <StatCard label='My RSVPs' value={registeredIds.length} />
      </section>

      <section className='controls'>
        <input
          type='text'
          placeholder='Search events...'
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          aria-label='Search events'
        />
        <div>
          {categories.map((c) => (
            <button
              key={c}
              className={c === category ? 'chip active' : 'chip'}
              onClick={() => setCategory(c)}
            >
              {c}
            </button>
          ))}
        </div>
      </section>

      {filtered.length === 0 ? (
        <p>No events found.</p>
      ) : (
        <section className='grid'>
          {filtered.map((e) => (
            <EventCard
              key={e.id}
              event={e}
              isRegistered={registeredIds.includes(e.id)}
              onToggle={toggleRegister}
            />
          ))}
        </section>
      )}
    </main>
  );
}

