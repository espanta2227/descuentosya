/**
 * ============================================
 * BANNERS DE DESCUENTOSYA
 * ============================================
 * 
 * 🔧 PARA PRODUCCIÓN:
 *   1. Cambiá USE_CUSTOM_HERO a true y poné tu imagen
 *   2. Cambiá USE_CUSTOM_ADS a true y poné las imágenes de tus clientes
 * ============================================
 */

// ✅ ACTIVADO — Busca /banner.jpg en public/
// Si no lo encuentra, muestra el diseño de respaldo
const USE_CUSTOM_HERO = true;
const CUSTOM_HERO_FILE = '/banner.jpg';

const USE_CUSTOM_ADS = false;
const CUSTOM_AD_FILES = [
  { image: '/banner-ad-1.jpg', label: 'Restaurante El Buen Sabor' },
  { image: '/banner-ad-2.jpg', label: 'Spa & Wellness' },
  { image: '/banner-ad-3.jpg', label: 'Tech Store' },
];

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Tag, Percent, ShoppingBag, Star, Sparkles, TrendingUp, Gift, Zap, ExternalLink } from 'lucide-react';
import { LogoIcon } from './Logo';

// =============================================
// BANNER HERO (el grande arriba de la home)
// =============================================
interface HeroBannerProps {
  currentUser: { name: string } | null;
  totalSaved: number;
  localSearch: string;
  setLocalSearch: (v: string) => void;
  onSearch: () => void;
}

