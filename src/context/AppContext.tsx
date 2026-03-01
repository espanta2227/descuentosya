import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { User, Deal, Coupon, Notification, Review, Toast, CouponStatus, Business } from '../types';
import { mockUsers, mockDeals, mockCoupons, mockNotifications, mockReviews, mockBusinesses } from '../data/mockData';

interface AppState {
  currentUser: User | null;
  deals: Deal[];
  coupons: Coupon[];
  notifications: Notification[];
  reviews: Review[];
  favorites: string[];
  toasts: Toast[];
  businesses: Business[];
  searchQuery: string;
  selectedCategory: string | null;
  showOnboarding: boolean;
  login: (email: string, password: string) => boolean;
  loginAs: (role: 'user' | 'admin' | 'business') => void;
  logout: () => void;
  register: (name: string, email: string) => boolean;
  claimDeal: (dealId: string) => Coupon | null;
  validateCoupon: (couponId: string) => boolean;
  validateCouponByQR: (qrCode: string) => { success: boolean; coupon?: Coupon; error?: string };
  addDeal: (deal: Omit<Deal, 'id' | 'createdAt' | 'claimedQuantity'>) => void;
  updateDeal: (dealId: string, updates: Partial<Deal>) => void;
  deleteDeal: (dealId: string) => void;
  togglePauseDeal: (dealId: string) => void;
  approveDeal: (dealId: string) => void;
  rejectDeal: (dealId: string, reason: string) => void;
  toggleFeatured: (dealId: string) => void;
  addBusiness: (biz: Omit<Business, 'id'>) => void;
  updateBusiness: (bizId: string, updates: Partial<Business>) => void;
  deleteBusiness: (bizId: string) => void;
  setSearchQuery: (q: string) => void;
  setSelectedCategory: (c: string | null) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  toggleFavorite: (dealId: string) => void;
  isFavorite: (dealId: string) => boolean;
  addReview: (dealId: string, rating: number, comment: string) => void;
  getReviewsForDeal: (dealId: string) => Review[];
  addToast: (message: string, type: Toast['type']) => void;
  removeToast: (id: string) => void;
  dismissOnboarding: () => void;
  getCouponsByStatus: (status: CouponStatus) => Coupon[];
  getVisibleDeals: () => Deal[];
  getPendingDeals: () => Deal[];
  hasClaimedDeal: (dealId: string) => boolean;
  getBusinessDeals: () => Deal[];
  getBusinessCoupons: () => Coupon[];
  getBusinessStats: () => { totalDeals: number; totalClaimed: number; validatedToday: number; activeCoupons: number; revenue: number };
  unreadNotifications: number;
  totalSaved: number;
  platformStats: {
    totalUsers: number;
    totalBusinesses: number;
    totalDeals: number;
    totalCoupons: number;
    pendingDeals: number;
  };
}

