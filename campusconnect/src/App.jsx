import { Routes, Route, Link } from 'react-router-dom';
 import Home from './pages/Home';
 import EventDetails from './pages/EventDetails';
 import CreateEvent from './pages/CreateEvent';

 export default function App() {
   return (
 	<>
   	<nav className='nav'>
   	  <Link to='/'>Home</Link>
     	<Link to='/create'>Create Event</Link>
   	</nav>
   	<Routes>
     	<Route path='/' element={<Home />} />
     	<Route path='/events/:id' element={<EventDetails />} />
     	<Route path='/create' element={<CreateEvent />} />
     	<Route path='*' element={<main className='container'><p>Page not found</p></main>} />
   	</Routes>
 	</>
   );
 }
