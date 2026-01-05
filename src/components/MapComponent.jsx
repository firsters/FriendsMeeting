import React, { useEffect, useState } from 'react';
import { Map, AdvancedMarker, useMap, useMapsLibrary } from '@vis.gl/react-google-maps';
import { useTranslation } from '../context/LanguageContext';
import { calculateDistance, formatDistance } from '../utils/distanceUtils';

const MapUpdater = ({ 
    center, 
    userLocation, 
    shouldPan = true, 
    centerTrigger = 0, 
    centerOnMeTrigger = 0, 
    internalPanTrigger = 0 
}) => {
    const map = useMap();
    const [lastTrigger, setLastTrigger] = useState(0);
    const [lastInternalTrigger, setLastInternalTrigger] = useState(0);
    const [lastCenterOnMeTrigger, setLastCenterOnMeTrigger] = useState(0);

    useEffect(() => {
        if (!map) return;

        // 1. Explicit My Location Trigger (Highest Priority)
        if (centerOnMeTrigger > lastCenterOnMeTrigger && userLocation) {
            const myPos = { lat: userLocation[0], lng: userLocation[1] };
            map.panTo(myPos);
            setLastCenterOnMeTrigger(centerOnMeTrigger);
            return; // Exit to avoid conflict with other triggers in same frame
        }

        // 2. Manual Marker/Place Trigger
        if (centerTrigger > lastTrigger && center) {
            map.panTo(center);
            setLastTrigger(centerTrigger);
        } 
        
        // 3. Internal Selection Trigger
        else if (internalPanTrigger > lastInternalTrigger && center) {
            map.panTo(center);
            setLastInternalTrigger(internalPanTrigger);
        } 
    }, [map, center, userLocation, centerTrigger, lastTrigger, internalPanTrigger, lastInternalTrigger, centerOnMeTrigger, lastCenterOnMeTrigger]);
    
    return null;
};

const MapInstanceShaper = ({ onMapLoad }) => {
    const map = useMap();
    useEffect(() => {
        if (map && onMapLoad) {
            onMapLoad(map);
        }
    }, [map, onMapLoad]);
    return null;
};

const GeocodingHandler = ({ location, onAddressResolved }) => {
    const { t } = useTranslation();
    const geocodingLib = useMapsLibrary('geocoding');
    const [geocoder, setGeocoder] = useState(null);

    useEffect(() => {
        if (!geocodingLib) return;
        setGeocoder(new geocodingLib.Geocoder());
    }, [geocodingLib]);

    useEffect(() => {
        if (!geocoder || !location || !onAddressResolved) return;

        geocoder.geocode({ location }, (results, status) => {
            if (status === 'OK' && results[0]) {
                onAddressResolved(results[0].formatted_address);
            } else {
                console.error("Geocode failed due to: " + status);
                onAddressResolved(t('map_location_unavailable'));
            }
        });
    }, [geocoder, location, onAddressResolved, t]);

    return null;
};

const FriendGeocodingHandler = ({ friends, onFriendAddressResolved }) => {
    const geocodingLib = useMapsLibrary('geocoding');
    const [geocoder, setGeocoder] = useState(null);

    useEffect(() => {
        if (!geocodingLib) return;
        setGeocoder(new geocodingLib.Geocoder());
    }, [geocodingLib]);

    useEffect(() => {
        if (!geocoder || !friends || !onFriendAddressResolved) return;

        friends.forEach(friend => {
            if (!friend.address && friend.lat && friend.lng) {
                geocoder.geocode({ location: { lat: friend.lat, lng: friend.lng } }, (results, status) => {
                    if (status === 'OK' && results[0]) {
                        onFriendAddressResolved(friend.id, results[0].formatted_address);
                    }
                });
            }
        });
    }, [geocoder, friends, onFriendAddressResolved]);

    return null;
};

