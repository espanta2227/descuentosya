import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Search, Ticket, User, Bell, LogOut, Menu, X, Heart, Shield, CheckCircle, AlertTriangle, Info, XCircle, MapPin as MapIcon, Scan, ListChecks, BarChart3 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useState } from 'react';
import { Toast } from '../types';
import { LogoIcon, LogoMenu } from './Logo';

const toastStyles: Record<Toast['type'], { bg: string; icon: typeof CheckCircle; border: string }> = {
  success: { bg: 'bg-green-50', icon: CheckCircle, border: 'border-green-300' },
  error: { bg: 'bg-red-50', icon: XCircle, border: 'border-red-300' },
  warning: { bg: 'bg-amber-50', icon: AlertTriangle, border: 'border-amber-300' },
  info: { bg: 'bg-blue-50', icon: Info, border: 'border-blue-300' },
};

const toastTextStyles: Record<Toast['type'], string> = {
  success: 'text-green-800', error: 'text-red-800', warning: 'text-amber-800', info: 'text-blue-800',
};

const toastIconStyles: Record<Toast['type'], string> = {
  success: 'text-green-500', error: 'text-red-500', warning: 'text-amber-500', info: 'text-blue-500',
};

export function ToastContainer() {
  const { toasts, removeToast } = useApp();
  if (toasts.length === 0) return null;
  return (
    <div className="fixed top-16 left-1/2 -translate-x-1/2 z-[100] w-full max-w-md px-4 space-y-2">
      {toasts.map((toast) => {
        const style = toastStyles[toast.type];
        const Icon = style.icon;
        return (
          <div key={toast.id} className={`${style.bg} border ${style.border} rounded-2xl px-4 py-3 shadow-lg animate-toastIn flex items-center gap-3`}>
            <Icon size={18} className={toastIconStyles[toast.type]} />
            <span className={`text-sm font-medium flex-1 ${toastTextStyles[toast.type]}`}>{toast.message}</span>
            <button onClick={() => removeToast(toast.id)} className="text-gray-400 hover:text-gray-600 p-1"><X size={14} /></button>
          </div>
        );
      })}
    </div>
  );
}

