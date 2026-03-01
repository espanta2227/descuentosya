/**
 * ============================================
 * LOGO DE DESCUENTOSYA
 * ============================================
 * 
 * 🔧 PARA PRODUCCIÓN:
 *   1. Poné tu logo en: public/logo.png
 *   2. Cambiá USE_CUSTOM_LOGO a true
 *   3. ¡Listo!
 * ============================================
 */

// ✅ ACTIVADO — Busca /logo.png en public/
// Si no lo encuentra, muestra el logo SVG de respaldo
const USE_CUSTOM_LOGO = true;
const CUSTOM_LOGO_FILE = '/logo.png';

import { useState } from 'react';

// Logo SVG profesional integrado (no necesita archivo externo)
function LogoSVG({ size = 40 }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f97316" />
          <stop offset="50%" stopColor="#fb923c" />
          <stop offset="100%" stopColor="#eab308" />
        </linearGradient>
        <linearGradient id="tagGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#fef3c7" />
        </linearGradient>
        <filter id="shadow1" x="-10%" y="-10%" width="120%" height="130%">
          <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#00000033" />
        </filter>
      </defs>
      
      {/* Fondo redondeado */}
      <rect x="4" y="4" width="92" height="92" rx="22" fill="url(#bgGrad)" />
      
      {/* Brillo superior */}
      <rect x="4" y="4" width="92" height="46" rx="22" fill="white" opacity="0.15" />
      
      {/* Tag de precio / cupón */}
      <g filter="url(#shadow1)" transform="translate(50, 50) rotate(-15) translate(-50, -50)">
        {/* Cuerpo del tag */}
        <path d="M25 32 L60 25 C63 24.5 66 26 67 29 L78 65 C79 68 77.5 71 74.5 72 L45 79 C42 80 39 78.5 38 75.5 L25 38 C24 35 24 33 25 32 Z" 
              fill="url(#tagGrad)" stroke="#f97316" strokeWidth="1.5" />
        
        {/* Agujero del tag */}
        <circle cx="37" cy="39" r="4.5" fill="#f97316" opacity="0.7" />
        <circle cx="37" cy="39" r="2.5" fill="white" />
        
        {/* Línea de corte (descuento) */}
        <line x1="40" y1="52" x2="68" y2="45" stroke="#f97316" strokeWidth="1.5" strokeDasharray="3 2" opacity="0.5" />
      </g>
      
      {/* Símbolo de porcentaje */}
      <g transform="translate(50, 52)">
        <text x="0" y="0" textAnchor="middle" dominantBaseline="central" 
              fill="white" fontSize="28" fontWeight="900" fontFamily="'Fredoka One', Arial, sans-serif"
              style={{ textShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>
          %
        </text>
      </g>
      
      {/* Estrellitas decorativas */}
      <circle cx="78" cy="22" r="3" fill="white" opacity="0.8" />
      <circle cx="85" cy="30" r="1.5" fill="white" opacity="0.6" />
      <circle cx="20" cy="75" r="2" fill="white" opacity="0.5" />
      <circle cx="72" cy="15" r="1.5" fill="white" opacity="0.4" />
      
      {/* Destello */}
      <path d="M82 18 L84 14 L86 18 L90 20 L86 22 L84 26 L82 22 L78 20 Z" fill="white" opacity="0.7" />
    </svg>
  );
}

interface LogoIconProps {
  size?: number;
  className?: string;
}

export function LogoIcon({ size = 40, className = '' }: LogoIconProps) {
  const [imgError, setImgError] = useState(false);

  if (USE_CUSTOM_LOGO && !imgError) {
    return (
      <img
        src={CUSTOM_LOGO_FILE}
        alt="DescuentosYa"
        width={size}
        height={size}
        className={`object-contain ${className}`}
        style={{ width: size, height: size }}
        onError={() => setImgError(true)}
      />
    );
  }

  return <LogoSVG size={size} />;
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
  const yaColor = variant === 'light' ? 'text-yellow-300' : 'text-orange-500';

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
          Descuentos<span className={yaColor}>Ya</span>
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
        <LogoIcon size={90} />
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
