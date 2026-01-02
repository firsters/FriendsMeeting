import React, { useState, useRef, useEffect } from 'react';
import { useFriends } from '../context/FriendsContext';
import { auth } from '../firebase';
import { useTranslation } from '../context/LanguageContext';

const GroupChat = ({ onBack, meetingTitle, meetingLocation }) => {
  const { messages, sendMessage, friends, lastSeenId, setLastSeenId } = useFriends();
  const { t } = useTranslation();
  const [inputText, setInputText] = useState('');
  const scrollRef = useRef(null);

  useEffect(() => {
    // Mark the last message currently in the list as "seen" before this session
    if (messages.length > 0 && lastSeenId === null) {
      setLastSeenId(messages[messages.length - 1].id);
    }
  }, [messages, lastSeenId, setLastSeenId]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = () => {
    if (inputText.trim()) {
      sendMessage(inputText);
      setInputText('');
    }
  };

  const getFriendInfo = (senderId) => {
    const currentUserId = auth.currentUser?.uid;
    if (senderId === currentUserId || senderId === 'me') return { color: 'bg-primary', avatar: 'ME' };
    const friend = friends.find(f => f.id === senderId);
    return friend ? { color: 'bg-gray-600', avatar: friend.avatar || friend.name.charAt(0) } : { color: 'bg-gray-500', avatar: '?' };
  };

  return (
    <div className="flex flex-col h-full bg-background-dark animate-fade-in font-sans">
      {/* Header */}
      <header className="px-4 py-4 border-b border-white/5 flex items-center gap-4 sticky top-0 bg-background-dark/90 backdrop-blur-md z-10">
        {onBack && (
          <button onClick={onBack} className="p-2 -ml-2 rounded-full hover:bg-white/5 transition-colors text-white">
            <span className="material-symbols-outlined">arrow_back_ios_new</span>
          </button>
        )}
        <div className="flex-1">
          <h2 className="text-lg font-extrabold text-white font-display truncate leading-tight">{meetingLocation || meetingTitle || t('nav_meetings')}</h2>
          <div className="flex items-center gap-1.5 opacity-60">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
            <span className="text-[10px] font-bold text-white uppercase tracking-widest">{friends.length + 1} {t('meeting_active_members')}</span>
          </div>
        </div>
        <button className="p-2 rounded-full hover:bg-white/5 transition-colors text-white">
          <span className="material-symbols-outlined">more_vert</span>
        </button>
      </header>

      {/* Message List */}
      <main 
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4 py-6 space-y-6 scrollbar-hide bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')]"
      >
        <div className="text-center mb-8">
          <span className="px-4 py-1.5 bg-white/5 rounded-full text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">
            {t('meeting_live_now')}
          </span>
        </div>

        {messages.map((msg, index) => {
          const currentUserId = auth.currentUser?.uid;
          const isMe = msg.senderId === currentUserId || msg.senderId === 'me';
          const info = getFriendInfo(msg.senderId);
          
          // Check if we should insert the "New Message" line
          const isFirstNewMessage = lastSeenId !== null && 
                                   index > 0 && 
                                   messages[index-1].id === lastSeenId;

          return (
            <React.Fragment key={msg.id}>
              {isFirstNewMessage && (
                <div className="flex items-center gap-4 py-4 px-2">
                  <div className="h-px flex-1 bg-primary/30"></div>
                  <span className="text-[10px] font-bold text-primary uppercase tracking-widest whitespace-nowrap">
                    {t('chat_new_messages') || '여기까지 읽으셨습니다'}
                  </span>
                  <div className="h-px flex-1 bg-primary/30"></div>
                </div>
              )}
              <div className={`flex items-end gap-2 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                {!isMe && (
                  <div className={`w-8 h-8 rounded-full ${info.color} flex items-center justify-center text-[10px] font-bold text-white shrink-0 border border-white/10`}>
                    {info.avatar}
                  </div>
                )}
                <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                  {!isMe && <span className="text-[10px] font-bold text-gray-500 mb-1 ml-1">{msg.senderName}</span>}
                  <div className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm font-medium leading-relaxed
                    ${isMe ? 'bg-primary text-white rounded-tr-none shadow-lg shadow-primary/20' : 'bg-card-dark text-gray-200 rounded-tl-none border border-white/5'}
                  `}>
                    {msg.content}
                  </div>
                </div>
                <span className="text-[8px] font-bold text-gray-600 uppercase mb-1">
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
                </span>
              </div>
            </React.Fragment>
          );
        })}
      </main>

      {/* Input Area */}
      <div className="p-4 bg-background-dark/95 backdrop-blur-xl border-t border-white/5 safe-area-bottom">
        <div className="flex items-center gap-2 bg-card-dark rounded-2xl px-2 py-2 border border-white/5 focus-within:border-primary/50 transition-all">
          <button className="p-2 text-gray-500 hover:text-white transition-colors">
            <span className="material-symbols-outlined">add_circle</span>
          </button>
          <input 
            type="text" 
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder={t('chat_placeholder')} 
            className="flex-1 bg-transparent border-none outline-none text-white text-sm py-2 placeholder:text-gray-700"
          />
          <button className="p-2 text-gray-500 hover:text-white transition-colors">
            <span className="material-symbols-outlined">sentiment_satisfied</span>
          </button>
          <button 
            onClick={handleSend}
            disabled={!inputText.trim()}
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all
              ${inputText.trim() ? 'bg-primary text-white shadow-lg shadow-primary/30' : 'bg-white/5 text-gray-700'}
            `}
          >
            <span className="material-symbols-outlined">send</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default GroupChat;
