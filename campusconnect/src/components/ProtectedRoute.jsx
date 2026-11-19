import { Navigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';

export default function ProtectedRoute({ children, role }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <main className='container'><p>Loading...</p></main>;
  }
  if (!user) {
    return <Navigate to='/login' replace />;
  }
  if (role && user.role !== role) {
    return (
      <main className='container'>
        <p role='alert' className='error'>You do not have permission to view this page.</p>
      </main>
    );
  }
  return children;
}