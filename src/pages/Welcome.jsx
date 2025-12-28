import React from 'react';
import { ScreenType } from '../constants/ScreenType';
import { useTranslation } from '../context/LanguageContext';

const Welcome = ({ onNavigate }) => {
  const { t } = useTranslation();

  return (
    <div className="relative flex flex-col h-full overflow-hidden bg-background-dark transition-all duration-500">
      <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-primary/10 to-transparent pointer-events-none"></div>
      
      <div className="flex items-center justify-center pt-10 pb-6 z-10">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-primary text-white shadow-lg shadow-primary/20">
            <span className="material-symbols-outlined text-[24px]">location_on</span>
          </div>
          <span className="text-2xl font-bold tracking-tight text-white font-display">{t('welcome_title')}</span>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-8 relative z-10">
        <div className="w-full relative aspect-[4/5] max-h-[420px] mb-10 rounded-[2.5rem] overflow-hidden shadow-2xl ring-1 ring-white/10">
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


        <div className="text-center space-y-4 max-w-[320px]">
          <h1 className="text-[34px] font-extrabold tracking-tight text-white leading-tight font-display">
            {t('welcome_title_stay_close')} <br/>
            {t('welcome_title_wherever')}
          </h1>
          <p className="text-base text-gray-400 font-medium leading-relaxed">
            {t('welcome_desc')}
          </p>
        </div>
      </div>

      <div className="w-full px-8 pb-12 pt-4 z-10 flex flex-col gap-5">
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
      </div>
    </div>
  );
};

export default Welcome;
