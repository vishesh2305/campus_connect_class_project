import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  }

  return (
    <main className='container'>
      <h1>Login</h1>
      <form className='form' onSubmit={handleSubmit}>
        <label>Email
          <input type='email' value={email} onChange={(e) => setEmail(e.target.value)} />
        </label>
        <label>Password
          <input type='password' value={password} onChange={(e) => setPassword(e.target.value)} />
        </label>
        {error && <p role='alert' className='error'>{error}</p>}
        <button type='submit' disabled={saving}>{saving ? 'Logging in...' : 'Login'}</button>
        <p>New here? <Link to='/register'>Create an account</Link></p>
      </form>
    </main>
  );
}
