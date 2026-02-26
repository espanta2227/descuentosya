import { useState, useEffect } from 'react';
import { Download, X, Smartphone, Share, PlusSquare, Check, ExternalLink } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [platform, setPlatform] = useState<'android' | 'ios' | 'desktop'>('desktop');
  const [installing, setInstalling] = useState(false);

  useEffect(() => {
    // Detect platform
    const ua = navigator.userAgent;
    if (/iPhone|iPad|iPod/.test(ua)) {
      setPlatform('ios');
    } else if (/Android/.test(ua)) {
      setPlatform('android');
    } else {
      setPlatform('desktop');
    }

    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    // Listen for install prompt
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      // Show banner after 3 seconds
      setTimeout(() => setShowBanner(true), 3000);
    };

    window.addEventListener('beforeinstallprompt', handler);

    // If on iOS and not installed, show manual instructions after delay
    if (/iPhone|iPad|iPod/.test(ua) && !window.matchMedia('(display-mode: standalone)').matches) {
      setTimeout(() => setShowBanner(true), 5000);
    }

    // Listen for successful install
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setShowBanner(false);
      setDeferredPrompt(null);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      setInstalling(true);
      await deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === 'accepted') {
        setIsInstalled(true);
        setShowBanner(false);
      }
      setInstalling(false);
      setDeferredPrompt(null);
    } else if (platform === 'ios') {
      setShowInstructions(true);
    }
  };

  const dismissed = sessionStorage.getItem('install-dismissed');
  if (isInstalled || dismissed || !showBanner) return null;

  const handleDismiss = () => {
    setShowBanner(false);
    sessionStorage.setItem('install-dismissed', 'true');
  };

  return (
    <>
      {/* Install Banner */}
      <div className="fixed bottom-20 left-2 right-2 z-[200] max-w-lg mx-auto animate-slideUp">
        <div className="bg-gradient-to-r from-orange-500 to-amber-500 rounded-2xl shadow-2xl shadow-orange-500/30 p-4 text-white">
          <button onClick={handleDismiss} className="absolute top-2 right-2 p-1.5 text-white/60 hover:text-white transition">
            <X size={16} />
          </button>
          
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0 backdrop-blur-sm border border-white/20">
              🏷️
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-extrabold text-base leading-tight">
                Instalá DescuentosYa
              </h3>
              <p className="text-white/80 text-xs mt-0.5 leading-snug">
                {platform === 'ios' 
                  ? 'Agregala a tu pantalla de inicio para acceso rápido'
                  : 'Instalá la app en tu celular — es gratis y rápido'
                }
              </p>
            </div>
          </div>
          
          <div className="flex gap-2 mt-3">
            <button
              onClick={handleInstall}
              disabled={installing}
              className="flex-1 bg-white text-orange-600 font-bold py-2.5 px-4 rounded-xl text-sm flex items-center justify-center gap-2 hover:bg-orange-50 transition active:scale-[0.97] disabled:opacity-70 shadow-lg"
            >
              {installing ? (
                <>
                  <div className="w-4 h-4 border-2 border-orange-300 border-t-orange-600 rounded-full animate-spin" />
                  Instalando...
                </>
              ) : (
                <>
                  <Download size={16} />
                  {platform === 'ios' ? 'Cómo instalar' : 'Instalar App'}
                </>
              )}
            </button>
            <button
              onClick={handleDismiss}
              className="px-4 py-2.5 bg-white/15 text-white rounded-xl text-sm font-medium hover:bg-white/25 transition border border-white/20"
            >
              Ahora no
            </button>
          </div>

          {/* Benefits */}
          <div className="flex items-center gap-4 mt-3 pt-3 border-t border-white/20">
            <span className="flex items-center gap-1 text-[10px] text-white/70">
              <Smartphone size={10} /> Sin tienda de apps
            </span>
            <span className="flex items-center gap-1 text-[10px] text-white/70">
              <Check size={10} /> Funciona offline
            </span>
            <span className="flex items-center gap-1 text-[10px] text-white/70">
              <Check size={10} /> Notificaciones
            </span>
          </div>
        </div>
      </div>

      {/* iOS Instructions Modal */}
      {showInstructions && (
        <>
          <div className="fixed inset-0 bg-black/60 z-[300] animate-fadeIn" onClick={() => setShowInstructions(false)} />
          <div className="fixed bottom-0 left-0 right-0 z-[301] max-w-lg mx-auto animate-slideUp">
            <div className="bg-white rounded-t-3xl shadow-2xl p-6">
              <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-4" />
              
              <h3 className="text-lg font-extrabold text-gray-800 text-center mb-1">
                Instalar en iPhone
              </h3>
              <p className="text-gray-400 text-sm text-center mb-6">
                Seguí estos 3 pasos simples
              </p>

              <div className="space-y-5">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Share size={20} className="text-blue-500" />
                  </div>
                  <div>
                    <p className="font-bold text-sm text-gray-800">1. Tocá el botón Compartir</p>
                    <p className="text-gray-400 text-xs mt-0.5">
                      En la barra inferior de Safari, tocá el ícono de compartir{' '}
                      <Share size={12} className="inline text-blue-500" />
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <PlusSquare size={20} className="text-green-500" />
                  </div>
                  <div>
                    <p className="font-bold text-sm text-gray-800">2. "Agregar a pantalla de inicio"</p>
                    <p className="text-gray-400 text-xs mt-0.5">
                      Desplazate hacia abajo y elegí la opción "Agregar a pantalla de inicio"
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Check size={20} className="text-orange-500" />
                  </div>
                  <div>
                    <p className="font-bold text-sm text-gray-800">3. Tocá "Agregar"</p>
                    <p className="text-gray-400 text-xs mt-0.5">
                      Confirmá y ¡listo! La app aparece en tu pantalla de inicio como cualquier app nativa
                    </p>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setShowInstructions(false)}
                className="w-full bg-gradient-to-r from-orange-500 to-amber-500 text-white py-3.5 rounded-2xl font-bold text-sm mt-6 hover:shadow-lg transition active:scale-[0.98]"
              >
                ¡Entendido!
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
}

// Separate component: button to add to deploy guide page
export function DeployGuideButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 hover:from-green-100 hover:to-emerald-100 transition text-sm font-medium border border-green-200"
    >
      <ExternalLink size={18} />
      <div className="text-left">
        <span className="font-bold block">Guía de Despliegue</span>
        <span className="text-[11px] text-green-500">Cómo hacer tu app real paso a paso</span>
      </div>
    </button>
  );
}
