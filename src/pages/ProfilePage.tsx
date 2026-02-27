import { useNavigate } from 'react-router-dom';
import { Mail, Phone, Calendar, Shield, LogOut, ChevronRight, Ticket, Bell, HelpCircle, Settings, Heart, Award, TrendingUp } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { PageContainer, EmptyState } from '../components/Layout';
import { formatPrice } from '../components/DealCard';

export default function ProfilePage() {
  const { currentUser, logout, coupons, favorites, totalSaved } = useApp();
  const navigate = useNavigate();

  if (!currentUser) {
    return (
      <PageContainer className="pt-4">
        <EmptyState icon="👤" title="Iniciá sesión para ver tu perfil"
          description="Accedé a tus datos, cupones y configuración"
          action={() => navigate('/login')} actionLabel="Iniciar Sesión" />
      </PageContainer>
    );
  }

  const myCoupons = coupons.filter(c => c.userId === currentUser.id);
  const activeCoupons = myCoupons.filter(c => c.status === 'active').length;
  const isAdmin = currentUser.role === 'admin';

  // Level calculation
  const level = myCoupons.length >= 10 ? 'Gold' : myCoupons.length >= 5 ? 'Silver' : 'Bronze';
  const levelEmoji = level === 'Gold' ? '🥇' : level === 'Silver' ? '🥈' : '🥉';
  const nextLevel = level === 'Bronze' ? 5 : level === 'Silver' ? 10 : 999;
  const progress = Math.min((myCoupons.length / nextLevel) * 100, 100);

  return (
    <PageContainer className="pt-4">
      {/* Avatar & Info */}
      <div className="text-center mb-6 animate-fadeIn">
        <div className="relative inline-block">
          <div className={`w-24 h-24 rounded-full flex items-center justify-center text-white text-4xl font-bold mx-auto shadow-lg border-4 border-white ${
            isAdmin ? 'bg-gradient-to-br from-violet-500 to-purple-600' : 'bg-gradient-to-br from-orange-400 to-amber-500'
          }`}>
            {currentUser.name.charAt(0).toUpperCase()}
          </div>
          <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-1 shadow-md">
            <div className="bg-green-500 w-5 h-5 rounded-full flex items-center justify-center">
              <Shield size={10} className="text-white" />
            </div>
          </div>
        </div>
        <h1 className="text-xl font-extrabold mt-3">{currentUser.name}</h1>
        <p className="text-gray-500 text-sm">{currentUser.email}</p>
        <div className="flex items-center justify-center gap-2 mt-2">
          <span className={`text-xs px-3 py-1 rounded-full font-medium ${
            isAdmin ? 'bg-violet-100 text-violet-700' : 'bg-orange-100 text-orange-700'
          }`}>
            {isAdmin ? '🛡️ Administrador' : '👤 Usuario'}
          </span>
          {!isAdmin && (
            <span className="text-xs bg-amber-100 text-amber-700 px-3 py-1 rounded-full font-medium">
              {levelEmoji} {level}
            </span>
          )}
        </div>
      </div>

      {/* Level Progress */}
      {!isAdmin && level !== 'Gold' && (
        <div className="bg-gradient-to-r from-amber-50 to-yellow-50 rounded-2xl p-4 mb-5 border border-amber-100 animate-fadeInUp">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Award size={16} className="text-amber-600" />
              <span className="text-sm font-semibold text-amber-800">Nivel {level}</span>
            </div>
            <span className="text-xs text-amber-600">{myCoupons.length}/{nextLevel} canjes</span>
          </div>
          <div className="w-full bg-amber-200/50 rounded-full h-2">
            <div className="bg-gradient-to-r from-amber-400 to-yellow-400 h-2 rounded-full transition-all duration-1000"
              style={{ width: `${progress}%` }} />
          </div>
          <p className="text-xs text-amber-600 mt-1.5">
            {nextLevel - myCoupons.length} canjes más para subir a {level === 'Bronze' ? 'Silver 🥈' : 'Gold 🥇'}
          </p>
        </div>
      )}

      {/* Stats */}
      {!isAdmin && (
        <div className="grid grid-cols-3 gap-2 mb-5">
          <div className="bg-orange-50 rounded-xl p-3 text-center border border-orange-100 animate-fadeInUp">
            <p className="text-lg font-extrabold text-orange-600">{myCoupons.length}</p>
            <p className="text-[10px] text-gray-500 mt-0.5">Canjeados</p>
          </div>
          <div className="bg-green-50 rounded-xl p-3 text-center border border-green-100 animate-fadeInUp">
            <p className="text-lg font-extrabold text-green-600">{activeCoupons}</p>
            <p className="text-[10px] text-gray-500 mt-0.5">Activos</p>
          </div>
          <div className="bg-blue-50 rounded-xl p-3 text-center border border-blue-100 animate-fadeInUp">
            <p className="text-lg font-extrabold text-blue-600">{favorites.length}</p>
            <p className="text-[10px] text-gray-500 mt-0.5">Favoritos</p>
          </div>
        </div>
      )}

      {/* Savings Card */}
      {!isAdmin && totalSaved > 0 && (
        <div className="bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl p-5 mb-5 text-white relative overflow-hidden animate-fadeInUp">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-white/10 rounded-full" />
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp size={18} />
            <span className="text-sm font-semibold text-green-100">Total Ahorrado</span>
          </div>
          <p className="text-3xl font-extrabold">{formatPrice(totalSaved)}</p>
          <p className="text-xs text-green-200 mt-1">Desde que te uniste a DescuentosYa 🎉</p>
        </div>
      )}

      {/* Info Cards */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm mb-4 overflow-hidden">
        <InfoRow icon={<Mail size={17} className="text-gray-400" />} label="Email" value={currentUser.email} />
        <InfoRow icon={<Phone size={17} className="text-gray-400" />} label="Teléfono" value={currentUser.phone || 'No configurado'} />
        <InfoRow icon={<Calendar size={17} className="text-gray-400" />} label="Miembro desde"
          value={new Date(currentUser.createdAt).toLocaleDateString('es-UY', { month: 'long', year: 'numeric' })} />
        <InfoRow icon={<Shield size={17} className="text-green-500" />} label="Estado" value="Cuenta verificada ✓" last />
      </div>

      {/* Menu */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm mb-4 overflow-hidden">
        {!isAdmin && (
          <>
            <MenuRow icon={<Ticket size={17} className="text-orange-500" />} label="Mis Cupones" badge={myCoupons.length.toString()} onClick={() => navigate('/my-coupons')} />
            <MenuRow icon={<Heart size={17} className="text-red-500" />} label="Mis Favoritos" badge={favorites.length.toString()} onClick={() => navigate('/favorites')} />
          </>
        )}
        {isAdmin && (
          <MenuRow icon={<Shield size={17} className="text-violet-500" />} label="Panel Admin" onClick={() => navigate('/admin')} />
        )}
        <MenuRow icon={<Bell size={17} className="text-blue-500" />} label="Notificaciones" onClick={() => navigate('/notifications')} />
        <MenuRow icon={<Settings size={17} className="text-gray-500" />} label="Configuración" onClick={() => {}} />
        <MenuRow icon={<HelpCircle size={17} className="text-purple-500" />} label="Ayuda y Soporte" onClick={() => {}} last />
      </div>

      {/* Logout */}
      <button onClick={() => { logout(); navigate('/'); }}
        className="w-full bg-red-50 border border-red-200 text-red-600 py-3.5 rounded-2xl font-medium text-sm flex items-center justify-center gap-2 hover:bg-red-100 transition mb-4 active:scale-[0.99]">
        <LogOut size={17} /> Cerrar Sesión
      </button>

      <p className="text-center text-[11px] text-gray-400 mb-4">DescuentosYa v3.0 · Hecho con ❤️ en Uruguay 🇺🇾</p>
    </PageContainer>
  );
}

function InfoRow({ icon, label, value, last = false }: { icon: React.ReactNode; label: string; value: string; last?: boolean }) {
  return (
    <div className={`flex items-center gap-3 px-4 py-3.5 ${!last ? 'border-b border-gray-50' : ''}`}>
      {icon}
      <div className="flex-1">
        <p className="text-[11px] text-gray-400">{label}</p>
        <p className="text-sm font-medium">{value}</p>
      </div>
    </div>
  );
}

function MenuRow({ icon, label, onClick, badge, last = false }: { icon: React.ReactNode; label: string; onClick: () => void; badge?: string; last?: boolean }) {
  return (
    <button onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3.5 hover:bg-gray-50 transition ${!last ? 'border-b border-gray-50' : ''}`}>
      {icon}
      <span className="text-sm font-medium flex-1 text-left">{label}</span>
      {badge && <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-lg font-medium">{badge}</span>}
      <ChevronRight size={15} className="text-gray-300" />
    </button>
  );
}
