import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus, BarChart3, Ticket, TrendingUp, DollarSign, Users, Package,
  CheckCircle, XCircle, Search, QrCode, Eye, ArrowUpRight, Pause, Play,
  Trash2, Edit3, Clock, AlertTriangle, Star
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useApp } from '../context/AppContext';
import { PageContainer, EmptyState } from '../components/Layout';
import { formatPrice } from '../components/DealCard';
import { salesData } from '../data/mockData';
import { Deal } from '../types';

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('es-UY', { day: 'numeric', month: 'short' });
}

function MiniBarChart() {
  const maxSales = Math.max(...salesData.map(d => d.sales));
  const barWidth = 28;
  const chartHeight = 100;
  const gap = 8;
  const totalWidth = salesData.length * (barWidth + gap);

  return (
    <div className="overflow-x-auto scrollbar-hide">
      <svg width={totalWidth + 20} height={chartHeight + 30} className="mx-auto">
        {salesData.map((d, i) => {
          const barH = (d.sales / maxSales) * chartHeight;
          const x = i * (barWidth + gap) + 10;
          return (
            <g key={d.day}>
              <defs>
                <linearGradient id={`grad-${i}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f97316" />
                  <stop offset="100%" stopColor="#fbbf24" />
                </linearGradient>
              </defs>
              <rect x={x} y={chartHeight - barH} width={barWidth} height={barH} rx={6} fill={`url(#grad-${i})`} opacity={0.9}>
                <animate attributeName="height" from="0" to={barH} dur="0.8s" fill="freeze" begin={`${i * 0.1}s`} />
                <animate attributeName="y" from={chartHeight} to={chartHeight - barH} dur="0.8s" fill="freeze" begin={`${i * 0.1}s`} />
              </rect>
              <text x={x + barWidth / 2} y={chartHeight - barH - 6} textAnchor="middle" className="text-[10px]" fill="#9ca3af" fontWeight="600">{d.sales}</text>
              <text x={x + barWidth / 2} y={chartHeight + 16} textAnchor="middle" className="text-[10px]" fill="#9ca3af">{d.day}</text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

export function BusinessDashboard() {
  const { currentUser, deals, coupons, togglePauseDeal, deleteDeal } = useApp();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'overview' | 'deals' | 'coupons'>('overview');
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  if (!currentUser || currentUser.role !== 'business') {
    return (
      <PageContainer className="pt-4">
        <EmptyState icon="🏪" title="Acceso para comercios"
          description="Iniciá sesión con una cuenta de comercio"
          action={() => navigate('/login')} actionLabel="Iniciar Sesión" />
      </PageContainer>
    );
  }

  const totalSold = coupons.length;
  const totalRevenue = coupons.reduce((acc, c) => acc + c.deal.discountPrice, 0);
  const commission = totalRevenue * 0.1;
  const activeCoupons = coupons.filter(c => c.status === 'active').length;
  const usedCoupons = coupons.filter(c => c.status === 'used').length;

  const approvedDeals = deals.filter(d => d.approvalStatus === 'approved');
  const pendingDeals = deals.filter(d => d.approvalStatus === 'pending');
  const rejectedDeals = deals.filter(d => d.approvalStatus === 'rejected');

  const handleDelete = (dealId: string) => {
    deleteDeal(dealId);
    setConfirmDelete(null);
  };

  return (
    <PageContainer className="pt-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-5 animate-fadeIn">
        <div>
          <h1 className="text-2xl font-extrabold">🏪 Mi Comercio</h1>
          <p className="text-sm text-gray-400">Gestioná tus ofertas y cupones</p>
        </div>
        <button onClick={() => navigate('/business/create')}
          className="bg-gradient-to-r from-orange-500 to-amber-500 text-white px-4 py-2.5 rounded-xl font-medium text-sm shadow-md flex items-center gap-1.5 hover:shadow-lg transition active:scale-95">
          <Plus size={16} /> Nueva
        </button>
      </div>

      {/* Pending/Rejected alerts */}
      {pendingDeals.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-4 flex items-center gap-2 animate-fadeIn">
          <Clock size={18} className="text-amber-500 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-xs font-semibold text-amber-700">{pendingDeals.length} oferta{pendingDeals.length > 1 ? 's' : ''} pendiente{pendingDeals.length > 1 ? 's' : ''} de aprobación</p>
            <p className="text-[10px] text-amber-600">El equipo de DescuentosYa las revisará pronto</p>
          </div>
        </div>
      )}

      {rejectedDeals.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4 flex items-center gap-2 animate-fadeIn">
          <AlertTriangle size={18} className="text-red-500 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-xs font-semibold text-red-700">{rejectedDeals.length} oferta{rejectedDeals.length > 1 ? 's' : ''} rechazada{rejectedDeals.length > 1 ? 's' : ''}</p>
            <p className="text-[10px] text-red-600">Revisá los motivos y editá para volver a enviar</p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 mb-5">
        {[
          { key: 'overview' as const, label: 'Resumen', icon: BarChart3 },
          { key: 'deals' as const, label: 'Mis Ofertas', icon: Package },
          { key: 'coupons' as const, label: 'Cupones', icon: Ticket },
        ].map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold transition
              ${activeTab === tab.key ? 'bg-orange-500 text-white shadow-md' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
            <tab.icon size={14} /> {tab.label}
          </button>
        ))}
      </div>

      {/* === OVERVIEW TAB === */}
      {activeTab === 'overview' && (
        <div className="space-y-4 animate-fadeIn">
          <div className="grid grid-cols-2 gap-3">
            <StatCard icon={<Ticket size={20} className="text-blue-500" />} label="Cupones Vendidos" value={totalSold.toString()} bg="bg-blue-50" change="+12%" />
            <StatCard icon={<DollarSign size={20} className="text-green-500" />} label="Ingresos" value={formatPrice(totalRevenue)} bg="bg-green-50" change="+8%" />
            <StatCard icon={<Users size={20} className="text-purple-500" />} label="Activos" value={activeCoupons.toString()} bg="bg-purple-50" />
            <StatCard icon={<TrendingUp size={20} className="text-amber-500" />} label="Canjeados" value={usedCoupons.toString()} bg="bg-amber-50" />
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <BarChart3 size={18} className="text-orange-500" />
                <h3 className="font-bold text-sm">Ventas de la Semana</h3>
              </div>
              <span className="text-xs text-gray-400">Últimos 7 días</span>
            </div>
            <MiniBarChart />
          </div>

          <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-2xl p-5 text-white relative overflow-hidden">
            <div className="absolute -right-8 -top-8 w-24 h-24 bg-orange-500/10 rounded-full" />
            <div className="flex items-center gap-2 mb-4">
              <DollarSign size={18} className="text-green-400" />
              <h3 className="font-semibold text-sm">Resumen Financiero</h3>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-400">Ventas totales</p>
                <p className="text-xl font-extrabold text-green-400">{formatPrice(totalRevenue)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Comisión (10%)</p>
                <p className="text-xl font-extrabold text-orange-400">{formatPrice(commission)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Neto a recibir</p>
                <p className="text-xl font-extrabold">{formatPrice(totalRevenue - commission)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Ofertas activas</p>
                <p className="text-xl font-extrabold text-blue-400">{approvedDeals.length}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button onClick={() => navigate('/business/scan')}
              className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-5 rounded-2xl text-center shadow-lg hover:shadow-xl transition active:scale-95 group">
              <QrCode size={28} className="mx-auto mb-2 group-hover:scale-110 transition-transform" />
              <p className="font-semibold text-sm">Escanear QR</p>
              <p className="text-xs text-blue-200 mt-0.5">Validar cupón</p>
            </button>
            <button onClick={() => navigate('/business/create')}
              className="bg-gradient-to-br from-orange-500 to-amber-500 text-white p-5 rounded-2xl text-center shadow-lg hover:shadow-xl transition active:scale-95 group">
              <Plus size={28} className="mx-auto mb-2 group-hover:scale-110 transition-transform" />
              <p className="font-semibold text-sm">Nueva Promo</p>
              <p className="text-xs text-orange-200 mt-0.5">Crear oferta</p>
            </button>
          </div>
        </div>
      )}

      {/* === DEALS TAB (CRUD) === */}
      {activeTab === 'deals' && (
        <div className="space-y-4 animate-fadeIn">
          {/* Status counts */}
          <div className="flex gap-2 text-[11px] font-semibold">
            <span className="bg-green-100 text-green-700 px-2.5 py-1 rounded-full">
              ✅ {approvedDeals.length} aprobadas
            </span>
            <span className="bg-amber-100 text-amber-700 px-2.5 py-1 rounded-full">
              ⏳ {pendingDeals.length} pendientes
            </span>
            {rejectedDeals.length > 0 && (
              <span className="bg-red-100 text-red-700 px-2.5 py-1 rounded-full">
                ❌ {rejectedDeals.length} rechazadas
              </span>
            )}
          </div>

          {/* Deals list with actions */}
          {deals.length === 0 ? (
            <EmptyState icon="📦" title="Sin ofertas"
              description="Creá tu primera promoción y empezá a vender"
              action={() => navigate('/business/create')} actionLabel="Crear Promoción" />
          ) : (
            <div className="space-y-3">
              {deals.map((deal, i) => (
                <BusinessDealCard
                  key={deal.id}
                  deal={deal}
                  index={i}
                  onPause={() => togglePauseDeal(deal.id)}
                  onDelete={() => setConfirmDelete(deal.id)}
                  onEdit={() => navigate(`/business/edit/${deal.id}`)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* === COUPONS TAB === */}
      {activeTab === 'coupons' && (
        <div className="animate-fadeIn">
          {coupons.length === 0 ? (
            <EmptyState icon="🎟️" title="Sin cupones vendidos"
              description="Cuando los usuarios compren tus ofertas, aparecerán acá" />
          ) : (
            <div className="space-y-2">
              {coupons.map(coupon => (
                <div key={coupon.id} className="bg-white rounded-xl border border-gray-100 p-3 flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm
                    ${coupon.status === 'active' ? 'bg-green-100' : coupon.status === 'used' ? 'bg-gray-100' : 'bg-red-100'}`}>
                    {coupon.status === 'active' ? '✅' : coupon.status === 'used' ? '☑️' : '⏰'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium line-clamp-1">{coupon.deal.title}</p>
                    <p className="text-[11px] text-gray-400 font-mono">{coupon.qrCode.slice(0, 22)}...</p>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-bold text-orange-600">{formatPrice(coupon.deal.discountPrice)}</span>
                    <p className="text-[10px] text-gray-400 capitalize">{coupon.status === 'active' ? 'Activo' : coupon.status === 'used' ? 'Usado' : 'Vencido'}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Delete confirmation modal */}
      {confirmDelete && (
        <>
          <div className="fixed inset-0 bg-black/40 z-50 animate-fadeIn" onClick={() => setConfirmDelete(null)} />
          <div className="fixed inset-x-4 top-1/2 -translate-y-1/2 max-w-md mx-auto bg-white rounded-2xl shadow-2xl z-50 p-6 animate-scaleIn">
            <div className="text-center">
              <Trash2 size={40} className="mx-auto text-red-400 mb-3" />
              <h3 className="font-bold text-lg mb-1">¿Eliminar esta oferta?</h3>
              <p className="text-sm text-gray-500 mb-5">Esta acción no se puede deshacer. Los cupones ya vendidos seguirán activos.</p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setConfirmDelete(null)}
                className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl font-medium text-sm">
                Cancelar
              </button>
              <button onClick={() => handleDelete(confirmDelete)}
                className="flex-1 bg-red-500 text-white py-3 rounded-xl font-bold text-sm">
                🗑 Eliminar
              </button>
            </div>
          </div>
        </>
      )}
    </PageContainer>
  );
}

function BusinessDealCard({ deal, index, onPause, onDelete, onEdit }: {
  deal: Deal; index: number; onPause: () => void; onDelete: () => void; onEdit: () => void;
}) {
  const [expanded, setExpanded] = useState(false);

  const statusStyles = {
    approved: { border: 'border-green-200', bg: 'bg-green-50', text: 'text-green-700', label: '✅ Aprobada' },
    pending: { border: 'border-amber-200', bg: 'bg-amber-50', text: 'text-amber-700', label: '⏳ Pendiente' },
    rejected: { border: 'border-red-200', bg: 'bg-red-50', text: 'text-red-700', label: '❌ Rechazada' },
  };

  const status = statusStyles[deal.approvalStatus];

  return (
    <div className={`bg-white rounded-2xl border ${status.border} shadow-sm animate-fadeInUp overflow-hidden`}
      style={{ animationDelay: `${index * 60}ms`, animationFillMode: 'backwards' }}>
      <div className="p-4">
        <div className="flex gap-3">
          <div className="relative">
            <img src={deal.image} alt="" className="w-14 h-14 rounded-xl object-cover flex-shrink-0" />
            {deal.paused && (
              <div className="absolute inset-0 bg-black/50 rounded-xl flex items-center justify-center">
                <Pause size={16} className="text-white" />
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <h3 className="font-semibold text-sm line-clamp-1 flex-1">{deal.title}</h3>
              {deal.featured && <Star size={12} className="text-amber-500 fill-amber-500 flex-shrink-0" />}
            </div>
            <p className="text-xs text-gray-400 mt-0.5">{deal.category} · Vence {formatDate(deal.expiresAt)}</p>
            <div className="flex items-center gap-2 mt-1.5">
              <span className="text-orange-600 font-bold text-sm">{formatPrice(deal.discountPrice)}</span>
              <span className="text-xs text-gray-300 line-through">{formatPrice(deal.originalPrice)}</span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${status.bg} ${status.text}`}>
                {status.label}
              </span>
            </div>
          </div>
        </div>

        {/* Rejection reason */}
        {deal.approvalStatus === 'rejected' && deal.rejectionReason && (
          <div className="mt-3 bg-red-50 rounded-xl p-3 border border-red-100">
            <p className="text-[11px] font-semibold text-red-700 mb-0.5">Motivo del rechazo:</p>
            <p className="text-xs text-red-600">{deal.rejectionReason}</p>
          </div>
        )}

        {/* Stats bar */}
        {deal.approvalStatus === 'approved' && (
          <div className="mt-3 pt-3 border-t border-gray-50 flex items-center justify-between">
            <div className="flex items-center gap-4 text-xs text-gray-400">
              <span className="flex items-center gap-1"><Eye size={12} /> {deal.soldQuantity} vendidos</span>
              <span>{deal.availableQuantity - deal.soldQuantity} disponibles</span>
            </div>
            <div className="w-16 bg-gray-100 rounded-full h-1.5">
              <div className="bg-orange-400 h-1.5 rounded-full" style={{ width: `${(deal.soldQuantity / deal.availableQuantity) * 100}%` }} />
            </div>
          </div>
        )}

        {/* Toggle actions */}
        <button onClick={() => setExpanded(!expanded)}
          className="mt-2 text-[11px] text-orange-600 font-semibold flex items-center gap-1 w-full justify-center py-1">
          {expanded ? '▲ Ocultar acciones' : '▼ Gestionar oferta'}
        </button>
      </div>

      {/* Actions panel */}
      {expanded && (
        <div className="border-t border-gray-100 p-3 bg-gray-50 flex flex-wrap gap-2 animate-fadeIn">
          {deal.approvalStatus === 'approved' && (
            <button onClick={onPause}
              className={`text-[11px] px-3 py-2 rounded-lg font-semibold flex items-center gap-1.5 transition
                ${deal.paused ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-amber-100 text-amber-700 hover:bg-amber-200'}`}>
              {deal.paused ? <><Play size={12} /> Reactivar</> : <><Pause size={12} /> Pausar</>}
            </button>
          )}
          <button onClick={onEdit}
            className="text-[11px] bg-blue-100 text-blue-700 px-3 py-2 rounded-lg font-semibold flex items-center gap-1.5 hover:bg-blue-200 transition">
            <Edit3 size={12} /> Editar
          </button>
          <button onClick={onDelete}
            className="text-[11px] bg-red-100 text-red-700 px-3 py-2 rounded-lg font-semibold flex items-center gap-1.5 hover:bg-red-200 transition">
            <Trash2 size={12} /> Eliminar
          </button>
        </div>
      )}
    </div>
  );
}

function StatCard({ icon, label, value, bg, change }: { icon: React.ReactNode; label: string; value: string; bg: string; change?: string }) {
  return (
    <div className={`${bg} rounded-2xl p-4 animate-fadeInUp border border-white/50`}>
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

export function CreatePromotionPage() {
  const navigate = useNavigate();
  const { currentUser, addDeal } = useApp();
  const [form, setForm] = useState({
    title: '', description: '', details: '', category: 'Gastronomía',
    originalPrice: '', discountPercent: '', availableQuantity: '',
    expiresAt: '', terms: '', address: '',
  });
  const [success, setSuccess] = useState(false);
  const [step, setStep] = useState(1);

  if (!currentUser || currentUser.role !== 'business') {
    return <PageContainer className="pt-20 text-center"><p>Acceso no autorizado</p></PageContainer>;
  }

  const images = [
    'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=600&h=400&fit=crop',
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const op = Number(form.originalPrice);
    const dp = Number(form.discountPercent);
    const discountPrice = Math.round(op * (1 - dp / 100));

    addDeal({
      businessId: 'biz1',
      businessName: currentUser.name,
      businessLogo: '',
      title: form.title,
      description: form.description,
      details: form.details,
      image: images[Math.floor(Math.random() * images.length)],
      originalPrice: op,
      discountPrice,
      discountPercent: dp,
      category: form.category,
      availableQuantity: Number(form.availableQuantity),
      expiresAt: form.expiresAt,
      active: false, // starts inactive until approved
      paused: false,
      approvalStatus: 'pending', // needs admin approval
      address: form.address || 'Centro, Montevideo',
      lat: -34.9011 + Math.random() * 0.02,
      lng: -56.1645 + Math.random() * 0.02,
      terms: form.terms.split('\n').filter(t => t.trim()),
      featured: false,
      rating: 0,
      reviewCount: 0,
    });

    setSuccess(true);
    setTimeout(() => navigate('/business'), 2500);
  };

  if (success) {
    return (
      <PageContainer className="pt-20 text-center">
        <div className="animate-scaleIn">
          <p className="text-7xl mb-4">📋</p>
          <h2 className="text-2xl font-extrabold text-amber-600 mb-2">¡Enviada para Aprobación!</h2>
          <p className="text-gray-500 text-sm max-w-xs mx-auto">
            Tu oferta fue enviada al equipo de DescuentosYa. Te notificaremos cuando sea aprobada y visible para los usuarios.
          </p>
          <div className="mt-6 bg-amber-50 border border-amber-200 rounded-xl p-4 text-left max-w-xs mx-auto">
            <p className="text-xs text-amber-700 font-medium mb-1">⏳ ¿Qué sigue?</p>
            <ul className="text-[11px] text-amber-600 space-y-1">
              <li>• Nuestro equipo revisará tu oferta</li>
              <li>• Recibirás una notificación al ser aprobada</li>
              <li>• La oferta se publica automáticamente</li>
            </ul>
          </div>
          <div className="mt-6 flex gap-3 justify-center">
            <button onClick={() => navigate('/business')} className="bg-orange-500 text-white px-5 py-2.5 rounded-xl font-medium text-sm">
              Ver Dashboard
            </button>
          </div>
        </div>
      </PageContainer>
    );
  }

  const cats = ['Gastronomía', 'Belleza', 'Salud', 'Entretenimiento', 'Tecnología', 'Moda', 'Hogar', 'Deportes', 'Educación', 'Viajes'];

  return (
    <PageContainer className="pt-4">
      <h1 className="text-2xl font-extrabold mb-1">✨ Nueva Promoción</h1>
      <p className="text-sm text-gray-400 mb-1">Paso {step} de 2</p>
      <p className="text-[11px] text-amber-600 bg-amber-50 px-3 py-1.5 rounded-lg mb-4 inline-block">
        ⚡ Será revisada por nuestro equipo antes de publicarse
      </p>

      <div className="flex gap-2 mb-6">
        <div className={`flex-1 h-1.5 rounded-full ${step >= 1 ? 'bg-orange-500' : 'bg-gray-200'}`} />
        <div className={`flex-1 h-1.5 rounded-full ${step >= 2 ? 'bg-orange-500' : 'bg-gray-200'}`} />
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {step === 1 && (
          <div className="space-y-4 animate-fadeIn">
            <Field label="Título de la Promoción" required>
              <input type="text" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
                placeholder="Ej: Cena para 2 con 40% OFF" required
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-300 focus:outline-none text-sm" />
            </Field>
            <Field label="Descripción" required>
              <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
                placeholder="Breve descripción de la oferta..." required rows={2}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-300 focus:outline-none text-sm resize-none" />
            </Field>
            <Field label="Detalles">
              <textarea value={form.details} onChange={e => setForm({ ...form, details: e.target.value })}
                placeholder="Detalles completos..." rows={3}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-300 focus:outline-none text-sm resize-none" />
            </Field>
            <Field label="Categoría">
              <div className="flex flex-wrap gap-2">
                {cats.map(c => (
                  <button key={c} type="button" onClick={() => setForm({ ...form, category: c })}
                    className={`px-3 py-2 rounded-xl text-xs font-medium transition
                      ${form.category === c ? 'bg-orange-500 text-white shadow' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                    {c}
                  </button>
                ))}
              </div>
            </Field>
            <button type="button" onClick={() => setStep(2)}
              disabled={!form.title || !form.description}
              className="w-full bg-gradient-to-r from-orange-500 to-amber-500 text-white py-3.5 rounded-xl font-bold disabled:opacity-50 transition">
              Siguiente →
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4 animate-fadeIn">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Precio Original ($U)" required>
                <input type="number" value={form.originalPrice} onChange={e => setForm({ ...form, originalPrice: e.target.value })}
                  placeholder="4500" required min="1"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-300 focus:outline-none text-sm" />
              </Field>
              <Field label="Descuento (%)" required>
                <input type="number" value={form.discountPercent} onChange={e => setForm({ ...form, discountPercent: e.target.value })}
                  placeholder="40" required min="1" max="99"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-300 focus:outline-none text-sm" />
              </Field>
            </div>

            {form.originalPrice && form.discountPercent && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-3 flex items-center justify-between animate-fadeIn">
                <span className="text-sm text-green-700 font-medium">💰 Precio con descuento:</span>
                <span className="font-extrabold text-green-700 text-lg">
                  {formatPrice(Number(form.originalPrice) * (1 - Number(form.discountPercent) / 100))}
                </span>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <Field label="Cantidad" required>
                <input type="number" value={form.availableQuantity} onChange={e => setForm({ ...form, availableQuantity: e.target.value })}
                  placeholder="50" required min="1"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-300 focus:outline-none text-sm" />
              </Field>
              <Field label="Vencimiento" required>
                <input type="date" value={form.expiresAt} onChange={e => setForm({ ...form, expiresAt: e.target.value })}
                  required
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-300 focus:outline-none text-sm" />
              </Field>
            </div>

            <Field label="Dirección">
              <input type="text" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })}
                placeholder="Av. 18 de Julio 1234, Montevideo"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-300 focus:outline-none text-sm" />
            </Field>

            <Field label="Términos (uno por línea)">
              <textarea value={form.terms} onChange={e => setForm({ ...form, terms: e.target.value })}
                placeholder={"Válido de lunes a viernes\nReserva previa por WhatsApp"} rows={3}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-300 focus:outline-none text-sm resize-none" />
            </Field>

            <div className="flex gap-3">
              <button type="button" onClick={() => setStep(1)}
                className="flex-1 bg-gray-100 text-gray-700 py-3.5 rounded-xl font-medium hover:bg-gray-200 transition">
                ← Atrás
              </button>
              <button type="submit"
                className="flex-1 bg-gradient-to-r from-orange-500 to-amber-500 text-white py-3.5 rounded-xl font-bold shadow-lg hover:shadow-xl transition">
                📋 Enviar a Revisión
              </button>
            </div>
          </div>
        )}
      </form>
    </PageContainer>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-sm font-medium text-gray-700 mb-1.5 block">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      {children}
    </div>
  );
}

export function ScanQRPage() {
  const { coupons, validateCoupon } = useApp();
  const [code, setCode] = useState('');
  const [result, setResult] = useState<'success' | 'error' | 'already' | null>(null);
  const [foundCoupon, setFoundCoupon] = useState<typeof coupons[0] | null>(null);

  const handleScan = () => {
    const coupon = coupons.find(c => c.qrCode === code || c.id === code);
    if (!coupon) { setResult('error'); setFoundCoupon(null); return; }
    if (coupon.status === 'used') { setResult('already'); setFoundCoupon(coupon); return; }
    const success = validateCoupon(coupon.id);
    setResult(success ? 'success' : 'error');
    setFoundCoupon(coupon);
  };

  const handleQuickValidate = (couponId: string) => {
    const coupon = coupons.find(c => c.id === couponId);
    if (coupon && coupon.status === 'active') {
      validateCoupon(couponId);
      setResult('success');
      setFoundCoupon(coupon);
    }
  };

  return (
    <PageContainer className="pt-4">
      <h1 className="text-2xl font-extrabold mb-5">📷 Validar Cupón</h1>

      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-10 mb-5 text-center relative overflow-hidden">
        <div className="absolute inset-6 border-2 border-dashed border-white/20 rounded-xl" />
        <div className="absolute top-6 left-6 w-10 h-10 border-t-3 border-l-3 border-orange-400 rounded-tl-lg" />
        <div className="absolute top-6 right-6 w-10 h-10 border-t-3 border-r-3 border-orange-400 rounded-tr-lg" />
        <div className="absolute bottom-6 left-6 w-10 h-10 border-b-3 border-l-3 border-orange-400 rounded-bl-lg" />
        <div className="absolute bottom-6 right-6 w-10 h-10 border-b-3 border-r-3 border-orange-400 rounded-br-lg" />
        <div className="animate-float">
          <QrCode size={56} className="mx-auto text-white/30 mb-3" />
        </div>
        <p className="text-white/60 text-sm font-medium">Escaneá el QR del cliente</p>
        <p className="text-white/40 text-xs mt-1">o ingresá el código manualmente</p>
      </div>

      <div className="flex gap-2 mb-5">
        <div className="flex-1 relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" value={code} onChange={e => setCode(e.target.value)}
            placeholder="Código del cupón..."
            onKeyDown={e => e.key === 'Enter' && handleScan()}
            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-300 focus:outline-none text-sm" />
        </div>
        <button onClick={handleScan}
          className="bg-orange-500 text-white px-5 py-3 rounded-xl font-medium text-sm hover:bg-orange-600 transition active:scale-95 shadow-md">
          Validar
        </button>
      </div>

      {result === 'success' && foundCoupon && (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-6 text-center mb-5 animate-scaleIn">
          <CheckCircle size={52} className="mx-auto text-green-500 mb-3" />
          <h3 className="text-lg font-bold text-green-700">¡Cupón Validado!</h3>
          <p className="font-medium text-green-600 mt-2">{foundCoupon.deal.title}</p>
          <p className="text-sm text-green-500 mt-1">{formatPrice(foundCoupon.deal.discountPrice)}</p>
        </div>
      )}
      {result === 'error' && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center mb-5 animate-scaleIn">
          <XCircle size={52} className="mx-auto text-red-500 mb-3" />
          <h3 className="text-lg font-bold text-red-700">Cupón No Encontrado</h3>
          <p className="text-sm text-red-500 mt-1">El código ingresado no es válido</p>
        </div>
      )}
      {result === 'already' && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 text-center mb-5 animate-scaleIn">
          <XCircle size={52} className="mx-auto text-amber-500 mb-3" />
          <h3 className="text-lg font-bold text-amber-700">Cupón Ya Usado</h3>
          <p className="text-sm text-amber-500 mt-1">Este cupón ya fue validado</p>
        </div>
      )}

      <div>
        <h3 className="font-bold text-base mb-3 flex items-center gap-2">⚡ Cupones activos pendientes</h3>
        {coupons.filter(c => c.status === 'active').length === 0 ? (
          <p className="text-center py-8 text-gray-400 text-sm">No hay cupones activos</p>
        ) : (
          <div className="space-y-2">
            {coupons.filter(c => c.status === 'active').map(coupon => (
              <div key={coupon.id} className="bg-white rounded-xl border border-gray-100 p-3 flex items-center gap-3 card-hover">
                <div className="flex-shrink-0 bg-green-50 rounded-lg p-2 border border-green-100">
                  <QRCodeSVG value={coupon.qrCode} size={36} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium line-clamp-1">{coupon.deal.title}</p>
                  <p className="text-[11px] text-gray-400 font-mono">{coupon.qrCode.slice(0, 25)}...</p>
                </div>
                <button onClick={() => handleQuickValidate(coupon.id)}
                  className="bg-green-500 text-white px-3 py-2 rounded-xl text-xs font-semibold hover:bg-green-600 transition flex-shrink-0 shadow-sm active:scale-95">
                  ✓ Validar
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </PageContainer>
  );
}
