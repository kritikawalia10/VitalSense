import React from 'react';
import { MapPin, Navigation, Phone, Star } from 'lucide-react';

const hospitals = [
  { id: 1, name: 'City General Hospital', distance: '2.4 km', waitTime: '15 mins', rating: 4.8 },
  { id: 2, name: 'Metro Cardiology Center', distance: '4.1 km', waitTime: '5 mins', rating: 4.9 },
  { id: 3, name: 'Westside Emergency Care', distance: '5.8 km', waitTime: '30 mins', rating: 4.5 },
];

const NearbyHospitals = () => {
  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="flex justify-between items-end mb-4 shrink-0">
        <div>
          <h2 className="text-3xl font-bold text-slate-100 tracking-tight">Nearby Facilities</h2>
          <p className="text-slate-400 mt-1">Locate emergency care and specialized clinics.</p>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map Placeholder */}
        <div className="lg:col-span-2 bg-slate-900/40 backdrop-blur-md border border-slate-800/50 rounded-3xl overflow-hidden relative min-h-[400px]">
          <div className="absolute inset-0 bg-slate-800/80 flex flex-col items-center justify-center text-slate-400">
            <MapPin size={48} className="mb-4 text-blue-500 opacity-50" />
            <p className="font-medium">Map View Integration</p>
            <p className="text-sm text-slate-500 mt-1">Google Maps or Mapbox API ready</p>
          </div>
        </div>

        {/* List of Hospitals */}
        <div className="space-y-4 overflow-y-auto pr-2">
          {hospitals.map(hospital => (
            <div key={hospital.id} className="bg-slate-900/40 backdrop-blur-md border border-slate-800/50 p-5 rounded-2xl hover:bg-slate-800/40 transition-colors">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-slate-200">{hospital.name}</h3>
                <div className="flex items-center gap-1 bg-slate-800 px-2 py-1 rounded-md text-xs font-medium text-yellow-400">
                  <Star size={12} fill="currentColor" />
                  <span>{hospital.rating}</span>
                </div>
              </div>
              <div className="flex items-center gap-4 text-sm text-slate-400 mb-4">
                <div className="flex items-center gap-1">
                  <MapPin size={14} />
                  <span>{hospital.distance}</span>
                </div>
                <div className="flex items-center gap-1 text-orange-400">
                  <span className="w-2 h-2 rounded-full bg-orange-400 mr-1"></span>
                  <span>{hospital.waitTime} wait</span>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="flex-1 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/30 py-2 rounded-lg flex items-center justify-center gap-2 text-sm font-medium transition-colors">
                  <Navigation size={16} />
                  Directions
                </button>
                <button className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 py-2 rounded-lg flex items-center justify-center gap-2 text-sm font-medium transition-colors">
                  <Phone size={16} />
                  Call
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NearbyHospitals;
