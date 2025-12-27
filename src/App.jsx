import React, { useState } from 'react';
import Welcome from './pages/Welcome';
import Auth from './pages/Auth';
import Permissions from './pages/Permissions';
import Navigation from './components/Navigation';
import FriendsList from './pages/FriendsList';
import MeetingList from './pages/MeetingList';
import Profile from './pages/Profile';
import CombinedView from './pages/CombinedView';
import { FriendsProvider } from './context/FriendsContext';
import './index.css';

function App() {
  const [currentStep, setCurrentStep] = useState('welcome');
  const [activeTab, setActiveTab] = useState('map');

  const handleGetStarted = () => setCurrentStep('auth-login');
  const handleAuthSuccess = () => setCurrentStep('permissions');
  const handleGrantPermissions = () => setCurrentStep('home');
  const handleBack = () => setCurrentStep('welcome');
  const handleLogout = () => setCurrentStep('welcome');

  return (
    <FriendsProvider>
      <div className="h-full w-full max-w-md mx-auto relative shadow-2xl overflow-hidden border-x border-slate-800 bg-slate-900 flex flex-col">
        <div className="flex-1 overflow-hidden relative">
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
                    <h2 className="text-2xl font-bold text-white mb-8">Alerts</h2>
                    <div className="space-y-4">
                      <NotificationItem 
                        icon="☕️" 
                        title="Meeting Invite" 
                        desc="Alex invited you to 'Friday Night Coffee'" 
                        time="Just now" 
                        action="Accept"
                      />
                      <NotificationItem 
                        icon="💬" 
                        title="New Message" 
                        desc="Sam sent a photo in 'Friday Night Coffee'" 
                        time="10m ago" 
                      />
                      <NotificationItem 
                        icon="📍" 
                        title="Location Update" 
                        desc="Jordan is now nearby (500m)" 
                        time="1h ago" 
                      />
                    </div>
                  </div>
                )}
                {activeTab === 'profile' && <Profile onLogout={handleLogout} />}
              </div>
              
              <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
            </div>
          )}
        </div>
      </div>
    </FriendsProvider>
  );
}

const NotificationItem = ({ icon, title, desc, time, action }) => (
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
            Ignore
          </button>
        </div>
      )}
    </div>
  </div>
);

export default App;
