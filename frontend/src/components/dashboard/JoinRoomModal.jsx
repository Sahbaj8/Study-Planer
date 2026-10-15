import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { useToast } from '../../context/ToastContext';
import { KeyRound, ArrowRight } from 'lucide-react';

export const JoinRoomModal = ({ isOpen, onClose, onJoinRoom }) => {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!code.trim()) return;

    setLoading(true);
    try {
      const room = await onJoinRoom(code.trim());
      showToast(`Successfully joined room "${room.name}"! 🚀`, 'success');
      setCode('');
      onClose();
    } catch (err) {
      showToast(err.message || 'Invalid room code', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Join Study Room via Code">
      <form onSubmit={handleSubmit} className="space-y-4">
        <p className="text-xs text-slate-400">
          Enter the unique 6-character room code shared by your classmate or group leader (e.g. <span className="font-mono text-indigo-300">STUDY-CS101</span>).
        </p>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
            Room Code
          </label>
          <div className="relative">
            <KeyRound className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
            <input
              type="text"
              required
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="e.g. STUDY-8X9K2"
              className="w-full glass-input pl-10 pr-4 py-2.5 rounded-xl text-sm font-mono tracking-wider text-indigo-300 font-bold"
            />
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
            className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg flex items-center space-x-2"
          >
            {loading ? (
              <span>Joining...</span>
            ) : (
              <>
                <span>Join Room</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};
