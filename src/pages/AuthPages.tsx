import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail, Lock, User, Eye, EyeOff } from 'lucide-react';
import { useApp } from '../context/AppContext';

export function LoginPage() {
  const navigate = useNavigate();
  const { login, loginAs } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) { setError('Ingresá tu email'); return; }
    const success = login(email, password);
    if (success) navigate('/');
    else setError('Credenciales inválidas. Probá con los accesos rápidos.');
  };

  return (
    <div className="max-w-lg mx-auto min-h-screen bg-white">
      <div className="bg-gradient-to-br from-orange-500 to-amber-500 px-6 pt-12 pb-16 text-white relative">
        <button onClick={() => navigate(-1)} className="absolute top-4 left-4 p-2 hover:bg-white/20 rounded-full">
          <ArrowLeft size={22} />
        </button>
        <div className="text-center">
          <div className="text-5xl mb-3">🏷️</div>
          <h1 className="text-3xl font-extrabold">¡Bienvenido!</h1>
          <p className="text-white/80 mt-1">Iniciá sesión en DescuentosYa</p>
        </div>
      </div>

      <div className="px-6 -mt-8">
        <div className="bg-white rounded-3xl shadow-xl p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Email</label>
              <div className="relative">
                <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="tu@email.com"
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-300 focus:outline-none text-sm" />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Contraseña</label>
              <div className="relative">
                <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-12 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-300 focus:outline-none text-sm" />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                  {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {error && <p className="text-red-500 text-sm bg-red-50 px-3 py-2 rounded-xl">{error}</p>}

            <button type="submit"
              className="w-full bg-gradient-to-r from-orange-500 to-amber-500 text-white py-3.5 rounded-xl font-bold text-base shadow-lg hover:shadow-xl transition">
              Iniciar Sesión
            </button>
          </form>

          <div className="mt-4">
            <button className="w-full border border-gray-200 py-3 rounded-xl flex items-center justify-center gap-3 hover:bg-gray-50 transition text-sm font-medium">
              <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
              Continuar con Google
            </button>
          </div>

          {/* Quick Access */}
          <div className="mt-6 pt-5 border-t">
            <p className="text-xs text-gray-500 text-center mb-3">⚡ Acceso rápido para demo</p>
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => { loginAs('user'); navigate('/'); }}
                className="flex items-center justify-center gap-2 bg-green-50 border border-green-200 text-green-700 px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-green-100 transition">
                <User size={16} /> Usuario
              </button>
              <button onClick={() => { loginAs('admin'); navigate('/admin'); }}
                className="flex items-center justify-center gap-2 bg-violet-50 border border-violet-200 text-violet-700 px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-violet-100 transition">
                🛡️ Admin
              </button>
            </div>
          </div>

          <p className="text-center mt-5 text-sm text-gray-500">
            ¿No tenés cuenta?{' '}
            <button onClick={() => navigate('/register')} className="text-orange-500 font-semibold">Registrate</button>
          </p>
        </div>
      </div>
    </div>
  );
}

export function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useApp();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) { setError('Completá todos los campos'); return; }
    if (password.length < 6) { setError('La contraseña debe tener al menos 6 caracteres'); return; }
    register(name, email);
    navigate('/');
  };

  return (
    <div className="max-w-lg mx-auto min-h-screen bg-white">
      <div className="bg-gradient-to-br from-orange-500 to-amber-500 px-6 pt-12 pb-16 text-white relative">
        <button onClick={() => navigate(-1)} className="absolute top-4 left-4 p-2 hover:bg-white/20 rounded-full">
          <ArrowLeft size={22} />
        </button>
        <div className="text-center">
          <div className="text-5xl mb-3">🚀</div>
          <h1 className="text-3xl font-extrabold">Crear Cuenta</h1>
          <p className="text-white/80 mt-1">Unite a DescuentosYa — ¡Es gratis!</p>
        </div>
      </div>

      <div className="px-6 -mt-8">
        <div className="bg-white rounded-3xl shadow-xl p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Nombre Completo</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)}
                placeholder="Juan Pérez"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-300 focus:outline-none text-sm" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="tu@email.com"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-300 focus:outline-none text-sm" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Contraseña</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-300 focus:outline-none text-sm" />
            </div>

            <div className="bg-green-50 rounded-xl p-3 text-xs text-green-700">
              🎁 Al registrarte obtenés acceso inmediato a todos los descuentos y cupones gratuitos de tu zona.
            </div>

            {error && <p className="text-red-500 text-sm bg-red-50 px-3 py-2 rounded-xl">{error}</p>}

            <button type="submit"
              className="w-full bg-gradient-to-r from-orange-500 to-amber-500 text-white py-3.5 rounded-xl font-bold text-base shadow-lg">
              Crear Cuenta Gratis
            </button>
          </form>

          <p className="text-center mt-5 text-sm text-gray-500">
            ¿Ya tenés cuenta?{' '}
            <button onClick={() => navigate('/login')} className="text-orange-500 font-semibold">Iniciá sesión</button>
          </p>
        </div>
      </div>
    </div>
  );
}