const EdgeMarkers = ({ meetingLocation, generalLocation, friends, userLocation, onCenterMarker, bottomOffset = 100, topOffset = 80 }) => {
    const map = useMap();
    const [bounds, setBounds] = useState(null);

    useEffect(() => {
        if (!map) return;
        const listener = map.addListener('bounds_changed', () => {
            setBounds(map.getBounds());
        });
        setBounds(map.getBounds());
        return () => listener.remove();
    }, [map]);

    if (!bounds) return null;

    const center = map.getCenter().toJSON();
    const ne = bounds.getNorthEast().toJSON();
    const sw = bounds.getSouthWest().toJSON();

    const calculateEdgePoint = (target) => {
        if (!target || !target.lat || !target.lng) return null;
        if (bounds.contains(target)) return null;

        const dLat = target.lat - center.lat;
        const dLng = target.lng - center.lng;

        const latMargin = (ne.lat - sw.lat) * 0.01;
        const lngMargin = (ne.lng - sw.lng) * 0.01;

        const mapContainer = map.getDiv();
        const heightInPixels = mapContainer.offsetHeight;
        const latRange = ne.lat - sw.lat;
        const pixelToLat = latRange / heightInPixels;
        
        const bottomSafeLat = sw.lat + (bottomOffset * pixelToLat);
        const topSafeLat = ne.lat - (topOffset * pixelToLat);

        const north = Math.min(ne.lat - latMargin, topSafeLat);
        const south = Math.max(sw.lat + latMargin, bottomSafeLat);
        const east = ne.lng - lngMargin;
        const west = sw.lng + lngMargin;

        let t = 2;

        if (dLat > 0) t = Math.min(t, (north - center.lat) / dLat);
        else if (dLat < 0) t = Math.min(t, (south - center.lat) / dLat);

        if (dLng > 0) t = Math.min(t, (east - center.lng) / dLng);
        else if (dLng < 0) t = Math.min(t, (west - center.lng) / dLng);

        if (t < 0 || t > 1) return null;

        return {
            lat: center.lat + t * dLat,
            lng: center.lng + t * dLng,
            original: target
        };
    };

    const edgePoints = [];
    if (meetingLocation) {
        const pt = calculateEdgePoint({ lat: meetingLocation.lat, lng: meetingLocation.lng });
        if (pt) edgePoints.push({ ...pt, type: 'meeting', data: meetingLocation });
    }
    if (generalLocation) {
        const pt = calculateEdgePoint(generalLocation);
        if (pt) edgePoints.push({ ...pt, type: 'general', data: generalLocation });
    }
    friends.forEach(friend => {
        const friendPos = {
            lat: friend.lat,
            lng: friend.lng
        };
        const pt = calculateEdgePoint(friendPos);
        if (pt) edgePoints.push({ ...pt, type: 'friend', data: friend, pos: friendPos });
    });

    if (userLocation) {
        const userPos = { lat: userLocation[0], lng: userLocation[1] };
        const pt = calculateEdgePoint(userPos);
        if (pt) edgePoints.push({ ...pt, type: 'me', data: { name: '나' }, pos: userPos });
    }

    return (
        <>
            {edgePoints.map((pt, idx) => (
                <AdvancedMarker
                    key={`${pt.type}-${idx}`}
                    position={{ lat: pt.lat, lng: pt.lng }}
                    onClick={() => onCenterMarker(pt.original || pt.pos)}
                >
                    <div className="relative group cursor-pointer transition-all hover:scale-110">
                        <div className={`w-9 h-9 rounded-full bg-[#1a1a1a]/95 backdrop-blur-md border-[2.5px] flex items-center justify-center shadow-2xl overflow-hidden
                            ${pt.type === 'meeting' ? 'border-primary shadow-primary/30' : 
                              pt.type === 'general' ? 'border-red-500 shadow-red-500/30' : 
                              pt.type === 'me' ? 'border-blue-400 shadow-blue-400/30' :
                              'border-white/40 shadow-white/10'}`}
                        >
                            {pt.type === 'meeting' && (
                                <span className="material-symbols-outlined text-primary text-base font-bold">star</span>
                            )}
                            {pt.type === 'general' && (
                                <span className="material-symbols-outlined text-red-500 text-base font-bold">location_on</span>
                            )}
                            {(pt.type === 'friend' || pt.type === 'me') && (
                                <div className="flex items-center justify-center w-full h-full">
                                    <span className="text-[14px] font-black text-white uppercase tracking-tighter">
                                        {pt.type === 'me' ? '나' : pt.data.name.substring(0, 2)}
                                    </span>
                                </div>
                            )}
                        </div>
                        
                        <div className="absolute -inset-3 flex items-center justify-center pointer-events-none">
                             <div 
                                className={`w-full h-full border-2 rounded-full animate-ping opacity-60
                                    ${pt.type === 'meeting' ? 'border-primary' : 
                                      pt.type === 'general' ? 'border-red-500' : 
                                      'border-white/40'}`}
                                style={{ transform: `rotate(${Math.atan2(pt.lat - center.lat, pt.lng - center.lng)}rad)` }}
                             ></div>
                        </div>
                        
                        <div className={`absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-[#1a1a1a] shadow-lg
                            ${pt.type === 'meeting' ? 'bg-primary' : 
                              pt.type === 'general' ? 'bg-red-500' : 
                              pt.type === 'me' ? 'bg-blue-500' :
                              pt.data.status === 'nearby' ? 'bg-blue-500' :
                              pt.data.status === 'driving' ? 'bg-orange-500' :
                              'bg-gray-400'}`}
                        ></div>
                    </div>
                </AdvancedMarker>
            ))}
        </>
    );
};

