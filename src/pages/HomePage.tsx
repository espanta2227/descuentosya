import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, Flame, Zap, Sparkles, ArrowRight, TrendingUp, Gift } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { PageContainer } from '../components/Layout';
import DealCard from '../components/DealCard';
import { categories } from '../data/mockData';
import { LogoIcon } from '../components/Logo';
import { HeroBanner, AdBanner } from '../components/Banner';

function AnimatedCounter({ target, duration = 1500 }: { target: number; duration?: number }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration]);
  return <>{count}</>;
}

export default function HomePage() {
  const { getVisibleDeals, currentUser, loginAs, setSearchQuery, setSelectedCategory, showOnboarding, dismissOnboarding, totalSaved } = useApp();
  const navigate = useNavigate();
  const [localSearch, setLocalSearch] = useState('');

  const activeDeals = getVisibleDeals();
  const hotDeals = [...activeDeals].sort((a, b) => b.claimedQuantity - a.claimedQuantity).slice(0, 4);
  const newDeals = [...activeDeals].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 4);
  const featuredDeals = activeDeals.filter(d => d.featured);
  const bigDiscounts = [...activeDeals].sort((a, b) => b.discountPercent - a.discountPercent).slice(0, 4);

  const handleSearch = () => {
    setSearchQuery(localSearch);
    navigate('/explore');
  };

  return (
    <PageContainer className="pt-4">
      {/* Onboarding Banner */}
      {showOnboarding && !currentUser && (
        <div className="bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-600 rounded-3xl p-5 mb-5 text-white relative overflow-hidden animate-fadeInUp">
          <div className="absolute -right-6 -top-6 w-28 h-28 bg-white/10 rounded-full" />
          <div className="absolute right-10 -bottom-8 w-20 h-20 bg-white/10 rounded-full" />
          <button onClick={dismissOnboarding} className="absolute top-3 right-3 text-white/60 hover:text-white text-lg">✕</button>
          <div className="flex items-start gap-3">
            <span className="text-4xl animate-bounce-subtle">🎟️</span>
            <div>
              <h2 className="font-extrabold text-lg mb-1">¡Descuentos increíbles cerca tuyo!</h2>
              <p className="text-white/80 text-sm mb-3">Encontrá las mejores ofertas de comercios locales. Canjeá tu cupón y pagá menos.</p>
              <button onClick={() => navigate('/register')}
                className="bg-white text-purple-700 px-5 py-2 rounded-xl text-sm font-bold hover:bg-white/90 transition flex items-center gap-1.5">
                Crear Cuenta Gratis <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =============================== */}
      {/* HERO BANNER                      */}
      {/* Poné tu imagen en public/banner.jpg */}
      {/* =============================== */}
      <HeroBanner
        currentUser={currentUser}
        totalSaved={totalSaved}
        localSearch={localSearch}
        setLocalSearch={setLocalSearch}
        onSearch={handleSearch}
      />

      {/* Quick login (solo demo) */}
      {!currentUser && (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-4 mb-5 animate-fadeInUp" style={{ animationDelay: '100ms' }}>
          <p className="text-sm text-green-800 font-semibold mb-3 flex items-center gap-2">
            <Sparkles size={16} className="text-green-600" /> Probá la app al instante
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => { loginAs('user'); navigate('/'); }}
              className="flex-1 bg-white border border-green-300 text-green-700 px-3 py-2.5 rounded-xl text-sm font-medium hover:bg-green-50 transition active:scale-95 shadow-sm">
              👤 Probar como Usuario
            </button>
            <button
              onClick={() => { loginAs('admin'); navigate('/admin'); }}
              className="flex-1 bg-white border border-violet-300 text-violet-700 px-3 py-2.5 rounded-xl text-sm font-medium hover:bg-violet-50 transition active:scale-95 shadow-sm">
              🛡️ Admin
            </button>
          </div>
        </div>
      )}

      {/* Categories */}
      <section className="mb-6 animate-fadeInUp" style={{ animationDelay: '150ms' }}>
        <h2 className="font-bold text-lg mb-3 flex items-center gap-2">
          <Gift size={18} className="text-orange-500" /> Categorías
        </h2>
        <div className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-hide -mx-1 px-1">
          {categories.map(cat => (
            <button key={cat.name}
              onClick={() => { setSelectedCategory(cat.name); navigate('/explore'); }}
              className="flex-shrink-0 flex flex-col items-center gap-1.5 w-[72px] group">
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${cat.color} flex items-center justify-center shadow-md group-hover:shadow-lg group-hover:scale-105 transition-all duration-200 group-active:scale-95`}>
                <span className="text-2xl">{cat.icon}</span>
              </div>
              <span className="text-[11px] font-medium text-gray-600 whitespace-nowrap">{cat.name}</span>
            </button>
          ))}
        </div>
      </section>

      {/* =============================== */}
      {/* BANNER PUBLICITARIO #1           */}
      {/* Poné tu imagen en public/banner-ad.jpg */}
      {/* =============================== */}
      <AdBanner 
        linkTo="/explore"
        className="mb-6"
      />

      {/* Featured Flash Deal */}
      {featuredDeals[0] && (
        <section className="mb-6 animate-fadeInUp" style={{ animationDelay: '200ms' }}>
          <div className="flex justify-between items-center mb-3">
            <h2 className="font-bold text-lg flex items-center gap-2">
              <Zap size={18} className="text-amber-500" /> Flash Deal
            </h2>
            <span className="text-xs bg-red-100 text-red-600 px-2.5 py-1 rounded-full font-semibold animate-pulse">
              ⏰ Tiempo Limitado
            </span>
          </div>
          <DealCard deal={featuredDeals[0]} index={0} />
        </section>
      )}

      {/* Hot Deals */}
      <section className="mb-6">
        <div className="flex justify-between items-center mb-3">
          <h2 className="font-bold text-lg flex items-center gap-2">
            <Flame size={18} className="text-red-500" /> Más Populares
          </h2>
          <button onClick={() => navigate('/explore')} className="text-orange-500 text-sm font-medium flex items-center gap-1 hover:underline">
            Ver todo <ChevronRight size={16} />
          </button>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {hotDeals.map((deal, i) => <DealCard key={deal.id} deal={deal} compact index={i} />)}
        </div>
      </section>

      {/* Banner publicitario #2 (rota automáticamente) */}
      <AdBanner 
        linkTo="/explore"
        className="mb-6"
      />

      {/* Big Discounts Carousel */}
      <section className="mb-6">
        <div className="flex justify-between items-center mb-3">
          <h2 className="font-bold text-lg flex items-center gap-2">
            <TrendingUp size={18} className="text-green-500" /> Mayores Descuentos
          </h2>
          <button onClick={() => navigate('/explore')} className="text-orange-500 text-sm font-medium flex items-center gap-1">
            Ver todo <ChevronRight size={16} />
          </button>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide -mx-1 px-1">
          {bigDiscounts.map((deal, i) => (
            <div key={deal.id} className="flex-shrink-0 w-[260px]">
              <DealCard deal={deal} compact index={i} />
            </div>
          ))}
        </div>
      </section>

      {/* New Deals */}
      <section className="mb-6">
        <div className="flex justify-between items-center mb-3">
          <h2 className="font-bold text-lg flex items-center gap-2">
            <Sparkles size={18} className="text-purple-500" /> Recién Llegados
          </h2>
          <button onClick={() => navigate('/explore')} className="text-orange-500 text-sm font-medium flex items-center gap-1">
            Ver todo <ChevronRight size={16} />
          </button>
        </div>
        <div className="space-y-3">
          {newDeals.slice(0, 3).map((deal, i) => <DealCard key={deal.id} deal={deal} index={i} />)}
        </div>
      </section>

      {/* Stats banner */}
      <section className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-2xl p-6 text-white mb-6 relative overflow-hidden animate-fadeInUp">
        <div className="absolute -right-8 -top-8 w-32 h-32 bg-orange-500/10 rounded-full" />
        <div className="absolute -left-4 -bottom-4 w-20 h-20 bg-amber-500/10 rounded-full" />
        <h3 className="font-bold text-sm text-gray-400 mb-4 uppercase tracking-wider">
          📊 <span style={{ fontFamily: "'Fredoka One', sans-serif" }}>Descuentos<span className="text-orange-400">Ya</span></span> en números
        </h3>
        <div className="grid grid-cols-3 gap-4 text-center relative">
          <div>
            <p className="text-3xl font-extrabold text-gradient"><AnimatedCounter target={activeDeals.length} />+</p>
            <p className="text-xs text-gray-400 mt-1">Ofertas Activas</p>
          </div>
          <div>
            <p className="text-3xl font-extrabold text-green-400"><AnimatedCounter target={5} /></p>
            <p className="text-xs text-gray-400 mt-1">Comercios</p>
          </div>
          <div>
            <p className="text-3xl font-extrabold text-amber-400"><AnimatedCounter target={60} />%</p>
            <p className="text-xs text-gray-400 mt-1">Max Descuento</p>
          </div>
        </div>
      </section>

      {/* CTA */}
      {!currentUser && (
        <section className="bg-gradient-to-r from-orange-500 to-amber-500 rounded-2xl p-5 text-white text-center mb-6 animate-fadeInUp">
          <div className="flex justify-center mb-3">
            <LogoIcon size={48} />
          </div>
          <h3 
            className="text-xl mb-1"
            style={{ fontFamily: "'Fredoka One', sans-serif" }}
          >
            Descuentos<span className="text-yellow-200">Ya</span>
          </h3>
          <p className="text-white/80 text-sm mb-4">Registrate, obtené tu cupón con QR y pagá menos en los mejores comercios de Uruguay</p>
          <button onClick={() => navigate('/register')}
            className="bg-white text-orange-600 px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-white/90 transition shadow-lg">
            Crear Cuenta Gratis
          </button>
        </section>
      )}
    </PageContainer>
  );
}
