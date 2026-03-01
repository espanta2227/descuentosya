import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Shield, BarChart3, Package, Store, Users, TrendingUp,
  CheckCircle, XCircle, Clock, Eye, Star, ChevronRight, AlertTriangle,
  ArrowUpRight, Search, Plus, Pause, Play, Trash2,
  MapPin, Navigation, Car, Footprints, Bike, Locate, RotateCcw,
  Edit3, X, Camera, Upload, Phone, Mail, Save, ChevronDown, Image as ImageIcon
} from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useApp } from '../context/AppContext';
import { PageContainer, EmptyState } from '../components/Layout';
import { formatPrice } from '../components/DealCard';
import { Deal, Business } from '../types';
import { calculateDistance, estimateTravelTime, formatDistanceText } from '../data/busLines';

type AdminTab = 'overview' | 'pending' | 'deals' | 'businesses' | 'create';

export default function AdminDashboard() {
  const {
    currentUser, deals, coupons, businesses, platformStats,
    getPendingDeals,
    approveDeal, rejectDeal,
    toggleFeatured, deleteDeal, togglePauseDeal,
    addDeal, updateDeal, addToast,
    addBusiness, updateBusiness, deleteBusiness,
  } = useApp();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [rejectModal, setRejectModal] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [searchFilter, setSearchFilter] = useState('');

  // Edit deal state
  const [editingDeal, setEditingDeal] = useState<Deal | null>(null);

  // Edit/create business state
  const [editingBusiness, setEditingBusiness] = useState<Business | null>(null);
  const [creatingBusiness, setCreatingBusiness] = useState(false);
  const [bizSearchFilter, setBizSearchFilter] = useState('');

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
  const totalClaimed = coupons.length;
  const approvedDeals = deals.filter(d => d.approvalStatus === 'approved');

  const handleReject = () => {
    if (!rejectModal || !rejectReason.trim()) return;
    rejectDeal(rejectModal, rejectReason);
    setRejectModal(null);
    setRejectReason('');
  };

  const tabs: { key: AdminTab; label: string; icon: typeof Shield; badge?: number }[] = [
    { key: 'overview', label: 'General', icon: BarChart3 },
    { key: 'pending', label: 'Pendientes', icon: Clock, badge: pendingDeals.length },
    { key: 'deals', label: 'Ofertas', icon: Package },
    { key: 'businesses', label: 'Comercios', icon: Store },
    { key: 'create', label: 'Crear', icon: Plus },
  ];

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
      {pendingDeals.length > 0 && activeTab !== 'pending' && (
        <button onClick={() => setActiveTab('pending')}
          className="w-full bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-4 flex items-center gap-3 animate-fadeIn hover:bg-amber-100 transition">
          <div className="bg-amber-100 p-2 rounded-xl">
            <AlertTriangle size={20} className="text-amber-600" />
          </div>
          <div className="flex-1 text-left">
            <p className="font-semibold text-amber-800 text-sm">
              {pendingDeals.length} oferta{pendingDeals.length !== 1 ? 's' : ''} pendiente{pendingDeals.length !== 1 ? 's' : ''}
            </p>
            <p className="text-xs text-amber-600">Toca para revisar y aprobar</p>
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
          <div className="grid grid-cols-2 gap-3">
            <StatBox icon={<Users size={18} className="text-blue-500" />} label="Usuarios" value={platformStats.totalUsers.toString()} bg="bg-blue-50" change="+15%" />
            <StatBox icon={<Store size={18} className="text-purple-500" />} label="Comercios" value={platformStats.totalBusinesses.toString()} bg="bg-purple-50" change="+8%" />
            <StatBox icon={<Package size={18} className="text-orange-500" />} label="Ofertas Activas" value={platformStats.totalDeals.toString()} bg="bg-orange-50" />
            <StatBox icon={<CheckCircle size={18} className="text-green-500" />} label="Total Canjes" value={totalClaimed.toString()} bg="bg-green-50" change="+22%" />
          </div>

          <div className="bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 rounded-2xl p-5 text-white relative overflow-hidden">
            <div className="absolute -right-6 -top-6 w-20 h-20 bg-white/5 rounded-full" />
            <div className="absolute -right-2 -bottom-2 w-16 h-16 bg-white/5 rounded-full" />
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp size={18} />
              <h3 className="font-semibold text-sm">Resumen de Plataforma</h3>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <p className="text-[11px] text-white/60">Ofertas totales</p>
                <p className="text-lg font-extrabold">{deals.length}</p>
              </div>
              <div>
                <p className="text-[11px] text-white/60">Aprobadas</p>
                <p className="text-lg font-extrabold text-green-300">{approvedDeals.length}</p>
              </div>
              <div>
                <p className="text-[11px] text-white/60">Cupones</p>
                <p className="text-lg font-extrabold text-amber-300">{totalClaimed}</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-4 border border-green-200">
            <h3 className="font-bold text-sm text-green-800 mb-2">💰 Modelo de Negocio</h3>
            <p className="text-xs text-green-700 mb-2">
              Vos publicás las ofertas de los comercios. El usuario obtiene el cupón con QR y paga el precio con descuento en el local.
            </p>
            <div className="space-y-1.5 text-xs text-green-600">
              <p>• 🏪 Cobrás al comercio por publicar su oferta</p>
              <p>• 📢 Banner principal = espacio premium</p>
              <p>• 👤 El usuario descarga la app, obtiene el cupón y paga menos en el local</p>
              <p>• 📲 QR único por cada cupón canjeado</p>
            </div>
          </div>

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
                  <span className="text-xs font-bold text-green-600">
                    -{c.deal.discountPercent}%
                  </span>
                </div>
              ))}
              {coupons.length === 0 && (
                <p className="text-sm text-gray-400 text-center py-4">Sin actividad todavía</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* === PENDING === */}
      {activeTab === 'pending' && (
        <div className="space-y-4 animate-fadeIn">
          <h3 className="font-bold text-sm flex items-center gap-2">
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
                  onReject={() => setRejectModal(deal.id)}
                />
              ))}
            </div>
          )}
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
            <button onClick={() => setActiveTab('create')}
              className="bg-violet-600 text-white p-2.5 rounded-xl flex items-center gap-1.5 px-3 text-xs font-semibold">
              <Plus size={14} /> Nueva
            </button>
          </div>

          <div className="flex gap-2 text-[11px] font-semibold mb-2 flex-wrap">
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
                onDelete={() => { if (confirm('¿Eliminar esta oferta?')) deleteDeal(deal.id); }}
                onApprove={() => approveDeal(deal.id)}
                onView={() => navigate(`/deal/${deal.id}`)}
                onEdit={() => setEditingDeal(deal)}
              />
            ))}

          {deals.length === 0 && (
            <EmptyState icon="📦" title="No hay ofertas" description="Creá la primera oferta desde la pestaña Crear" />
          )}
        </div>
      )}

      {/* === BUSINESSES === */}
      {activeTab === 'businesses' && (
        <div className="space-y-3 animate-fadeIn">
          <div className="bg-violet-50 rounded-2xl p-4 border border-violet-100 mb-3">
            <h3 className="font-bold text-sm text-violet-800 mb-1">🏪 Comercios Asociados</h3>
            <p className="text-xs text-violet-600">
              Gestioná los comercios que trabajan con la plataforma. Creá, editá o eliminá comercios.
            </p>
          </div>

          <div className="flex gap-2 mb-3">
            <div className="flex-1 relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type="text" value={bizSearchFilter} onChange={e => setBizSearchFilter(e.target.value)}
                placeholder="Buscar comercio..."
                className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-violet-300 focus:outline-none" />
            </div>
            <button onClick={() => setCreatingBusiness(true)}
              className="bg-violet-600 text-white px-4 py-2.5 rounded-xl flex items-center gap-1.5 text-xs font-semibold hover:bg-violet-700 transition">
              <Plus size={14} /> Nuevo Comercio
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px] font-semibold mb-3">
            <div className="bg-green-50 rounded-xl p-3 text-center border border-green-100">
              <p className="text-green-700">✅ {businesses.filter(b => b.active).length} Activos</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-3 text-center border border-gray-100">
              <p className="text-gray-500">📊 {businesses.length} Total</p>
            </div>
          </div>

          {businesses
            .filter(b => !bizSearchFilter || b.name.toLowerCase().includes(bizSearchFilter.toLowerCase()) || b.category.toLowerCase().includes(bizSearchFilter.toLowerCase()))
            .map(biz => (
            <div key={biz.id} className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-violet-100 rounded-xl flex items-center justify-center text-lg font-bold text-purple-600">
                  {biz.logo || biz.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-sm">{biz.name}</h3>
                    {biz.active && <CheckCircle size={14} className="text-blue-500" />}
                  </div>
                  <p className="text-[11px] text-gray-400 line-clamp-1">{biz.address}</p>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <span className="text-[10px] bg-gray-100 px-2 py-0.5 rounded-full">{biz.category}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                      biz.plan === 'premium' || biz.plan === 'elite'
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-gray-100 text-gray-500'
                    }`}>
                      {biz.plan === 'elite' ? '👑 Elite' : biz.plan === 'premium' ? '⭐ Premium' : '📋 Básico'}
                    </span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                      biz.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {biz.active ? '✅ Activo' : '❌ Inactivo'}
                    </span>
                  </div>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-gray-50 space-y-1">
                <div className="flex items-center justify-between text-[11px] text-gray-400">
                  <span>⭐ {biz.rating} · {biz.reviewCount} reseñas</span>
                  <span>📞 {biz.phone}</span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-gray-400">
                  <span>👤 {biz.contactName}</span>
                  <span>📧 {biz.contactEmail}</span>
                </div>
                <div className="text-[11px] text-gray-400">
                  <span>📍 Lat: {biz.lat.toFixed(4)}, Lng: {biz.lng.toFixed(4)}</span>
                </div>
              </div>
              {/* Ofertas de este comercio */}
              <div className="mt-2 pt-2 border-t border-gray-50">
                <p className="text-[10px] text-gray-400 font-semibold mb-1">
                  📦 {deals.filter(d => d.businessId === biz.id).length} ofertas publicadas
                </p>
              </div>
              {/* Actions */}
              <div className="mt-2 pt-2 border-t border-gray-50 flex gap-2">
                <button onClick={() => setEditingBusiness(biz)}
                  className="flex-1 text-[11px] bg-blue-50 text-blue-600 px-3 py-2 rounded-xl font-semibold hover:bg-blue-100 transition flex items-center justify-center gap-1">
                  <Edit3 size={12} /> Editar
                </button>
                <button onClick={() => {
                  if (confirm(`¿Eliminar el comercio "${biz.name}"? También se perderán sus ofertas.`)) {
                    deleteBusiness(biz.id);
                  }
                }}
                  className="text-[11px] bg-red-50 text-red-600 px-3 py-2 rounded-xl font-semibold hover:bg-red-100 transition flex items-center justify-center gap-1">
                  <Trash2 size={12} /> Eliminar
                </button>
              </div>
            </div>
          ))}

          {businesses.length === 0 && (
            <EmptyState icon="🏪" title="Sin comercios" description="Agregá el primer comercio con el botón + Nuevo Comercio" />
          )}
        </div>
      )}

      {/* === CREATE DEAL === */}
      {activeTab === 'create' && (
        <CreateDealForm
          onSave={(deal) => { addDeal(deal); setActiveTab('deals'); }}
          addToast={addToast}
          businesses={businesses}
        />
      )}

      {/* === EDIT DEAL MODAL === */}
      {editingDeal && (
        <EditDealModal
          deal={editingDeal}
          businesses={businesses}
          onSave={(updates) => {
            updateDeal(editingDeal.id, updates);
            setEditingDeal(null);
          }}
          onClose={() => setEditingDeal(null)}
          addToast={addToast}
        />
      )}

      {/* === CREATE/EDIT BUSINESS MODAL === */}
      {(creatingBusiness || editingBusiness) && (
        <BusinessFormModal
          business={editingBusiness}
          onSave={(bizData) => {
            if (editingBusiness) {
              updateBusiness(editingBusiness.id, bizData);
            } else {
              addBusiness(bizData as Omit<Business, 'id'>);
            }
            setEditingBusiness(null);
            setCreatingBusiness(false);
          }}
          onClose={() => { setEditingBusiness(null); setCreatingBusiness(false); }}
          addToast={addToast}
        />
      )}

      {/* Reject Modal */}
      {rejectModal && (
        <>
          <div className="fixed inset-0 bg-black/40 z-50 animate-fadeIn" onClick={() => setRejectModal(null)} />
          <div className="fixed inset-x-4 top-1/2 -translate-y-1/2 max-w-md mx-auto bg-white rounded-2xl shadow-2xl z-50 p-6 animate-scaleIn">
            <h3 className="font-bold text-lg mb-1 flex items-center gap-2">
              <XCircle size={20} className="text-red-500" />
              Rechazar Oferta
            </h3>
            <p className="text-sm text-gray-500 mb-4">Indicá el motivo del rechazo.</p>
            <textarea value={rejectReason} onChange={e => setRejectReason(e.target.value)}
              placeholder="Ej: Las imágenes no cumplen con los estándares..."
              rows={3}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm resize-none focus:ring-2 focus:ring-red-300 focus:outline-none mb-4" />
            <div className="flex gap-3">
              <button onClick={() => { setRejectModal(null); setRejectReason(''); }}
                className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl font-medium text-sm hover:bg-gray-200 transition">
                Cancelar
              </button>
              <button onClick={handleReject} disabled={!rejectReason.trim()}
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

// =========================================
// === IMAGE UPLOAD COMPONENT ===
// =========================================
function ImageUploader({ currentImage, onImageChange }: {
  currentImage: string;
  onImageChange: (imageDataUrl: string) => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState(currentImage);
  const [dragActive, setDragActive] = useState(false);

  useEffect(() => { setPreview(currentImage); }, [currentImage]);

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      return;
    }
    // Max 5MB
    if (file.size > 5 * 1024 * 1024) {
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setPreview(result);
      onImageChange(result);
    };
    reader.readAsDataURL(file);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  return (
    <div>
      <label className="text-sm font-medium text-gray-700 mb-2 block flex items-center gap-1.5">
        <ImageIcon size={14} /> Imagen del cupón
      </label>

      {/* Preview */}
      {preview && (
        <div className="relative mb-3 rounded-2xl overflow-hidden border-2 border-gray-200 shadow-sm">
          <img src={preview} alt="Preview" className="w-full h-40 object-cover" />
          <div className="absolute top-2 right-2 flex gap-1.5">
            <button type="button" onClick={() => fileInputRef.current?.click()}
              className="bg-white/90 backdrop-blur-sm p-2 rounded-xl shadow-md hover:bg-white transition">
              <Edit3 size={14} className="text-gray-600" />
            </button>
            <button type="button" onClick={() => { setPreview(''); onImageChange(''); }}
              className="bg-white/90 backdrop-blur-sm p-2 rounded-xl shadow-md hover:bg-white transition">
              <X size={14} className="text-red-500" />
            </button>
          </div>
        </div>
      )}

      {/* Upload area */}
      {!preview && (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
          onDragLeave={() => setDragActive(false)}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all cursor-pointer
            ${dragActive ? 'border-violet-400 bg-violet-50' : 'border-gray-200 bg-gray-50 hover:border-violet-300 hover:bg-violet-50/50'}`}
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="w-14 h-14 mx-auto bg-violet-100 rounded-2xl flex items-center justify-center mb-3">
            <Upload size={24} className="text-violet-500" />
          </div>
          <p className="text-sm font-semibold text-gray-700 mb-1">Subí una imagen</p>
          <p className="text-xs text-gray-400 mb-3">Arrastrá acá o tocá para seleccionar</p>
          <div className="flex gap-2 justify-center">
            <button type="button" onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
              className="bg-violet-600 text-white px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 hover:bg-violet-700 transition">
              <Upload size={12} /> Galería
            </button>
            <button type="button" onClick={(e) => {
              e.stopPropagation();
              if (fileInputRef.current) {
                fileInputRef.current.setAttribute('capture', 'environment');
                fileInputRef.current.click();
                setTimeout(() => fileInputRef.current?.removeAttribute('capture'), 100);
              }
            }}
              className="bg-orange-500 text-white px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 hover:bg-orange-600 transition">
              <Camera size={12} /> Cámara
            </button>
          </div>
          <p className="text-[10px] text-gray-300 mt-2">JPG, PNG, WebP · Máx 5MB</p>
        </div>
      )}

      {/* URL input as fallback */}
      <div className="mt-2">
        <p className="text-[10px] text-gray-400 mb-1">O pegá una URL de imagen:</p>
        <input
          type="url"
          value={preview.startsWith('data:') ? '' : preview}
          onChange={e => { setPreview(e.target.value); onImageChange(e.target.value); }}
          placeholder="https://..."
          className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-violet-300 focus:outline-none"
        />
      </div>

      <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />
    </div>
  );
}