const PlacesHandler = ({ searchQuery, searchTrigger = 0, onSearchResults, selectedPlaceId, onPlaceSelected }) => {
    const placesLib = useMapsLibrary('places');
    const geocodingLib = useMapsLibrary('geocoding');
    const [autocompleteService, setAutocompleteService] = useState(null);
    const [geocoder, setGeocoder] = useState(null);

    useEffect(() => {
        if (!placesLib || !geocodingLib) return;
        setAutocompleteService(new placesLib.AutocompleteService());
        setGeocoder(new geocodingLib.Geocoder());
    }, [placesLib, geocodingLib]);

    useEffect(() => {
        if (!autocompleteService || !searchQuery || searchQuery.length < 2) return;

        const request = { input: searchQuery };
        autocompleteService.getPlacePredictions(request, (results, status) => {
             if (status === placesLib.PlacesServiceStatus.OK && results) {
                 onSearchResults(results);
             } else {
                 onSearchResults([]);
             }
        });
    }, [autocompleteService, searchQuery, placesLib, searchTrigger]);

    useEffect(() => {
        if (!geocoder || !selectedPlaceId) return;

        geocoder.geocode({ placeId: selectedPlaceId }, (results, status) => {
            if (status === 'OK' && results[0]) {
                const location = {
                    lat: results[0].geometry.location.lat(),
                    lng: results[0].geometry.location.lng(),
                    address: results[0].formatted_address
                };
                onPlaceSelected(location);
            } else {
                console.error("Geocode failed: " + status);
            }
        });
    }, [geocoder, selectedPlaceId]);

    return null;
};

