import React, { useState, useEffect, useContext, useRef } from 'react';
import { Send, Phone, Video, MoreVertical, Paperclip, User } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

const DoctorConnect = () => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [assignedDoctor, setAssignedDoctor] = useState(null);
  const { user } = useContext(AuthContext);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    // Fetch assigned doctor (using first available doctor for prototype)
    const fetchDoctor = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/doctor/list');
        if (res.ok) {
          const doctors = await res.json();
          if (doctors.length > 0) {
            setAssignedDoctor(doctors[0]);
          }
        }
      } catch (err) {
        console.error('Error fetching doctors:', err);
      }
    };
    fetchDoctor();
  }, []);

  const fetchMessages = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/doctor/messages');
      if (res.ok) {
        const data = await res.json();
        // Only show messages where sender or receiver is the current patient
        const filteredMessages = data.filter(m => m.senderId === user?.id || m.receiverId === user?.id);
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
    setMessages(prev => [...prev, { ...newMessage, _id: Date.now().toString(), timestamp: new Date() }]);
    setMessage('');
    scrollToBottom();

    try {
      await fetch('http://localhost:5000/api/doctor/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newMessage)
      });
      fetchMessages();
    } catch (err) {
      console.error('Error sending message:', err);
    }
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      <div className="flex justify-between items-end mb-6 shrink-0">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Doctor Connect</h2>
          <p className="text-slate-500 dark:text-slate-400">Direct communication with your primary care physician.</p>
        </div>
      </div>

      <div className="flex-1 bg-white dark:bg-slate-900/40 border-slate-200 dark:border-slate-800/50 rounded-3xl overflow-hidden flex flex-col">
        {/* Chat Header */}
        <div className="h-16 border-b border-slate-800/50 dark:border-slate-800/50 light:border-slate-200 flex items-center justify-between px-6 bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center border border-primary/50">
              <User size={20} className="text-white" />
            </div>
            <div>
              <h3 className="font-bold text-slate-200 dark:text-slate-200 light:text-slate-800">{assignedDoctor ? assignedDoctor.name : 'Your Doctor'}</h3>
              <p className="text-xs text-green-400 font-medium">{assignedDoctor ? 'Online' : 'Connecting...'}</p>
            </div>
          </div>
          <div className="flex items-center gap-4 text-slate-400 dark:text-slate-400 light:text-slate-500">
            <button className="hover:text-primary transition-colors"><Phone size={20} /></button>
            <button className="hover:text-primary transition-colors"><Video size={20} /></button>
            <button className="hover:text-slate-200 dark:hover:text-slate-200 light:hover:text-slate-800 transition-colors"><MoreVertical size={20} /></button>
          </div>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.length === 0 ? (
            <div className="text-center text-slate-500 mt-10">Say hello to your doctor!</div>
          ) : (
            messages.map((msg, index) => {
              const isMine = msg.senderId === user?.id;
              
              return (
                <div key={msg._id || index} className={`flex items-start gap-3 max-w-[80%] ${isMine ? 'ml-auto flex-row-reverse' : ''}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${isMine ? 'bg-slate-700 dark:bg-slate-700 light:bg-slate-200' : 'bg-primary'}`}>
                    <User size={16} className={isMine ? 'text-slate-300 dark:text-slate-300 light:text-slate-600' : 'text-white'} />
                  </div>
                  <div className={`p-4 rounded-2xl text-sm ${
                    isMine 
                      ? 'bg-primary border border-primary/50 rounded-tr-sm text-white' 
                      : 'bg-slate-800 dark:bg-slate-800 light:bg-slate-100 border border-slate-700 dark:border-slate-700 light:border-slate-200 rounded-tl-sm text-slate-300 dark:text-slate-300 light:text-slate-700'
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
            <button type="button" className="absolute left-3 text-slate-400 dark:text-slate-400 light:text-slate-500 hover:text-slate-200 dark:hover:text-slate-200 light:hover:text-slate-700 transition-colors">
              <Paperclip size={20} />
            </button>
            <input 
              type="text" 
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message..." 
              className="w-full bg-slate-800/80 dark:bg-slate-800/80 light:bg-white border border-slate-700/50 dark:border-slate-700/50 light:border-slate-300 rounded-full py-3 pl-12 pr-14 text-sm text-slate-200 dark:text-slate-200 light:text-slate-800 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
            />
            <button type="submit" disabled={!message.trim() || !assignedDoctor} className="absolute right-2 bg-primary hover:bg-primary-hover disabled:opacity-50 text-white p-2 rounded-full transition-colors">
              <Send size={16} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DoctorConnect;
