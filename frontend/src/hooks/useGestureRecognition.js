import { useState, useRef, useEffect, useCallback } from 'react';
import { GestureRecognizer, FilesetResolver } from '@mediapipe/tasks-vision';

export function useGestureRecognition() {
  const [recognizer, setRecognizer] = useState(null);
  const [currentGesture, setCurrentGesture] = useState('None');
  const [cameraAccess, setCameraAccess] = useState(null);
  
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const lastVideoTime = useRef(-1);
  const requestAnimationFrameId = useRef(null);

  useEffect(() => {
    async function loadModel() {
      try {
        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm"
        );
        const gestureRecognizer = await GestureRecognizer.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: "https://storage.googleapis.com/mediapipe-models/gesture_recognizer/gesture_recognizer/float16/1/gesture_recognizer.task",
            delegate: "GPU"
          },
          runningMode: "VIDEO",
          numHands: 1
        });
        setRecognizer(gestureRecognizer);
      } catch (err) {
        console.error("Failed to load gesture recognizer model", err);
      }
    }
    loadModel();
  }, []);

  const predictWebcam = useCallback(() => {
    if (!videoRef.current || !recognizer) return;
    
    let startTimeMs = performance.now();
    if (videoRef.current.currentTime !== lastVideoTime.current) {
      lastVideoTime.current = videoRef.current.currentTime;
      try {
        const results = recognizer.recognizeForVideo(videoRef.current, startTimeMs);
        
        if (results.gestures.length > 0) {
          const rawGesture = results.gestures[0][0].categoryName;
          setCurrentGesture(mapGestureName(rawGesture));
        } else {
          setCurrentGesture('none');
        }
      } catch (err) {
        console.error("Error recognizing frame", err);
      }
    }
    
    // Call this function again to keep predicting when the browser is ready
    requestAnimationFrameId.current = window.requestAnimationFrame(predictWebcam);
  }, [recognizer]);

  const enableCamera = useCallback(async () => {
    if (!recognizer) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.addEventListener('loadeddata', predictWebcam);
      }
      setCameraAccess(true);
    } catch (err) {
      console.error("Camera access denied or failed", err);
      setCameraAccess(false);
    }
  }, [recognizer, predictWebcam]);

  const stopCamera = useCallback(() => {
    if (videoRef.current && videoRef.current.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(track => track.stop());
    }
    if (requestAnimationFrameId.current) {
      window.cancelAnimationFrame(requestAnimationFrameId.current);
    }
  }, []);

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  return {
    videoRef,
    canvasRef,
    currentGesture,
    cameraAccess,
    enableCamera,
    stopCamera,
    isModelLoaded: !!recognizer
  };
}

function mapGestureName(raw) {
  // Normalize mediapipe gestures to simple strings
  switch(raw) {
    case 'Closed_Fist': return 'fist';
    case 'Open_Palm': return 'palm';
    case 'Victory': return 'victory';
    case 'Thumb_Up': return 'thumb_up';
    case 'Pointing_Up': return 'pointing_up';
    case 'None': return 'none';
    default: return raw.toLowerCase();
  }
}
