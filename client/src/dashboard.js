import React, { useState, useEffect } from 'react';
import { Activity, Heart, Thermometer, Droplets, AlertTriangle, User, Bell } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// Simulated Health Data
const mockData = [
  { time: '10:00', heartRate: 72, bp: 120 },
  { time: '10:05', heartRate: 75, bp: 122 },
  { time: '10:10', heartRate: 85, bp: 130 }, // Spike
  { time: '10:15', heartRate: 78, bp: 125 },
  { time: '10:20', heartRate: 74, bp: 121 },
];

const HealthDashboard = () => {
  const [activeAlert, setActiveAlert] = useState(true);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 font-sans">
      {/* Header */}
      <header className="flex justify-between items-center mb-8 bg-slate-900/50 p-4 rounded-2xl border border-slate-800 backdrop-blur-md">
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
            CareAI <span className="text-slate-500 font-light text-sm">| Remote Patient Monitor</span>
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Bell className="w-6 h-6 text-slate-400 cursor-pointer" />
            <span className="absolute -top-1 -right-1 bg-red-500 w-3 h-3 rounded-full border-2 border-slate-950"></span>
          </div>
          <div className="flex items-center gap-3 pl-4 border-l border-slate-800">
            <div className="text-right">
              <p className="text-sm font-medium">Dr. Sameer Khan</p>
              <p className="text-xs text-slate-500">Chief Cardiologist</p>
            </div>
            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
              <User size={20} />
            </div>
          </div>
        </div>
      </header>

      <main className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Left Column: Vitals Cards */}
        <div className="lg:col-span-1 space-y-6">
          <VitalCard icon={<Heart className="text-red-500"/>} label="Heart Rate" value="78" unit="BPM" status="Normal" color="border-red-500/20" />
          <VitalCard icon={<Activity className="text-blue-500"/>} label="Blood Pressure" value="120/80" unit="mmHg" status="Stable" color="border-blue-500/20" />
          <VitalCard icon={<Droplets className="text-cyan-500"/>} label="SpO2 Level" value="98" unit="%" status="Normal" color="border-cyan-500/20" />
          <VitalCard icon={<Thermometer className="text-orange-500"/>} label="Body Temp" value="36.6" unit="°C" status="Normal" color="border-orange-500/20" />
        </div>

        {/* Center Column: Graph & Prediction */}
        <div className="lg:col-span-3 space-y-6">
          
          {/* AI Alert Section */}
          {activeAlert && (
            <div className="bg-red-500/10 border border-red-500/50 p-4 rounded-2xl flex items-center justify-between animate-pulse">
              <div className="flex items-center gap-3 text-red-400">
                <AlertTriangle />
                <div>
                  <p className="font-bold">Critical Alert: Irregular Heart Rhythm</p>
                  <p className="text-sm">Patient ID #4402 detected abnormal spike 2 mins ago.</p>
                </div>
              </div>
              <button className="bg-red-500 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-red-600 transition">
                Intervene Now
              </button>
            </div>
          )}

          {/* Main Chart */}
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl h-[400px]">
            <h3 className="text-lg font-semibold mb-6">Real-time Vitals Stream (24h)</h3>
            <ResponsiveContainer width="100%" height="90%">
              <LineChart data={mockData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="time" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b' }} />
                <Line type="monotone" dataKey="heartRate" stroke="#ef4444" strokeWidth={3} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="bp" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* AI Insights Bar */}
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-gradient-to-br from-indigo-600/20 to-blue-600/20 border border-indigo-500/30 p-6 rounded-3xl">
              <h4 className="text-indigo-400 font-bold mb-2">AI Health Score</h4>
              <div className="text-4xl font-black">88/100</div>
              <p className="text-slate-400 text-sm mt-2 font-light italic">"Condition is improving. 5% lower risk than yesterday."</p>
            </div>
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl">
              <h4 className="text-slate-400 font-bold mb-2">Next Recommended Check</h4>
              <div className="text-xl font-semibold">Today, 04:30 PM</div>
              <p className="text-blue-400 text-sm mt-2 cursor-pointer hover:underline">Schedule Video Call →</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

// Reusable Component for Vitals
const VitalCard = ({ icon, label, value, unit, status, color }) => (
  <div className={`bg-slate-900 border ${color} p-5 rounded-3xl hover:scale-105 transition-transform cursor-pointer`}>
    <div className="flex justify-between items-start mb-4">
      <div className="p-2 bg-slate-800 rounded-xl">{icon}</div>
      <span className="text-[10px] uppercase tracking-wider font-bold text-green-400 bg-green-500/10 px-2 py-1 rounded-full">
        {status}
      </span>
    </div>
    <div>
      <p className="text-slate-400 text-sm">{label}</p>
      <h2 className="text-2xl font-bold">{value} <span className="text-sm font-light text-slate-500">{unit}</span></h2>
    </div>
  </div>
);

export default HealthDashboard;