import React from 'react';
import { ScreenType } from '../constants/ScreenType';
import { useTranslation } from '../context/LanguageContext';

const Welcome = ({ onNavigate, deferredPrompt, onInstallSuccess }) => {
  const { t } = useTranslation();

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      onInstallSuccess();
    }
  };

  return (
    <div className="relative flex flex-col min-h-full overflow-y-auto overflow-x-hidden bg-background-dark transition-all duration-500 scrollbar-hide">
      {/* Glossy background elements */}
      <div className="absolute top-[-10%] right-[-10%] w-64 h-64 bg-primary/20 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-[-5%] left-[-10%] w-72 h-72 bg-blue-500/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-primary/10 to-transparent pointer-events-none"></div>
      
      <div className="flex items-center justify-between px-6 pt-6 pb-2 z-10">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-primary text-white shadow-lg shadow-primary/20">
            <span className="material-symbols-outlined text-[20px]">location_on</span>
          </div>
          <span className="text-xl font-bold tracking-tight text-white font-display">{t('welcome_title')}</span>
        </div>

        {deferredPrompt && (
          <button 
            onClick={handleInstallClick}
            className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 rounded-full border border-emerald-500/20 transition-all active:scale-95"
          >
            <span className="material-symbols-outlined text-sm">download</span>
            <span className="text-[10px] font-bold uppercase tracking-wider">APP 설치</span>
          </button>
        )}
      </div>

      <div className="flex-1 flex flex-col items-center justify-start px-8 pt-2 pb-4 relative z-10">
        <div className="w-full relative aspect-[4/5] max-h-[360px] mb-2 rounded-[2.5rem] overflow-hidden shadow-2xl ring-1 ring-white/10 shrink-0">
          <div 
            className="absolute inset-0 bg-cover bg-center" 
            style={{backgroundImage: 'url("/assets/images/welcome.png")'}}
          ></div>
          <div className="absolute inset-0 bg-gradient-to-t from-background-dark/90 via-transparent to-transparent"></div>
          
          <div className="absolute top-6 right-6">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-white/10 backdrop-blur-md rounded-full border border-white/20 shadow-lg">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
              <span className="text-xs font-semibold text-white">{t('online_now')}</span>
            </div>
          </div>

          <div className="absolute bottom-8 left-6 right-6">
            <div className="flex items-center gap-3 p-4 bg-background-dark/70 backdrop-blur-lg rounded-2xl border border-white/10 shadow-xl opacity-95">
              <img 
                src="https://picsum.photos/seed/korean_alex/100/100" 
                className="w-10 h-10 rounded-full border-2 border-primary" 
                alt="Profile"
              />
              <div className="flex-1">
                <p className="text-[10px] uppercase font-bold text-primary tracking-widest mb-0.5">{t('onboarding_new_message')}</p>
                <p className="text-sm font-medium text-white">"{t('welcome_sample_msg')}"</p>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center space-y-2 max-w-[320px]">
          <h1 className="text-[28px] font-extrabold tracking-tight text-white leading-tight font-display">
            {t('welcome_title_stay_close')} <br/>
            {t('welcome_title_wherever')}
          </h1>
          <p className="text-xs text-gray-400 font-medium leading-relaxed">
            {t('welcome_desc')}
          </p>
        </div>
      </div>

      <div className="w-full px-8 pb-16 pt-0 z-10 flex flex-col gap-4">
        <button 
          onClick={() => onNavigate(ScreenType.SIGNUP)}
          className="w-full flex items-center justify-center gap-2 h-16 rounded-2xl bg-primary hover:bg-blue-600 active:scale-[0.98] transition-all text-white font-bold text-lg shadow-xl shadow-primary/30"
        >
          <span>{t('onboarding_get_started')}</span>
          <span className="material-symbols-outlined">arrow_forward</span>
        </button>
        <div className="flex justify-center items-center gap-2 text-sm font-medium">
          <span className="text-gray-500">{t('auth_has_account')}</span>
          <button 
            onClick={() => onNavigate(ScreenType.LOGIN)}
            className="text-primary font-bold hover:underline"
          >
            {t('welcome_login_link')}
          </button>
        </div>

        <div className="mt-2 bg-white/5 p-4 rounded-2xl border border-white/10 flex items-center justify-between gap-4">
          <div className="flex-1">
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">{t('meeting_code')}</p>
            <p className="text-xs font-medium text-white">{t('group_join_desc')}</p>
          </div>
          <button 
            onClick={() => onNavigate(ScreenType.GROUP_JOIN)}
            className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl border border-white/10 transition-all active:scale-95 flex items-center gap-2 whitespace-nowrap"
          >
            {t('welcome_join_with_code')}
            <span className="material-symbols-outlined text-sm">key</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Welcome;
