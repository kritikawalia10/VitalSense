import React, { useState, useEffect, useContext, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, Heart, Thermometer, Droplets, AlertTriangle, TrendingUp, Clock, FileText, Plus, X, MessageCircle, User } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import AdmissionForm from '../components/AdmissionForm';
import { AuthContext } from '../context/AuthContext';

// Simulated Health Data for trends
const trendData = [
  { time: '08:00', hr: 72, bpSys: 118, bpDia: 78 },
  { time: '10:00', hr: 75, bpSys: 122, bpDia: 80 },
  { time: '12:00', hr: 85, bpSys: 138, bpDia: 88 }, // Spike
  { time: '14:00', hr: 98, bpSys: 145, bpDia: 92 }, // High alert
  { time: '16:00', hr: 82, bpSys: 125, bpDia: 82 },
  { time: '18:00', hr: 74, bpSys: 120, bpDia: 79 },
  { time: '20:00', hr: 70, bpSys: 118, bpDia: 76 },
];

const ProtocolModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative w-full max-w-lg glass-panel rounded-[2.5rem] p-6 md:p-8 overflow-hidden">
        <div className="absolute -inset-10 bg-[#4D6BFF]/10 blur-[80px] rounded-full z-0 pointer-events-none"></div>
        <div className="relative z-10 flex justify-between items-start mb-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-red-500/20 text-red-500 rounded-xl shadow-[0_0_15px_rgba(239,68,68,0.2)]">
              <AlertTriangle size={24} />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Clinical Protocol</h3>
              <p className="text-sm font-bold text-red-500 tracking-widest uppercase">High Blood Pressure</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-full transition-colors text-slate-500">
            <X size={20} />
          </button>
        </div>
        
        <div className="space-y-4 relative z-10 text-slate-700 dark:text-slate-300 font-medium">
          <div className="p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/10 shadow-sm">
            <h4 className="font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2 tracking-tight"><Activity size={18} className="text-[#4D6BFF]"/> Immediate Actions</h4>
            <ul className="list-decimal list-outside ml-4 space-y-2 text-sm leading-relaxed">
              <li>Instruct patient to sit and rest quietly for 5 minutes.</li>
              <li>Re-measure blood pressure to confirm reading.</li>
              <li>Assess for symptoms: severe headache, chest pain, or shortness of breath.</li>
            </ul>
          </div>
          <div className="p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/10 shadow-sm">
            <h4 className="font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2 tracking-tight"><FileText size={18} className="text-[#8BA8FF]"/> Medication Guidelines</h4>
            <ul className="list-decimal list-outside ml-4 space-y-2 text-sm leading-relaxed">
              <li>If BP remains &gt; 140/90 mmHg, review current antihypertensive medications.</li>
              <li>Consider administering PRN Nifedipine or Captopril per standing orders.</li>
              <li><strong className="text-red-500">Contact attending physician</strong> if systolic &gt; 180 mmHg or diastolic &gt; 120 mmHg.</li>
            </ul>
          </div>
        </div>
        
        <button onClick={onClose} className="w-full btn-primary mt-6 relative z-10">
          Acknowledge & Close
        </button>
      </div>
    </div>
  );
};

