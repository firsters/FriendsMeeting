import React from 'react';
import { motion } from 'framer-motion';
import { Map, Users, MessageSquare, Bell, User } from 'lucide-react';
import { useTranslation } from '../context/LanguageContext';

const Navigation = ({ activeTab, onTabChange }) => {
  const { t } = useTranslation();
  const tabs = [
    { id: 'map', icon: Map, label: t('nav_map') },
    { id: 'friends', icon: Users, label: t('nav_friends') },
    { id: 'chat', icon: MessageSquare, label: t('nav_meetings') },
    { id: 'notifications', icon: Bell, label: t('nav_alerts') },
    { id: 'profile', icon: User, label: t('nav_profile') },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto glass border-t border-slate-800/50 pb-safe z-50">
      <div className="flex justify-around items-center h-16 px-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className="relative flex flex-col items-center justify-center w-full h-full transition-colors"
            >
              <div className={`transition-all duration-300 ${isActive ? 'text-primary-400 -translate-y-1' : 'text-slate-500 hover:text-slate-300'}`}>
                <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
              </div>
              <span className={`text-[10px] font-medium mt-1 transition-all duration-300 ${isActive ? 'text-primary-400 opacity-100' : 'text-slate-500 opacity-0'}`}>
                {tab.label}
              </span>
              {isActive && (
                <motion.div 
                  layoutId="activeTab"
                  className="absolute -top-[1px] w-8 h-[2px] bg-primary-400 rounded-full"
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default Navigation;
