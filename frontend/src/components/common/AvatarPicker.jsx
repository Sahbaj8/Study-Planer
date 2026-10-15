import React, { useState } from 'react';
import { Check, Sparkles, Image as ImageIcon } from 'lucide-react';

const PRESET_SEEDS = [
  'AlexRivera', 'Sophia', 'Marcus', 'Emma', 'Oliver', 
  'CyberStudent', 'BrainyApe', 'TechNinja', 'ScholarFox', 'FocusOwl'
];

export const AvatarPicker = ({ selectedAvatar, onSelect }) => {
  const [customUrl, setCustomUrl] = useState('');
  const [isCustom, setIsCustom] = useState(false);

  const getAvatarUrl = (seed) => `https://api.dicebear.com/7.x/bottts/svg?seed=${seed}`;

  return (
    <div className="space-y-4">
      <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
        Choose Your Avatar
      </label>

      {/* Preset Grid */}
      <div className="grid grid-cols-5 gap-3">
        {PRESET_SEEDS.map((seed) => {
          const url = getAvatarUrl(seed);
          const isSelected = selectedAvatar === url;
          return (
            <button
              key={seed}
              type="button"
              onClick={() => {
                setIsCustom(false);
                onSelect(url);
              }}
              className={`relative p-2 rounded-xl border transition-all transform hover:scale-105 ${
                isSelected
                  ? 'border-indigo-500 bg-indigo-500/20 ring-2 ring-indigo-500/40'
                  : 'border-slate-800 bg-slate-900/60 hover:border-slate-700'
              }`}
            >
              <img src={url} alt={seed} className="w-10 h-10 mx-auto rounded-lg" />
              {isSelected && (
                <div className="absolute -top-1 -right-1 bg-indigo-500 text-white rounded-full p-0.5 shadow">
                  <Check className="w-3 h-3" />
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Custom URL Input Toggle */}
      <div className="pt-2 border-t border-slate-800">
        <button
          type="button"
          onClick={() => setIsCustom(!isCustom)}
          className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center space-x-1.5 font-medium"
        >
          <ImageIcon className="w-3.5 h-3.5" />
          <span>{isCustom ? 'Hide custom image URL' : 'Use custom image URL'}</span>
        </button>

        {isCustom && (
          <div className="mt-3 flex space-x-2">
            <input
              type="url"
              placeholder="https://example.com/my-avatar.png"
              value={customUrl}
              onChange={(e) => setCustomUrl(e.target.value)}
              className="flex-1 glass-input px-3 py-2 rounded-lg text-xs"
            />
            <button
              type="button"
              onClick={() => {
                if (customUrl.trim()) onSelect(customUrl.trim());
              }}
              className="px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold"
            >
              Apply
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
