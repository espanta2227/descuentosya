import { useNavigate } from 'react-router-dom';
import { MapPin, Clock, TrendingUp, Heart } from 'lucide-react';
import { Deal } from '../types';
import { useApp } from '../context/AppContext';
import { useEffect, useState } from 'react';

export function formatPrice(price: number): string {
  return '$U ' + new Intl.NumberFormat('es-UY', { maximumFractionDigits: 0 }).format(price);
}

export function daysLeft(date: string): number {
  const diff = new Date(date).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

function CountdownBadge({ expiresAt }: { expiresAt: string }) {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    const calc = () => {
      const diff = new Date(expiresAt).getTime() - Date.now();
      if (diff <= 0) { setTimeLeft('Vencido'); return; }
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      if (days > 3) setTimeLeft(`${days}d`);
      else if (days > 0) setTimeLeft(`${days}d ${hours}h`);
      else {
        const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        setTimeLeft(`${hours}h ${mins}m`);
      }
    };
    calc();
    const timer = setInterval(calc, 60000);
    return () => clearInterval(timer);
  }, [expiresAt]);

  const days = daysLeft(expiresAt);
  const isUrgent = days <= 3;

  return (
    <div className={`flex items-center gap-1 text-xs font-medium ${isUrgent ? 'text-red-500' : 'text-gray-400'}`}>
      <Clock size={12} className={isUrgent ? 'animate-pulse' : ''} />
      <span>{timeLeft}</span>
    </div>
  );
}

export default function DealCard({ deal, compact = false, index = 0 }: { deal: Deal; compact?: boolean; index?: number }) {
  const navigate = useNavigate();
  const { toggleFavorite, isFavorite, currentUser } = useApp();
  const remaining = deal.availableQuantity - deal.claimedQuantity;
  const claimedPercent = Math.round((deal.claimedQuantity / deal.availableQuantity) * 100);
  const fav = isFavorite(deal.id);

  const handleFav = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentUser) toggleFavorite(deal.id);
  };

  if (compact) {
    return (
      <div
        onClick={() => navigate(`/deal/${deal.id}`)}
        className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden card-hover cursor-pointer animate-fadeInUp"
        style={{ animationDelay: `${index * 80}ms`, animationFillMode: 'backwards' }}
      >
        <div className="relative">
          <img src={deal.image} alt={deal.title} className="w-full h-32 object-cover" loading="lazy" />
          <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-0.5 rounded-lg text-[11px] font-bold shadow">
            -{deal.discountPercent}%
          </div>
          {currentUser && (
            <button onClick={handleFav}
              className={`absolute top-2 right-2 p-1.5 rounded-full shadow transition-all
                ${fav ? 'bg-red-500 text-white scale-110' : 'bg-white/80 text-gray-600 hover:bg-white'}`}>
              <Heart size={12} fill={fav ? 'white' : 'none'} />
            </button>
          )}
          {remaining <= 5 && remaining > 0 && (
            <div className="absolute bottom-2 left-2 bg-amber-500/90 text-white px-2 py-0.5 rounded-lg text-[10px] font-bold">
              ¡Últimos {remaining}!
            </div>
          )}
        </div>
        <div className="p-3">
          <p className="text-[11px] text-gray-400 mb-0.5 font-medium">{deal.businessName}</p>
          <h3 className="font-semibold text-sm leading-tight line-clamp-2 mb-2">{deal.title}</h3>
          <div className="flex items-end justify-between">
            <div>
              <span className="text-green-600 font-bold text-sm">{formatPrice(deal.discountPrice)}</span>
              <span className="text-gray-300 line-through text-[11px] ml-1.5">{formatPrice(deal.originalPrice)}</span>
            </div>
            <CountdownBadge expiresAt={deal.expiresAt} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={() => navigate(`/deal/${deal.id}`)}
      className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden card-hover cursor-pointer animate-fadeInUp"
      style={{ animationDelay: `${index * 100}ms`, animationFillMode: 'backwards' }}
    >
      <div className="relative">
        <img src={deal.image} alt={deal.title} className="w-full h-48 object-cover" loading="lazy" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
        <div className="absolute top-3 left-3 bg-red-500 text-white px-3 py-1.5 rounded-xl text-sm font-bold shadow-lg">
          -{deal.discountPercent}% OFF
        </div>
        {currentUser && (
          <button onClick={handleFav}
            className={`absolute top-3 right-3 p-2 rounded-full shadow-lg transition-all duration-300
              ${fav ? 'bg-red-500 text-white scale-110' : 'bg-white/90 backdrop-blur-sm text-gray-600 hover:bg-white hover:text-red-500'}`}>
            <Heart size={18} fill={fav ? 'white' : 'none'} />
          </button>
        )}
        {remaining <= 5 && remaining > 0 && (
          <div className="absolute top-3 right-14 bg-amber-500 text-white px-2.5 py-1 rounded-xl text-xs font-bold shadow flex items-center gap-1 animate-pulse">
            <TrendingUp size={12} /> ¡Últimos {remaining}!
          </div>
        )}
        {deal.featured && (
          <div className="absolute bottom-3 right-3 bg-gradient-to-r from-amber-500 to-yellow-400 text-white px-2.5 py-1 rounded-lg text-[11px] font-bold shadow">
            ⭐ Destacado
          </div>
        )}
        <div className="absolute bottom-3 left-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm border border-white/40 flex items-center justify-center text-white text-sm font-bold">
              {deal.businessName.charAt(0)}
            </div>
            <span className="text-white font-medium text-sm drop-shadow">{deal.businessName}</span>
          </div>
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-bold text-base leading-tight mb-1.5">{deal.title}</h3>
        <p className="text-gray-500 text-sm line-clamp-2 mb-3">{deal.description}</p>

        <div className="flex items-center gap-2 text-xs text-gray-400 mb-3">
          <MapPin size={13} />
          <span className="truncate">{deal.address}</span>
        </div>

        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div>
              <p className="text-green-600 font-extrabold text-xl">{formatPrice(deal.discountPrice)}</p>
            </div>
            <div>
              <span className="text-gray-300 line-through text-sm">{formatPrice(deal.originalPrice)}</span>
              <span className="text-red-500 font-bold text-xs ml-1.5">-{deal.discountPercent}%</span>
            </div>
          </div>
          <CountdownBadge expiresAt={deal.expiresAt} />
        </div>

        <div>
          <div className="flex justify-between text-[11px] text-gray-400 mb-1">
            <span>{deal.claimedQuantity} canjeados</span>
            <span>{remaining} disponibles</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
            <div className="bg-gradient-to-r from-green-400 to-emerald-500 h-1.5 rounded-full transition-all duration-700"
              style={{ width: `${claimedPercent}%` }} />
          </div>
        </div>

        {deal.rating && (
          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-50">
            <div className="flex items-center gap-0.5">
              {[1,2,3,4,5].map(s => (
                <svg key={s} width={12} height={12} viewBox="0 0 24 24"
                  fill={s <= Math.round(deal.rating!) ? '#f59e0b' : '#e5e7eb'} stroke="none">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
              ))}
            </div>
            <span className="text-xs text-gray-400">{deal.rating} ({deal.reviewCount} reseñas)</span>
          </div>
        )}
      </div>
    </div>
  );
}
