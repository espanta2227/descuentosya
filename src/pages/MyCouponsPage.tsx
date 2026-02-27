import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { QrCode, CheckCircle, XCircle, Clock, ChevronRight, Download } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useApp } from '../context/AppContext';
import { PageContainer, EmptyState } from '../components/Layout';
import { Coupon, CouponStatus } from '../types';
import { formatPrice } from '../components/DealCard';

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('es-UY', { day: 'numeric', month: 'short', year: 'numeric' });
}

const statusConfig: Record<CouponStatus, { label: string; color: string; icon: typeof CheckCircle; bg: string; border: string }> = {
  active: { label: 'Activo', color: 'text-green-600', icon: CheckCircle, bg: 'bg-green-50', border: 'border-green-200' },
  used: { label: 'Usado', color: 'text-gray-500', icon: XCircle, bg: 'bg-gray-50', border: 'border-gray-200' },
  expired: { label: 'Vencido', color: 'text-red-500', icon: Clock, bg: 'bg-red-50', border: 'border-red-200' },
};

export default function MyCouponsPage() {
  const { currentUser, coupons } = useApp();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<CouponStatus | 'all'>('all');
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);

  if (!currentUser) {
    return (
      <PageContainer className="pt-4">
        <EmptyState icon="🔒" title="Iniciá sesión para ver tus cupones"
          description="Comprá ofertas y gestioná tus cupones"
          action={() => navigate('/login')} actionLabel="Iniciar Sesión" />
      </PageContainer>
    );
  }

  const myCoupons = coupons.filter(c => c.userId === currentUser.id);
  const filtered = activeTab === 'all' ? myCoupons : myCoupons.filter(c => c.status === activeTab);

  const tabs = [
    { key: 'all' as const, label: 'Todos', count: myCoupons.length },
    { key: 'active' as const, label: 'Activos', count: myCoupons.filter(c => c.status === 'active').length },
    { key: 'used' as const, label: 'Usados', count: myCoupons.filter(c => c.status === 'used').length },
    { key: 'expired' as const, label: 'Vencidos', count: myCoupons.filter(c => c.status === 'expired').length },
  ];

  return (
    <PageContainer className="pt-4">
      <h1 className="text-2xl font-extrabold mb-1">🎟️ Mis Cupones</h1>
      <p className="text-sm text-gray-400 mb-4">{myCoupons.length} cupón{myCoupons.length !== 1 ? 'es' : ''} en total</p>

      {/* Tabs */}
      <div className="flex gap-2 mb-5 overflow-x-auto pb-2 scrollbar-hide">
        {tabs.map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2.5 rounded-xl text-sm font-medium transition whitespace-nowrap flex items-center gap-1.5 border
              ${activeTab === tab.key
                ? 'bg-orange-500 text-white shadow-md border-orange-500'
                : 'bg-white text-gray-600 hover:bg-gray-50 border-gray-200'}`}>
            {tab.label}
            <span className={`text-[11px] px-1.5 py-0.5 rounded-lg ${activeTab === tab.key ? 'bg-white/25' : 'bg-gray-100'}`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon="🎫"
          title={`No tenés cupones ${activeTab !== 'all' ? statusConfig[activeTab as CouponStatus].label.toLowerCase() + 's' : ''}`}
          description="Explorá ofertas y comprá tu primer cupón"
          action={() => navigate('/explore')} actionLabel="Explorar Ofertas" />
      ) : (
        <div className="space-y-3">
          {filtered.map((coupon, i) => {
            const config = statusConfig[coupon.status];
            const Icon = config.icon;
            return (
              <button key={coupon.id} onClick={() => setSelectedCoupon(coupon)}
                className={`w-full text-left bg-white rounded-2xl border ${config.border} overflow-hidden card-hover animate-fadeInUp`}
                style={{ animationDelay: `${i * 80}ms`, animationFillMode: 'backwards' }}>
                <div className="flex gap-3 p-4">
                  <img src={coupon.deal.image} alt="" className="w-20 h-20 rounded-xl object-cover flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Icon size={13} className={config.color} />
                      <span className={`text-xs font-semibold ${config.color}`}>{config.label}</span>
                    </div>
                    <h3 className="font-semibold text-sm leading-tight line-clamp-1">{coupon.deal.title}</h3>
                    <p className="text-xs text-gray-400 mt-0.5">{coupon.deal.businessName}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="font-bold text-orange-600">{formatPrice(coupon.deal.discountPrice)}</span>
                      <span className="text-[11px] text-gray-400">{formatDate(coupon.claimedAt)}</span>
                    </div>
                  </div>
                  <ChevronRight size={16} className="text-gray-300 self-center flex-shrink-0" />
                </div>
                {coupon.status === 'active' && (
                  <div className="border-t border-dashed border-green-200 px-4 py-2.5 bg-green-50/50 flex items-center justify-center gap-2 text-green-600 text-xs font-medium">
                    <QrCode size={13} /> Tocar para ver QR y presentar en el local
                  </div>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* QR Modal */}
      {selectedCoupon && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fadeIn" onClick={() => setSelectedCoupon(null)}>
          <div className="bg-white w-full max-w-sm rounded-3xl overflow-hidden animate-scaleIn" onClick={e => e.stopPropagation()}>
            {/* Ticket top */}
            <div className="bg-gradient-to-br from-orange-500 to-amber-500 p-5 text-white text-center relative">
              <div className="absolute -bottom-3 left-6 w-6 h-6 bg-white rounded-full" />
              <div className="absolute -bottom-3 right-6 w-6 h-6 bg-white rounded-full" />
              <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold mb-3 bg-white/20`}>
                {(() => { const I = statusConfig[selectedCoupon.status].icon; return <I size={12} />; })()}
                {statusConfig[selectedCoupon.status].label}
              </div>
              <h2 className="font-bold text-lg leading-tight">{selectedCoupon.deal.title}</h2>
              <p className="text-sm text-white/80 mt-1">{selectedCoupon.deal.businessName}</p>
            </div>

            {/* Ticket body */}
            <div className="p-6 text-center border-t-2 border-dashed border-gray-200">
              {selectedCoupon.status === 'active' ? (
                <div className="mb-4">
                  <div className="bg-white border-2 border-orange-200 rounded-2xl p-5 inline-block shadow-inner">
                    <QRCodeSVG value={selectedCoupon.qrCode} size={180} level="H"
                      fgColor="#1a1a1a"
                      imageSettings={{ src: '', height: 0, width: 0, excavate: false }} />
                  </div>
                </div>
              ) : (
                <div className="bg-gray-100 rounded-2xl p-8 mb-4 inline-block">
                  <p className="text-5xl mb-2">{selectedCoupon.status === 'used' ? '✅' : '⏰'}</p>
                  <p className="text-sm text-gray-500 font-medium">
                    {selectedCoupon.status === 'used' ? `Canjeado el ${formatDate(selectedCoupon.usedAt || '')}` : 'Este cupón ha vencido'}
                  </p>
                </div>
              )}

              <p className="text-xs text-gray-400 font-mono bg-gray-50 px-3 py-2 rounded-lg mb-3 break-all border">
                {selectedCoupon.qrCode}
              </p>

              <div className="bg-orange-50 rounded-xl p-3 mb-4 border border-orange-100">
                <p className="text-xs text-gray-500 mb-1">Pagás en el local:</p>
                <p className="text-orange-700 font-extrabold text-2xl">{formatPrice(selectedCoupon.deal.discountPrice)}</p>
                <p className="text-xs text-orange-500 font-medium">
                  <span className="line-through text-gray-400">{formatPrice(selectedCoupon.deal.originalPrice)}</span>
                  <span className="ml-1.5 text-red-500 font-bold">-{selectedCoupon.deal.discountPercent}% OFF</span>
                </p>
              </div>

              <p className="text-xs text-gray-400 mb-4">
                Canjeado: {formatDate(selectedCoupon.claimedAt)}
              </p>

              {selectedCoupon.status === 'active' && (
                <div className="bg-blue-50 rounded-xl p-3 mb-4 border border-blue-100">
                  <p className="text-xs text-blue-700 font-medium">📱 Mostrá este QR en el comercio y pagás <strong>{formatPrice(selectedCoupon.deal.discountPrice)}</strong> (en vez de {formatPrice(selectedCoupon.deal.originalPrice)})</p>
                </div>
              )}

              <div className="flex gap-2">
                {selectedCoupon.status === 'active' && (
                  <button className="flex-1 bg-orange-500 text-white py-3 rounded-xl font-medium text-sm flex items-center justify-center gap-2 hover:bg-orange-600 transition">
                    <Download size={16} /> Guardar QR
                  </button>
                )}
                <button onClick={() => setSelectedCoupon(null)}
                  className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl font-medium text-sm hover:bg-gray-200 transition">
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </PageContainer>
  );
}
