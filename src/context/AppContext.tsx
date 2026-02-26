import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { User, Deal, Coupon, Notification, Review, Toast, CouponStatus, Business, DealApproval } from '../types';
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
  // Auth
  login: (email: string, password: string) => boolean;
  loginAs: (role: 'user' | 'business' | 'admin') => void;
  logout: () => void;
  register: (name: string, email: string, role: 'user' | 'business') => boolean;
  // Deals
  purchaseDeal: (dealId: string) => Coupon | null;
  validateCoupon: (couponId: string) => boolean;
  addDeal: (deal: Omit<Deal, 'id' | 'createdAt' | 'soldQuantity'>) => void;
  updateDeal: (dealId: string, updates: Partial<Deal>) => void;
  deleteDeal: (dealId: string) => void;
  togglePauseDeal: (dealId: string) => void;
  // Admin
  approveDeal: (dealId: string) => void;
  rejectDeal: (dealId: string, reason: string) => void;
  approveBusiness: (bizId: string) => void;
  rejectBusiness: (bizId: string, reason: string) => void;
  toggleFeatured: (dealId: string) => void;
  // UI
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
  // Getters
  getCouponsByStatus: (status: CouponStatus) => Coupon[];
  getBusinessDeals: () => Deal[];
  getBusinessCoupons: () => Coupon[];
  getVisibleDeals: () => Deal[];
  getPendingDeals: () => Deal[];
  getPendingBusinesses: () => Business[];
  unreadNotifications: number;
  totalSaved: number;
  // Platform stats
  platformStats: {
    totalUsers: number;
    totalBusinesses: number;
    totalDeals: number;
    totalCoupons: number;
    totalRevenue: number;
    pendingDeals: number;
    pendingBusinesses: number;
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
    const timer = setTimeout(() => {
      setToasts(prev => prev.slice(1));
    }, 3500);
    return () => clearTimeout(timer);
  }, [toasts]);

  const addToast = useCallback((message: string, type: Toast['type']) => {
    const toast: Toast = { id: `t_${Date.now()}_${Math.random()}`, message, type };
    setToasts(prev => [...prev, toast]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const login = useCallback((email: string, _password: string): boolean => {
    const user = mockUsers.find(u => u.email === email);
    if (user) {
      setCurrentUser(user);
      setShowOnboarding(false);
      return true;
    }
    return false;
  }, []);

  const loginAs = useCallback((role: 'user' | 'business' | 'admin') => {
    const user = mockUsers.find(u => u.role === role);
    if (user) {
      setCurrentUser(user);
      setShowOnboarding(false);
    }
  }, []);

  const logout = useCallback(() => {
    setCurrentUser(null);
    setFavorites([]);
    addToast('Sesión cerrada correctamente', 'info');
  }, [addToast]);

  const register = useCallback((name: string, email: string, role: 'user' | 'business'): boolean => {
    const newUser: User = {
      id: `u_${Date.now()}`,
      name,
      email,
      role,
      createdAt: new Date().toISOString(),
    };
    setCurrentUser(newUser);
    setShowOnboarding(false);
    addToast(`¡Bienvenido/a ${name}!`, 'success');
    return true;
  }, [addToast]);

  const purchaseDeal = useCallback((dealId: string): Coupon | null => {
    if (!currentUser) return null;
    const deal = deals.find(d => d.id === dealId);
    if (!deal || deal.availableQuantity <= deal.soldQuantity) return null;
    if (deal.approvalStatus !== 'approved' || deal.paused) return null;

    const newCoupon: Coupon = {
      id: `c_${Date.now()}`,
      dealId,
      userId: currentUser.id,
      qrCode: `DESCYA-${Date.now()}-${dealId}-${currentUser.id}`.toUpperCase(),
      status: 'active',
      purchasedAt: new Date().toISOString(),
      deal,
    };

    setCoupons(prev => [newCoupon, ...prev]);
    setDeals(prev => prev.map(d => d.id === dealId ? { ...d, soldQuantity: d.soldQuantity + 1 } : d));

    const newNotif: Notification = {
      id: `n_${Date.now()}`,
      userId: currentUser.id,
      title: '🎉 ¡Compra exitosa!',
      message: `Tu cupón de "${deal.title}" está listo. Mostrá el código QR en el local para canjearlo.`,
      read: false,
      createdAt: new Date().toISOString(),
      dealId,
      type: 'purchase',
    };
    setNotifications(prev => [newNotif, ...prev]);
    addToast('¡Cupón comprado con éxito!', 'success');

    return newCoupon;
  }, [currentUser, deals, addToast]);

  const validateCoupon = useCallback((couponId: string): boolean => {
    const coupon = coupons.find(c => c.id === couponId);
    if (!coupon || coupon.status !== 'active') return false;

    setCoupons(prev => prev.map(c =>
      c.id === couponId ? { ...c, status: 'used' as CouponStatus, usedAt: new Date().toISOString() } : c
    ));
    addToast('Cupón validado correctamente', 'success');
    return true;
  }, [coupons, addToast]);

  // === DEAL CRUD ===

  const addDeal = useCallback((deal: Omit<Deal, 'id' | 'createdAt' | 'soldQuantity'>) => {
    const newDeal: Deal = {
      ...deal,
      id: `d_${Date.now()}`,
      createdAt: new Date().toISOString(),
      soldQuantity: 0,
    };
    setDeals(prev => [newDeal, ...prev]);

    // Notify admin
    const adminNotif: Notification = {
      id: `n_${Date.now()}_admin`,
      userId: 'a1',
      title: '📋 Nueva oferta para revisar',
      message: `"${deal.title}" de ${deal.businessName} espera aprobación.`,
      read: false,
      createdAt: new Date().toISOString(),
      type: 'system',
    };
    setNotifications(prev => [adminNotif, ...prev]);
    addToast('Promoción enviada para aprobación', 'success');
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
        const newPaused = !d.paused;
        addToast(newPaused ? 'Promoción pausada' : 'Promoción reactivada', newPaused ? 'warning' : 'success');
        return { ...d, paused: newPaused };
      }
      return d;
    }));
  }, [addToast]);

  // === ADMIN FUNCTIONS ===

  const approveDeal = useCallback((dealId: string) => {
    setDeals(prev => prev.map(d => {
      if (d.id === dealId) {
        // Notify business
        const bizNotif: Notification = {
          id: `n_${Date.now()}_biz`,
          userId: d.businessId,
          title: '✅ ¡Oferta aprobada!',
          message: `Tu promoción "${d.title}" fue aprobada y ya está visible para los usuarios.`,
          read: false,
          createdAt: new Date().toISOString(),
          type: 'approval',
          dealId,
        };
        setNotifications(prev2 => [bizNotif, ...prev2]);
        return { ...d, approvalStatus: 'approved' as DealApproval, active: true };
      }
      return d;
    }));
    addToast('Oferta aprobada ✅', 'success');
  }, [addToast]);

  const rejectDeal = useCallback((dealId: string, reason: string) => {
    setDeals(prev => prev.map(d => {
      if (d.id === dealId) {
        const bizNotif: Notification = {
          id: `n_${Date.now()}_biz`,
          userId: d.businessId,
          title: '❌ Oferta rechazada',
          message: `Tu promoción "${d.title}" fue rechazada. Motivo: ${reason}`,
          read: false,
          createdAt: new Date().toISOString(),
          type: 'rejection',
          dealId,
        };
        setNotifications(prev2 => [bizNotif, ...prev2]);
        return { ...d, approvalStatus: 'rejected' as DealApproval, active: false, rejectionReason: reason };
      }
      return d;
    }));
    addToast('Oferta rechazada', 'warning');
  }, [addToast]);

  const approveBusiness = useCallback((bizId: string) => {
    setBusinesses(prev => prev.map(b => {
      if (b.id === bizId) {
        return { ...b, approvalStatus: 'approved' as const, verified: true };
      }
      return b;
    }));
    addToast('Comercio aprobado ✅', 'success');
  }, [addToast]);

  const rejectBusiness = useCallback((bizId: string, reason: string) => {
    setBusinesses(prev => prev.map(b => {
      if (b.id === bizId) {
        return { ...b, approvalStatus: 'rejected' as const, rejectionReason: reason };
      }
      return b;
    }));
    addToast('Comercio rechazado', 'warning');
  }, [addToast]);

  const toggleFeatured = useCallback((dealId: string) => {
    setDeals(prev => prev.map(d => {
      if (d.id === dealId) {
        const newFeatured = !d.featured;
        addToast(newFeatured ? 'Marcada como destacada ⭐' : 'Quitada de destacadas', newFeatured ? 'success' : 'info');
        return { ...d, featured: newFeatured };
      }
      return d;
    }));
  }, [addToast]);

  // === NOTIFICATIONS ===

  const markNotificationRead = useCallback((id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  }, []);

  const markAllNotificationsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => currentUser && n.userId === currentUser.id ? { ...n, read: true } : n));
    addToast('Todas las notificaciones marcadas como leídas', 'info');
  }, [currentUser, addToast]);

  // === FAVORITES & REVIEWS ===

  const toggleFavorite = useCallback((dealId: string) => {
    setFavorites(prev => {
      const isFav = prev.includes(dealId);
      if (isFav) {
        addToast('Eliminado de favoritos', 'info');
        return prev.filter(id => id !== dealId);
      } else {
        addToast('Agregado a favoritos ❤️', 'success');
        return [...prev, dealId];
      }
    });
  }, [addToast]);

  const isFavorite = useCallback((dealId: string) => {
    return favorites.includes(dealId);
  }, [favorites]);

  const addReview = useCallback((dealId: string, rating: number, comment: string) => {
    if (!currentUser) return;
    const newReview: Review = {
      id: `r_${Date.now()}`,
      dealId,
      userId: currentUser.id,
      userName: currentUser.name.split(' ')[0] + ' ' + (currentUser.name.split(' ')[1]?.[0] || '') + '.',
      rating,
      comment,
      createdAt: new Date().toISOString(),
      helpful: 0,
    };
    setReviews(prev => [newReview, ...prev]);
    addToast('¡Gracias por tu reseña!', 'success');
  }, [currentUser, addToast]);

  const getReviewsForDeal = useCallback((dealId: string): Review[] => {
    return reviews.filter(r => r.dealId === dealId);
  }, [reviews]);

  const dismissOnboarding = useCallback(() => {
    setShowOnboarding(false);
  }, []);

  // === GETTERS ===

  const getCouponsByStatus = useCallback((status: CouponStatus): Coupon[] => {
    if (!currentUser) return [];
    return coupons.filter(c => c.userId === currentUser.id && c.status === status);
  }, [currentUser, coupons]);

  const getBusinessDeals = useCallback((): Deal[] => {
    if (!currentUser || currentUser.role !== 'business') return [];
    return deals;
  }, [currentUser, deals]);

  const getBusinessCoupons = useCallback((): Coupon[] => {
    if (!currentUser || currentUser.role !== 'business') return [];
    return coupons;
  }, [currentUser, coupons]);

  // Only show approved, active, non-paused deals to users
  const getVisibleDeals = useCallback((): Deal[] => {
    return deals.filter(d => d.approvalStatus === 'approved' && d.active && !d.paused);
  }, [deals]);

  const getPendingDeals = useCallback((): Deal[] => {
    return deals.filter(d => d.approvalStatus === 'pending');
  }, [deals]);

  const getPendingBusinesses = useCallback((): Business[] => {
    return businesses.filter(b => b.approvalStatus === 'pending');
  }, [businesses]);

  const unreadNotifications = currentUser
    ? notifications.filter(n => n.userId === currentUser.id && !n.read).length
    : 0;

  const totalSaved = currentUser
    ? coupons.filter(c => c.userId === currentUser.id).reduce((acc, c) => acc + (c.deal.originalPrice - c.deal.discountPrice), 0)
    : 0;

  const platformStats = {
    totalUsers: mockUsers.filter(u => u.role === 'user').length,
    totalBusinesses: businesses.length,
    totalDeals: deals.filter(d => d.approvalStatus === 'approved').length,
    totalCoupons: coupons.length,
    totalRevenue: coupons.reduce((acc, c) => acc + c.deal.discountPrice, 0),
    pendingDeals: deals.filter(d => d.approvalStatus === 'pending').length,
    pendingBusinesses: businesses.filter(b => b.approvalStatus === 'pending').length,
  };

  return (
    <AppContext.Provider value={{
      currentUser, deals, coupons, notifications, reviews, favorites, toasts, businesses,
      searchQuery, selectedCategory, showOnboarding,
      login, loginAs, logout, register, purchaseDeal, validateCoupon,
      addDeal, updateDeal, deleteDeal, togglePauseDeal,
      approveDeal, rejectDeal, approveBusiness, rejectBusiness, toggleFeatured,
      setSearchQuery, setSelectedCategory, markNotificationRead, markAllNotificationsRead,
      toggleFavorite, isFavorite, addReview, getReviewsForDeal,
      addToast, removeToast, dismissOnboarding,
      getCouponsByStatus, getBusinessDeals, getBusinessCoupons,
      getVisibleDeals, getPendingDeals, getPendingBusinesses,
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
