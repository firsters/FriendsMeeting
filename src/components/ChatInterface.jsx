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
    <div className="flex flex-col h-full bg-slate-900 border-t border-white/5">
      {/* Message List */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-4"
        style={{ height: `${height - 80}px` }}
      >
        {messages.map((msg) => (
          <div key={msg.id} className={`flex flex-col ${msg.sender === 'Me' ? 'items-end' : 'items-start'}`}>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{msg.sender === 'Me' ? t('chat_me') : msg.sender}</span>
              <span className="text-[10px] text-slate-600">{msg.time}</span>
            </div>
            
            {msg.type === 'text' ? (
              <div className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm ${
                msg.sender === 'Me' 
                  ? 'bg-primary-600 text-white rounded-tr-none' 
                  : 'bg-slate-800 text-slate-200 rounded-tl-none'
              }`}>
                {msg.text}
              </div>
            ) : (
              <div 
                className="max-w-[80%] p-1 bg-slate-800 rounded-2xl overflow-hidden shadow-xl border border-white/5 cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => onImageClick(msg.imageUrl)}
              >
                <img src={msg.imageUrl} alt="chat" className="rounded-xl w-full h-auto object-cover aspect-video" />
              </div>
            )}
          </div>
        ))}
        
        {isUploading && (
          <div className="flex flex-col items-end">
            <div className="max-w-[80%] p-1 bg-slate-800/50 rounded-2xl overflow-hidden border border-white/5 animate-pulse flex items-center justify-center aspect-video w-full">
              <div className="flex flex-col items-center gap-2">
                <Loader2 size={24} className="text-primary-500 animate-spin" />
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{t('chat_uploading')}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 glass border-t border-white/10 shrink-0">
        <div className="flex items-center gap-2">
          <button 
            onClick={handleImageSelect}
            className="p-2 text-slate-400 hover:text-white transition-colors bg-slate-800 rounded-xl"
          >
            <Plus size={20} />
          </button>
          <div className="flex-1 relative">
            <input 
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder={t('chat_placeholder')}
              className="w-full bg-slate-800 border-none rounded-xl py-2.5 px-4 text-sm text-slate-200 outline-none focus:ring-2 focus:ring-primary-500/30 transition-all font-medium"
            />
            <button 
              onClick={handleImageSelect}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
            >
              <Camera size={18} />
            </button>
          </div>
          <button 
            onClick={handleSend}
            disabled={!inputText.trim()}
            className="p-2.5 bg-primary-600 text-white rounded-xl shadow-lg shadow-primary-900/40 disabled:opacity-50 disabled:grayscale transition-all active:scale-95"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
