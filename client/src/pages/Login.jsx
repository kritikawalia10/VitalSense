import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Activity, Mail, Lock, User, Hash } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

const Login = () => {
  const [activeTab, setActiveTab] = useState('patient'); // 'patient' or 'doctor'
  const [formData, setFormData] = useState({
    name: '',
    patientId: '',
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isWakingUp, setIsWakingUp] = useState(false);

  useEffect(() => {
    // Ping the server on mount to wake it up if it's on a free tier (Render cold start)
    const pingServer = async () => {
      try {
        await fetch('https://vitalsense-jvbd.onrender.com/api/health');
      } catch (err) {
        console.log('Server wake-up ping failed, but that is okay.');
      }
    };
    pingServer();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    // Start a timer to show "Waking up" message if it takes long
    const timer = setTimeout(() => {
      setIsWakingUp(true);
    }, 3000);

    try {
      const endpoint = 'https://vitalsense-jvbd.onrender.com/api/auth/login';
      const payload = activeTab === 'patient' 
        ? { name: formData.name, patientId: formData.patientId }
        : { email: formData.email, password: formData.password };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.msg || 'Login failed');
      }

      // Successful login
      const userData = {
        token: data.token,
        role: activeTab,
        name: activeTab === 'patient' ? data.patientName : (data.doctorName || 'Doctor'),
        patientId: data.patientId || '',
        id: data.id
      };

      login(userData);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      clearTimeout(timer);
      setLoading(false);
      setIsWakingUp(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md glass-panel rounded-3xl p-8 relative">
        <div className="absolute -inset-10 bg-[#4D6BFF]/10 blur-[80px] rounded-full z-0 pointer-events-none"></div>
        <div className="relative z-10 text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 border border-primary/20 mb-4">
            <Activity className="text-[#4D6BFF] animate-pulse" size={32} />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">Welcome Back</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2">Sign in to your VitalSense account</p>
        </div>

        {/* Tabs */}
        <div className="flex p-1 bg-slate-800/20 dark:bg-slate-800/50 backdrop-blur-md border border-white/10 rounded-xl mb-8 relative z-10">
          <button
            onClick={() => { setActiveTab('patient'); setError(''); }}
            className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all ${
              activeTab === 'patient' 
                ? 'bg-white dark:bg-[#4D6BFF] text-slate-900 dark:text-white shadow-lg' 
                : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            Patient Login
          </button>
          <button
            onClick={() => { setActiveTab('doctor'); setError(''); }}
            className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all ${
              activeTab === 'doctor' 
                ? 'bg-white dark:bg-[#4D6BFF] text-slate-900 dark:text-white shadow-lg' 
                : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            Doctor Login
          </button>
        </div>

        <div className="relative z-10">

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-600 dark:text-red-400 text-sm text-center">
            {error}
          </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {activeTab === 'patient' ? (
              <>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Full Name</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User size={18} className="text-slate-500" />
                    </div>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="glass-input pl-10"
                      placeholder="John Doe"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Patient ID</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Hash size={18} className="text-slate-500" />
                    </div>
                    <input
                      type="text"
                      name="patientId"
                      value={formData.patientId}
                      onChange={handleChange}
                      className="glass-input pl-10"
                      placeholder="123456"
                      required
                    />
                  </div>
                </div>
              </>
            ) : (
              <>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Email Address</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail size={18} className="text-slate-500" />
                    </div>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="glass-input pl-10"
                      placeholder="doctor@hospital.com"
                      required
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Password</label>
                    <Link to="/forgot-password" size="sm" className="text-xs text-[#4D6BFF] hover:text-[#8BA8FF] transition-colors font-medium">
                      Forgot password?
                    </Link>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock size={18} className="text-slate-500" />
                    </div>
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className="glass-input pl-10"
                      placeholder="••••••••"
                      required
                    />
                  </div>
                </div>
              </>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed mt-4 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  {isWakingUp ? 'Waking up server...' : 'Authenticating...'}
                </>
              ) : 'Sign In'}
            </button>
          </form>

          <p className="text-center text-slate-500 dark:text-slate-400 mt-8 text-sm">
            Don't have an account?{' '}
            <Link to="/register" className="text-[#4D6BFF] hover:text-[#8BA8FF] font-bold transition-colors">
              Register Now
            </Link>
          </p>
        </div>
        </div>
      </div>
  );
};

export default Login;
