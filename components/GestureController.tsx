import React, { useEffect, useRef, useState } from 'react';
import { FilesetResolver, HandLandmarker } from '@mediapipe/tasks-vision';
import { AppState } from '../types';

interface GestureControllerProps {
  setAppState: (state: AppState) => void;
  appState: AppState;
}

export const GestureController: React.FC<GestureControllerProps> = ({ setAppState, appState }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasPermission, setHasPermission] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const landmarkerRef = useRef<HandLandmarker | null>(null);
  const requestRef = useRef<number>();
  const lastVideoTime = useRef<number>(-1);
  
  // Timer for "WYX" reveal
  const openHandStartTime = useRef<number>(0);

  // Initialize MediaPipe and Camera in parallel
  useEffect(() => {
    let active = true;

    const initAll = async () => {
      try {
        // Start Camera Request immediately (it takes time to get permission)
        const cameraPromise = navigator.mediaDevices.getUserMedia({ 
            video: { 
                width: { ideal: 320 }, 
                height: { ideal: 240 }, 
                facingMode: "user",
                frameRate: { ideal: 30 }
            } 
        });

        // Start AI Model Load
        const visionPromise = FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm"
        );

        // Wait for both
        const [stream, vision] = await Promise.all([cameraPromise, visionPromise]);
        
        if (!active) return;

        // Setup Video
        if (videoRef.current) {
            videoRef.current.srcObject = stream;
            // Ensure muted/playsInline for mobile autoplay policies
            videoRef.current.muted = true;
            videoRef.current.playsInline = true; 
            await videoRef.current.play();
            setHasPermission(true);
        }

        // Setup Landmarker
        const landmarker = await HandLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: `https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task`,
            delegate: "GPU"
          },
          runningMode: "VIDEO",
          numHands: 1,
          minHandDetectionConfidence: 0.5,
          minHandPresenceConfidence: 0.5,
          minTrackingConfidence: 0.5
        });

        if (!active) return;
        landmarkerRef.current = landmarker;
        setIsLoading(false);
        
        // Start Loop
        predictWebcam();

      } catch (error) {
        console.error("Initialization error:", error);
        setIsLoading(false);
        setHasPermission(false);
      }
    };

    initAll();

    return () => {
      active = false;
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      if (videoRef.current && videoRef.current.srcObject) {
         const stream = videoRef.current.srcObject as MediaStream;
         stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const predictWebcam = () => {
    const video = videoRef.current;
    const landmarker = landmarkerRef.current;

    if (video && landmarker && video.readyState >= 2) { // 2 = HAVE_CURRENT_DATA
      let startTimeMs = performance.now();
      
      // Only detect if video has advanced
      if (video.currentTime !== lastVideoTime.current) {
        lastVideoTime.current = video.currentTime;
        const result = landmarker.detectForVideo(video, startTimeMs);
        
        if (result.landmarks && result.landmarks.length > 0) {
          const landmarks = result.landmarks[0];
          
          const wrist = landmarks[0];
          const tips = [8, 12, 16, 20].map(i => landmarks[i]);
          
          let avgDist = 0;
          tips.forEach(tip => {
             const dist = Math.sqrt(
               Math.pow(tip.x - wrist.x, 2) + 
               Math.pow(tip.y - wrist.y, 2) + 
               Math.pow(tip.z - wrist.z, 2)
             );
             avgDist += dist;
          });
          avgDist /= tips.length;

          // Hysteresis to prevent flickering
          const OPEN_THRESHOLD = 0.35;
          const CLOSE_THRESHOLD = 0.25;

          if (avgDist > OPEN_THRESHOLD) {
             // OPEN HAND DETECTED
             const now = Date.now();
             
             if (openHandStartTime.current === 0) {
                openHandStartTime.current = now;
                setAppState(AppState.SCATTERED);
             } else {
                 // Check duration
                 if (now - openHandStartTime.current > 5000) {
                     setAppState(AppState.TEXT_SHAPE);
                 } else {
                     // Ensure we are in scattered mode if we haven't reached text mode yet
                     // This prevents jitter if the state was somehow reset externally
                     // But we don't want to spam setAppState if already TEXT
                     setAppState(prev => prev === AppState.TEXT_SHAPE ? AppState.TEXT_SHAPE : AppState.SCATTERED);
                 }
             }
          } else if (avgDist < CLOSE_THRESHOLD) {
             // CLOSED FIST DETECTED
             openHandStartTime.current = 0; // Reset timer
             setAppState(AppState.TREE_SHAPE);
          }
        } else {
            // No hand detected
            openHandStartTime.current = 0;
        }
      }
    }
    
    requestRef.current = requestAnimationFrame(predictWebcam);
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 opacity-80 hover:opacity-100 transition-opacity">
      <div className="relative rounded-lg overflow-hidden border-2 border-emerald-500/50 shadow-lg shadow-emerald-900/50 w-32 h-24 bg-black">
        <video 
          ref={videoRef}
          autoPlay 
          playsInline
          muted
          className="w-full h-full object-cover transform -scale-x-100" 
        />
        {!hasPermission && !isLoading && (
          <div className="absolute inset-0 flex items-center justify-center text-xs text-center text-red-400 p-2 bg-black/80">
            Camera Blocked
          </div>
        )}
        {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/80 flex-col gap-2">
                <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-[10px] text-emerald-400 uppercase tracking-widest">Initializing</span>
            </div>
        )}
      </div>
    </div>
  );
};