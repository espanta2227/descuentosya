import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Navigation, Filter, X, Clock, ChevronRight, Locate, Layers, Minus, Plus, List } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useApp } from '../context/AppContext';
import { categories } from '../data/mockData';
import { formatPrice, daysLeft } from '../components/DealCard';
import { Deal } from '../types';

// Category colors for markers
const categoryColors: Record<string, string> = {
  'Gastronomía': '#ef4444',
  'Belleza': '#ec4899',
  'Salud': '#3b82f6',
  'Entretenimiento': '#8b5cf6',
  'Tecnología': '#06b6d4',
  'Moda': '#f59e0b',
  'Hogar': '#22c55e',
  'Deportes': '#f97316',
  'Educación': '#6366f1',
  'Turismo': '#14b8a6',
};

function createMarkerIcon(deal: Deal, isSelected: boolean) {
  const cat = categories.find(c => c.name === deal.category);
  const emoji = cat?.icon || '🏷️';
  const color = categoryColors[deal.category] || '#f97316';
  const size = isSelected ? 'scale-110' : '';
  const shadow = isSelected ? 'shadow-2xl' : 'shadow-lg';
  const ring = isSelected ? `ring-3 ring-white ring-offset-1` : '';
  const zIdx = isSelected ? 'z-50' : 'z-10';

  return L.divIcon({
    className: 'custom-map-marker',
    html: `
      <div class="marker-container ${size} ${zIdx}" style="position:relative;display:flex;flex-direction:column;align-items:center;cursor:pointer;transition:all 0.3s ease;">
        <div class="${shadow} ${ring}" style="
          background: ${color};
          border-radius: 16px 16px 16px 4px;
          padding: 6px 10px;
          display: flex;
          align-items: center;
          gap: 4px;
          white-space: nowrap;
          transform: ${isSelected ? 'scale(1.12)' : 'scale(1)'};
          transition: all 0.3s cubic-bezier(0.34,1.56,0.64,1);
          border: 2px solid rgba(255,255,255,0.9);
        ">
          <span style="font-size:14px;line-height:1;">${emoji}</span>
          <span style="color:white;font-weight:800;font-size:11px;text-shadow:0 1px 2px rgba(0,0,0,0.3);">${formatPrice(deal.discountPrice)}</span>
          <span style="color:rgba(255,255,255,0.7);font-size:9px;font-weight:600;text-decoration:line-through;">${formatPrice(deal.originalPrice)}</span>
        </div>
        <div style="
          width: 0; height: 0;
          border-left: 6px solid transparent;
          border-right: 6px solid transparent;
          border-top: 8px solid ${color};
          margin-top: -1px;
          filter: drop-shadow(0 2px 2px rgba(0,0,0,0.15));
        "></div>
      </div>
    `,
    iconSize: [130, 52],
    iconAnchor: [20, 52],
  });
}

function createUserLocationIcon() {
  return L.divIcon({
    className: 'user-location-icon',
    html: `
      <div style="position:relative;width:20px;height:20px;">
        <div style="
          position:absolute;inset:-8px;
          background:rgba(59,130,246,0.15);
          border-radius:50%;
          animation: pulse-ring 2s cubic-bezier(0.455,0.03,0.515,0.955) infinite;
        "></div>
        <div style="
          width:20px;height:20px;
          background:linear-gradient(135deg,#3b82f6,#2563eb);
          border-radius:50%;
          border:3px solid white;
          box-shadow:0 2px 8px rgba(37,99,235,0.5);
        "></div>
      </div>
    `,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  });
}

