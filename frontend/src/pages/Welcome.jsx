import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, ShieldCheck, User } from 'lucide-react';
import { fetchProtectedData } from '../services/api';

export default function Welcome() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const loadDashboard = async () => {
      const token = localStorage.getItem('vpas_token');
      try {
        const response = await fetchProtectedData(token);
        setData(response);
      } catch (err) {
        console.error(err);
        setError('Failed to load secure data. Your session may have expired.');
      } finally {
        setLoading(false);
      }
    };
    
    loadDashboard();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('vpas_token');
    navigate('/');
  };

  if (loading) {
    return (
      <div className="glass-panel animate-enter" style={{ minWidth: '300px', textAlign: 'center' }}>
        <p className="text-muted">Decrypting secure channel...</p>
      </div>
    );
  }

  return (
    <div className="glass-panel animate-enter" style={{ maxWidth: '600px', width: '100%', textAlign: 'center' }}>
      <div style={{ display: 'inline-flex', padding: '1rem', background: 'rgba(0,250,154,0.1)', borderRadius: '50%', marginBottom: '1.5rem' }}>
        <ShieldCheck size={48} color="var(--text-success)" />
      </div>

      <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>
        <span className="text-gradient">{data?.message || 'Welcome!'}</span>
      </h2>
      
      <p className="text-muted" style={{ lineHeight: '1.6', marginBottom: '2rem' }}>
        You have successfully logged in using your secure credentials.
      </p>

      <button onClick={handleLogout} className="btn btn-secondary" style={{ maxWidth: '200px', margin: '0 auto' }}>
        <LogOut size={18} /> Secure Logout
      </button>
    </div>
  );
}
