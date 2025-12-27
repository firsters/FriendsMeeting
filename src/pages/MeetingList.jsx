import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Plus, Users, ChevronRight, MapPin, Clock, Hash } from 'lucide-react';
import { Button } from '../components/UI';
import MeetingDetails from './MeetingDetails';
import MeetingOverlay from '../components/MeetingOverlay';

const MeetingList = () => {
  const [selectedMeeting, setSelectedMeeting] = useState(null);
  const [overlayType, setOverlayType] = useState(null); // 'create' | 'join'

  const meetings = [
    { id: '1', name: 'Friday Night Coffee', date: 'Dec 29', time: '17:00', icon: '☕️', status: 'upcoming', friends: 3 },
    { id: '2', name: 'Weekend Hike', date: 'Jan 02', time: '09:30', icon: '⛰️', status: 'upcoming', friends: 5 },
    { id: '3', name: 'Pizza Party', date: 'Dec 24', time: '19:00', icon: '🍕', status: 'past', friends: 8 },
  ];

  return (
    <div className="flex flex-col h-full bg-slate-900 overflow-hidden relative">
      <div className="p-6 flex-1 overflow-y-auto">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-white">Meetings</h2>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="rounded-xl px-3 py-2 text-primary-400 border-primary-500/20" onClick={() => setOverlayType('join')}>
               <Hash size={16} className="mr-1" />
               Join
            </Button>
            <Button variant="primary" size="sm" className="rounded-xl px-4 py-2" onClick={() => setOverlayType('create')}>
              <Plus size={18} className="mr-1" />
              Create
            </Button>
          </div>
        </div>

        <div className="space-y-6 pb-20">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-4">Upcoming</span>
            <div className="space-y-4">
              {meetings.filter(m => m.status === 'upcoming').map(meeting => (
                <MeetingCard key={meeting.id} meeting={meeting} onClick={() => setSelectedMeeting(meeting)} />
              ))}
            </div>
          </div>

          <div>
             <span className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-4">Past</span>
             <div className="space-y-4">
              {meetings.filter(m => m.status === 'past').map(meeting => (
                <MeetingCard key={meeting.id} meeting={meeting} onClick={() => setSelectedMeeting(meeting)} />
              ))}
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {selectedMeeting && (
          <MeetingDetails 
            meeting={selectedMeeting} 
            onBack={() => setSelectedMeeting(null)} 
            isHost={selectedMeeting.id === '1'}
          />
        )}
        {overlayType && (
          <MeetingOverlay 
            type={overlayType} 
            onClose={() => setOverlayType(null)}
            onCreate={(data) => { console.log('Create', data); setOverlayType(null); }}
            onJoin={(code) => { console.log('Join', code); setOverlayType(null); }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

const MeetingCard = ({ meeting, onClick }) => (
  <motion.div 
    whileHover={{ y: -2 }}
    onClick={onClick}
    className="glass p-5 rounded-3xl border border-white/5 shadow-xl hover:border-primary-500/30 transition-all cursor-pointer group"
  >
    <div className="flex items-start justify-between mb-4">
      <div className="flex gap-4">
        <div className="w-14 h-14 bg-slate-800 rounded-2xl flex items-center justify-center text-3xl shadow-inner border border-white/5">
          {meeting.icon}
        </div>
        <div>
          <h3 className="text-lg font-bold text-white group-hover:text-primary-400 transition-colors uppercase tracking-tight">{meeting.name}</h3>
          <div className="flex items-center gap-3 mt-1 text-slate-500 text-xs">
            <span className="flex items-center gap-1"><Calendar size={12} /> {meeting.date}</span>
            <span className="flex items-center gap-1"><Clock size={12} /> {meeting.time}</span>
          </div>
        </div>
      </div>
      <ChevronRight size={20} className="text-slate-600 group-hover:text-white transition-colors mt-2" />
    </div>
    
    <div className="flex items-center justify-between pt-4 border-t border-white/5">
      <div className="flex items-center gap-2">
        <div className="flex -space-x-2">
          {[...Array(3)].map((_, i) => (
            <div key={i} className={`w-6 h-6 rounded-full border-2 border-slate-900 bg-primary-900 flex items-center justify-center text-[8px] font-bold text-white`}>
              {['A', 'J', 'S'][i]}
            </div>
          ))}
          {meeting.friends > 3 && (
            <div className="w-6 h-6 rounded-full border-2 border-slate-900 bg-slate-800 flex items-center justify-center text-[8px] font-bold text-slate-400">
              +{meeting.friends - 3}
            </div>
          )}
        </div>
        <span className="text-[10px] text-slate-500 font-semibold">{meeting.friends} participants</span>
      </div>
      <div className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest ${meeting.status === 'upcoming' ? 'bg-primary-500/20 text-primary-400' : 'bg-slate-800 text-slate-500'}`}>
        {meeting.status}
      </div>
    </div>
  </motion.div>
);

export default MeetingList;
