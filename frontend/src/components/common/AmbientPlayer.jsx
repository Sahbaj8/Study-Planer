import React, { useState } from 'react';
import { Volume2, VolumeX, CloudRain, Wind, Trees } from 'lucide-react';
import { soundService } from '../../lib/soundEffects';

export const AmbientPlayer = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [soundType, setSoundType] = useState('rain'); // rain | pink | forest
  const [volume, setVolume] = useState(0.2);
  const [isOpen, setIsOpen] = useState(false);

  const togglePlay = () => {
    if (isPlaying) {
      soundService.stopAmbientNoise();
      setIsPlaying(false);
    } else {
      soundService.startAmbientNoise(soundType, volume);
      setIsPlaying(true);
    }
  };

  const handleTypeChange = (type) => {
    setSoundType(type);
    if (isPlaying) {
      soundService.startAmbientNoise(type, volume);
    }
  };

  const handleVolumeChange = (e) => {
    const vol = parseFloat(e.target.value);
    setVolume(vol);
    soundService.setAmbientVolume(vol);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center space-x-2 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
          isPlaying
            ? 'bg-indigo-500/20 border-indigo-500/50 text-indigo-300 shadow-lg shadow-indigo-500/10'
            : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
        }`}
      >
        {isPlaying ? (
          <Volume2 className="w-4 h-4 text-indigo-400 animate-pulse" />
        ) : (
          <VolumeX className="w-4 h-4" />
        )}
        <span className="hidden sm:inline">Ambience</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 p-4 rounded-2xl glass-panel shadow-2xl z-50 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">
              Study Ambience
            </span>
            <button
              onClick={togglePlay}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                isPlaying
                  ? 'bg-rose-500/20 text-rose-400 hover:bg-rose-500/30'
                  : 'bg-indigo-600 text-white hover:bg-indigo-500'
              }`}
            >
              {isPlaying ? 'Pause' : 'Play'}
            </button>
          </div>

          {/* Sound Types */}
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => handleTypeChange('rain')}
              className={`p-2 rounded-xl border flex flex-col items-center text-xs transition ${
                soundType === 'rain'
                  ? 'border-indigo-500 bg-indigo-500/20 text-indigo-300'
                  : 'border-slate-800 bg-slate-900/40 text-slate-400 hover:text-slate-200'
              }`}
            >
              <CloudRain className="w-4 h-4 mb-1" />
              <span>Rain</span>
            </button>
            <button
              onClick={() => handleTypeChange('pink')}
              className={`p-2 rounded-xl border flex flex-col items-center text-xs transition ${
                soundType === 'pink'
                  ? 'border-indigo-500 bg-indigo-500/20 text-indigo-300'
                  : 'border-slate-800 bg-slate-900/40 text-slate-400 hover:text-slate-200'
              }`}
            >
              <Wind className="w-4 h-4 mb-1" />
              <span>Noise</span>
            </button>
            <button
              onClick={() => handleTypeChange('forest')}
              className={`p-2 rounded-xl border flex flex-col items-center text-xs transition ${
                soundType === 'forest'
                  ? 'border-indigo-500 bg-indigo-500/20 text-indigo-300'
                  : 'border-slate-800 bg-slate-900/40 text-slate-400 hover:text-slate-200'
              }`}
            >
              <Trees className="w-4 h-4 mb-1" />
              <span>Forest</span>
            </button>
          </div>

          {/* Volume Slider */}
          <div className="space-y-1 pt-1">
            <div className="flex justify-between text-xs text-slate-400">
              <span>Volume</span>
              <span>{Math.round(volume * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={volume}
              onChange={handleVolumeChange}
              className="w-full accent-indigo-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
            />
          </div>
        </div>
      )}
    </div>
  );
};
