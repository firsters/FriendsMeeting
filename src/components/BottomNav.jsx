import React from 'react';
import { ScreenType } from '../constants/ScreenType';
import { useTranslation } from '../context/LanguageContext';

const BottomNav = ({ currentScreen, onNavigate }) => {
  const { t } = useTranslation();

  const navItems = [
    {
      id: ScreenType.MAP,
      label: t('nav_map'),
      icon: 'map'
    },
    {
      id: ScreenType.MEETINGS,
      label: t('nav_meetings'),
      icon: 'diversity_3'
    },
    {
      id: ScreenType.MEETING_DETAILS,
      label: t('nav_chat'),
      icon: 'forum'
    },
    {
      id: ScreenType.FRIENDS,
      label: t('nav_friends'),
      icon: 'group'
    },
    {
      id: ScreenType.SETTINGS,
      label: t('nav_profile'),
      icon: 'person'
    }
  ];

  // Helper to determine active state
  const isActive = (id) => {
    if (id === ScreenType.MEETINGS) {
      return currentScreen === ScreenType.MEETINGS || currentScreen === ScreenType.CREATE_MEETING;
    }
    if (id === ScreenType.FRIENDS) {
       return currentScreen === ScreenType.FRIENDS || currentScreen === ScreenType.FRIEND_REQUESTS;
    }
    return currentScreen === id;
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 h-24 bg-background-dark/80 backdrop-blur-xl border-t border-white/5 flex items-center justify-around px-4 pb-4 z-50">
      {navItems.map((item) => {
        const active = isActive(item.id);
        return (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={`flex flex-col items-center gap-1.5 transition-all transform active:scale-90 ${
              active ? 'text-primary' : 'text-gray-500 hover:text-white'
            }`}
          >
            {active && (
              <div className="w-1 h-1 bg-primary rounded-full mb-1"></div>
            )}
            {!active && <div className="h-2"></div>}
            <span className="material-symbols-outlined text-2xl">{item.icon}</span>
            <span className="text-[9px] font-bold uppercase tracking-[0.15em]">
              {item.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
};

export default BottomNav;
