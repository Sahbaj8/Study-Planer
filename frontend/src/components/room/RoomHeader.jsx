import React from 'react';
import { Copy, Users, ArrowLeft, Settings, ShieldCheck, UserPlus } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

export const RoomHeader = ({ room, onLeave, onOpenInvite, onOpenSettings, isHost }) => {
  const { showToast } = useToast();

  const handleCopyCode = () => {
    if (!room?.code) return;
    navigator.clipboard.writeText(room.code);
    showToast(`Copied room code: ${room.code} 📋`, 'success');
  };

  return (
    <div className="glass-panel p-4 sm:p-6 rounded-3xl border border-slate-800 shadow-xl mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
      
      {/* Title & Metadata */}
      <div className="flex items-start space-x-3">
        <button
          onClick={onLeave}
          className="p-2.5 rounded-2xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-slate-300 transition"
          title="Back to Dashboard"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              {room?.name}
            </h1>
            {isHost && (
              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center space-x-1">
                <ShieldCheck className="w-3 h-3" />
                <span>Host</span>
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            {room?.description || 'Collaborative study space with live shared pomodoro timer, notes, and chat.'}
          </p>
        </div>
      </div>

      {/* Code Copy, Invite & Room Actions */}
      <div className="flex items-center space-x-2.5">
        {/* Invite Friends Button */}
        <button
          onClick={onOpenInvite}
          className="px-4 py-2 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/25 transition flex items-center space-x-1.5"
        >
          <UserPlus className="w-4 h-4" />
          <span>Invite Friends</span>
        </button>

        {/* Room Code Badge */}
        <button
          onClick={handleCopyCode}
          className="hidden sm:flex items-center space-x-2 px-3 py-2 rounded-2xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-xs font-mono font-bold text-slate-200 transition shadow-inner group"
          title="Copy Room Code"
        >
          <span className="text-indigo-300 tracking-wider font-extrabold">{room?.code}</span>
          <Copy className="w-3.5 h-3.5 text-indigo-400 group-hover:scale-110 transition" />
        </button>

        {isHost && onOpenSettings && (
          <button
            onClick={onOpenSettings}
            className="p-2.5 rounded-2xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white transition"
            title="Room Settings"
          >
            <Settings className="w-4 h-4" />
          </button>
        )}

        <button
          onClick={onLeave}
          className="px-4 py-2 rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 text-xs font-bold transition"
        >
          Leave
        </button>
      </div>

    </div>
  );
};
