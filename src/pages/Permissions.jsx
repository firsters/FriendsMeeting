import React from 'react';
import { ScreenType } from '../constants/ScreenType';
import { useTranslation } from '../context/LanguageContext';

const Permissions = ({ onNavigate }) => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col h-full bg-background-dark animate-fade-in-up font-sans">
      <div className="p-4 flex items-center justify-center relative">
        <button onClick={() => onNavigate(ScreenType.SIGNUP)} className="absolute left-4 p-2 text-white/50 hover:text-white transition-colors">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <span className="font-bold text-white">{t('perm_title')}</span>
      </div>

      <div className="flex-1 flex flex-col items-center px-6 pt-10">
        <div className="w-full h-56 rounded-3xl overflow-hidden mb-10 relative border border-white/5 shadow-2xl">
          <div 
            className="absolute inset-0 bg-cover bg-center grayscale opacity-30"
            style={{backgroundImage: 'url("https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?auto=format&fit=crop&q=80&w=800")'}}
          ></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative">
              <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center shadow-[0_0_40px_rgba(37,106,244,0.4)] relative z-10">
                <span className="material-symbols-outlined text-white text-4xl">map</span>
              </div>
              <div className="absolute -right-4 -bottom-4 bg-background-dark p-1 rounded-full z-20">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="material-symbols-outlined text-white text-xl">check_circle</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <h2 className="text-3xl font-extrabold text-white text-center mb-4 leading-tight font-display">{t('perm_subtitle')}</h2>
        <p className="text-gray-400 text-center font-medium leading-relaxed mb-10">{t('perm_desc')}</p>

        <div className="w-full space-y-4">
          <div className="p-5 bg-card-dark rounded-3xl flex gap-4 border border-white/5">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-primary text-2xl">location_on</span>
            </div>
            <div className="flex-1">
              <h3 className="text-white font-bold mb-1">{t('perm_location_title')}</h3>
              <p className="text-xs text-gray-500 leading-relaxed mb-3">{t('perm_location_desc')}</p>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-orange-400 uppercase tracking-widest">{t('perm_location_badge')}</span>
                <button className="px-5 py-1.5 bg-primary rounded-full text-white text-xs font-bold shadow-lg shadow-primary/20 hover:bg-blue-600 transition-all active:scale-95">{t('perm_location_btn')}</button>
              </div>
            </div>
          </div>

          <div className="p-5 bg-card-dark rounded-3xl flex gap-4 border border-white/5">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-purple-500 text-2xl">notifications</span>
            </div>
            <div className="flex-1">
              <h3 className="text-white font-bold mb-1">{t('perm_notif_title')}</h3>
              <p className="text-xs text-gray-500 leading-relaxed">{t('perm_notif_desc')}</p>
              <div className="flex justify-end mt-2">
                <button className="px-5 py-1.5 bg-gray-800 rounded-full text-white text-xs font-bold hover:bg-gray-700 transition-all active:scale-95">{t('perm_notif_btn')}</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 pb-12 pt-4 bg-background-dark border-t border-white/5">
        <button 
          onClick={() => onNavigate(ScreenType.MAP)}
          className="w-full h-16 bg-primary rounded-2xl text-white font-bold text-lg shadow-xl shadow-primary/20 hover:bg-blue-600 transition-all active:scale-[0.98]"
        >
          {t('perm_btn_continue')}
        </button>
        <p className="mt-4 text-[10px] text-gray-600 font-bold text-center uppercase tracking-widest">{t('perm_disclaimer')}</p>
      </div>
    </div>
  );
};

export default Permissions;
