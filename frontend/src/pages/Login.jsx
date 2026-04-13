import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { KeyRound, ScanFace, Check, ArrowLeft } from 'lucide-react';
import CameraView from '../components/CameraView';
import { login } from '../services/api';

export default function Login() {
  const location = useLocation();
  const navigate = useNavigate();
  
  const [username, setUsername] = useState(location.state?.username || '');
  const [flashMessage, setFlashMessage] = useState(location.state?.flash || '');
  const [authMethod, setAuthMethod] = useState(null); 
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!username) {
      navigate('/');
    }
  }, [username, navigate]);

  const handleGestureComplete = async (sequence) => {
    executeLogin({
      username,
      auth_method: 'gesture',
      gesture_sequence: sequence
    });
  };

  const handlePinInput = (val) => {
    if (pin.length < 4) {
      const newPin = pin + val;
      setPin(newPin);
      if (newPin.length === 4) {
        executeLogin({
          username,
          auth_method: 'pin',
          pin: newPin
        });
      }
    }
  };

  const executeLogin = async (payload) => {
    setLoading(true);
    setError('');
    setFlashMessage('');
    try {
      const data = await login(payload);
      if (data.token) {
        localStorage.setItem('vpas_token', data.token);
        navigate('/welcome');
      } else {
        setError('Login failed: ' + (data.message || 'Unknown error'));
        setAuthMethod(null);
        setPin('');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Authentication failed. Please try again.');
      setAuthMethod(null);
      setPin('');
    } finally {
      setLoading(false);
    }
  };

  const renderMethodSelection = () => (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '2rem' }}>
      <button 
        className="btn btn-primary" 
        style={{ padding: '1.25rem', justifyContent: 'flex-start' }}
        onClick={() => setAuthMethod('gesture')}
      >
        <div style={{ background: 'rgba(0,0,0,0.2)', padding: '0.75rem', borderRadius: '10px' }}>
          <ScanFace size={24} />
        </div>
        <div style={{ textAlign: 'left', marginLeft: '0.5rem' }}>
          <strong style={{ display: 'block', fontSize: '1.1rem' }}>Visual Gesture</strong>
          <span style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)', fontWeight: 'normal' }}>Authenticate using hand gestures</span>
        </div>
      </button>

      <button 
        className="btn btn-secondary" 
        style={{ padding: '1.25rem', justifyContent: 'flex-start', background: 'rgba(255,255,255,0.02)' }}
        onClick={() => setAuthMethod('pin')}
      >
        <div style={{ background: 'rgba(0,0,0,0.2)', padding: '0.75rem', borderRadius: '10px' }}>
          <KeyRound size={24} />
        </div>
        <div style={{ textAlign: 'left', marginLeft: '0.5rem' }}>
          <strong style={{ display: 'block', fontSize: '1.1rem' }}>4-Digit PIN</strong>
          <span style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)', fontWeight: 'normal' }}>Fallback numeric pad</span>
        </div>
      </button>
    </div>
  );

  const renderPinPad = () => (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '2rem' }}>
      <p style={{ marginBottom: '1.5rem', color: 'var(--accent-secondary)' }}>Enter 4-Digit PIN</p>
      
      <div className="pin-display">
        {[0, 1, 2, 3].map(i => (
          <div key={i} className={`pin-dot ${i < pin.length ? 'filled' : ''}`} />
        ))}
      </div>

      <div className="pin-grid">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
          <button 
            key={num} 
            className="pin-btn"
            onClick={() => handlePinInput(num.toString())}
            disabled={loading}
          >
            {num}
          </button>
        ))}
        <div /> 
        <button 
          className="pin-btn"
          onClick={() => handlePinInput('0')}
          disabled={loading}
        >
          0
        </button>
        <button 
          className="pin-btn"
          onClick={() => setPin(prev => prev.slice(0, -1))}
          disabled={loading}
          style={{ fontSize: '1rem', background: 'rgba(255, 75, 75, 0.2)', borderColor: 'rgba(255, 75, 75, 0.4)' }}
        >
          DEL
        </button>
      </div>

      <button className="btn btn-secondary" style={{ marginTop: '2rem', width: 'auto' }} onClick={() => setAuthMethod(null)} disabled={loading}>
        <ArrowLeft size={18} /> Back to options
      </button>
    </div>
  );

  return (
    <div className="glass-panel animate-enter" style={{ maxWidth: '600px', width: '100%' }}>
      <div style={{ textAlign: 'center' }}>
        <h2 style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>Log in to <span className="text-gradient">Vault</span></h2>
        <p className="text-muted">Welcome back, <strong>{username}</strong></p>
      </div>

      {flashMessage && (
        <div className="animate-fade-in" style={{ background: 'rgba(0, 250, 154, 0.1)', border: '1px solid var(--text-success)', padding: '1rem', borderRadius: '8px', color: 'var(--text-success)', textAlign: 'center', marginTop: '1.5rem', fontSize: '0.9rem' }}>
          <Check size={16} style={{ display: 'inline', marginRight: '0.5rem', verticalAlign: 'middle' }}/>
          {flashMessage}
        </div>
      )}

      {error && (
        <div className="animate-fade-in" style={{ background: 'rgba(255, 75, 75, 0.1)', border: '1px solid var(--text-error)', padding: '1rem', borderRadius: '8px', color: 'var(--text-error)', textAlign: 'center', marginTop: '1.5rem', fontSize: '0.9rem' }}>
          {error}
        </div>
      )}

      {loading && (
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '2rem' }}>
          <p className="text-muted">Verifying credentials...</p>
        </div>
      )}

      {!loading && !authMethod && renderMethodSelection()}
      
      {!loading && authMethod === 'pin' && renderPinPad()}

      {!loading && authMethod === 'gesture' && (
        <div className="animate-fade-in" style={{ marginTop: '2rem' }}>
          <CameraView onSequenceComplete={handleGestureComplete} targetLength={3} />
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <button className="btn btn-secondary" style={{ marginTop: '1rem', width: 'auto' }} onClick={() => setAuthMethod(null)}>
              <ArrowLeft size={18} /> Back to options
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
