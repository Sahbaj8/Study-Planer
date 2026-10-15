import React, { useState } from 'react';
import { useVideoCall } from '../../hooks/useVideoCall';
import { 
  Mic, MicOff, Video, VideoOff, Monitor, Users, Maximize2, Minimize2, Sparkles, AlertCircle 
} from 'lucide-react';

export const LiveVideoCall = ({ user, onlineParticipants = [] }) => {
  const {
    localVideoRef,
    isMicOn,
    isCamOn,
    isScreenSharing,
    hasCameraPermission,
    errorMsg,
    toggleMic,
    toggleCam,
    toggleScreenShare,
    retryMedia
  } = useVideoCall(user);

  const [isExpanded, setIsExpanded] = useState(false);

  // Filter out current user from remote list
  const remotePeers = onlineParticipants.filter((p) => p.user_id !== user?.id);

  return (
    <div className={`glass-panel rounded-3xl border border-slate-800 shadow-xl transition-all duration-300 overflow-hidden ${
      isExpanded ? 'p-6 space-y-4' : 'p-4 space-y-3'
    }`}>
      
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
        <div className="flex items-center space-x-2">
          <div className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
          <h3 className="text-sm font-bold text-white flex items-center space-x-2">
            <span>Live Video Study Group</span>
            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              WebRTC Live
            </span>
          </h3>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition text-xs"
            title={isExpanded ? 'Compact View' : 'Expand Video Grid'}
          >
            {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Video Grid Container */}
      <div className={`grid gap-3 ${
        isExpanded
          ? 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 min-h-[320px]'
          : 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 min-h-[160px]'
      }`}>
        
        {/* Local User Video Tile */}
        <div className="relative bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 shadow-inner group min-h-[150px] flex items-center justify-center">
          {hasCameraPermission && isCamOn ? (
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover rounded-2xl transform -scale-x-100"
            />
          ) : (
            <div className="flex flex-col items-center justify-center p-4 text-center space-y-2">
              <img
                src={user?.avatar_url || 'https://api.dicebear.com/7.x/bottts/svg?seed=you'}
                alt={user?.full_name}
                className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-700 object-cover shadow-md"
              />
              <span className="text-xs font-bold text-slate-300">You ({user?.full_name?.split(' ')[0] || 'You'})</span>
              <span className="text-[10px] text-slate-500">Camera Off</span>
            </div>
          )}

          {/* User Name & Status Overlay */}
          <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between px-2.5 py-1 rounded-xl bg-slate-950/70 backdrop-blur-md border border-slate-800/80 text-xs">
            <span className="font-bold text-slate-200 text-[11px] truncate max-w-[100px]">
              You {isScreenSharing ? '(Sharing Screen)' : ''}
            </span>
            <div className="flex items-center space-x-1">
              {!isMicOn && <MicOff className="w-3 h-3 text-rose-400" />}
              {isMicOn && <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />}
            </div>
          </div>
        </div>

        {/* Remote Peers Video Tiles */}
        {remotePeers.length === 0 ? (
          /* Simulated Peer Tile when studying solo or waiting for friends */
          <div className="relative bg-slate-950/60 rounded-2xl p-4 border border-dashed border-slate-800 flex flex-col items-center justify-center text-center space-y-2 min-h-[150px]">
            <Users className="w-8 h-8 text-slate-600" />
            <p className="text-xs font-medium text-slate-400">Waiting for study partners...</p>
            <p className="text-[10px] text-slate-500">Share room code to invite classmates</p>
          </div>
        ) : (
          remotePeers.map((peer) => (
            <div
              key={peer.user_id}
              className="relative bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 shadow-inner min-h-[150px] flex items-center justify-center group"
            >
              {/* Simulated remote stream avatar preview */}
              <div className="flex flex-col items-center justify-center p-4 text-center space-y-2">
                <div className="relative">
                  <img
                    src={peer.avatar_url || 'https://api.dicebear.com/7.x/bottts/svg?seed=peer'}
                    alt={peer.full_name}
                    className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-700 object-cover shadow-md"
                  />
                  <span className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full bg-emerald-400 border-2 border-slate-950 animate-ping" />
                </div>
                <span className="text-xs font-bold text-slate-200 truncate max-w-[110px]">
                  {peer.full_name}
                </span>
                <span className="text-[10px] text-emerald-400 font-medium bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  {peer.current_status || 'In Video Call'}
                </span>
              </div>

              {/* Name Overlay */}
              <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between px-2.5 py-1 rounded-xl bg-slate-950/70 backdrop-blur-md border border-slate-800/80 text-xs">
                <span className="font-bold text-slate-200 text-[11px] truncate">
                  {peer.full_name}
                </span>
                <div className="flex items-center space-x-1 text-emerald-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                </div>
              </div>
            </div>
          ))
        )}

      </div>

      {/* Video Call Controls Bar */}
      <div className="flex items-center justify-between pt-2">
        <div className="flex items-center space-x-2">
          {/* Toggle Mic */}
          <button
            onClick={toggleMic}
            className={`p-3 rounded-2xl font-bold text-xs flex items-center space-x-2 transition ${
              isMicOn
                ? 'bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800'
                : 'bg-rose-500/20 text-rose-400 border border-rose-500/40 hover:bg-rose-500/30'
            }`}
            title={isMicOn ? 'Mute Microphone' : 'Unmute Microphone'}
          >
            {isMicOn ? <Mic className="w-4 h-4 text-emerald-400" /> : <MicOff className="w-4 h-4" />}
            <span className="hidden sm:inline">{isMicOn ? 'Mute' : 'Unmuted'}</span>
          </button>

          {/* Toggle Camera */}
          <button
            onClick={toggleCam}
            className={`p-3 rounded-2xl font-bold text-xs flex items-center space-x-2 transition ${
              isCamOn
                ? 'bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800'
                : 'bg-rose-500/20 text-rose-400 border border-rose-500/40 hover:bg-rose-500/30'
            }`}
            title={isCamOn ? 'Turn Camera Off' : 'Turn Camera On'}
          >
            {isCamOn ? <Video className="w-4 h-4 text-indigo-400" /> : <VideoOff className="w-4 h-4" />}
            <span className="hidden sm:inline">{isCamOn ? 'Camera On' : 'Cam Off'}</span>
          </button>

          {/* Screen Share */}
          <button
            onClick={toggleScreenShare}
            className={`p-3 rounded-2xl font-bold text-xs flex items-center space-x-2 transition ${
              isScreenSharing
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800'
            }`}
            title="Share Screen"
          >
            <Monitor className="w-4 h-4 text-cyan-400" />
            <span className="hidden sm:inline">
              {isScreenSharing ? 'Stop Share' : 'Share Screen'}
            </span>
          </button>
        </div>

        {/* Status / Permission Info */}
        {!hasCameraPermission && (
          <button
            onClick={retryMedia}
            className="text-[11px] text-amber-400 hover:underline flex items-center space-x-1"
          >
            <AlertCircle className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Enable Cam/Mic</span>
          </button>
        )}
      </div>

    </div>
  );
};
