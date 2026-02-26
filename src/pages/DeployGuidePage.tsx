import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ChevronDown, ChevronUp, ExternalLink, Check, Copy, Terminal, Globe, Database, Smartphone, Shield, CreditCard, Rocket, Server, Clock } from 'lucide-react';

interface StepProps {
  number: number;
  title: string;
  time: string;
  difficulty: 'fácil' | 'medio' | 'avanzado';
  icon: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

function Step({ number, title, time, difficulty, icon, children, defaultOpen = false }: StepProps) {
  const [open, setOpen] = useState(defaultOpen);
  const diffColors = {
    'fácil': 'bg-green-100 text-green-700',
    'medio': 'bg-amber-100 text-amber-700',
    'avanzado': 'bg-red-100 text-red-700',
  };

  return (
    <div className={`bg-white rounded-2xl border transition-all duration-300 ${open ? 'border-orange-200 shadow-lg shadow-orange-100/50' : 'border-gray-100 shadow-sm'}`}>
      <button onClick={() => setOpen(!open)} className="w-full p-4 flex items-center gap-3 text-left">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${open ? 'bg-gradient-to-br from-orange-500 to-amber-500 text-white' : 'bg-gray-100 text-gray-400'} transition-colors`}>
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-[10px] font-bold text-gray-300">PASO {number}</span>
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${diffColors[difficulty]}`}>
              {difficulty}
            </span>
            <span className="text-[10px] text-gray-300 flex items-center gap-0.5 ml-auto">
              <Clock size={9} /> {time}
            </span>
          </div>
          <h3 className="font-bold text-sm text-gray-800">{title}</h3>
        </div>
        {open ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
      </button>
      {open && (
        <div className="px-4 pb-4 animate-fadeIn">
          <div className="border-t border-gray-100 pt-4">
            {children}
          </div>
        </div>
      )}
    </div>
  );
}

function CodeBlock({ code, label }: { code: string; label?: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="my-3">
      {label && <p className="text-[10px] text-gray-400 font-semibold mb-1 uppercase tracking-wider">{label}</p>}
      <div className="bg-gray-900 rounded-xl p-3 relative group">
        <pre className="text-green-400 text-xs font-mono overflow-x-auto whitespace-pre-wrap leading-relaxed">
          {code}
        </pre>
        <button
          onClick={handleCopy}
          className="absolute top-2 right-2 p-1.5 rounded-lg bg-gray-700 text-gray-300 hover:bg-gray-600 transition opacity-0 group-hover:opacity-100"
          title="Copiar"
        >
          {copied ? <Check size={12} className="text-green-400" /> : <Copy size={12} />}
        </button>
      </div>
    </div>
  );
}

function Tip({ children, type = 'info' }: { children: React.ReactNode; type?: 'info' | 'warning' | 'success' }) {
  const styles = {
    info: 'bg-blue-50 border-blue-200 text-blue-800',
    warning: 'bg-amber-50 border-amber-200 text-amber-800',
    success: 'bg-green-50 border-green-200 text-green-800',
  };
  const icons = { info: '💡', warning: '⚠️', success: '✅' };

  return (
    <div className={`rounded-xl p-3 border text-xs leading-relaxed mt-3 ${styles[type]}`}>
      <span className="mr-1">{icons[type]}</span> {children}
    </div>
  );
}

export default function DeployGuidePage() {
  const navigate = useNavigate();

  return (
    <div className="max-w-lg mx-auto pb-28">
      {/* Header */}
      <div className="bg-gradient-to-br from-green-600 via-emerald-600 to-teal-600 text-white px-4 py-6">
        <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-white/70 hover:text-white transition mb-4 text-sm">
          <ArrowLeft size={16} /> Volver
        </button>
        <div className="flex items-center gap-3 mb-3">
          <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center text-3xl backdrop-blur-sm border border-white/20">
            🚀
          </div>
          <div>
            <h1 className="text-2xl font-extrabold">Guía de Despliegue</h1>
            <p className="text-white/70 text-sm">Paso a paso para hacer tu app real</p>
          </div>
        </div>
        
        {/* Progress overview */}
        <div className="grid grid-cols-3 gap-2 mt-4">
          <div className="bg-white/15 rounded-xl p-2.5 text-center backdrop-blur-sm">
            <p className="text-xl font-bold">7</p>
            <p className="text-[10px] text-white/70">Pasos</p>
          </div>
          <div className="bg-white/15 rounded-xl p-2.5 text-center backdrop-blur-sm">
            <p className="text-xl font-bold">~2h</p>
            <p className="text-[10px] text-white/70">Tiempo total</p>
          </div>
          <div className="bg-white/15 rounded-xl p-2.5 text-center backdrop-blur-sm">
            <p className="text-xl font-bold">$0</p>
            <p className="text-[10px] text-white/70">Costo inicial</p>
          </div>
        </div>
      </div>

      <div className="px-4 py-4 space-y-3">
        {/* Intro */}
        <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-2xl p-4 border border-orange-100">
          <h3 className="font-bold text-sm text-gray-800 mb-2">🎯 ¿Qué vas a lograr?</h3>
          <ul className="space-y-1.5 text-xs text-gray-600">
            <li className="flex items-start gap-2"><Check size={14} className="text-green-500 flex-shrink-0 mt-0.5" /> App instalable en cualquier celular Android/iPhone</li>
            <li className="flex items-start gap-2"><Check size={14} className="text-green-500 flex-shrink-0 mt-0.5" /> URL pública que podés compartir por WhatsApp</li>
            <li className="flex items-start gap-2"><Check size={14} className="text-green-500 flex-shrink-0 mt-0.5" /> Base de datos real con usuarios y comercios</li>
            <li className="flex items-start gap-2"><Check size={14} className="text-green-500 flex-shrink-0 mt-0.5" /> SSL/HTTPS automático (gratis)</li>
            <li className="flex items-start gap-2"><Check size={14} className="text-green-500 flex-shrink-0 mt-0.5" /> Dominio personalizado (ej: descuentosya.com.uy)</li>
          </ul>
        </div>

        {/* PASO 1 */}
        <Step number={1} title="Crear cuenta en GitHub" time="5 min" difficulty="fácil" icon={<Globe size={18} />} defaultOpen={true}>
          <p className="text-xs text-gray-600 leading-relaxed mb-3">
            GitHub es donde vas a guardar el código. Es como Google Drive pero para código.
          </p>
          <ol className="space-y-2 text-xs text-gray-600">
            <li className="flex items-start gap-2">
              <span className="bg-orange-100 text-orange-600 font-bold text-[10px] w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">1</span>
              <span>Entrá a <a href="https://github.com" target="_blank" rel="noopener" className="text-orange-600 font-semibold underline inline-flex items-center gap-0.5">github.com <ExternalLink size={10} /></a> y creá una cuenta gratis</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="bg-orange-100 text-orange-600 font-bold text-[10px] w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">2</span>
              <span>Hacé click en <strong>"New Repository"</strong> (botón verde con +)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="bg-orange-100 text-orange-600 font-bold text-[10px] w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">3</span>
              <span>Nombralo <strong>"descuentosya"</strong>, dejá público, y dale a Create</span>
            </li>
          </ol>
          <Tip>
            Si nunca usaste Git, instalá <a href="https://desktop.github.com" target="_blank" rel="noopener" className="underline font-semibold">GitHub Desktop</a> — es visual y muy fácil de usar.
          </Tip>
        </Step>

        {/* PASO 2 */}
        <Step number={2} title="Subir el código a GitHub" time="10 min" difficulty="fácil" icon={<Terminal size={18} />}>
          <p className="text-xs text-gray-600 leading-relaxed mb-3">
            Descargá el código de tu app y subilo al repositorio que creaste.
          </p>
          
          <p className="text-xs text-gray-600 font-semibold mb-1">Opción A: Con GitHub Desktop (más fácil)</p>
          <ol className="space-y-1.5 text-xs text-gray-600 mb-4">
            <li>1. Abrí GitHub Desktop → File → Clone Repository → elegí "descuentosya"</li>
            <li>2. Copiá todos los archivos del proyecto a esa carpeta</li>
            <li>3. En GitHub Desktop aparecen los cambios → escribí "Initial commit" → "Commit to main"</li>
            <li>4. Hacé click en "Push origin"</li>
          </ol>

          <p className="text-xs text-gray-600 font-semibold mb-1">Opción B: Con terminal</p>
          <CodeBlock label="Ejecutá en la terminal" code={`cd descuentosya
git init
git add .
git commit -m "🚀 DescuentosYa - versión inicial"
git branch -M main
git remote add origin https://github.com/TU-USUARIO/descuentosya.git
git push -u origin main`} />
          <Tip type="warning">
            Reemplazá <strong>TU-USUARIO</strong> por tu nombre de usuario de GitHub.
          </Tip>
        </Step>

        {/* PASO 3 */}
        <Step number={3} title="Publicar en Vercel (tu URL pública)" time="10 min" difficulty="fácil" icon={<Rocket size={18} />}>
          <p className="text-xs text-gray-600 leading-relaxed mb-3">
            Vercel es el servicio que va a publicar tu app en Internet. Es <strong>gratis</strong> y automático.
          </p>
          <ol className="space-y-2 text-xs text-gray-600">
            <li className="flex items-start gap-2">
              <span className="bg-orange-100 text-orange-600 font-bold text-[10px] w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">1</span>
              <span>Entrá a <a href="https://vercel.com" target="_blank" rel="noopener" className="text-orange-600 font-semibold underline inline-flex items-center gap-0.5">vercel.com <ExternalLink size={10} /></a> y hacé click en <strong>"Sign up"</strong></span>
            </li>
            <li className="flex items-start gap-2">
              <span className="bg-orange-100 text-orange-600 font-bold text-[10px] w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">2</span>
              <span>Elegí <strong>"Continue with GitHub"</strong> (usá la cuenta que creaste)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="bg-orange-100 text-orange-600 font-bold text-[10px] w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">3</span>
              <span>Hacé click en <strong>"Add New" → "Project"</strong></span>
            </li>
            <li className="flex items-start gap-2">
              <span className="bg-orange-100 text-orange-600 font-bold text-[10px] w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">4</span>
              <span>Seleccioná tu repositorio <strong>"descuentosya"</strong></span>
            </li>
            <li className="flex items-start gap-2">
              <span className="bg-orange-100 text-orange-600 font-bold text-[10px] w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">5</span>
              <span>Hacé click en <strong>"Deploy"</strong> y esperá ~1 minuto</span>
            </li>
          </ol>

          <Tip type="success">
            ¡Listo! Tu app estará en <strong>https://descuentosya.vercel.app</strong>. 
            Podés compartir ese link por WhatsApp y cualquiera puede instalarla.
          </Tip>

          <div className="bg-gray-50 rounded-xl p-3 mt-3">
            <p className="text-[11px] font-bold text-gray-600 mb-1">🔄 Actualización automática</p>
            <p className="text-[11px] text-gray-500">
              Cada vez que subas cambios a GitHub, Vercel actualiza la app automáticamente en ~30 segundos.
            </p>
          </div>
        </Step>

        {/* PASO 4 */}
        <Step number={4} title="Instalar en el celular como App" time="2 min" difficulty="fácil" icon={<Smartphone size={18} />}>
          <p className="text-xs text-gray-600 leading-relaxed mb-3">
            Una vez publicada, la app se puede instalar directamente desde el navegador.
          </p>
          
          <div className="space-y-4">
            <div>
              <h4 className="font-bold text-xs text-gray-700 flex items-center gap-1.5 mb-2">
                <span className="text-lg">🤖</span> En Android (Chrome)
              </h4>
              <ol className="space-y-1 text-xs text-gray-600 pl-7">
                <li>1. Abrí Chrome y entrá a tu URL (ej: descuentosya.vercel.app)</li>
                <li>2. Esperá unos segundos — aparece un banner <strong>"Instalar DescuentosYa"</strong></li>
                <li>3. Tocá <strong>"Instalar"</strong></li>
                <li>4. ¡Listo! Aparece el ícono en tu pantalla de inicio</li>
              </ol>
              <Tip>
                Si no aparece el banner, tocá los 3 puntitos ⋮ arriba a la derecha → "Instalar app" o "Agregar a pantalla de inicio".
              </Tip>
            </div>

            <div>
              <h4 className="font-bold text-xs text-gray-700 flex items-center gap-1.5 mb-2">
                <span className="text-lg">🍎</span> En iPhone (Safari)
              </h4>
              <ol className="space-y-1 text-xs text-gray-600 pl-7">
                <li>1. Abrí <strong>Safari</strong> (obligatorio, no funciona con Chrome)</li>
                <li>2. Entrá a tu URL</li>
                <li>3. Tocá el ícono de <strong>Compartir</strong> (cuadrado con flecha)</li>
                <li>4. Bajá y tocá <strong>"Agregar a pantalla de inicio"</strong></li>
                <li>5. Tocá <strong>"Agregar"</strong></li>
              </ol>
            </div>
          </div>

          <Tip type="success">
            La app funciona como nativa: pantalla completa, sin barra de navegador, 
            con ícono propio. Los usuarios no notan la diferencia con una app de la Play Store.
          </Tip>
        </Step>

        {/* PASO 5 */}
        <Step number={5} title="Agregar base de datos real (Supabase)" time="30 min" difficulty="medio" icon={<Database size={18} />}>
          <p className="text-xs text-gray-600 leading-relaxed mb-3">
            Ahora mismo los datos son mock (falsos). Para que sean reales necesitás una base de datos. 
            <strong> Supabase</strong> es gratis y tiene todo lo que necesitás.
          </p>

          <ol className="space-y-2 text-xs text-gray-600">
            <li className="flex items-start gap-2">
              <span className="bg-orange-100 text-orange-600 font-bold text-[10px] w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">1</span>
              <span>Entrá a <a href="https://supabase.com" target="_blank" rel="noopener" className="text-orange-600 font-semibold underline inline-flex items-center gap-0.5">supabase.com <ExternalLink size={10} /></a> → "Start your project" → Login con GitHub</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="bg-orange-100 text-orange-600 font-bold text-[10px] w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">2</span>
              <span>Creá un nuevo proyecto: nombralo <strong>"descuentosya"</strong>, elegí región <strong>South America (São Paulo)</strong></span>
            </li>
            <li className="flex items-start gap-2">
              <span className="bg-orange-100 text-orange-600 font-bold text-[10px] w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">3</span>
              <span>Andá a <strong>SQL Editor</strong> y ejecutá este script para crear las tablas:</span>
            </li>
          </ol>

          <CodeBlock label="Script SQL — copiá y pegá en Supabase" code={`-- Usuarios
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user','business','admin')),
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Comercios
CREATE TABLE businesses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  address TEXT,
  phone TEXT,
  rut TEXT, -- RUT uruguayo
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  logo_url TEXT,
  verified BOOLEAN DEFAULT FALSE,
  approval_status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Deals / Ofertas
CREATE TABLE deals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID REFERENCES businesses(id),
  title TEXT NOT NULL,
  description TEXT,
  category TEXT,
  image_url TEXT,
  original_price INTEGER NOT NULL,
  discount_price INTEGER NOT NULL,
  discount_percent INTEGER,
  available_quantity INTEGER DEFAULT 100,
  sold_quantity INTEGER DEFAULT 0,
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  address TEXT,
  expires_at TIMESTAMPTZ,
  active BOOLEAN DEFAULT TRUE,
  featured BOOLEAN DEFAULT FALSE,
  paused BOOLEAN DEFAULT FALSE,
  approval_status TEXT DEFAULT 'pending',
  terms TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Cupones comprados
CREATE TABLE coupons (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  deal_id UUID REFERENCES deals(id),
  user_id UUID REFERENCES users(id),
  qr_code TEXT UNIQUE NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active','used','expired')),
  purchased_at TIMESTAMPTZ DEFAULT NOW(),
  used_at TIMESTAMPTZ
);

-- Reseñas
CREATE TABLE reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  deal_id UUID REFERENCES deals(id),
  user_id UUID REFERENCES users(id),
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Favoritos
CREATE TABLE favorites (
  user_id UUID REFERENCES users(id),
  deal_id UUID REFERENCES deals(id),
  PRIMARY KEY (user_id, deal_id)
);

-- Notificaciones
CREATE TABLE notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  title TEXT,
  message TEXT,
  type TEXT DEFAULT 'info',
  read BOOLEAN DEFAULT FALSE,
  deal_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habilitar Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Políticas básicas (ajustar según necesidad)
CREATE POLICY "Deals visibles para todos"
  ON deals FOR SELECT USING (
    approval_status = 'approved' AND active = TRUE
  );
  
CREATE POLICY "Users can read own data"
  ON users FOR SELECT USING (auth.uid() = id);
  
CREATE POLICY "Users can read own coupons"
  ON coupons FOR SELECT USING (auth.uid() = user_id);`} />

          <Tip>
            Supabase gratis incluye: 500MB de base de datos, autenticación, 
            API REST automática, y 50,000 requests/mes. Más que suficiente para empezar.
          </Tip>

          <div className="bg-gray-50 rounded-xl p-3 mt-3">
            <p className="text-[11px] font-bold text-gray-600 mb-1">📋 Después de crear las tablas:</p>
            <p className="text-[11px] text-gray-500">
              Andá a <strong>Settings → API</strong> y copiá la <strong>URL</strong> y la <strong>anon key</strong>. 
              Las vas a necesitar para conectar tu app.
            </p>
          </div>
        </Step>

        {/* PASO 6 */}
        <Step number={6} title="Agregar pagos reales (MercadoPago)" time="45 min" difficulty="avanzado" icon={<CreditCard size={18} />}>
          <p className="text-xs text-gray-600 leading-relaxed mb-3">
            Para cobrar de verdad por los cupones, MercadoPago es la mejor opción en Uruguay.
          </p>

          <ol className="space-y-2 text-xs text-gray-600">
            <li className="flex items-start gap-2">
              <span className="bg-orange-100 text-orange-600 font-bold text-[10px] w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">1</span>
              <span>Entrá a <a href="https://www.mercadopago.com.uy/developers" target="_blank" rel="noopener" className="text-orange-600 font-semibold underline inline-flex items-center gap-0.5">Developers MercadoPago <ExternalLink size={10} /></a></span>
            </li>
            <li className="flex items-start gap-2">
              <span className="bg-orange-100 text-orange-600 font-bold text-[10px] w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">2</span>
              <span>Creá una aplicación → obtenés tus credenciales (Access Token)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="bg-orange-100 text-orange-600 font-bold text-[10px] w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">3</span>
              <span>Usá <strong>Checkout Pro</strong> — el usuario paga en la página de MercadoPago y vuelve a tu app</span>
            </li>
          </ol>

          <CodeBlock label="Ejemplo: crear preferencia de pago" code={`// En tu backend (Supabase Edge Function)
import MercadoPago from 'mercadopago';

const client = new MercadoPago({ 
  accessToken: 'TU_ACCESS_TOKEN' 
});

// Crear preferencia de pago
const preference = await client.preferences.create({
  body: {
    items: [{
      title: 'Cupón: Chivito para 2 en Lo de Pepe',
      unit_price: 890,    // en pesos uruguayos
      quantity: 1,
      currency_id: 'UYU',
    }],
    back_urls: {
      success: 'https://descuentosya.vercel.app/payment/success',
      failure: 'https://descuentosya.vercel.app/payment/failure',
    },
    auto_return: 'approved',
    notification_url: 'https://tu-backend.supabase.co/functions/v1/webhook-mp',
  }
});

// Redirigir al usuario a:
// preference.init_point`} />

          <Tip type="warning">
            Podés empezar con las <strong>credenciales de prueba</strong> de MercadoPago para testear sin dinero real. 
            Cuando estés listo, cambiás a las credenciales de producción.
          </Tip>

          <div className="bg-blue-50 rounded-xl p-3 mt-3 border border-blue-100">
            <p className="text-[11px] font-bold text-blue-700 mb-1">💰 Tu modelo de negocio</p>
            <p className="text-[11px] text-blue-600">
              Con MercadoPago <strong>Split Payment</strong> podés cobrar automáticamente tu comisión (ej: 15%) 
              y enviar el resto al comercio. El dinero se reparte solo.
            </p>
          </div>
        </Step>

        {/* PASO 7 */}
        <Step number={7} title="Dominio personalizado (.com.uy)" time="15 min" difficulty="fácil" icon={<Shield size={18} />}>
          <p className="text-xs text-gray-600 leading-relaxed mb-3">
            Para que tu app sea profesional, necesitás un dominio propio como <strong>descuentosya.com.uy</strong>.
          </p>

          <ol className="space-y-2 text-xs text-gray-600">
            <li className="flex items-start gap-2">
              <span className="bg-orange-100 text-orange-600 font-bold text-[10px] w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">1</span>
              <span>Comprá el dominio en <a href="https://nic.com.uy" target="_blank" rel="noopener" className="text-orange-600 font-semibold underline inline-flex items-center gap-0.5">nic.com.uy <ExternalLink size={10} /></a> (~USD 30/año para .com.uy) o en <a href="https://www.namecheap.com" target="_blank" rel="noopener" className="text-orange-600 font-semibold underline inline-flex items-center gap-0.5">Namecheap <ExternalLink size={10} /></a> (~USD 10/año para .com)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="bg-orange-100 text-orange-600 font-bold text-[10px] w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">2</span>
              <span>En Vercel → tu proyecto → Settings → Domains</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="bg-orange-100 text-orange-600 font-bold text-[10px] w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">3</span>
              <span>Escribí tu dominio y seguí las instrucciones (Vercel te dice qué DNS configurar)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="bg-orange-100 text-orange-600 font-bold text-[10px] w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">4</span>
              <span>Esperá 5-30 minutos y ¡listo! SSL/HTTPS automático incluido</span>
            </li>
          </ol>

          <Tip type="success">
            Una vez configurado, tu app es accesible en <strong>https://descuentosya.com.uy</strong> 
            con certificado SSL gratuito y CDN global para que cargue rápido.
          </Tip>
        </Step>

        {/* APK Section */}
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-5 text-white mt-6">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-3xl">📱</span>
            <div>
              <h3 className="font-extrabold text-base">¿Querés un APK para Google Play?</h3>
              <p className="text-gray-400 text-xs">Opcional — la PWA ya funciona como app nativa</p>
            </div>
          </div>
          <p className="text-gray-300 text-xs leading-relaxed mb-3">
            Si querés publicar en Google Play Store, usá <strong>PWABuilder</strong> — convierte tu PWA en APK automáticamente.
          </p>
          <ol className="space-y-1.5 text-xs text-gray-300">
            <li>1. Entrá a <a href="https://pwabuilder.com" target="_blank" rel="noopener" className="text-orange-400 underline">pwabuilder.com</a></li>
            <li>2. Pegá tu URL (ej: descuentosya.vercel.app)</li>
            <li>3. Click en "Package for stores" → "Android"</li>
            <li>4. Descargá el APK</li>
            <li>5. Subilo a Google Play Console (cuenta de developer: USD 25 una sola vez)</li>
          </ol>
          <Tip type="info">
            <span className="text-blue-200">La PWA ya se puede instalar sin Play Store. El APK es solo si querés estar en la tienda para tener más visibilidad.</span>
          </Tip>
        </div>

        {/* Next steps */}
        <div className="bg-gradient-to-br from-violet-50 to-purple-50 rounded-2xl p-5 border border-violet-100 mt-4">
          <h3 className="font-extrabold text-sm text-gray-800 mb-3 flex items-center gap-2">
            <Server size={16} className="text-violet-500" /> Próximos pasos recomendados
          </h3>
          <ul className="space-y-2.5">
            {[
              { emoji: '📊', title: 'Google Analytics', desc: 'Para ver cuántos usuarios tenés y qué hacen' },
              { emoji: '📧', title: 'Formulario de registro para comercios', desc: 'Un Google Form o Typeform donde los comercios se registren' },
              { emoji: '📱', title: 'Página de Instagram', desc: '@descuentosya.uy — publicá las ofertas ahí' },
              { emoji: '💬', title: 'WhatsApp Business', desc: 'Número de contacto para comercios y usuarios' },
              { emoji: '📋', title: 'Términos y condiciones', desc: 'Consultá con un abogado en Uruguay para los T&C' },
              { emoji: '🏢', title: 'Monotributo/Unipersonal', desc: 'Para facturar legalmente en Uruguay (consultá contador)' },
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-2.5">
                <span className="text-lg">{item.emoji}</span>
                <div>
                  <p className="font-bold text-xs text-gray-700">{item.title}</p>
                  <p className="text-[11px] text-gray-500">{item.desc}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact CTA */}
        <div className="text-center py-6">
          <p className="text-4xl mb-2">🇺🇾</p>
          <p className="font-bold text-gray-800">¡Éxitos con DescuentosYa!</p>
          <p className="text-xs text-gray-400 mt-1">Hecho con ❤️ para emprendedores uruguayos</p>
        </div>
      </div>
    </div>
  );
}
