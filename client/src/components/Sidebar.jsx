import React, { useContext } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Activity, AlertTriangle, MessageSquare, MapPin, Settings, LogOut } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

const Sidebar = ({ isMobileMenuOpen, setIsMobileMenuOpen }) => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const patientMenuItems = [
    { name: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/dashboard' },
    { name: 'Analytics', icon: <Activity size={20} />, path: '/analytics' },
    { name: 'Alerts', icon: <AlertTriangle size={20} />, path: '/alerts' },
    { name: 'Doctor Connect', icon: <MessageSquare size={20} />, path: '/doctor-connect' },
    { name: 'Nearby Hospitals', icon: <MapPin size={20} />, path: '/hospitals' },
  ];

  const doctorMenuItems = [
    { name: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/dashboard' },
    { name: 'Messages', icon: <MessageSquare size={20} />, path: '/messages' },
    { name: 'Alerts', icon: <AlertTriangle size={20} />, path: '/alerts' },
  ];

  const menuItems = user?.role === 'doctor' ? doctorMenuItems : patientMenuItems;

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      <aside className={`w-64 h-screen glass-panel border-r border-slate-200 dark:border-white/5 flex flex-col fixed left-0 top-0 transition-transform duration-300 z-50 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
      {/* Logo Area */}
      <div className="h-20 flex items-center px-6 border-b border-slate-200 dark:border-white/5">
        <Activity className="text-[#4D6BFF] mr-3 animate-pulse" size={28} />
        <h1 className="text-2xl font-bold text-gradient">
          VitalSense
        </h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-6 px-4 space-y-2 overflow-y-auto">
        {menuItems.map((item, index) => (
          <NavLink
            key={index}
            to={item.path}
            end={item.path === '/dashboard'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-300 ${
                isActive
                  ? 'bg-gradient-to-r from-[#4D6BFF] to-[#8BA8FF] text-white shadow-[0_10px_20px_rgba(77,107,255,0.2)] scale-[1.02]'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-slate-100'
              }`
            }
          >
            {item.icon}
            <span className="font-bold tracking-tight">{item.name}</span>
          </NavLink>
        ))}
      </nav>

      {/* Bottom Area */}
      <div className="p-4 border-t border-slate-200 dark:border-white/5 space-y-2">
        <NavLink 
          to="/settings"
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-3 w-full rounded-xl transition-all ${
              isActive
                ? 'bg-[#4D6BFF]/10 text-[#4D6BFF] border border-[#4D6BFF]/20'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-slate-100'
            }`
          }
        >
          <Settings size={20} />
          <span className="font-medium">Settings</span>
        </NavLink>
        
        <button 
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-red-500/80 hover:bg-red-500/10 hover:text-red-500 transition-all"
        >
          <LogOut size={20} />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </aside>
    </>
  );
};

export default Sidebar;
