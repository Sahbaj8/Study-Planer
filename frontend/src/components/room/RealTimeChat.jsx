import React, { useState, useRef } from 'react';
import { MessageSquare, Send, Paperclip, FileText, Image as ImageIcon } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export const RealTimeChat = ({
  messages = [],
  sendMessage,
  sending,
  chatEndRef,
  currentUserId
}) => {
  const [text, setText] = useState('');
  const chatFileInputRef = useRef(null);

  const handleSend = (e) => {
    e.preventDefault();
    if (!text.trim() || sending) return;
    sendMessage(text);
    setText('');
  };

  const handleEmojiClick = (emoji) => {
    setText((prev) => prev + ' ' + emoji);
  };

  const handleChatFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isImage = file.type.startsWith('image/');
    const isPdf = file.type === 'application/pdf';

    const reader = new FileReader();
    reader.onload = (evt) => {
      const url = evt.target?.result;
      if (!url) return;

      if (isImage) {
        sendMessage(`📷 Shared Image: ${file.name}\n${url}`);
      } else if (isPdf) {
        sendMessage(`📄 Shared PDF Document: ${file.name}\n${url}`);
      } else {
        sendMessage(`📎 Shared File: ${file.name}\n${url}`);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  return (
    <div className="glass-panel p-5 rounded-3xl border border-slate-800 shadow-xl flex flex-col h-[460px]">
      
      {/* Hidden File Input */}
      <input
        type="file"
        ref={chatFileInputRef}
        onChange={handleChatFileUpload}
        accept="image/*,application/pdf"
        className="hidden"
      />

      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
        <div className="flex items-center space-x-2">
          <MessageSquare className="w-5 h-5 text-indigo-400" />
          <h3 className="text-sm font-bold text-white">Room Real-Time Chat</h3>
        </div>
        <span className="text-[10px] text-slate-400 font-mono">
          {messages.length} messages
        </span>
      </div>

      {/* Message List */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-1">
        {messages.length === 0 ? (
          <div className="text-center py-12 text-slate-500 text-xs">
            No messages yet. Share notes, PDFs, images, or say hi! 👋
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.user_id === currentUserId;
            const timeAgo = msg.created_at
              ? formatDistanceToNow(new Date(msg.created_at), { addSuffix: true })
              : 'just now';

            // Check if message contains image data URL
            const isImageMsg = msg.content?.includes('📷 Shared Image:') && msg.content?.includes('data:image');
            const isPdfMsg = msg.content?.includes('📄 Shared PDF Document:');

            return (
              <div
                key={msg.id}
                className={`flex items-start space-x-2.5 ${isMe ? 'flex-row-reverse space-x-reverse' : ''}`}
              >
                <img
                  src={msg.avatar_url || 'https://api.dicebear.com/7.x/bottts/svg?seed=student'}
                  alt={msg.user_name}
                  className="w-7 h-7 rounded-xl bg-slate-800 object-cover border border-slate-700 flex-shrink-0 mt-0.5"
                />

                <div className={`max-w-[78%] ${isMe ? 'items-end text-right' : ''}`}>
                  <div className="flex items-center space-x-2 mb-1 px-0.5">
                    <span className="text-[11px] font-bold text-slate-300">{msg.user_name}</span>
                    <span className="text-[9px] text-slate-500">{timeAgo}</span>
                  </div>

                  <div
                    className={`p-3 rounded-2xl text-xs leading-relaxed break-words shadow-sm ${
                      isMe
                        ? 'bg-indigo-600 text-white rounded-tr-none'
                        : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-none'
                    }`}
                  >
                    {isImageMsg ? (
                      <div className="space-y-1.5">
                        <p className="font-semibold text-[11px]">{msg.content.split('\n')[0]}</p>
                        <img
                          src={msg.content.split('\n')[1]}
                          alt="Shared attachment"
                          className="max-h-48 rounded-xl object-contain border border-white/10"
                        />
                      </div>
                    ) : isPdfMsg ? (
                      <div className="space-y-1">
                        <p className="font-semibold text-[11px]">{msg.content.split('\n')[0]}</p>
                        <a
                          href={msg.content.split('\n')[1]}
                          download="document.pdf"
                          target="_blank"
                          rel="noreferrer"
                          className="inline-block px-3 py-1 bg-slate-950 text-indigo-300 rounded-lg text-[11px] font-bold underline"
                        >
                          View PDF File
                        </a>
                      </div>
                    ) : (
                      msg.content
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Quick Emoji Reaction Bar */}
      <div className="flex items-center space-x-1.5 pt-2 pb-1 border-t border-slate-800/60 overflow-x-auto">
        {['👍', '🚀', '💡', '☕', '🧠', '🔥'].map((emoji) => (
          <button
            key={emoji}
            type="button"
            onClick={() => handleEmojiClick(emoji)}
            className="px-2 py-0.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-xs border border-slate-800 transition"
          >
            {emoji}
          </button>
        ))}
      </div>

      {/* Message Form with File Attachment */}
      <form onSubmit={handleSend} className="flex items-center space-x-2 pt-2">
        <button
          type="button"
          onClick={() => chatFileInputRef.current?.click()}
          className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-indigo-300 border border-slate-800 transition"
          title="Share PDF or Image"
        >
          <Paperclip className="w-4 h-4" />
        </button>

        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type message or attach PDF/Image..."
          className="flex-1 glass-input px-3.5 py-2 rounded-xl text-xs"
        />

        <button
          type="submit"
          disabled={sending || !text.trim()}
          className="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold transition shadow-md"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>

    </div>
  );
};
