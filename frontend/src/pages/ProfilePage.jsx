import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { AvatarPicker } from '../components/common/AvatarPicker';
import { User, Mail, ShieldCheck, Check, Save } from 'lucide-react';

export const ProfilePage = ({ onBack }) => {
  const { profile, updateProfile } = useAuth();
  const { showToast } = useToast();

  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [avatarUrl, setAvatarUrl] = useState(
    profile?.avatar_url || 'https://api.dicebear.com/7.x/bottts/svg?seed=student'
  );
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!fullName.trim()) return;

    setSaving(true);
    const { error } = await updateProfile({
      full_name: fullName.trim(),
      avatar_url: avatarUrl
    });
    setSaving(false);

    if (error) {
      showToast(error.message, 'error');
    } else {
      showToast('Profile updated successfully! ✨', 'success');
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-2xl space-y-6">
        
        {/* Header */}
        <div className="flex items-center space-x-4 border-b border-slate-800 pb-5">
          <img
            src={avatarUrl}
            alt={fullName}
            className="w-16 h-16 rounded-2xl bg-slate-800 object-cover border-2 border-indigo-500/50 shadow-lg"
          />
          <div>
            <h2 className="text-xl font-bold text-white">{profile?.full_name || 'Student Profile'}</h2>
            <p className="text-xs text-slate-400">{profile?.email || 'student@university.edu'}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
              Full Name
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full glass-input pl-10 pr-4 py-2.5 rounded-xl text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
              <input
                type="email"
                disabled
                value={profile?.email || 'student@studyhive.io'}
                className="w-full glass-input pl-10 pr-4 py-2.5 rounded-xl text-sm opacity-60 cursor-not-allowed"
              />
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Managed via Supabase Authentication</p>
          </div>

          {/* Avatar Selector */}
          <div>
            <AvatarPicker selectedAvatar={avatarUrl} onSelect={setAvatarUrl} />
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onBack}
              className="px-5 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
            >
              Back to Dashboard
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg flex items-center space-x-2"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving...' : 'Save Profile Changes'}</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
