import React, { useState, useEffect, useCallback, useRef } from 'react';
import { UserStats } from '../types';

interface FocusTimerProps {
  updateStats: (minutes: number) => void;
  initialStats: UserStats;
}

const WORK_TIME = 25 * 60;
const BREAK_TIME = 5 * 60;

const FocusTimer: React.FC<FocusTimerProps> = ({ updateStats, initialStats }) => {
  const [timeLeft, setTimeLeft] = useState(WORK_TIME);
  const [isActive, setIsActive] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [sessionCount, setSessionCount] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);

  const toggleTimer = () => setIsActive(!isActive);

  const resetTimer = useCallback(() => {
    setIsActive(false);
    setTimeLeft(isBreak ? BREAK_TIME : WORK_TIME);
  }, [isBreak]);

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen().catch(err => {
        console.error(err);
      });
    } else {
      document.exitFullscreen();
    }
  };

  useEffect(() => {
    const handleFullScreenChange = () => {
      setIsFullScreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullScreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullScreenChange);
  }, []);

  const switchMode = () => {
    const nextIsBreak = !isBreak;
    if (nextIsBreak) {
       setSessionCount(prev => prev + 1);
       updateStats(WORK_TIME / 60);
    }
    setIsBreak(nextIsBreak);
    setTimeLeft(nextIsBreak ? BREAK_TIME : WORK_TIME);
    setIsActive(false);
  };

  useEffect(() => {
    let interval: number | null = null;
    if (isActive && timeLeft > 0) {
      interval = window.setInterval(() => {
        setTimeLeft(time => time - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      if (interval) clearInterval(interval);
      switchMode();
    }
    return () => { if (interval) clearInterval(interval); };
  }, [isActive, timeLeft]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const fmt = (n: number) => n.toString().padStart(2, '0');

  return (
    <div 
      ref={containerRef}
      className={`font-mono flex flex-col items-center justify-center border border-zinc-800 bg-black relative overflow-hidden ${
        isFullScreen ? 'fixed inset-0 z-[100] p-8' : 'h-[500px]'
      }`}
    >
      {/* Matrix background effect */}
      <div className="absolute inset-0 opacity-10 pointer-events-none text-green-500 text-xs overflow-hidden select-none whitespace-pre-wrap">
        {Array(100).fill(0).map((_, i) => (
           <span key={i} style={{ left: `${Math.random()*100}%`, animationDuration: `${Math.random()*5+2}s` }} className="absolute top-0 animate-pulse block">
             0 1 1 0 1 0
           </span>
        ))}
      </div>

      <div className="absolute top-4 left-4 text-xs text-zinc-500">
        STATUS: {isActive ? 'RUNNING' : 'PAUSED'}
      </div>
      
      <div className="absolute top-4 right-4">
        <button onClick={toggleFullScreen} className="text-zinc-500 hover:text-green-500 text-xs">
          [ {isFullScreen ? 'MINIMIZE' : 'FULLSCREEN'} ]
        </button>
      </div>

      {/* Main Display */}
      <div className="z-10 text-center">
        <div className={`text-xs font-bold mb-4 tracking-[0.3em] uppercase ${isBreak ? 'text-blue-500' : 'text-green-500'}`}>
           *** {isBreak ? 'TAKE A BREAK' : 'FOCUS MODE ACTIVE'} ***
        </div>

        <div className={`text-8xl md:text-9xl font-bold tracking-tighter tabular-nums mb-8 ${isBreak ? 'text-blue-500' : 'text-zinc-100'}`}>
          {fmt(minutes)}:{fmt(seconds)}
        </div>

        <div className="flex gap-4 justify-center">
          <button
            onClick={toggleTimer}
            className={`border px-6 py-2 text-sm font-bold transition-all ${
               isActive 
               ? 'border-yellow-500 text-yellow-500 hover:bg-yellow-500 hover:text-black' 
               : 'border-green-500 text-green-500 hover:bg-green-500 hover:text-black'
            }`}
          >
            {isActive ? 'PAUSE' : 'START'}
          </button>
          
          <button
            onClick={resetTimer}
            className="border border-zinc-700 text-zinc-500 px-6 py-2 text-sm font-bold hover:border-zinc-500 hover:text-zinc-300"
          >
            RESET
          </button>
        </div>
      </div>

      {/* Footer Log */}
      <div className="absolute bottom-0 left-0 right-0 border-t border-zinc-800 p-2 bg-zinc-950 text-[10px] font-mono text-zinc-500 h-24 overflow-hidden">
        <div>[LOG] Mode: {isBreak ? 'Break' : 'Focus'}</div>
        <div>[LOG] Sessions completed: {sessionCount}</div>
        <div>[LOG] Total focus time today: {initialStats.studyMinutesToday} minutes</div>
        {isActive && <div className="text-green-500 animate-pulse">[LOG] Timer is running...</div>}
      </div>

    </div>
  );
};

export default FocusTimer;