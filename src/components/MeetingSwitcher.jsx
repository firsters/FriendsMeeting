import React, { useState } from 'react';
import { useFriends } from '../context/FriendsContext';
import { useTranslation } from '../context/LanguageContext';

const MeetingSwitcher = () => {
  const { myMeetings, activeMeetingId, setActiveMeetingId, currentUserId } = useFriends();
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  const activeMeeting = myMeetings.find(m => m.id === activeMeetingId);
  const otherMeetings = myMeetings.filter(m => m.id !== activeMeetingId);

  if (myMeetings.length <= 1 && !isOpen) {
      // Just show the title if only one meeting and not trying to open
      return (
        <div className="flex flex-col items-center">
          <h2 className="text-sm font-black text-white uppercase tracking-widest">{activeMeeting?.title || 'No Meeting'}</h2>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50"></span>
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest leading-none">Live Now</p>
          </div>
        </div>
      );
  }

  return (
    <div className="relative flex flex-col items-center">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex flex-col items-center group active:scale-95 transition-all"
      >
        <div className="flex items-center gap-1">
          <h2 className="text-sm font-black text-white uppercase tracking-[0.1em] group-hover:text-primary transition-colors">
            {activeMeeting?.title || 'Select Meeting'}
          </h2>
          <span className={`material-symbols-outlined text-gray-600 text-sm transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>
            expand_more
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50 animate-pulse"></span>
          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.1em]">{t('meeting_switch')}</p>
        </div>
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40 bg-black/20 backdrop-blur-[2px]" 
            onClick={() => setIsOpen(false)}
          ></div>
          <div className="absolute top-12 left-1/2 -translate-x-1/2 w-64 bg-card-dark border border-white/10 rounded-[28px] shadow-2xl z-50 overflow-hidden animate-fade-in-up">
            <div className="p-4 border-b border-white/5 bg-white/5">
                <span className="text-[9px] font-black text-gray-500 uppercase tracking-[0.2em]">{t('nav_meetings')}</span>
            </div>
            <div className="max-h-60 overflow-y-auto scrollbar-hide">
              {myMeetings.map(meeting => {
                const isActive = meeting.id === activeMeetingId;
                const isHost = meeting.hostId === currentUserId;
                
                return (
                  <button
                    key={meeting.id}
                    onClick={() => {
                        setActiveMeetingId(meeting.id);
                        setIsOpen(false);
                    }}
                    className={`w-full px-5 py-4 flex items-center gap-4 transition-all text-left ${isActive ? 'bg-primary/10 border-l-4 border-primary' : 'hover:bg-white/5 border-l-4 border-transparent'}`}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${isActive ? 'bg-primary border-primary' : 'bg-white/5 border-white/5'}`}>
                        <span className="material-symbols-outlined text-white text-base">
                            {isHost ? 'crown' : 'diversity_3'}
                        </span>
                    </div>
                    <div className="min-w-0">
                      <p className={`text-sm font-bold truncate ${isActive ? 'text-white' : 'text-gray-400'}`}>
                        {meeting.title}
                      </p>
                      <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest font-sans">
                        {isHost ? 'Host' : 'Member'}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default MeetingSwitcher;
