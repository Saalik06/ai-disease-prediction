import {
  AlertTriangle,
  Clock,
  Filter,
  HeartPulse,
  Hospital,
  MapPin,
  Navigation,
  Phone,
  PhoneCall,
  Search,
  ShieldAlert,
  Stethoscope,
  Video
} from 'lucide-react';
import React, { useState } from 'react';
import { HEALTHCARE_PROVIDERS, HealthcareFacility } from '../data/providers.js';

export const FindCarePage: React.FC = () => {
  const [selectedType, setSelectedType] = useState<string>('all');
  const [search, setSearch] = useState('');

  const filtered = HEALTHCARE_PROVIDERS.filter((item) => {
    const matchType = selectedType === 'all' || item.type === selectedType;
    const matchSearch =
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.address.toLowerCase().includes(search.toLowerCase()) ||
      item.specialties.some((s) => s.toLowerCase().includes(search.toLowerCase()));
    return matchType && matchSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-left">
      {/* Emergency Immediate Red Flag Banner */}
      <div className="p-5 rounded-2xl bg-rose-500 text-white shadow-lg space-y-2">
        <div className="flex items-center gap-2 font-black text-sm uppercase tracking-wider">
          <ShieldAlert className="w-5 h-5 text-white animate-pulse" />
          <span>Life-Threatening Emergency Guidance</span>
        </div>
        <p className="text-xs sm:text-sm text-rose-100 leading-relaxed">
          If you or someone around you is experiencing severe chest pain, inability to breathe, sudden loss of consciousness, stroke-like facial drooping, or uncontrolled hemorrhage, <strong>DIAL 102 (AMBULANCE) OR 100 (POLICE / EMERGENCY) IMMEDIATELY</strong>. Do not wait for web predictions.
        </p>
      </div>

      {/* Title */}
      <div className="space-y-2 border-b border-slate-200 pb-5">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-semibold">
          <Hospital className="w-3.5 h-3.5 text-blue-600" />
          <span>Clinical Network Locator</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Find Healthcare Facilities & Certified Providers
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 max-w-3xl">
          Connect directly with accredited local hospitals, urgent care centers, walk-in clinics, and 24/7 registered nurse telehealth hotlines.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
        <div className="sm:col-span-6 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search facility name, address, or medical specialty..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          />
        </div>

        <div className="sm:col-span-6 flex items-center gap-2 overflow-x-auto pb-1">
          <Filter className="w-4 h-4 text-slate-400 shrink-0 mr-1" />
          {[
            { id: 'all', label: 'All Providers' },
            { id: 'hospital', label: 'Hospitals / ER' },
            { id: 'urgent_care', label: 'Urgent Care' },
            { id: 'telehealth', label: 'Telehealth 24/7' },
            { id: 'clinic', label: 'Community Clinics' },
          ].map((type) => (
            <button
              key={type.id}
              onClick={() => setSelectedType(type.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedType === type.id
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              {type.label}
            </button>
          ))}
        </div>
      </div>

      {/* Providers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md hover:border-blue-300 transition-all flex flex-col justify-between space-y-4"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-200">
                  {item.type.replace('_', ' ')}
                </span>
                <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
                  <Navigation className="w-3 h-3 text-blue-600" />
                  {item.distance}
                </span>
              </div>

              <h3 className="text-base font-bold text-slate-900 leading-snug">{item.name}</h3>

              <div className="space-y-1 text-xs text-slate-600">
                <div className="flex items-start gap-2">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
                  <span>{item.address}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-500">
                  <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{item.hours}</span>
                </div>
              </div>

              <div className="pt-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Services & Specialties:
                </span>
                <div className="flex flex-wrap gap-1">
                  {item.specialties.map((spec) => (
                    <span
                      key={spec}
                      className="px-2 py-0.5 bg-slate-100 text-slate-700 text-[10px] font-medium rounded"
                    >
                      {spec}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <a
                href={`tel:${(item.phone || item.contact).replace(/[^0-9]/g, '')}`}
                className="px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-800 text-xs font-bold flex items-center gap-1.5 transition-colors"
              >
                <PhoneCall className="w-3.5 h-3.5 text-blue-600" />
                {item.phone || item.contact}
              </a>

              <button
                onClick={() =>
                  alert(`Connecting to ${item.name} navigation portal. Address: ${item.address}`)
                }
                className="text-xs font-semibold text-slate-600 hover:text-slate-900"
              >
                Directions
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
