import React, { useState, useEffect } from 'react';
import { MapPin, Navigation, Phone, Star, Loader2, AlertCircle } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix Leaflet default icon issue
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

// Calculate distance using Haversine formula
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Radius of the earth in km
  const dLat = (lat2 - lat1) * Math.PI / 180;  
  const dLon = (lon2 - lon1) * Math.PI / 180; 
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2)
    ; 
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  const d = R * c; // Distance in km
  return d.toFixed(1);
};

// Component to dynamically update map center
const MapUpdater = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);
  return null;
};

const NearbyHospitals = () => {
  const [location, setLocation] = useState(null);
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchHospitals = async (lat, lon) => {
      try {
        const query = `
          [out:json];
          (
            node["amenity"="hospital"](around:10000,${lat},${lon});
            way["amenity"="hospital"](around:10000,${lat},${lon});
            relation["amenity"="hospital"](around:10000,${lat},${lon});
          );
          out center;
        `;
        const response = await fetch('https://overpass-api.de/api/interpreter', {
          method: 'POST',
          body: query
        });
        
        if (!response.ok) throw new Error('Failed to fetch hospital data');
        
        const data = await response.json();
        
        const processedHospitals = data.elements.map((el, index) => {
          const hLat = el.lat || el.center?.lat;
          const hLon = el.lon || el.center?.lon;
          const name = el.tags?.name || 'Unnamed Hospital';
          const distance = calculateDistance(lat, lon, hLat, hLon);
          
          return {
            id: el.id || index,
            name,
            lat: hLat,
            lon: hLon,
            distance: `${distance} km`,
            distanceNum: parseFloat(distance),
            phone: el.tags?.phone || 'Not available',
            waitTime: Math.floor(Math.random() * 30 + 5) + ' mins', // Simulated
            rating: (Math.random() * 1 + 4).toFixed(1), // Simulated 4.0 - 5.0
          };
        }).filter(h => h.lat && h.lon).sort((a, b) => a.distanceNum - b.distanceNum).slice(0, 10);
        
        setHospitals(processedHospitals);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setError('Failed to fetch nearby hospitals. Please try again later.');
        setLoading(false);
      }
    };

    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setLocation({ lat: latitude, lng: longitude });
          fetchHospitals(latitude, longitude);
        },
        (err) => {
          console.error(err);
          setError('Location access denied. Please enable location services to find nearby hospitals.');
          setLoading(false);
        }
      );
    } else {
      setError('Geolocation is not supported by your browser.');
      setLoading(false);
    }
  }, []);

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="flex justify-between items-end mb-4 shrink-0">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">Nearby Facilities</h2>
          <p className="text-slate-600 dark:text-slate-400 mt-1">Locate emergency care and specialized clinics.</p>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-0">
        {/* Map View */}
        <div className="lg:col-span-2 glass-panel backdrop-blur-md border border-slate-200 dark:border-slate-800/50 rounded-3xl overflow-hidden relative min-h-[400px] h-[50vh] lg:h-auto z-0">
          {loading ? (
            <div className="absolute inset-0 bg-slate-100/80 dark:bg-slate-800/80 flex flex-col items-center justify-center text-slate-600 dark:text-slate-400 z-10">
              <Loader2 size={48} className="mb-4 text-[#4D6BFF] animate-spin" />
              <p className="font-medium text-slate-900 dark:text-slate-100">Detecting Location...</p>
              <p className="text-sm text-slate-500 mt-1">Finding nearby hospitals</p>
            </div>
          ) : error ? (
            <div className="absolute inset-0 bg-slate-100/80 dark:bg-slate-800/80 flex flex-col items-center justify-center text-slate-600 dark:text-slate-400 z-10 text-center p-6">
              <AlertCircle size={48} className="mb-4 text-red-500" />
              <p className="font-medium text-slate-900 dark:text-slate-100">{error}</p>
            </div>
          ) : location ? (
            <MapContainer center={[location.lat, location.lng]} zoom={13} style={{ height: '100%', width: '100%' }}>
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                className="dark:hidden"
              />
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                className="hidden dark:block"
              />
              <MapUpdater center={[location.lat, location.lng]} />
              
              {/* User Location Marker */}
              <Marker position={[location.lat, location.lng]}>
                <Popup>
                  <div className="font-bold">You are here</div>
                </Popup>
              </Marker>

              {/* Hospital Markers */}
              {hospitals.map(hospital => (
                <Marker key={hospital.id} position={[hospital.lat, hospital.lon]}>
                  <Popup>
                    <div className="font-bold text-sm mb-1">{hospital.name}</div>
                    <div className="text-xs text-slate-500 mb-1">{hospital.distance} away</div>
                    {hospital.phone !== 'Not available' && (
                      <div className="text-xs text-blue-600">{hospital.phone}</div>
                    )}
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          ) : null}
        </div>

        {/* List of Hospitals */}
        <div className="space-y-4 overflow-y-auto pr-2 h-[50vh] lg:h-full pb-10">
          {loading ? (
             <div className="glass-panel p-5 rounded-2xl flex items-center justify-center text-slate-500">
               <Loader2 className="animate-spin mr-2" size={20} /> Loading facilities...
             </div>
          ) : error ? (
            <div className="glass-panel p-5 rounded-2xl text-red-500 text-sm">
              {error}
            </div>
          ) : hospitals.length === 0 ? (
            <div className="glass-panel p-5 rounded-2xl text-slate-500 text-center">
              No hospitals found within 10km radius.
            </div>
          ) : (
            hospitals.map(hospital => (
              <div key={hospital.id} className="glass-panel backdrop-blur-md border border-slate-200 dark:border-slate-800/50 p-5 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-slate-900 dark:text-slate-200">{hospital.name}</h3>
                  <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md text-xs font-medium text-yellow-500 dark:text-yellow-400">
                    <Star size={12} fill="currentColor" />
                    <span>{hospital.rating}</span>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400 mb-4">
                  <div className="flex items-center gap-1">
                    <MapPin size={14} />
                    <span>{hospital.distance}</span>
                  </div>
                  <div className="flex items-center gap-1 text-orange-500 dark:text-orange-400">
                    <span className="w-2 h-2 rounded-full bg-orange-500 dark:bg-orange-400 mr-1"></span>
                    <span>{hospital.waitTime} wait</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <a href={`https://www.google.com/maps/dir/?api=1&destination=${hospital.lat},${hospital.lon}`} target="_blank" rel="noopener noreferrer" className="flex-1 bg-blue-600/10 hover:bg-blue-600/20 text-blue-600 dark:text-blue-400 border border-blue-500/20 py-2 rounded-lg flex items-center justify-center gap-2 text-sm font-medium transition-colors">
                    <Navigation size={16} />
                    Directions
                  </a>
                  <button className="flex-1 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-300 py-2 rounded-lg flex items-center justify-center gap-2 text-sm font-medium transition-colors">
                    <Phone size={16} />
                    Call
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default NearbyHospitals;
