import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Users, AlertTriangle, Activity, Search } from 'lucide-react';

const DoctorDashboard = () => {
  const { user } = useContext(AuthContext);
  const [patients, setPatients] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedPatientForReports, setSelectedPatientForReports] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const headers = { 'x-auth-token': user.token };
        
        // Fetch Patients
        const patRes = await fetch('http://localhost:5000/api/doctor/patients', { headers });
        const patData = patRes.ok ? await patRes.json() : [];
        
        // Fetch Alerts
        const alertRes = await fetch('http://localhost:5000/api/doctor/alerts', { headers });
        const alertData = alertRes.ok ? await alertRes.json() : [];

        setPatients(patData);
        setAlerts(alertData);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    if (user?.token) {
      fetchDashboardData();
    }
  }, [user]);

  if (loading) {
    return <div className="flex items-center justify-center h-full"><Activity className="animate-spin text-primary" size={32} /></div>;
  }

  return (
    <div className="space-y-6 relative">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">Doctor Dashboard</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Welcome, Dr. {user?.name}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-900/40 border-slate-200 dark:border-slate-800/50 rounded-3xl p-6">
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center border border-blue-500/20">
              <Users size={24} className="text-blue-400" />
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Patients</p>
            <h3 className="text-3xl font-bold text-slate-800 dark:text-slate-100 mt-1">{patients.length}</h3>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900/40 border-slate-200 dark:border-slate-800/50 rounded-3xl p-6">
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 bg-red-500/10 rounded-2xl flex items-center justify-center border border-red-500/20">
              <AlertTriangle size={24} className="text-red-400" />
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Critical Alerts</p>
            <h3 className="text-3xl font-bold text-slate-800 dark:text-slate-100 mt-1">{alerts.filter(a => a.severity === 'critical').length}</h3>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900/40 border-slate-200 dark:border-slate-800/50 rounded-3xl p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">Your Patients</h3>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500" size={16} />
            <input 
              type="text" 
              placeholder="Search patients..." 
              className="bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 rounded-full py-2 pl-10 pr-4 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:border-primary"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600 dark:text-slate-400">
            <thead className="text-xs uppercase bg-slate-100 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300 rounded-lg">
              <tr>
                <th className="px-6 py-3 rounded-l-lg">Patient ID</th>
                <th className="px-6 py-3">Name</th>
                <th className="px-6 py-3">Age</th>
                <th className="px-6 py-3">Gender</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3 rounded-r-lg text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {patients.length === 0 ? (
                <tr><td colSpan="6" className="px-6 py-4 text-center">No patients found.</td></tr>
              ) : patients.map((patient) => (
                <tr key={patient._id} className="border-b border-slate-200 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-800 dark:text-slate-200">{patient.patientId || patient._id.slice(-6)}</td>
                  <td className="px-6 py-4">{patient.name}</td>
                  <td className="px-6 py-4">{patient.age}</td>
                  <td className="px-6 py-4">{patient.gender}</td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 text-xs font-medium bg-green-500/10 text-green-400 border border-green-500/20 rounded-full">Stable</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => setSelectedPatientForReports(patient)}
                      className="px-3 py-1.5 bg-primary/10 hover:bg-primary/20 text-primary text-xs font-medium rounded border border-primary/20 transition-colors"
                    >
                      View Reports
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Reports Modal */}
      {selectedPatientForReports && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-slate-100">Reports for {selectedPatientForReports.name}</h3>
              <button 
                onClick={() => setSelectedPatientForReports(null)}
                className="text-slate-400 hover:text-slate-200 transition-colors text-2xl leading-none"
              >
                &times;
              </button>
            </div>
            
            {(!selectedPatientForReports.reports || selectedPatientForReports.reports.length === 0) ? (
              <div className="text-center p-8 bg-slate-800/30 rounded-xl border border-slate-800/50">
                <p className="text-slate-400">No reports uploaded for this patient yet.</p>
              </div>
            ) : (
              <ul className="space-y-3">
                {selectedPatientForReports.reports.map((r, i) => (
                  <li key={i} className="flex justify-between items-center p-4 bg-slate-800/50 border border-slate-700/50 rounded-xl hover:bg-slate-800/80 transition-colors cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary/20 text-primary rounded-lg flex items-center justify-center">📄</div>
                      <div>
                        <p className="text-slate-200 font-medium">{r.fileName}</p>
                        <p className="text-xs text-slate-500">{new Date(r.uploadDate).toLocaleString()}</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => {
                        const element = document.createElement("a");
                        const file = new Blob([`Simulated report content for ${r.fileName}\n\nPatient ID: ${selectedPatientForReports.patientId}\nDate: ${new Date(r.uploadDate).toLocaleString()}`], {type: 'text/plain'});
                        element.href = URL.createObjectURL(file);
                        element.download = r.fileName.endsWith('.txt') ? r.fileName : `${r.fileName}.txt`;
                        document.body.appendChild(element);
                        element.click();
                        document.body.removeChild(element);
                      }}
                      className="text-primary text-sm font-medium hover:underline"
                    >
                      Download
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorDashboard;