export function HeroBanner({ currentUser, totalSaved, localSearch, setLocalSearch, onSearch }: HeroBannerProps) {
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);

  const showImage = USE_CUSTOM_HERO && !imgError;

  return (
    <div className="relative rounded-3xl overflow-hidden mb-5 animate-fadeIn">
      {/* Imagen custom de fondo (solo si está configurada) */}
      {USE_CUSTOM_HERO && !imgError && (
        <img
          src={CUSTOM_HERO_FILE}
          alt=""
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
          onLoad={() => setImgLoaded(true)}
          onError={() => setImgError(true)}
        />
      )}

      {/* Overlay sobre imagen */}
      {showImage && imgLoaded && (
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/40 to-black/70" />
      )}

      {/* Fondo diseñado (cuando no hay imagen custom) */}
      {(!USE_CUSTOM_HERO || imgError) && (
        <div className="absolute inset-0">
          {/* Gradiente principal */}
          <div className="absolute inset-0 bg-gradient-to-br from-orange-600 via-orange-500 to-amber-400" />
          
          {/* Patrón decorativo */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-4 left-6">
              <Tag size={24} className="text-white rotate-12" />
            </div>
            <div className="absolute top-8 right-12">
              <Percent size={20} className="text-white -rotate-12" />
            </div>
            <div className="absolute bottom-12 left-16">
              <Star size={18} className="text-white rotate-45" />
            </div>
            <div className="absolute bottom-8 right-6">
              <ShoppingBag size={22} className="text-white -rotate-6" />
            </div>
            <div className="absolute top-16 left-1/2">
              <Gift size={16} className="text-white rotate-12" />
            </div>
          </div>

          {/* Círculos decorativos */}
          <div className="absolute -right-8 -top-8 w-32 h-32 bg-white/10 rounded-full" />
          <div className="absolute right-12 -bottom-10 w-24 h-24 bg-white/10 rounded-full" />
          <div className="absolute -left-6 bottom-6 w-20 h-20 bg-white/5 rounded-full" />
          <div className="absolute left-1/3 -top-4 w-16 h-16 bg-yellow-300/10 rounded-full" />
        </div>
      )}

      {/* Contenido */}
      <div className="relative p-6 text-white">
        {currentUser ? (
          <>
            <h1 className="text-2xl font-extrabold mb-1">
              ¡Hola, {currentUser.name.split(' ')[0]}! 👋
            </h1>
            <p className="text-white/85 text-sm mb-4">
              {totalSaved > 0
                ? `Ya ahorraste $U ${new Intl.NumberFormat('es-UY', { maximumFractionDigits: 0 }).format(totalSaved)} 💰`
                : 'Encontrá los mejores descuentos cerca tuyo'
              }
            </p>
          </>
        ) : (
          <>
            <div className="flex items-center gap-3 mb-3">
              <LogoIcon size={48} />
              <div>
                <h1 
                  className="text-2xl leading-tight"
                  style={{ fontFamily: "'Fredoka One', 'Poppins', sans-serif" }}
                >
                  Descuentos<span className="text-yellow-200">Ya</span>
                </h1>
                <p className="text-white/80 text-[11px] tracking-[2px] uppercase font-medium">
                  Cupones Uruguay 🇺🇾
                </p>
              </div>
            </div>
            <p className="text-white/90 text-sm mb-4 flex items-center gap-1.5">
              <Sparkles size={14} />
              Los mejores descuentos de comercios locales
            </p>
          </>
        )}

        {/* Buscador */}
        <div className="relative">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Buscar ofertas, comercios..."
            value={localSearch}
            onChange={e => setLocalSearch(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && onSearch()}
            className="w-full pl-11 pr-20 py-3.5 rounded-2xl text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 shadow-lg placeholder:text-gray-400 bg-white" />
          <button onClick={onSearch}
            className="absolute right-1.5 top-1/2 -translate-y-1/2 bg-orange-500 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-orange-600 transition shadow-md">
            Buscar
          </button>
        </div>

        {/* Mini stats */}
        {!currentUser && (
          <div className="flex gap-3 mt-4">
            <div className="flex items-center gap-1.5 bg-white/15 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs font-medium">
              <Zap size={12} className="text-yellow-300" />
              <span>+50 ofertas</span>
            </div>
            <div className="flex items-center gap-1.5 bg-white/15 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs font-medium">
              <TrendingUp size={12} className="text-green-300" />
              <span>Hasta 70% OFF</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


// =============================================
// BANNER PUBLICITARIO (para vender espacio)
// =============================================

// Banners de demo integrados (se muestran cuando no hay imágenes custom)
function DemoBanner({ index, onClick }: { index: number; onClick: () => void }) {
  const banners = [
    {
      gradient: 'from-red-600 via-red-500 to-orange-500',
      icon: '🔥',
      title: '¡MEGA DESCUENTOS!',
      subtitle: 'Hasta 60% OFF en gastronomía',
      badge: 'HOY',
      accent: 'bg-yellow-400 text-red-800',
    },
    {
      gradient: 'from-purple-600 via-violet-500 to-pink-500',
      icon: '💆‍♀️',
      title: 'SEMANA SPA',
      subtitle: 'Relax al mejor precio en Montevideo',
      badge: 'NUEVO',
      accent: 'bg-pink-300 text-purple-900',
    },
    {
      gradient: 'from-emerald-600 via-green-500 to-teal-500',
      icon: '🛍️',
      title: 'SHOPPING WEEK',
      subtitle: 'Descuentos en las mejores marcas',
      badge: '3 DÍAS',
      accent: 'bg-emerald-300 text-emerald-900',
    },
  ];

  const b = banners[index % banners.length];

  return (
    <div 
      className={`w-full bg-gradient-to-r ${b.gradient} rounded-2xl p-5 cursor-pointer active:scale-[0.98] transition-transform relative overflow-hidden`}
      onClick={onClick}
      style={{ minHeight: '120px' }}
    >
      {/* Decoraciones */}
      <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full" />
      <div className="absolute right-8 -bottom-8 w-20 h-20 bg-white/10 rounded-full" />
      <div className="absolute left-1/2 -bottom-2 w-14 h-14 bg-white/5 rounded-full" />
      
      <div className="relative flex items-center justify-between">
        <div className="flex-1">
          <span className={`${b.accent} text-[10px] font-bold px-2.5 py-0.5 rounded-full`}>
            {b.badge}
          </span>
          <h3 className="text-white text-xl font-black mt-2 leading-tight tracking-tight">
            {b.title}
          </h3>
          <p className="text-white/80 text-sm mt-1">
            {b.subtitle}
          </p>
          <div className="flex items-center gap-1.5 mt-2">
            <span className="bg-white/20 text-white text-[10px] font-bold px-2 py-0.5 rounded-full backdrop-blur-sm">
              Ver ofertas →
            </span>
          </div>
        </div>
        <div className="text-5xl ml-3 drop-shadow-lg">
          {b.icon}
        </div>
      </div>
    </div>
  );
}

interface AdBannerProps {
  linkTo?: string;
  links?: string[];
  className?: string;
}

export function AdBanner({ linkTo, links = [], className = '' }: AdBannerProps) {
  const navigate = useNavigate();
  const [loadedImages, setLoadedImages] = useState<string[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [checking, setChecking] = useState(true);

  // Si hay imágenes custom, intentar cargarlas
  useEffect(() => {
    if (!USE_CUSTOM_ADS) {
      setChecking(false);
      return;
    }

    let cancelled = false;

    const loadAll = async () => {
      const loaded: string[] = [];
      
      for (const file of CUSTOM_AD_FILES) {
        if (cancelled) return;
        
        const result = await new Promise<string | null>((resolve) => {
          const img = new Image();
          img.onload = () => resolve(file.image);
          img.onerror = () => resolve(null);
          img.src = file.image;
        });

        if (result) loaded.push(result);
      }
      
      if (!cancelled) {
        setLoadedImages(loaded);
        setChecking(false);
      }
    };

    loadAll();
    return () => { cancelled = true; };
  }, []);

  // Rotar automáticamente
  const totalItems = USE_CUSTOM_ADS ? loadedImages.length : 3;
  
  useEffect(() => {
    if (totalItems <= 1) return;
    
    const timer = setInterval(() => {
      setActiveIndex(prev => (prev + 1) % totalItems);
    }, 5000);

    return () => clearInterval(timer);
  }, [totalItems]);

  if (checking) return null;

  const handleClick = (index: number) => {
    const link = links[index] || linkTo || '/explore';
    if (link.startsWith('http')) {
      window.open(link, '_blank');
    } else {
      navigate(link);
    }
  };

  // Si hay imágenes custom cargadas, mostrarlas
  if (USE_CUSTOM_ADS && loadedImages.length > 0) {
    return (
      <div className={`relative rounded-2xl overflow-hidden shadow-md ${className}`}>
        <div className="relative" style={{ minHeight: '120px' }}>
          {loadedImages.map((img, i) => (
            <img
              key={img}
              src={img}
              alt={CUSTOM_AD_FILES[i]?.label || `Publicidad ${i + 1}`}
              className={`w-full object-cover transition-opacity duration-700 cursor-pointer active:scale-[0.98] ${
                i === activeIndex ? 'opacity-100 relative' : 'opacity-0 absolute inset-0'
              }`}
              style={{ maxHeight: '200px', minHeight: '120px' }}
              onClick={() => handleClick(i)}
            />
          ))}
        </div>

        <div className="absolute top-2 right-2 bg-black/40 backdrop-blur-sm text-white/80 text-[9px] px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
          <ExternalLink size={8} /> Publicidad
        </div>

        {loadedImages.length > 1 && (
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
            {loadedImages.map((_, i) => (
              <button
                key={i}
                onClick={(e) => { e.stopPropagation(); setActiveIndex(i); }}
                className={`w-2 h-2 rounded-full transition-all ${
                  i === activeIndex 
                    ? 'bg-white w-5' 
                    : 'bg-white/50 hover:bg-white/70'
                }`}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  // Banners de demo (diseño integrado, siempre se ven)
  return (
    <div className={`relative ${className}`}>
      <div className="relative overflow-hidden rounded-2xl">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className={`transition-all duration-700 ${
              i === activeIndex ? 'relative opacity-100' : 'absolute inset-0 opacity-0 pointer-events-none'
            }`}
          >
            <DemoBanner index={i} onClick={() => handleClick(i)} />
          </div>
        ))}
      </div>

      {/* Dots */}
      <div className="flex justify-center gap-1.5 mt-2">
        {[0, 1, 2].map((i) => (
          <button
            key={i}
            onClick={() => setActiveIndex(i)}
            className={`h-1.5 rounded-full transition-all ${
              i === activeIndex 
                ? 'bg-orange-500 w-6' 
                : 'bg-gray-300 w-1.5 hover:bg-gray-400'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
