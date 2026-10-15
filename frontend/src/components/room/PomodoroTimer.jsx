import React from 'react';
import { Play, Pause, RotateCcw, SkipForward, Flame, Coffee, Sparkles } from 'lucide-react';

export const PomodoroTimer = ({
  mode,
  isRunning,
  durationSeconds,
  secondsRemaining,
  startTimer,
  pauseTimer,
  resetTimer,
  skipSession
}) => {
  const isFocus = mode === 'focus';
  const minutes = Math.floor(secondsRemaining / 60);
  const seconds = secondsRemaining % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  // Calculate SVG circular progress percentage
  const total = durationSeconds || (isFocus ? 1500 : 300);
  const progressPercent = Math.min(100, Math.max(0, ((total - secondsRemaining) / total) * 100));

  const strokeDasharray = 2 * Math.PI * 90; // radius = 90
  const strokeDashoffset = strokeDasharray - (strokeDasharray * progressPercent) / 100;

  return (
    <div className={`glass-panel p-6 sm:p-8 rounded-3xl border transition-all ${
      isRunning ? 'timer-glow border-indigo-500/40' : 'border-slate-800'
    }`}>
      <div className="flex flex-col items-center">
        
        {/* Mode Selector / Indicator Badge */}
        <div className="flex items-center space-x-2 px-4 py-1.5 rounded-full glass-card border border-slate-700/60 mb-6">
          {isFocus ? (
            <>
              <Flame className="w-4 h-4 text-indigo-400 animate-pulse" />
              <span className="text-xs font-bold text-indigo-200 uppercase tracking-widest">
                Focus Session 🎯
              </span>
            </>
          ) : (
            <>
              <Coffee className="w-4 h-4 text-emerald-400 animate-bounce" />
              <span className="text-xs font-bold text-emerald-200 uppercase tracking-widest">
                Break Session ☕
              </span>
            </>
          )}
        </div>

        {/* Circular Progress Ring & Time Display */}
        <div className="relative w-64 h-64 sm:w-72 sm:h-72 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 200 200">
            {/* Background Track */}
            <circle
              cx="100"
              cy="100"
              r="90"
              className="text-slate-800/80 stroke-current"
              strokeWidth="10"
              fill="transparent"
            />
            {/* Animated Progress Ring */}
            <circle
              cx="100"
              cy="100"
              r="90"
              className={`stroke-current transition-all duration-1000 ease-linear ${
                isFocus ? 'text-indigo-500' : 'text-emerald-500'
              }`}
              strokeWidth="10"
              strokeDasharray={strokeDasharray}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
            />
          </svg>

          {/* Time Text Center */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-5xl sm:text-6xl font-black tracking-tight text-white font-mono drop-shadow-md">
              {formattedTime}
            </span>
            <span className="text-xs font-medium text-slate-400 mt-2">
              {isRunning ? (isFocus ? 'Deep Work Mode' : 'Rest & Recharge') : 'Timer Paused'}
            </span>
          </div>
        </div>

        {/* Real-time Sync Tag */}
        <p className="text-[11px] text-slate-400 mt-4 flex items-center space-x-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
          <span>Synchronized in real-time for all participants</span>
        </p>

        {/* Action Controls */}
        <div className="flex items-center space-x-4 mt-6">
          <button
            onClick={resetTimer}
            className="p-3.5 rounded-2xl bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition transform active:scale-95"
            title="Reset Timer"
          >
            <RotateCcw className="w-5 h-5" />
          </button>

          {isRunning ? (
            <button
              onClick={pauseTimer}
              className="px-8 py-4 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-sm shadow-xl shadow-rose-600/30 transition transform active:scale-95 flex items-center space-x-2"
            >
              <Pause className="w-5 h-5" />
              <span>Pause</span>
            </button>
          ) : (
            <button
              onClick={startTimer}
              className={`px-8 py-4 rounded-2xl font-extrabold text-sm shadow-xl transition transform active:scale-95 flex items-center space-x-2 text-white ${
                isFocus
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-indigo-600/30'
                  : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-emerald-600/30'
              }`}
            >
              <Play className="w-5 h-5 fill-current" />
              <span>Start Sync Timer</span>
            </button>
          )}

          <button
            onClick={skipSession}
            className="p-3.5 rounded-2xl bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition transform active:scale-95"
            title="Skip to Next Session"
          >
            <SkipForward className="w-5 h-5" />
          </button>
        </div>

      </div>
    </div>
  );
};
