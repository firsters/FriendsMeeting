import React, { useEffect, useState, useCallback } from 'react';
import { APIProvider, Map, AdvancedMarker, Pin } from '@vis.gl/react-google-maps';

const MapComponent = ({ friends, onFriendClick, userLocation }) => {
    const [center, setCenter] = useState({ lat: 37.5665, lng: 126.9780 });
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

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

    // Update center when userLocation changes
    useEffect(() => {
        if (userLocation) {
            setCenter({ lat: userLocation[0], lng: userLocation[1] });
        }
    }, [userLocation]);

    // Fallback geolocation
    useEffect(() => {
        if (!userLocation && navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    setCenter({ lat: pos.coords.latitude, lng: pos.coords.longitude });
                },
                (err) => console.error(err)
            );
        }
    }, [userLocation]);

    return (
        <APIProvider apiKey={apiKey}>
            <Map
                defaultCenter={center}
                center={center}
                defaultZoom={15}
                zoom={15}
                mapId={mapId} 
                gestureHandling={'greedy'}
                disableDefaultUI={true}
                styles={darkMapStyle}
                className="w-full h-full"
            >
                {/* User Location Marker */}
                <AdvancedMarker position={center}>
                     <div className="relative flex items-center justify-center w-12 h-12">
                        <div className="absolute inset-0 bg-blue-500/30 rounded-full animate-ping"></div>
                        <div className="w-6 h-6 bg-blue-500 rounded-full border-2 border-white shadow-lg relative z-10 flex items-center justify-center">
                            <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                        </div>
                    </div>
                </AdvancedMarker>

                {/* Friend Markers */}
                {friends.map((friend) => {
                    // Calculate mock lat/lng based on center if exact coords not provided
                    // For demo, we are just adding small offsets to the center
                    // in a real app, friend object would have lat/lng
                    const friendPos = { 
                        lat: center.lat + (friend.y - 50) * 0.0001, 
                        lng: center.lng + (friend.x - 50) * 0.0001 
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
        </APIProvider>
    );
};

export default MapComponent;
