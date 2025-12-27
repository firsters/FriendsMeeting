import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
    <div className="flex flex-col h-full bg-[#F5F5F5] font-sans">
      {/* Message List */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar"
        style={{ height: `${height - 80}px` }}
      >
        {messages.map((msg) => (
          <div key={msg.id} className={`flex flex-col ${msg.sender === 'Me' ? 'items-end' : 'items-start'}`}>
            {/* Sender & Time - Caption style */}
            <div className={`flex items-baseline gap-2 mb-1 ${msg.sender === 'Me' ? 'flex-row-reverse' : 'flex-row'}`}>
              <span className="text-[12px] font-bold text-[#212121]">{msg.sender === 'Me' ? t('chat_me') : msg.sender}</span>
              <span className="text-[10px] text-[#757575] font-medium">{msg.time}</span>
            </div>
            
            {msg.type === 'text' ? (
              <div className={`max-w-[85%] px-3 py-2 text-[14px] leading-[1.5] shadow-sm tracking-tight ${
                msg.sender === 'Me' 
                  ? 'bg-[#E3F2FD] text-[#212121] rounded-[16px_16px_0px_16px]' 
                  : 'bg-white text-[#212121] rounded-[16px_16px_16px_0px] border border-[#E0E0E0]'
              }`}>
                {msg.text}
              </div>
            ) : (
              <div 
                className="max-w-[75%] p-1 bg-white rounded-[12px] overflow-hidden shadow-md border border-[#E0E0E0] cursor-pointer hover:opacity-95 transition-all active:scale-[0.98]"
                onClick={() => onImageClick(msg.imageUrl)}
              >
                <div className="relative aspect-video w-full rounded-[8px] overflow-hidden bg-[#E0E0E0]">
                  <img src={msg.imageUrl} alt="chat" className="w-full h-full object-cover" />
                </div>
              </div>
            )}
          </div>
        ))}
        
        {isUploading && (
          <div className="flex flex-col items-end">
            <div className="max-w-[75%] p-1 bg-white rounded-[12px] overflow-hidden border border-[#E0E0E0] animate-pulse aspect-video w-full flex items-center justify-center">
              <span className="material-symbols-outlined text-[#4285F4] animate-spin">sync</span>
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-3 bg-white border-t border-[#E0E0E0] shrink-0">
        <div className="flex items-center gap-2">
          <button 
            onClick={handleImageSelect}
            className="p-2 text-[#757575] hover:text-[#4285F4] transition-colors"
          >
            <span className="material-symbols-outlined">add_circle</span>
          </button>
          <div className="flex-1 relative">
            <input 
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder={t('chat_placeholder')}
              className="w-full bg-[#F5F5F5] border border-[#E0E0E0] rounded-xl py-2 px-4 text-[14px] text-[#212121] outline-none focus:ring-1 focus:ring-[#4285F4] transition-all placeholder:text-[#BDBDBD]"
            />
            <button 
              onClick={handleImageSelect}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#757575] hover:text-[#4285F4]"
            >
              <span className="material-symbols-outlined text-[20px]">photo_camera</span>
            </button>
          </div>
          <button 
            onClick={handleSend}
            disabled={!inputText.trim()}
            className="p-2.5 bg-[#4285F4] text-white rounded-full shadow-md disabled:opacity-40 transition-all active:scale-90"
          >
            <span className="material-symbols-outlined text-[20px]">send</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
