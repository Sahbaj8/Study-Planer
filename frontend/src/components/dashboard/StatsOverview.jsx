import React from 'react';
import { Clock, Users, Flame, BookOpen, Sparkles } from 'lucide-react';

export const StatsOverview = ({ joinedCount = 0 }) => {
  const stats = [
    {
      label: 'Focus Hours Logged',
      value: '14.5 hrs',
      icon: Clock,
      color: 'from-blue-500 to-indigo-600',
      textColor: 'text-indigo-400'
    },
    {
      label: 'Joined Study Rooms',
      value: joinedCount || 3,
      icon: Users,
      color: 'from-purple-500 to-pink-600',
      textColor: 'text-purple-400'
    },
    {
      label: 'Active Study Streak',
      value: '5 Days 🔥',
      icon: Flame,
      color: 'from-amber-500 to-orange-600',
      textColor: 'text-amber-400'
    },
    {
      label: 'Shared Notes Created',
      value: '12 Docs',
      icon: BookOpen,
      color: 'from-emerald-500 to-teal-600',
      textColor: 'text-emerald-400'
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {stats.map((stat, idx) => {
        const Icon = stat.icon;
        return (
          <div
            key={idx}
            className="glass-card glass-card-hover p-4 rounded-2xl flex flex-col justify-between relative overflow-hidden"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400">{stat.label}</span>
              <div className={`p-2 rounded-xl bg-gradient-to-br ${stat.color} text-white shadow-md`}>
                <Icon className="w-4 h-4" />
              </div>
            </div>

            <div className="mt-4">
              <h3 className="text-2xl font-black text-white tracking-tight">{stat.value}</h3>
            </div>
          </div>
        );
      })}
    </div>
  );
};
