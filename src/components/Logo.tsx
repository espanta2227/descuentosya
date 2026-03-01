/**
 * ============================================
 * LOGO DE DESCUENTOSYA
 * ============================================
 * 
 * 🔧 CÓMO PONER TU PROPIO LOGO:
 *   1. Poné tu archivo en: public/logo.png
 *   2. Cambiá LOGO_FILE abajo
 *   3. ¡Listo!
 * 
 * 🌐 También podés usar una URL de internet:
 *   const LOGO_FILE = 'https://tu-servidor.com/logo.png'
 * ============================================
 */

// ⬇️ CAMBIÁ ACÁ ⬇️
// Para producción usá: '/logo.png' (archivo local en public/)
// Para demo usamos una URL online:
const LOGO_FILE = 'https://img.icons8.com/3d-fluency/200/discount.png';

import { useState } from 'react';

interface LogoIconProps {
  size?: number;
  className?: string;
}

export function LogoIcon({ size = 40, className = '' }: LogoIconProps) {
  const [imgError, setImgError] = useState(false);

  if (!imgError) {
    return (
      <img
        src={LOGO_FILE}
        alt="DescuentosYa"
        width={size}
        height={size}
        className={`object-contain ${className}`}
        style={{ width: size, height: size }}
        onError={() => setImgError(true)}
      />
    );
  }

  const fontSize = size * 0.45;
  return (
    <div 
      className={`flex items-center justify-center rounded-2xl font-black text-white ${className}`}
      style={{ 
        width: size, 
        height: size, 
        fontSize,
        background: 'linear-gradient(135deg, #f97316 0%, #eab308 100%)',
        fontFamily: "'Fredoka One', 'Poppins', sans-serif",
        lineHeight: 1,
        letterSpacing: '-1px'
      }}
    >
      DY
    </div>
  );
}

interface LogoBrandProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'light' | 'dark';
  showSubtitle?: boolean;
  subtitle?: string;
  className?: string;
}

export function LogoBrand({ 
  size = 'md', 
  variant = 'light', 
  showSubtitle = true,
  subtitle,
  className = '' 
}: LogoBrandProps) {
  const sizes = {
    sm: { icon: 28, title: 'text-sm', sub: 'text-[8px]', gap: 'gap-1.5' },
    md: { icon: 36, title: 'text-lg', sub: 'text-[10px]', gap: 'gap-2' },
    lg: { icon: 48, title: 'text-2xl', sub: 'text-xs', gap: 'gap-3' },
    xl: { icon: 64, title: 'text-4xl', sub: 'text-sm', gap: 'gap-4' },
  };

  const s = sizes[size];
  const textColor = variant === 'light' ? 'text-white' : 'text-gray-800';
  const subColor = variant === 'light' ? 'text-white/70' : 'text-gray-500';

  return (
    <div className={`flex items-center ${s.gap} ${className}`}>
      <div className="flex-shrink-0 drop-shadow-lg">
        <LogoIcon size={s.icon} />
      </div>
      <div className="flex flex-col">
        <span 
          className={`font-brand ${s.title} ${textColor} tracking-wide leading-tight`}
          style={{ fontFamily: "'Fredoka One', 'Poppins', system-ui, sans-serif" }}
        >
          Descuentos<span className="text-yellow-300">Ya</span>
        </span>
        {showSubtitle && (
          <span className={`${s.sub} ${subColor} font-medium tracking-wider uppercase`}>
            {subtitle || 'Cupones Uruguay 🇺🇾'}
          </span>
        )}
      </div>
    </div>
  );
}

export function LogoSplash() {
  return (
    <div className="flex flex-col items-center justify-center animate-fadeIn">
      <div className="animate-float">
        <LogoIcon size={80} />
      </div>
      <h1 
        className="text-white text-3xl mt-4 tracking-wide"
        style={{ fontFamily: "'Fredoka One', 'Poppins', system-ui, sans-serif" }}
      >
        Descuentos<span className="text-yellow-300">Ya</span>
      </h1>
      <p className="text-white/70 text-xs mt-1 tracking-[3px] uppercase font-medium">
        Cupones Uruguay 🇺🇾
      </p>
    </div>
  );
}

export function LogoMenu({ role }: { role?: 'user' | 'admin' | 'business' }) {
  const subtitle = role === 'admin' 
    ? 'Panel Administrador' 
    : role === 'business' 
    ? 'Panel Comercio' 
    : 'Cupones Uruguay 🇺🇾';
  
  return (
    <LogoBrand 
      size="md" 
      variant="light" 
      subtitle={subtitle} 
    />
  );
}
