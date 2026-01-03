import React, { useState, useRef, useEffect } from 'react';
import { useFriends } from '../context/FriendsContext';
import { auth } from '../firebase';
import { useTranslation } from '../context/LanguageContext';

const GroupChat = ({ onBack, meetingTitle, meetingLocation }) => {
  const { 
    messages, 
    sendMessage, 
    friends, 
    activeMeetingId,
    serverLastReadId,
    markMeetingAsRead,
    isReadStatusLoaded
  } = useFriends();
  const { t } = useTranslation();
  const [inputText, setInputText] = useState('');
  const scrollRef = useRef(null);
  const [frozenLastReadId, setFrozenLastReadId] = useState(null);
  const [hasFrozen, setHasFrozen] = useState(false);

  // 1. FREEZE the read state ONLY ONCE when mounting (or when serverId becomes available for the first time)
  // This ensures the "unread line" stays fixed for the session
  useEffect(() => {
    // If we haven't frozen yet, and we are connected to a meeting, AND the read status is loaded
    if (!hasFrozen && activeMeetingId && isReadStatusLoaded) {
      // We accept null as a valid state (meaning "read nothing")
      console.log(`[GroupChat] Freezing last read ID: ${serverLastReadId}`);
      setFrozenLastReadId(serverLastReadId);
      setHasFrozen(true);
    }
  }, [activeMeetingId, serverLastReadId, hasFrozen, isReadStatusLoaded]);

  // 2. UPDATE SERVER: Whenever messages change (meaning we see new ones), or on unmount
  useEffect(() => {
    if (messages.length > 0 && activeMeetingId) {
      const latestMsg = messages[messages.length - 1];
      // Only update if it's different/newer (logic handled by backend typically, but good to be explicit)
      // We blindly update to latest because "we are in the chat"
      // Use a timeout to avoid spamming if messages flood in? No, standard debounce or just update is fine.
      // Actually, updating on every message receive is fine for "I am reading now"
      markMeetingAsRead(latestMsg.id);
    }

    return () => {
      // Also update on unmount to be safe (e.g. if we leave the screen)
      if (messages.length > 0) {
        markMeetingAsRead(messages[messages.length - 1].id);
      }
    };
  }, [messages, activeMeetingId]);

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

  const getFriendInfo = (senderId, senderName) => {
    const currentUserId = auth.currentUser?.uid;
    if (senderId === currentUserId || senderId === 'me') return { color: 'bg-primary', avatar: 'ME' };
    const friend = friends.find(f => f.id === senderId);
    if (friend) return { color: 'bg-gray-600', avatar: friend.avatar || friend.name.charAt(0) };
    
    // Fallback for non-friend participants using their senderName
    const initials = (senderName || '?').charAt(0).toUpperCase();
    return { color: 'bg-gray-500', avatar: initials };
  };

  return (
    <div className="flex flex-col h-full bg-background-dark animate-fade-in font-sans">
      {/* Header */}
      <header className="px-4 py-4 border-b border-white/5 flex items-center gap-4 sticky top-0 bg-background-dark/90 backdrop-blur-md z-10">
        <div className="flex-1">
          <h2 className="text-lg font-extrabold text-white font-display truncate leading-tight">
            {meetingLocation || meetingTitle || t('nav_meetings')}
            <span className="text-[10px] ml-2 font-normal text-primary">({messages.length})</span>
          </h2>
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

        {(() => {
          let markerShown = false;
          // Find the index of the frozen message
          const frozenIndex = frozenLastReadId ? messages.findIndex(m => m.id === frozenLastReadId) : -1;

          return messages.map((msg, index) => {
            const currentUserId = auth.currentUser?.uid;
            const isMe = msg.senderId === currentUserId || msg.senderId === 'me';
            const info = getFriendInfo(msg.senderId, msg.senderName);
            
            // Divider Logic:
            // Show divider if:
            // 1. We haven't shown it yet
            // 2. We have a frozen read point (frozenLastReadId)
            // 3. This message is AFTER the frozen read point (index > frozenIndex)
            //    OR frozenIndex is -1 (we read nothing/invalid ID) and this is the start?
            //    (If frozenLastReadId is null, it means we read nothing. So divider should be at top?
            //     Or does null mean "new user"? Let's assume null = read nothing = show divider at top)
            //    Actually, if frozenLastReadId is null, we show divider before the first message (index 0).
            
            let shouldShowMarker = false;

            if (!markerShown) {
               if (frozenLastReadId === null && index === 0) {
                 shouldShowMarker = true;
               } else if (frozenIndex !== -1 && index === frozenIndex + 1) {
                 shouldShowMarker = true;
               }
            }

            // Only show marker if we have messages and it's not the very end (though logical to show at end? no, separator is 'unread' start)
            if (shouldShowMarker) {
                markerShown = true;
            }

            if (msg.type === 'system') {
              return (
                <React.Fragment key={msg.id}>
                  {shouldShowMarker && (
                    <div className="flex items-center gap-4 py-4 px-2">
                      <div className="h-px flex-1 bg-primary/30"></div>
                      <span className="text-[10px] font-bold text-primary uppercase tracking-widest whitespace-nowrap">
                        {t('chat_new_messages') || '여기까지 읽으셨습니다'}
                      </span>
                      <div className="h-px flex-1 bg-primary/30"></div>
                    </div>
                  )}
                  <div className="flex justify-center my-4">
                    <span className="bg-white/5 text-gray-400 text-[10px] px-3 py-1 rounded-full font-bold uppercase tracking-wider">
                      {msg.content}
                    </span>
                  </div>
                </React.Fragment>
              );
            }

            return (
              <React.Fragment key={msg.id}>
                {shouldShowMarker && (
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
                    {!isMe && (
                      <span className="text-xs font-bold text-gray-400 mb-1 ml-1 tracking-tight">
                        {msg.senderName}
                      </span>
                    )}
                    <div className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm font-medium leading-relaxed relative
                      ${isMe ? 'bg-primary text-white rounded-tr-none shadow-lg shadow-primary/20' : 'bg-card-dark text-gray-200 rounded-tl-none border border-white/5'}
                      ${msg.status === 'sending' ? 'opacity-70 animate-pulse' : ''}
                      ${msg.status === 'error' ? 'bg-red-500/50 border-red-500 shadow-none' : ''}
                    `}>
                      {msg.content}
                      {msg.status === 'error' && (
                        <span className="absolute -bottom-5 right-0 text-[8px] font-bold text-red-500 uppercase tracking-tighter">
                          {t('error_send_failed') || '전송 실패'}
                        </span>
                      )}
                    </div>
                  </div>
                  <span className="text-[8px] font-bold text-gray-600 uppercase mb-1">
                    {msg.timestamp?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }) || ''}
                  </span>
                </div>
              </React.Fragment>
            );
          });
        })()}
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