export function Header() {
  const { currentUser, logout, unreadNotifications, loginAs, platformStats } = useApp();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const isAdmin = currentUser?.role === 'admin';
  const isBusiness = currentUser?.role === 'business';

  const headerGradient = isAdmin
    ? 'bg-gradient-to-r from-violet-600 via-purple-600 to-violet-600'
    : isBusiness
    ? 'bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600'
    : 'bg-gradient-to-r from-orange-500 via-amber-500 to-orange-500';

  const headerSub = isAdmin ? 'Panel Administrador' : isBusiness ? 'Panel Comercio' : 'Cupones Uruguay 🇺🇾';
  const headerHome = isAdmin ? '/admin' : isBusiness ? '/business' : '/';

  return (
    <>
      <header className={`text-white sticky top-0 z-50 shadow-lg ${headerGradient}`}>
        <div className="px-4 py-3 flex items-center justify-between">
          <button onClick={() => navigate(headerHome)} className="flex items-center gap-2.5 group hover:opacity-90 transition-opacity">
            <div className="group-hover:scale-105 transition-transform">
              <LogoIcon size={38} />
            </div>
            <div className="flex flex-col items-start">
              <span 
                className="font-brand text-[19px] text-white tracking-wide leading-tight"
                style={{ fontFamily: "'Fredoka One', 'Poppins', system-ui, sans-serif" }}
              >
                Descuentos<span className="text-yellow-300">Ya</span>
              </span>
              <span className="text-[9px] text-white/70 font-medium tracking-[1.5px] uppercase">
                {headerSub}
              </span>
            </div>
          </button>
          <div className="flex items-center gap-1">
            {currentUser && (
              <button onClick={() => navigate(isAdmin ? '/notifications' : '/favorites')} className="relative p-2.5 hover:bg-white/20 rounded-full transition">
                {isAdmin ? <Bell size={20} /> : <Heart size={20} />}
              </button>
            )}
            {currentUser && !isAdmin && (
              <button onClick={() => navigate('/notifications')} className="relative p-2.5 hover:bg-white/20 rounded-full transition">
                <Bell size={20} />
                {unreadNotifications > 0 && (
                  <span className="absolute top-1 right-1 bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center animate-countPulse shadow-md">
                    {unreadNotifications}
                  </span>
                )}
              </button>
            )}
            <button onClick={() => setMenuOpen(!menuOpen)} className="p-2.5 hover:bg-white/20 rounded-full transition">
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </header>

      {menuOpen && (
        <>
          <div className="fixed inset-0 bg-black/30 z-40 animate-fadeIn" onClick={() => setMenuOpen(false)} />
          <div className="fixed right-0 top-0 h-full w-72 bg-white text-gray-800 shadow-2xl z-50 animate-fadeIn overflow-y-auto">
            <div className={`p-6 pt-8 ${isAdmin ? 'bg-gradient-to-br from-violet-600 to-purple-700' : 'bg-gradient-to-br from-orange-500 to-amber-500'}`}>
              <button onClick={() => setMenuOpen(false)} className="absolute top-4 right-4 p-1 text-white/80 hover:text-white"><X size={20} /></button>
              {currentUser ? (
                <div className="text-white">
                  <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center text-2xl font-bold mb-3 border-2 border-white/40">
                    {currentUser.name.charAt(0)}
                  </div>
                  <p className="font-bold text-lg">{currentUser.name}</p>
                  <p className="text-white/80 text-sm">{currentUser.email}</p>
                  <span className="inline-flex items-center gap-1 mt-2 text-xs bg-white/20 px-2.5 py-1 rounded-full">
                    {isAdmin ? <Shield size={12} /> : isBusiness ? <BarChart3 size={12} /> : <User size={12} />}
                    {isAdmin ? 'Administrador' : isBusiness ? 'Comercio' : 'Usuario'}
                  </span>
                </div>
              ) : (
                <div className="text-white">
                  <LogoMenu />
                </div>
              )}
            </div>

            <div className="p-3">
              {!currentUser ? (
                <div className="space-y-1">
                  <MenuButton icon={<User size={18} />} label="Iniciar Sesión" onClick={() => { navigate('/login'); setMenuOpen(false); }} />
                  <MenuButton icon={<User size={18} />} label="Crear Cuenta" onClick={() => { navigate('/register'); setMenuOpen(false); }} />
                  <div className="border-t my-3" />
                  <p className="text-xs text-gray-400 px-3 pb-2 font-semibold">🔧 Acceso rápido (demo):</p>
                  <MenuButton icon={<span>👤</span>} label="Entrar como Usuario" accent onClick={() => { loginAs('user'); navigate('/'); setMenuOpen(false); }} />
                  <MenuButton icon={<span>🏪</span>} label="Entrar como Comercio" accent onClick={() => { loginAs('business'); navigate('/business'); setMenuOpen(false); }} />
                  <MenuButton icon={<span>🛡️</span>} label="Entrar como Admin" accent onClick={() => { loginAs('admin'); navigate('/admin'); setMenuOpen(false); }} />
                </div>
              ) : isAdmin ? (
                <div className="space-y-1">
                  <MenuButton icon={<Shield size={18} />} label="Panel Admin" onClick={() => { navigate('/admin'); setMenuOpen(false); }} />
                  <MenuButton icon={<Bell size={18} />} label="Notificaciones" onClick={() => { navigate('/notifications'); setMenuOpen(false); }} />
                  <MenuButton icon={<Home size={18} />} label="Ver como Usuario" onClick={() => { navigate('/'); setMenuOpen(false); }} />
                  {platformStats.pendingDeals > 0 && (
                    <div className="bg-amber-50 rounded-xl p-3 mt-2">
                      <p className="text-xs text-amber-700 font-semibold">⚠️ {platformStats.pendingDeals} ofertas pendientes</p>
                    </div>
                  )}
                  <div className="border-t my-3" />
                  <button onClick={() => { logout(); navigate('/'); setMenuOpen(false); }}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 transition text-sm font-medium">
                    <LogOut size={18} /> Cerrar Sesión
                  </button>
                </div>
              ) : isBusiness ? (
                <div className="space-y-1">
                  <MenuButton icon={<BarChart3 size={18} />} label="Mi Panel" onClick={() => { navigate('/business'); setMenuOpen(false); }} />
                  <MenuButton icon={<Scan size={18} />} label="Escanear QR" onClick={() => { navigate('/business'); setMenuOpen(false); }} />
                  <MenuButton icon={<ListChecks size={18} />} label="Mis Cupones" onClick={() => { navigate('/business'); setMenuOpen(false); }} />
                  <MenuButton icon={<Home size={18} />} label="Ver App como Usuario" onClick={() => { navigate('/'); setMenuOpen(false); }} />
                  <div className="border-t my-3" />
                  <button onClick={() => { logout(); navigate('/'); setMenuOpen(false); }}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 transition text-sm font-medium">
                    <LogOut size={18} /> Cerrar Sesión
                  </button>
                </div>
              ) : (
                <div className="space-y-1">
                  <MenuButton icon={<Home size={18} />} label="Inicio" onClick={() => { navigate('/'); setMenuOpen(false); }} />
                  <MenuButton icon={<Search size={18} />} label="Explorar Ofertas" onClick={() => { navigate('/explore'); setMenuOpen(false); }} />
                  <MenuButton icon={<MapIcon size={18} />} label="Mapa de Cupones" onClick={() => { navigate('/map'); setMenuOpen(false); }} />
                  <MenuButton icon={<Heart size={18} />} label="Mis Favoritos" onClick={() => { navigate('/favorites'); setMenuOpen(false); }} />
                  <MenuButton icon={<Ticket size={18} />} label="Mis Cupones" onClick={() => { navigate('/my-coupons'); setMenuOpen(false); }} />
                  <div className="border-t my-3" />
                  <MenuButton icon={<User size={18} />} label="Mi Perfil" onClick={() => { navigate('/profile'); setMenuOpen(false); }} />
                  <button onClick={() => { logout(); navigate('/'); setMenuOpen(false); }}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 transition text-sm font-medium">
                    <LogOut size={18} /> Cerrar Sesión
                  </button>
                </div>
              )}
            </div>

            <div className="absolute bottom-0 left-0 right-0 p-4 border-t bg-gray-50">
              <p className="text-[11px] text-gray-400 text-center">
                <span className="font-brand" style={{ fontFamily: "'Fredoka One', sans-serif" }}>Descuentos<span className="text-orange-400">Ya</span></span>
                {' '}v3.0 · Hecho con ❤️ en 🇺🇾
              </p>
            </div>
          </div>
        </>
      )}
    </>
  );
}

