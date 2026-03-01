/**
 * ============================================
 * BANNERS DE DESCUENTOSYA
 * ============================================
 * 
 * 🔧 CÓMO PONER TUS PROPIOS BANNERS:
 * 
 *   BANNER PRINCIPAL (hero):
 *   → Cambiá HERO_BANNER_FILE por tu imagen
 * 
 *   BANNER PUBLICITARIO:
 *   → Cambiá AD_BANNER_FILES por las imágenes de tus clientes
 * 
 *   Pueden ser archivos locales (/banner.jpg en public/)
 *   o URLs de internet (https://...)
 * ============================================
 */

// ⬇️ CAMBIÁ ACÁ ⬇️
// Para producción: '/banner.jpg' (archivo en public/)
// Para demo: URLs de internet
const HERO_BANNER_FILE = 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1080&h=600&fit=crop';

const AD_BANNER_FILES = [
  'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1080&h=300&fit=crop',
  'https://images.unsplash.com/photo-1607082349566-187342175e2f?w=1080&h=300&fit=crop',
  'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=1080&h=300&fit=crop',
];

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ExternalLink } from 'lucide-react';
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

  return (
    <div className="relative rounded-3xl overflow-hidden mb-5 animate-fadeIn">
      {/* Imagen de fondo */}
      {!imgError && (
        <img
          src={HERO_BANNER_FILE}
          alt=""
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
          onLoad={() => setImgLoaded(true)}
          onError={() => setImgError(true)}
        />
      )}

      {/* Overlay oscuro sobre la imagen */}
      {imgLoaded && !imgError && (
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/40 to-black/70" />
      )}

      {/* Fondo gradiente fallback */}
      {(imgError || !imgLoaded) && (
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500 via-amber-500 to-yellow-400" />
      )}

      {/* Decoraciones */}
      <div className="absolute -right-10 -top-10 w-36 h-36 bg-white/10 rounded-full" />
      <div className="absolute right-8 -bottom-14 w-28 h-28 bg-white/10 rounded-full" />
      <div className="absolute left-4 bottom-3 w-16 h-16 bg-white/5 rounded-full" />

      {/* Contenido */}
      <div className="relative p-6 text-white">
        {currentUser ? (
          <h1 className="text-2xl font-extrabold mb-1">
            ¡Hola, {currentUser.name.split(' ')[0]}! 👋
          </h1>
        ) : (
          <div className="flex items-center gap-3 mb-2">
            <LogoIcon size={44} />
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
        )}
        
        <p className="text-white/85 text-sm mb-4">
          {currentUser && totalSaved > 0
            ? `Ya ahorraste $U ${new Intl.NumberFormat('es-UY', { maximumFractionDigits: 0 }).format(totalSaved)} 💰`
            : 'Los mejores descuentos de comercios locales'
          }
        </p>

        <div className="relative">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Buscar ofertas, comercios..."
            value={localSearch}
            onChange={e => setLocalSearch(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && onSearch()}
            className="w-full pl-11 pr-20 py-3.5 rounded-2xl text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 shadow-lg placeholder:text-gray-400" />
          <button onClick={onSearch}
            className="absolute right-1.5 top-1/2 -translate-y-1/2 bg-orange-500 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-orange-600 transition shadow-md">
            Buscar
          </button>
        </div>
      </div>
    </div>
  );
}


// =============================================
// BANNER PUBLICITARIO ROTATIVO
// =============================================
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

  useEffect(() => {
    let cancelled = false;

    const loadAll = async () => {
      const loaded: string[] = [];
      
      for (const file of AD_BANNER_FILES) {
        if (cancelled) return;
        
        const result = await new Promise<string | null>((resolve) => {
          const img = new Image();
          img.onload = () => resolve(file);
          img.onerror = () => resolve(null);
          img.src = file;
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
  useEffect(() => {
    if (loadedImages.length <= 1) return;
    
    const timer = setInterval(() => {
      setActiveIndex(prev => (prev + 1) % loadedImages.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [loadedImages.length]);

  if (checking || loadedImages.length === 0) return null;

  const handleClick = () => {
    const link = links[activeIndex] || linkTo;
    if (link) {
      if (link.startsWith('http')) {
        window.open(link, '_blank');
      } else {
        navigate(link);
      }
    }
  };

  return (
    <div className={`relative rounded-2xl overflow-hidden shadow-md ${className}`}>
      <div className="relative" style={{ minHeight: '120px' }}>
        {loadedImages.map((img, i) => (
          <img
            key={img}
            src={img}
            alt={`Publicidad ${i + 1}`}
            className={`w-full object-cover transition-opacity duration-700 cursor-pointer active:scale-[0.98] ${
              i === activeIndex ? 'opacity-100 relative' : 'opacity-0 absolute inset-0'
            }`}
            style={{ maxHeight: '200px', minHeight: '120px' }}
            onClick={handleClick}
          />
        ))}
      </div>

      {/* Badge */}
      <div className="absolute top-2 right-2 bg-black/40 backdrop-blur-sm text-white/80 text-[9px] px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
        <ExternalLink size={8} /> Publicidad
      </div>

      {/* Dots */}
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