// UI Component for User Marker (Reusable for Real Map and Debug View)
const UserMarkerContent = ({ showMeTooltip, myDistanceToMeeting, meetingLocation, t, isLocationMocked }) => (
    <div className="relative flex flex-col items-center justify-center">
         {/* Anchored Tooltip for Me */}
         {showMeTooltip && (
            <div className="absolute bottom-[calc(100%+8px)] bg-card-dark/95 backdrop-blur-md px-3 py-2 rounded-2xl border border-white/10 shadow-2xl animate-fade-in-up whitespace-nowrap z-50">
                <div className="flex flex-col items-center gap-0.5">
                    <p className="text-[13px] font-black text-white leading-none tracking-tight">
                        {isLocationMocked ? (t('map_location_mock') || "위치 미확인 (기본값)") : (t('chat_me') || "나")}
                    </p>
                    <p className="text-[9px] text-white/80 font-bold tracking-wider">
                        {meetingLocation && meetingLocation.lat
                            ? `${t('distance_to_meeting')} ${myDistanceToMeeting}`
                            : t('header_no_location')}
                    </p>
                </div>
                {/* Tooltip Arrow */}
                <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-card-dark/95 border-r border-b border-white/10 rotate-45"></div>
            </div>
        )}

        <div className="relative flex items-center justify-center w-12 h-12 cursor-pointer">
            <div className={`absolute inset-0 rounded-full animate-ping ${isLocationMocked ? 'bg-gray-500/30' : 'bg-blue-500/30'}`}></div>
            <div className={`w-6 h-6 rounded-full border-2 border-white shadow-lg relative z-10 flex items-center justify-center ${isLocationMocked ? 'bg-gray-500' : 'bg-blue-500'}`}>
                {isLocationMocked ? (
                    <span className="material-symbols-outlined text-[10px] text-white font-bold">question_mark</span>
                ) : (
                    <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                )}
            </div>
        </div>
    </div>
);

