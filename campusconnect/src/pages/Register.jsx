import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../AuthContext';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      await register(name, email, password);
      navigate('/');
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  }

  return (
    <main className='container'>
      <h1>Create account</h1>
      <form className='form' onSubmit={handleSubmit}>
        <label>Name
          <input value={name} onChange={(e) => setName(e.target.value)} />
        </label>
        <label>Email
          <input type='email' value={email} onChange={(e) => setEmail(e.target.value)} />
        </label>
        <label>Password (at least 8 characters)
          <input type='password' value={password} onChange={(e) => setPassword(e.target.value)} />
        </label>
        {error && <p role='alert' className='error'>{error}</p>}
        <button type='submit' disabled={saving}>{saving ? 'Creating...' : 'Register'}</button>
        <p>Already have an account? <Link to='/login'>Login</Link></p>
      </form>
    </main>
  );
}

