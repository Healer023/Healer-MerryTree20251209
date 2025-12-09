import React from 'react';
import { AppState } from '../types';

interface UIOverlayProps {
  appState: AppState;
}

export const UIOverlay: React.FC<UIOverlayProps> = ({ appState }) => {
  return (
    <div className="absolute top-0 left-0 w-full pointer-events-none p-8 z-10 flex flex-col items-center select-none">
      <h1 className="font-['Cinzel'] text-4xl md:text-6xl text-transparent bg-clip-text bg-gradient-to-b from-[#ffe580] via-[#ffd700] to-[#b38f00] drop-shadow-[0_0_15px_rgba(255,215,0,0.5)] tracking-wider mb-2 text-center">
        MERRY CHRISTMAS
      </h1>
      <h2 className="font-['Cinzel'] text-2xl md:text-3xl text-emerald-100/80 tracking-[0.5em] mb-8 drop-shadow-md">
        2025
      </h2>

      <div className="flex flex-col items-center gap-4 bg-black/30 backdrop-blur-md p-6 rounded-2xl border border-emerald-500/20">
        <div className="flex items-center gap-8">
          <div className={`flex flex-col items-center gap-2 transition-all duration-500 ${appState === AppState.SCATTERED || appState === AppState.TEXT_SHAPE ? 'scale-110 opacity-100' : 'opacity-40 grayscale'}`}>
            <div className={`w-12 h-12 rounded-full border-2 border-emerald-400 flex items-center justify-center bg-emerald-900/40 ${appState === AppState.TEXT_SHAPE ? 'animate-pulse shadow-[0_0_20px_rgba(52,211,153,0.5)]' : ''}`}>
                <span className="text-2xl">✋</span>
            </div>
            <span className="text-xs text-emerald-100 font-semibold tracking-wide">OPEN HAND</span>
            <span className="text-[10px] text-emerald-400/80 uppercase">
              {appState === AppState.TEXT_SHAPE ? "Surprise!" : "Scatter"}
            </span>
          </div>

          <div className="h-12 w-px bg-emerald-500/30"></div>

          <div className={`flex flex-col items-center gap-2 transition-all duration-500 ${appState === AppState.TREE_SHAPE ? 'scale-110 opacity-100' : 'opacity-40 grayscale'}`}>
            <div className="w-12 h-12 rounded-full border-2 border-yellow-400 flex items-center justify-center bg-yellow-900/40">
                <span className="text-2xl">✊</span>
            </div>
            <span className="text-xs text-yellow-100 font-semibold tracking-wide">CLOSED FIST</span>
            <span className="text-[10px] text-yellow-400/80 uppercase">Assemble</span>
          </div>
        </div>
      </div>
      
      <div className="mt-8 px-4 py-2 rounded-full bg-emerald-900/30 border border-emerald-500/30 text-emerald-200/80 text-xs backdrop-blur-sm transition-all duration-1000">
        {appState === AppState.SCATTERED && "Keep holding..."}
        {appState === AppState.TEXT_SHAPE && "Special Surprise Unlocked!"}
        {appState === AppState.TREE_SHAPE && "The Star shines bright for you."}
      </div>
    </div>
  );
};