const AppContext = createContext<AppState | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [deals, setDeals] = useState<Deal[]>(mockDeals);
  const [coupons, setCoupons] = useState<Coupon[]>(mockCoupons);
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const [reviews, setReviews] = useState<Review[]>(mockReviews);
  const [businesses, setBusinesses] = useState<Business[]>(mockBusinesses);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(true);

  useEffect(() => {
    if (toasts.length === 0) return;
    const timer = setTimeout(() => setToasts(prev => prev.slice(1)), 3500);
    return () => clearTimeout(timer);
  }, [toasts]);

  const addToast = useCallback((message: string, type: Toast['type']) => {
    setToasts(prev => [...prev, { id: `t_${Date.now()}_${Math.random()}`, message, type }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const login = useCallback((email: string, _password: string): boolean => {
    const user = mockUsers.find(u => u.email === email);
    if (user) { setCurrentUser(user); setShowOnboarding(false); return true; }
    return false;
  }, []);

  const loginAs = useCallback((role: 'user' | 'admin' | 'business') => {
    const user = mockUsers.find(u => u.role === role);
    if (user) { setCurrentUser(user); setShowOnboarding(false); }
  }, []);

  const logout = useCallback(() => {
    setCurrentUser(null);
    setFavorites([]);
    addToast('Sesión cerrada correctamente', 'info');
  }, [addToast]);

  const register = useCallback((name: string, email: string): boolean => {
    const newUser: User = {
      id: `u_${Date.now()}`, name, email, role: 'user',
      createdAt: new Date().toISOString(),
    };
    setCurrentUser(newUser);
    setShowOnboarding(false);
    addToast(`¡Bienvenido/a ${name}!`, 'success');
    return true;
  }, [addToast]);

  // === CLAIM DEAL ===
  const claimDeal = useCallback((dealId: string): Coupon | null => {
    if (!currentUser) return null;
    const deal = deals.find(d => d.id === dealId);
    if (!deal || deal.availableQuantity <= deal.claimedQuantity) return null;
    if (deal.approvalStatus !== 'approved' || deal.paused) return null;

    const alreadyClaimed = coupons.find(c => c.dealId === dealId && c.userId === currentUser.id && c.status === 'active');
    if (alreadyClaimed) return null;

    const newCoupon: Coupon = {
      id: `c_${Date.now()}`,
      dealId,
      userId: currentUser.id,
      qrCode: `DESCYA-${dealId.toUpperCase()}-${currentUser.id.toUpperCase()}-${Date.now()}`,
      status: 'active',
      claimedAt: new Date().toISOString(),
      deal,
    };

    setCoupons(prev => [newCoupon, ...prev]);
    setDeals(prev => prev.map(d => d.id === dealId ? { ...d, claimedQuantity: d.claimedQuantity + 1 } : d));

    const newNotif: Notification = {
      id: `n_${Date.now()}`,
      userId: currentUser.id,
      title: '🎉 ¡Cupón canjeado!',
      message: `Tu cupón de "${deal.title}" está listo. Mostrá el código QR en ${deal.businessName} para usarlo.`,
      read: false,
      createdAt: new Date().toISOString(),
      dealId,
      type: 'claim',
    };
    setNotifications(prev => [newNotif, ...prev]);
    addToast('¡Cupón canjeado! Mostrá el QR en el local 🎟️', 'success');

    return newCoupon;
  }, [currentUser, deals, coupons, addToast]);

  const hasClaimedDeal = useCallback((dealId: string): boolean => {
    if (!currentUser) return false;
    return coupons.some(c => c.dealId === dealId && c.userId === currentUser.id && c.status === 'active');
  }, [currentUser, coupons]);

  // === VALIDATE COUPON BY ID ===
  const validateCoupon = useCallback((couponId: string): boolean => {
    const coupon = coupons.find(c => c.id === couponId);
    if (!coupon || coupon.status !== 'active') return false;
    setCoupons(prev => prev.map(c =>
      c.id === couponId ? { ...c, status: 'used' as CouponStatus, usedAt: new Date().toISOString() } : c
    ));
    addToast('Cupón validado correctamente ✅', 'success');
    return true;
  }, [coupons, addToast]);

  // === VALIDATE COUPON BY QR CODE (for business scanner) ===
  const validateCouponByQR = useCallback((qrCode: string): { success: boolean; coupon?: Coupon; error?: string } => {
    const coupon = coupons.find(c => c.qrCode === qrCode);
    if (!coupon) {
      return { success: false, error: 'Código QR no encontrado. Verificá que sea un cupón válido de DescuentosYa.' };
    }
    if (coupon.status === 'used') {
      return { success: false, error: `Este cupón ya fue usado el ${new Date(coupon.usedAt || '').toLocaleDateString('es-UY')}.`, coupon };
    }
    if (coupon.status === 'expired') {
      return { success: false, error: 'Este cupón está vencido.', coupon };
    }

    // If business user, verify the coupon belongs to their business
    if (currentUser?.role === 'business' && currentUser.businessId) {
      const deal = deals.find(d => d.id === coupon.dealId);
      if (deal && deal.businessId !== currentUser.businessId) {
        return { success: false, error: 'Este cupón no pertenece a tu comercio.', coupon };
      }
    }

    setCoupons(prev => prev.map(c =>
      c.id === coupon.id ? { ...c, status: 'used' as CouponStatus, usedAt: new Date().toISOString() } : c
    ));

    addToast('✅ ¡Cupón validado con éxito!', 'success');
    return { success: true, coupon: { ...coupon, status: 'used', usedAt: new Date().toISOString() } };
  }, [coupons, currentUser, deals, addToast]);

  // === BUSINESS: Get my deals ===
  const getBusinessDeals = useCallback((): Deal[] => {
    if (!currentUser?.businessId) return [];
    return deals.filter(d => d.businessId === currentUser.businessId);
  }, [currentUser, deals]);

  // === BUSINESS: Get coupons for my deals ===
  const getBusinessCoupons = useCallback((): Coupon[] => {
    if (!currentUser?.businessId) return [];
    const myDealIds = deals.filter(d => d.businessId === currentUser.businessId).map(d => d.id);
    return coupons.filter(c => myDealIds.includes(c.dealId));
  }, [currentUser, deals, coupons]);

  // === BUSINESS: Stats ===
  const getBusinessStats = useCallback(() => {
    if (!currentUser?.businessId) return { totalDeals: 0, totalClaimed: 0, validatedToday: 0, activeCoupons: 0, revenue: 0 };
    const myDeals = deals.filter(d => d.businessId === currentUser.businessId);
    const myDealIds = myDeals.map(d => d.id);
    const myCoupons = coupons.filter(c => myDealIds.includes(c.dealId));
    const today = new Date().toDateString();
    const validatedToday = myCoupons.filter(c => c.status === 'used' && c.usedAt && new Date(c.usedAt).toDateString() === today).length;
    const activeCoupons = myCoupons.filter(c => c.status === 'active').length;
    const revenue = myCoupons.filter(c => c.status === 'used').reduce((sum, c) => sum + c.deal.discountPrice, 0);

    return {
      totalDeals: myDeals.length,
      totalClaimed: myCoupons.length,
      validatedToday,
      activeCoupons,
      revenue,
    };
  }, [currentUser, deals, coupons]);

  // === ADMIN: DEAL CRUD ===
  const addDeal = useCallback((deal: Omit<Deal, 'id' | 'createdAt' | 'claimedQuantity'>) => {
    const newDeal: Deal = { ...deal, id: `d_${Date.now()}`, createdAt: new Date().toISOString(), claimedQuantity: 0 };
    setDeals(prev => [newDeal, ...prev]);
    addToast('Promoción creada correctamente', 'success');
  }, [addToast]);

  const updateDeal = useCallback((dealId: string, updates: Partial<Deal>) => {
    setDeals(prev => prev.map(d => d.id === dealId ? { ...d, ...updates } : d));
    addToast('Promoción actualizada', 'success');
  }, [addToast]);

  const deleteDeal = useCallback((dealId: string) => {
    setDeals(prev => prev.filter(d => d.id !== dealId));
    addToast('Promoción eliminada', 'info');
  }, [addToast]);

  const togglePauseDeal = useCallback((dealId: string) => {
    setDeals(prev => prev.map(d => {
      if (d.id === dealId) {
        const p = !d.paused;
        addToast(p ? 'Promoción pausada' : 'Promoción reactivada', p ? 'warning' : 'success');
        return { ...d, paused: p };
      }
      return d;
    }));
  }, [addToast]);

  const approveDeal = useCallback((dealId: string) => {
    setDeals(prev => prev.map(d => d.id === dealId ? { ...d, approvalStatus: 'approved' as const, active: true } : d));
    addToast('Oferta aprobada ✅', 'success');
  }, [addToast]);

  const rejectDeal = useCallback((dealId: string, _reason: string) => {
    setDeals(prev => prev.map(d => d.id === dealId ? { ...d, approvalStatus: 'rejected' as const, active: false } : d));
    addToast('Oferta rechazada', 'warning');
  }, [addToast]);

  const toggleFeatured = useCallback((dealId: string) => {
    setDeals(prev => prev.map(d => {
      if (d.id === dealId) {
        const f = !d.featured;
        addToast(f ? 'Marcada como destacada ⭐' : 'Quitada de destacadas', f ? 'success' : 'info');
        return { ...d, featured: f };
      }
      return d;
    }));
  }, [addToast]);

  // === ADMIN: BUSINESS CRUD ===
  const addBusiness = useCallback((biz: Omit<Business, 'id'>) => {
    setBusinesses(prev => [...prev, { ...biz, id: `b_${Date.now()}` }]);
    addToast('Comercio agregado', 'success');
  }, [addToast]);

  const updateBusiness = useCallback((bizId: string, updates: Partial<Business>) => {
    setBusinesses(prev => prev.map(b => b.id === bizId ? { ...b, ...updates } : b));
    addToast('Comercio actualizado', 'success');
  }, [addToast]);

  const deleteBusiness = useCallback((bizId: string) => {
    setBusinesses(prev => prev.filter(b => b.id !== bizId));
    addToast('Comercio eliminado', 'info');
  }, [addToast]);

  // === UI ===
  const markNotificationRead = useCallback((id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  }, []);

  const markAllNotificationsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => currentUser && n.userId === currentUser.id ? { ...n, read: true } : n));
    addToast('Todas marcadas como leídas', 'info');
  }, [currentUser, addToast]);

  const toggleFavorite = useCallback((dealId: string) => {
    setFavorites(prev => {
      const isFav = prev.includes(dealId);
      addToast(isFav ? 'Eliminado de favoritos' : 'Agregado a favoritos ❤️', isFav ? 'info' : 'success');
      return isFav ? prev.filter(id => id !== dealId) : [...prev, dealId];
    });
  }, [addToast]);

  const isFavorite = useCallback((dealId: string) => favorites.includes(dealId), [favorites]);

  const addReview = useCallback((dealId: string, rating: number, comment: string) => {
    if (!currentUser) return;
    const newReview: Review = {
      id: `r_${Date.now()}`, dealId, userId: currentUser.id,
      userName: currentUser.name.split(' ')[0] + ' ' + (currentUser.name.split(' ')[1]?.[0] || '') + '.',
      rating, comment, createdAt: new Date().toISOString(), helpful: 0,
    };
    setReviews(prev => [newReview, ...prev]);
    addToast('¡Gracias por tu reseña!', 'success');
  }, [currentUser, addToast]);

  const getReviewsForDeal = useCallback((dealId: string) => reviews.filter(r => r.dealId === dealId), [reviews]);
  const dismissOnboarding = useCallback(() => setShowOnboarding(false), []);

  const getCouponsByStatus = useCallback((status: CouponStatus): Coupon[] => {
    if (!currentUser) return [];
    return coupons.filter(c => c.userId === currentUser.id && c.status === status);
  }, [currentUser, coupons]);

  const getVisibleDeals = useCallback(() => deals.filter(d => d.approvalStatus === 'approved' && d.active && !d.paused), [deals]);
  const getPendingDeals = useCallback(() => deals.filter(d => d.approvalStatus === 'pending'), [deals]);

  const unreadNotifications = currentUser ? notifications.filter(n => n.userId === currentUser.id && !n.read).length : 0;

  const totalSaved = currentUser
    ? coupons.filter(c => c.userId === currentUser.id).reduce((acc, c) => acc + (c.deal.originalPrice - c.deal.discountPrice), 0)
    : 0;

  const platformStats = {
    totalUsers: mockUsers.filter(u => u.role === 'user').length,
    totalBusinesses: businesses.length,
    totalDeals: deals.filter(d => d.approvalStatus === 'approved').length,
    totalCoupons: coupons.length,
    pendingDeals: deals.filter(d => d.approvalStatus === 'pending').length,
  };

  return (
    <AppContext.Provider value={{
      currentUser, deals, coupons, notifications, reviews, favorites, toasts, businesses,
      searchQuery, selectedCategory, showOnboarding,
      login, loginAs, logout, register, claimDeal, validateCoupon, validateCouponByQR,
      addDeal, updateDeal, deleteDeal, togglePauseDeal,
      approveDeal, rejectDeal, toggleFeatured,
      addBusiness, updateBusiness, deleteBusiness,
      setSearchQuery, setSelectedCategory, markNotificationRead, markAllNotificationsRead,
      toggleFavorite, isFavorite, addReview, getReviewsForDeal,
      addToast, removeToast, dismissOnboarding,
      getCouponsByStatus, getVisibleDeals, getPendingDeals, hasClaimedDeal,
      getBusinessDeals, getBusinessCoupons, getBusinessStats,
      unreadNotifications, totalSaved, platformStats,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
