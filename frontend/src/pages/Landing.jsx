import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ScanFace, ArrowRight } from 'lucide-react';
import { checkRegistration } from '../services/api';

export default function Landing() {
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();


  useEffect(() => {
    // If user is already logged in, skip the landing page
    if (localStorage.getItem('vpas_token')) {
      navigate('/welcome');
    }
  }, [navigate]);

  const handleNext = async (e) => {
    e.preventDefault();
    if (!username.trim()) {
      setError('Username is required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const data = await checkRegistration(username);
      
      if (data.isRegistered) {
        navigate('/login', { state: { username } });
      } else {
        navigate('/signup', { state: { username } });
      }
    } catch (err) {
      console.error(err);
      // The API might return a 404 naturally in some designs, or proper { isRegistered: false }.
      // Assuming backward compatibility or network error handling:
      if (err.response?.status === 404 || err.response?.data?.isRegistered === false) {
        navigate('/signup', { state: { username } });
      } else {
        setError(err.response?.data?.message || 'Failed to connect to the server.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-panel animate-enter" style={{ maxWidth: '400px', width: '100%' }}>
      <div className="text-center" style={{ marginBottom: '2.5rem' }}>
        <div style={{ display: 'inline-flex', padding: '1.25rem', background: 'rgba(138,43,226,0.15)', borderRadius: '50%', marginBottom: '1.5rem', boxShadow: '0 0 20px rgba(138,43,226,0.2)' }}>
          <ScanFace size={56} color="var(--accent-secondary)" />
        </div>
        <h1 style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>
          <span className="text-gradient">Visual Password</span>
        </h1>
        <p className="text-muted" style={{ lineHeight: '1.6' }}>
          Experience next-generation secure gesture authentication. Enter your unique handle to begin.
        </p>
      </div>

      <form onSubmit={handleNext}>
        <div className="input-group">
          <label className="input-label">Enter Username</label>
          <input
            type="text"
            className="input-field"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="e.g., john_doe"
            autoFocus
          />
          {error && <p className="text-error">{error}</p>}
        </div>

        <button type="submit" className="btn btn-primary" disabled={loading} style={{ marginTop: '1rem' }}>
          {loading ? 'Checking Engine...' : 'Continue'}
          <ArrowRight size={20} />
        </button>
      </form>
    </div>
  );
}
