import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Clock, Shield, Star, Share2, Heart, CheckCircle, AlertTriangle, ThumbsUp, Send, Navigation, Car, Footprints, Bike, Bus, ExternalLink } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useApp } from '../context/AppContext';
import { StarRating } from '../components/Layout';
import { formatPrice, daysLeft } from '../components/DealCard';
import { getNearbyBusLines, calculateDistance, estimateTravelTime, formatDistanceText } from '../data/busLines';
import { Deal } from '../types';

export default function DealDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { deals, currentUser, claimDeal, hasClaimedDeal, toggleFavorite, isFavorite, getReviewsForDeal, addReview, addToast, coupons } = useApp();
  const [claiming, setClaiming] = useState(false);
  const [justClaimed, setJustClaimed] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [activeTab, setActiveTab] = useState<'details' | 'reviews'>('details');
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [showShare, setShowShare] = useState(false);
  const [countdown, setCountdown] = useState('');

  const deal = deals.find(d => d.id === id);
  const reviews = deal ? getReviewsForDeal(deal.id) : [];
  const fav = deal ? isFavorite(deal.id) : false;
  const alreadyClaimed = deal ? hasClaimedDeal(deal.id) : false;
  const myCoupon = deal ? coupons.find(c => c.dealId === deal.id && c.userId === currentUser?.id && c.status === 'active') : null;

  useEffect(() => {
    if (!deal) return;
    const tick = () => {
      const diff = new Date(deal.expiresAt).getTime() - Date.now();
      if (diff <= 0) { setCountdown('Vencido'); return; }
      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff % 86400000) / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setCountdown(d > 0 ? `${d}d ${h}h ${m}m` : `${h}h ${m}m ${s}s`);
    };
    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [deal]);

  if (!deal) {
    return (
      <div className="max-w-lg mx-auto px-4 pt-20 text-center animate-fadeIn">
        <p className="text-5xl mb-4">😕</p>
        <p className="font-semibold text-gray-700">Oferta no encontrada</p>
        <button onClick={() => navigate('/')} className="mt-4 text-orange-500 font-medium">Volver al inicio</button>
      </div>
    );
  }

  const remaining = deal.availableQuantity - deal.claimedQuantity;
  const days = daysLeft(deal.expiresAt);
  const savings = deal.originalPrice - deal.discountPrice;
  const isUrgent = days <= 3;

  const handleClaim = () => {
    if (!currentUser) { navigate('/login'); return; }
    if (alreadyClaimed) { setShowQR(true); return; }
    setClaiming(true);
    setTimeout(() => {
      const coupon = claimDeal(deal.id);
      setClaiming(false);
      if (coupon) { setJustClaimed(true); setShowQR(true); }
    }, 1200);
  };

  const handleShare = () => {
    setShowShare(true);
    setTimeout(() => setShowShare(false), 2000);
    addToast('Link copiado al portapapeles', 'success');
  };

  const submitReview = () => {
    if (!newComment.trim()) return;
    addReview(deal.id, newRating, newComment);
    setNewComment('');
    setNewRating(5);
  };

  const avgRating = reviews.length > 0 ? reviews.reduce((a, r) => a + r.rating, 0) / reviews.length : deal.rating || 0;

  return (
    <div className="max-w-lg mx-auto pb-24 animate-fadeIn">
      {/* Hero */}
      <div className="relative">
        <img src={deal.image} alt={deal.title} className="w-full h-72 object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
        <button onClick={() => navigate(-1)} className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm p-2.5 rounded-full shadow-lg hover:bg-white transition">
          <ArrowLeft size={18} />
        </button>
        <div className="absolute top-4 right-4 flex gap-2">
          {currentUser && (
            <button onClick={() => toggleFavorite(deal.id)}
              className={`p-2.5 rounded-full shadow-lg transition-all duration-300 ${fav ? 'bg-red-500 text-white scale-110' : 'bg-white/90 backdrop-blur-sm hover:bg-white'}`}>
              <Heart size={18} fill={fav ? 'white' : 'none'} />
            </button>
          )}
          <button onClick={handleShare}
            className={`bg-white/90 backdrop-blur-sm p-2.5 rounded-full shadow-lg hover:bg-white transition ${showShare ? 'bg-green-500 text-white' : ''}`}>
            {showShare ? <CheckCircle size={18} /> : <Share2 size={18} />}
          </button>
        </div>
        <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
          <div className="bg-red-500 text-white px-4 py-2 rounded-xl font-bold text-lg shadow-lg">
            -{deal.discountPercent}% OFF
          </div>
          <div className="bg-white text-green-600 px-4 py-2 rounded-xl font-bold text-lg shadow-lg">
            {formatPrice(deal.discountPrice)}
          </div>
        </div>
      </div>

      <div className="px-4 pt-5">
        {/* Business */}
        <div className="flex items-center gap-3 mb-3">
          <div className="w-11 h-11 rounded-full bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center text-white font-bold shadow-md text-lg">
            {deal.businessLogo}
          </div>
          <div className="flex-1">
            <p className="font-semibold text-sm">{deal.businessName}</p>
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <StarRating rating={avgRating} size={11} />
              <span className="text-gray-400">({reviews.length || deal.reviewCount} reseñas)</span>
              <Shield size={11} className="text-green-500 ml-1" />
              <span className="text-green-600 font-medium">Verificado</span>
            </div>
          </div>
        </div>

        <h1 className="text-2xl font-extrabold mb-2 leading-tight">{deal.title}</h1>
        <p className="text-gray-500 text-sm mb-4 leading-relaxed">{deal.description}</p>

        {/* Value Box */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-4 mb-4 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400 mb-1">Precio regular</p>
              <p className="text-gray-400 line-through text-lg">{formatPrice(deal.originalPrice)}</p>
              <p className="text-sm text-gray-400 mt-1">Precio con descuento</p>
              <p className="text-3xl font-extrabold text-green-600">{formatPrice(deal.discountPrice)}</p>
            </div>
            <div className="text-right">
              <div className="bg-green-100 text-green-700 px-3 py-1.5 rounded-xl text-sm font-bold">
                Ahorrás {formatPrice(savings)}
              </div>
              <p className="text-[11px] text-gray-400 mt-1">Pagás en el local</p>
            </div>
          </div>
        </div>

        {/* Already claimed banner */}
        {alreadyClaimed && (
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 mb-4 animate-fadeIn">
            <p className="text-blue-700 font-semibold text-sm flex items-center gap-2">
              <CheckCircle size={16} /> ¡Ya canjeaste este cupón!
            </p>
            <button onClick={() => setShowQR(true)} className="text-blue-600 text-sm font-medium underline mt-1">
              Ver mi QR →
            </button>
          </div>
        )}

        {/* Countdown */}
        <div className={`rounded-2xl p-4 mb-4 flex items-center justify-between
          ${isUrgent ? 'bg-red-50 border border-red-200' : 'bg-gray-50 border border-gray-100'}`}>
          <div className="flex items-center gap-2">
            <Clock size={18} className={isUrgent ? 'text-red-500 animate-pulse' : 'text-gray-400'} />
            <span className={`text-sm font-medium ${isUrgent ? 'text-red-700' : 'text-gray-600'}`}>
              {isUrgent ? '¡Se acaba pronto!' : 'Tiempo restante'}
            </span>
          </div>
          <span className={`font-bold text-lg font-mono ${isUrgent ? 'text-red-600' : 'text-gray-800'}`}>{countdown}</span>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-5">
          <div className="bg-gray-50 rounded-xl p-3 text-center border border-gray-100">
            <p className="text-lg mb-0.5">⏰</p>
            <p className="text-[11px] text-gray-400">Vence en</p>
            <p className="font-bold text-sm">{days}d</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-3 text-center border border-gray-100">
            <p className="text-lg mb-0.5">🎟️</p>
            <p className="text-[11px] text-gray-400">Disponibles</p>
            <p className={`font-bold text-sm ${remaining <= 5 ? 'text-red-600' : ''}`}>{remaining}</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-3 text-center border border-gray-100">
            <p className="text-lg mb-0.5">🔥</p>
            <p className="text-[11px] text-gray-400">Canjeados</p>
            <p className="font-bold text-sm">{deal.claimedQuantity}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex bg-gray-100 rounded-xl p-1 mb-4">
          <button onClick={() => setActiveTab('details')}
            className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition ${activeTab === 'details' ? 'bg-white shadow text-orange-600' : 'text-gray-500'}`}>
            📋 Detalles
          </button>
          <button onClick={() => setActiveTab('reviews')}
            className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition ${activeTab === 'reviews' ? 'bg-white shadow text-orange-600' : 'text-gray-500'}`}>
            ⭐ Reseñas ({reviews.length || deal.reviewCount})
          </button>
        </div>

        {activeTab === 'details' ? (
          <div className="animate-fadeIn">
            <div className="mb-5">
              <p className="text-sm text-gray-600 leading-relaxed">{deal.details}</p>
            </div>
            <LocationInfoSection deal={deal} />

            {/* How it works */}
            <div className="bg-orange-50 rounded-2xl p-4 mb-5 border border-orange-100">
              <h3 className="font-bold text-sm mb-3">📱 ¿Cómo funciona?</h3>
              <div className="space-y-3">
                {[
                  { step: '1', text: 'Tocá "Obtener Cupón" para reservar tu descuento', icon: '👆' },
                  { step: '2', text: 'Se genera un código QR único para vos', icon: '📲' },
                  { step: '3', text: 'Mostrá el QR en el comercio y pagás el precio con descuento', icon: '🏪' },
                  { step: '4', text: '¡Disfrutá tu ahorro!', icon: '🎉' },
                ].map(s => (
                  <div key={s.step} className="flex items-center gap-3 text-sm">
                    <div className="w-8 h-8 rounded-full bg-orange-200 flex items-center justify-center text-base flex-shrink-0">{s.icon}</div>
                    <span className="text-gray-700">{s.text}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mb-5">
              <h3 className="font-bold text-sm mb-3">📜 Términos y Condiciones</h3>
              <div className="space-y-2">
                {deal.terms.map((term, i) => (
                  <div key={i} className="flex items-start gap-2.5 text-sm text-gray-600 bg-gray-50 rounded-xl p-3 border border-gray-100">
                    <CheckCircle size={15} className="text-green-500 flex-shrink-0 mt-0.5" />
                    {term}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="animate-fadeIn">
            <div className="bg-gradient-to-r from-amber-50 to-yellow-50 rounded-2xl p-4 mb-4 border border-amber-100 flex items-center gap-4">
              <div className="text-center">
                <p className="text-4xl font-extrabold text-amber-600">{avgRating.toFixed(1)}</p>
                <StarRating rating={avgRating} size={14} showValue={false} />
                <p className="text-xs text-gray-400 mt-1">{reviews.length} reseñas</p>
              </div>
              <div className="flex-1 space-y-1">
                {[5, 4, 3, 2, 1].map(star => {
                  const count = reviews.filter(r => r.rating === star).length;
                  const pct = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
                  return (
                    <div key={star} className="flex items-center gap-2 text-xs">
                      <span className="w-3 text-gray-500">{star}</span>
                      <Star size={10} className="text-amber-400 fill-amber-400" />
                      <div className="flex-1 bg-gray-200 rounded-full h-1.5">
                        <div className="bg-amber-400 h-1.5 rounded-full transition-all" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="w-5 text-gray-400 text-right">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {currentUser && (
              <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-4 shadow-sm">
                <h4 className="font-semibold text-sm mb-3">Escribí tu reseña</h4>
                <div className="flex gap-1 mb-3">
                  {[1, 2, 3, 4, 5].map(s => (
                    <button key={s} onClick={() => setNewRating(s)} className="transition-transform hover:scale-125">
                      <Star size={24} fill={s <= newRating ? '#f59e0b' : 'none'} stroke={s <= newRating ? '#f59e0b' : '#d1d5db'} />
                    </button>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input type="text" value={newComment} onChange={e => setNewComment(e.target.value)}
                    placeholder="Tu opinión..."
                    className="flex-1 px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-orange-300 focus:outline-none" />
                  <button onClick={submitReview} className="bg-orange-500 text-white px-4 rounded-xl hover:bg-orange-600 transition">
                    <Send size={16} />
                  </button>
                </div>
              </div>
            )}

            <div className="space-y-3">
              {reviews.map(review => (
                <div key={review.id} className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm animate-fadeInUp">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white text-xs font-bold">
                        {review.userName.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-semibold">{review.userName}</p>
                        <StarRating rating={review.rating} size={10} showValue={false} />
                      </div>
                    </div>
                    <span className="text-xs text-gray-400">
                      {new Date(review.createdAt).toLocaleDateString('es-UY', { day: 'numeric', month: 'short' })}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{review.comment}</p>
                  <button className="flex items-center gap-1 text-xs text-gray-400 hover:text-blue-500 transition">
                    <ThumbsUp size={12} /> Útil ({review.helpful})
                  </button>
                </div>
              ))}
              {reviews.length === 0 && (
                <div className="text-center py-8 text-gray-400">
                  <p className="text-3xl mb-2">💬</p>
                  <p className="text-sm">Aún no hay reseñas. ¡Sé el primero!</p>
                </div>
              )}
            </div>
          </div>
        )}

        {remaining <= 10 && remaining > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3 my-5 flex items-center gap-2 animate-fadeIn">
            <AlertTriangle size={18} className="text-amber-500 flex-shrink-0" />
            <p className="text-sm text-amber-700">¡Apurate! Solo quedan <strong>{remaining}</strong> cupones.</p>
          </div>
        )}
      </div>

      {/* Bottom CTA */}
      {!justClaimed && !alreadyClaimed ? (
        <div className="fixed bottom-16 left-0 right-0 glass border-t border-gray-200/60 p-4 z-40">
          <div className="max-w-lg mx-auto flex items-center gap-3">
            <div className="flex-1">
              <p className="text-xs text-gray-400">Antes: <span className="line-through">{formatPrice(deal.originalPrice)}</span></p>
              <p className="text-2xl font-extrabold text-green-600">{formatPrice(deal.discountPrice)}</p>
              <p className="text-[10px] text-gray-400">Pagás en el local</p>
            </div>
            <button onClick={handleClaim} disabled={claiming || remaining <= 0}
              className="bg-gradient-to-r from-orange-500 to-amber-500 text-white px-8 py-3.5 rounded-2xl font-bold text-base shadow-lg hover:shadow-xl transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2">
              {claiming ? (
                <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> Reservando...</>
              ) : remaining <= 0 ? (
                'Agotado'
              ) : (
                <>🎟️ Obtener Cupón</>
              )}
            </button>
          </div>
        </div>
      ) : (
        <div className="fixed bottom-16 left-0 right-0 bg-green-50 border-t border-green-200 p-4 z-40 animate-fadeIn">
          <div className="max-w-lg mx-auto flex items-center justify-between">
            <p className="text-green-700 font-bold flex items-center gap-2">
              <CheckCircle size={20} /> {justClaimed ? '¡Cupón reservado! 🎉' : 'Ya tenés este cupón'}
            </p>
            <button onClick={() => setShowQR(true)} className="bg-green-500 text-white px-4 py-2 rounded-xl text-sm font-bold">
              Ver mi QR 📲
            </button>
          </div>
        </div>
      )}

      {/* QR Modal */}
      {showQR && myCoupon && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fadeIn" onClick={() => setShowQR(false)}>
          <div className="bg-white w-full max-w-sm rounded-3xl overflow-hidden animate-scaleIn" onClick={e => e.stopPropagation()}>
            <div className="bg-gradient-to-br from-green-500 to-emerald-500 p-5 text-white text-center relative">
              <div className="absolute -bottom-3 left-6 w-6 h-6 bg-white rounded-full" />
              <div className="absolute -bottom-3 right-6 w-6 h-6 bg-white rounded-full" />
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold mb-3 bg-white/20">
                <CheckCircle size={12} /> Cupón Activo
              </div>
              <h2 className="font-bold text-lg leading-tight">{deal.title}</h2>
              <p className="text-sm text-white/80 mt-1">{deal.businessName}</p>
            </div>

            <div className="p-6 text-center border-t-2 border-dashed border-gray-200">
              <p className="text-sm text-gray-600 mb-4 font-medium">📱 Mostrá este QR en el local y pagá el precio con descuento</p>
              <div className="bg-white border-2 border-green-200 rounded-2xl p-5 inline-block shadow-inner mb-4">
                <QRCodeSVG value={myCoupon.qrCode} size={200} level="H" fgColor="#1a1a1a" />
              </div>

              <p className="text-xs text-gray-400 font-mono bg-gray-50 px-3 py-2 rounded-lg mb-3 break-all border">
                {myCoupon.qrCode}
              </p>

              <div className="bg-green-50 rounded-xl p-3 mb-4 border border-green-100">
                <p className="text-xs text-gray-500 mb-1">Pagás en el local:</p>
                <p className="text-green-700 font-extrabold text-2xl">{formatPrice(deal.discountPrice)}</p>
                <p className="text-xs text-green-600 mt-0.5">
                  <span className="line-through text-gray-400">{formatPrice(deal.originalPrice)}</span>
                  <span className="ml-1.5 font-bold text-red-500">-{deal.discountPercent}% OFF</span>
                </p>
              </div>

              <div className="bg-orange-50 rounded-xl p-3 mb-4 border border-orange-100">
                <p className="text-xs text-orange-700 font-medium">📍 Canjeá en: {deal.address}</p>
              </div>

              <button onClick={() => setShowQR(false)}
                className="w-full bg-gray-100 text-gray-700 py-3 rounded-xl font-medium text-sm hover:bg-gray-200 transition">
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ========================================
// LOCATION MAP + DISTANCE + BUS LINES
// ========================================
function LocationInfoSection({ deal }: { deal: Deal }) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [showBuses, setShowBuses] = useState(false);
  const [mapExpanded, setMapExpanded] = useState(false);

  const busInfo = getNearbyBusLines(deal.lat, deal.lng);

  const travelInfo = userLocation
    ? (() => {
        const dist = calculateDistance(userLocation[0], userLocation[1], deal.lat, deal.lng);
        const travel = estimateTravelTime(dist);
        return { distance: dist, travel };
      })()
    : null;

  const getUserLocation = useCallback(() => {
    if (!navigator.geolocation) return;
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation([pos.coords.latitude, pos.coords.longitude]);
        setIsLocating(false);
      },
      () => {
        // Fallback: Plaza Independencia, Montevideo
        setUserLocation([-34.9058, -56.1913]);
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  }, []);

  // Auto-request location
  useEffect(() => {
    getUserLocation();
  }, [getUserLocation]);

  // Initialize / update Leaflet map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Destroy previous map
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    const map = L.map(mapContainerRef.current, {
      center: [deal.lat, deal.lng],
      zoom: 15,
      zoomControl: false,
      attributionControl: false,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
    }).addTo(map);

    // Deal marker (orange)
    const dealIcon = L.divIcon({
      className: 'custom-deal-marker',
      html: `
        <div style="
          display: flex; flex-direction: column; align-items: center; transform: translate(-50%, -100%);
        ">
          <div style="
            background: linear-gradient(135deg, #f97316, #ea580c);
            color: white; font-weight: 800; font-size: 11px;
            padding: 6px 10px; border-radius: 12px;
            box-shadow: 0 4px 12px rgba(249,115,22,0.5);
            white-space: nowrap;
          ">
            📍 ${deal.businessName}
          </div>
          <div style="
            width: 0; height: 0;
            border-left: 8px solid transparent;
            border-right: 8px solid transparent;
            border-top: 10px solid #ea580c;
            margin-top: -1px;
          "></div>
        </div>
      `,
      iconSize: [0, 0],
      iconAnchor: [0, 0],
    });

    L.marker([deal.lat, deal.lng], { icon: dealIcon })
      .addTo(map)
      .bindPopup(`
        <div style="text-align:center; min-width: 160px; padding: 4px;">
          <p style="font-weight:800; font-size:13px; margin-bottom:4px;">${deal.businessName}</p>
          <p style="font-size:11px; color:#666; margin-bottom:6px;">${deal.address}</p>
          <a href="https://www.google.com/maps/dir/?api=1&destination=${deal.lat},${deal.lng}" 
             target="_blank" rel="noopener noreferrer"
             style="background:#f97316; color:white; text-decoration:none; padding:6px 14px; border-radius:8px; font-size:11px; font-weight:700; display:inline-block;">
            Cómo llegar →
          </a>
        </div>
      `);

    // User marker (blue pulsing dot)
    if (userLocation) {
      const userIcon = L.divIcon({
        className: 'custom-user-marker',
        html: `
          <div style="position: relative; transform: translate(-50%, -50%);">
            <div style="
              width: 32px; height: 32px; border-radius: 50%;
              background: rgba(59,130,246,0.2);
              animation: userPulse 2s ease-out infinite;
              position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
            "></div>
            <div style="
              width: 14px; height: 14px; border-radius: 50%;
              background: #3b82f6; border: 3px solid white;
              box-shadow: 0 2px 8px rgba(59,130,246,0.5);
              position: relative; z-index: 2;
            "></div>
          </div>
        `,
        iconSize: [14, 14],
        iconAnchor: [7, 7],
      });

      L.marker(userLocation, { icon: userIcon }).addTo(map)
        .bindPopup('<p style="font-weight:700; font-size:12px; text-align:center;">📱 Tu ubicación</p>');

      // Dashed line between user and deal
      L.polyline([userLocation, [deal.lat, deal.lng]], {
        color: '#3b82f6',
        weight: 2.5,
        dashArray: '8, 8',
        opacity: 0.7,
      }).addTo(map);

      // Fit bounds to show both markers
      const bounds = L.latLngBounds([userLocation, [deal.lat, deal.lng]]);
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
    }

    // Zoom controls manual
    L.control.zoom({ position: 'bottomright' }).addTo(map);

    mapInstanceRef.current = map;

    // Fix tiles on resize
    setTimeout(() => map.invalidateSize(), 200);

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [deal.lat, deal.lng, deal.businessName, deal.address, userLocation, mapExpanded]);

  const openGoogleMaps = () => {
    const url = userLocation
      ? `https://www.google.com/maps/dir/${userLocation[0]},${userLocation[1]}/${deal.lat},${deal.lng}`
      : `https://www.google.com/maps/search/?api=1&query=${deal.lat},${deal.lng}`;
    window.open(url, '_blank');
  };

  return (
    <div className="space-y-3 mb-5">
      {/* MAP SECTION */}
      <div className="rounded-2xl overflow-hidden border border-gray-200 shadow-sm">
        <div className="bg-gradient-to-r from-orange-500 to-amber-500 px-4 py-3 flex items-center justify-between">
          <h3 className="font-bold text-sm text-white flex items-center gap-2">
            <MapPin size={15} /> Ubicación en el mapa
          </h3>
          <button
            onClick={() => setMapExpanded(!mapExpanded)}
            className="text-white/90 text-xs font-medium bg-white/20 px-3 py-1 rounded-full hover:bg-white/30 transition"
          >
            {mapExpanded ? '🔽 Reducir' : '🔼 Ampliar'}
          </button>
        </div>

        {/* Leaflet Map */}
        <div
          ref={mapContainerRef}
          style={{ height: mapExpanded ? '350px' : '200px' }}
          className="w-full transition-all duration-300 bg-gray-100"
        />

        {/* Address + Google Maps button */}
        <div className="bg-white px-4 py-3 border-t border-gray-100">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0 mt-0.5">
              <MapPin size={16} className="text-orange-500" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-800">{deal.businessName}</p>
              <p className="text-xs text-gray-500 mt-0.5">{deal.address}</p>
            </div>
            <button
              onClick={openGoogleMaps}
              className="flex items-center gap-1.5 bg-blue-500 text-white text-xs font-bold px-3 py-2 rounded-xl hover:bg-blue-600 transition flex-shrink-0"
            >
              <ExternalLink size={12} /> Ir
            </button>
          </div>
        </div>
      </div>

      {/* DISTANCE + TRAVEL TIME */}
      <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
        {travelInfo ? (
          <div className="space-y-3">
            {/* Distance badge */}
            <div className="bg-blue-50 rounded-xl p-3 flex items-center justify-between border border-blue-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <Navigation size={14} className="text-blue-500" />
                </div>
                <div>
                  <span className="text-sm font-bold text-blue-700">
                    Estás a {formatDistanceText(travelInfo.distance)}
                  </span>
                  <p className="text-[10px] text-blue-500">desde tu ubicación actual</p>
                </div>
              </div>
              <button
                onClick={openGoogleMaps}
                className="text-[10px] text-blue-600 font-bold underline"
              >
                Google Maps →
              </button>
            </div>

            {/* Travel times */}
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-white rounded-xl p-3 text-center border border-gray-100 shadow-sm">
                <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-1.5">
                  <Footprints size={20} className="text-green-500" />
                </div>
                <p className="text-[10px] text-gray-400 font-medium">Caminando</p>
                <p className="text-sm font-extrabold text-green-700">{travelInfo.travel.walking.time}</p>
              </div>
              <div className="bg-white rounded-xl p-3 text-center border border-gray-100 shadow-sm">
                <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center mx-auto mb-1.5">
                  <Bike size={20} className="text-amber-500" />
                </div>
                <p className="text-[10px] text-gray-400 font-medium">En bici</p>
                <p className="text-sm font-extrabold text-amber-700">{travelInfo.travel.bike.time}</p>
              </div>
              <div className="bg-white rounded-xl p-3 text-center border border-gray-100 shadow-sm">
                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center mx-auto mb-1.5">
                  <Car size={20} className="text-blue-500" />
                </div>
                <p className="text-[10px] text-gray-400 font-medium">En auto</p>
                <p className="text-sm font-extrabold text-blue-700">{travelInfo.travel.driving.time}</p>
              </div>
            </div>
          </div>
        ) : (
          <button
            onClick={getUserLocation}
            disabled={isLocating}
            className="w-full bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-600 font-medium flex items-center justify-center gap-2 hover:bg-blue-100 transition"
          >
            {isLocating ? (
              <><div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" /> Buscando tu ubicación...</>
            ) : (
              <><Navigation size={16} /> 📍 Activar ubicación para ver distancia y tiempos</>
            )}
          </button>
        )}
      </div>

      {/* BUS LINES */}
      <div className="bg-emerald-50 rounded-2xl border border-emerald-200 overflow-hidden">
        <button
          onClick={() => setShowBuses(!showBuses)}
          className="w-full p-4 flex items-center justify-between hover:bg-emerald-100/50 transition"
        >
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 bg-emerald-100 rounded-full flex items-center justify-center">
              <Bus size={18} className="text-emerald-600" />
            </div>
            <div className="text-left">
              <h4 className="font-bold text-sm text-emerald-800">🚌 Ómnibus cercanos</h4>
              <p className="text-[11px] text-emerald-600">
                Zona {busInfo.zone} · {busInfo.lines.length} líneas disponibles
              </p>
            </div>
          </div>
          <div className={`text-emerald-400 transition-transform duration-200 ${showBuses ? 'rotate-90' : ''}`}>
            ▶
          </div>
        </button>

        {showBuses && (
          <div className="px-4 pb-4 space-y-2 animate-fadeIn border-t border-emerald-200/50 pt-3">
            <div className="grid grid-cols-2 gap-2">
              {busInfo.lines.map((line, i) => (
                <div key={i} className="bg-white rounded-xl p-2.5 flex items-center gap-2.5 shadow-sm">
                  <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-extrabold text-[11px]">{line.number}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-semibold text-gray-800 line-clamp-1">{line.name}</p>
                    <p className="text-[9px] text-gray-400">{line.company}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-white/70 rounded-xl p-3 text-center mt-2 space-y-1.5">
              <p className="text-[11px] text-emerald-700 font-medium">
                💡 Consultá horarios y recorridos:
              </p>
              <div className="flex gap-2 justify-center">
                <a href="https://www.montevideo.gub.uy/aplicacion/como-ir" target="_blank" rel="noopener noreferrer"
                   className="bg-emerald-500 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg hover:bg-emerald-600 transition">
                  ¿Cómo ir? (IMM)
                </a>
                <a href="https://stm.com.uy" target="_blank" rel="noopener noreferrer"
                   className="bg-blue-500 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg hover:bg-blue-600 transition">
                  STM Uruguay
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
