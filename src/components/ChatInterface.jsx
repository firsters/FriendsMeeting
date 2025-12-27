import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Camera, Plus, GripHorizontal, Image as ImageIcon, Loader2 } from 'lucide-react';
import { Input, Button } from '../components/UI';
import { useTranslation } from '../context/LanguageContext';

const ChatInterface = ({ height, onImageClick }) => {
  const { t } = useTranslation();
  const [messages, setMessages] = useState([
    { id: '1', sender: 'Alex', text: t('chat_msg_1'), type: 'text', time: '14:20' },
    { id: '2', sender: 'Me', text: t('chat_msg_2'), type: 'text', time: '14:21' },
    { id: '3', sender: 'Sam', type: 'image', imageUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&q=80', time: '14:22' },
    { id: '4', sender: 'Sam', text: t('chat_msg_3'), type: 'text', time: '14:22' },
  ]);
  const [inputText, setInputText] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, height]);

  const handleSend = () => {
    if (!inputText.trim()) return;
    setMessages([...messages, {
      id: Date.now().toString(),
      sender: 'Me',
      text: inputText,
      type: 'text',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }]);
    setInputText('');
  };

  const handleImageSelect = () => {
    setIsUploading(true);
    // Simulate compression and upload
    setTimeout(() => {
      setMessages([...messages, {
        id: Date.now().toString(),
        sender: 'Me',
        type: 'image',
        imageUrl: 'https://images.unsplash.com/photo-1543007630-9710e4a00a20?w=400&q=80',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
      setIsUploading(false);
    }, 2000);
  };

  return (
    <div className="flex flex-col h-full bg-[#0b0f17]">
      {/* Message List */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-3 no-scrollbar"
        style={{ height: `${height - 80}px` }}
      >
        {messages.map((msg) => (
          <div key={msg.id} className={`flex flex-col ${msg.sender === 'Me' ? 'items-end' : 'items-start'}`}>
            <div className={`flex items-center gap-1.5 mb-0.5 ${msg.sender === 'Me' ? 'flex-row-reverse' : 'flex-row'}`}>
              <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">{msg.sender === 'Me' ? t('chat_me') : msg.sender}</span>
              <span className="text-[9px] text-slate-700 font-medium">{msg.time}</span>
            </div>
            
            {msg.type === 'text' ? (
              <div className={`max-w-[85%] px-3 py-1.5 rounded-2xl text-[13px] leading-relaxed shadow-sm ${
                msg.sender === 'Me' 
                  ? 'bg-blue-600 text-white rounded-tr-none' 
                  : 'bg-[#1e293b] text-slate-200 rounded-tl-none border border-white/5'
              }`}>
                {msg.text}
              </div>
            ) : (
              <div 
                className="max-w-[70%] p-0.5 bg-[#1e293b] rounded-2xl overflow-hidden shadow-2xl border border-white/10 cursor-pointer hover:opacity-95 transition-all active:scale-[0.98]"
                onClick={() => onImageClick(msg.imageUrl)}
              >
                <div className="relative aspect-video w-full rounded-[14px] overflow-hidden">
                  <img src={msg.imageUrl} alt="chat" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
                </div>
              </div>
            )}
          </div>
        ))}
        
        {isUploading && (
          <div className="flex flex-col items-end">
            <div className="max-w-[70%] p-0.5 bg-[#1e293b]/50 rounded-2xl overflow-hidden border border-white/5 animate-pulse flex items-center justify-center aspect-video w-full">
              <div className="flex flex-col items-center gap-2">
                <Loader2 size={20} className="text-blue-500 animate-spin" />
                <span className="text-[9px] text-slate-500 font-black uppercase tracking-[0.2em]">{t('chat_uploading')}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-3 bg-[#0b0f17] border-t border-white/5 shrink-0">
        <div className="flex items-center gap-2">
          <button 
            onClick={handleImageSelect}
            className="p-2.5 text-slate-500 hover:text-white transition-colors bg-[#1e293b] rounded-xl active:scale-90"
          >
            <Plus size={20} />
          </button>
          <div className="flex-1 relative">
            <input 
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder={t('chat_placeholder')}
              className="w-full bg-[#1e293b] border-none rounded-xl py-2.5 px-4 text-[13px] text-slate-200 outline-none focus:ring-1 focus:ring-blue-500/50 transition-all font-medium placeholder:text-slate-600"
            />
            <button 
              onClick={handleImageSelect}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-600 hover:text-white transition-colors"
            >
              <Camera size={18} />
            </button>
          </div>
          <button 
            onClick={handleSend}
            disabled={!inputText.trim()}
            className="p-2.5 bg-blue-600 text-white rounded-xl shadow-lg shadow-blue-900/20 disabled:opacity-40 disabled:grayscale transition-all active:scale-90"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
