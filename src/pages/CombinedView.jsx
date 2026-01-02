import React, { useState, useEffect, useMemo } from 'react';
import { ScreenType } from '../constants/ScreenType';
import { useTranslation } from '../context/LanguageContext';
import { useMapsLibrary } from '@vis.gl/react-google-maps';
import MapComponent from '../components/MapComponent';
import { auth, db } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { subscribeToMeetings, updateMeetingLocation, createMeeting, updateParticipantLocation } from '../utils/meetingService';
import { useFriends } from '../context/FriendsContext';

const CombinedView = ({ onNavigate }) => {
  const { t } = useTranslation();
  const { 
    friends, 
    updateFriendAddress, 
    selectedFriendId, 
    setSelectedFriendId,
    activeMeetingId,
    setActiveMeetingId,
    currentUserId
  } = useFriends();
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [userLocation, setUserLocation] = useState(null);

  // New Header State
  const [meetingLocation, setMeetingLocation] = useState(null); // { name, address, lat, lng }
  const [meetingStatus, setMeetingStatus] = useState('unconfirmed'); // unconfirmed, confirmed, temporary
  const [liveStatus, setLiveStatus] = useState('offline'); // online, offline
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [notificationCount, setNotificationCount] = useState(3);
  const [pendingLocationName, setPendingLocationName] = useState(null);
  const [userAddress, setUserAddress] = useState("");
  const [isLocationMenuOpen, setIsLocationMenuOpen] = useState(false);

  // General Search State (Row 2)
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [generalSearchQuery, setGeneralSearchQuery] = useState("");
  const [generalSearchResults, setGeneralSearchResults] = useState([]);
  const [generalSelectedPlaceId, setGeneralSelectedPlaceId] = useState(null);
  const [generalLocation, setGeneralLocation] = useState(null);

  // Search Triggers for Enter Key
  const [searchTrigger, setSearchTrigger] = useState(0);
  const [generalSearchTrigger, setGeneralSearchTrigger] = useState(0);

  const [centerTrigger, setCenterTrigger] = useState(0);
  const [centerOnMeTrigger, setCenterOnMeTrigger] = useState(0);
  const [mapType, setMapType] = useState('roadmap'); // 'roadmap' or 'hybrid'

  const geocodingLib = useMapsLibrary('geocoding');
  const [geocoder, setGeocoder] = useState(null);

  useEffect(() => {
    if (geocodingLib) {
      setGeocoder(new geocodingLib.Geocoder());
    }
  }, [geocodingLib]);

  const activeMeeting = {
    title: t('mock_meeting_title') || "Cafe study session",
    time: "2:00 PM",
    location: "Starbucks Gangnam",
    participants: 4
  };

  const mapCenter = useMemo(() => {
    return selectedFriend ? { lat: selectedFriend.lat, lng: selectedFriend.lng } : null;
  }, [selectedFriend]);

  // Sync selection from context (e.g. from FriendScreens)
  useEffect(() => {
    if (selectedFriendId) {
      const friend = friends.find(f => f.id === selectedFriendId);
      if (friend) {
        setSelectedFriend(friend);
        // Pan map to friend
        setCenterTrigger(prev => prev + 1);
        setIsExpanded(false); // Collapse bottom sheet to show map
      }
      // RESET it so that navigating back to Friends and clicking AGAIN triggers it
      // But we might want to keep the highlight. The highlight is controlled by 'selectedFriend' local state.
      setSelectedFriendId(null);
    }
  }, [selectedFriendId, friends]);

  // ROW 1 Logic: Auth & Meeting ID sync is now handled by FriendsContext
  const isHost = !!currentUserId;

  // 2. Meeting Subscription for Location Sharing
  useEffect(() => {
    if (!currentUserId) {
        setActiveMeetingId(null);
        setMeetingLocation(null);
        setMeetingStatus('unconfirmed');
        return;
    }

    const unsubMeetings = subscribeToMeetings(currentUserId, (meetings) => {
        if (meetings.length > 0) {
            const meeting = meetings[0];
            if (meeting.meetingLocation) {
                setMeetingLocation(meeting.meetingLocation);
                setMeetingStatus('confirmed');
            }
        }
    });
    return () => unsubMeetings();
  }, [currentUserId]);

  // Geolocation & Live Status
  useEffect(() => {
    let watchId = null;

    if (navigator.geolocation) {
      const success = (position) => {
          const { latitude, longitude } = position.coords;
          const newPos = [latitude, longitude];
          setUserLocation(newPos);
          setLiveStatus('online');

          // Resolve user address (Geocoding)
          if (geocoder) {
            geocoder.geocode({ location: { lat: latitude, lng: longitude } }, (results, status) => {
              if (status === 'OK' && results[0]) {
                setUserAddress(results[0].formatted_address);
              }
            });
          }
      };
      
      const error = (err) => {
          console.error("Location permission denied or error:", err);
          setLiveStatus('offline');
      };

      // Watch position for real-time updates
      watchId = navigator.geolocation.watchPosition(success, error, {
          enableHighAccuracy: true,
          maximumAge: 5000,
          timeout: 10000
      });
    } else {
        setLiveStatus('offline');
    }

    return () => {
        if (watchId !== null) {
            navigator.geolocation.clearWatch(watchId);
        }
    };
  }, [geocoder]); 

  // Sync personal location to Firebase
  useEffect(() => {
    if (activeMeetingId && currentUserId && userLocation) {
      updateParticipantLocation(activeMeetingId, currentUserId, {
        lat: userLocation[0],
        lng: userLocation[1],
        status: liveStatus
      });
    }
  }, [userLocation, activeMeetingId, currentUserId, liveStatus]);

  // Host Search State (Meeting Location)
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [selectedPlaceId, setSelectedPlaceId] = useState(null);

  const handleSearchInput = (e) => {
    setSearchQuery(e.target.value);
    if (e.target.value.length === 0) {
        setSearchResults([]);
    }
  };

  const handleKeyDown = (e) => {
      if (e.key === 'Enter') {
          setSearchTrigger(prev => prev + 1);
      }
  };

  const handleSelectLocation = (placeId, description, mainText, secondaryText) => {
      setSelectedPlaceId(placeId);
      setSearchQuery(description);
      setPendingLocationName({ name: mainText || description, address: secondaryText || "" });
      setSearchResults([]);
      setMeetingStatus('temporary');
  };

  const handleLocationPersistence = async (location) => {
      if (!location) return;
      
      try {
          if (activeMeetingId) {
              await updateMeetingLocation(activeMeetingId, location);
          } else if (isHost && currentUserId) {
              // Create a meeting if none exists so we can share the location
              const nickname = auth.currentUser?.displayName || 'Host';
              const newMeeting = await createMeeting({
                  title: location.name || "Live Meeting",
                  meetingLocation: location,
                  status: 'active'
              }, currentUserId, { nickname });
              setActiveMeetingId(newMeeting.id);
              console.log("Auto-created meeting for location persistence:", newMeeting.id);
          }
      } catch (err) {
          console.error("Failed to persist location:", err);
      }
  };

  const onPlaceSelectedFromMap = (location) => {
      if (pendingLocationName) {
          const updatedLocation = {
              ...pendingLocationName,
              lat: location.lat,
              lng: location.lng,
              address: location.address || pendingLocationName.address
          };
          setMeetingLocation(updatedLocation);
          setMeetingStatus('confirmed');
          setPendingLocationName(null);
          setIsSearchOpen(false);
          setIsLocationMenuOpen(false);

          handleLocationPersistence(updatedLocation);
      }
  };

  const handleDeleteLocation = async () => {
      setMeetingLocation(null);
      setMeetingStatus('unconfirmed');
      setIsLocationMenuOpen(false);
      setIsSearchOpen(false);
      if (activeMeetingId) {
          await updateMeetingLocation(activeMeetingId, null);
      }
  };

  const handleResetLocation = () => {
      setMeetingLocation(null);
      setMeetingStatus('unconfirmed');
      setIsLocationMenuOpen(false);
      setIsSearchOpen(true);
      setSearchQuery("");
      setSearchResults([]);
  };

  // General Search State Handlers (Row 2)
  const handleGeneralSearchInput = (e) => {
    setGeneralSearchQuery(e.target.value);
    if (e.target.value.length === 0) {
        setGeneralSearchResults([]);
    }
  };

  const handleGeneralKeyDown = (e) => {
      if (e.key === 'Enter') {
          setGeneralSearchTrigger(prev => prev + 1);
      }
  };

  const handleSelectGeneralLocation = (placeId, description) => {
      setGeneralSelectedPlaceId(placeId);
      setGeneralSearchQuery(description);
      setGeneralSearchResults([]);
  };

  // This just updates the map center without setting meeting location
  const onGeneralPlaceSelectedFromMap = (location) => {
      setGeneralLocation(location);
  };
  const handleCenterOnMe = () => {
    setCenterOnMeTrigger(prev => prev + 1);
  };

  const handleMarkerDrag = (type, latLng) => {
    if (type === 'meeting') {
      setMeetingLocation(prev => ({
        ...prev,
        ...latLng,
        name: "" // Clear name on drag to force address update
      }));

      // Real-time geocoding for the top bar
      if (geocoder) {
        geocoder.geocode({ location: latLng }, (results, status) => {
          if (status === 'OK' && results[0]) {
            setMeetingLocation(prev => ({ ...prev, address: results[0].formatted_address }));
          }
        });
      }
    } else {
        setGeneralLocation(latLng);
        // Real-time geocoding for the general address input
        if (geocoder) {
          geocoder.geocode({ location: latLng }, (results, status) => {
            if (status === 'OK' && results[0]) {
              setGeneralSearchQuery(results[0].formatted_address);
            }
          });
        }
    }
  };

  const handleMarkerDragEnd = (type, latLng) => {
      console.log(`Marker ${type} drag ended at`, latLng);
      // Persist to DB on drag end
      if (type === 'meeting' && meetingLocation) {
          handleLocationPersistence(meetingLocation);
      }
  };

  const handleToggleMapType = () => {
    setMapType(prev => prev === 'roadmap' ? 'hybrid' : 'roadmap');
  };

  // Status Helpers
  const getLiveStatusInfo = () => {
      return liveStatus === 'online'
        ? { text: t('status_receiving_location'), color: "bg-green-500" }
        : { text: t('offline'), color: "bg-red-500" };
  };

  const getMeetingStatusInfo = () => {
      switch(meetingStatus) {
          case 'confirmed': return { text: t('status_location_confirmed'), color: "bg-green-500" };
          case 'temporary': return { text: t('status_location_temporary'), color: "bg-yellow-500" };
          case 'unconfirmed': default: return { text: t('status_location_unconfirmed'), color: "bg-red-500" };
      }
  };

  const liveInfo = getLiveStatusInfo();
  const meetingInfo = getMeetingStatusInfo();

  return (
    <div className="flex flex-col h-full bg-background-dark overflow-hidden relative font-sans">
      {/* Real Interactive Map Layer */}
      {/* MAIN MAP AREA */}
      <div className="absolute inset-0 z-0">
          <MapComponent 
            friends={friends} 
            selectedFriend={selectedFriend}
            onFriendClick={setSelectedFriend} 
            userLocation={userLocation}
            center={mapCenter}

            // Primary Search (Host)
            searchQuery={searchQuery}
            searchTrigger={searchTrigger}
            onSearchResults={setSearchResults}
            selectedPlaceId={selectedPlaceId}
            onPlaceSelected={onPlaceSelectedFromMap}

            // General Search (Row 2)
            generalSearchQuery={generalSearchQuery}
            generalSearchTrigger={generalSearchTrigger}
            onGeneralSearchResults={setGeneralSearchResults}
            generalSelectedPlaceId={generalSelectedPlaceId}
            onGeneralPlaceSelected={onGeneralPlaceSelectedFromMap}

            centerTrigger={centerTrigger}
            centerOnMeTrigger={centerOnMeTrigger}
            mapType={mapType}
            meetingLocation={meetingLocation}
            generalLocation={generalLocation}
            onMarkerDrag={handleMarkerDrag}
            onMarkerDragEnd={handleMarkerDragEnd}
            onCenterRequest={(pos) => setCenterTrigger(prev => prev + 1)}
            onAddressResolved={(addr) => setUserAddress(addr)}
            onFriendAddressResolved={updateFriendAddress}
            bottomOffset={100}
            topOffset={isSearchExpanded ? 240 : 140}
          />
      </div>

      {/* Top Header Bar Container */}
      <header className="relative z-10 px-4 pt-0 pb-4 pointer-events-none flex flex-col items-center gap-2">
        {/* Main Header Container (Row 1 + Row 2) */}
        <div className="flex flex-col w-full bg-card-dark/95 backdrop-blur-2xl rounded-b-[2.5rem] border-b border-white/10 shadow-2xl pointer-events-auto transition-all duration-300">

            {/* ROW 1: Meeting Status & Host Location (Always Visible) */}
            <div className="flex items-center min-h-[4.5rem] w-full border-b border-white/5 last:border-none">
                {/* Left Section: Indicators (Order swapped and emphasized) */}
                <div className="flex flex-col justify-center px-5 py-3 border-r border-white/10 gap-1 shrink-0 min-w-[170px]">
                    {/* Meeting Status (Higher Priority) */}
                    <div className="flex items-center gap-2">
                        <span className={`w-2.5 h-2.5 rounded-full ${meetingInfo.color} shadow-[0_0_10px_rgba(0,0,0,0.5)]`}></span>
                        <span className="text-[11px] font-black text-white uppercase tracking-wider">{meetingInfo.text}</span>
                    </div>
                    {/* Live Status */}
                    <div className="flex items-center gap-2 opacity-50 pl-0.5">
                        <span className={`w-1.5 h-1.5 rounded-full ${liveInfo.color} ${liveStatus === 'online' ? 'animate-pulse' : ''}`}></span>
                        <span className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">{liveInfo.text}</span>
                    </div>
                </div>

                {/* Center Section: Info or Search (Host) */}
                <div className="flex-1 px-5 py-2 relative flex items-center h-16">
                    {isSearchOpen ? (
                        <div className="w-full relative group">
                            <span className="absolute left-0 top-1/2 -translate-y-1/2 material-symbols-outlined text-gray-500 text-lg">search</span>
                            <input
                                autoFocus
                                value={searchQuery}
                                onChange={handleSearchInput}
                                onKeyDown={handleKeyDown}
                                className="w-full bg-transparent text-white placeholder:text-gray-500 font-bold text-sm outline-none pl-7"
                                placeholder={t('search_meeting_placeholder')}
                            />
                            {/* Dropdown */}
                            {searchResults.length > 0 && (
                                <div className="absolute top-full left-0 right-0 mt-4 bg-card-dark/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden max-h-60 overflow-y-auto z-50 animate-fade-in-up">
                                    {searchResults.map((result) => (
                                        <div
                                        key={result.place_id}
                                        onClick={() => handleSelectLocation(result.place_id, result.description, result.structured_formatting?.main_text, result.structured_formatting?.secondary_text)}
                                        className="px-4 py-3 hover:bg-white/10 cursor-pointer flex items-center gap-3 border-b border-white/5 last:border-none transition-colors"
                                        >
                                        <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center shrink-0">
                                            <span className="material-symbols-outlined text-gray-400 text-sm">location_on</span>
                                        </div>
                                        <div className="overflow-hidden text-left">
                                            <p className="text-sm font-bold text-white truncate">{result.structured_formatting?.main_text || result.description}</p>
                                            <p className="text-xs text-gray-500 truncate">{result.structured_formatting?.secondary_text || ""}</p>
                                        </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="flex flex-col justify-center w-full">
                            <p className="text-white font-black text-lg truncate leading-none w-full drop-shadow-lg mb-0.5">
                                {meetingLocation?.name || meetingLocation?.address || t('header_no_location')}
                            </p>
                            <p className="text-[10px] text-gray-400 truncate w-full font-bold uppercase tracking-tight opacity-80">
                                {userAddress || t('header_set_location_prompt')}
                            </p>
                        </div>
                    )}
                </div>

                {/* Right Section: Buttons */}
                <div className="flex items-center gap-2 px-3 border-l border-white/10 h-10 my-auto">
                    {/* Host Edit Toggle / Management Menu */}
                    {isHost && (
                        <div className="relative">
                            <button
                                onClick={() => {
                                    if (meetingLocation && !isSearchOpen) {
                                        setIsLocationMenuOpen(!isLocationMenuOpen);
                                    } else {
                                        setIsSearchOpen(!isSearchOpen);
                                        if (!isSearchOpen) {
                                            setSearchQuery(""); // Clear on open
                                            setSearchResults([]);
                                        }
                                    }
                                }}
                                className={`w-9 h-9 rounded-full flex items-center justify-center transition-all active:scale-90 ${isSearchOpen || isLocationMenuOpen ? 'bg-primary text-white shadow-lg shadow-primary/30' : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'}`}
                            >
                                <span className="material-symbols-outlined text-lg">
                                    {isSearchOpen || isLocationMenuOpen ? 'close' : 'star'}
                                </span>
                            </button>

                            {/* Management Menu Dropdown */}
                            {isLocationMenuOpen && meetingLocation && (
                                <div className="absolute top-full right-0 mt-4 bg-card-dark/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50 animate-fade-in-up flex flex-col min-w-[120px]">
                                    <button 
                                        onClick={handleResetLocation}
                                        className="px-4 py-3 hover:bg-white/10 text-white text-xs font-bold flex items-center gap-2 border-b border-white/5"
                                    >
                                        <span className="material-symbols-outlined text-sm">restart_alt</span>
                                        {t('meeting_reset_location') || '재설정'}
                                    </button>
                                    <button 
                                        onClick={handleDeleteLocation}
                                        className="px-4 py-3 hover:bg-red-500/20 text-red-400 text-xs font-bold flex items-center gap-2"
                                    >
                                        <span className="material-symbols-outlined text-sm">delete</span>
                                        {t('meeting_delete_location') || '삭제'}
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* General Search Expand Toggle */}
                     <button
                        onClick={() => setIsSearchExpanded(!isSearchExpanded)}
                        className={`w-9 h-9 rounded-full flex items-center justify-center transition-all active:scale-90 ${isSearchExpanded ? 'bg-white/20 text-white' : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'}`}
                    >
                        <span className="material-symbols-outlined text-lg">
                            {isSearchExpanded ? 'expand_less' : 'expand_more'}
                        </span>
                    </button>

                    <button
                        onClick={() => onNavigate(ScreenType.MEETINGS)}
                        className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-all active:scale-90 relative"
                    >
                        <span className="material-symbols-outlined text-lg">notifications</span>
                        {notificationCount > 0 && (
                            <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full border-2 border-card-dark flex items-center justify-center text-[8px] font-bold text-white">
                                {notificationCount}
                            </span>
                        )}
                    </button>
                </div>
            </div>

            {/* ROW 2: General Search (Collapsible) */}
            {isSearchExpanded && (
                <div className="w-full px-4 py-3 bg-black/20 border-t border-white/5 animate-fade-in-down rounded-b-3xl">
                    <div className="relative group w-full">
                       <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-gray-500 text-lg">search</span>
                       <input
                           autoFocus
                           value={generalSearchQuery}
                           onChange={handleGeneralSearchInput}
                           onKeyDown={handleGeneralKeyDown}
                           className="w-full bg-white/5 rounded-xl text-white placeholder:text-gray-500 font-bold text-sm outline-none pl-10 pr-4 py-2.5 transition-colors focus:bg-white/10"
                           placeholder={t('loc_search_placeholder')}
                       />
                       {/* General Search Dropdown */}
                       {generalSearchResults.length > 0 && (
                        <div className="absolute top-full left-0 right-0 mt-2 bg-card-dark/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden max-h-60 overflow-y-auto z-50">
                            {generalSearchResults.map((result) => (
                                <div
                                key={result.place_id}
                                onClick={() => handleSelectGeneralLocation(result.place_id, result.description)}
                                className="px-4 py-3 hover:bg-white/10 cursor-pointer flex items-center gap-3 border-b border-white/5 last:border-none transition-colors"
                                >
                                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center shrink-0">
                                    <span className="material-symbols-outlined text-gray-400 text-sm">location_on</span>
                                </div>
                                <div className="overflow-hidden text-left">
                                    <p className="text-sm font-bold text-white truncate">{result.structured_formatting?.main_text || result.description}</p>
                                    <p className="text-xs text-gray-500 truncate">{result.structured_formatting?.secondary_text || ""}</p>
                                </div>
                                </div>
                            ))}
                        </div>
                       )}
                   </div>
                </div>
            )}
        </div>
      </header>

      {/* Quick Actions & Controls */}
      <div className="absolute right-4 bottom-28 flex flex-col gap-3 z-50 transition-transform duration-500" style={{ transform: isExpanded ? 'translateY(-220%)' : 'none' }}>
        <button 
          onClick={handleCenterOnMe}
          className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-slate-900 border border-white/10 shadow-[0_8px_30px_rgb(0,0,0,0.4)] hover:bg-slate-100 transition-all active:scale-90"
        >
          <span className="material-symbols-outlined text-3xl font-bold">my_location</span>
        </button>
        <button 
          onClick={handleToggleMapType}
          className={`w-14 h-14 backdrop-blur-xl rounded-2xl flex items-center justify-center border shadow-2xl transition-all active:scale-95 ${
            mapType === 'hybrid' 
            ? 'bg-primary text-white border-primary/20' 
            : 'bg-card-dark/90 text-white border-white/5 hover:bg-white/10'
          }`}
        >
          <span className="material-symbols-outlined">layers</span>
        </button>
        <button 
          onClick={() => onNavigate(ScreenType.CREATE_MEETING)}
          className="w-14 h-14 bg-primary rounded-2xl flex items-center justify-center text-white shadow-xl shadow-primary/30 hover:bg-blue-600 transition-all active:scale-95 group relative"
        >
          <span className="material-symbols-outlined text-3xl">add</span>
          <div className="absolute right-16 px-3 py-1 bg-card-dark text-white text-[10px] font-bold rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-2xl border border-white/10">
            {t('meeting_create')}
          </div>
        </button>
      </div>

      {/* Dashboard Expandable Sheet */}
      <div 
        className={`absolute bottom-0 left-0 right-0 bg-background-dark/95 backdrop-blur-3xl border-t border-white/10 rounded-t-[3rem] z-40 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] shadow-[0_-20px_80px_rgba(0,0,0,0.8)] ${isExpanded ? 'h-[90%]' : 'h-24'}`}
      >
        <div className="w-full h-full relative overflow-hidden flex flex-col pt-2">
          {/* Grab Handle */}
          <div className="w-full flex justify-center py-2" onClick={() => setIsExpanded(!isExpanded)}>
            <div className="w-12 h-1.5 bg-white/20 rounded-full cursor-pointer hover:bg-white/40 transition-colors"></div>
          </div>

          {!isExpanded && (
            <div className="px-6 flex items-center justify-between" onClick={() => setIsExpanded(true)}>
              <div className="flex items-center gap-3">
                <div className="flex -space-x-3">
                  {friends.map(f => (
                    <div key={f.id} className="w-8 h-8 rounded-full border-2 border-background-dark shadow-lg bg-card-dark flex items-center justify-center">
                      <span className="text-[10px] font-black text-white">{f.name.substring(0, 1)}</span>
                    </div>
                  ))}
                </div>
                <div>
                  <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{friends.length} {t('dashboard_friends_online')}</p>
                  <p className="text-white text-xs font-bold">{notificationCount} {t('dashboard_new_messages')}</p>
                </div>
              </div>
              <button className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <span className="material-symbols-outlined font-bold">keyboard_arrow_up</span>
              </button>
            </div>
          )}

          {isExpanded && (
            <div className="px-6 pb-24 h-full flex flex-col pt-4 overflow-y-auto scrollbar-hide animate-fade-in-up">
              {/* Meeting Card */}
              <div className="bg-primary/10 border border-primary/20 rounded-[2rem] p-6 mb-8 relative overflow-hidden group">
                <div className="absolute top-0 right-0 bg-primary/20 p-4 rounded-bl-[2rem]">
                  <span className="material-symbols-outlined text-primary text-3xl">event</span>
                </div>
                <h4 className="text-primary text-[10px] font-black uppercase tracking-[0.2em] mb-2">{t('meeting_upcoming')}</h4>
                <h3 className="text-white text-xl font-extrabold mb-1">{activeMeeting.title}</h3>
                <div className="flex items-center gap-2 text-gray-400 text-xs mb-6">
                  <span className="material-symbols-outlined text-sm">schedule</span>
                  <span>{activeMeeting.time}</span>
                  <span className="w-1 h-1 rounded-full bg-gray-600"></span>
                  <span className="material-symbols-outlined text-sm">location_on</span>
                  <span className="truncate">{activeMeeting.location}</span>
                </div>
                <button 
                  onClick={() => onNavigate(ScreenType.MEETING_DETAILS)}
                  className="w-full py-4 bg-primary text-white font-bold rounded-2xl shadow-lg shadow-primary/20 hover:bg-blue-600 transition-all active:scale-[0.98]"
                >
                  {t('meeting_enter_chat') || '채팅 참여하기'}
                </button>
              </div>

              {/* Friends Horizontal List */}
              <div className="mb-10">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-white font-black text-lg">{t('nav_friends')}</h3>
                  <button onClick={() => onNavigate(ScreenType.FRIENDS)} className="text-primary text-xs font-bold uppercase tracking-widest">{t('meeting_view_all')}</button>
                </div>
                <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2">
                  {friends.map(f => (
                    <div key={f.id} className="flex flex-col items-center gap-2 shrink-0">
                      <div className="w-16 h-16 rounded-3xl p-0.5 border-2 border-white/5 bg-card-dark relative group flex items-center justify-center">
                        <span className="text-[16px] font-black text-white/50 group-hover:text-white transition-all uppercase">
                          {f.name.substring(0, 2)}
                        </span>
                        {f.status === 'nearby' && <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-background-dark shadow-lg pulse"></div>}
                      </div>
                      <span className="text-[10px] font-bold text-gray-500">{f.name}</span>
                    </div>
                  ))}
                  <button className="w-16 h-16 rounded-3xl border-2 border-dashed border-white/10 flex items-center justify-center text-gray-600 hover:text-white hover:border-white/20 transition-all shrink-0">
                    <span className="material-symbols-outlined">add</span>
                  </button>
                </div>
              </div>

              {/* Recent Chats */}
              <div className="flex-1">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-white font-black text-lg">{t('map_recent_chats')}</h3>
                  <button className="w-12 h-8 rounded-full bg-white/5 flex items-center justify-center text-primary hover:bg-white/10 transition-colors">
                    <span className="material-symbols-outlined text-xl">edit_square</span>
                  </button>
                </div>
                <div className="space-y-6">
                   {friends.slice(0, 2).map((f, i) => (
                     <div key={f.id} className="flex items-center gap-4 group cursor-pointer hover:bg-white/5 p-2 rounded-2xl transition-colors">
                       <div className="relative">
                         <div className="w-14 h-14 rounded-2xl bg-card-dark flex items-center justify-center border border-white/10 shadow-lg">
                           <span className="text-sm font-black text-white">{f.name.substring(0, 2)}</span>
                         </div>
                         <div className="absolute -bottom-1 -right-1 bg-background-dark p-0.5 rounded-lg flex items-center justify-center border border-white/10">
                           <div className="w-2.5 h-2.5 bg-primary rounded-full"></div>
                         </div>
                       </div>
                       <div className="flex-1">
                         <div className="flex justify-between items-center mb-0.5">
                           <h4 className="text-white font-bold">{f.name}</h4>
                           <span className="text-[10px] font-bold text-gray-600">12:30 PM</span>
                         </div>
                         <p className="text-xs text-gray-500 line-clamp-1 font-medium">{i === 0 ? "나 곧 도착해! 조금만 기다려줘 😊" : "오늘 약속 장소 여기 맞지? 📍"}</p>
                       </div>
                     </div>
                   ))}
                </div>
              </div>
            </div>
          )}

          {/* Persistent Bottom Nav */}
          <nav className="absolute bottom-0 left-0 right-0 h-24 bg-background-dark/80 backdrop-blur-xl border-t border-white/5 flex items-center justify-around px-4 pb-4">
             <button className="flex flex-col items-center gap-1.5 text-primary group">
               <div className="w-1 w-1 bg-primary rounded-full mb-1 opacity-0 group-hover:opacity-100 transition-opacity"></div>
               <span className="material-symbols-outlined text-2xl">map</span>
               <span className="text-[9px] font-black uppercase tracking-[0.15em]">{t('nav_map')}</span>
             </button>
             <button onClick={() => onNavigate(ScreenType.FRIENDS)} className="flex flex-col items-center gap-1.5 text-gray-500 hover:text-white transition-all transform active:scale-90">
               <span className="material-symbols-outlined text-2xl">group</span>
               <span className="text-[9px] font-black uppercase tracking-[0.15em]">{t('nav_friends')}</span>
             </button>
             <button onClick={() => onNavigate(ScreenType.MEETINGS)} className="flex flex-col items-center gap-1.5 text-gray-500 hover:text-white transition-all transform active:scale-90">
               <span className="material-symbols-outlined text-2xl">forum</span>
               <span className="text-[9px] font-black uppercase tracking-[0.15em]">{t('nav_meetings')}</span>
             </button>
             <button onClick={() => onNavigate(ScreenType.SETTINGS)} className="flex flex-col items-center gap-1.5 text-gray-500 hover:text-white transition-all transform active:scale-90">
               <span className="material-symbols-outlined text-2xl">person</span>
               <span className="text-[9px] font-black uppercase tracking-[0.15em]">{t('nav_profile')}</span>
             </button>
          </nav>
        </div>
      </div>
    </div>
  );
};

export default CombinedView;
