import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Clock, Shield, Star, Share2, Heart, CheckCircle, AlertTriangle, ThumbsUp, Send } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { StarRating } from '../components/Layout';
import { formatPrice, daysLeft } from '../components/DealCard';

export default function DealDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { deals, currentUser, purchaseDeal, toggleFavorite, isFavorite, getReviewsForDeal, addReview, addToast } = useApp();
  const [purchasing, setPurchasing] = useState(false);
  const [purchased, setPurchased] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [activeTab, setActiveTab] = useState<'details' | 'reviews'>('details');
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [showShare, setShowShare] = useState(false);
  const [countdown, setCountdown] = useState('');

  const deal = deals.find(d => d.id === id);
  const reviews = deal ? getReviewsForDeal(deal.id) : [];
  const fav = deal ? isFavorite(deal.id) : false;

  // Countdown timer
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

  const remaining = deal.availableQuantity - deal.soldQuantity;
  const days = daysLeft(deal.expiresAt);
  const savings = deal.originalPrice - deal.discountPrice;
  const isUrgent = days <= 3;

  const handlePurchase = () => {
    if (!currentUser) { navigate('/login'); return; }
    setShowPayment(true);
  };

  const confirmPurchase = () => {
    setPurchasing(true);
    setTimeout(() => {
      const coupon = purchaseDeal(deal.id);
      setPurchasing(false);
      if (coupon) { setPurchased(true); setShowPayment(false); }
    }, 1500);
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
      {/* Hero Image */}
      <div className="relative">
        <img src={deal.image} alt={deal.title} className="w-full h-72 object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
        <button onClick={() => navigate(-1)}
          className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm p-2.5 rounded-full shadow-lg hover:bg-white transition">
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
        <div className="absolute bottom-4 left-4 right-4">
          <div className="bg-red-500 text-white px-4 py-2 rounded-xl font-bold text-lg shadow-lg inline-block">
            -{deal.discountPercent}% OFF
          </div>
        </div>
      </div>

      <div className="px-4 pt-5">
        {/* Business Info */}
        <div className="flex items-center gap-3 mb-3">
          <div className="w-11 h-11 rounded-full bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center text-white font-bold shadow-md">
            {deal.businessName.charAt(0)}
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

        {/* Title */}
        <h1 className="text-2xl font-extrabold mb-2 leading-tight">{deal.title}</h1>
        <p className="text-gray-500 text-sm mb-4 leading-relaxed">{deal.description}</p>

        {/* Price Box */}
        <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-2xl p-4 mb-4 border border-orange-100/80">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400 line-through">{formatPrice(deal.originalPrice)}</p>
              <p className="text-3xl font-extrabold text-orange-600">{formatPrice(deal.discountPrice)}</p>
            </div>
            <div className="text-right">
              <div className="bg-green-100 text-green-700 px-3 py-1.5 rounded-xl text-sm font-bold inline-block">
                Ahorrás {formatPrice(savings)}
              </div>
              <p className="text-[11px] text-gray-400 mt-1">IVA incluido</p>
            </div>
          </div>
        </div>

        {/* Countdown */}
        <div className={`rounded-2xl p-4 mb-4 flex items-center justify-between
          ${isUrgent ? 'bg-red-50 border border-red-200' : 'bg-gray-50 border border-gray-100'}`}>
          <div className="flex items-center gap-2">
            <Clock size={18} className={isUrgent ? 'text-red-500 animate-pulse' : 'text-gray-400'} />
            <span className={`text-sm font-medium ${isUrgent ? 'text-red-700' : 'text-gray-600'}`}>
              {isUrgent ? '¡Se acaba pronto!' : 'Tiempo restante'}
            </span>
          </div>
          <span className={`font-bold text-lg font-mono ${isUrgent ? 'text-red-600' : 'text-gray-800'}`}>
            {countdown}
          </span>
        </div>

        {/* Stats Cards */}
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
            <p className="text-[11px] text-gray-400">Vendidos</p>
            <p className="font-bold text-sm">{deal.soldQuantity}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex bg-gray-100 rounded-xl p-1 mb-4">
          <button onClick={() => setActiveTab('details')}
            className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition
              ${activeTab === 'details' ? 'bg-white shadow text-orange-600' : 'text-gray-500'}`}>
            📋 Detalles
          </button>
          <button onClick={() => setActiveTab('reviews')}
            className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition
              ${activeTab === 'reviews' ? 'bg-white shadow text-orange-600' : 'text-gray-500'}`}>
            ⭐ Reseñas ({reviews.length || deal.reviewCount})
          </button>
        </div>

        {activeTab === 'details' ? (
          <div className="animate-fadeIn">
            {/* Details */}
            <div className="mb-5">
              <p className="text-sm text-gray-600 leading-relaxed">{deal.details}</p>
            </div>

            {/* Location */}
            <div className="bg-gray-50 rounded-2xl p-4 mb-5 border border-gray-100">
              <h3 className="font-bold text-sm mb-2 flex items-center gap-2">
                <MapPin size={15} className="text-orange-500" /> Ubicación
              </h3>
              <p className="text-sm text-gray-600 mb-3">{deal.address}</p>
              <div className="bg-gradient-to-br from-green-100 to-emerald-50 rounded-xl h-28 flex items-center justify-center text-sm border border-green-200/50 relative overflow-hidden">
                <div className="absolute inset-0 opacity-30">
                  <div className="absolute top-4 left-6 w-2 h-2 bg-green-400 rounded-full" />
                  <div className="absolute top-8 right-10 w-2 h-2 bg-green-500 rounded-full" />
                  <div className="absolute bottom-6 left-16 w-2 h-2 bg-green-400 rounded-full" />
                  <div className="absolute bottom-4 right-6 w-3 h-3 bg-green-500 rounded-full" />
                  <div className="absolute top-12 left-1/2 w-2 h-2 bg-green-400 rounded-full" />
                </div>
                <div className="text-center z-10">
                  <span className="text-2xl block mb-1">📍</span>
                  <span className="text-green-700 font-medium text-xs">{deal.address.split(',')[0]}</span>
                </div>
              </div>
            </div>

            {/* Terms */}
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
            {/* Rating Summary */}
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

            {/* Write Review */}
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
                  <button onClick={submitReview}
                    className="bg-orange-500 text-white px-4 rounded-xl hover:bg-orange-600 transition">
                    <Send size={16} />
                  </button>
                </div>
              </div>
            )}

            {/* Reviews List */}
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

        {/* Low stock warning */}
        {remaining <= 10 && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3 my-5 flex items-center gap-2 animate-fadeIn">
            <AlertTriangle size={18} className="text-amber-500 flex-shrink-0" />
            <p className="text-sm text-amber-700">¡Apurate! Solo quedan <strong>{remaining}</strong> cupones disponibles.</p>
          </div>
        )}
      </div>

      {/* Purchase Bar */}
      {!purchased ? (
        <div className="fixed bottom-16 left-0 right-0 glass border-t border-gray-200/60 p-4 z-40">
          <div className="max-w-lg mx-auto flex items-center gap-3">
            <div className="flex-1">
              <p className="text-2xl font-extrabold text-orange-600">{formatPrice(deal.discountPrice)}</p>
              <p className="text-xs text-gray-400 line-through">{formatPrice(deal.originalPrice)}</p>
            </div>
            <button onClick={handlePurchase}
              className="bg-gradient-to-r from-orange-500 to-amber-500 text-white px-8 py-3.5 rounded-2xl font-bold text-base shadow-lg hover:shadow-xl transition-all active:scale-95 animate-pulse-glow">
              Comprar Ahora
            </button>
          </div>
        </div>
      ) : (
        <div className="fixed bottom-16 left-0 right-0 bg-green-50 border-t border-green-200 p-4 z-40 animate-fadeIn">
          <div className="max-w-lg mx-auto text-center">
            <p className="text-green-700 font-bold flex items-center justify-center gap-2">
              <CheckCircle size={20} /> ¡Compra exitosa! 🎉
            </p>
            <button onClick={() => navigate('/my-coupons')} className="text-green-600 text-sm font-semibold underline mt-1">
              Ver mis cupones →
            </button>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {showPayment && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center animate-fadeIn" onClick={() => setShowPayment(false)}>
          <div className="bg-white w-full max-w-lg rounded-t-3xl sm:rounded-3xl p-6 animate-slideUp" onClick={e => e.stopPropagation()}>
            <div className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto mb-5" />
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">💳 Confirmar Compra</h2>

            <div className="bg-gray-50 rounded-2xl p-4 mb-4 border border-gray-100">
              <div className="flex gap-3">
                <img src={deal.image} alt="" className="w-16 h-16 rounded-xl object-cover" />
                <div className="flex-1">
                  <p className="font-semibold text-sm line-clamp-1">{deal.title}</p>
                  <p className="text-xs text-gray-500">{deal.businessName}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <StarRating rating={avgRating} size={10} />
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Precio original</span>
                <span className="line-through text-gray-400">{formatPrice(deal.originalPrice)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Descuento ({deal.discountPercent}%)</span>
                <span className="text-green-600 font-medium">-{formatPrice(savings)}</span>
              </div>
              <div className="border-t pt-2 flex justify-between font-bold">
                <span>Total a pagar</span>
                <span className="text-orange-600 text-lg">{formatPrice(deal.discountPrice)}</span>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 mb-4 flex items-center gap-2">
              <Shield size={16} className="text-blue-500" />
              <p className="text-xs text-blue-700">🔒 Pago simulado — En producción se integra MercadoPago UY / Banred</p>
            </div>

            <div className="border rounded-xl p-3 flex items-center gap-3 bg-white mb-4">
              <span className="text-xl">💳</span>
              <div className="flex-1">
                <p className="text-sm font-medium">Tarjeta **** 4242</p>
                <p className="text-xs text-gray-400">Visa — {currentUser?.name}</p>
              </div>
              <CheckCircle size={18} className="text-green-500" />
            </div>

            <button onClick={confirmPurchase} disabled={purchasing}
              className="w-full bg-gradient-to-r from-orange-500 to-amber-500 text-white py-4 rounded-2xl font-bold text-base shadow-lg hover:shadow-xl transition disabled:opacity-60 flex items-center justify-center gap-2">
              {purchasing ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Procesando...
                </>
              ) : (
                <>🔒 Pagar {formatPrice(deal.discountPrice)}</>
              )}
            </button>

            <button onClick={() => setShowPayment(false)} className="w-full text-center text-gray-500 text-sm mt-3 py-2 hover:text-gray-700">
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
