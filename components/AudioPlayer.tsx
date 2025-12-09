import React, { useEffect, useRef, useState } from 'react';

// Using a calm, magical Christmas background track from Mixkit (free license)
const MUSIC_URL = "https://assets.mixkit.co/music/preview/mixkit-waiting-for-christmas-3008.mp3";

export const AudioPlayer: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const togglePlay = () => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(e => console.log("Audio play failed (user interaction needed)", e));
    }
    setIsPlaying(!isPlaying);
  };

  // Try to auto-play on mount (often blocked by browser, but we try)
  useEffect(() => {
    const attemptPlay = async () => {
        if(audioRef.current) {
            try {
                audioRef.current.volume = 0.5;
                await audioRef.current.play();
                setIsPlaying(true);
            } catch (err) {
                // Autoplay blocked, wait for user click
                console.log("Autoplay blocked");
            }
        }
    };
    attemptPlay();
  }, []);

  return (
    <div className="fixed top-6 right-6 z-50">
      <audio ref={audioRef} src={MUSIC_URL} loop />
      <button 
        onClick={togglePlay}
        className={`w-12 h-12 rounded-full border border-emerald-500/30 flex items-center justify-center backdrop-blur-md transition-all duration-300 ${isPlaying ? 'bg-emerald-900/40 text-emerald-200' : 'bg-black/40 text-emerald-500/50 hover:bg-emerald-900/60 hover:text-emerald-200'}`}
        title={isPlaying ? "Mute Music" : "Play Music"}
      >
        {isPlaying ? (
           <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
             <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
           </svg>
        ) : (
           <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
             <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 9.75 19.5 12m0 0 2.25 2.25M19.5 12l2.25-2.25M19.5 12l-2.25 2.25m-10.5-6 4.72-4.72a.75.75 0 0 1 1.28.53v15.88a.75.75 0 0 1-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 0 1 2.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75Z" />
           </svg>
        )}
      </button>
    </div>
  );
};