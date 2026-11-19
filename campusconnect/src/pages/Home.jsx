import { useState, useEffect } from 'react';
import { getEvents, getMyRsvps, rsvpEvent, cancelRsvp } from '../api';
import { useAuth } from '../AuthContext';
import EventCard from '../components/EventCard';
import StatCard from '../components/StatCard';

const categories = ['All', 'Tech', 'Cultural', 'Sports'];

export default function Home() {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [myIds, setMyIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');

  async function loadData() {
    try {
      const eventList = await getEvents();
      setEvents(eventList);
      if (user) {
        const mine = await getMyRsvps();
        setMyIds(mine.map((e) => e.id));
      } else {
        setMyIds([]);
      }
      setError('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  async function toggleRegister(id) {
    try {
      if (myIds.includes(id)) {
        await cancelRsvp(id);
      } else {
        await rsvpEvent(id);
      }
      await loadData();
    } catch (err) {
      alert(err.message);
    }
  }

  const filtered = events.filter(
    (e) =>
      e.title.toLowerCase().includes(search.toLowerCase()) &&
      (category === 'All' || e.category === category)
  );

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
        <StatCard label='My RSVPs' value={myIds.length} />
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
              isRegistered={myIds.includes(e.id)}
              onToggle={user ? toggleRegister : null}
            />
          ))}
        </section>
      )}
    </main>
  );
}