export default function MapPage() {
  const { getVisibleDeals, addToast } = useApp();
  const navigate = useNavigate();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const userMarkerRef = useRef<L.Marker | null>(null);

  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  // Map style could be extended: 'streets' | 'satellite'
  const [dealsCount, setDealsCount] = useState(0);
  const [showListPreview, setShowListPreview] = useState(false);

  const visibleDeals = getVisibleDeals();

  // Filter active deals
  const filteredDeals = useMemo(() => {
    if (selectedCategories.length === 0) return visibleDeals;
    return visibleDeals.filter(d => selectedCategories.includes(d.category));
  }, [visibleDeals, selectedCategories]);

  useEffect(() => {
    setDealsCount(filteredDeals.length);
  }, [filteredDeals]);

  // Categories that have deals
  const activeCats = useMemo(() => {
    return categories.filter(c => visibleDeals.some(d => d.category === c.name));
  }, [visibleDeals]);

  const toggleCategory = useCallback((cat: string) => {
    setSelectedCategories(prev =>
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
    setSelectedDeal(null);
  }, []);

  const clearFilters = useCallback(() => {
    setSelectedCategories([]);
    setSelectedDeal(null);
  }, []);

  // Locate user
  const getUserLocation = useCallback(() => {
    if (!navigator.geolocation) {
      addToast('Tu navegador no soporta geolocalización', 'warning');
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const loc: [number, number] = [pos.coords.latitude, pos.coords.longitude];
        setUserLocation(loc);
        if (mapRef.current) {
          mapRef.current.flyTo(loc, 15, { duration: 1.5 });
        }
        setIsLocating(false);
        addToast('📍 Ubicación encontrada', 'success');
      },
      () => {
        setIsLocating(false);
        addToast('No se pudo obtener tu ubicación. Mostrando Montevideo.', 'info');
        // Fallback to Montevideo center
        if (mapRef.current) {
          mapRef.current.flyTo([-34.9011, -56.1645], 13, { duration: 1 });
        }
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  }, [addToast]);

  // Initialize map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [-34.9055, -56.1645], // Montevideo centro
      zoom: 13,
      zoomControl: false,
      attributionControl: false,
    });

    // Streets tile
    const streets = L.tileLayer(
      'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      { maxZoom: 19 }
    );

    streets.addTo(map);

    // Attribution (small)
    L.control.attribution({ position: 'bottomleft', prefix: false })
      .addAttribution('© <a href="https://www.openstreetmap.org/copyright" target="_blank" style="font-size:9px;">OSM</a>')
      .addTo(map);

    mapRef.current = map;

    // Click on map to deselect
    map.on('click', () => {
      setSelectedDeal(null);
    });

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Update markers when filtered deals change
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Remove old markers
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    // Add new markers
    filteredDeals.forEach(deal => {
      const icon = createMarkerIcon(deal, selectedDeal?.id === deal.id);

      const marker = L.marker([deal.lat, deal.lng], { icon })
        .addTo(map)
        .on('click', (e) => {
          L.DomEvent.stopPropagation(e);
          setSelectedDeal(prev => prev?.id === deal.id ? null : deal);
          map.flyTo([deal.lat, deal.lng], Math.max(map.getZoom(), 14), { duration: 0.8 });
        });

      markersRef.current.push(marker);
    });

    // Fit bounds if deals exist and no selection
    if (filteredDeals.length > 0 && !selectedDeal) {
      const group = L.featureGroup(markersRef.current);
      map.fitBounds(group.getBounds().pad(0.15), { maxZoom: 14, animate: true });
    }
  }, [filteredDeals, selectedDeal]);

  // User location marker
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Remove old user marker
    if (userMarkerRef.current) {
      userMarkerRef.current.remove();
      userMarkerRef.current = null;
    }

    if (userLocation) {
      const icon = createUserLocationIcon();
      userMarkerRef.current = L.marker(userLocation, { icon, zIndexOffset: 1000 }).addTo(map);
    }
  }, [userLocation]);

  // Calculate distance between two points (Haversine)
  const getDistance = useCallback((lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }, []);

  const formatDistance = useCallback((km: number) => {
    if (km < 1) return `${Math.round(km * 1000)}m`;
    return `${km.toFixed(1)}km`;
  }, []);

  const zoomIn = () => mapRef.current?.zoomIn();
  const zoomOut = () => mapRef.current?.zoomOut();

  const flyToAll = () => {
    if (markersRef.current.length > 0 && mapRef.current) {
      const group = L.featureGroup(markersRef.current);
      mapRef.current.fitBounds(group.getBounds().pad(0.15), { maxZoom: 14, animate: true });
    }
    setSelectedDeal(null);
  };

  return (
    <div className="relative" style={{ height: 'calc(100vh - 112px)' }}>
      {/* Map container */}
      <div ref={mapContainerRef} className="absolute inset-0 z-0" />

      {/* Top overlay - Search + Filters */}
      <div className="absolute top-0 left-0 right-0 z-[1000] p-3">
        {/* Main search bar */}
        <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-white/50 overflow-hidden">
          {/* Header */}
          <div className="px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center shadow-md">
                <MapPin size={18} className="text-white" />
              </div>
              <div>
                <h2 className="font-bold text-sm text-gray-800 leading-tight">Mapa de Cupones</h2>
                <p className="text-[11px] text-gray-400">
                  {dealsCount} oferta{dealsCount !== 1 ? 's' : ''} disponible{dealsCount !== 1 ? 's' : ''}
                  {selectedCategories.length > 0 && (
                    <span className="text-orange-500"> · {selectedCategories.length} filtro{selectedCategories.length > 1 ? 's' : ''}</span>
                  )}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setShowListPreview(!showListPreview)}
                className={`p-2.5 rounded-xl transition-all ${showListPreview ? 'bg-orange-100 text-orange-600' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                title="Lista"
              >
                <List size={16} />
              </button>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`p-2.5 rounded-xl transition-all ${showFilters ? 'bg-orange-100 text-orange-600' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                title="Filtros"
              >
                <Filter size={16} />
                {selectedCategories.length > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-orange-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                    {selectedCategories.length}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Category Filters */}
          {showFilters && (
            <div className="px-4 pb-3 pt-0 animate-fadeIn border-t border-gray-100">
              <div className="flex items-center justify-between pt-2.5 mb-2">
                <span className="text-[11px] text-gray-400 font-semibold uppercase tracking-wider">
                  Filtrar por categoría
                </span>
                {selectedCategories.length > 0 && (
                  <button
                    onClick={clearFilters}
                    className="text-[11px] text-orange-500 font-semibold flex items-center gap-0.5 hover:text-orange-600 transition"
                  >
                    <X size={10} /> Limpiar todo
                  </button>
                )}
              </div>
              <div className="flex flex-wrap gap-1.5">
                {activeCats.map(cat => {
                  const isActive = selectedCategories.includes(cat.name);
                  const count = visibleDeals.filter(d => d.category === cat.name).length;
                  return (
                    <button
                      key={cat.name}
                      onClick={() => toggleCategory(cat.name)}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all duration-200
                        ${isActive
                          ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md shadow-orange-200 scale-[1.03]'
                          : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-100'
                        }`}
                    >
                      <span className="text-sm">{cat.icon}</span>
                      <span>{cat.name}</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full
                        ${isActive ? 'bg-white/25 text-white' : 'bg-gray-200/80 text-gray-500'}`}>
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right side controls */}
      <div className="absolute right-3 top-1/2 -translate-y-1/2 z-[1000] flex flex-col gap-2">
        <button
          onClick={zoomIn}
          className="w-10 h-10 bg-white/95 backdrop-blur-sm rounded-xl shadow-lg flex items-center justify-center text-gray-600 hover:bg-gray-50 transition active:scale-95 border border-white/50"
        >
          <Plus size={18} />
        </button>
        <button
          onClick={zoomOut}
          className="w-10 h-10 bg-white/95 backdrop-blur-sm rounded-xl shadow-lg flex items-center justify-center text-gray-600 hover:bg-gray-50 transition active:scale-95 border border-white/50"
        >
          <Minus size={18} />
        </button>
        <div className="w-10 h-px bg-gray-200 mx-auto" />
        <button
          onClick={getUserLocation}
          disabled={isLocating}
          className={`w-10 h-10 rounded-xl shadow-lg flex items-center justify-center transition active:scale-95 border border-white/50
            ${isLocating ? 'bg-blue-50 text-blue-500 animate-pulse' : userLocation ? 'bg-blue-50 text-blue-500' : 'bg-white/95 backdrop-blur-sm text-gray-600 hover:bg-gray-50'}`}
          title="Mi ubicación"
        >
          <Locate size={18} className={isLocating ? 'animate-spin' : ''} />
        </button>
        <button
          onClick={flyToAll}
          className="w-10 h-10 bg-white/95 backdrop-blur-sm rounded-xl shadow-lg flex items-center justify-center text-gray-600 hover:bg-gray-50 transition active:scale-95 border border-white/50"
          title="Ver todos"
        >
          <Layers size={18} />
        </button>
      </div>

      {/* List preview overlay */}
      {showListPreview && (
        <div className="absolute bottom-0 left-0 right-0 z-[1000] animate-slideUp">
          <div className="bg-white/95 backdrop-blur-md rounded-t-3xl shadow-2xl border-t border-gray-100 max-h-[50vh] overflow-hidden flex flex-col">
            <div className="px-4 py-3 flex items-center justify-between border-b border-gray-100 flex-shrink-0">
              <div className="flex items-center gap-2">
                <List size={16} className="text-orange-500" />
                <span className="font-bold text-sm">{filteredDeals.length} cupones en el mapa</span>
              </div>
              <button onClick={() => setShowListPreview(false)} className="p-1.5 rounded-lg bg-gray-100 text-gray-500">
                <X size={14} />
              </button>
            </div>
            <div className="overflow-y-auto flex-1 px-3 py-2 space-y-2">
              {filteredDeals.map(deal => {
                const catInfo = categories.find(c => c.name === deal.category);
                const dist = userLocation ? getDistance(userLocation[0], userLocation[1], deal.lat, deal.lng) : null;
                return (
                  <button
                    key={deal.id}
                    onClick={() => {
                      setSelectedDeal(deal);
                      setShowListPreview(false);
                      mapRef.current?.flyTo([deal.lat, deal.lng], 15, { duration: 0.8 });
                    }}
                    className={`w-full flex items-center gap-3 p-2.5 rounded-xl transition-all text-left
                      ${selectedDeal?.id === deal.id ? 'bg-orange-50 border border-orange-200' : 'bg-gray-50 hover:bg-gray-100 border border-transparent'}`}
                  >
                    <img src={deal.image} alt="" className="w-14 h-14 rounded-xl object-cover flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1 mb-0.5">
                        <span className="text-xs">{catInfo?.icon}</span>
                        <span className="text-[10px] text-gray-400 font-medium">{deal.businessName}</span>
                        {dist !== null && (
                          <span className="text-[10px] text-blue-500 font-medium ml-auto">📍 {formatDistance(dist)}</span>
                        )}
                      </div>
                      <p className="font-semibold text-xs line-clamp-1">{deal.title}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-orange-600 font-bold text-sm">{formatPrice(deal.discountPrice)}</span>
                        <span className="text-gray-300 line-through text-[10px]">{formatPrice(deal.originalPrice)}</span>
                        <span className="text-red-500 text-[10px] font-bold bg-red-50 px-1.5 py-0.5 rounded">-{deal.discountPercent}%</span>
                      </div>
                    </div>
                    <ChevronRight size={14} className="text-gray-300 flex-shrink-0" />
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Selected Deal Card */}
      {selectedDeal && !showListPreview && (
        <div className="absolute bottom-4 left-3 right-3 z-[1000] animate-slideUp">
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100">
            {/* Close button */}
            <button
              onClick={(e) => { e.stopPropagation(); setSelectedDeal(null); }}
              className="absolute top-3 right-3 z-10 p-1.5 bg-black/40 backdrop-blur-sm rounded-full text-white hover:bg-black/60 transition"
            >
              <X size={14} />
            </button>

            {/* Discount badge */}
            <div className="absolute top-3 left-3 z-10">
              <div className="bg-red-500 text-white px-2.5 py-1 rounded-xl text-xs font-extrabold shadow-lg">
                -{selectedDeal.discountPercent}% OFF
              </div>
            </div>

            <div className="flex">
              {/* Image */}
              <div className="relative w-[140px] flex-shrink-0">
                <img
                  src={selectedDeal.image}
                  alt={selectedDeal.title}
                  className="w-full h-full object-cover min-h-[160px]"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/10" />
              </div>

              {/* Content */}
              <div className="p-3.5 flex-1 min-w-0 flex flex-col justify-between">
                {/* Business */}
                <div>
                  <div className="flex items-center gap-1.5 mb-1">
                    <div className="w-5 h-5 rounded-md bg-gradient-to-br from-orange-400 to-amber-400 flex items-center justify-center">
                      <span className="text-white text-[10px] font-bold">{selectedDeal.businessName.charAt(0)}</span>
                    </div>
                    <span className="text-[11px] text-gray-400 font-medium truncate">{selectedDeal.businessName}</span>
                  </div>

                  {/* Title */}
                  <h3 className="font-bold text-[13px] leading-tight line-clamp-2 mb-1.5 text-gray-800">
                    {selectedDeal.title}
                  </h3>

                  {/* Location + Distance */}
                  <div className="flex items-center gap-1 text-[11px] text-gray-400 mb-1">
                    <MapPin size={10} className="flex-shrink-0" />
                    <span className="truncate">{selectedDeal.address}</span>
                  </div>
                  {userLocation && (
                    <div className="flex items-center gap-1 text-[11px] text-blue-500 font-medium mb-2">
                      <Navigation size={10} />
                      <span>A {formatDistance(getDistance(userLocation[0], userLocation[1], selectedDeal.lat, selectedDeal.lng))} de vos</span>
                    </div>
                  )}
                </div>

                {/* Price + CTA */}
                <div>
                  <div className="flex items-end justify-between mb-2">
                    <div>
                      <div className="text-orange-600 font-extrabold text-xl leading-tight">
                        {formatPrice(selectedDeal.discountPrice)}
                      </div>
                      <div className="text-gray-300 line-through text-xs">
                        {formatPrice(selectedDeal.originalPrice)}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => navigate(`/deal/${selectedDeal.id}`)}
                      className="flex-1 bg-gradient-to-r from-orange-500 to-amber-500 text-white px-4 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 hover:shadow-lg hover:shadow-orange-200 transition-all active:scale-[0.97]"
                    >
                      Ver Oferta <ChevronRight size={14} />
                    </button>
                  </div>

                  {/* Meta info */}
                  <div className="flex items-center gap-3 mt-2 text-[10px] text-gray-400">
                    <span className="flex items-center gap-0.5">
                      <Clock size={9} />
                      {daysLeft(selectedDeal.expiresAt)}d restantes
                    </span>
                    <span>•</span>
                    <span>{selectedDeal.availableQuantity - selectedDeal.soldQuantity} disponibles</span>
                    {selectedDeal.rating && (
                      <>
                        <span>•</span>
                        <span className="flex items-center gap-0.5">
                          ⭐ {selectedDeal.rating}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Empty state */}
      {filteredDeals.length === 0 && (
        <div className="absolute inset-0 z-[999] flex items-center justify-center pointer-events-none">
          <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-xl p-6 text-center max-w-[280px] pointer-events-auto">
            <p className="text-4xl mb-3">🔍</p>
            <p className="font-bold text-gray-800 mb-1">Sin resultados</p>
            <p className="text-gray-400 text-sm mb-3">
              No hay cupones para las categorías seleccionadas
            </p>
            <button
              onClick={clearFilters}
              className="bg-orange-500 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-orange-600 transition"
            >
              Limpiar filtros
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
