import React, { useState, useEffect, useContext, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Send, Phone, Video, MoreVertical, Paperclip, User, Search, MessageCircle } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

const DoctorConnect = () => {
  const [searchParams] = useSearchParams();
  const doctorIdFromUrl = searchParams.get('id');
  
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [assignedDoctor, setAssignedDoctor] = useState(null);
  const [doctorList, setDoctorList] = useState([]);
  const { user } = useContext(AuthContext);
  const messagesEndRef = useRef(null);
  const prevMessagesCountRef = useRef(0);
  const notificationSound = useRef(new Audio('https://assets.mixkit.co/active_storage/sfx/2354/2354-preview.mp3'));

  useEffect(() => {
    if (messages.length > prevMessagesCountRef.current) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.senderId !== user?.id) {
        notificationSound.current.play().catch(e => console.log('Audio play blocked until user interaction'));
      }
    }
    prevMessagesCountRef.current = messages.length;
  }, [messages, user?.id]);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const res = await fetch('https://vitalsense-jvbd.onrender.com/api/doctor/list');
        if (res.ok) {
          const doctors = await res.json();
          setDoctorList(doctors);
          
          if (doctorIdFromUrl) {
            const selected = doctors.find(d => d._id === doctorIdFromUrl);
            if (selected) {
              setAssignedDoctor(selected);
            }
          }
          // Note: We removed the auto-select of doctors[0] to allow showing the "Select a Doctor" state first
        }
      } catch (err) {
        console.error('Error fetching doctors:', err);
      }
    };
    fetchDoctors();
  }, [doctorIdFromUrl]);

  const fetchMessages = async () => {
    try {
      const res = await fetch('https://vitalsense-jvbd.onrender.com/api/doctor/messages');
      if (res.ok) {
        const data = await res.json();
        // Only show messages where sender or receiver is the current patient AND the other party is the assigned doctor
        const filteredMessages = data.filter(m => 
          (m.senderId === user?.id && m.receiverId === assignedDoctor?._id) || 
          (m.receiverId === user?.id && m.senderId === assignedDoctor?._id)
        );
        setMessages(filteredMessages);
      }
    } catch (err) {
      console.error('Error fetching messages:', err);
    }
  };

  useEffect(() => {
    fetchMessages();
    // Simple polling for new messages every 5 seconds
    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim() || !assignedDoctor) return;

    if (!user?.id || user.id === 'anonymous') {
      alert("Your session is outdated. Please click Logout in the sidebar and log back in to send messages.");
      return;
    }

    const newMessage = {
      content: message,
      senderId: user.id,
      receiverId: assignedDoctor._id
    };

    // Optimistic UI update
    const tempId = Date.now().toString();
    const optimisticMsg = { ...newMessage, _id: tempId, timestamp: new Date() };
    setMessages(prev => [...prev, optimisticMsg]);
    setMessage('');
    scrollToBottom();

    try {
      const res = await fetch('https://vitalsense-jvbd.onrender.com/api/doctor/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newMessage)
      });
      if (res.ok) {
        await fetchMessages();
      }
    } catch (err) {
      console.error('Error sending message:', err);
      // Remove optimistic message on error
      setMessages(prev => prev.filter(m => m._id !== tempId));
    }
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex flex-col h-[calc(100vh-10rem)] max-w-6xl mx-auto w-full">
      <div className="flex justify-between items-end mb-4 shrink-0 px-2">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Doctor Connect</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Direct communication with your healthcare professionals.</p>
        </div>
      </div>

      <div className="flex-1 glass-panel rounded-[1.5rem] overflow-hidden flex flex-col md:flex-row shadow-2xl border-white/5">
        
        {/* Sidebar - Doctor List */}
        <div className="w-full md:w-64 border-b md:border-b-0 md:border-r border-slate-200 dark:border-white/5 flex flex-col bg-slate-50/50 dark:bg-white/2">
          <div className="p-4 border-b border-slate-200 dark:border-white/5">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
              <input 
                type="text" 
                placeholder="Search doctors..." 
                className="w-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#4D6BFF]/50 transition-all"
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {doctorList.map(doc => (
              <button
                key={doc._id}
                onClick={() => setAssignedDoctor(doc)}
                className={`w-full p-4 flex items-center gap-3 transition-all ${
                  assignedDoctor?._id === doc._id 
                    ? 'bg-[#4D6BFF]/10 border-r-4 border-[#4D6BFF]' 
                    : 'hover:bg-slate-100 dark:hover:bg-white/5 border-r-4 border-transparent'
                }`}
              >
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#4D6BFF] to-[#8BA8FF] flex items-center justify-center shadow-md shrink-0">
                  <User size={20} className="text-white" />
                </div>
                <div className="text-left overflow-hidden">
                  <h4 className="font-bold text-slate-900 dark:text-white truncate">{doc.name}</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Specialist</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col min-w-0 bg-white/20 dark:bg-black/5">
          {assignedDoctor ? (
            <>
              {/* Chat Header */}
              <div className="h-14 border-b border-slate-200 dark:border-white/5 flex items-center justify-between px-6 bg-white dark:bg-[#0F1223]/80 shrink-0">
                <div className="flex items-center gap-3">
                  <div>
                    <h3 className="text-sm font-black text-slate-900 dark:text-white leading-tight">{assignedDoctor.name}</h3>
                    <p className="text-[9px] text-green-500 font-black uppercase tracking-widest">Online</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-slate-400">
                  <button className="p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-full transition-all"><Phone size={16} /></button>
                  <button className="p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-full transition-all"><Video size={16} /></button>
                </div>
              </div>

              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-slate-500 opacity-40 p-10 text-center">
                    <MessageCircle size={32} className="mb-3" />
                    <p className="font-bold text-[11px] uppercase tracking-wider">No conversation history yet</p>
                  </div>
                ) : (
                  messages.map((msg, index) => {
                    const isMine = msg.senderId === user?.id;
                    
                    return (
                      <div key={msg._id || index} className={`flex items-start gap-3 max-w-[90%] ${isMine ? 'ml-auto flex-row-reverse' : ''}`}>
                        <div className={`p-3 rounded-2xl text-[11px] shadow-sm ${
                          isMine 
                            ? 'bg-gradient-to-br from-[#4D6BFF] to-[#8BA8FF] text-white rounded-tr-none' 
                            : 'bg-white dark:bg-white/10 border border-slate-100 dark:border-white/5 text-slate-700 dark:text-slate-200 rounded-tl-none'
                        }`}>
                          <p className="leading-relaxed font-medium">{msg.content}</p>
                          <span className={`text-[8px] mt-1.5 block font-bold uppercase tracking-tighter ${isMine ? 'text-white/70' : 'text-slate-400'}`}>
                            {formatTime(msg.timestamp || new Date())}
                          </span>
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
                  <button type="button" className="absolute left-4 text-slate-400 hover:text-[#4D6BFF] transition-colors">
                    <Paperclip size={18} />
                  </button>
                  <input 
                    type="text" 
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder={`Message ${assignedDoctor.name}...`} 
                    className="w-full bg-slate-100 dark:bg-white/5 border border-transparent focus:border-[#4D6BFF]/30 rounded-xl py-3.5 pl-12 pr-14 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-4 focus:ring-[#4D6BFF]/10 transition-all"
                  />
                  <button 
                    type="submit" 
                    disabled={!message.trim()} 
                    className="absolute right-2 bg-[#4D6BFF] hover:bg-[#8BA8FF] disabled:opacity-50 text-white p-2.5 rounded-lg shadow-lg transition-all active:scale-95"
                  >
                    <Send size={16} />
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-500 opacity-40 p-10 text-center">
              <User size={48} className="mb-4" />
              <h3 className="text-sm font-black uppercase tracking-widest text-slate-900 dark:text-white mb-2">Select a Specialist</h3>
              <p className="text-xs max-w-xs mx-auto">Please choose a doctor from the sidebar to view your conversation or start a new message.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DoctorConnect;