function MenuButton({ icon, label, onClick, accent }: { icon: React.ReactNode; label: string; onClick: () => void; accent?: boolean }) {
  return (
    <button onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition text-sm font-medium
        ${accent ? 'bg-orange-50 text-orange-700 hover:bg-orange-100' : 'text-gray-700 hover:bg-gray-100'}`}>
      <span className="text-gray-500">{icon}</span>
      {label}
    </button>
  );
}

export function BottomNav() {
  const { currentUser, platformStats } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const isAdmin = currentUser?.role === 'admin';
  const isBusiness = currentUser?.role === 'business';

  const userTabs = [
    { path: '/', icon: Home, label: 'Inicio' },
    { path: '/explore', icon: Search, label: 'Explorar' },
    { path: '/map', icon: MapIcon, label: 'Mapa' },
    { path: '/my-coupons', icon: Ticket, label: 'Cupones' },
    { path: '/profile', icon: User, label: 'Perfil' },
  ];

  const adminTabs = [
    { path: '/admin', icon: Shield, label: 'Admin' },
    { path: '/', icon: Home, label: 'Ver App' },
    { path: '/notifications', icon: Bell, label: 'Alertas' },
    { path: '/profile', icon: User, label: 'Perfil' },
  ];

  const businessTabs = [
    { path: '/business', icon: BarChart3, label: 'Inicio' },
    { path: '/business#scan', icon: Scan, label: 'Escanear' },
    { path: '/business#coupons', icon: ListChecks, label: 'Cupones' },
    { path: '/', icon: Home, label: 'Ver App' },
  ];

  const guestTabs = [
    { path: '/', icon: Home, label: 'Inicio' },
    { path: '/explore', icon: Search, label: 'Explorar' },
    { path: '/map', icon: MapIcon, label: 'Mapa' },
    { path: '/login', icon: User, label: 'Entrar' },
  ];

  const tabs = !currentUser ? guestTabs : isAdmin ? adminTabs : isBusiness ? businessTabs : userTabs;

  return (
    <nav className="fixed bottom-0 left-0 right-0 glass border-t border-gray-200/60 z-50 safe-area-bottom">
      <div className="max-w-lg mx-auto flex">
        {tabs.map((tab) => {
          const isActive = location.pathname === tab.path || (tab.path !== '/' && location.pathname.startsWith(tab.path));
          const accentColor = isAdmin ? 'text-violet-500' : isBusiness ? 'text-emerald-500' : 'text-orange-500';
          const dotColor = isAdmin ? 'bg-violet-500' : isBusiness ? 'bg-emerald-500' : 'bg-orange-500';
          return (
            <button key={tab.path + tab.label} onClick={() => navigate(tab.path)}
              className={`flex-1 flex flex-col items-center py-2 pt-2.5 transition-all duration-200 relative
                ${isActive ? accentColor : 'text-gray-400 hover:text-gray-600'}`}>
              <div className={`relative ${isActive ? 'scale-110' : ''} transition-transform duration-200`}>
                <tab.icon size={20} strokeWidth={isActive ? 2.5 : 1.5} />
                {isActive && <div className={`absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 ${dotColor} rounded-full`} />}
              </div>
              <span className={`text-[10px] mt-1 ${isActive ? 'font-bold' : 'font-medium'}`}>{tab.label}</span>
              {tab.label === 'Admin' && platformStats.pendingDeals > 0 && (
                <span className="absolute top-1.5 right-1/2 translate-x-4 bg-red-500 text-white text-[9px] font-bold rounded-full min-w-[16px] h-[16px] flex items-center justify-center">
                  {platformStats.pendingDeals}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}

export function PageContainer({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={`max-w-lg mx-auto px-4 pb-24 ${className}`}>{children}</div>;
}

export function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-shimmer rounded-xl ${className}`} />;
}

