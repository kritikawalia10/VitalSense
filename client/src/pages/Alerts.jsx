import React, { useState, useEffect, useContext } from 'react';
import { AlertTriangle, Clock, Filter, AlertCircle, Info, Activity } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

const Alerts = () => {
  const { user } = useContext(AuthContext);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const endpoint = user.role === 'doctor' 
          ? 'http://localhost:5000/api/doctor/alerts' 
          : 'http://localhost:5000/api/patient/my-alerts';
        
        const response = await fetch(endpoint, {
          headers: {
            'x-auth-token': user.token
          }
        });

        if (response.ok) {
          const data = await response.json();
          setAlerts(data);
        }
      } catch (error) {
        console.error('Error fetching alerts:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user?.token) {
      fetchAlerts();
    }
  }, [user]);

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    
    const diffInDays = Math.floor(diffInSeconds / 86400);
    if (diffInDays < 7) return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    
    return date.toLocaleDateString();
  };

  const getAlertStyle = (severity) => {
    const s = severity?.toLowerCase();
    if (s === 'critical' || s === 'high') return { icon: <AlertTriangle size={20} />, colorClass: 'bg-red-500/10 border-red-500/30 text-red-500' };
    if (s === 'warning') return { icon: <AlertCircle size={20} />, colorClass: 'bg-orange-500/10 border-orange-500/30 text-orange-500' };
    return { icon: <Info size={20} />, colorClass: 'bg-blue-500/10 border-blue-500/30 text-blue-500' };
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <Activity className="animate-spin text-primary" size={32} />
        <p className="text-slate-400">Fetching latest alerts...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8">
        <div>
          <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter mb-2">System Alerts</h2>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#4D6BFF] animate-pulse"></div>
            <p className="text-slate-500 dark:text-slate-400 font-medium text-sm tracking-wide">Review real-time AI-detected health risks and notifications.</p>
          </div>
        </div>
        <button className="flex items-center gap-2 glass-panel border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/5 transition-all rounded-xl px-6 py-3 text-sm font-bold text-slate-900 dark:text-white shadow-xl">
          <Filter size={18} />
          Filter
        </button>
      </div>

      <div className="space-y-4">
        {alerts.length === 0 ? (
          <div className="text-center p-10 md:p-20 glass-panel rounded-[2.5rem] border-slate-200 dark:border-white/5">
            <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-400 dark:text-slate-600">
              <Activity size={40} />
            </div>
            <p className="text-slate-600 dark:text-slate-400 font-bold text-lg">No active alerts at this time.</p>
            <p className="text-slate-400 dark:text-slate-600 text-sm mt-2">The AI module is monitoring all vitals normally.</p>
          </div>
        ) : (
          alerts.map((alert) => {
            const { icon, colorClass } = getAlertStyle(alert.severity);
            return (
              <div key={alert._id} className="glass-panel border-slate-200 dark:border-white/5 rounded-[2rem] p-6 hover:bg-slate-50 dark:hover:bg-white/5 transition-all cursor-pointer flex flex-col md:flex-row items-start gap-4 md:gap-6 group">
                <div className={`p-4 rounded-2xl border ${colorClass} shadow-lg transition-transform group-hover:scale-110 shrink-0`}>
                  {icon}
                </div>
                <div className="flex-1 w-full mt-2 md:mt-0">
                  <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-2 mb-2">
                    <h4 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">{alert.message}</h4>
                    <div className="flex items-center gap-2 text-slate-500 text-xs font-bold uppercase tracking-widest bg-slate-100 dark:bg-white/5 px-3 py-1.5 rounded-lg w-fit">
                      <Clock size={12} />
                      <span>{formatTime(alert.time || alert.createdAt)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 mt-4">
                    <span className={`inline-block px-3 py-1 rounded-lg text-[10px] uppercase font-black tracking-widest border ${colorClass}`}>
                      {alert.severity}
                    </span>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-black uppercase tracking-widest">
                      AI Generated
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};



export default Alerts;

