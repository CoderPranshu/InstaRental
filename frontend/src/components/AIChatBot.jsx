import { useState, useRef, useEffect } from 'react';
import axios from '../api/axiosConfig';
import { FiMessageSquare, FiX, FiSend, FiPackage, FiCpu, FiUser } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

export default function AIChatBot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { from: 'bot', text: "Hi! I'm InstaBot, your rental assistant. Ask me about products, pricing, categories, or how to become a vendor on InstaRental." },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMsg = { from: 'user', text: input };
    setMessages((m) => [...m, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await axios.post('/ai/chat', { message: input });
      const { reply, suggestions } = res.data;
      setMessages((m) => [...m, { from: 'bot', text: reply, suggestions }]);
    } catch {
      setMessages((m) => [...m, { from: 'bot', text: "⚠️ Sorry, I'm having trouble right now. Please check if the Gemini API key is configured!" }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Toggle Button */}
      <div className="fixed bottom-6 right-6 z-[60] group">
        <motion.button
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          whileHover={{ scale: 1.08, rotate: 3 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setOpen(!open)}
          className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-600 via-violet-600 to-cyan-500 shadow-2xl shadow-indigo-600/35 flex items-center justify-center text-white border border-white/30"
        >
          <AnimatePresence mode="wait">
            {open ? (
              <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
                <FiX size={28} />
              </motion.div>
            ) : (
              <motion.div key="chat" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }}>
                <FiMessageSquare size={26} className="animate-pulse" />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>
        {!open && (
          <div className="pointer-events-none absolute right-0 -top-11 hidden sm:block opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-200">
            <div className="rounded-lg bg-white/95 dark:bg-slate-900/95 border border-slate-200 dark:border-slate-700 px-3 py-1.5 text-[11px] font-bold tracking-wide uppercase text-slate-700 dark:text-slate-200 shadow-lg whitespace-nowrap">
              Ask InstaBot
            </div>
          </div>
        )}
      </div>

      {/* Chat Window */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95, transformOrigin: 'bottom right' }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-24 right-4 sm:right-6 z-[60] w-[calc(100vw-2rem)] sm:w-[370px] md:w-[400px] h-[68vh] sm:h-[540px] max-h-[620px] flex flex-col rounded-[2rem] overflow-hidden border border-slate-200 dark:border-slate-700 shadow-[0_30px_70px_-20px_rgba(15,23,42,0.45)] bg-white dark:bg-slate-950"
          >
            {/* Header */}
            <div className="p-5 bg-gradient-to-r from-indigo-600 via-violet-600 to-cyan-500 border-b border-white/15 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-11 h-11 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg">
                    <FiPackage className="text-white text-xl" />
                  </div>
                  <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-400 border-2 border-indigo-700 rounded-full"></span>
                </div>
                <div>
                  <h3 className="text-white font-extrabold text-base tracking-tight">InstaBot Assistant</h3>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-widest text-white/90">AI Powered</span>
                    <span className="w-1 h-1 bg-white/50 rounded-full"></span>
                    <span className="text-[10px] font-semibold text-white/80">InstaRental Concierge</span>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setOpen(false)} 
                className="w-9 h-9 rounded-lg hover:bg-white/20 flex items-center justify-center text-white/80 hover:text-white transition-all"
              >
                <FiX size={20} />
              </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-5 space-y-5 custom-scrollbar bg-slate-50 dark:bg-slate-900/70">
              {messages.map((msg, i) => (
                <motion.div
                  initial={{ opacity: 0, y: 10, x: msg.from === 'user' ? 10 : -10 }}
                  animate={{ opacity: 1, y: 0, x: 0 }}
                  key={i}
                  className={`flex items-end gap-3 ${msg.from === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  <div className={`w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center ${
                    msg.from === 'user' ? 'bg-indigo-600' : 'bg-slate-800 dark:bg-slate-700'
                  }`}>
                    {msg.from === 'user' ? <FiUser className="text-white text-xs" /> : <FiCpu className="text-teal-400 text-xs" />}
                  </div>
                  
                  <div className={`max-w-[82%] rounded-2xl px-4 py-3.5 text-sm leading-relaxed shadow-sm ${
                    msg.from === 'user'
                      ? 'bg-indigo-600 text-white rounded-br-md'
                      : 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-white/5 rounded-bl-none shadow-xl'
                  }`}>
                    {msg.text}

                    {/* Suggestions Section */}
                    {msg.suggestions?.length > 0 && (
                      <div className="mt-5 space-y-3 pt-4 border-t border-slate-200/50 dark:border-white/10">
                        <p className="text-[10px] font-black uppercase text-indigo-500 dark:text-indigo-400 tracking-widest">Recommended Products</p>
                        <div className="grid grid-cols-1 gap-2">
                          {msg.suggestions.map((p) => (
                            <Link
                              to={`/products/${p._id}`}
                              key={p._id}
                              onClick={() => setOpen(false)}
                              className="flex items-center gap-3 bg-slate-50 dark:bg-white/5 hover:bg-indigo-50 dark:hover:bg-white/10 border border-slate-200 dark:border-white/5 rounded-xl p-2.5 transition-all group"
                            >
                              <img
                                src={p.images?.[0] || ''}
                                alt={p.title}
                                className="w-14 h-14 rounded-xl object-cover shadow-md group-hover:scale-105 transition-transform"
                              />
                              <div className="flex-1 min-w-0">
                                <p className="text-slate-900 dark:text-white text-xs font-black truncate">{p.title}</p>
                                <div className="flex items-center justify-between mt-1">
                                  <p className="text-indigo-600 dark:text-indigo-400 text-[11px] font-bold">₹{p.pricePerDay}<span className="text-slate-400 font-normal">/day</span></p>
                                  <span className="text-[9px] font-bold text-slate-500 uppercase tracking-tighter">View</span>
                                </div>
                              </div>
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
              {loading && (
                <div className="flex justify-start items-end gap-3">
                  <div className="w-8 h-8 rounded-xl bg-slate-800 flex items-center justify-center">
                    <FiCpu className="text-teal-400 text-xs animate-spin" />
                  </div>
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-[1.5rem] rounded-bl-none px-6 py-4 flex gap-1.5 items-center shadow-xl">
                    <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                    <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                    <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce"></div>
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-white/10">
              <div className="relative flex items-center gap-3">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder="Ask me anything about rentals..."
                  className="w-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3.5 pr-16 text-sm text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-all"
                />
                <button
                  onClick={sendMessage}
                  disabled={!input.trim() || loading}
                  className="absolute right-1.5 w-11 h-11 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 dark:disabled:bg-slate-800 disabled:opacity-50 flex items-center justify-center text-white shadow-lg shadow-indigo-600/20 transition-all active:scale-95"
                >
                  <FiSend size={18} />
                </button>
              </div>
              <p className="text-[10px] text-center text-slate-500 mt-3 font-semibold uppercase tracking-[0.15em]">Always here to help</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style dangerouslySetInnerHTML={{
        __html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(79, 70, 229, 0.25);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(79, 70, 229, 0.4);
        }
      `}} />
    </>
  );
}


