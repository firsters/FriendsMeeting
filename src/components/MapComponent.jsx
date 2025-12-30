import React, { useEffect, useState } from 'react';
import { APIProvider, Map, AdvancedMarker, useMap, useMapsLibrary } from '@vis.gl/react-google-maps';

const MapUpdater = ({ center, shouldPan = true }) => {
    const map = useMap();
    useEffect(() => {
        if (map && center && shouldPan) {
            map.panTo(center);
        }
    }, [map, center, shouldPan]);
    return null;
};

const GeocodingHandler = ({ location, onAddressResolved }) => {
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
                onAddressResolved("Detailed location unavailable");
            }
        });
    }, [geocoder, location, onAddressResolved]);

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

const MapComponent = ({ friends, onFriendClick, userLocation, onAddressResolved, searchQuery, onSearchResults, selectedPlaceId, onPlaceSelected }) => {
    // Initial center state only for defaultCenter
    const [initialCenter, setInitialCenter] = useState({ lat: 37.5665, lng: 126.9780 });
    const [currentCenter, setCurrentCenter] = useState({ lat: 37.5665, lng: 126.9780 });
    const [hasCenteredInitially, setHasCenteredInitially] = useState(false);
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    const [mapInstance, setMapInstance] = useState(null);
    const map = useMap();

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
            if (!hasCenteredInitially && map) {
                map.setCenter(newCenter);
                setHasCenteredInitially(true);
            }
        }
    }, [userLocation, map, hasCenteredInitially]);

    // Handle place selection update from PlacesHandler
    const handlePlaceSelected = (location) => {
        setCurrentCenter(location);
        if (onPlaceSelected) onPlaceSelected(location); // Optional: Propagate back up if needed
    };

    // Fallback geolocation
    useEffect(() => {
        if (!userLocation && navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    const newPos = { lat: pos.coords.latitude, lng: pos.coords.longitude };
                    // Only set initial center if it hasn't been set by userLocation yet
                    setInitialCenter(newPos); 
                    setCurrentCenter(newPos);
                    
                    if (!hasCenteredInitially && map) {
                        map.setCenter(newPos);
                        setHasCenteredInitially(true);
                    }
                },
                (err) => console.error(err)
            );
        }
    }, [userLocation, map, hasCenteredInitially]);

    const handleCenterOnMe = () => {
        if (userLocation && map) {
            map.panTo({ lat: userLocation[0], lng: userLocation[1] });
        } else if (navigator.geolocation && map) {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    map.panTo({ lat: pos.coords.latitude, lng: pos.coords.longitude });
                },
                (err) => console.error(err)
            );
        }
    };

    return (
        <APIProvider apiKey={apiKey}>
            <Map
                defaultCenter={initialCenter}
                defaultZoom={15}
                mapId={mapId} 
                gestureHandling={'greedy'}
                disableDefaultUI={true}
                styles={darkMapStyle}
                className="w-full h-full"
                onLoad={(ev) => setMapInstance(ev.detail.map)}
            >
                <MapUpdater center={currentCenter} shouldPan={hasCenteredInitially} />
                <GeocodingHandler location={currentCenter} onAddressResolved={onAddressResolved} />
                <PlacesHandler 
                    searchQuery={searchQuery} 
                    onSearchResults={onSearchResults} 
                    selectedPlaceId={selectedPlaceId}
                    onPlaceSelected={handlePlaceSelected} 
                />

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
                    // Calculate mock lat/lng based on currentCenter if exact coords not provided
                    // Ideally friends should have absolute lat/lng. 
                    // Using currentCenter as base for mock offset might make them move with user if not careful.
                    // Assuming friends have mock relative coordinates for this demo.
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

                {/* My Location FAB */}
                <div className="absolute right-4 top-40 z-30 pointer-events-auto">
                    <button 
                        onClick={handleCenterOnMe}
                        className="w-12 h-12 bg-card-dark/95 backdrop-blur-xl rounded-2xl flex items-center justify-center text-primary border border-white/10 shadow-2xl hover:bg-white/10 transition-all active:scale-90"
                    >
                        <span className="material-symbols-outlined">my_location</span>
                    </button>
                </div>
            </Map>
        </APIProvider>
    );
};

export default MapComponent;
