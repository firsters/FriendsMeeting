import React, { useState, useEffect } from 'react';
// Trigger Vercel Auto-build: 2025-12-27 20:40
import Welcome from './pages/Welcome';
import Auth from './pages/Auth';
import Permissions from './pages/Permissions';
import Navigation from './components/Navigation';
import FriendsList from './pages/FriendsList';
import MeetingList from './pages/MeetingList';
import Profile from './pages/Profile';
import CombinedView from './pages/CombinedView';
import { useTranslation } from './context/LanguageContext';
import './index.css';

function App() {
  const { t } = useTranslation();
  const [currentStep, setCurrentStep] = useState('auth-login');
  const [activeTab, setActiveTab] = useState('map');
  const [deferredPrompt, setDeferredPrompt] = useState(null);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleGetStarted = () => setCurrentStep('auth-login');
  const handleAuthSuccess = () => setCurrentStep('permissions');
  const handleGrantPermissions = () => setCurrentStep('home');
  const handleBack = () => setCurrentStep('auth-login');
  const handleLogout = () => setCurrentStep('auth-login');

  return (
    <div className="h-full w-full max-w-md mx-auto relative shadow-xl border-x border-gray-200 dark:border-gray-800 bg-background-light dark:bg-background-dark flex flex-col transition-colors duration-200">
      <div className="flex-1 relative overflow-y-auto">
        {currentStep === 'welcome' && <Welcome onGetStarted={handleGetStarted} />}
        
        {currentStep.startsWith('auth') && (
          <Auth 
            type={currentStep.split('-')[1]} 
            onBack={handleBack} 
            onSuccess={handleAuthSuccess} 
          />
        )}
        
        {currentStep === 'permissions' && (
          <Permissions onGrant={handleGrantPermissions} />
        )}
        
        {currentStep === 'home' && (
          <div className="h-full w-full flex flex-col">
            <div className="flex-1 relative overflow-hidden">
              {activeTab === 'map' && <CombinedView />}
              {activeTab === 'friends' && <FriendsList />}
              {activeTab === 'chat' && <MeetingList />}
              {activeTab === 'notifications' && (
                <div className="flex flex-col h-full bg-slate-900 p-6 overflow-y-auto">
                  <h2 className="text-2xl font-bold text-white mb-8">{t('alerts_title')}</h2>
                  <div className="space-y-4">
                    <NotificationItem 
                      icon="☕️" 
                      title={t('alert_invite_title')} 
                      desc={`Alex${t('alert_invite_desc')}`} 
                      time={t('alert_just_now')} 
                      action={t('accept')}
                      t={t}
                    />
                    <NotificationItem 
                      icon="💬" 
                      title={t('alert_message_title')} 
                      desc={`Sam${t('alert_message_desc')}`} 
                      time={`10${t('alert_minutes_ago')}`} 
                    />
                    <NotificationItem 
                      icon="📍" 
                      title={t('alert_location_title')} 
                      desc={`Jordan${t('alert_location_nearby')} (500m)`} 
                      time={`1${t('alert_hours_ago')}`} 
                    />
                  </div>
                </div>
              )}
              {activeTab === 'profile' && (
                <Profile 
                  onLogout={handleLogout} 
                  deferredPrompt={deferredPrompt}
                  onInstallSuccess={() => setDeferredPrompt(null)}
                />
              )}
            </div>
            
            <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
          </div>
        )}
      </div>
    </div>
  );
}

const NotificationItem = ({ icon, title, desc, time, action, t }) => (
  <div className="glass p-4 rounded-2xl border border-white/5 flex gap-4 items-start shadow-lg">
    <div className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center text-xl shrink-0">
      {icon}
    </div>
    <div className="flex-1">
      <div className="flex justify-between mb-1">
        <h4 className="font-bold text-sm text-white">{title}</h4>
        <span className="text-[10px] text-slate-500 font-semibold">{time}</span>
      </div>
      <p className="text-xs text-slate-400 leading-relaxed mb-3">{desc}</p>
      {action && (
        <div className="flex gap-2">
          <button className="px-4 py-1.5 bg-primary-600 text-white text-[10px] font-bold rounded-lg uppercase tracking-widest active:scale-95 transition-all">
            {action}
          </button>
          <button className="px-4 py-1.5 bg-slate-800 text-slate-400 text-[10px] font-bold rounded-lg uppercase tracking-widest active:scale-95 transition-all">
            {t('ignore')}
          </button>
        </div>
      )}
    </div>
  </div>
);

export default App;
