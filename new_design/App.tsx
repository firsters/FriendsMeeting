
import React, { useState } from 'react';
import { ScreenType } from './types';
import Onboarding from './screens/Onboarding';
import AuthScreens from './screens/AuthScreens';
import MapView from './screens/MapView';
import MeetingScreens from './screens/MeetingScreens';
import FriendScreens from './screens/FriendScreens';
import SettingsScreen from './screens/SettingsScreen';
import Permissions from './screens/Permissions';

const App: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<ScreenType>(ScreenType.ONBOARDING);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const navigate = (screen: ScreenType) => {
    setCurrentScreen(screen);
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case ScreenType.ONBOARDING:
        return <Onboarding onNavigate={navigate} />;
      
      case ScreenType.LOGIN:
      case ScreenType.SIGNUP:
      case ScreenType.FORGOT_PASSWORD:
      case ScreenType.CHECK_MAIL:
      case ScreenType.RESET_PASSWORD:
      case ScreenType.PASSWORD_UPDATED:
        return <AuthScreens currentScreen={currentScreen} onNavigate={navigate} onLogin={() => {
          setIsLoggedIn(true);
          navigate(ScreenType.PERMISSIONS);
        }} />;

      case ScreenType.PERMISSIONS:
        return <Permissions onNavigate={navigate} />;

      case ScreenType.MAP:
        return <MapView onNavigate={navigate} />;

      case ScreenType.MEETINGS:
      case ScreenType.MEETING_DETAILS:
      case ScreenType.CREATE_MEETING:
        return <MeetingScreens currentScreen={currentScreen} onNavigate={navigate} />;

      case ScreenType.FRIENDS:
      case ScreenType.FRIEND_REQUESTS:
        return <FriendScreens currentScreen={currentScreen} onNavigate={navigate} />;

      case ScreenType.SETTINGS:
        return <SettingsScreen onNavigate={navigate} onLogout={() => {
          setIsLoggedIn(false);
          navigate(ScreenType.LOGIN);
        }} />;

      default:
        return <Onboarding onNavigate={navigate} />;
    }
  };

  return (
    <div className="h-screen w-full flex justify-center bg-black overflow-hidden">
      <div className="relative w-full max-w-md h-full bg-background-dark shadow-2xl flex flex-col">
        {renderScreen()}
      </div>
    </div>
  );
};

export default App;
