import { Link } from 'react-router-dom';

export default function EventCard({ event, isRegistered, onToggle }) {
  const seatsLeft = event.seats - event.registered;

  return (
    <article className='card'>
      <span className='badge'>{event.category}</span>
      <h3><Link to={`/events/${event.id}`}>{event.title}</Link></h3>
      <p className='muted'>{event.club} - {event.date}</p>
      <p>{seatsLeft > 0 ? `${seatsLeft} seats left` : 'Sold out'}</p>
      {onToggle ? (
        <button
          onClick={() => onToggle(event.id)}
          disabled={seatsLeft <= 0 && !isRegistered}
        >
          {isRegistered ? 'Cancel RSVP' : 'RSVP'}
        </button>
      ) : (
        <Link to='/login'>Login to RSVP</Link>
      )}
    </article>
  );
}
