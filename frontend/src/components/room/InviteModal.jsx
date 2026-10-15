import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { useToast } from '../../context/ToastContext';
import { Copy, Check, Share2, Mail, MessageCircle, QrCode, ExternalLink } from 'lucide-react';

export const InviteModal = ({ isOpen, onClose, room }) => {
  const { showToast } = useToast();
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  if (!room) return null;

  const roomCode = room.code;
  const inviteUrl = `${window.location.origin}/?room=${roomCode}`;
  const shareMessage = `Hey! Join my study room "${room.name}" on StudySync to focus together! Room Code: ${roomCode} - Join link: ${inviteUrl}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(inviteUrl);
    setCopiedLink(true);
    showToast('Direct invite link copied to clipboard! 📋', 'success');
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(roomCode);
    setCopiedCode(true);
    showToast(`Room code ${roomCode} copied! 📋`, 'success');
    setTimeout(() => setCopiedCode(false), 2500);
  };

  const handleWhatsAppShare = () => {
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareMessage)}`;
    window.open(url, '_blank');
  };

  const handleEmailShare = () => {
    const subject = encodeURIComponent(`Join my study session: ${room.name}`);
    const body = encodeURIComponent(shareMessage);
    window.open(`mailto:?subject=${subject}&body=${body}`, '_blank');
  };

  // SVG QR Code generator string for room link
  const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(inviteUrl)}&color=6366f1&bgboundary=0`;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Invite Classmates to Study Room">
      <div className="space-y-5">
        
        {/* Room Code Quick Box */}
        <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 text-center space-y-1.5">
          <span className="text-[11px] font-bold text-indigo-300 uppercase tracking-widest">
            Room Code
          </span>
          <div className="flex items-center justify-center space-x-3">
            <span className="text-2xl font-mono font-black text-white tracking-wider">
              {roomCode}
            </span>
            <button
              onClick={handleCopyCode}
              className="p-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md transition"
              title="Copy Code"
            >
              {copiedCode ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Direct Link Input Box */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
            Direct Join Link
          </label>
          <div className="flex space-x-2">
            <input
              type="text"
              readOnly
              value={inviteUrl}
              className="flex-1 glass-input px-3.5 py-2.5 rounded-xl text-xs font-mono text-slate-300"
            />
            <button
              onClick={handleCopyLink}
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md flex items-center space-x-1.5"
            >
              {copiedLink ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
              <span>{copiedLink ? 'Copied' : 'Copy Link'}</span>
            </button>
          </div>
        </div>

        {/* Quick Social & Direct Share Buttons */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-2 uppercase tracking-wider">
            Quick Share Options
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={handleWhatsAppShare}
              className="p-3 rounded-2xl bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 font-bold text-xs flex items-center justify-center space-x-2 transition"
            >
              <MessageCircle className="w-4 h-4 text-emerald-400" />
              <span>Share on WhatsApp</span>
            </button>

            <button
              onClick={handleEmailShare}
              className="p-3 rounded-2xl bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/40 text-purple-300 font-bold text-xs flex items-center justify-center space-x-2 transition"
            >
              <Mail className="w-4 h-4 text-purple-400" />
              <span>Send via Email</span>
            </button>
          </div>
        </div>

        {/* QR Code Section */}
        <div className="pt-2 border-t border-slate-800 text-center space-y-2">
          <span className="text-xs font-semibold text-slate-400 flex items-center justify-center space-x-1">
            <QrCode className="w-4 h-4 text-cyan-400" />
            <span>Scan to Join on Mobile</span>
          </span>
          <div className="p-3 bg-white rounded-2xl w-36 h-36 mx-auto shadow-xl flex items-center justify-center">
            <img src={qrApiUrl} alt="Room Invite QR Code" className="w-32 h-32 rounded-lg" />
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold text-xs border border-slate-800"
          >
            Close
          </button>
        </div>

      </div>
    </Modal>
  );
};
