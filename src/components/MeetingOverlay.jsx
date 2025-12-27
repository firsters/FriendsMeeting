import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Calendar, Clock, MapPin, Users, Hash } from 'lucide-react';
import { Input, Button } from '../components/UI';

const MeetingOverlay = ({ type = 'create', onClose, onCreate, onJoin }) => {
  const [formData, setFormData] = useState({
    name: '',
    date: '',
    time: '',
    participants: '',
    code: '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (type === 'create') onCreate(formData);
    else onJoin(formData.code);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: '100%' }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: '100%' }}
      className="fixed inset-0 z-[100] bg-slate-900/90 backdrop-blur-xl flex flex-col"
    >
      <div className="p-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white uppercase tracking-tight">
          {type === 'create' ? 'New Meeting' : 'Join Meeting'}
        </h2>
        <button onClick={onClose} className="p-2 bg-slate-800 rounded-full text-slate-400">
          <X size={20} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="flex-1 p-6 space-y-6 overflow-y-auto">
        {type === 'create' ? (
          <>
            <Input 
              label="Meeting Name" 
              placeholder="e.g. Afternoon Hike" 
              icon={MapPin}
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              required
            />
            <div className="grid grid-cols-2 gap-4">
              <Input 
                label="Date" 
                type="date" 
                icon={Calendar}
                value={formData.date}
                onChange={(e) => setFormData({...formData, date: e.target.value})}
                required
              />
              <Input 
                label="Time" 
                type="time" 
                icon={Clock}
                value={formData.time}
                onChange={(e) => setFormData({...formData, time: e.target.value})}
                required
              />
            </div>
            <Input 
              label="Participants" 
              placeholder="Search friends to add..." 
              icon={Users}
              value={formData.participants}
              onChange={(e) => setFormData({...formData, participants: e.target.value})}
            />
            
            <div className="p-4 glass rounded-2xl border border-white/5">
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-2">Suggestion</p>
              <div className="flex gap-2">
                {['☕️', '🍕', '🏃‍♂️', '🎬'].map((emoji, i) => (
                  <button 
                    key={i} 
                    type="button"
                    className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center text-xl hover:bg-slate-700 transition-colors"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          </>
        ) : (
          <div className="space-y-8 py-10">
            <div className="text-center space-y-2">
              <div className="w-16 h-16 bg-primary-500/10 rounded-3xl mx-auto flex items-center justify-center border border-primary-500/20 mb-4">
                <Hash size={32} className="text-primary-400" />
              </div>
              <p className="text-slate-400">Enter the meeting code or ID provided by the host to join the group.</p>
            </div>
            <Input 
              label="Meeting Code" 
              placeholder="e.g. #MEET-1234" 
              icon={Hash}
              value={formData.code}
              onChange={(e) => setFormData({...formData, code: e.target.value})}
              required
              className="text-center text-2xl font-bold tracking-widest"
            />
          </div>
        )}

        <div className="pt-6">
          <Button type="submit" className="w-full py-4 text-lg">
            {type === 'create' ? 'Create Meeting' : 'Join Now'}
          </Button>
        </div>
      </form>
    </motion.div>
  );
};

export default MeetingOverlay;
