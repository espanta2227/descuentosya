import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { QrCode, CheckCircle, XCircle, Clock, BarChart3, Scan, ListChecks, AlertTriangle, Camera, Keyboard, ChevronDown, ChevronUp } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { PageContainer } from '../components/Layout';
import { formatPrice } from '../components/DealCard';
import { Coupon } from '../types';

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('es-UY', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

// ============================
// QR SCANNER COMPONENT
// ============================
function QRScanner({ onScan, onClose }: { onScan: (code: string) => void; onClose: () => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [error, setError] = useState('');
  const [scanning, setScanning] = useState(true);
  const scanIntervalRef = useRef<number | null>(null);

  const stopCamera = useCallback(() => {
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    async function startCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
        });
        if (!mounted) { stream.getTracks().forEach(t => t.stop()); return; }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }

        // Try to use BarcodeDetector if available
        if ('BarcodeDetector' in window) {
          // @ts-expect-error BarcodeDetector is not in all TS types
          const detector = new BarcodeDetector({ formats: ['qr_code'] });
          scanIntervalRef.current = window.setInterval(async () => {
            if (!videoRef.current || !scanning) return;
            try {
              const barcodes = await detector.detect(videoRef.current);
              if (barcodes.length > 0) {
                const code = barcodes[0].rawValue;
                if (code && code.startsWith('DESCYA-')) {
                  setScanning(false);
                  stopCamera();
                  onScan(code);
                }
              }
            } catch { /* ignore detection errors */ }
          }, 300);
        }
      } catch (err) {
        if (!mounted) return;
        console.error('Camera error:', err);
        setError('No se pudo acceder a la cámara. Verificá los permisos o usá el ingreso manual.');
      }
    }

    startCamera();

    return () => {
      mounted = false;
      stopCamera();
    };
  }, [scanning, onScan, stopCamera]);

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Header */}
      <div className="bg-black/80 px-4 py-3 flex items-center justify-between z-10">
        <div>
          <h3 className="text-white font-bold text-lg">📷 Escáner QR</h3>
          <p className="text-white/60 text-xs">Apuntá al QR del cliente</p>
        </div>
        <button onClick={() => { stopCamera(); onClose(); }}
          className="bg-white/20 text-white px-4 py-2 rounded-xl text-sm font-medium">
          Cerrar
        </button>
      </div>

      {/* Camera view */}
      <div className="flex-1 relative overflow-hidden">
        {error ? (
          <div className="flex items-center justify-center h-full p-8">
            <div className="bg-red-500/20 border border-red-500/50 rounded-2xl p-6 text-center max-w-sm">
              <AlertTriangle size={48} className="text-red-400 mx-auto mb-3" />
              <p className="text-white font-medium mb-2">Cámara no disponible</p>
              <p className="text-white/70 text-sm mb-4">{error}</p>
              <button onClick={() => { stopCamera(); onClose(); }}
                className="bg-white text-black px-6 py-2.5 rounded-xl font-medium text-sm">
                Usar ingreso manual
              </button>
            </div>
          </div>
        ) : (
          <>
            <video ref={videoRef} autoPlay playsInline muted
              className="w-full h-full object-cover" />
            <canvas ref={canvasRef} className="hidden" />

            {/* Scan overlay */}
            <div className="absolute inset-0 flex items-center justify-center">
              {/* Dark corners */}
              <div className="absolute inset-0 bg-black/50" />

              {/* Clear center square */}
              <div className="relative w-64 h-64 z-10">
                <div className="absolute inset-0 bg-transparent" style={{
                  boxShadow: '0 0 0 9999px rgba(0,0,0,0.5)'
                }} />
                {/* Corner brackets */}
                <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-orange-400 rounded-tl-lg" />
                <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-orange-400 rounded-tr-lg" />
                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-orange-400 rounded-bl-lg" />
                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-orange-400 rounded-br-lg" />

                {/* Scanning line animation */}
                {scanning && (
                  <div className="absolute left-2 right-2 h-0.5 bg-gradient-to-r from-transparent via-orange-400 to-transparent animate-scanLine" />
                )}
              </div>
            </div>

            {/* Bottom hint */}
            <div className="absolute bottom-8 left-0 right-0 text-center z-10">
              <div className="bg-black/60 backdrop-blur-sm mx-auto px-6 py-3 rounded-full inline-flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <span className="text-white text-sm">Buscando código QR...</span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ============================
// VALIDATION RESULT MODAL
// ============================
function ValidationResult({ result, onClose }: {
  result: { success: boolean; coupon?: Coupon; error?: string };
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fadeIn" onClick={onClose}>
      <div className="bg-white w-full max-w-sm rounded-3xl overflow-hidden animate-scaleIn" onClick={e => e.stopPropagation()}>
        {result.success ? (
          <>
            {/* Success */}
            <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-8 text-white text-center">
              <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={48} className="text-white" />
              </div>
              <h2 className="text-2xl font-extrabold">¡Cupón Válido!</h2>
              <p className="text-white/80 mt-1">Cupón verificado correctamente</p>
            </div>
            <div className="p-6">
              {result.coupon && (
                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-3">
                    <img src={result.coupon.deal.image} alt="" className="w-14 h-14 rounded-lg object-cover" />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm line-clamp-1">{result.coupon.deal.title}</p>
                      <p className="text-xs text-gray-500">{result.coupon.deal.businessName}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-green-50 rounded-xl p-3 text-center border border-green-200">
                      <p className="text-xs text-green-600 mb-1">El cliente paga</p>
                      <p className="text-green-700 font-extrabold text-xl">{formatPrice(result.coupon.deal.discountPrice)}</p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-3 text-center border border-gray-200">
                      <p className="text-xs text-gray-500 mb-1">Precio normal</p>
                      <p className="text-gray-400 font-bold text-xl line-through">{formatPrice(result.coupon.deal.originalPrice)}</p>
                    </div>
                  </div>
                  <div className="bg-blue-50 rounded-xl p-3 border border-blue-100">
                    <p className="text-xs text-blue-700 font-medium text-center">
                      💰 Cobrále <strong>{formatPrice(result.coupon.deal.discountPrice)}</strong> al cliente y entregá el producto/servicio
                    </p>
                  </div>
                </div>
              )}
              <button onClick={onClose}
                className="w-full bg-green-500 text-white py-3.5 rounded-xl font-bold text-base hover:bg-green-600 transition">
                Entendido ✓
              </button>
            </div>
          </>
        ) : (
          <>
            {/* Error */}
            <div className="bg-gradient-to-br from-red-500 to-rose-600 p-8 text-white text-center">
              <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <XCircle size={48} className="text-white" />
              </div>
              <h2 className="text-2xl font-extrabold">Cupón Inválido</h2>
              <p className="text-white/80 mt-1">No se puede validar</p>
            </div>
            <div className="p-6">
              <div className="bg-red-50 rounded-xl p-4 mb-4 border border-red-200">
                <p className="text-sm text-red-700 font-medium text-center">{result.error}</p>
              </div>
              {result.coupon && (
                <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-3 mb-4">
                  <img src={result.coupon.deal.image} alt="" className="w-12 h-12 rounded-lg object-cover" />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm line-clamp-1">{result.coupon.deal.title}</p>
                    <p className="text-xs text-gray-500">
                      Estado: <span className="font-medium text-red-500">{result.coupon.status === 'used' ? 'Ya usado' : 'Vencido'}</span>
                    </p>
                  </div>
                </div>
              )}
              <button onClick={onClose}
                className="w-full bg-gray-800 text-white py-3.5 rounded-xl font-bold text-base hover:bg-gray-900 transition">
                Cerrar
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ============================
// MAIN BUSINESS DASHBOARD
// ============================
export default function BusinessDashboard() {
  const navigate = useNavigate();
  const { currentUser, businesses, getBusinessDeals, getBusinessCoupons, getBusinessStats, validateCouponByQR, validateCoupon } = useApp();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'scan' | 'coupons'>('dashboard');
  const [showScanner, setShowScanner] = useState(false);
  const [manualCode, setManualCode] = useState('');
  const [validationResult, setValidationResult] = useState<{ success: boolean; coupon?: Coupon; error?: string } | null>(null);
  const [couponFilter, setCouponFilter] = useState<'all' | 'active' | 'used'>('all');
  const [expandedCoupon, setExpandedCoupon] = useState<string | null>(null);

  if (!currentUser || currentUser.role !== 'business') {
    return (
      <PageContainer className="pt-4">
        <div className="text-center py-16">
          <div className="text-6xl mb-4">🏪</div>
          <h1 className="text-2xl font-extrabold mb-2">Panel de Comercio</h1>
          <p className="text-gray-500 mb-6">Iniciá sesión con tu cuenta de comercio</p>
          <button onClick={() => navigate('/login')}
            className="bg-orange-500 text-white px-8 py-3 rounded-xl font-bold hover:bg-orange-600 transition">
            Iniciar Sesión
          </button>
        </div>
      </PageContainer>
    );
  }

  const business = businesses.find(b => b.id === currentUser.businessId);
  const myDeals = getBusinessDeals();
  const myCoupons = getBusinessCoupons();
  const stats = getBusinessStats();

  const filteredCoupons = couponFilter === 'all' 
    ? myCoupons 
    : myCoupons.filter(c => c.status === couponFilter);

  const handleScanResult = (qrCode: string) => {
    const result = validateCouponByQR(qrCode);
    setValidationResult(result);
    setShowScanner(false);
  };

  const handleManualValidation = () => {
    if (!manualCode.trim()) return;
    // Try as QR code first
    let result = validateCouponByQR(manualCode.trim());
    // If not found, try as coupon ID
    if (!result.success && !result.coupon) {
      const success = validateCoupon(manualCode.trim());
      if (success) {
        result = { success: true };
      }
    }
    setValidationResult(result);
    setManualCode('');
  };

  const tabs = [
    { key: 'dashboard' as const, label: 'Inicio', icon: BarChart3 },
    { key: 'scan' as const, label: 'Escanear QR', icon: Scan },
    { key: 'coupons' as const, label: 'Cupones', icon: ListChecks },
  ];

  return (
    <PageContainer className="pt-4 pb-6">
      {/* Header */}
      <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-5 mb-5 text-white">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center text-3xl">
            {business?.logo || '🏪'}
          </div>
          <div>
            <h1 className="text-xl font-extrabold">{business?.name || 'Mi Comercio'}</h1>
            <p className="text-white/70 text-sm">{business?.address}</p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-white/15 rounded-xl p-2.5 text-center backdrop-blur-sm">
            <p className="text-2xl font-extrabold">{stats.totalClaimed}</p>
            <p className="text-[10px] text-white/70">Canjeados</p>
          </div>
          <div className="bg-white/15 rounded-xl p-2.5 text-center backdrop-blur-sm">
            <p className="text-2xl font-extrabold">{stats.validatedToday}</p>
            <p className="text-[10px] text-white/70">Validados hoy</p>
          </div>
          <div className="bg-white/15 rounded-xl p-2.5 text-center backdrop-blur-sm">
            <p className="text-2xl font-extrabold">{stats.activeCoupons}</p>
            <p className="text-[10px] text-white/70">Pendientes</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-5 bg-gray-100 rounded-xl p-1">
        {tabs.map(tab => {
          const Icon = tab.icon;
          return (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-sm font-medium transition
                ${activeTab === tab.key ? 'bg-white shadow text-emerald-600' : 'text-gray-500'}`}>
              <Icon size={16} />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ===== DASHBOARD TAB ===== */}
      {activeTab === 'dashboard' && (
        <div className="space-y-4 animate-fadeInUp">
          {/* Quick scan button */}
          <button onClick={() => setShowScanner(true)}
            className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white py-5 rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl transition flex items-center justify-center gap-3 active:scale-[0.98]">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <Scan size={28} />
            </div>
            <div className="text-left">
              <p className="text-lg font-extrabold">Escanear QR del Cliente</p>
              <p className="text-white/70 text-sm font-normal">Tocá para abrir la cámara</p>
            </div>
          </button>

          {/* Stats cards */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                  <QrCode size={16} className="text-blue-500" />
                </div>
                <span className="text-xs text-gray-500">Mis Ofertas</span>
              </div>
              <p className="text-3xl font-extrabold text-gray-800">{stats.totalDeals}</p>
              <p className="text-xs text-gray-400 mt-1">activas en la app</p>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center">
                  <CheckCircle size={16} className="text-green-500" />
                </div>
                <span className="text-xs text-gray-500">Facturación</span>
              </div>
              <p className="text-2xl font-extrabold text-gray-800">{formatPrice(stats.revenue)}</p>
              <p className="text-xs text-gray-400 mt-1">validados total</p>
            </div>
          </div>

          {/* My deals */}
          <div>
            <h3 className="font-bold text-gray-800 mb-3">📋 Mis Ofertas Activas</h3>
            {myDeals.length === 0 ? (
              <div className="bg-gray-50 rounded-xl p-6 text-center">
                <p className="text-gray-400">No tenés ofertas activas</p>
                <p className="text-xs text-gray-300 mt-1">El administrador de DescuentosYa publica las ofertas</p>
              </div>
            ) : (
              <div className="space-y-2">
                {myDeals.map(deal => {
                  const pct = deal.availableQuantity > 0 ? Math.round((deal.claimedQuantity / deal.availableQuantity) * 100) : 0;
                  return (
                    <div key={deal.id} className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm">
                      <div className="flex gap-3">
                        <img src={deal.image} alt="" className="w-16 h-16 rounded-lg object-cover" />
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm line-clamp-1">{deal.title}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-orange-600 font-bold text-sm">{formatPrice(deal.discountPrice)}</span>
                            <span className="text-xs text-gray-400 line-through">{formatPrice(deal.originalPrice)}</span>
                          </div>
                          <div className="mt-2">
                            <div className="flex items-center justify-between text-[10px] text-gray-500 mb-0.5">
                              <span>{deal.claimedQuantity} canjeados</span>
                              <span>{deal.availableQuantity - deal.claimedQuantity} disponibles</span>
                            </div>
                            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                              <div className="h-full bg-emerald-400 rounded-full transition-all" style={{ width: `${pct}%` }} />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* How it works */}
          <div className="bg-amber-50 rounded-2xl p-4 border border-amber-200">
            <h3 className="font-bold text-amber-800 mb-3">💡 ¿Cómo funciona?</h3>
            <div className="space-y-2.5">
              {[
                { n: '1', t: 'El cliente te muestra su celular con el QR', d: 'Verás el código en la pantalla del cliente' },
                { n: '2', t: 'Tocá "Escanear QR" y apuntá con la cámara', d: 'O ingresá el código manualmente' },
                { n: '3', t: 'El sistema verifica el cupón', d: 'Te muestra si es válido y cuánto cobra' },
                { n: '4', t: 'Cobrá el precio con descuento y listo', d: 'El cupón queda marcado como usado' },
              ].map(step => (
                <div key={step.n} className="flex gap-3">
                  <div className="w-7 h-7 bg-amber-200 rounded-full flex items-center justify-center text-amber-800 font-bold text-xs flex-shrink-0">
                    {step.n}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-amber-900">{step.t}</p>
                    <p className="text-xs text-amber-600">{step.d}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ===== SCAN TAB ===== */}
      {activeTab === 'scan' && (
        <div className="space-y-4 animate-fadeInUp">
          {/* Camera scan button */}
          <button onClick={() => setShowScanner(true)}
            className="w-full bg-gradient-to-br from-emerald-500 to-teal-600 text-white rounded-2xl p-8 text-center shadow-lg hover:shadow-xl transition active:scale-[0.98]">
            <div className="w-24 h-24 border-4 border-white/30 rounded-2xl flex items-center justify-center mx-auto mb-4 relative">
              <Camera size={40} className="text-white" />
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full animate-pulse" />
            </div>
            <h2 className="text-xl font-extrabold mb-1">Abrir Cámara</h2>
            <p className="text-white/70 text-sm">Apuntá al QR del celular del cliente</p>
          </button>

          {/* Manual code entry */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <Keyboard size={18} className="text-gray-500" />
              <h3 className="font-bold text-gray-800">Ingreso Manual</h3>
            </div>
            <p className="text-xs text-gray-400 mb-3">Si la cámara no funciona, pedile al cliente el código que aparece debajo del QR</p>
            <div className="flex gap-2">
              <input
                type="text"
                value={manualCode}
                onChange={e => setManualCode(e.target.value.toUpperCase())}
                placeholder="Ej: DESCYA-D5-U1-1234..."
                className="flex-1 border border-gray-200 rounded-xl px-4 py-3 text-sm font-mono focus:ring-2 focus:ring-emerald-300 focus:outline-none"
                onKeyDown={e => e.key === 'Enter' && handleManualValidation()}
              />
              <button onClick={handleManualValidation}
                disabled={!manualCode.trim()}
                className="bg-emerald-500 text-white px-5 py-3 rounded-xl font-bold text-sm hover:bg-emerald-600 transition disabled:opacity-50 disabled:cursor-not-allowed">
                Validar
              </button>
            </div>
          </div>

          {/* Recent validations */}
          <div>
            <h3 className="font-bold text-gray-800 mb-3">📋 Últimas Validaciones</h3>
            {myCoupons.filter(c => c.status === 'used').length === 0 ? (
              <div className="bg-gray-50 rounded-xl p-6 text-center">
                <p className="text-2xl mb-2">📭</p>
                <p className="text-gray-400 text-sm">No hay validaciones todavía</p>
              </div>
            ) : (
              <div className="space-y-2">
                {myCoupons.filter(c => c.status === 'used').slice(0, 5).map(coupon => (
                  <div key={coupon.id} className="bg-white rounded-xl border border-gray-100 p-3 flex items-center gap-3 shadow-sm">
                    <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
                      <CheckCircle size={20} className="text-green-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm line-clamp-1">{coupon.deal.title}</p>
                      <p className="text-xs text-gray-400">{coupon.usedAt ? formatDate(coupon.usedAt) : ''}</p>
                    </div>
                    <p className="text-emerald-600 font-bold text-sm">{formatPrice(coupon.deal.discountPrice)}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ===== COUPONS TAB ===== */}
      {activeTab === 'coupons' && (
        <div className="space-y-4 animate-fadeInUp">
          {/* Filter tabs */}
          <div className="flex gap-2 overflow-x-auto pb-1">
            {[
              { key: 'all' as const, label: 'Todos', count: myCoupons.length },
              { key: 'active' as const, label: 'Pendientes', count: myCoupons.filter(c => c.status === 'active').length },
              { key: 'used' as const, label: 'Validados', count: myCoupons.filter(c => c.status === 'used').length },
            ].map(tab => (
              <button key={tab.key} onClick={() => setCouponFilter(tab.key)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition whitespace-nowrap flex items-center gap-1.5 border
                  ${couponFilter === tab.key
                    ? 'bg-emerald-500 text-white border-emerald-500'
                    : 'bg-white text-gray-600 border-gray-200'}`}>
                {tab.label}
                <span className={`text-[11px] px-1.5 py-0.5 rounded-lg ${couponFilter === tab.key ? 'bg-white/25' : 'bg-gray-100'}`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* Coupons list */}
          {filteredCoupons.length === 0 ? (
            <div className="bg-gray-50 rounded-xl p-8 text-center">
              <p className="text-3xl mb-2">📭</p>
              <p className="text-gray-400">No hay cupones {couponFilter !== 'all' ? (couponFilter === 'active' ? 'pendientes' : 'validados') : ''}</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredCoupons.map(coupon => {
                const isExpanded = expandedCoupon === coupon.id;
                return (
                  <div key={coupon.id} className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
                    <button onClick={() => setExpandedCoupon(isExpanded ? null : coupon.id)}
                      className="w-full text-left p-3 flex items-center gap-3">
                      <img src={coupon.deal.image} alt="" className="w-12 h-12 rounded-lg object-cover" />
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm line-clamp-1">{coupon.deal.title}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          {coupon.status === 'active' ? (
                            <span className="text-xs text-green-600 font-medium flex items-center gap-1">
                              <Clock size={11} /> Pendiente
                            </span>
                          ) : (
                            <span className="text-xs text-gray-500 font-medium flex items-center gap-1">
                              <CheckCircle size={11} /> Validado
                            </span>
                          )}
                          <span className="text-orange-600 font-bold text-sm">{formatPrice(coupon.deal.discountPrice)}</span>
                        </div>
                      </div>
                      {isExpanded ? <ChevronUp size={16} className="text-gray-300" /> : <ChevronDown size={16} className="text-gray-300" />}
                    </button>

                    {isExpanded && (
                      <div className="border-t border-gray-100 p-3 bg-gray-50 space-y-2 animate-fadeIn">
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <span className="text-gray-400">Código:</span>
                            <p className="font-mono text-[10px] break-all text-gray-600">{coupon.qrCode}</p>
                          </div>
                          <div>
                            <span className="text-gray-400">Canjeado:</span>
                            <p className="text-gray-600">{formatDate(coupon.claimedAt)}</p>
                          </div>
                          {coupon.usedAt && (
                            <div>
                              <span className="text-gray-400">Validado:</span>
                              <p className="text-gray-600">{formatDate(coupon.usedAt)}</p>
                            </div>
                          )}
                          <div>
                            <span className="text-gray-400">Precio cobrado:</span>
                            <p className="font-bold text-emerald-600">{formatPrice(coupon.deal.discountPrice)}</p>
                          </div>
                        </div>

                        {coupon.status === 'active' && (
                          <button onClick={() => {
                            const result = validateCouponByQR(coupon.qrCode);
                            setValidationResult(result);
                            setExpandedCoupon(null);
                          }}
                            className="w-full bg-emerald-500 text-white py-2.5 rounded-xl font-bold text-sm hover:bg-emerald-600 transition flex items-center justify-center gap-2">
                            <CheckCircle size={16} /> Marcar como Usado
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* QR Scanner Modal */}
      {showScanner && (
        <QRScanner
          onScan={handleScanResult}
          onClose={() => setShowScanner(false)}
        />
      )}

      {/* Validation Result Modal */}
      {validationResult && (
        <ValidationResult
          result={validationResult}
          onClose={() => setValidationResult(null)}
        />
      )}
    </PageContainer>
  );
}
