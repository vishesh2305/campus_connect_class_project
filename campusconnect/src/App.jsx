import { Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home';
import EventDetails from './pages/EventDetails';
import CreateEvent from './pages/CreateEvent';
import Login from './pages/Login';
import Register from './pages/Register';
import ProtectedRoute from './components/ProtectedRoute';
import { useAuth } from './AuthContext';

export default function App() {
  const { user, logout } = useAuth();

  return (
    <>
      <nav className='nav'>
        <Link to='/'>Home</Link>
        {user && user.role === 'admin' && <Link to='/create'>Create Event</Link>}
        <span className='spacer' />
        {user ? (
          <>
            <span>Hi, {user.name} ({user.role})</span>
            <button className='link-button' onClick={logout}>Logout</button>
          </>
        ) : (
          <>
            <Link to='/login'>Login</Link>
            <Link to='/register'>Register</Link>
          </>
        )}
      </nav>
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/events/:id' element={<EventDetails />} />
        <Route
          path='/create'
          element={
            <ProtectedRoute role='admin'>
              <CreateEvent />
            </ProtectedRoute>
          }
        />
        <Route path='/login' element={<Login />} />
        <Route path='/register' element={<Register />} />
        <Route path='*' element={<main className='container'><p>Page not found</p></main>} />
      </Routes>
    </>
  );
}
