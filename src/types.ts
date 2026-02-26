export type UserRole = 'user' | 'business' | 'admin';
export type DealApproval = 'pending' | 'approved' | 'rejected';
export type BusinessApproval = 'pending' | 'approved' | 'rejected';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  phone?: string;
  createdAt: string;
}

export interface Business {
  id: string;
  userId: string;
  name: string;
  description: string;
  logo: string;
  category: string;
  address: string;
  lat: number;
  lng: number;
  phone: string;
  rating: number;
  reviewCount: number;
  subscriptionType: 'free' | 'premium';
  verified: boolean;
  approvalStatus: BusinessApproval;
  rejectionReason?: string;
}

export interface Deal {
  id: string;
  businessId: string;
  businessName: string;
  businessLogo: string;
  title: string;
  description: string;
  details: string;
  image: string;
  originalPrice: number;
  discountPrice: number;
  discountPercent: number;
  category: string;
  availableQuantity: number;
  soldQuantity: number;
  expiresAt: string;
  createdAt: string;
  active: boolean;
  paused: boolean;
  approvalStatus: DealApproval;
  rejectionReason?: string;
  address: string;
  lat: number;
  lng: number;
  terms: string[];
  featured?: boolean;
  rating?: number;
  reviewCount?: number;
}

export type CouponStatus = 'active' | 'used' | 'expired';

export interface Coupon {
  id: string;
  dealId: string;
  userId: string;
  qrCode: string;
  status: CouponStatus;
  purchasedAt: string;
  usedAt?: string;
  deal: Deal;
}

export interface Review {
  id: string;
  dealId: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
  helpful: number;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  dealId?: string;
  type?: 'purchase' | 'expiry' | 'promo' | 'system' | 'approval' | 'rejection';
}

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  duration?: number;
}

export type DealCategory =
  | 'Gastronomía'
  | 'Belleza'
  | 'Salud'
  | 'Entretenimiento'
  | 'Tecnología'
  | 'Moda'
  | 'Hogar'
  | 'Deportes'
  | 'Educación'
  | 'Viajes';
