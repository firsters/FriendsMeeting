import React, { useEffect, useState } from 'react';
import { Map, AdvancedMarker, useMap, useMapsLibrary } from '@vis.gl/react-google-maps';
import { useTranslation } from '../context/LanguageContext';

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
        
        // 4. Auto-tracking (Passive)
        else if (shouldPan && center) {
            map.panTo(center);
        }
    }, [map, center, userLocation, shouldPan, centerTrigger, lastTrigger, internalPanTrigger, lastInternalTrigger, centerOnMeTrigger, lastCenterOnMeTrigger]);
    
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

const EdgeMarkers = ({ meetingLocation, generalLocation, friends, onCenterMarker, bottomOffset = 100, topOffset = 80 }) => {
    const map = useMap();
    const [bounds, setBounds] = useState(null);

    useEffect(() => {
        if (!map) return;
        const listener = map.addListener('bounds_changed', () => {
            setBounds(map.getBounds());
        });
        // Initial bounds
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

        // Apply a very small margin (1%) to sit exactly on the edge
        const latMargin = (ne.lat - sw.lat) * 0.01;
        const lngMargin = (ne.lng - sw.lng) * 0.01;

        // Bottom Safe Area Calculation (convert pixels to lat/lng)
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

        let t = 2; // Start with a value > 1

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
            lat: center.lat + (friend.y - 50) * 0.0001,
            lng: center.lng + (friend.x - 50) * 0.0001
        };
        const pt = calculateEdgePoint(friendPos);
        if (pt) edgePoints.push({ ...pt, type: 'friend', data: friend, pos: friendPos });
    });

    return (
        <>
            {edgePoints.map((pt, idx) => (
                <AdvancedMarker
                    key={`${pt.type}-${idx}`}
                    position={{ lat: pt.lat, lng: pt.lng }}
                    onClick={() => onCenterMarker(pt.original || pt.pos)}
                >
                    <div className="relative group cursor-pointer transition-all hover:scale-110">
                        {/* Virtual Marker Container: Larger, more vibrant */}
                        <div className={`w-9 h-9 rounded-full bg-[#1a1a1a]/95 backdrop-blur-md border-[2.5px] flex items-center justify-center shadow-2xl overflow-hidden
                            ${pt.type === 'meeting' ? 'border-primary shadow-primary/30' : 
                              pt.type === 'general' ? 'border-red-500 shadow-red-500/30' : 
                              'border-white/40 shadow-white/10'}`}
                        >
                            {pt.type === 'meeting' && (
                                <span className="material-symbols-outlined text-primary text-base font-bold">star</span>
                            )}
                            {pt.type === 'general' && (
                                <span className="material-symbols-outlined text-red-500 text-base font-bold">location_on</span>
                            )}
                            {pt.type === 'friend' && (
                                <img src={pt.data.image} className="w-full h-full object-cover" alt={pt.data.name} />
                            )}
                        </div>
                        
                        {/* Directional Wave Overlay */}
                        <div className="absolute -inset-3 flex items-center justify-center pointer-events-none">
                             <div 
                                className={`w-full h-full border-2 rounded-full animate-ping opacity-60
                                    ${pt.type === 'meeting' ? 'border-primary' : 
                                      pt.type === 'general' ? 'border-red-500' : 
                                      'border-white/40'}`}
                                style={{ transform: `rotate(${Math.atan2(pt.lat - center.lat, pt.lng - center.lng)}rad)` }}
                             ></div>
                        </div>
                        
                        {/* Status Indicator Dot */}
                        <div className={`absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-[#1a1a1a] shadow-lg
                            ${pt.type === 'meeting' ? 'bg-primary' : 
                              pt.type === 'general' ? 'bg-red-500' : 
                              'bg-white'}`}
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

    // Handle Search Query
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

    // Handle Place Selection
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

const MapComponent = ({
    friends,
    onFriendClick,
    userLocation,
    onAddressResolved,
    searchQuery,
    searchTrigger = 0,
    onSearchResults,
    selectedPlaceId,
    onPlaceSelected,
    onMarkerDrag,
    onMarkerDragEnd,
    // General Search Props
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
    bottomOffset = 100,
    topOffset = 80
}) => {
    const { t } = useTranslation();
    // Initial center state only for defaultCenter
    const [initialCenter] = useState({ lat: 37.5665, lng: 126.9780 });
    const [currentCenter, setCurrentCenter] = useState({ lat: 37.5665, lng: 126.9780 });
    const [hasCenteredInitially, setHasCenteredInitially] = useState(false);
    const [internalPanTrigger, setInternalPanTrigger] = useState(0);
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    const [mapInstance, setMapInstance] = useState(null);

    // Dark Mode Map Style
    const mapId = "DEMO_MAP_ID"; // In production, use a real Map ID from Google Cloud Console for advanced markers
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

    // Initial Center only
    useEffect(() => {
        if (userLocation && !hasCenteredInitially && mapInstance) {
            const newCenter = { lat: userLocation[0], lng: userLocation[1] };
            setCurrentCenter(newCenter);
            mapInstance.setCenter(newCenter);
            setHasCenteredInitially(true);
        }
    }, [userLocation, mapInstance, hasCenteredInitially]);

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

    // Fallback geolocation
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

    return (
        <div className="relative w-full h-full">
            <Map
                defaultCenter={initialCenter}
                defaultZoom={15}
                mapId={mapId}
                gestureHandling={'greedy'}
                mapTypeId={mapType}
                disableDefaultUI={true}
                styles={mapType === 'roadmap' ? darkMapStyle : []}
                className="w-full h-full"
                onLoad={(ev) => handleMapLoad(ev.detail.map)}
            >
                <MapUpdater
                    center={currentCenter}
                    userLocation={userLocation}
                    shouldPan={hasCenteredInitially}
                    centerTrigger={centerTrigger}
                    centerOnMeTrigger={centerOnMeTrigger}
                    internalPanTrigger={internalPanTrigger}
                />
                <GeocodingHandler location={currentCenter} onAddressResolved={onAddressResolved} />
                <EdgeMarkers 
                    meetingLocation={meetingLocation} 
                    generalLocation={generalLocation}
                    friends={friends}
                    onCenterMarker={handleCenterOnMarker}
                    bottomOffset={bottomOffset}
                    topOffset={topOffset}
                />

                {/* Primary Search (Meeting Location) */}
                <PlacesHandler
                    searchQuery={searchQuery}
                    searchTrigger={searchTrigger}
                    onSearchResults={onSearchResults}
                    selectedPlaceId={selectedPlaceId}
                    onPlaceSelected={handlePlaceSelected}
                />

                {/* Secondary Search (General) */}
                <PlacesHandler
                    searchQuery={generalSearchQuery}
                    searchTrigger={generalSearchTrigger}
                    onSearchResults={onGeneralSearchResults}
                    selectedPlaceId={generalSelectedPlaceId}
                    onPlaceSelected={handleGeneralPlaceSelected}
                />

                {/* Meeting Location Marker */}
                {meetingLocation && meetingLocation.lat && (
                    <AdvancedMarker
                        position={{ lat: meetingLocation.lat, lng: meetingLocation.lng }}
                        draggable={true}
                        onDrag={(e) => onMarkerDrag && onMarkerDrag('meeting', e.latLng.toJSON())}
                        onDragEnd={(e) => onMarkerDragEnd && onMarkerDragEnd('meeting', e.latLng.toJSON())}
                    >
                        <div className="relative flex flex-col items-center animate-bounce-short cursor-grab active:cursor-grabbing">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-primary to-blue-400 border-4 border-white shadow-2xl flex items-center justify-center relative z-10">
                                <span className="material-symbols-outlined text-white text-2xl drop-shadow-md">star</span>
                            </div>
                            <div className="absolute -bottom-1 w-4 h-2 bg-black/50 blur-sm rounded-full"></div>
                            <div className="mt-1 bg-white/90 backdrop-blur px-2 py-1 rounded-lg border border-white/20 shadow-lg">
                                <p className="text-[10px] font-bold text-gray-800 whitespace-nowrap">{meetingLocation.name}</p>
                            </div>
                        </div>
                    </AdvancedMarker>
                )}

                {/* General Search Marker (Red Pin) */}
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

                {/* User Location Marker (Real GPS position) */}
                {userLocation && (
                    <AdvancedMarker position={{ lat: userLocation[0], lng: userLocation[1] }}>
                        <div className="relative flex items-center justify-center w-12 h-12">
                            <div className="absolute inset-0 bg-blue-500/30 rounded-full animate-ping"></div>
                            <div className="w-6 h-6 bg-blue-500 rounded-full border-2 border-white shadow-lg relative z-10 flex items-center justify-center">
                                <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                            </div>
                        </div>
                    </AdvancedMarker>
                )}

                {/* Friend Markers */}
                {friends.map((friend) => {
                    const friendPos = {
                        lat: friend.lat,
                        lng: friend.lng
                    };

                    return (
                        <AdvancedMarker
                            key={friend.id}
                            position={friendPos}
                            onClick={() => handleFriendClick(friend, friendPos)}
                        >
                            <div className="relative group cursor-pointer transition-transform hover:scale-110">
                                <div
                                    className="w-10 h-10 rounded-full border-2 p-0.5 bg-[#1a1a1a] shadow-xl"
                                    style={{ borderColor: friend.status === 'nearby' ? '#4285F4' : '#F97316' }}
                                >
                                    <img src={friend.image} className="w-full h-full rounded-full object-cover" alt={friend.name} />
                                </div>
                                {friend.status === 'driving' && (
                                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-orange-500 rounded-full border border-[#1a1a1a] flex items-center justify-center text-white shadow-lg">
                                        <span className="material-symbols-outlined text-[10px]">directions_car</span>
                                    </div>
                                )}
                            </div>
                        </AdvancedMarker>
                    );
                })}
            </Map>
        </div>
    );
};

export default MapComponent;
