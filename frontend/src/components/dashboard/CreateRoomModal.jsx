import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { useToast } from '../../context/ToastContext';
import { BookOpen, Clock, Sparkles } from 'lucide-react';

export const CreateRoomModal = ({ isOpen, onClose, onCreateRoom }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [focusDuration, setFocusDuration] = useState('25');
  const [breakDuration, setBreakDuration] = useState('5');
  const [loading, setLoading] = useState(false);

  const { showToast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    try {
      await onCreateRoom({
        name: name.trim(),
        description: description.trim(),
        focusDuration: Number(focusDuration),
        breakDuration: Number(breakDuration)
      });
      showToast('Study room created successfully! 🎉', 'success');
      setName('');
      setDescription('');
      onClose();
    } catch (err) {
      showToast(err.message || 'Failed to create room', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New Study Room">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
            Room Name *
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. 📚 Organic Chemistry Prep"
            className="w-full glass-input px-4 py-2.5 rounded-xl text-sm"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
            Description / Goals
          </label>
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What will you be studying in this session?"
            className="w-full glass-input px-4 py-2.5 rounded-xl text-sm resize-none"
          />
        </div>

        {/* Focus & Break Durations */}
        <div className="grid grid-cols-2 gap-4 pt-1">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider flex items-center space-x-1">
              <Clock className="w-3.5 h-3.5 text-indigo-400" />
              <span>Focus Session</span>
            </label>
            <select
              value={focusDuration}
              onChange={(e) => setFocusDuration(e.target.value)}
              className="w-full glass-input px-3 py-2.5 rounded-xl text-sm bg-slate-900"
            >
              <option value="15">15 Minutes</option>
              <option value="25">25 Minutes (Standard)</option>
              <option value="45">45 Minutes</option>
              <option value="50">50 Minutes (Long)</option>
              <option value="60">60 Minutes</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider flex items-center space-x-1">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>Break Session</span>
            </label>
            <select
              value={breakDuration}
              onChange={(e) => setBreakDuration(e.target.value)}
              className="w-full glass-input px-3 py-2.5 rounded-xl text-sm bg-slate-900"
            >
              <option value="5">5 Minutes (Standard)</option>
              <option value="10">10 Minutes</option>
              <option value="15">15 Minutes</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs shadow-lg shadow-indigo-500/25"
          >
            {loading ? 'Creating...' : 'Create Study Room'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
