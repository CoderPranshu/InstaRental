import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axios from '../api/axiosConfig';
import { toast } from 'react-toastify';
import { FiSend, FiArrowLeft, FiPackage } from 'react-icons/fi';

export default function ChatPage() {
  const { bookingId } = useParams();
  const { user } = useSelector((s) => s.auth);
  const [messages, setMessages] = useState([]);
  const [booking, setBooking] = useState(null);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);
  const intervalRef = useRef(null);

  useEffect(() => {
    loadData();
    // Poll every 5 seconds for new messages
    intervalRef.current = setInterval(loadMessages, 5000);
    return () => clearInterval(intervalRef.current);
  }, [bookingId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadData = async () => {
    try {
      const [msgRes, bookingRes] = await Promise.all([
        axios.get(`/messages/${bookingId}`),
        axios.get(`/bookings/my`),
      ]);
      setMessages(msgRes.data);
      const found = bookingRes.data.find((b) => b._id === bookingId);
      if (found) setBooking(found);
    } catch (err) {
      toast.error('Failed to load chat');
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async () => {
    try {
      const res = await axios.get(`/messages/${bookingId}`);
      setMessages(res.data);
    } catch {}
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    setSending(true);
    try {
      const res = await axios.post('/messages', { bookingId, text });
      setMessages((m) => [...m, res.data]);
      setText('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send');
    } finally {
      setSending(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 animate-fadeIn">
      {/* Header */}
      <div className="glass rounded-2xl p-4 mb-4 flex items-center gap-3">
        <Link to="/profile" className="text-slate-400 hover:text-blue-400 transition-colors">
          <FiArrowLeft size={20} />
        </Link>
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-orange-400 flex items-center justify-center">
          <FiPackage className="text-white" size={16} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-white font-semibold text-sm truncate">
            {booking?.product?.title || 'Chat'}
          </p>
          <p className="text-slate-400 text-xs">
            Booking #{bookingId.slice(-8).toUpperCase()} • {booking?.status}
          </p>
        </div>
        <div className="w-2 h-2 rounded-full bg-green-400 flex-shrink-0" title="Active" />
      </div>

      {/* Messages */}
      <div className="glass rounded-2xl p-4 mb-4 flex flex-col" style={{ height: '60vh', overflowY: 'auto' }}>
        {messages.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-500">
            <FiPackage size={40} className="mb-3 opacity-40" />
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          <div className="space-y-3 flex-1">
            {messages.map((msg, idx) => {
              const isMe = msg.sender._id === user?._id || msg.sender === user?._id;
              const showDate = idx === 0 || new Date(msg.createdAt).toDateString() !== new Date(messages[idx - 1].createdAt).toDateString();
              return (
                <div key={msg._id}>
                  {showDate && (
                    <div className="text-center my-3">
                      <span className="text-slate-500 text-xs bg-slate-800/60 px-3 py-1 rounded-full">
                        {new Date(msg.createdAt).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}
                      </span>
                    </div>
                  )}
                  <div className={`flex items-end gap-2 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                    {/* Avatar */}
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-orange-400 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                      {(msg.sender.name || 'U').charAt(0)}
                    </div>
                    {/* Bubble */}
                    <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm ${
                      isMe
                        ? 'bg-blue-600 text-white rounded-br-sm'
                        : 'bg-slate-700/80 text-slate-100 rounded-bl-sm'
                    }`}>
                      <p>{msg.text}</p>
                      <p className={`text-xs mt-1 ${isMe ? 'text-blue-200' : 'text-slate-500'}`}>
                        {new Date(msg.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                        {isMe && <span className="ml-1">{msg.read ? ' ✓✓' : ' ✓'}</span>}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="glass rounded-2xl p-3 flex gap-3 items-center">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 bg-transparent text-slate-100 placeholder-slate-400 outline-none text-sm"
        />
        <button
          type="submit"
          disabled={sending || !text.trim()}
          className="w-10 h-10 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center text-white transition-all"
        >
          {sending ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <FiSend size={16} />}
        </button>
      </form>
    </div>
  );
}
