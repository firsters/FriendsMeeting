import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from '../context/LanguageContext';

const Navigation = ({ activeTab, onTabChange }) => {
  const { t } = useTranslation();
  const tabs = [
    { id: 'map', icon: 'map', label: t('nav_map') },
    { id: 'friends', icon: 'group', label: t('nav_friends') },
    { id: 'chat', icon: 'forum', label: t('nav_chat') },
    { id: 'notifications', icon: 'notifications', label: t('nav_alerts') },
    { id: 'profile', icon: 'person', label: t('nav_profile') },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-background border-t border-border pb-safe z-50 shadow-[0_-4px_16px_rgba(0,0,0,0.04)]">
      <div className="flex justify-around items-center h-[var(--nav-bar-height)] px-xxs">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className="relative flex flex-col items-center justify-center w-full h-full transition-colors"
            >
              <div className={`transition-all duration-200 ${isActive ? 'text-primary' : 'text-text-secondary hover:text-primary'}`}>
                <span className={`material-symbols-outlined text-[24px] ${isActive ? 'fill-1' : ''}`}>
                  {tab.icon}
                </span>
              </div>
              <span className={`text-[10px] font-bold mt-0.5 transition-all duration-200 ${isActive ? 'text-primary opacity-100' : 'text-text-secondary opacity-100'}`}>
                {tab.label}
              </span>
              {isActive && (
                <motion.div 
                  layoutId="activeTabIndicator"
                  className="absolute top-0 w-8 h-[3px] bg-primary rounded-b-full"
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.5 }}
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
