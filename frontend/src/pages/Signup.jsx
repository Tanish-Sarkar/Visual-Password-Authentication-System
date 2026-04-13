import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import CameraView from '../components/CameraView';
import { Check, ChevronRight } from 'lucide-react';
import { signup } from '../services/api';

export default function Signup() {
  const location = useLocation();
  const navigate = useNavigate();
  
  const initialUsername = location.state?.username || '';
  
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    username: initialUsername,
    display_name: initialUsername,
    gesture_sequence: '',
    pin: ''
  });

  const [pinConfirm, setPinConfirm] = useState('');

  useEffect(() => {
    if (!initialUsername) {
      navigate('/');
    }
  }, [initialUsername, navigate]);

  const handleGestureComplete = (sequence) => {
    setFormData(prev => ({ ...prev, gesture_sequence: sequence }));
    setTimeout(() => setStep(3), 1500); // 1.5s delay to show success
  };

  const handlePinInput = (val) => {
    if (formData.pin.length < 4) {
      setFormData(prev => ({ ...prev, pin: prev.pin + val }));
    }
  };

  const handlePinConfirmInput = (val) => {
    if (pinConfirm.length < 4) {
      setPinConfirm(prev => prev + val);
    }
  };

  const BackspaceBtn = ({ isConfirm }) => (
    <button 
      type="button"
      className="pin-btn" 
      onClick={() => isConfirm ? setPinConfirm(prev => prev.slice(0, -1)) : setFormData(prev => ({ ...prev, pin: prev.pin.slice(0, -1)}))}
    >
      DEL
    </button>
  );

  const submitSignup = async () => {
    if (formData.pin !== pinConfirm) {
      setError("PINs do not match!");
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      await signup({
        username: formData.username,
        display_name: formData.display_name,
        gesture_sequence: formData.gesture_sequence,
        pin: formData.pin
      });
      // Signup success
      navigate('/login', { state: { username: formData.username, flash: "Registration successful. Please log in." } });
    } catch (err) {
      setError(err.response?.data?.message || 'Error occurred during registration');
      setLoading(false);
    }
  };

  return (
    <div className="glass-panel animate-enter" style={{ maxWidth: '700px', width: '100%' }}>
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.75rem' }}>Create Your <span className="text-gradient">Vault</span></h2>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '1rem' }}>
          {[1, 2, 3].map(i => (
             <div key={i} style={{
               width: '30px', height: '4px', borderRadius: '4px',
               background: step >= i ? 'var(--accent-primary)' : 'rgba(255,255,255,0.1)',
               transition: 'all 0.3s'
             }} />
          ))}
        </div>
      </div>

      {step === 1 && (
        <div className="animate-fade-in">
          <div className="input-group">
            <label className="input-label">Username</label>
            <input
              type="text"
              className="input-field"
              value={formData.username}
              disabled
              style={{ opacity: 0.7 }}
            />
          </div>
          <div className="input-group">
            <label className="input-label">Display Name</label>
            <input
              type="text"
              className="input-field"
              value={formData.display_name}
              onChange={e => setFormData(p => ({...p, display_name: e.target.value}))}
              placeholder="e.g. John Doe"
            />
          </div>
          <button 
            className="btn btn-primary" 
            onClick={() => setStep(2)}
            disabled={!formData.display_name.trim()}
          >
            Next Setup Step <ChevronRight size={18} />
          </button>
        </div>
      )}

      {step === 2 && (
        <div className="animate-fade-in">
          <p className="text-center text-muted" style={{ marginBottom: '1.5rem' }}>
            Record a sequence of 3 hand gestures.<br/>
            (Allowed: fist, palm, victory, thumb_up)
          </p>
          <CameraView onSequenceComplete={handleGestureComplete} targetLength={3} />
        </div>
      )}

      {step === 3 && (
        <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <p className="text-center text-muted" style={{ marginBottom: '1.5rem' }}>
            Set a 4-digit PIN as a fallback option.
          </p>
          
          <div className="pin-display">
            {[0, 1, 2, 3].map(i => {
              const valString = formData.pin.length === 4 ? pinConfirm : formData.pin;
              const isFilled = i < valString.length;
              return <div key={i} className={`pin-dot ${isFilled ? 'filled' : ''}`} />;
            })}
          </div>

          <p style={{ marginBottom: '1.5rem', color: 'var(--accent-secondary)' }}>
            {formData.pin.length < 4 ? 'Enter PIN' : 'Confirm PIN'}
          </p>

          <div className="pin-grid">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
              <button 
                key={num} 
                className="pin-btn"
                onClick={() => formData.pin.length < 4 ? handlePinInput(num.toString()) : handlePinConfirmInput(num.toString())}
              >
                {num}
              </button>
            ))}
            <BackspaceBtn isConfirm={formData.pin.length === 4} />
            <button 
              className="pin-btn"
              onClick={() => formData.pin.length < 4 ? handlePinInput('0') : handlePinConfirmInput('0')}
            >
              0
            </button>
            <div /> {/* Empty space for grid alignment */}
          </div>

          {error && <p className="text-error" style={{ marginBottom: '1rem' }}>{error}</p>}

          {pinConfirm.length === 4 && (
            <button 
              className="btn btn-primary animate-fade-in" 
              onClick={submitSignup}
              disabled={loading}
              style={{ maxWidth: '300px' }}
            >
              {loading ? 'Finalizing...' : 'Complete Setup'} <Check size={18} />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
