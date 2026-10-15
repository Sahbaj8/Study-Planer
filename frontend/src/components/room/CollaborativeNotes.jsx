import React, { useState, useRef } from 'react';
import { 
  FileText, Save, Check, Copy, Download, Bold, Italic, Heading, List, Code, 
  Eye, Edit3, FileSpreadsheet, FileImage, Paperclip, Image as ImageIcon, Share2
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';

export const CollaborativeNotes = ({
  content,
  updateContent,
  lastUpdatedBy,
  updatedAt,
  saving,
  loading
}) => {
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const fileInputRef = useRef(null);
  const { showToast } = useToast();

  const handleToolbarInsert = (prefix, suffix = '') => {
    const textarea = document.getElementById('room-shared-notes-input');
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end) || 'text';
    const replacement = `${prefix}${selectedText}${suffix}`;

    const newContent = content.substring(0, start) + replacement + content.substring(end);
    updateContent(newContent);
  };

  // Copy notes text
  const handleCopyNotes = () => {
    navigator.clipboard.writeText(content);
    showToast('Notes copied to clipboard! 📋', 'success');
  };

  // Download Markdown file (.md)
  const handleDownloadMarkdown = () => {
    const element = document.createElement('a');
    const file = new Blob([content], { type: 'text/markdown' });
    element.href = URL.createObjectURL(file);
    element.download = `Study_Notes_${new Date().toISOString().slice(0, 10)}.md`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    showToast('Downloaded Markdown study notes 💾', 'success');
  };

  // Export Notes to PDF
  const handleExportPDF = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      showToast('Please allow popups to export PDF', 'warning');
      return;
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>StudySync Notes - ${new Date().toLocaleDateString()}</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
              padding: 40px;
              color: #1e293b;
              line-height: 1.6;
            }
            .header {
              border-bottom: 2px solid #6366f1;
              padding-bottom: 12px;
              margin-bottom: 24px;
            }
            .title {
              font-size: 24px;
              font-weight: 800;
              color: #4f46e5;
              margin: 0 0 6px 0;
            }
            .meta {
              font-size: 12px;
              color: #64748b;
            }
            .content {
              font-size: 14px;
              white-space: pre-wrap;
              word-break: break-word;
            }
            h1, h2, h3 { color: #334155; margin-top: 18px; }
            img { max-width: 100%; height: auto; border-radius: 8px; margin: 12px 0; }
            .footer {
              margin-top: 40px;
              pt: 12px;
              border-top: 1px solid #e2e8f0;
              font-size: 11px;
              color: #94a3b8;
              text-align: center;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="title">📚 StudySync Collaborative Notes</div>
            <div class="meta">Exported on ${new Date().toLocaleString()} | Last Edit by: ${lastUpdatedBy || 'Room Member'}</div>
          </div>
          <div class="content">${content.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</div>
          <div class="footer">Generated via StudySync Collaborative Student Platform</div>
          <script>
            window.onload = function() {
              window.print();
            };
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
    showToast('Preparing PDF document for print/download 📄', 'success');
  };

  // Export Notes to PNG Image
  const handleExportImage = () => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    const width = 800;
    const lines = content.split('\n');
    const lineHeight = 24;
    const height = Math.max(400, 140 + lines.length * lineHeight);

    canvas.width = width;
    canvas.height = height;

    // Dark glass card gradient background
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, '#0f172a');
    gradient.addColorStop(1, '#1e293b');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Border line
    ctx.strokeStyle = '#6366f1';
    ctx.lineWidth = 4;
    ctx.strokeRect(10, 10, width - 20, height - 20);

    // Title
    ctx.fillStyle = '#818cf8';
    ctx.font = 'bold 22px system-ui, sans-serif';
    ctx.fillText('📚 StudySync Collaborative Notes', 30, 45);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '12px system-ui, sans-serif';
    ctx.fillText(`Exported: ${new Date().toLocaleDateString()} | Author: ${lastUpdatedBy || 'Student'}`, 30, 68);

    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(30, 82);
    ctx.lineTo(width - 30, 82);
    ctx.stroke();

    // Notes Body Lines
    ctx.fillStyle = '#f8fafc';
    ctx.font = '14px Consolas, monospace';
    let y = 115;

    lines.forEach((line) => {
      // Truncate line if too long for canvas
      const truncated = line.length > 85 ? line.substring(0, 85) + '...' : line;
      ctx.fillText(truncated, 30, y);
      y += lineHeight;
    });

    // Save as PNG download
    const link = document.createElement('a');
    link.download = `Study_Notes_Graphic_${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();

    showToast('Exported study notes to PNG Image 🖼️', 'success');
  };

  // Upload and Attach PDF or Image to Notes
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileType = file.type;
    const isImage = fileType.startsWith('image/');
    const isPdf = fileType === 'application/pdf';

    const reader = new FileReader();
    reader.onload = (event) => {
      const fileDataUrl = event.target?.result;
      if (!fileDataUrl) return;

      let insertion = '';
      if (isImage) {
        insertion = `\n\n![${file.name}](${fileDataUrl})\n\n`;
        showToast(`Image "${file.name}" attached to notes! 🖼️`, 'success');
      } else if (isPdf) {
        insertion = `\n\n[📄 PDF Attachment: ${file.name}](${fileDataUrl})\n\n`;
        showToast(`PDF document "${file.name}" attached to notes! 📄`, 'success');
      } else {
        insertion = `\n\n[📎 File Attachment: ${file.name}](${fileDataUrl})\n\n`;
        showToast(`File "${file.name}" attached! 📎`, 'success');
      }

      updateContent(content + insertion);
    };

    reader.readAsDataURL(file);
    e.target.value = '';
  };

  return (
    <div className="glass-panel p-5 sm:p-6 rounded-3xl border border-slate-800 shadow-xl flex flex-col h-[540px]">
      
      {/* Hidden File Input for PDF / Image Upload */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept="image/*,application/pdf"
        className="hidden"
      />

      {/* Header & Status Bar */}
      <div className="flex flex-wrap items-center justify-between pb-3 border-b border-slate-800 gap-2 mb-3">
        <div className="flex items-center space-x-2">
          <FileText className="w-5 h-5 text-indigo-400" />
          <h3 className="text-base font-bold text-white">Collaborative Notes</h3>
        </div>

        {/* Save Status & Last Updated */}
        <div className="flex items-center space-x-3 text-xs text-slate-400">
          <div className="flex items-center space-x-1">
            {saving ? (
              <span className="flex items-center space-x-1 text-amber-400 font-semibold">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                <span>Autosaving...</span>
              </span>
            ) : (
              <span className="flex items-center space-x-1 text-emerald-400 font-semibold">
                <Check className="w-3.5 h-3.5" />
                <span>Saved</span>
              </span>
            )}
          </div>

          {lastUpdatedBy && (
            <span className="hidden sm:inline text-[11px] text-slate-500 border-l border-slate-800 pl-3">
              Last edit: <strong className="text-slate-300">{lastUpdatedBy}</strong>
            </span>
          )}
        </div>
      </div>

      {/* Formatting Toolbar & Quick Actions */}
      <div className="flex flex-wrap items-center justify-between pb-3 border-b border-slate-800/60 mb-3 text-xs gap-2">
        
        {/* Left Toolbar Formatting */}
        <div className="flex items-center space-x-1">
          <button
            onClick={() => handleToolbarInsert('**', '**')}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white transition"
            title="Bold text"
          >
            <Bold className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => handleToolbarInsert('*', '*')}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white transition"
            title="Italic text"
          >
            <Italic className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => handleToolbarInsert('### ')}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white transition"
            title="Header"
          >
            <Heading className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => handleToolbarInsert('- ')}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white transition"
            title="List item"
          >
            <List className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => handleToolbarInsert('`', '`')}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white transition"
            title="Code snippet"
          >
            <Code className="w-3.5 h-3.5" />
          </button>

          {/* Attach PDF / Image File Button */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-1.5 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 transition flex items-center space-x-1 ml-1"
            title="Attach PDF or Image file"
          >
            <Paperclip className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden sm:inline text-[11px] font-bold">Attach PDF/Image</span>
          </button>
        </div>

        {/* Right PDF, Image & Markdown Export Buttons */}
        <div className="flex items-center space-x-1.5">
          <button
            onClick={() => setIsPreviewMode(!isPreviewMode)}
            className={`px-3 py-1 rounded-xl font-semibold flex items-center space-x-1.5 transition ${
              isPreviewMode
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
            }`}
          >
            {isPreviewMode ? <Edit3 className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5 text-cyan-400" />}
            <span>{isPreviewMode ? 'Edit' : 'Preview'}</span>
          </button>

          {/* Export PDF Button */}
          <button
            onClick={handleExportPDF}
            className="px-2.5 py-1 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-300 font-bold flex items-center space-x-1 transition"
            title="Export Notes as PDF"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-rose-400" />
            <span className="hidden sm:inline">PDF</span>
          </button>

          {/* Export Image Button */}
          <button
            onClick={handleExportImage}
            className="px-2.5 py-1 rounded-xl bg-purple-500/15 hover:bg-purple-500/25 border border-purple-500/30 text-purple-300 font-bold flex items-center space-x-1 transition"
            title="Export Notes as PNG Image"
          >
            <FileImage className="w-3.5 h-3.5 text-purple-400" />
            <span className="hidden sm:inline">Image</span>
          </button>

          <button
            onClick={handleCopyNotes}
            className="p-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition"
            title="Copy Notes Text"
          >
            <Copy className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={handleDownloadMarkdown}
            className="p-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition"
            title="Download Notes (.md)"
          >
            <Download className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Editor or Markdown Preview Area */}
      <div className="flex-1 overflow-hidden relative">
        {isPreviewMode ? (
          <div className="w-full h-full overflow-y-auto p-4 bg-slate-950/60 rounded-2xl border border-slate-800/80 text-slate-200 text-sm prose prose-invert max-w-none space-y-2">
            {content.split('\n').map((line, i) => {
              if (line.startsWith('### ')) return <h3 key={i} className="text-lg font-bold text-indigo-300 my-2">{line.replace('### ', '')}</h3>;
              if (line.startsWith('## ')) return <h2 key={i} className="text-xl font-bold text-indigo-300 my-2">{line.replace('## ', '')}</h2>;
              if (line.startsWith('# ')) return <h1 key={i} className="text-2xl font-black text-indigo-200 my-3">{line.replace('# ', '')}</h1>;
              if (line.startsWith('- ')) return <li key={i} className="ml-4 list-disc text-slate-300">{line.replace('- ', '')}</li>;

              // Render Embedded Image attachments
              if (line.includes('![') && line.includes('](')) {
                const alt = line.substring(line.indexOf('![') + 2, line.indexOf(']('));
                const src = line.substring(line.indexOf('](') + 2, line.lastIndexOf(')'));
                return (
                  <div key={i} className="my-3 p-2 bg-slate-900 rounded-2xl border border-slate-800 inline-block">
                    <img src={src} alt={alt} className="max-h-64 rounded-xl object-contain mx-auto" />
                    <span className="text-[10px] text-slate-400 mt-1 block text-center font-medium">📷 {alt}</span>
                  </div>
                );
              }

              // Render Embedded PDF / File attachments
              if (line.includes('[📄') && line.includes('](')) {
                const label = line.substring(line.indexOf('[') + 1, line.indexOf(']('));
                const href = line.substring(line.indexOf('](') + 2, line.lastIndexOf(')'));
                return (
                  <div key={i} className="my-2 p-3 bg-indigo-950/40 rounded-2xl border border-indigo-500/30 flex items-center justify-between">
                    <span className="text-xs font-bold text-indigo-200">{label}</span>
                    <a
                      href={href}
                      download="document.pdf"
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold shadow"
                    >
                      Open PDF
                    </a>
                  </div>
                );
              }

              return <p key={i} className="my-1 leading-relaxed text-slate-300">{line || '\u00A0'}</p>;
            })}
          </div>
        ) : (
          <textarea
            id="room-shared-notes-input"
            value={content}
            onChange={(e) => updateContent(e.target.value)}
            placeholder="Type shared study notes here... Changes autosave in real time. Use 'Attach PDF/Image' button to upload documents!"
            className="w-full h-full p-4 glass-input rounded-2xl text-sm font-mono leading-relaxed resize-none focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        )}
      </div>

    </div>
  );
};
