import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Bell, CheckCheck, ShoppingBag, Clock, Megaphone, Settings } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { PageContainer, EmptyState } from '../components/Layout';

const typeConfig: Record<string, { icon: typeof Bell; color: string; bg: string }> = {
  purchase: { icon: ShoppingBag, color: 'text-green-500', bg: 'bg-green-100' },
  expiry: { icon: Clock, color: 'text-amber-500', bg: 'bg-amber-100' },
  promo: { icon: Megaphone, color: 'text-blue-500', bg: 'bg-blue-100' },
  system: { icon: Settings, color: 'text-purple-500', bg: 'bg-purple-100' },
};

export default function NotificationsPage() {
  const { currentUser, notifications, markNotificationRead, markAllNotificationsRead } = useApp();
  const navigate = useNavigate();

  if (!currentUser) {
    return (
      <PageContainer className="pt-4">
        <EmptyState icon="🔔" title="Iniciá sesión para ver tus notificaciones"
          description="Recibí alertas de ofertas y cupones" action={() => navigate('/login')} actionLabel="Iniciar Sesión" />
      </PageContainer>
    );
  }

  const myNotifs = notifications.filter(n => n.userId === currentUser.id);
  const unread = myNotifs.filter(n => !n.read).length;

  return (
    <PageContainer className="pt-4">
      <div className="flex items-center gap-3 mb-5 animate-fadeIn">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full transition">
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-extrabold">🔔 Notificaciones</h1>
          {unread > 0 && <p className="text-xs text-orange-500 font-medium">{unread} sin leer</p>}
        </div>
        {unread > 0 && (
          <button onClick={markAllNotificationsRead}
            className="text-orange-500 text-sm font-medium flex items-center gap-1.5 bg-orange-50 px-3 py-1.5 rounded-xl hover:bg-orange-100 transition">
            <CheckCheck size={14} /> Leer todo
          </button>
        )}
      </div>

      {myNotifs.length === 0 ? (
        <EmptyState icon="📭" title="Sin notificaciones"
          description="Te avisaremos cuando haya novedades" />
      ) : (
        <div className="space-y-2">
          {myNotifs.map((notif, i) => {
            const config = typeConfig[notif.type || 'promo'];
            const Icon = config.icon;
            return (
              <button key={notif.id}
                onClick={() => {
                  markNotificationRead(notif.id);
                  if (notif.dealId) navigate(`/deal/${notif.dealId}`);
                }}
                className={`w-full text-left p-4 rounded-2xl transition-all card-hover animate-fadeInUp
                  ${notif.read ? 'bg-white border border-gray-100' : 'bg-orange-50/80 border border-orange-200 shadow-sm'}`}
                style={{ animationDelay: `${i * 60}ms`, animationFillMode: 'backwards' }}>
                <div className="flex gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${config.bg}`}>
                    <Icon size={18} className={config.color} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className={`text-sm leading-tight ${notif.read ? 'font-medium' : 'font-bold'}`}>{notif.title}</h3>
                      {!notif.read && (
                        <div className="w-2.5 h-2.5 bg-orange-500 rounded-full flex-shrink-0 mt-1.5 animate-pulse" />
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">{notif.message}</p>
                    <p className="text-[11px] text-gray-400 mt-1.5">
                      {new Date(notif.createdAt).toLocaleDateString('es-AR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </PageContainer>
  );
}
