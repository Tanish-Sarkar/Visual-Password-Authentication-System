import { useEffect, useState } from 'react';
import { Camera, CheckCircle2, Play, CircleDot } from 'lucide-react';
import { useGestureRecognition } from '../hooks/useGestureRecognition';

export default function CameraView({ onSequenceComplete, targetLength = 3, autoRecordDelay = 2000 }) {
  const {
    videoRef,
    currentGesture,
    cameraAccess,
    enableCamera,
    stopCamera,
    isModelLoaded
  } = useGestureRecognition();

  const [sequence, setSequence] = useState([]);
  const [isRecording, setIsRecording] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    // Start camera immediately when model is loaded
    if (isModelLoaded && cameraAccess === null) {
      enableCamera();
    }
  }, [isModelLoaded, cameraAccess, enableCamera]);

  useEffect(() => {
    let timer;
    if (isRecording) {
      if (sequence.length >= targetLength) {
        setIsRecording(false);
        stopCamera();
        // Emit result string e.g. "palm_victory_fist"
        onSequenceComplete(sequence.join('_'));
        return;
      }

      setTimeLeft(autoRecordDelay / 1000);
      timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            // Record current gesture (if valid)
            setSequence(prevSeq => {
              // only save acceptable gestures
              const validGestures = ['fist', 'palm', 'victory', 'thumb_up'];
              if (validGestures.includes(currentGesture)) {
                // Prevent duplicate consecutive gestures from recording
                if (prevSeq.length > 0 && prevSeq[prevSeq.length - 1] === currentGesture) {
                  return prevSeq;
                }
                return [...prevSeq, currentGesture];
              }
              // If none/invalid, don't record and reset timer
              return prevSeq;
            });
            return autoRecordDelay / 1000;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isRecording, sequence, currentGesture, targetLength, autoRecordDelay, onSequenceComplete, stopCamera]);

  const startRecording = () => {
    setSequence([]);
    setIsRecording(true);
  };

  const retry = () => {
    setSequence([]);
    setIsRecording(false);
  };

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      
      {!isModelLoaded ? (
        <div className="camera-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <p className="text-muted">Loading Engine...</p>
        </div>
      ) : cameraAccess === false ? (
        <div className="camera-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', background: 'rgba(255,0,0,0.1)' }}>
          <p className="text-error">Camera permissions denied.</p>
        </div>
      ) : (
        <div className="camera-container">
          <video 
            ref={videoRef} 
            autoPlay 
            playsInline 
            muted
          />
          <div className="gesture-overlay">
            <div>
              <span className="text-muted" style={{ fontSize: '0.85rem' }}>CURRENT</span>
              <h3 style={{ margin: 0, color: 'var(--accent-secondary)' }}>
                {currentGesture === 'none' ? 'Waiting...' : currentGesture.toUpperCase()}
              </h3>
            </div>
            
            {isRecording && (
              <div style={{ textAlign: 'right' }}>
                <span className="text-muted" style={{ fontSize: '0.85rem' }}>NEXT IN</span>
                <h3 style={{ margin: 0, color: 'var(--text-error)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <CircleDot size={18} className="animate-fade-in" />
                  {timeLeft}s
                </h3>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Sequence Chips UI */}
      {sequence.length > 0 && (
         <div className="sequence-container" style={{ width: '100%', maxWidth: '600px' }}>
         {sequence.map((g, i) => (
           <div key={i} className="sequence-chip">
             {g} <CheckCircle2 size={14} />
           </div>
         ))}
         {/* Placeholders */}
         {Array.from({ length: targetLength - sequence.length }).map((_, i) => (
           <div key={`p-${i}`} className="sequence-chip" style={{ opacity: 0.3 }}>
             ...
           </div>
         ))}
       </div>
      )}

      {cameraAccess && !isRecording && sequence.length < targetLength && (
        <button onClick={startRecording} className="btn btn-primary" style={{ maxWidth: '300px' }}>
          <Play size={20} />
          {sequence.length > 0 ? 'Resume Recording' : 'Start Recording'}
        </button>
      )}

      {sequence.length === targetLength && (
        <p className="text-success" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '1rem' }}>
          <CheckCircle2 color="var(--text-success)" />
          Sequence Captured Successfully
        </p>
      )}

      {sequence.length > 0 && !isRecording && sequence.length < targetLength && (
        <button onClick={retry} className="btn btn-secondary" style={{ maxWidth: '300px', marginTop: '1rem' }}>
          Retry
        </button>
      )}
    </div>
  );
}