export function EmptyState({ icon, title, description, action, actionLabel }: {
  icon: string; title: string; description: string; action?: () => void; actionLabel?: string;
}) {
  return (
    <div className="text-center py-16 animate-fadeIn">
      <p className="text-5xl mb-4 animate-float">{icon}</p>
      <p className="font-semibold text-gray-700 mb-1">{title}</p>
      <p className="text-gray-400 text-sm">{description}</p>
      {action && actionLabel && (
        <button onClick={action}
          className="mt-4 bg-gradient-to-r from-orange-500 to-amber-500 text-white px-6 py-2.5 rounded-xl font-medium text-sm shadow hover:shadow-lg transition">
          {actionLabel}
        </button>
      )}
    </div>
  );
}

export function StarRating({ rating, size = 14, showValue = true }: { rating: number; size?: number; showValue?: boolean }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map(star => (
        <svg key={star} width={size} height={size} viewBox="0 0 24 24"
          fill={star <= Math.round(rating) ? '#f59e0b' : 'none'}
          stroke={star <= Math.round(rating) ? '#f59e0b' : '#d1d5db'} strokeWidth="2">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ))}
      {showValue && <span className="text-xs text-gray-500 font-medium ml-0.5">{rating.toFixed(1)}</span>}
    </div>
  );
}
