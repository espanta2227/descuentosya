import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { PageContainer, EmptyState } from '../components/Layout';
import DealCard from '../components/DealCard';

export default function FavoritesPage() {
  const { currentUser, deals, favorites } = useApp();
  const navigate = useNavigate();

  if (!currentUser) {
    return (
      <PageContainer className="pt-4">
        <EmptyState
          icon="❤️"
          title="Iniciá sesión para ver tus favoritos"
          description="Guardá tus ofertas preferidas para no perdértelas"
          action={() => navigate('/login')}
          actionLabel="Iniciar Sesión"
        />
      </PageContainer>
    );
  }

  const favDeals = deals.filter(d => favorites.includes(d.id));

  return (
    <PageContainer className="pt-4">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-2xl font-extrabold">❤️ Favoritos</h1>
          <p className="text-sm text-gray-400">{favDeals.length} oferta{favDeals.length !== 1 ? 's' : ''} guardada{favDeals.length !== 1 ? 's' : ''}</p>
        </div>
      </div>

      {favDeals.length === 0 ? (
        <EmptyState
          icon="💝"
          title="No tenés favoritos aún"
          description="Tocá el ❤️ en cualquier oferta para guardarla aquí"
          action={() => navigate('/explore')}
          actionLabel="Explorar Ofertas"
        />
      ) : (
        <div className="space-y-4">
          {favDeals.map((deal, i) => (
            <DealCard key={deal.id} deal={deal} index={i} />
          ))}
        </div>
      )}
    </PageContainer>
  );
}
