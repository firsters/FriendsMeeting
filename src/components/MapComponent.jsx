const MapUpdater = ({ center }) => {
    const map = useMap();
    useEffect(() => {
        if (map && center) {
            map.panTo(center);
        }
    }, [map, center]);
    return null;
};

const MapComponent = ({ friends, onFriendClick, userLocation }) => {
    // Initial center state only for defaultCenter
    const [initialCenter, setInitialCenter] = useState({ lat: 37.5665, lng: 126.9780 });
    const [currentCenter, setCurrentCenter] = useState({ lat: 37.5665, lng: 126.9780 });
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

    // ... (map styles remain same) ...

    // Update currentCenter when userLocation changes
    useEffect(() => {
        if (userLocation) {
            setCurrentCenter({ lat: userLocation[0], lng: userLocation[1] });
        }
    }, [userLocation]);

    // Fallback geolocation
    useEffect(() => {
        if (!userLocation && navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    const newPos = { lat: pos.coords.latitude, lng: pos.coords.longitude };
                    // Only set initial center if it hasn't been set by userLocation yet
                    setInitialCenter(newPos); 
                    setCurrentCenter(newPos);
                },
                (err) => console.error(err)
            );
        }
    }, [userLocation]);

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
            >
                <MapUpdater center={currentCenter} />

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
            </Map>
        </APIProvider>
    );
};

export default MapComponent;
