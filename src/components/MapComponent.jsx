import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icon missing in Leaflet + Webpack/Vite
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

// Component to recenter map when coordinates change
const ChangeView = ({ center, zoom }) => {
  const map = useMap();
  map.setView(center, zoom);
  return null;
};

const createFriendIcon = (imageUrl, status) => {
    const borderColor = status === 'nearby' ? '#4285F4' : '#F97316'; // Blue or Orange
    
    return L.divIcon({
        className: 'custom-icon',
        html: `
            <div class="relative group cursor-pointer transition-transform hover:scale-110" style="width: 56px; height: 56px;">
               <div class="w-14 h-14 rounded-full border-4 p-0.5 bg-background-dark shadow-2xl" style="border-color: ${borderColor}; background-color: #1a1a1a;">
                 <img src="${imageUrl}" class="w-full h-full rounded-full object-cover" alt="Friend" />
               </div>
               ${status === 'driving' ? `
                 <div class="absolute -bottom-1 -right-1 w-6 h-6 bg-orange-500 rounded-full border-2 border-background-dark flex items-center justify-center text-white shadow-lg">
                   <span class="material-symbols-outlined text-[14px]">directions_car</span>
                 </div>
               ` : ''}
                ${status === 'nearby' ? `
                 <div class="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-background-dark flex items-center justify-center text-[10px] font-bold text-white shadow-lg">
                   9m
                 </div>
               ` : ''}
            </div>
        `,
        iconSize: [56, 56],
        iconAnchor: [28, 56], // Bottom center
        popupAnchor: [0, -60]
    });
};

const MapComponent = ({ friends, onFriendClick }) => {
    const [position, setPosition] = useState([37.5665, 126.9780]); // Default: Seoul City Hall

    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    setPosition([pos.coords.latitude, pos.coords.longitude]);
                },
                (err) => {
                   console.error("Geolocation error:", err);
                   // Fallback or alert if needed
                }
            );
        }
    }, []);

    return (
        <MapContainer 
            center={position} 
            zoom={15} 
            style={{ height: '100%', width: '100%', background: '#f0f0f0' }}
            zoomControl={false}
        >
            <ChangeView center={position} zoom={15} />
            
            {/* Dark Mode Map Tiles - CartoDB Dark Matter */}
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            />

            {/* Current User Marker */}
             <Marker 
                position={position}
                icon={L.divIcon({
                    className: 'my-location-pulse',
                    html: `
                        <div class="relative flex items-center justify-center w-12 h-12">
                          <div class="absolute inset-0 bg-blue-500/30 rounded-full animate-ping"></div>
                          <div class="w-8 h-8 bg-blue-500 rounded-full border-4 border-white shadow-lg relative z-10 flex items-center justify-center">
                             <div class="w-2 h-2 bg-white rounded-full"></div>
                          </div>
                        </div>
                    `,
                    iconSize: [48, 48],
                    iconAnchor: [24, 24]
                })}
            />

            {/* Friend Markers */}
            {friends.map(friend => (
                <Marker
                    key={friend.id}
                    position={[
                         // Mocking relative positions based on current user or static
                         // For simplicity, using hardcoded slight offsets from Seoul default for demo
                         // In real app, friend.x/y would be converted to lat/lng or provided as lat/lng
                         37.5665 + (friend.id * 0.002), 
                         126.9780 + (friend.id * 0.002) 
                    ]}
                    icon={createFriendIcon(friend.image, friend.status, friend.distance)}
                    eventHandlers={{
                        click: () => onFriendClick(friend),
                    }}
                >
                </Marker>
            ))}
        </MapContainer>
    );
};

export default MapComponent;
