import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, Edit3, Globe, Volume2, Bell, MessageSquare, 
  Navigation, Eye, ShieldAlert, BadgeHelp, Info, LogOut, ChevronRight,
  FileText, ShieldCheck, Code
} from 'lucide-react';

const Profile = ({ onLogout }) => {
  const [nickname, setNickname] = useState('Alex Doe');
  const [handle, setHandle] = useState('@alexdoe');

  return (
    <div className="flex flex-col h-full bg-slate-900 text-white overflow-hidden relative">
      {/* Top Header */}
      <header className="sticky top-0 z-50 flex items-center justify-between bg-slate-900/80 backdrop-blur-md px-4 py-3 border-b border-white/5">
        <button className="flex size-10 items-center justify-center rounded-full text-white hover:bg-white/10 transition-colors">
          <ArrowLeft size={22} />
        </button>
        <h1 className="text-lg font-bold tracking-tight uppercase tracking-widest">Settings</h1>
        <div className="size-10"></div>
      </header>

      <main className="flex-1 overflow-y-auto p-4 space-y-8 pb-32">
        {/* Profile Section */}
        <section className="flex flex-col items-center gap-4 py-4">
          <div className="relative group">
            <div className="size-28 rounded-3xl bg-primary-600 flex items-center justify-center text-4xl font-bold shadow-2xl border-4 border-slate-800 overflow-hidden relative">
              A
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer backdrop-blur-sm">
                <Edit3 size={24} className="text-white" />
              </div>
            </div>
            <button className="absolute -bottom-2 -right-2 flex size-10 items-center justify-center rounded-2xl bg-primary-500 text-white shadow-xl border-4 border-slate-900 active:scale-90 transition-transform">
              <Edit3 size={18} />
            </button>
          </div>
          <div className="text-center">
            <h2 className="text-2xl font-bold leading-tight tracking-tight">{nickname}</h2>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1 opacity-60">{handle}</p>
          </div>
        </section>

        {/* Settings Group: General */}
        <SettingsGroup title="General">
          <SettingsItem icon={<Globe size={20} />} title="Language" value="English" />
          <SettingsToggle icon={<Volume2 size={20} />} title="Sound Effects" active={true} color="bg-purple-500" />
        </SettingsGroup>

        {/* Settings Group: Notifications */}
        <SettingsGroup title="Notifications">
          <SettingsToggle icon={<Bell size={20} />} title="Push Notifications" active={true} color="bg-red-500" />
          <SettingsToggle icon={<MessageSquare size={20} />} title="New Messages" active={true} color="bg-green-500" />
          <SettingsToggle icon={<Navigation size={20} />} title="Nearby Friends" active={false} color="bg-orange-500" />
        </SettingsGroup>

        {/* Settings Group: Privacy & Security */}
        <SettingsGroup title="Privacy & Security">
          <SettingsItem icon={<Eye size={20} />} title="Who can find me" value="Friends" />
          <SettingsToggle icon={<Eye size={20} />} title="Show Online Status" active={true} color="bg-teal-500" />
          <SettingsItem icon={<ShieldAlert size={20} />} title="Blocked Users" />
        </SettingsGroup>

        {/* Settings Group: Support */}
        <SettingsGroup title="Support">
          <SettingsItem icon={<BadgeHelp size={20} />} title="Help Center" />
          <SettingsItem icon={<Info size={20} />} title="App Version" value="v1.0.4" hasArrow={false} />
        </SettingsGroup>

        {/* Settings Group: Legal */}
        <SettingsGroup title="Legal">
          <SettingsItem icon={<FileText size={20} />} title="이용약관" />
          <SettingsItem icon={<ShieldCheck size={20} />} title="개인정보처리방침" />
          <SettingsItem icon={<Code size={20} />} title="오픈소스 라이선스" />
        </SettingsGroup>

        {/* Logout Button */}
        <div className="pt-4 pb-10">
          <button 
            onClick={onLogout}
            className="flex w-full items-center justify-center gap-3 rounded-2xl bg-red-500/10 p-5 text-red-500 transition-all hover:bg-red-500/20 active:scale-[0.98] border border-red-500/20 font-bold uppercase tracking-widest text-xs"
          >
            <LogOut size={20} />
            Log Out
          </button>
        </div>
      </main>
    </div>
  );
};

const SettingsGroup = ({ title, children }) => (
  <section>
    <h3 className="mb-3 px-1 text-[10px] font-bold uppercase tracking-widest text-slate-500">{title}</h3>
    <div className="overflow-hidden rounded-3xl bg-slate-800/40 border border-white/5 shadow-xl">
      <div className="divide-y divide-white/5">
        {children}
      </div>
    </div>
  </section>
);

const SettingsItem = ({ icon, title, value, hasArrow = true }) => (
  <div className="flex items-center justify-between gap-4 p-4 active:bg-white/5 cursor-pointer transition-colors group">
    <div className="flex items-center gap-4">
      <div className="flex size-10 items-center justify-center rounded-xl bg-slate-800 text-slate-400 group-hover:text-white transition-colors">
        {icon}
      </div>
      <span className="text-sm font-bold text-slate-200">{title}</span>
    </div>
    <div className="flex items-center gap-2">
      {value && <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">{value}</span>}
      {hasArrow && <ChevronRight size={18} className="text-slate-600" />}
    </div>
  </div>
);

const SettingsToggle = ({ icon, title, active, color = "bg-primary-500" }) => {
  const [isActive, setIsActive] = useState(active);
  return (
    <div 
      className="flex items-center justify-between gap-4 p-4 active:bg-white/5 cursor-pointer transition-colors group"
      onClick={() => setIsActive(!isActive)}
    >
      <div className="flex items-center gap-4">
        <div className={`flex size-10 items-center justify-center rounded-xl bg-slate-800 text-slate-400 group-hover:text-white transition-colors`}>
          {icon}
        </div>
        <span className="text-sm font-bold text-slate-200">{title}</span>
      </div>
      <div className={`relative h-6 w-11 rounded-full transition-colors duration-300 ${isActive ? color : 'bg-slate-700'}`}>
        <div className={`absolute top-1 size-4 rounded-full bg-white transition-all duration-300 ${isActive ? 'left-6 shadow-lg' : 'left-1'}`} />
      </div>
    </div>
  );
};

export default Profile;
