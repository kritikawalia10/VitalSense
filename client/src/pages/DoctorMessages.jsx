import React, { useState, useEffect, useContext, useRef } from 'react';
import { Send, User, Search } from 'lucide-react';
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
      if (lastMessage && lastMessage.senderId !== user?.id) {
        notificationSound.current.play().catch(e => console.log('Audio play blocked until user interaction'));
      }
    }
    prevMessagesCountRef.current = messages.length;
  }, [messages, user?.id]);

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

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      <div className="flex justify-between items-end mb-6 shrink-0">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">Patient Messages</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Manage all your patient communications.</p>
        </div>
      </div>

      <div className="flex-1 bg-white dark:bg-slate-900/40 border-slate-200 dark:border-slate-800/50">
        
        {/* Patient List Sidebar */}
        <div className="w-full md:w-80 border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-800/50 flex flex-col bg-slate-50 dark:bg-slate-900/60">
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
                className={`w-full text-left p-4 border-b border-slate-200 dark:border-slate-800/50 transition-colors flex items-center gap-3 hover:bg-slate-100 dark:hover:bg-slate-800/30 ${
                  activePatient?._id === patient._id ? 'bg-slate-200 dark:bg-slate-800/50 border-l-4 border-l-primary' : 'border-l-4 border-l-transparent'
                }`}
              >
                <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center shrink-0">
                  <User size={18} className="text-primary" />
                </div>
                <div className="overflow-hidden">
                  <h4 className="text-slate-800 dark:text-slate-200 font-semibold text-sm truncate">{patient.name}</h4>
                  <p className="text-slate-500 dark:text-slate-500 light:text-slate-500 text-xs mt-0.5">{patient.patientId}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col h-full min-h-[400px]">
          {activePatient ? (
            <>
              {/* Chat Header */}
              <div className="h-16 border-b border-slate-800/50 dark:border-slate-800/50 light:border-slate-200 flex items-center justify-between px-6 bg-slate-900/40 dark:bg-slate-900/40 light:bg-white shrink-0">
                <div className="flex items-center gap-3">
                  <div>
                    <h3 className="font-bold text-slate-800 dark:text-slate-200">{activePatient.name}</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-500 light:text-slate-500">Patient ID: {activePatient.patientId}</p>
                  </div>
                </div>
              </div>

              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {chatMessages.length === 0 ? (
                  <div className="text-center text-slate-500 mt-10">No messages yet. Send a message to {activePatient.name}.</div>
                ) : (
                  chatMessages.map((msg, index) => {
                    const isMine = msg.senderId === user?.id;
                    
                    return (
                      <div key={msg._id || index} className={`flex items-start gap-3 max-w-[80%] ${isMine ? 'ml-auto flex-row-reverse' : ''}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${isMine ? 'bg-primary' : 'bg-slate-700 dark:bg-slate-700 light:bg-slate-200'}`}>
                          <User size={16} className={isMine ? 'text-white' : 'text-slate-300 dark:text-slate-300 light:text-slate-600'} />
                        </div>
                        <div className={`p-4 rounded-2xl text-sm ${
                          isMine 
                            ? 'bg-primary border border-primary/50 rounded-tr-sm text-white' 
                            : 'bg-slate-800 dark:bg-slate-800 light:bg-slate-100 border border-slate-700 dark:border-slate-700 light:border-slate-200 rounded-tl-sm text-slate-700 dark:text-slate-300'
                        }`}>
                          <p>{msg.content}</p>
                          <span className={`text-[10px] mt-2 block ${isMine ? 'text-blue-200' : 'text-slate-500 dark:text-slate-500 light:text-slate-400'}`}>
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
              <form onSubmit={handleSendMessage} className="p-4 bg-slate-900/60 dark:bg-slate-900/60 light:bg-slate-50 border-t border-slate-800/50 dark:border-slate-800/50 light:border-slate-200 shrink-0">
                <div className="relative flex items-center">
                  <input 
                    type="text" 
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Type your message..." 
                    className="w-full bg-slate-800/80 dark:bg-slate-800/80 light:bg-white border border-slate-700/50 dark:border-slate-700/50 light:border-slate-300 rounded-full py-3 pl-6 pr-14 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                  />
                  <button type="submit" disabled={!message.trim()} className="absolute right-2 bg-primary hover:bg-primary-hover disabled:opacity-50 text-white p-2 rounded-full transition-colors">
                    <Send size={16} />
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-500 dark:text-slate-500 light:text-slate-400 p-6 text-center">
              <div className="w-16 h-16 bg-slate-800/50 dark:bg-slate-800/50 light:bg-slate-200 rounded-full flex items-center justify-center mb-4">
                <User size={32} />
              </div>
              <h3 className="text-xl font-medium text-slate-300 dark:text-slate-300 light:text-slate-600 mb-2">Select a Patient</h3>
              <p>Choose a patient from the sidebar to view their message history and send new messages.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DoctorMessages;