const MapComponent = ({
    friends,
    selectedFriend,
    onFriendClick,
    userLocation,
    isLocationMocked = false,
    center,
    onAddressResolved,
    searchQuery,
    searchTrigger = 0,
    onSearchResults,
    selectedPlaceId,
    onPlaceSelected,
    onMarkerDrag,
    onMarkerDragEnd,
    generalSearchQuery,
    generalSearchTrigger = 0,
    onGeneralSearchResults,
    generalSelectedPlaceId,
    onGeneralPlaceSelected,
    centerTrigger = 0,
    centerOnMeTrigger = 0,
    mapType = 'roadmap',
    meetingLocation = null,
    generalLocation = null,
    onCenterRequest,
    onFriendAddressResolved,
    isMeetingHost = false,
    bottomOffset = 100,
    topOffset = 80
}) => {
    const { t } = useTranslation();
    const [initialCenter, setInitialCenter] = useState({ lat: 37.5665, lng: 126.9780 });
    const [currentCenter, setCurrentCenter] = useState({ lat: 37.5665, lng: 126.9780 });
    const [hasCenteredInitially, setHasCenteredInitially] = useState(false);
    const [internalPanTrigger, setInternalPanTrigger] = useState(0);
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    const [mapInstance, setMapInstance] = useState(null);
    const [showMeTooltip, setShowMeTooltip] = useState(false);

    useEffect(() => {
        if (center) {
            setCurrentCenter(center);
        }
    }, [center]);

    useEffect(() => {
        if (selectedFriend) {
            setShowMeTooltip(false);
        }
    }, [selectedFriend]);

    const darkMapStyle = [
        { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
        { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
        { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
        {
          featureType: "administrative.locality",
          elementType: "labels.text.fill",
          stylers: [{ color: "#d59563" }],
        },
        {
          featureType: "poi",
          elementType: "labels.text.fill",
          stylers: [{ color: "#d59563" }],
        },
        {
          featureType: "poi.park",
          elementType: "geometry",
          stylers: [{ color: "#263c3f" }],
        },
        {
          featureType: "poi.park",
          elementType: "labels.text.fill",
          stylers: [{ color: "#6b9a76" }],
        },
        {
          featureType: "road",
          elementType: "geometry",
          stylers: [{ color: "#38414e" }],
        },
        {
          featureType: "road",
          elementType: "geometry.stroke",
          stylers: [{ color: "#212a37" }],
        },
        {
          featureType: "road",
          elementType: "labels.text.fill",
          stylers: [{ color: "#9ca5b3" }],
        },
        {
          featureType: "road.highway",
          elementType: "geometry",
          stylers: [{ color: "#746855" }],
        },
        {
          featureType: "road.highway",
          elementType: "geometry.stroke",
          stylers: [{ color: "#1f2835" }],
        },
        {
          featureType: "road.highway",
          elementType: "labels.text.fill",
          stylers: [{ color: "#f3d19c" }],
        },
        {
          featureType: "transit",
          elementType: "geometry",
          stylers: [{ color: "#2f3948" }],
        },
        {
          featureType: "transit.station",
          elementType: "labels.text.fill",
          stylers: [{ color: "#d59563" }],
        },
        {
          featureType: "water",
          elementType: "geometry",
          stylers: [{ color: "#17263c" }],
        },
        {
          featureType: "water",
          elementType: "labels.text.fill",
          stylers: [{ color: "#515c6d" }],
        },
        {
          featureType: "water",
          elementType: "labels.text.stroke",
          stylers: [{ color: "#17263c" }],
        },
    ];

    useEffect(() => {
        if (centerTrigger > 0) {
            setHasCenteredInitially(true);
            return;
        }

        if (userLocation && !hasCenteredInitially && mapInstance) {
            const newCenter = { lat: userLocation[0], lng: userLocation[1] };
            setCurrentCenter(newCenter);
            mapInstance.setCenter(newCenter);
            setHasCenteredInitially(true);
        }
    }, [userLocation, mapInstance, hasCenteredInitially, centerTrigger]);

    const handlePlaceSelected = (location) => {
        setCurrentCenter(location);
        setInternalPanTrigger(prev => prev + 1);
        if (onPlaceSelected) onPlaceSelected(location);
    };

    const handleGeneralPlaceSelected = (location) => {
        setCurrentCenter(location);
        setInternalPanTrigger(prev => prev + 1);
        if (onGeneralPlaceSelected) onGeneralPlaceSelected(location);
    };

    const handleFriendClick = (friend, pos) => {
        setCurrentCenter(pos);
        setInternalPanTrigger(prev => prev + 1);
        if (onFriendClick) onFriendClick(friend);
    };

    const handleMapLoad = (map) => {
        setMapInstance(map);
    };

    const handleCenterOnMarker = (pos) => {
        if (!pos) return;
        setCurrentCenter(pos);
        setInternalPanTrigger(prev => prev + 1);
        if (onCenterRequest) onCenterRequest(pos);
    };

    const handleMeClick = () => {
        setShowMeTooltip(prev => !prev);
        if (!showMeTooltip && selectedFriend && onFriendClick) {
            onFriendClick(null);
        }
    };

    useEffect(() => {
        if (!userLocation && navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    const newPos = { lat: pos.coords.latitude, lng: pos.coords.longitude };
                    setInitialCenter(newPos); 
                    setCurrentCenter(newPos);
                    
                    if (!hasCenteredInitially && mapInstance) {
                        mapInstance.setCenter(newPos);
                        setHasCenteredInitially(true);
                    }
                },
                (err) => console.error(err)
            );
        }
    }, [userLocation, mapInstance, hasCenteredInitially]);

    let myDistanceToMeeting = null;
    if (meetingLocation && meetingLocation.lat && meetingLocation.lng && userLocation) {
        const distMeters = calculateDistance(userLocation[0], userLocation[1], meetingLocation.lat, meetingLocation.lng);
        myDistanceToMeeting = formatDistance(distMeters);
    }

    // DEBUG MODE: Fallback for Dev without API Key to prevent crash and allow testing
    if (!apiKey) {
        return (
             <div className="relative w-full h-full bg-[#1a1a1a] flex items-center justify-center overflow-hidden">
                <div className="absolute top-4 left-4 text-white/50 text-xs z-50">Dev Mode: No API Key</div>

                {/* Mock User Marker (Centered) */}
                {userLocation && (
                    <div
                        className="absolute flex items-center justify-center"
                        style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}
                        onClick={handleMeClick}
                    >
                        <UserMarkerContent
                            showMeTooltip={showMeTooltip}
                            myDistanceToMeeting={myDistanceToMeeting}
                            meetingLocation={meetingLocation}
                            t={t}
                        />
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="relative w-full h-full">
            <Map
                defaultCenter={initialCenter}
                defaultZoom={15}
                mapId="DEMO_MAP_ID"
                gestureHandling={'greedy'}
                mapTypeId={mapType}
                disableDefaultUI={true}
                styles={mapType === 'roadmap' ? darkMapStyle : []}
                className="w-full h-full"
            >
                <MapInstanceShaper onMapLoad={handleMapLoad} />
                <MapUpdater
                    center={currentCenter}
                    userLocation={userLocation}
                    shouldPan={hasCenteredInitially}
                    centerTrigger={centerTrigger}
                    centerOnMeTrigger={centerOnMeTrigger}
                    internalPanTrigger={internalPanTrigger}
                />
                <GeocodingHandler location={currentCenter} onAddressResolved={onAddressResolved} />
                <FriendGeocodingHandler friends={friends} onFriendAddressResolved={onFriendAddressResolved} />
                <EdgeMarkers 
                    meetingLocation={meetingLocation} 
                    generalLocation={generalLocation}
                    friends={friends}
                    userLocation={userLocation}
                    onCenterMarker={handleCenterOnMarker}
                    bottomOffset={bottomOffset}
                    topOffset={topOffset}
                />

                <PlacesHandler
                    searchQuery={searchQuery}
                    searchTrigger={searchTrigger}
                    onSearchResults={onSearchResults}
                    selectedPlaceId={selectedPlaceId}
                    onPlaceSelected={handlePlaceSelected}
                />

                <PlacesHandler
                    searchQuery={generalSearchQuery}
                    searchTrigger={generalSearchTrigger}
                    onSearchResults={onGeneralSearchResults}
                    selectedPlaceId={generalSelectedPlaceId}
                    onPlaceSelected={handleGeneralPlaceSelected}
                />

                {meetingLocation && meetingLocation.lat && (
                    <AdvancedMarker
                        position={{ lat: meetingLocation.lat, lng: meetingLocation.lng }}
                        draggable={isMeetingHost}
                        onDrag={(e) => isMeetingHost && onMarkerDrag && onMarkerDrag('meeting', e.latLng.toJSON())}
                        onDragEnd={(e) => isMeetingHost && onMarkerDragEnd && onMarkerDragEnd('meeting', e.latLng.toJSON())}
                        className={!isMeetingHost ? "cursor-default" : "cursor-grab"}
                    >
                        <div className={`relative flex flex-col items-center animate-bounce-short ${isMeetingHost ? 'cursor-grab active:cursor-grabbing' : ''}`}>
                            <div className={`w-12 h-12 rounded-full bg-gradient-to-tr from-primary to-blue-400 border-4 border-white shadow-2xl flex items-center justify-center relative z-10 ${!isMeetingHost ? 'opacity-90' : ''}`}>
                                <span className="material-symbols-outlined text-white text-2xl drop-shadow-md">star</span>
                            </div>
                            <div className="absolute -bottom-1 w-4 h-2 bg-black/50 blur-sm rounded-full"></div>
                            <div className="mt-1 bg-white/90 backdrop-blur px-2 py-1 rounded-lg border border-white/20 shadow-lg">
                                <p className="text-[10px] font-bold text-gray-800 whitespace-nowrap">{meetingLocation.name}</p>
                            </div>
                        </div>
                    </AdvancedMarker>
                )}

                {generalLocation && (
                    <AdvancedMarker
                        position={generalLocation}
                        draggable={true}
                        onDrag={(e) => onMarkerDrag && onMarkerDrag('general', e.latLng.toJSON())}
                        onDragEnd={(e) => onMarkerDragEnd && onMarkerDragEnd('general', e.latLng.toJSON())}
                    >
                        <div className="relative flex flex-col items-center animate-bounce-short cursor-grab active:cursor-grabbing">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-red-500 to-red-600 border-4 border-white shadow-2xl flex items-center justify-center relative z-10">
                                <span className="material-symbols-outlined text-white text-xl drop-shadow-md">location_on</span>
                            </div>
                            <div className="absolute -bottom-1 w-3 h-1.5 bg-black/50 blur-sm rounded-full"></div>
                        </div>
                    </AdvancedMarker>
                )}

                {userLocation && (
                    <AdvancedMarker
                        position={{ lat: userLocation[0], lng: userLocation[1] }}
                        onClick={handleMeClick}
                        zIndex={showMeTooltip ? 100 : 1}
                    >
                         <UserMarkerContent
                            showMeTooltip={showMeTooltip}
                            myDistanceToMeeting={myDistanceToMeeting}
                            meetingLocation={meetingLocation}
                            t={t}
                            isLocationMocked={isLocationMocked}
                        />
                    </AdvancedMarker>
                )}

                {friends.map((friend) => {
                    const friendPos = {
                        lat: friend.lat,
                        lng: friend.lng
                    };
                    const isSelected = selectedFriend?.id === friend.id;

                    let distanceToMeeting = null;
                    if (meetingLocation && meetingLocation.lat && meetingLocation.lng && friend.lat && friend.lng) {
                        const distMeters = calculateDistance(friend.lat, friend.lng, meetingLocation.lat, meetingLocation.lng);
                        distanceToMeeting = formatDistance(distMeters);
                    }

                    return (
                        <AdvancedMarker
                            key={friend.id}
                            position={friendPos}
                            onClick={() => {
                                const nextFriend = isSelected ? null : friend;
                                onFriendClick?.(nextFriend);
                            }}
                            zIndex={isSelected ? 100 : 1}
                        >
                            <div className="relative flex flex-col items-center">
                                {isSelected && (
                                    <div className="absolute bottom-[calc(100%+8px)] bg-card-dark/95 backdrop-blur-md px-3 py-2 rounded-2xl border border-white/10 shadow-2xl animate-fade-in-up whitespace-nowrap z-50">
                                        <div className="flex flex-col items-center gap-0.5">
                                            <p className="text-[13px] font-black text-white leading-none tracking-tight">{friend.name}</p>
                                            <p className={`text-[9px] font-bold uppercase tracking-widest opacity-90 ${friend.status === 'paused' ? 'text-gray-400' : 'text-primary'}`}>
                                                {friend.status === 'paused' ? 'Paused' : `${friend.status} • ${friend.distance || 'nearby'}`}
                                            </p>
                                            {friend.status !== 'paused' && (
                                              <p className="text-[9px] text-white/80 font-bold tracking-wider">
                                                  {meetingLocation && meetingLocation.lat
                                                      ? `${t('distance_to_meeting')} ${distanceToMeeting}`
                                                      : t('header_no_location')}
                                              </p>
                                            )}
                                        </div>
                                        <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-card-dark/95 border-r border-b border-white/10 rotate-45"></div>
                                    </div>
                                )}

                                <div className={`relative group cursor-pointer transition-transform hover:scale-110 ${friend.status === 'paused' ? 'opacity-50' : ''}`}>
                                    <div
                                        className={`w-10 h-10 rounded-full border-[2.5px] bg-[#1a1a1a] shadow-xl flex items-center justify-center transition-colors
                                            ${isSelected ? 'border-primary ring-4 ring-primary/20' : 'border-white/20'}`}
                                        style={!isSelected && friend.status === 'nearby' ? { borderColor: '#4285F4' } : 
                                               !isSelected && friend.status === 'driving' ? { borderColor: '#F97316' } :
                                               friend.status === 'paused' ? { borderColor: '#9CA3AF' } : {}}
                                    >
                                        <span className="text-[15px] font-black text-white uppercase tracking-tighter">
                                            {friend.name.substring(0, 2)}
                                        </span>
                                        {friend.status === 'paused' && (
                                          <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full">
                                            <span className="material-symbols-outlined text-[10px] text-white">pause</span>
                                          </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </AdvancedMarker>
                    );
                })}
            </Map>
        </div>
    );
};

export default MapComponent;