// =========================================
// === EDIT DEAL MODAL ===
// =========================================
function EditDealModal({ deal, businesses, onSave, onClose, addToast }: {
  deal: Deal;
  businesses: Business[];
  onSave: (updates: Partial<Deal>) => void;
  onClose: () => void;
  addToast: (msg: string, type: 'success' | 'error' | 'info' | 'warning') => void;
}) {
  const [form, setForm] = useState({
    title: deal.title,
    description: deal.description,
    details: deal.details,
    image: deal.image,
    originalPrice: deal.originalPrice.toString(),
    discountPercent: deal.discountPercent.toString(),
    category: deal.category,
    availableQuantity: deal.availableQuantity.toString(),
    expiresAt: deal.expiresAt.split('T')[0],
    businessId: deal.businessId,
    address: deal.address,
    lat: deal.lat.toString(),
    lng: deal.lng.toString(),
    terms: deal.terms.join('\n'),
    featured: deal.featured || false,
    active: deal.active,
    paused: deal.paused,
  });

  const discountPrice = form.originalPrice && form.discountPercent
    ? Number(form.originalPrice) * (1 - Number(form.discountPercent) / 100)
    : deal.discountPrice;

  const selectedBiz = businesses.find(b => b.id === form.businessId);
  const categories = ['Gastronomía', 'Belleza', 'Salud', 'Entretenimiento', 'Tecnología', 'Moda', 'Hogar', 'Deportes', 'Educación', 'Viajes'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.originalPrice || !form.discountPercent) {
      addToast('Completá los campos obligatorios', 'error');
      return;
    }
    onSave({
      title: form.title,
      description: form.description,
      details: form.details,
      image: form.image,
      originalPrice: Number(form.originalPrice),
      discountPrice,
      discountPercent: Number(form.discountPercent),
      category: form.category,
      availableQuantity: Number(form.availableQuantity),
      expiresAt: new Date(form.expiresAt).toISOString(),
      businessId: form.businessId,
      businessName: selectedBiz?.name || deal.businessName,
      businessLogo: selectedBiz?.logo || deal.businessLogo,
      address: form.address,
      lat: Number(form.lat),
      lng: Number(form.lng),
      terms: form.terms.split('\n').filter(t => t.trim()),
      featured: form.featured,
      active: form.active,
      paused: form.paused,
    });
    addToast('Oferta actualizada correctamente ✅', 'success');
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-50 animate-fadeIn" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-4 pt-8 pb-8">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg animate-scaleIn" onClick={e => e.stopPropagation()}>
          {/* Header */}
          <div className="sticky top-0 bg-white rounded-t-2xl border-b border-gray-100 p-4 flex items-center justify-between z-10">
            <div className="flex items-center gap-2">
              <div className="bg-blue-100 p-2 rounded-xl">
                <Edit3 size={16} className="text-blue-600" />
              </div>
              <div>
                <h3 className="font-bold text-sm">Editar Oferta</h3>
                <p className="text-[10px] text-gray-400">ID: {deal.id}</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition">
              <X size={18} className="text-gray-400" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-4 space-y-4 max-h-[70vh] overflow-y-auto">
            {/* Image */}
            <ImageUploader
              currentImage={form.image}
              onImageChange={(img) => setForm(prev => ({ ...prev, image: img }))}
            />

            {/* Business */}
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Comercio</label>
              <select value={form.businessId} onChange={e => {
                const biz = businesses.find(b => b.id === e.target.value);
                setForm(prev => ({
                  ...prev,
                  businessId: e.target.value,
                  address: biz?.address || prev.address,
                  lat: biz?.lat.toString() || prev.lat,
                  lng: biz?.lng.toString() || prev.lng,
                }));
              }}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:ring-2 focus:ring-violet-300 focus:outline-none">
                {businesses.map(b => <option key={b.id} value={b.id}>{b.logo} {b.name}</option>)}
              </select>
            </div>

            {/* Title */}
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Título *</label>
              <input type="text" value={form.title} onChange={e => setForm(prev => ({ ...prev, title: e.target.value }))}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-violet-300 focus:outline-none" />
            </div>

            {/* Description */}
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Descripción</label>
              <textarea value={form.description} onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))}
                rows={2}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm resize-none focus:ring-2 focus:ring-violet-300 focus:outline-none" />
            </div>

            {/* Details */}
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Detalles completos</label>
              <textarea value={form.details} onChange={e => setForm(prev => ({ ...prev, details: e.target.value }))}
                rows={3}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm resize-none focus:ring-2 focus:ring-violet-300 focus:outline-none" />
            </div>

            {/* Price & Discount */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">Precio Original ($U)</label>
                <input type="number" value={form.originalPrice}
                  onChange={e => setForm(prev => ({ ...prev, originalPrice: e.target.value }))}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-violet-300 focus:outline-none" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">Descuento (%)</label>
                <input type="number" value={form.discountPercent} min="1" max="99"
                  onChange={e => setForm(prev => ({ ...prev, discountPercent: e.target.value }))}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-violet-300 focus:outline-none" />
              </div>
            </div>

            {discountPrice > 0 && (
              <div className="bg-green-50 rounded-xl p-3 border border-green-200 text-center">
                <p className="text-[10px] text-gray-500">Precio con descuento</p>
                <p className="text-xl font-extrabold text-green-600">{formatPrice(discountPrice)}</p>
              </div>
            )}

            {/* Category & Quantity */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">Categoría</label>
                <select value={form.category} onChange={e => setForm(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:ring-2 focus:ring-violet-300 focus:outline-none">
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">Cantidad disp.</label>
                <input type="number" value={form.availableQuantity}
                  onChange={e => setForm(prev => ({ ...prev, availableQuantity: e.target.value }))}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-violet-300 focus:outline-none" />
              </div>
            </div>

            {/* Expiry */}
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Vencimiento</label>
              <input type="date" value={form.expiresAt}
                onChange={e => setForm(prev => ({ ...prev, expiresAt: e.target.value }))}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-violet-300 focus:outline-none" />
            </div>

            {/* Address */}
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Dirección</label>
              <input type="text" value={form.address}
                onChange={e => setForm(prev => ({ ...prev, address: e.target.value }))}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-violet-300 focus:outline-none" />
            </div>

            {/* Lat/Lng */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-medium text-gray-500 mb-1 block">Latitud</label>
                <input type="text" value={form.lat}
                  onChange={e => setForm(prev => ({ ...prev, lat: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs font-mono focus:ring-2 focus:ring-violet-300 focus:outline-none" />
              </div>
              <div>
                <label className="text-[10px] font-medium text-gray-500 mb-1 block">Longitud</label>
                <input type="text" value={form.lng}
                  onChange={e => setForm(prev => ({ ...prev, lng: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs font-mono focus:ring-2 focus:ring-violet-300 focus:outline-none" />
              </div>
            </div>

            {/* Terms */}
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Términos (uno por línea)</label>
              <textarea value={form.terms} onChange={e => setForm(prev => ({ ...prev, terms: e.target.value }))}
                rows={3}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm resize-none focus:ring-2 focus:ring-violet-300 focus:outline-none" />
            </div>

            {/* Toggles */}
            <div className="space-y-2">
              <label className="flex items-center gap-3 bg-amber-50 rounded-xl p-3 border border-amber-100 cursor-pointer">
                <input type="checkbox" checked={form.featured}
                  onChange={e => setForm(prev => ({ ...prev, featured: e.target.checked }))}
                  className="w-4 h-4 accent-amber-500" />
                <span className="text-sm font-medium text-amber-800">⭐ Destacada</span>
              </label>
              <label className="flex items-center gap-3 bg-green-50 rounded-xl p-3 border border-green-100 cursor-pointer">
                <input type="checkbox" checked={form.active}
                  onChange={e => setForm(prev => ({ ...prev, active: e.target.checked }))}
                  className="w-4 h-4 accent-green-500" />
                <span className="text-sm font-medium text-green-800">✅ Activa</span>
              </label>
              <label className="flex items-center gap-3 bg-gray-50 rounded-xl p-3 border border-gray-100 cursor-pointer">
                <input type="checkbox" checked={form.paused}
                  onChange={e => setForm(prev => ({ ...prev, paused: e.target.checked }))}
                  className="w-4 h-4 accent-gray-500" />
                <span className="text-sm font-medium text-gray-700">⏸ Pausada</span>
              </label>
            </div>

            {/* Canjeados info */}
            <div className="bg-blue-50 rounded-xl p-3 border border-blue-100 text-center">
              <p className="text-[10px] text-gray-500">Cupones canjeados</p>
              <p className="text-lg font-extrabold text-blue-600">{deal.claimedQuantity} / {form.availableQuantity}</p>
            </div>
          </form>

          {/* Footer */}
          <div className="sticky bottom-0 bg-white rounded-b-2xl border-t border-gray-100 p-4 flex gap-3">
            <button onClick={onClose}
              className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl font-medium text-sm hover:bg-gray-200 transition">
              Cancelar
            </button>
            <button onClick={() => { const fakeEvent = { preventDefault: () => {} } as React.FormEvent; handleSubmit(fakeEvent); }}
              className="flex-1 bg-violet-600 text-white py-3 rounded-xl font-bold text-sm hover:bg-violet-700 transition flex items-center justify-center gap-1.5">
              <Save size={14} /> Guardar Cambios
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

// =========================================
// === BUSINESS FORM MODAL (CREATE/EDIT) ===
// =========================================
function BusinessFormModal({ business, onSave, onClose, addToast }: {
  business: Business | null;
  onSave: (data: Partial<Business>) => void;
  onClose: () => void;
  addToast: (msg: string, type: 'success' | 'error' | 'info' | 'warning') => void;
}) {
  const isEditing = !!business;
  const [form, setForm] = useState({
    name: business?.name || '',
    description: business?.description || '',
    logo: business?.logo || '🏪',
    category: business?.category || 'Gastronomía',
    address: business?.address || '',
    lat: business?.lat?.toString() || '-34.9055',
    lng: business?.lng?.toString() || '-56.1645',
    phone: business?.phone || '+598 ',
    rating: business?.rating?.toString() || '4.5',
    reviewCount: business?.reviewCount?.toString() || '0',
    contactName: business?.contactName || '',
    contactEmail: business?.contactEmail || '',
    plan: business?.plan || 'basico' as Business['plan'],
    active: business?.active ?? true,
  });

  // Map
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerInstanceRef = useRef<L.Marker | null>(null);
  const [mapReady, setMapReady] = useState(false);

  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const timer = setTimeout(() => {
      if (!mapContainerRef.current) return;

      const map = L.map(mapContainerRef.current, {
        center: [Number(form.lat) || -34.9055, Number(form.lng) || -56.1645],
        zoom: 14,
        zoomControl: false,
        attributionControl: false,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 }).addTo(map);

      const icon = L.divIcon({
        className: 'biz-marker',
        html: `<div style="font-size:28px;filter:drop-shadow(0 2px 4px rgba(0,0,0,0.3))">${form.logo || '📍'}</div>`,
        iconSize: [36, 36],
        iconAnchor: [18, 18],
      });

      const marker = L.marker([Number(form.lat) || -34.9055, Number(form.lng) || -56.1645], { icon, draggable: true }).addTo(map);
      marker.on('dragend', () => {
        const pos = marker.getLatLng();
        setForm(prev => ({ ...prev, lat: pos.lat.toFixed(6), lng: pos.lng.toFixed(6) }));
      });

      map.on('click', (e: L.LeafletMouseEvent) => {
        marker.setLatLng(e.latlng);
        setForm(prev => ({ ...prev, lat: e.latlng.lat.toFixed(6), lng: e.latlng.lng.toFixed(6) }));
      });

      mapInstanceRef.current = map;
      markerInstanceRef.current = marker;
      setMapReady(true);
    }, 200);

    return () => {
      clearTimeout(timer);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update marker icon when logo changes
  useEffect(() => {
    if (markerInstanceRef.current && mapReady) {
      const icon = L.divIcon({
        className: 'biz-marker',
        html: `<div style="font-size:28px;filter:drop-shadow(0 2px 4px rgba(0,0,0,0.3))">${form.logo || '📍'}</div>`,
        iconSize: [36, 36],
        iconAnchor: [18, 18],
      });
      markerInstanceRef.current.setIcon(icon);
    }
  }, [form.logo, mapReady]);

  const logoOptions = ['🏪', '🥩', '🍔', '🍕', '🍷', '💆', '💇', '💻', '📱', '💪', '🧘', '🎢', '🎮', '👓', '👗', '👟', '🏠', '🛋️', '🎓', '📚', '✈️', '🚗', '💊', '🏥', '🎸', '🎨', '☕', '🍰', '🧀', '🌿'];

  const categories = ['Gastronomía', 'Belleza', 'Salud', 'Entretenimiento', 'Tecnología', 'Moda', 'Hogar', 'Deportes', 'Educación', 'Viajes'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.address || !form.contactName || !form.contactEmail) {
      addToast('Completá nombre, dirección, contacto y email', 'error');
      return;
    }
    onSave({
      name: form.name,
      description: form.description,
      logo: form.logo,
      category: form.category,
      address: form.address,
      lat: Number(form.lat),
      lng: Number(form.lng),
      phone: form.phone,
      rating: Number(form.rating),
      reviewCount: Number(form.reviewCount),
      contactName: form.contactName,
      contactEmail: form.contactEmail,
      plan: form.plan as Business['plan'],
      active: form.active,
    });
    addToast(isEditing ? 'Comercio actualizado ✅' : 'Comercio creado ✅', 'success');
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-50 animate-fadeIn" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-4 pt-6 pb-8">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg animate-scaleIn" onClick={e => e.stopPropagation()}>
          {/* Header */}
          <div className="sticky top-0 bg-white rounded-t-2xl border-b border-gray-100 p-4 flex items-center justify-between z-10">
            <div className="flex items-center gap-2">
              <div className={`p-2 rounded-xl ${isEditing ? 'bg-blue-100' : 'bg-green-100'}`}>
                {isEditing ? <Edit3 size={16} className="text-blue-600" /> : <Plus size={16} className="text-green-600" />}
              </div>
              <div>
                <h3 className="font-bold text-sm">{isEditing ? 'Editar Comercio' : 'Nuevo Comercio'}</h3>
                <p className="text-[10px] text-gray-400">
                  {isEditing ? `Editando: ${business?.name}` : 'Completá los datos del comercio'}
                </p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition">
              <X size={18} className="text-gray-400" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-4 space-y-4 max-h-[70vh] overflow-y-auto">
            {/* Logo selector */}
            <div>
              <label className="text-xs font-medium text-gray-600 mb-2 block">Ícono / Logo</label>
              <div className="flex flex-wrap gap-1.5">
                {logoOptions.map(emoji => (
                  <button key={emoji} type="button"
                    onClick={() => setForm(prev => ({ ...prev, logo: emoji }))}
                    className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg transition-all
                      ${form.logo === emoji
                        ? 'bg-violet-100 border-2 border-violet-400 shadow-md scale-110'
                        : 'bg-gray-50 border border-gray-200 hover:bg-gray-100'}`}>
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            {/* Name */}
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Nombre del Comercio *</label>
              <input type="text" value={form.name} onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Ej: Parrilla El Buen Corte"
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-violet-300 focus:outline-none" />
            </div>

            {/* Description */}
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Descripción</label>
              <textarea value={form.description} onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Breve descripción del negocio..."
                rows={2}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm resize-none focus:ring-2 focus:ring-violet-300 focus:outline-none" />
            </div>

            {/* Category & Plan */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">Categoría</label>
                <select value={form.category} onChange={e => setForm(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:ring-2 focus:ring-violet-300 focus:outline-none">
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">Plan</label>
                <select value={form.plan} onChange={e => setForm(prev => ({ ...prev, plan: e.target.value as Business['plan'] }))}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:ring-2 focus:ring-violet-300 focus:outline-none">
                  <option value="basico">📋 Básico</option>
                  <option value="premium">⭐ Premium</option>
                  <option value="elite">👑 Elite</option>
                </select>
              </div>
            </div>

            {/* Address */}
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block flex items-center gap-1">
                <MapPin size={12} /> Dirección *
              </label>
              <input type="text" value={form.address} onChange={e => setForm(prev => ({ ...prev, address: e.target.value }))}
                placeholder="Ej: Av. 18 de Julio 1234, Centro, Montevideo"
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-violet-300 focus:outline-none" />
            </div>

            {/* Map */}
            <div>
              <label className="text-xs font-medium text-gray-600 mb-2 block">📍 Ubicación en el mapa (tocá o arrastrá el marker)</label>
              <div className="relative rounded-2xl overflow-hidden border-2 border-gray-200" style={{ height: '220px' }}>
                <div ref={mapContainerRef} className="absolute inset-0" />
              </div>
              <div className="mt-2 flex gap-2">
                <div className="flex-1 bg-gray-50 rounded-lg px-3 py-2">
                  <p className="text-[10px] text-gray-400 uppercase font-semibold">Lat</p>
                  <p className="text-xs font-mono font-bold">{Number(form.lat).toFixed(6)}</p>
                </div>
                <div className="flex-1 bg-gray-50 rounded-lg px-3 py-2">
                  <p className="text-[10px] text-gray-400 uppercase font-semibold">Lng</p>
                  <p className="text-xs font-mono font-bold">{Number(form.lng).toFixed(6)}</p>
                </div>
              </div>
            </div>

            {/* Contact info */}
            <div className="border-t border-gray-100 pt-4">
              <h4 className="text-xs font-bold text-gray-700 mb-3 flex items-center gap-1.5">
                <Users size={12} /> Información de Contacto
              </h4>

              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block flex items-center gap-1">
                    <Phone size={11} /> Teléfono
                  </label>
                  <input type="tel" value={form.phone} onChange={e => setForm(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="+598 99 123 456"
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-violet-300 focus:outline-none" />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block flex items-center gap-1">
                    <Users size={11} /> Nombre de Contacto *
                  </label>
                  <input type="text" value={form.contactName} onChange={e => setForm(prev => ({ ...prev, contactName: e.target.value }))}
                    placeholder="Nombre del responsable"
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-violet-300 focus:outline-none" />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block flex items-center gap-1">
                    <Mail size={11} /> Email de Contacto *
                  </label>
                  <input type="email" value={form.contactEmail} onChange={e => setForm(prev => ({ ...prev, contactEmail: e.target.value }))}
                    placeholder="comercio@ejemplo.uy"
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-violet-300 focus:outline-none" />
                </div>
              </div>
            </div>

            {/* Rating (manual for now) */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">⭐ Rating</label>
                <input type="number" step="0.1" min="0" max="5" value={form.rating}
                  onChange={e => setForm(prev => ({ ...prev, rating: e.target.value }))}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-violet-300 focus:outline-none" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block"># Reseñas</label>
                <input type="number" value={form.reviewCount}
                  onChange={e => setForm(prev => ({ ...prev, reviewCount: e.target.value }))}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-violet-300 focus:outline-none" />
              </div>
            </div>

            {/* Active toggle */}
            <label className="flex items-center gap-3 bg-green-50 rounded-xl p-3 border border-green-100 cursor-pointer">
              <input type="checkbox" checked={form.active}
                onChange={e => setForm(prev => ({ ...prev, active: e.target.checked }))}
                className="w-4 h-4 accent-green-500" />
              <div>
                <span className="text-sm font-medium text-green-800">✅ Comercio Activo</span>
                <p className="text-[10px] text-green-600">Sus ofertas se muestran a los usuarios</p>
              </div>
            </label>
          </form>

          {/* Footer */}
          <div className="sticky bottom-0 bg-white rounded-b-2xl border-t border-gray-100 p-4 flex gap-3">
            <button onClick={onClose}
              className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl font-medium text-sm hover:bg-gray-200 transition">
              Cancelar
            </button>
            <button onClick={() => { const fakeEvent = { preventDefault: () => {} } as React.FormEvent; handleSubmit(fakeEvent); }}
              className="flex-1 bg-violet-600 text-white py-3 rounded-xl font-bold text-sm hover:bg-violet-700 transition flex items-center justify-center gap-1.5">
              <Save size={14} /> {isEditing ? 'Guardar Cambios' : 'Crear Comercio'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

// ==============================
// === CREATE DEAL FORM ===
// ==============================
function CreateDealForm({ onSave, addToast, businesses }: {
  onSave: (deal: Omit<Deal, 'id' | 'createdAt' | 'claimedQuantity'>) => void;
  addToast: (msg: string, type: 'success' | 'error' | 'info' | 'warning') => void;
  businesses: { id: string; name: string; logo: string; address: string; lat: number; lng: number }[];
}) {
  const [form, setForm] = useState({
    title: '',
    description: '',
    details: '',
    image: '',
    originalPrice: '',
    discountPercent: '',
    category: 'Gastronomía',
    availableQuantity: '50',
    expiresAt: '',
    businessId: businesses[0]?.id || '',
    terms: '',
    featured: false,
    customAddress: '',
    customLat: '',
    customLng: '',
  });

  const selectedBiz = businesses.find(b => b.id === form.businessId);
  const discountPrice = form.originalPrice && form.discountPercent
    ? Number(form.originalPrice) * (1 - Number(form.discountPercent) / 100)
    : 0;

  // Map state
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [dealLocation, setDealLocation] = useState<[number, number] | null>(null);

  // Travel info
  const travelInfo = userLocation && dealLocation
    ? (() => {
        const dist = calculateDistance(userLocation[0], userLocation[1], dealLocation[0], dealLocation[1]);
        const travel = estimateTravelTime(dist);
        return { distance: dist, travel };
      })()
    : null;

  // Initialize map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [-34.9055, -56.1645],
      zoom: 13,
      zoomControl: false,
      attributionControl: false,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 }).addTo(map);

    map.on('click', (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng;
      setDealLocation([lat, lng]);
      setForm(prev => ({ ...prev, customLat: lat.toFixed(6), customLng: lng.toFixed(6) }));
    });

    mapRef.current = map;
    return () => { map.remove(); mapRef.current = null; };
  }, []);

  // Update marker
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    if (markerRef.current) { markerRef.current.remove(); markerRef.current = null; }

    if (dealLocation) {
      const icon = L.divIcon({
        className: 'deal-location-marker',
        html: `<div style="position:relative;display:flex;flex-direction:column;align-items:center;">
          <div style="background:linear-gradient(135deg,#f97316,#ea580c);width:44px;height:44px;border-radius:50% 50% 50% 4px;display:flex;align-items:center;justify-content:center;border:3px solid white;box-shadow:0 4px 12px rgba(249,115,22,0.4);transform:rotate(-45deg);">
            <span style="transform:rotate(45deg);font-size:18px;">📍</span>
          </div>
        </div>`,
        iconSize: [44, 60],
        iconAnchor: [22, 44],
      });
      markerRef.current = L.marker(dealLocation, { icon }).addTo(map);

      map.eachLayer((layer) => {
        if (layer instanceof L.Polyline && !(layer instanceof L.Polygon)) map.removeLayer(layer);
      });

      if (userLocation) {
        L.polyline([userLocation, dealLocation], { color: '#3b82f6', weight: 2, dashArray: '8, 8', opacity: 0.6 }).addTo(map);
        const group = L.featureGroup([markerRef.current]);
        if (userMarkerRef.current) group.addLayer(userMarkerRef.current);
        map.fitBounds(group.getBounds().pad(0.3), { maxZoom: 15, animate: true });
      } else {
        map.flyTo(dealLocation, 15, { duration: 0.8 });
      }
    }
  }, [dealLocation, userLocation]);

  // User location marker
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    if (userMarkerRef.current) { userMarkerRef.current.remove(); userMarkerRef.current = null; }
    if (userLocation) {
      const icon = L.divIcon({
        className: 'user-loc-marker',
        html: `<div style="position:relative;width:22px;height:22px;">
          <div style="position:absolute;inset:-10px;background:rgba(59,130,246,0.15);border-radius:50%;animation:pulse-ring 2s ease-in-out infinite;"></div>
          <div style="width:22px;height:22px;background:linear-gradient(135deg,#3b82f6,#2563eb);border-radius:50%;border:3px solid white;box-shadow:0 2px 8px rgba(37,99,235,0.5);"></div>
        </div>`,
        iconSize: [22, 22], iconAnchor: [11, 11],
      });
      userMarkerRef.current = L.marker(userLocation, { icon, zIndexOffset: 1000 }).addTo(map);
    }
  }, [userLocation]);

  // When business changes
  useEffect(() => {
    if (selectedBiz && mapRef.current) {
      const loc: [number, number] = [selectedBiz.lat, selectedBiz.lng];
      setDealLocation(loc);
      setForm(prev => ({ ...prev, customAddress: selectedBiz.address, customLat: selectedBiz.lat.toFixed(6), customLng: selectedBiz.lng.toFixed(6) }));
    }
  }, [selectedBiz]);

  const getUserLocation = useCallback(() => {
    if (!navigator.geolocation) { addToast('Tu navegador no soporta geolocalización', 'warning'); return; }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => { setUserLocation([pos.coords.latitude, pos.coords.longitude]); setIsLocating(false); addToast('📍 Ubicación encontrada', 'success'); },
      () => { setIsLocating(false); setUserLocation([-34.9011, -56.1645]); addToast('Usando ubicación aproximada', 'info'); },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  }, [addToast]);

  const resetMapLocation = useCallback(() => {
    if (selectedBiz) {
      const loc: [number, number] = [selectedBiz.lat, selectedBiz.lng];
      setDealLocation(loc);
      setForm(prev => ({ ...prev, customAddress: selectedBiz.address, customLat: selectedBiz.lat.toFixed(6), customLng: selectedBiz.lng.toFixed(6) }));
      mapRef.current?.flyTo(loc, 15, { duration: 0.8 });
    }
  }, [selectedBiz]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.originalPrice || !form.discountPercent || !form.expiresAt || !form.businessId) {
      addToast('Completá todos los campos obligatorios', 'error');
      return;
    }
    if (!form.image) {
      addToast('Agregá una imagen para el cupón', 'error');
      return;
    }

    const finalLat = form.customLat ? Number(form.customLat) : (selectedBiz?.lat || -34.9011);
    const finalLng = form.customLng ? Number(form.customLng) : (selectedBiz?.lng || -56.1645);

    onSave({
      businessId: form.businessId,
      businessName: selectedBiz?.name || 'Comercio',
      businessLogo: selectedBiz?.logo || '🏪',
      title: form.title,
      description: form.description,
      details: form.details,
      image: form.image,
      originalPrice: Number(form.originalPrice),
      discountPrice,
      discountPercent: Number(form.discountPercent),
      category: form.category,
      availableQuantity: Number(form.availableQuantity),
      expiresAt: new Date(form.expiresAt).toISOString(),
      active: true,
      paused: false,
      approvalStatus: 'approved',
      address: form.customAddress || selectedBiz?.address || 'Montevideo, Uruguay',
      lat: finalLat,
      lng: finalLng,
      terms: form.terms.split('\n').filter(t => t.trim()),
      featured: form.featured,
    });
  };

  const categories = ['Gastronomía', 'Belleza', 'Salud', 'Entretenimiento', 'Tecnología', 'Moda', 'Hogar', 'Deportes', 'Educación', 'Viajes'];

  return (
    <form onSubmit={handleSubmit} className="space-y-4 animate-fadeIn pb-8">
      <div className="bg-violet-50 rounded-2xl p-4 border border-violet-100">
        <h3 className="font-bold text-sm text-violet-800 mb-1">➕ Crear Nueva Oferta</h3>
        <p className="text-xs text-violet-600">Completá los datos para publicar una nueva promoción.</p>
      </div>

      {/* Business selector */}
      <div>
        <label className="text-sm font-medium text-gray-700 mb-1 block">Comercio *</label>
        <select value={form.businessId} onChange={e => setForm({ ...form, businessId: e.target.value })}
          className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-violet-300 focus:outline-none bg-white">
          {businesses.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
        </select>
      </div>

      <div>
        <label className="text-sm font-medium text-gray-700 mb-1 block">Título *</label>
        <input type="text" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
          placeholder="Ej: 2x1 en Chivitos"
          className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-violet-300 focus:outline-none" />
      </div>

      <div>
        <label className="text-sm font-medium text-gray-700 mb-1 block">Descripción</label>
        <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
          placeholder="Descripción breve de la oferta..."
          rows={2}
          className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm resize-none focus:ring-2 focus:ring-violet-300 focus:outline-none" />
      </div>

      {/* IMAGE UPLOAD */}
      <ImageUploader
        currentImage={form.image}
        onImageChange={(img) => setForm(prev => ({ ...prev, image: img }))}
      />

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">Precio Original ($U) *</label>
          <input type="number" value={form.originalPrice} onChange={e => setForm({ ...form, originalPrice: e.target.value })}
            placeholder="1200"
            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-violet-300 focus:outline-none" />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">Descuento (%) *</label>
          <input type="number" value={form.discountPercent} onChange={e => setForm({ ...form, discountPercent: e.target.value })}
            placeholder="40" min="1" max="99"
            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-violet-300 focus:outline-none" />
        </div>
      </div>

      {discountPrice > 0 && (
        <div className="bg-green-50 rounded-xl p-3 border border-green-200 text-center">
          <p className="text-xs text-gray-500">Precio con descuento</p>
          <p className="text-2xl font-extrabold text-green-600">{formatPrice(discountPrice)}</p>
          <p className="text-xs text-green-600">El usuario presenta el QR y paga este precio en el local</p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">Categoría</label>
          <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-violet-300 focus:outline-none bg-white">
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">Cantidad</label>
          <input type="number" value={form.availableQuantity} onChange={e => setForm({ ...form, availableQuantity: e.target.value })}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-violet-300 focus:outline-none" />
        </div>
      </div>

      <div>
        <label className="text-sm font-medium text-gray-700 mb-1 block">Fecha de Vencimiento *</label>
        <input type="date" value={form.expiresAt} onChange={e => setForm({ ...form, expiresAt: e.target.value })}
          className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-violet-300 focus:outline-none" />
      </div>

      {/* MAP + LOCATION */}
      <div className="border-t border-gray-100 pt-4">
        <div className="flex items-center gap-2 mb-3">
          <div className="bg-gradient-to-br from-blue-500 to-cyan-500 p-2 rounded-xl">
            <MapPin size={16} className="text-white" />
          </div>
          <div>
            <h3 className="font-bold text-sm">📍 Ubicación del Cupón</h3>
            <p className="text-[11px] text-gray-400">Tocá el mapa para ajustar la ubicación</p>
          </div>
        </div>

        <div className="mb-3">
          <label className="text-xs font-medium text-gray-600 mb-1 block">Dirección</label>
          <input type="text" value={form.customAddress}
            onChange={e => setForm({ ...form, customAddress: e.target.value })}
            placeholder="Ej: Av. 18 de Julio 1234, Centro"
            className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-300 focus:outline-none" />
        </div>

        <div className="relative rounded-2xl overflow-hidden border-2 border-gray-200 shadow-sm" style={{ height: '250px' }}>
          <div ref={mapContainerRef} className="absolute inset-0 z-0" />
          <div className="absolute top-3 right-3 z-[1000] flex flex-col gap-2">
            <button type="button" onClick={getUserLocation} disabled={isLocating}
              className={`w-9 h-9 rounded-xl shadow-lg flex items-center justify-center transition border border-white/50
                ${isLocating ? 'bg-blue-50 text-blue-500 animate-pulse' : userLocation ? 'bg-blue-50 text-blue-600' : 'bg-white text-gray-600 hover:bg-gray-50'}`}>
              <Locate size={16} className={isLocating ? 'animate-spin' : ''} />
            </button>
            <button type="button" onClick={resetMapLocation}
              className="w-9 h-9 bg-white rounded-xl shadow-lg flex items-center justify-center text-gray-600 hover:bg-gray-50 transition border border-white/50">
              <RotateCcw size={16} />
            </button>
          </div>
          {!userLocation && (
            <button type="button" onClick={getUserLocation}
              className="absolute bottom-3 left-3 z-[1000] bg-blue-500 text-white px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-lg hover:bg-blue-600 transition">
              <Navigation size={12} /> Mi ubicación
            </button>
          )}
        </div>

        {dealLocation && (
          <div className="mt-2 flex gap-2">
            <div className="flex-1 bg-gray-50 rounded-lg px-3 py-2">
              <p className="text-[10px] text-gray-400 uppercase font-semibold">Lat</p>
              <p className="text-xs font-mono font-bold">{dealLocation[0].toFixed(6)}</p>
            </div>
            <div className="flex-1 bg-gray-50 rounded-lg px-3 py-2">
              <p className="text-[10px] text-gray-400 uppercase font-semibold">Lng</p>
              <p className="text-xs font-mono font-bold">{dealLocation[1].toFixed(6)}</p>
            </div>
          </div>
        )}
      </div>

      {/* Travel info */}
      {dealLocation && travelInfo && (
        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-4 border border-blue-200">
          <div className="flex items-center gap-2 mb-3">
            <Navigation size={16} className="text-blue-600" />
            <h4 className="font-bold text-sm text-blue-800">📏 Distancia y Tiempo</h4>
          </div>
          <div className="bg-white rounded-xl p-3 mb-3 text-center shadow-sm">
            <p className="text-[11px] text-gray-400">Distancia</p>
            <p className="text-2xl font-extrabold text-blue-600">{formatDistanceText(travelInfo.distance)}</p>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-white rounded-xl p-3 text-center shadow-sm">
              <Footprints size={18} className="mx-auto text-green-600 mb-1" />
              <p className="text-[10px] text-gray-400">Caminando</p>
              <p className="text-sm font-extrabold text-green-700">{travelInfo.travel.walking.time}</p>
            </div>
            <div className="bg-white rounded-xl p-3 text-center shadow-sm">
              <Bike size={18} className="mx-auto text-amber-600 mb-1" />
              <p className="text-[10px] text-gray-400">En bici</p>
              <p className="text-sm font-extrabold text-amber-700">{travelInfo.travel.bike.time}</p>
            </div>
            <div className="bg-white rounded-xl p-3 text-center shadow-sm">
              <Car size={18} className="mx-auto text-blue-600 mb-1" />
              <p className="text-[10px] text-gray-400">En auto</p>
              <p className="text-sm font-extrabold text-blue-700">{travelInfo.travel.driving.time}</p>
            </div>
          </div>
        </div>
      )}

      {/* Google Maps link */}
      {dealLocation && (
        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-4 border border-blue-200">
          <a
            href={`https://www.google.com/maps/dir/?api=1&destination=${dealLocation[0]},${dealLocation[1]}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 text-sm text-blue-700 font-semibold hover:text-blue-800 transition"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
              <Navigation size={18} className="text-blue-600" />
            </div>
            <div>
              <p className="font-bold">📍 Abrir en Google Maps</p>
              <p className="text-[11px] text-blue-500 font-normal">Ver cómo llegar al comercio</p>
            </div>
          </a>
        </div>
      )}

      {!userLocation && dealLocation && (
        <button type="button" onClick={getUserLocation}
          className="w-full bg-blue-50 border-2 border-dashed border-blue-200 rounded-2xl p-4 flex items-center gap-3 hover:bg-blue-100 transition">
          <Navigation size={18} className="text-blue-500" />
          <div className="text-left">
            <p className="font-semibold text-sm text-blue-700">📍 Activá tu ubicación</p>
            <p className="text-xs text-blue-500">Para ver distancia y tiempo de viaje</p>
          </div>
        </button>
      )}

      {/* Terms */}
      <div>
        <label className="text-sm font-medium text-gray-700 mb-1 block">Términos (uno por línea)</label>
        <textarea value={form.terms} onChange={e => setForm({ ...form, terms: e.target.value })}
          placeholder={"Válido de lunes a viernes\nNo acumulable con otras promos\nSujeto a disponibilidad"}
          rows={3}
          className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm resize-none focus:ring-2 focus:ring-violet-300 focus:outline-none" />
      </div>

      <label className="flex items-center gap-3 bg-amber-50 rounded-xl p-3 border border-amber-100 cursor-pointer">
        <input type="checkbox" checked={form.featured} onChange={e => setForm({ ...form, featured: e.target.checked })}
          className="w-4 h-4 accent-amber-500" />
        <div>
          <span className="text-sm font-medium text-amber-800">⭐ Marcar como Destacada</span>
          <p className="text-xs text-amber-600">Aparecerá en el banner principal</p>
        </div>
      </label>

      <button type="submit"
        className="w-full bg-gradient-to-r from-violet-600 to-purple-600 text-white py-3.5 rounded-xl font-bold text-base shadow-lg hover:shadow-xl transition">
        ✅ Publicar Oferta
      </button>
    </form>
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
    approved: '✅ Aprobada',
    pending: '⏳ Pendiente',
    rejected: '❌ Rechazada',
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
              <span className="bg-red-100 text-red-600 text-[10px] px-1.5 py-0.5 rounded-lg font-bold">-{deal.discountPercent}%</span>
            </div>
          </div>
        </div>

        <button onClick={() => setExpanded(!expanded)} className="text-[11px] text-violet-600 font-semibold mt-2 flex items-center gap-1">
          <Eye size={12} /> {expanded ? 'Ocultar' : 'Ver detalles'}
        </button>

        {expanded && (
          <div className="mt-3 p-3 bg-gray-50 rounded-xl text-xs text-gray-600 space-y-2 animate-fadeIn">
            <p>{deal.description}</p>
            <p className="text-[11px] text-gray-400">📍 {deal.address}</p>
            <p className="text-[11px] text-gray-400">📦 {deal.availableQuantity} disponibles</p>
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

function AdminDealRow({ deal, onToggleFeatured, onTogglePause, onDelete, onApprove, onView, onEdit }: {
  deal: Deal; onToggleFeatured: () => void; onTogglePause: () => void; onDelete: () => void; onApprove: () => void; onView: () => void; onEdit: () => void;
}) {
  const [showActions, setShowActions] = useState(false);

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm">
      <div className="flex gap-3 cursor-pointer" onClick={() => setShowActions(!showActions)}>
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
              <span className="text-[10px] bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded-full font-bold">⏸</span>
            )}
          </div>
        </div>
        <div className="text-right flex-shrink-0">
          <p className="text-[10px] text-gray-400">{deal.claimedQuantity}/{deal.availableQuantity}</p>
          <ChevronDown size={14} className={`text-gray-300 transition-transform mx-auto mt-1 ${showActions ? 'rotate-180' : ''}`} />
        </div>
      </div>

      {showActions && (
        <div className="mt-3 pt-3 border-t border-gray-50 flex flex-wrap gap-2 animate-fadeIn">
          <button onClick={onEdit} className="text-[10px] bg-violet-50 text-violet-600 px-3 py-1.5 rounded-lg font-semibold hover:bg-violet-100 transition flex items-center gap-1">
            <Edit3 size={11} /> Editar
          </button>
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
              <button onClick={onTogglePause} className="text-[10px] bg-gray-100 text-gray-600 px-3 py-1.5 rounded-lg font-semibold hover:bg-gray-200 transition flex items-center gap-1">
                {deal.paused ? <><Play size={11} /> Reactivar</> : <><Pause size={11} /> Pausar</>}
              </button>
            </>
          )}
          <button onClick={onDelete} className="text-[10px] bg-red-50 text-red-600 px-3 py-1.5 rounded-lg font-semibold hover:bg-red-100 transition flex items-center gap-1">
            <Trash2 size={11} /> Eliminar
          </button>
        </div>
      )}
    </div>
  );
}