const VitalCard = ({ title, value, unit, icon, status, colorClass, borderClass, bgClass, glowClass }) => (
  <div className={`relative overflow-hidden rounded-[2rem] p-4 md:p-6 glass-panel transition-all duration-500 hover:scale-[1.02] hover:shadow-[0_20px_40px_-10px_rgba(0,0,0,0.1)] dark:hover:shadow-[0_20px_40px_-10px_rgba(0,0,0,0.4)] cursor-pointer group`}>
    <div className={`absolute -right-10 -top-10 w-24 h-24 rounded-full blur-3xl opacity-10 group-hover:opacity-20 transition-opacity ${glowClass}`}></div>
    <div className="flex justify-between items-start mb-4">
      <div className={`p-3 rounded-xl ${bgClass} border border-black/5 dark:border-white/5 shadow-inner`}>
        {React.cloneElement(icon, { size: 20 })}
      </div>
      <div className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${colorClass} shadow-sm`}>
        {status}
      </div>
    </div>
    <div className="relative z-10">
      <p className="text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1">{title}</p>
      <h3 className="text-2xl font-black text-slate-900 dark:text-white flex items-baseline gap-1 tracking-tight">
        {value} <span className="text-sm font-medium text-slate-400 dark:text-slate-500">{unit}</span>
      </h3>
    </div>
    <div className={`absolute bottom-0 left-0 w-full h-1 bg-current opacity-20 ${colorClass.split(' ')[0]}`}></div>
  </div>
);

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [showAlert, setShowAlert] = useState(true);
  const lastAlertLevel = useRef('');

  const [isAdmissionOpen, setIsAdmissionOpen] = useState(false);
  const [isProtocolModalOpen, setIsProtocolModalOpen] = useState(false);
  const [vitals, setVitals] = useState({
    bpSys: '--',
    bpDia: '--',
    hr: '--',
    spo2: '--',
    temp: '36.8'
  });
  const [activities, setActivities] = useState([]);
  const [dynamicTrendData, setDynamicTrendData] = useState([]);
  const [aiSummary, setAiSummary] = useState({
    bpStatus: "Stable",
    hrStatus: "Normal",
    bpTrend: "maintaining baseline",
    hrTrend: "stable"
  });

  const BASE_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:5000' 
    : 'https://vitalsense-jvbd.onrender.com';

  const [doctors, setDoctors] = useState([]);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const res = await fetch(`${BASE_URL}/api/doctor/list`);
        if (res.ok) {
          const data = await res.json();
          setDoctors(data);
        }
      } catch (err) {
        console.error('Error fetching doctors:', err);
      }
    };
    fetchDoctors();
  }, [BASE_URL]);

  useEffect(() => {
    const fetchVitals = async () => {
      if (!user) return;

      try {
        // 1. Try to fetch specific patient vitals first
        let latestData = null;
        
        if (user.patientId) {
          const res = await fetch(`${BASE_URL}/api/vitals/${user.patientId}`, {
            headers: { 'x-auth-token': user.token }
          });
          if (res.ok) {
            const data = await res.json();
            if (data.length > 0) {
              latestData = {
                bpSys: data[0].systolicBP,
                bpDia: data[0].diastolicBP,
                hr: data[0].heartRate,
                spo2: data[0].spo2
              };
            }
          }
        }

        // 2. Fallback to live simulation data if no patient vitals or to make it "live"
        // We always fetch simulation data to ensure the values are "changing" as requested
        const simRes = await fetch(`${BASE_URL}/api/health`, {
          headers: { 'x-auth-token': user.token }
        });
        
        if (simRes.ok) {
          const simData = await simRes.json();
          const newVitals = {
            bpSys: simData.bp || (latestData ? latestData.bpSys : 120),
            bpDia: Math.floor((simData.bp || 120) * 0.67) || (latestData ? latestData.bpDia : 80),
            hr: simData.heartRate || (latestData ? latestData.hr : 70),
            spo2: simData.oxygen || (latestData ? latestData.spo2 : 98),
            temp: (36.5 + Math.random() * 0.8).toFixed(1)
          };
          setVitals(newVitals);

          // Update trend data (keep last 10 points)
          setDynamicTrendData(prev => {
            const newData = [...prev, {
              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
              hr: newVitals.hr,
              bpSys: newVitals.bpSys
            }];
            return newData.slice(-10);
          });

          // Update AI Summary logic
          setAiSummary({
            bpStatus: newVitals.bpSys > 140 ? "High" : newVitals.bpSys > 120 ? "Elevated" : "Normal",
            hrStatus: newVitals.hr > 100 ? "Elevated" : "Normal",
            bpTrend: newVitals.bpSys > 135 ? "trending higher than baseline" : "within normal range",
            hrTrend: newVitals.hr > 90 ? "slightly elevated" : "optimal"
          });

          // Dynamic Alert logic
          const currentLevel = newVitals.bpSys > 140 ? 'danger' : newVitals.bpSys > 120 ? 'warning' : 'success';
          if (lastAlertLevel.current !== currentLevel) {
            setShowAlert(true);
            lastAlertLevel.current = currentLevel;
          }


        } else if (latestData) {
          setVitals({
            ...latestData,
            temp: (36.5 + Math.random() * 0.8).toFixed(1)
          });
        }
      } catch (err) {
        console.error('Error fetching vitals:', err);
      }
    };

    fetchVitals();
    const interval = setInterval(fetchVitals, 5000); // Poll every 5 seconds
    
    return () => clearInterval(interval);
  }, [user, BASE_URL]);

  useEffect(() => {
    const fetchActivities = async () => {
      if (!user) return;
      try {
        const res = await fetch(`${BASE_URL}/api/patient/my-alerts`, {
          headers: { 'x-auth-token': user.token }
        });
        if (res.ok) {
          const data = await res.json();
          setActivities(data.slice(0, 5).map(alert => ({
            time: new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            text: alert.message,
            type: alert.severity === 'Critical' ? 'alert' : 'log'
          })));
        }
      } catch (err) {
        console.error('Error fetching activities:', err);
      }
    };
    fetchActivities();
    const interval = setInterval(fetchActivities, 10000); // Update activities every 10s
    return () => clearInterval(interval);
  }, [user, BASE_URL]);

  // Custom Tooltip for the chart
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass-panel p-4 rounded-2xl shadow-2xl border border-white/20 dark:border-white/10">
          <p className="text-slate-500 dark:text-slate-300 font-bold mb-3 text-xs uppercase tracking-widest">{label}</p>
          {payload.map((entry, index) => (
            <div key={index} className="flex items-center gap-3 mb-2">
              <div className="w-3 h-3 rounded-full shadow-[0_0_10px_rgba(255,255,255,0.2)]" style={{ backgroundColor: entry.color }} />
              <span className="text-slate-500 dark:text-slate-400 text-xs font-medium">{entry.name}:</span>
              <span className="text-slate-900 dark:text-white font-black">{entry.value}</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${BASE_URL}/api/patient/reports`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token
        },
        body: JSON.stringify({ fileName: file.name, fileData: 'simulated_base64_data' })
      });

      if (res.ok) {
        alert('Report uploaded successfully!');
      } else {
        const errorData = await res.json().catch(() => ({}));
        alert(`Failed to upload report. Status: ${res.status}. Error: ${errorData.message || 'Unknown'}`);
      }
    } catch (err) {
      console.error('Error uploading file:', err);
      alert(`Error uploading file: ${err.message}`);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter mb-2">Patient Overview</h2>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#4D6BFF] animate-pulse"></div>
            <p className="text-slate-500 dark:text-slate-400 font-medium text-sm tracking-wide">Real-time monitoring and predictive insights.</p>
          </div>
        </div>
        <div className="flex flex-row gap-2 md:gap-4 w-full md:w-auto mt-4 md:mt-0">
          <label className="flex-1 md:flex-none cursor-pointer px-3 py-2 md:px-6 md:py-3 glass-pill hover:bg-slate-50 dark:hover:bg-white/5 text-[11px] md:text-sm font-bold text-slate-800 dark:text-white transition-all flex items-center justify-center gap-1.5 md:gap-2 group whitespace-nowrap">
            <FileText size={16} className="group-hover:text-[#4D6BFF] transition-colors md:w-[18px] md:h-[18px]" />
            Upload Report
            <input type="file" className="hidden" onChange={handleFileUpload} accept=".pdf,.doc,.docx,.jpg,.png" />
          </label>
          <button 
            onClick={() => setIsAdmissionOpen(true)}
            className="flex-1 md:flex-none btn-primary flex items-center justify-center gap-1.5 md:gap-2 whitespace-nowrap"
          >
            <Plus size={16} className="md:w-[18px] md:h-[18px]" />
            Admit Patient
          </button>
        </div>
      </div>

      <AdmissionForm isOpen={isAdmissionOpen} onClose={() => setIsAdmissionOpen(false)} />

      {/* Alert Section */}
      {(() => {
        const sys = parseInt(vitals.bpSys) || 120;
        const dia = parseInt(vitals.bpDia) || 80;
        const config = sys > 140 
          ? {
              color: 'red',
              title: 'High Blood Pressure Detected',
              message: `Patient's blood pressure spiked to `,
              suggestion: 'Immediate attention recommended.',
              icon: <AlertTriangle size={28} />,
              buttonClass: 'bg-white text-red-600 hover:bg-red-50 shadow-lg',
              sectionClass: 'bg-gradient-to-br from-red-600 to-red-500 text-white border-red-400/30',
              iconBg: 'bg-white/20 text-white',
              titleColor: 'text-white',
              textColor: 'text-red-50'
            }
          : sys > 120
            ? {
                color: 'amber',
                title: 'Elevated Blood Pressure',
                message: `Patient's blood pressure is elevated at `,
                suggestion: 'Continue monitoring and ensure rest.',
                icon: <Activity size={28} className="animate-pulse" />,
                buttonClass: 'bg-white text-amber-600 hover:bg-amber-50 shadow-lg',
                sectionClass: 'bg-gradient-to-br from-amber-500 to-amber-400 text-white border-amber-300/30',
                iconBg: 'bg-white/20 text-white',
                titleColor: 'text-white',
                textColor: 'text-amber-50'
              }
            : {
                color: 'emerald',
                title: 'Blood Pressure Normal',
                message: `Patient's blood pressure is stable at `,
                suggestion: 'Patient is healthy. Monitoring active.',
                icon: <TrendingUp size={28} />,
                buttonClass: 'bg-white text-emerald-600 hover:bg-emerald-50 shadow-lg',
                sectionClass: 'bg-gradient-to-br from-emerald-500 to-emerald-400 text-white border-emerald-300/30',
                iconBg: 'bg-white/20 text-white',
                titleColor: 'text-white',
                textColor: 'text-emerald-50'
              };

        return showAlert && (
          <div className="relative overflow-hidden group">
            <div className={`absolute inset-0 bg-white/5 blur-xl transition-colors`}></div>
            <div className={`relative ${config.sectionClass} border rounded-3xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 backdrop-blur-md shadow-2xl`}>
              <div className="flex items-start gap-6">
                <div className={`p-4 ${config.iconBg} rounded-2xl shadow-inner`}>
                  {config.icon}
                </div>
                <div>
                  <h4 className={`${config.titleColor} font-black text-xl tracking-tight`}>{config.title}</h4>
                  <p className={`${config.textColor} mt-2 max-w-2xl leading-relaxed font-medium`}>
                    {config.message} 
                    <span className="text-white font-black underline underline-offset-4 decoration-white/30">{sys}/{dia} mmHg</span>. 
                    {config.suggestion}
                  </p>
                </div>
              </div>
              <div className="flex flex-row gap-2 md:gap-4 w-full md:w-auto mt-4 md:mt-0">
                <button 
                  onClick={() => setShowAlert(false)}
                  className="flex-1 md:flex-none px-3 py-2 md:px-6 md:py-3 text-[11px] md:text-sm font-bold text-white/70 hover:text-white transition-colors whitespace-nowrap"
                >
                  Dismiss
                </button>
                <button 
                  onClick={() => setIsProtocolModalOpen(true)}
                  className={`flex-1 md:flex-none py-2 md:py-3 px-4 md:px-6 rounded-xl text-[11px] md:text-sm font-bold transition-all whitespace-nowrap ${config.buttonClass}`}
                >
                  Review Protocol
                </button>
              </div>
            </div>
          </div>
        );
      })()}



      {/* Protocol Modal */}
      <ProtocolModal isOpen={isProtocolModalOpen} onClose={() => setIsProtocolModalOpen(false)} />

      {/* Vitals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <VitalCard 
          title="Blood Pressure" 
          value={`${vitals.bpSys}/${vitals.bpDia}`} 
          unit="mmHg" 
          icon={<Activity className="text-[#4D6BFF]" size={24} />} 
          status={vitals.bpSys > 140 ? "High" : "Normal"} 
          colorClass="text-[#4D6BFF] border-[#4D6BFF]/30 bg-[#4D6BFF]/10"
          bgClass="bg-[#4D6BFF]/10"
          glowClass="bg-[#4D6BFF]"
        />
        <VitalCard 
          title="Heart Rate" 
          value={vitals.hr} 
          unit="bpm" 
          icon={<Heart className="text-[#8BA8FF]" size={24} />} 
          status={vitals.hr > 100 ? "Elevated" : "Normal"} 
          colorClass="text-[#8BA8FF] border-[#8BA8FF]/30 bg-[#8BA8FF]/10"
          bgClass="bg-[#8BA8FF]/10"
          glowClass="bg-[#8BA8FF]"
        />
        <VitalCard 
          title="Oxygen Level" 
          value={vitals.spo2} 
          unit="%" 
          icon={<Droplets className="text-blue-400" size={24} />} 
          status={vitals.spo2 < 95 ? "Low" : "Normal"} 
          colorClass="text-blue-400 border-blue-500/30 bg-blue-500/10"
          bgClass="bg-blue-500/10"
          glowClass="bg-blue-500"
        />
        <VitalCard 
          title="Body Temp" 
          value={vitals.temp} 
          unit="°C" 
          icon={<Thermometer className="text-slate-500 dark:text-slate-300" size={24} />} 
          status="Normal" 
          colorClass="text-slate-500 dark:text-slate-300 border-slate-300 dark:border-slate-600/30 bg-slate-100 dark:bg-white/5"
          bgClass="bg-slate-100 dark:bg-white/5"
          glowClass="bg-slate-400"
        />
      </div>

      {/* Charts & Summary Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Chart */}
        <div className="lg:col-span-2 glass-panel rounded-[2.5rem] p-8">
          <div className="flex justify-between items-center mb-10">
            <div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white">Vitals Trend</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Past 12 hours overview</p>
            </div>
            <div className="flex items-center gap-2 glass-panel px-4 py-2 rounded-xl">
              <Clock size={16} className="text-[#4D6BFF]" />
              <select className="bg-transparent text-slate-900 dark:text-white text-sm font-bold border-none outline-none cursor-pointer">
                <option className="bg-white dark:bg-[#151419]">Today</option>
                <option className="bg-white dark:bg-[#151419]">Yesterday</option>
              </select>
            </div>
          </div>
          <div className="h-[250px] md:h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dynamicTrendData.length > 0 ? dynamicTrendData : trendData} margin={{ top: 20, right: 10, left: -20, bottom: 5 }}>
                <defs>
                  <linearGradient id="colorSys" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4D6BFF" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#4D6BFF" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorHr" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8BA8FF" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#8BA8FF" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-slate-200 dark:text-slate-700" vertical={false} />
                <XAxis dataKey="time" stroke="currentColor" className="text-slate-400 dark:text-slate-500" axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 600 }} dy={10} />
                <YAxis stroke="currentColor" className="text-slate-400 dark:text-slate-500" axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 600 }} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="bpSys" name="Systolic BP" stroke="#4D6BFF" strokeWidth={3} fillOpacity={1} fill="url(#colorSys)" dot={{ r: 3, fill: '#4D6BFF', strokeWidth: 2, stroke: 'white' }} />
                <Area type="monotone" dataKey="hr" name="Heart Rate" stroke="#8BA8FF" strokeWidth={3} fillOpacity={1} fill="url(#colorHr)" dot={{ r: 3, fill: '#8BA8FF', strokeWidth: 2, stroke: 'white' }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Daily Summary & Activity */}
        <div className="space-y-8">
          <div className="bg-gradient-to-br from-[#4D6BFF]/10 dark:from-[#4D6BFF]/20 via-white dark:via-[#0F1223]/40 to-white dark:to-[#0F1223]/40 backdrop-blur-xl border border-black/5 dark:border-[#4D6BFF]/10 rounded-[2.5rem] p-8 relative overflow-hidden group">
            <div className="absolute -top-10 -right-10 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <TrendingUp size={200} />
            </div>
            <h3 className="text-xl font-black text-slate-900 dark:text-white mb-3 relative z-10">AI Summary</h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-6 relative z-10 leading-relaxed">Personalized health insights based on your recent vitals.</p>
            <div className="space-y-6 relative z-10">
              <div className="flex items-start gap-4 p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-[#4D6BFF]/10">
                <TrendingUp className="text-[#8BA8FF] mt-1 shrink-0" size={20} />
                <p className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed font-medium">Blood pressure is <span className="text-[#4D6BFF] font-bold">{aiSummary.bpStatus}</span> and {aiSummary.bpTrend}.</p>
              </div>
              <div className="flex items-start gap-4 p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-[#4D6BFF]/10">
                <Activity className="text-blue-500 dark:text-blue-400 mt-1 shrink-0" size={20} />
                <p className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed font-medium">Heart rate is {aiSummary.hrTrend}. Rest quality was optimal.</p>
              </div>
            </div>
          </div>

          <div className="glass-panel rounded-[2.5rem] p-8">
            <h3 className="text-xl font-black text-slate-900 dark:text-white mb-6">Activity</h3>
            <div className="space-y-6">
              {(activities.length > 0 ? activities : [
                { time: '14:00', text: 'Monitoring Active', type: 'log' },
                { time: '11:30', text: 'System Initialized', type: 'log' },
              ]).map((act, i) => (
                <div key={i} className="flex gap-4">
                  <div className="text-xs text-slate-400 dark:text-slate-500 font-black w-12 shrink-0 pt-1 uppercase tracking-tighter">{act.time}</div>
                  <div className="relative pb-2">
                    {i !== 2 && <div className="absolute top-6 left-[10px] w-[2px] h-full bg-slate-200 dark:bg-white/5"></div>}
                    <div className="flex gap-4 items-center">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 z-10 ${
                        act.type === 'alert' ? 'bg-[#4D6BFF]/20 text-[#4D6BFF]' :
                        act.type === 'med' ? 'bg-blue-500/20 text-blue-500 dark:text-blue-400' :
                        'bg-slate-200 dark:bg-white/10 text-slate-400'
                      }`}>
                        <div className="w-2 h-2 rounded-full bg-current"></div>
                      </div>
                      <p className="text-sm text-slate-700 dark:text-slate-200 font-bold tracking-tight">{act.text}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Medical Team Section */}
      <div className="glass-panel rounded-[2.5rem] p-8 mt-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white">Medical Team</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Available healthcare professionals</p>
          </div>
          <button onClick={() => navigate('/doctor-connect')} className="text-[#4D6BFF] font-bold text-sm hover:underline">View All</button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {doctors.length > 0 ? doctors.slice(0, 4).map((doc) => (
            <div key={doc._id} className="relative group p-6 rounded-[2rem] bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 hover:border-[#4D6BFF]/30 transition-all duration-300">
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#4D6BFF] to-[#8BA8FF] flex items-center justify-center mb-4 shadow-lg">
                  <User size={32} className="text-white" />
                </div>
                <h4 className="font-bold text-slate-900 dark:text-white mb-1">{doc.name}</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">Primary Physician</p>
                <button 
                  onClick={() => navigate(`/doctor-connect?id=${doc._id}`)}
                  className="w-full py-2.5 px-4 glass-pill text-[11px] font-black uppercase tracking-widest text-[#4D6BFF] hover:bg-[#4D6BFF] hover:text-white transition-all flex items-center justify-center gap-2"
                >
                  <MessageCircle size={14} />
                  Message
                </button>
              </div>
            </div>
          )) : (
            <div className="col-span-full text-center py-10 text-slate-500">Loading doctors...</div>
          )}
        </div>
      </div>
    </div>
  );
};


export default Dashboard;
