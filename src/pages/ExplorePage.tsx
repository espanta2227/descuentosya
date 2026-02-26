import { useState, useMemo } from 'react';
import { Search, SlidersHorizontal, X, LayoutGrid, List } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { PageContainer } from '../components/Layout';
import DealCard from '../components/DealCard';
import { categories } from '../data/mockData';

export default function ExplorePage() {
  const { getVisibleDeals, searchQuery, setSearchQuery, selectedCategory, setSelectedCategory } = useApp();
  const [sortBy, setSortBy] = useState<'popular' | 'discount' | 'price' | 'newest'>('popular');
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

  const filtered = useMemo(() => {
    let result = getVisibleDeals();
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(d =>
        d.title.toLowerCase().includes(q) ||
        d.description.toLowerCase().includes(q) ||
        d.businessName.toLowerCase().includes(q) ||
        d.category.toLowerCase().includes(q)
      );
    }
    if (selectedCategory) {
      result = result.filter(d => d.category === selectedCategory);
    }
    switch (sortBy) {
      case 'popular': result.sort((a, b) => b.soldQuantity - a.soldQuantity); break;
      case 'discount': result.sort((a, b) => b.discountPercent - a.discountPercent); break;
      case 'price': result.sort((a, b) => a.discountPrice - b.discountPrice); break;
      case 'newest': result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()); break;
    }
    return result;
  }, [getVisibleDeals, searchQuery, selectedCategory, sortBy]);

  return (
    <PageContainer className="pt-4">
      {/* Search */}
      <div className="relative mb-4 animate-fadeIn">
        <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
        <input type="text" placeholder="Buscar ofertas, comercios, categorías..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="w-full pl-11 pr-24 py-3.5 rounded-2xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 bg-white shadow-sm" />
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
          <button onClick={() => setViewMode(v => v === 'list' ? 'grid' : 'list')}
            className="p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition">
            {viewMode === 'list' ? <LayoutGrid size={16} /> : <List size={16} />}
          </button>
          <button onClick={() => setShowFilters(!showFilters)}
            className={`p-2 rounded-xl transition ${showFilters ? 'bg-orange-100 text-orange-600' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'}`}>
            <SlidersHorizontal size={16} />
          </button>
        </div>
      </div>

      {/* Active Filters */}
      {(selectedCategory || searchQuery) && (
        <div className="flex gap-2 mb-3 flex-wrap animate-fadeIn">
          {selectedCategory && (
            <span className="bg-orange-100 text-orange-700 px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 shadow-sm">
              {categories.find(c => c.name === selectedCategory)?.icon} {selectedCategory}
              <button onClick={() => setSelectedCategory(null)} className="hover:text-orange-900"><X size={12} /></button>
            </span>
          )}
          {searchQuery && (
            <span className="bg-gray-100 text-gray-700 px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5">
              🔍 "{searchQuery}"
              <button onClick={() => setSearchQuery('')} className="hover:text-gray-900"><X size={12} /></button>
            </span>
          )}
          <button onClick={() => { setSelectedCategory(null); setSearchQuery(''); }}
            className="text-xs text-red-500 font-medium px-2 py-1.5 hover:underline">
            Limpiar todo
          </button>
        </div>
      )}

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-4 mb-4 space-y-4 animate-fadeInDown">
          <div>
            <p className="text-sm font-semibold mb-2.5">Categoría</p>
            <div className="flex flex-wrap gap-2">
              <button onClick={() => setSelectedCategory(null)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all
                  ${!selectedCategory ? 'bg-orange-500 text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                Todas
              </button>
              {categories.map(cat => (
                <button key={cat.name} onClick={() => setSelectedCategory(cat.name)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all
                    ${selectedCategory === cat.name ? 'bg-orange-500 text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                  {cat.icon} {cat.name}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-sm font-semibold mb-2.5">Ordenar por</p>
            <div className="flex flex-wrap gap-2">
              {([['popular', '🔥 Popular'], ['discount', '💰 Mayor Descuento'], ['price', '💲 Menor Precio'], ['newest', '✨ Más Nuevos']] as const).map(([val, label]) => (
                <button key={val} onClick={() => setSortBy(val)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all
                    ${sortBy === val ? 'bg-orange-500 text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Results Count */}
      <div className="flex items-center justify-between mb-3 animate-fadeIn">
        <p className="text-sm text-gray-500 font-medium">
          {filtered.length} oferta{filtered.length !== 1 ? 's' : ''} encontrada{filtered.length !== 1 ? 's' : ''}
        </p>
        <div className="flex gap-1 text-xs">
          {(['popular', 'discount', 'price', 'newest'] as const).map(s => (
            <button key={s} onClick={() => setSortBy(s)}
              className={`px-2 py-1 rounded-lg transition ${sortBy === s ? 'bg-orange-100 text-orange-600 font-semibold' : 'text-gray-400'}`}>
              {s === 'popular' ? '🔥' : s === 'discount' ? '💰' : s === 'price' ? '💲' : '✨'}
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 animate-fadeIn">
          <p className="text-5xl mb-4 animate-float">🔍</p>
          <p className="text-gray-600 font-semibold mb-1">No encontramos ofertas</p>
          <p className="text-gray-400 text-sm">Probá con otros filtros o búsqueda</p>
          <button onClick={() => { setSelectedCategory(null); setSearchQuery(''); }}
            className="mt-4 text-orange-500 font-medium text-sm hover:underline">
            Limpiar filtros
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-2 gap-3">
          {filtered.map((deal, i) => <DealCard key={deal.id} deal={deal} compact index={i} />)}
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((deal, i) => <DealCard key={deal.id} deal={deal} index={i} />)}
        </div>
      )}
    </PageContainer>
  );
}
