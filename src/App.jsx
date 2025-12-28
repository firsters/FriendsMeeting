import React, { useState, useEffect } from 'react';
import { ScreenType } from './constants/ScreenType';
import Welcome from './pages/Welcome';
import Auth from './pages/Auth';
import Permissions from './pages/Permissions';
import CombinedView from './pages/CombinedView';
import MeetingScreens from './pages/MeetingScreens';
import FriendScreens from './pages/FriendScreens';
import Profile from './pages/Profile';
import { auth } from './firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import './index.css';

function App() {
  // Start on the Welcome screen (onboarding) as requested
  const [currentScreen, setCurrentScreen] = useState(ScreenType.ONBOARDING);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Firebase Auth listener
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        if (user.emailVerified) {
          setIsLoggedIn(true);
          // Only navigate if we're on a restricted screen
          if ([ScreenType.ONBOARDING, ScreenType.LOGIN, ScreenType.SIGNUP, ScreenType.VERIFY_EMAIL].includes(currentScreen)) {
            setCurrentScreen(ScreenType.MAP);
          }
        } else {
          setIsLoggedIn(false);
          // Only auto-redirect to verify screen if they are trying to go somewhere else (like MAP)
          // and NOT explicitly staying on Auth pages or Welcome screen.
          const isAuthScreen = [ScreenType.ONBOARDING, ScreenType.SIGNUP, ScreenType.LOGIN].includes(currentScreen);
          if (!isAuthScreen) {
            setCurrentScreen(ScreenType.VERIFY_EMAIL);
          }
        }
      } else {
        setIsLoggedIn(false);
      }
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      unsubscribe();
    };
  }, [currentScreen]); // Adding currentScreen as dependency to handle navigation correctly if needed

  const navigate = (screen) => {
    setCurrentScreen(screen);
  };

  const handleLogin = () => {
    setIsLoggedIn(true);
    navigate(ScreenType.PERMISSIONS);
  };

  const handleLogout = async () => {
    await signOut(auth);
    setIsLoggedIn(false);
    navigate(ScreenType.LOGIN);
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case ScreenType.ONBOARDING:
        return <Welcome 
                 onNavigate={navigate} 
                 deferredPrompt={deferredPrompt} 
                 onInstallSuccess={() => setDeferredPrompt(null)} 
               />;
      
      case ScreenType.LOGIN:
      case ScreenType.SIGNUP:
      case ScreenType.FORGOT_PASSWORD:
      case ScreenType.CHECK_MAIL:
      case ScreenType.RESET_PASSWORD:
      case ScreenType.PASSWORD_UPDATED:
        return <Auth currentScreen={currentScreen} onNavigate={navigate} onLogin={handleLogin} />;

      case ScreenType.PERMISSIONS:
        return <Permissions onNavigate={navigate} />;

      case ScreenType.VERIFY_EMAIL:
        return <Auth currentScreen={currentScreen} onNavigate={navigate} onLogin={handleLogin} />;

      case ScreenType.MAP:
        return <CombinedView onNavigate={navigate} />;

      case ScreenType.MEETINGS:
      case ScreenType.MEETING_DETAILS:
      case ScreenType.CREATE_MEETING:
        return <MeetingScreens currentScreen={currentScreen} onNavigate={navigate} />;

      case ScreenType.FRIENDS:
      case ScreenType.FRIEND_REQUESTS:
        return <FriendScreens currentScreen={currentScreen} onNavigate={navigate} />;

      case ScreenType.SETTINGS:
        return <Profile 
                 onNavigate={navigate} 
                 onLogout={handleLogout} 
                 deferredPrompt={deferredPrompt}
                 onInstallSuccess={() => setDeferredPrompt(null)}
               />;

      default:
        return <Auth currentScreen={ScreenType.LOGIN} onNavigate={navigate} onLogin={handleLogin} />;
    }
  };

  return (
    <div className="h-[100dvh] w-full flex justify-center bg-black overflow-hidden font-sans antialiased">
      <div className="relative w-full h-full bg-background-dark shadow-2xl flex flex-col">
        {renderScreen()}
      </div>
    </div>
  );
}

export default App;
