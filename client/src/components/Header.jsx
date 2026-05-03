import React, { useContext, useState, useEffect } from 'react';
import { Bell, User, Search, Menu } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { useLocation, useNavigate } from 'react-router-dom';

const Header = ({ setIsMobileMenuOpen }) => {
  const { user } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();

  const displayName = user?.name || 'Guest';
  const displayRole = user?.role === 'patient' 
    ? (user?.patientId || 'Patient')
    : 'Doctor';

  const [unseenCount, setUnseenCount] = useState(0);

  // Check for new messages
  useEffect(() => {
    if (!user) return;

    const checkMessages = async () => {
      try {
        const res = await fetch('https://vitalsense-jvbd.onrender.com/api/doctor/messages');
        if (res.ok) {
          const data = await res.json();
          // Filter messages for current user
          const myMessages = data.filter(m => m.receiverId === user.id || m.senderId === user.id);
          const currentCount = myMessages.length;
          
          // Use user-specific key for localStorage to avoid bugs when testing multiple accounts on the same browser
          const storageKey = `lastMessageCount_${user.id}`;
          const storedCount = parseInt(localStorage.getItem(storageKey) || '0', 10);

          // If we are currently on a messaging page, update the stored count
          if (location.pathname === '/messages' || location.pathname === '/doctor-connect') {
            localStorage.setItem(storageKey, currentCount.toString());
            setUnseenCount(0);
          } else if (currentCount > storedCount) {
            setUnseenCount(currentCount - storedCount);
          }
        }
      } catch (err) {
        console.error('Error fetching notifications:', err);
      }
    };

    checkMessages();
    const interval = setInterval(checkMessages, 5000);
    return () => clearInterval(interval);
  }, [user, location.pathname]);

  const handleNotificationClick = () => {
    setUnseenCount(0);
    if (user?.role === 'doctor') {
      navigate('/messages');
    } else {
      navigate('/doctor-connect');
    }
  };

  return (
    <header className="h-20 glass-nav flex items-center justify-between px-4 md:px-8 sticky top-0 z-10 transition-colors duration-300 gap-2 md:gap-4">
      <button 
        className="md:hidden p-2 text-slate-500 hover:text-slate-900 dark:hover:text-white"
        onClick={() => setIsMobileMenuOpen(true)}
      >
        <Menu size={24} />
      </button>

      {/* Search Bar */}
      <div className="flex-1 max-w-lg">
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 group-focus-within:text-[#4D6BFF] transition-colors" />
          <input 
            type="text" 
            placeholder="Search patient records, alerts..." 
            className="glass-input pl-12 rounded-full py-2.5 text-sm"
          />
        </div>
      </div>

      {/* User Actions */}
      <div className="flex items-center gap-2 md:gap-6">
        <button 
          onClick={handleNotificationClick}
          className={`relative p-2 transition-colors ${unseenCount > 0 ? 'text-[#4D6BFF]' : 'text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'}`}
        >
          <Bell size={20} />
          {unseenCount > 0 && (
            <span className="absolute top-0 right-0 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold text-white bg-red-500 rounded-full shadow-[0_0_8px_rgba(239,68,68,0.8)] animate-pulse">
              {unseenCount > 9 ? '9+' : unseenCount}
            </span>
          )}
        </button>

        <div className="flex items-center gap-3 pl-2 md:pl-6 border-l border-slate-200 dark:border-white/5">
          <div className="text-right hidden md:block">
            <p className="text-sm font-bold text-slate-800 dark:text-slate-100">{displayName}</p>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{displayRole}</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#4D6BFF] to-[#8BA8FF] p-[2px] cursor-pointer hover:scale-105 transition-transform shadow-lg shadow-[#4D6BFF]/10">
            <div className="w-full h-full bg-white dark:bg-[#0B1020] rounded-full flex items-center justify-center border border-white/10">
              <User size={18} className="text-[#4D6BFF]" />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
