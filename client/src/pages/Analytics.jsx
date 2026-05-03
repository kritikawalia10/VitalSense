import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Calendar } from 'lucide-react';

const data = [
  { name: 'Mon', highBpOccurrences: 2, avgHr: 72 },
  { name: 'Tue', highBpOccurrences: 1, avgHr: 75 },
  { name: 'Wed', highBpOccurrences: 4, avgHr: 82 },
  { name: 'Thu', highBpOccurrences: 5, avgHr: 86 },
  { name: 'Fri', highBpOccurrences: 2, avgHr: 78 },
  { name: 'Sat', highBpOccurrences: 0, avgHr: 71 },
  { name: 'Sun', highBpOccurrences: 1, avgHr: 73 },
];

const Analytics = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="text-3xl font-bold text-slate-100 tracking-tight">Analytics & Trends</h2>
          <p className="text-slate-400 mt-1">Detailed historical health data.</p>
        </div>
        <div className="flex items-center gap-2 bg-slate-900/50 border border-slate-700 rounded-lg px-3 py-2">
          <Calendar size={16} className="text-slate-400" />
          <span className="text-sm font-medium text-slate-200">This Week</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800/50 rounded-3xl p-6">
          <h3 className="text-lg font-bold text-slate-100 mb-6">Weekly BP Spike Occurrences</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="name" stroke="#64748b" axisLine={false} tickLine={false} />
                <YAxis stroke="#64748b" axisLine={false} tickLine={false} />
                <Tooltip cursor={{ fill: '#1e293b', opacity: 0.4 }} contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }} />
                <Bar dataKey="highBpOccurrences" name="Spikes > 130 mmHg" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800/50 rounded-3xl p-6">
          <h3 className="text-lg font-bold text-slate-100 mb-6">Average Heart Rate Trends</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="name" stroke="#64748b" axisLine={false} tickLine={false} />
                <YAxis stroke="#64748b" axisLine={false} tickLine={false} />
                <Tooltip cursor={{ fill: '#1e293b', opacity: 0.4 }} contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }} />
                <Bar dataKey="avgHr" name="Avg BPM" fill="#f97316" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
