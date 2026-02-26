import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Shield, BarChart3, Package, Store, Users, TrendingUp, DollarSign,
  CheckCircle, XCircle, Clock, Eye, Star, ChevronRight, AlertTriangle,
  ArrowUpRight, Search, Filter
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { PageContainer, EmptyState } from '../components/Layout';
import { formatPrice } from '../components/DealCard';
import { Deal, Business } from '../types';

type AdminTab = 'overview' | 'pending' | 'deals' | 'businesses' | 'users';

export default function AdminDashboard() {
  const {
    currentUser, deals, coupons, businesses, platformStats,
    getPendingDeals, getPendingBusinesses,
    approveDeal, rejectDeal, approveBusiness, rejectBusiness,
    toggleFeatured, deleteDeal, togglePauseDeal
  } = useApp();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [rejectModal, setRejectModal] = useState<{ type: 'deal' | 'business'; id: string } | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [searchFilter, setSearchFilter] = useState('');

  if (!currentUser || currentUser.role !== 'admin') {
    return (
      <PageContainer className="pt-4">
        <EmptyState icon="🔐" title="Acceso restringido"
          description="Panel exclusivo para administradores"
          action={() => navigate('/login')} actionLabel="Iniciar Sesión" />
      </PageContainer>
    );
  }

  const pendingDeals = getPendingDeals();
  const pendingBiz = getPendingBusinesses();
  const totalPending = pendingDeals.length + pendingBiz.length;

  const tabs: { key: AdminTab; label: string; icon: typeof Shield; badge?: number }[] = [
    { key: 'overview', label: 'General', icon: BarChart3 },
    { key: 'pending', label: 'Pendientes', icon: Clock, badge: totalPending },
    { key: 'deals', label: 'Ofertas', icon: Package },
    { key: 'businesses', label: 'Comercios', icon: Store },
    { key: 'users', label: 'Usuarios', icon: Users },
  ];

  const handleReject = () => {
    if (!rejectModal || !rejectReason.trim()) return;
    if (rejectModal.type === 'deal') {
      rejectDeal(rejectModal.id, rejectReason);
    } else {
      rejectBusiness(rejectModal.id, rejectReason);
    }
    setRejectModal(null);
    setRejectReason('');
  };

  return (
    <PageContainer className="pt-4">
      {/* Header */}
      <div className="flex items-center gap-3 mb-5 animate-fadeIn">
        <div className="bg-gradient-to-br from-violet-500 to-purple-600 p-2.5 rounded-xl shadow-lg">
          <Shield size={22} className="text-white" />
        </div>
        <div>
          <h1 className="text-xl font-extrabold">Panel de Administración</h1>
          <p className="text-xs text-gray-400">Gestioná toda la plataforma desde acá</p>
        </div>
      </div>

      {/* Urgent alerts */}
      {totalPending > 0 && activeTab !== 'pending' && (
        <button onClick={() => setActiveTab('pending')}
          className="w-full bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-4 flex items-center gap-3 animate-fadeIn hover:bg-amber-100 transition">
          <div className="bg-amber-100 p-2 rounded-xl">
            <AlertTriangle size={20} className="text-amber-600" />
          </div>
          <div className="flex-1 text-left">
            <p className="font-semibold text-amber-800 text-sm">
              {totalPending} {totalPending === 1 ? 'elemento pendiente' : 'elementos pendientes'} de aprobación
            </p>
            <p className="text-xs text-amber-600">{pendingDeals.length} ofertas · {pendingBiz.length} comercios</p>
          </div>
          <ChevronRight size={18} className="text-amber-400" />
        </button>
      )}

      {/* Tabs */}
      <div className="flex gap-1 mb-5 overflow-x-auto scrollbar-hide -mx-1 px-1">
        {tabs.map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all
              ${activeTab === tab.key
                ? 'bg-violet-600 text-white shadow-md'
                : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
            <tab.icon size={14} />
            {tab.label}
            {tab.badge ? (
              <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold ml-0.5">
                {tab.badge}
              </span>
            ) : null}
          </button>
        ))}
      </div>

      {/* === OVERVIEW === */}
      {activeTab === 'overview' && (
        <div className="space-y-4 animate-fadeIn">
          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-3">
            <StatBox icon={<Users size={18} className="text-blue-500" />} label="Usuarios" value={platformStats.totalUsers.toString()} bg="bg-blue-50" change="+15%" />
            <StatBox icon={<Store size={18} className="text-purple-500" />} label="Comercios" value={platformStats.totalBusinesses.toString()} bg="bg-purple-50" change="+8%" />
            <StatBox icon={<Package size={18} className="text-orange-500" />} label="Ofertas Activas" value={platformStats.totalDeals.toString()} bg="bg-orange-50" />
            <StatBox icon={<DollarSign size={18} className="text-green-500" />} label="Ingresos" value={formatPrice(platformStats.totalRevenue)} bg="bg-green-50" change="+22%" />
          </div>

          {/* Revenue card */}
          <div className="bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 rounded-2xl p-5 text-white relative overflow-hidden">
            <div className="absolute -right-6 -top-6 w-20 h-20 bg-white/5 rounded-full" />
            <div className="absolute -right-2 -bottom-2 w-16 h-16 bg-white/5 rounded-full" />
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp size={18} />
              <h3 className="font-semibold text-sm">Resumen de Plataforma</h3>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <p className="text-[11px] text-white/60">Ventas totales</p>
                <p className="text-lg font-extrabold">{formatPrice(platformStats.totalRevenue)}</p>
              </div>
              <div>
                <p className="text-[11px] text-white/60">Comisión (10%)</p>
                <p className="text-lg font-extrabold text-amber-300">{formatPrice(platformStats.totalRevenue * 0.1)}</p>
              </div>
              <div>
                <p className="text-[11px] text-white/60">Cupones</p>
                <p className="text-lg font-extrabold">{platformStats.totalCoupons}</p>
              </div>
            </div>
          </div>

          {/* Recent activity */}
          <div>
            <h3 className="font-bold text-sm mb-3 flex items-center gap-2">
              <Clock size={14} className="text-gray-400" /> Actividad Reciente
            </h3>
            <div className="space-y-2">
              {coupons.slice(0, 5).map(c => (
                <div key={c.id} className="bg-white rounded-xl border border-gray-100 p-3 flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs
                    ${c.status === 'active' ? 'bg-green-100' : c.status === 'used' ? 'bg-gray-100' : 'bg-red-100'}`}>
                    {c.status === 'active' ? '✅' : c.status === 'used' ? '☑️' : '⏰'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium line-clamp-1">{c.deal.title}</p>
                    <p className="text-[10px] text-gray-400">{c.deal.businessName}</p>
                  </div>
                  <span className="text-xs font-bold text-green-600">{formatPrice(c.deal.discountPrice)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* === PENDING === */}
      {activeTab === 'pending' && (
        <div className="space-y-4 animate-fadeIn">
          {/* Pending deals */}
          <div>
            <h3 className="font-bold text-sm mb-3 flex items-center gap-2">
              <Package size={14} className="text-orange-500" /> Ofertas Pendientes
              <span className="bg-orange-100 text-orange-600 text-[10px] px-2 py-0.5 rounded-full font-bold">
                {pendingDeals.length}
              </span>
            </h3>
            {pendingDeals.length === 0 ? (
              <div className="bg-green-50 rounded-xl p-6 text-center">
                <CheckCircle size={32} className="mx-auto text-green-400 mb-2" />
                <p className="text-sm font-medium text-green-700">¡Todo al día! No hay ofertas pendientes.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {pendingDeals.map(deal => (
                  <PendingDealCard
                    key={deal.id}
                    deal={deal}
                    onApprove={() => approveDeal(deal.id)}
                    onReject={() => setRejectModal({ type: 'deal', id: deal.id })}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Pending businesses */}
          <div>
            <h3 className="font-bold text-sm mb-3 flex items-center gap-2">
              <Store size={14} className="text-purple-500" /> Comercios Pendientes
              <span className="bg-purple-100 text-purple-600 text-[10px] px-2 py-0.5 rounded-full font-bold">
                {pendingBiz.length}
              </span>
            </h3>
            {pendingBiz.length === 0 ? (
              <div className="bg-green-50 rounded-xl p-6 text-center">
                <CheckCircle size={32} className="mx-auto text-green-400 mb-2" />
                <p className="text-sm font-medium text-green-700">No hay comercios pendientes de aprobación.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {pendingBiz.map(biz => (
                  <PendingBizCard
                    key={biz.id}
                    business={biz}
                    onApprove={() => approveBusiness(biz.id)}
                    onReject={() => setRejectModal({ type: 'business', id: biz.id })}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* === ALL DEALS === */}
      {activeTab === 'deals' && (
        <div className="space-y-3 animate-fadeIn">
          <div className="flex gap-2 mb-2">
            <div className="flex-1 relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type="text" value={searchFilter} onChange={e => setSearchFilter(e.target.value)}
                placeholder="Buscar oferta..."
                className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-violet-300 focus:outline-none" />
            </div>
            <button className="bg-gray-100 p-2.5 rounded-xl">
              <Filter size={16} className="text-gray-500" />
            </button>
          </div>

          <div className="flex gap-2 text-[11px] font-semibold mb-2">
            <span className="bg-green-100 text-green-700 px-2.5 py-1 rounded-full">
              ✅ {deals.filter(d => d.approvalStatus === 'approved').length} aprobadas
            </span>
            <span className="bg-amber-100 text-amber-700 px-2.5 py-1 rounded-full">
              ⏳ {deals.filter(d => d.approvalStatus === 'pending').length} pendientes
            </span>
            <span className="bg-red-100 text-red-700 px-2.5 py-1 rounded-full">
              ❌ {deals.filter(d => d.approvalStatus === 'rejected').length} rechazadas
            </span>
          </div>

          {deals
            .filter(d => !searchFilter || d.title.toLowerCase().includes(searchFilter.toLowerCase()) || d.businessName.toLowerCase().includes(searchFilter.toLowerCase()))
            .map(deal => (
              <AdminDealRow
                key={deal.id}
                deal={deal}
                onToggleFeatured={() => toggleFeatured(deal.id)}
                onTogglePause={() => togglePauseDeal(deal.id)}
                onDelete={() => deleteDeal(deal.id)}
                onApprove={() => approveDeal(deal.id)}
                onView={() => navigate(`/deal/${deal.id}`)}
              />
            ))}
        </div>
      )}

      {/* === BUSINESSES === */}
      {activeTab === 'businesses' && (
        <div className="space-y-3 animate-fadeIn">
          <div className="flex gap-2 text-[11px] font-semibold mb-2">
            <span className="bg-green-100 text-green-700 px-2.5 py-1 rounded-full">
              ✅ {businesses.filter(b => b.approvalStatus === 'approved').length} aprobados
            </span>
            <span className="bg-amber-100 text-amber-700 px-2.5 py-1 rounded-full">
              ⏳ {businesses.filter(b => b.approvalStatus === 'pending').length} pendientes
            </span>
          </div>

          {businesses.map(biz => (
            <div key={biz.id} className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-violet-100 rounded-xl flex items-center justify-center text-lg font-bold text-purple-600">
                  {biz.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-sm">{biz.name}</h3>
                    {biz.verified && <CheckCircle size={14} className="text-blue-500" />}
                  </div>
                  <p className="text-[11px] text-gray-400 line-clamp-1">{biz.address}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] bg-gray-100 px-2 py-0.5 rounded-full">{biz.category}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold
                      ${biz.subscriptionType === 'premium' ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-500'}`}>
                      {biz.subscriptionType === 'premium' ? '⭐ Premium' : 'Free'}
                    </span>
                    <StatusBadge status={biz.approvalStatus} />
                  </div>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-gray-50 flex items-center justify-between text-[11px] text-gray-400">
                <span>⭐ {biz.rating} · {biz.reviewCount} reseñas</span>
                <span>{biz.phone}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* === USERS === */}
      {activeTab === 'users' && (
        <div className="space-y-3 animate-fadeIn">
          <div className="grid grid-cols-3 gap-3 mb-3">
            <div className="bg-blue-50 rounded-xl p-3 text-center">
              <p className="text-lg font-extrabold text-blue-600">{platformStats.totalUsers}</p>
              <p className="text-[10px] text-blue-500">Usuarios</p>
            </div>
            <div className="bg-purple-50 rounded-xl p-3 text-center">
              <p className="text-lg font-extrabold text-purple-600">{platformStats.totalBusinesses}</p>
              <p className="text-[10px] text-purple-500">Comercios</p>
            </div>
            <div className="bg-green-50 rounded-xl p-3 text-center">
              <p className="text-lg font-extrabold text-green-600">{platformStats.totalCoupons}</p>
              <p className="text-[10px] text-green-500">Compras</p>
            </div>
          </div>

          {[
            ...([{ id: 'u1', name: 'Valentina Rodríguez', email: 'vale@email.com', role: 'user', since: 'Ene 2024', purchases: 3 },
            { id: 'u2', name: 'Santiago Fernández', email: 'santi@email.com', role: 'user', since: 'Feb 2024', purchases: 2 },
            { id: 'u3', name: 'Camila Martínez', email: 'cami@email.com', role: 'user', since: 'Mar 2024', purchases: 1 },
            { id: 'b1', name: 'Admin La Perdiz', email: 'laperdiz@email.com', role: 'business', since: 'Ene 2024', purchases: 0 },
            { id: 'b2', name: 'Admin Spa del Lago', email: 'spadellago@email.com', role: 'business', since: 'Ene 2024', purchases: 0 }])
          ].map(user => (
            <div key={user.id} className="bg-white rounded-xl border border-gray-100 p-3 flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold
                ${user.role === 'business' ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'}`}>
                {user.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">{user.name}</p>
                <p className="text-[11px] text-gray-400">{user.email}</p>
              </div>
              <div className="text-right">
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold
                  ${user.role === 'business' ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'}`}>
                  {user.role === 'business' ? '🏪 Comercio' : '👤 Usuario'}
                </span>
                <p className="text-[10px] text-gray-400 mt-1">Desde {user.since}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Reject Modal */}
      {rejectModal && (
        <>
          <div className="fixed inset-0 bg-black/40 z-50 animate-fadeIn" onClick={() => setRejectModal(null)} />
          <div className="fixed inset-x-4 top-1/2 -translate-y-1/2 max-w-md mx-auto bg-white rounded-2xl shadow-2xl z-50 p-6 animate-scaleIn">
            <h3 className="font-bold text-lg mb-1 flex items-center gap-2">
              <XCircle size={20} className="text-red-500" />
              Rechazar {rejectModal.type === 'deal' ? 'Oferta' : 'Comercio'}
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              Indicá el motivo del rechazo. Se le notificará al {rejectModal.type === 'deal' ? 'comercio' : 'solicitante'}.
            </p>
            <textarea
              value={rejectReason}
              onChange={e => setRejectReason(e.target.value)}
              placeholder="Ej: Las imágenes no cumplen con los estándares..."
              rows={3}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm resize-none focus:ring-2 focus:ring-red-300 focus:outline-none mb-4"
            />
            <div className="flex gap-3">
              <button onClick={() => { setRejectModal(null); setRejectReason(''); }}
                className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl font-medium text-sm hover:bg-gray-200 transition">
                Cancelar
              </button>
              <button onClick={handleReject}
                disabled={!rejectReason.trim()}
                className="flex-1 bg-red-500 text-white py-3 rounded-xl font-bold text-sm hover:bg-red-600 transition disabled:opacity-50">
                ❌ Rechazar
              </button>
            </div>
          </div>
        </>
      )}
    </PageContainer>
  );
}

// === Sub-components ===

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    approved: 'bg-green-100 text-green-700',
    pending: 'bg-amber-100 text-amber-700',
    rejected: 'bg-red-100 text-red-700',
  };
  const labels: Record<string, string> = {
    approved: '✅ Aprobado',
    pending: '⏳ Pendiente',
    rejected: '❌ Rechazado',
  };
  return (
    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${styles[status] || 'bg-gray-100 text-gray-500'}`}>
      {labels[status] || status}
    </span>
  );
}

function StatBox({ icon, label, value, bg, change }: { icon: React.ReactNode; label: string; value: string; bg: string; change?: string }) {
  return (
    <div className={`${bg} rounded-2xl p-4 border border-white/50`}>
      <div className="flex items-center justify-between mb-2">
        {icon}
        {change && (
          <span className="text-[10px] font-bold text-green-600 bg-green-100 px-1.5 py-0.5 rounded-lg flex items-center gap-0.5">
            <ArrowUpRight size={10} /> {change}
          </span>
        )}
      </div>
      <p className="text-[11px] text-gray-500">{label}</p>
      <p className="text-lg font-extrabold">{value}</p>
    </div>
  );
}

function PendingDealCard({ deal, onApprove, onReject }: { deal: Deal; onApprove: () => void; onReject: () => void }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-white rounded-2xl border-2 border-amber-200 shadow-sm overflow-hidden">
      <div className="p-4">
        <div className="flex gap-3">
          <img src={deal.image} alt="" className="w-16 h-16 rounded-xl object-cover flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-sm line-clamp-1">{deal.title}</h3>
            <p className="text-[11px] text-gray-400">{deal.businessName}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-orange-600 font-bold text-sm">{formatPrice(deal.discountPrice)}</span>
              <span className="text-[11px] text-gray-300 line-through">{formatPrice(deal.originalPrice)}</span>
              <span className="bg-red-100 text-red-600 text-[10px] px-1.5 py-0.5 rounded-lg font-bold">
                -{deal.discountPercent}%
              </span>
            </div>
          </div>
        </div>

        <button onClick={() => setExpanded(!expanded)} className="text-[11px] text-violet-600 font-semibold mt-2 flex items-center gap-1">
          <Eye size={12} /> {expanded ? 'Ocultar detalles' : 'Ver detalles'}
        </button>

        {expanded && (
          <div className="mt-3 p-3 bg-gray-50 rounded-xl text-xs text-gray-600 space-y-2 animate-fadeIn">
            <p>{deal.description}</p>
            <p className="text-[11px] text-gray-400">📍 {deal.address}</p>
            <p className="text-[11px] text-gray-400">📦 {deal.availableQuantity} disponibles</p>
            {deal.terms.length > 0 && (
              <div>
                <p className="font-semibold text-gray-700 mb-1">Términos:</p>
                <ul className="list-disc list-inside space-y-0.5">
                  {deal.terms.map((t, i) => <li key={i}>{t}</li>)}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex border-t border-amber-100">
        <button onClick={onReject}
          className="flex-1 py-3 text-red-600 font-semibold text-sm hover:bg-red-50 transition flex items-center justify-center gap-1.5">
          <XCircle size={16} /> Rechazar
        </button>
        <div className="w-px bg-amber-100" />
        <button onClick={onApprove}
          className="flex-1 py-3 text-green-600 font-semibold text-sm hover:bg-green-50 transition flex items-center justify-center gap-1.5">
          <CheckCircle size={16} /> Aprobar
        </button>
      </div>
    </div>
  );
}

function PendingBizCard({ business, onApprove, onReject }: { business: Business; onApprove: () => void; onReject: () => void }) {
  return (
    <div className="bg-white rounded-2xl border-2 border-purple-200 shadow-sm overflow-hidden">
      <div className="p-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-violet-100 rounded-xl flex items-center justify-center text-lg font-bold text-purple-600">
            {business.name.charAt(0)}
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-sm">{business.name}</h3>
            <p className="text-[11px] text-gray-400">{business.category} · {business.address}</p>
            <p className="text-[11px] text-gray-400">{business.phone}</p>
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-2">{business.description}</p>
      </div>
      <div className="flex border-t border-purple-100">
        <button onClick={onReject}
          className="flex-1 py-3 text-red-600 font-semibold text-sm hover:bg-red-50 transition flex items-center justify-center gap-1.5">
          <XCircle size={16} /> Rechazar
        </button>
        <div className="w-px bg-purple-100" />
        <button onClick={onApprove}
          className="flex-1 py-3 text-green-600 font-semibold text-sm hover:bg-green-50 transition flex items-center justify-center gap-1.5">
          <CheckCircle size={16} /> Aprobar
        </button>
      </div>
    </div>
  );
}

function AdminDealRow({ deal, onToggleFeatured, onTogglePause, onDelete, onApprove, onView }: {
  deal: Deal; onToggleFeatured: () => void; onTogglePause: () => void; onDelete: () => void; onApprove: () => void; onView: () => void;
}) {
  const [showActions, setShowActions] = useState(false);

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm">
      <div className="flex gap-3" onClick={() => setShowActions(!showActions)}>
        <img src={deal.image} alt="" className="w-12 h-12 rounded-lg object-cover flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <h3 className="text-xs font-semibold line-clamp-1 flex-1">{deal.title}</h3>
            {deal.featured && <Star size={12} className="text-amber-500 fill-amber-500 flex-shrink-0" />}
          </div>
          <p className="text-[10px] text-gray-400">{deal.businessName}</p>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-orange-600 font-bold text-[11px]">{formatPrice(deal.discountPrice)}</span>
            <StatusBadge status={deal.approvalStatus} />
            {deal.paused && (
              <span className="text-[10px] bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded-full font-bold">⏸ Pausada</span>
            )}
          </div>
        </div>
        <div className="text-right flex-shrink-0">
          <p className="text-[10px] text-gray-400">{deal.soldQuantity}/{deal.availableQuantity}</p>
          <ChevronRight size={14} className={`text-gray-300 transition-transform mx-auto mt-1 ${showActions ? 'rotate-90' : ''}`} />
        </div>
      </div>

      {showActions && (
        <div className="mt-3 pt-3 border-t border-gray-50 flex flex-wrap gap-2 animate-fadeIn">
          <button onClick={onView} className="text-[10px] bg-blue-50 text-blue-600 px-3 py-1.5 rounded-lg font-semibold hover:bg-blue-100 transition flex items-center gap-1">
            <Eye size={11} /> Ver
          </button>
          {deal.approvalStatus === 'pending' && (
            <button onClick={onApprove} className="text-[10px] bg-green-50 text-green-600 px-3 py-1.5 rounded-lg font-semibold hover:bg-green-100 transition flex items-center gap-1">
              <CheckCircle size={11} /> Aprobar
            </button>
          )}
          {deal.approvalStatus === 'approved' && (
            <>
              <button onClick={onToggleFeatured} className="text-[10px] bg-amber-50 text-amber-600 px-3 py-1.5 rounded-lg font-semibold hover:bg-amber-100 transition flex items-center gap-1">
                <Star size={11} /> {deal.featured ? 'Quitar ⭐' : 'Destacar'}
              </button>
              <button onClick={onTogglePause} className="text-[10px] bg-gray-100 text-gray-600 px-3 py-1.5 rounded-lg font-semibold hover:bg-gray-200 transition">
                {deal.paused ? '▶ Reactivar' : '⏸ Pausar'}
              </button>
            </>
          )}
          <button onClick={onDelete} className="text-[10px] bg-red-50 text-red-600 px-3 py-1.5 rounded-lg font-semibold hover:bg-red-100 transition">
            🗑 Eliminar
          </button>
        </div>
      )}
    </div>
  );
}
