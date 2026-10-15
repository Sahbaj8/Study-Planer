import React from 'react';
import { Users, ShieldCheck, Zap } from 'lucide-react';

export const LiveParticipants = ({ onlineParticipants = [], allRoomMembers = [], hostId }) => {
  // Merge static room members with live online presence status
  const participantMap = new Map();

  // Add registered members first
  allRoomMembers.forEach((mem) => {
    participantMap.set(mem.id, {
      user_id: mem.id,
      full_name: mem.full_name,
      avatar_url: mem.avatar_url,
      role: mem.role,
      isOnline: false,
      current_status: 'Offline'
    });
  });

  // Overlay live online presences
  onlineParticipants.forEach((pres) => {
    const existing = participantMap.get(pres.user_id) || {};
    participantMap.set(pres.user_id, {
      ...existing,
      user_id: pres.user_id,
      full_name: pres.full_name || existing.full_name || 'Student',
      avatar_url: pres.avatar_url || existing.avatar_url,
      isOnline: true,
      current_status: pres.current_status || 'Online'
    });
  });

  const mergedList = Array.from(participantMap.values());
  const onlineCount = mergedList.filter((p) => p.isOnline).length;

  return (
    <div className="glass-panel p-5 rounded-3xl border border-slate-800 shadow-xl space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center space-x-2">
          <Users className="w-5 h-5 text-cyan-400" />
          <h3 className="text-sm font-bold text-white">Live Participants</h3>
        </div>
        <span className="text-[11px] font-extrabold px-2.5 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
          {onlineCount} Online
        </span>
      </div>

      <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
        {mergedList.map((p) => {
          const isHost = p.user_id === hostId || p.role === 'host';
          return (
            <div
              key={p.user_id}
              className={`flex items-center justify-between p-2.5 rounded-2xl border transition ${
                p.isOnline
                  ? 'bg-slate-900/80 border-slate-800'
                  : 'bg-slate-950/40 border-slate-900 opacity-60'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <img
                    src={p.avatar_url || 'https://api.dicebear.com/7.x/bottts/svg?seed=student'}
                    alt={p.full_name}
                    className="w-8 h-8 rounded-xl bg-slate-800 object-cover border border-slate-700"
                  />
                  <span
                    className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-slate-950 ${
                      p.isOnline ? 'bg-emerald-400 animate-pulse' : 'bg-slate-600'
                    }`}
                  />
                </div>

                <div>
                  <div className="flex items-center space-x-1.5">
                    <span className="text-xs font-bold text-slate-200">{p.full_name}</span>
                    {isHost && (
                      <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        Host
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-400 font-medium">
                    {p.isOnline ? p.current_status : 'Offline'}
                  </p>
                </div>
              </div>

              {p.isOnline && (
                <div className="flex items-center space-x-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-lg">
                  <Zap className="w-3 h-3 text-emerald-400" />
                  <span>Active</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
