import React, { useState, useEffect, useContext, useRef } from 'react';
import { Send, User, Search, MessageCircle } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

const DoctorMessages = () => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [patients, setPatients] = useState([]);
  const [activePatient, setActivePatient] = useState(null);
  const { user } = useContext(AuthContext);
  const messagesEndRef = useRef(null);
  const prevMessagesCountRef = useRef(0);
  const notificationSound = useRef(new Audio('https://assets.mixkit.co/active_storage/sfx/2354/2354-preview.mp3'));

  useEffect(() => {
    if (messages.length > prevMessagesCountRef.current) {
      const lastMessage = messages[messages.length - 1];
      // Only play sound if the message is from a patient and it's not the one we are currently chatting with
      if (lastMessage && lastMessage.senderId !== user?.id) {
        if (!activePatient || lastMessage.senderId !== activePatient.userId._id) {
          notificationSound.current.play().catch(e => console.log('Audio play blocked until user interaction'));
        }
      }
    }
    prevMessagesCountRef.current = messages.length;
  }, [messages, user?.id, activePatient]);

  const fetchData = async () => {
    try {
      const headers = { 'x-auth-token': user.token };
      
      const patRes = await fetch('https://vitalsense-jvbd.onrender.com/api/doctor/patients', { headers });
      const patData = patRes.ok ? await patRes.json() : [];
      setPatients(patData);

      const msgRes = await fetch('https://vitalsense-jvbd.onrender.com/api/doctor/messages', { headers });
      const msgData = msgRes.ok ? await msgRes.json() : [];
      setMessages(msgData);

    } catch (err) {
      console.error('Error fetching data:', err);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(() => {
      fetch('https://vitalsense-jvbd.onrender.com/api/doctor/messages', {
        headers: { 'x-auth-token': user.token }
      }).then(res => res.json()).then(data => setMessages(data));
    }, 5000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, activePatient]);

  const markAsRead = async (patientId) => {
    try {
      await fetch(`https://vitalsense-jvbd.onrender.com/api/doctor/messages/read/${patientId}`, {
        method: 'PUT',
        headers: { 'x-auth-token': user.token }
      });
      // Refresh messages after marking as read
      fetchData();
    } catch (err) {
      console.error('Error marking as read:', err);
    }
  };

  useEffect(() => {
    if (activePatient) {
      markAsRead(activePatient.userId._id);
    }
  }, [activePatient]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim() || !activePatient) return;

    const newMessage = {
      content: message,
      senderId: user.id,
      receiverId: activePatient.userId._id
    };

    setMessages(prev => [...prev, { ...newMessage, _id: Date.now().toString(), timestamp: new Date() }]);
    setMessage('');
    scrollToBottom();

    try {
      await fetch('https://vitalsense-jvbd.onrender.com/api/doctor/messages', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-auth-token': user.token
        },
        body: JSON.stringify(newMessage)
      });
      // Fetch fresh messages
      const msgRes = await fetch('https://vitalsense-jvbd.onrender.com/api/doctor/messages', { headers: { 'x-auth-token': user.token } });
      if (msgRes.ok) {
        setMessages(await msgRes.json());
      }
    } catch (err) {
      console.error('Error sending message:', err);
    }
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Filter messages for the active patient
  const chatMessages = activePatient ? messages.filter(m => 
    m.senderId === activePatient.userId._id || m.receiverId === activePatient.userId._id ||
    (m.senderId === user.id && m.receiverId === activePatient.userId._id) ||
    (m.receiverId === user.id && m.senderId === activePatient.userId._id)
  ) : [];

  const getUnreadCount = (patientUserId) => {
    if (!patientUserId) return 0;
    const patientIdStr = patientUserId.toString();
    return messages.filter(m => 
      m.senderId.toString() === patientIdStr && m.receiverId.toString() === user.id.toString() && !m.read
    ).length;
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      <div className="flex justify-between items-end mb-6 shrink-0">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">Patient Messages</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Manage all your patient communications.</p>
        </div>
      </div>

      <div className="flex-1 glass-panel rounded-[1.5rem] overflow-hidden flex flex-col md:flex-row shadow-2xl border-white/5">
        
        {/* Patient List Sidebar */}
        <div className="w-full md:w-72 border-b md:border-b-0 md:border-r border-slate-200 dark:border-white/5 flex flex-col bg-slate-50/50 dark:bg-white/2">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800/50">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
              <input 
                type="text" 
                placeholder="Search patients..." 
                className="w-full bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 rounded-full py-2 pl-9 pr-4 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all placeholder:text-slate-500"
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {patients.map(patient => (
              <button
                key={patient._id}
                onClick={() => setActivePatient(patient)}
                className={`w-full text-left p-3 border-b border-slate-200 dark:border-slate-800/50 transition-colors flex items-center gap-3 hover:bg-slate-100 dark:hover:bg-slate-800/30 ${
                  activePatient?._id === patient._id ? 'bg-slate-200 dark:bg-slate-800/50 border-l-4 border-l-primary' : 'border-l-4 border-l-transparent'
                }`}
              >
                <div className="w-9 h-9 bg-primary/20 rounded-full flex items-center justify-center shrink-0">
                  <User size={16} className="text-primary" />
                </div>
                <div className="overflow-hidden flex-1">
                  <h4 className="text-slate-800 dark:text-slate-200 font-semibold text-sm truncate">{patient.name}</h4>
                  <p className="text-slate-500 dark:text-slate-500 light:text-slate-500 text-xs mt-0.5">{patient.patientId}</p>
                </div>
                {getUnreadCount(patient.userId._id) > 0 && (
                  <div className="bg-primary text-white text-[10px] font-black min-w-[18px] h-[18px] px-1 rounded-full flex items-center justify-center shadow-[0_2px_8px_rgba(77,107,255,0.4)]">
                    {getUnreadCount(patient.userId._id)}
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col min-w-0 bg-white/20 dark:bg-black/5">
          {activePatient ? (
            <>
              {/* Chat Header */}
              <div className="h-14 border-b border-slate-200 dark:border-white/5 flex items-center justify-between px-6 bg-white dark:bg-[#0F1223]/80 shrink-0">
                <div className="flex items-center gap-3">
                  <div>
                    <h3 className="text-sm font-black text-slate-800 dark:text-white leading-tight">{activePatient.name}</h3>
                    <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Patient ID: {activePatient.patientId}</p>
                  </div>
                </div>
              </div>

              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {chatMessages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-slate-500 opacity-40 p-10 text-center">
                    <MessageCircle size={32} className="mb-3" />
                    <p className="font-bold text-[11px] uppercase tracking-wider">No messages yet. Send a message to {activePatient.name}.</p>
                  </div>
                ) : (
                  chatMessages.map((msg, index) => {
                    const isMine = msg.senderId === user?.id;
                    
                    return (
                      <div key={msg._id || index} className={`flex items-start gap-2 max-w-[90%] ${isMine ? 'ml-auto flex-row-reverse' : ''}`}>
                        <div className={`py-1.5 px-3 rounded-2xl text-[10.5px] shadow-sm ${
                          isMine 
                            ? 'bg-gradient-to-br from-[#4D6BFF] to-[#8BA8FF] text-white rounded-tr-none' 
                            : 'bg-white dark:bg-white/10 border border-slate-100 dark:border-white/5 text-slate-700 dark:text-slate-200 rounded-tl-none'
                        }`}>
                          <p className="leading-tight font-medium">{msg.content}</p>
                          <div className={`text-[7.5px] mt-1 font-bold uppercase tracking-tighter text-right ${isMine ? 'text-white/70' : 'text-slate-400'}`}>
                            {formatTime(msg.timestamp || new Date())}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <form onSubmit={handleSendMessage} className="p-3 bg-white dark:bg-[#0F1223]/80 border-t border-slate-200 dark:border-white/5 shrink-0">
                <div className="relative flex items-center">
                  <input 
                    type="text" 
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder={`Message ${activePatient.name}...`} 
                    className="w-full bg-slate-100 dark:bg-white/5 border border-transparent focus:border-[#4D6BFF]/30 rounded-xl py-3.5 pl-6 pr-14 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-4 focus:ring-[#4D6BFF]/10 transition-all"
                  />
                  <button type="submit" disabled={!message.trim()} className="absolute right-2 bg-[#4D6BFF] hover:bg-[#8BA8FF] disabled:opacity-50 text-white p-2.5 rounded-lg shadow-lg transition-all active:scale-95">
                    <Send size={16} />
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-500 opacity-40 p-10 text-center">
              <User size={48} className="mb-4" />
              <h3 className="text-sm font-black uppercase tracking-widest text-slate-900 dark:text-white mb-2">Select a Patient</h3>
              <p className="text-xs max-w-xs mx-auto">Choose a patient from the sidebar to view their message history and send new messages.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DoctorMessages;
