import React from 'react';
import { Users, Clock, Copy, ArrowRight, ShieldCheck, Trash2 } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

export const RoomCard = ({ room, onSelectRoom, onLeaveRoom, isCreator }) => {
  const { showToast } = useToast();

  const handleCopyCode = (e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(room.code);
    showToast(`Room code ${room.code} copied! 📋`, 'success');
  };

  return (
    <div
      onClick={() => onSelectRoom(room.id)}
      className="glass-card glass-card-hover p-5 rounded-3xl flex flex-col justify-between cursor-pointer group relative border border-slate-800"
    >
      <div>
        {/* Top Tag & Code */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
            {room.focus_duration}m Focus / {room.break_duration}m Break
          </span>

          <button
            onClick={handleCopyCode}
            className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-slate-900/80 hover:bg-slate-800 text-[11px] font-mono font-bold text-slate-300 border border-slate-800 transition"
            title="Click to copy code"
          >
            <span>{room.code}</span>
            <Copy className="w-3 h-3 text-indigo-400" />
          </button>
        </div>

        {/* Room Title & Description */}
        <h3 className="text-base font-bold text-slate-100 group-hover:text-indigo-300 transition line-clamp-1 mb-1.5">
          {room.name}
        </h3>
        <p className="text-xs text-slate-400 line-clamp-2 mb-4 h-8">
          {room.description || 'Join this study session to focus with peers.'}
        </p>
      </div>

      <div>
        {/* Creator & Members Info */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-800/80 mb-4">
          <div className="flex items-center space-x-2">
            <img
              src={room.creator_avatar || 'https://api.dicebear.com/7.x/bottts/svg?seed=creator'}
              alt={room.creator_name}
              className="w-6 h-6 rounded-full bg-slate-800 border border-slate-700"
            />
            <span className="text-xs text-slate-400 font-medium truncate max-w-[100px]">
              Host: <strong className="text-slate-200">{room.creator_name || 'Host'}</strong>
            </span>
          </div>

          <div className="flex items-center space-x-1 text-xs text-indigo-300 font-semibold bg-indigo-500/10 px-2 py-0.5 rounded-lg">
            <Users className="w-3.5 h-3.5 text-indigo-400" />
            <span>{room.members_count || room.members?.length || 1} online</span>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onSelectRoom(room.id)}
            className="flex-1 py-2.5 px-4 rounded-xl bg-indigo-600/90 hover:bg-indigo-600 text-white font-bold text-xs shadow-md transition flex items-center justify-center space-x-2 group-hover:shadow-indigo-500/20"
          >
            <span>Enter Study Room</span>
            <ArrowRight className="w-4 h-4 transition transform group-hover:translate-x-1" />
          </button>

          {onLeaveRoom && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onLeaveRoom(room.id);
              }}
              className="p-2.5 rounded-xl bg-slate-900 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 border border-slate-800 transition"
              title="Leave Room"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
