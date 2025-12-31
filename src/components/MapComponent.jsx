import React, { useEffect, useState } from 'react';
import { APIProvider, Map, AdvancedMarker, useMap, useMapsLibrary } from '@vis.gl/react-google-maps';
import { useTranslation } from '../context/LanguageContext';

const MapUpdater = ({ center, shouldPan = true, centerTrigger = 0 }) => {
    const map = useMap();
    const [lastTrigger, setLastTrigger] = useState(0);

    useEffect(() => {
        if (!map || !center) return;

        // Force pan if trigger changed, regardless of shouldPan
        // shouldPan is typically for auto-tracking, while trigger is for manual click
        if (centerTrigger > lastTrigger) {
            map.panTo(center);
            setLastTrigger(centerTrigger);
        } else if (shouldPan) {
            map.panTo(center);
        }
    }, [map, center, shouldPan, centerTrigger, lastTrigger]);
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

const PlacesHandler = ({ searchQuery, onSearchResults, selectedPlaceId, onPlaceSelected }) => {
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
    }, [autocompleteService, searchQuery, placesLib]);

    // Handle Place Selection
    useEffect(() => {
        if (!geocoder || !selectedPlaceId) return;

        geocoder.geocode({ placeId: selectedPlaceId }, (results, status) => {
            if (status === 'OK' && results[0]) {
                const location = {
                    lat: results[0].geometry.location.lat(),
                    lng: results[0].geometry.location.lng()
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
    onSearchResults,
    selectedPlaceId,
    onPlaceSelected,
    // General Search Props
    generalSearchQuery,
    onGeneralSearchResults,
    generalSelectedPlaceId,
    onGeneralPlaceSelected,

    centerTrigger = 0,
    mapType = 'roadmap',
    meetingLocation = null
}) => {
    const { t } = useTranslation();
    // Initial center state only for defaultCenter
    const [initialCenter, setInitialCenter] = useState({ lat: 37.5665, lng: 126.9780 });
    const [currentCenter, setCurrentCenter] = useState({ lat: 37.5665, lng: 126.9780 });
    const [hasCenteredInitially, setHasCenteredInitially] = useState(false);
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

    // Update currentCenter when userLocation changes
    useEffect(() => {
        if (userLocation) {
            const newCenter = { lat: userLocation[0], lng: userLocation[1] };
            setCurrentCenter(newCenter);
            
            // Auto-center only once when the first valid location is received
            if (!hasCenteredInitially && mapInstance) {
                mapInstance.setCenter(newCenter);
                setHasCenteredInitially(true);
            }
        }
    }, [userLocation, mapInstance, hasCenteredInitially]);

    const handlePlaceSelected = (location) => {
        setCurrentCenter(location);
        if (onPlaceSelected) onPlaceSelected(location);
    };

    const handleGeneralPlaceSelected = (location) => {
        setCurrentCenter(location);
        if (onGeneralPlaceSelected) onGeneralPlaceSelected(location);
    };

    const handleMapLoad = (map) => {
        setMapInstance(map);
        if (onMapLoad) onMapLoad(map);
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
        <APIProvider apiKey={apiKey}>
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
                    <MapUpdater center={currentCenter} shouldPan={hasCenteredInitially} centerTrigger={centerTrigger} />
                    <GeocodingHandler location={currentCenter} onAddressResolved={onAddressResolved} />

                    {/* Primary Search (Meeting Location) */}
                    <PlacesHandler 
                        searchQuery={searchQuery} 
                        onSearchResults={onSearchResults} 
                        selectedPlaceId={selectedPlaceId}
                        onPlaceSelected={handlePlaceSelected} 
                    />

                    {/* Secondary Search (General) */}
                    <PlacesHandler
                        searchQuery={generalSearchQuery}
                        onSearchResults={onGeneralSearchResults}
                        selectedPlaceId={generalSelectedPlaceId}
                        onPlaceSelected={handleGeneralPlaceSelected}
                    />

                    {/* Meeting Location Marker */}
                    {meetingLocation && meetingLocation.lat && (
                        <AdvancedMarker position={{ lat: meetingLocation.lat, lng: meetingLocation.lng }}>
                             <div className="relative flex flex-col items-center animate-bounce-short">
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

                    {/* User Location Marker */}
                    <AdvancedMarker position={currentCenter}>
                        <div className="relative flex items-center justify-center w-12 h-12">
                            <div className="absolute inset-0 bg-blue-500/30 rounded-full animate-ping"></div>
                            <div className="w-6 h-6 bg-blue-500 rounded-full border-2 border-white shadow-lg relative z-10 flex items-center justify-center">
                                <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                            </div>
                        </div>
                    </AdvancedMarker>

                    {/* Friend Markers */}
                    {friends.map((friend) => {
                        const friendPos = { 
                            lat: currentCenter.lat + (friend.y - 50) * 0.0001, 
                            lng: currentCenter.lng + (friend.x - 50) * 0.0001 
                        };

                        return (
                            <AdvancedMarker 
                                key={friend.id} 
                                position={friendPos}
                                onClick={() => onFriendClick(friend)}
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
        </APIProvider>
    );
};

export default MapComponent;
