export interface User {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  role: 'user' | 'admin' | 'manager';
  phone: string;
  createdAt: Date;
  lastSeen: Date;
  isOnline: boolean;
  loyaltyPoints: number;
  totalOrders: number;
  totalSpent: number;
  preferredCategories: string[];
  addresses: Address[];
  fcmToken?: string;
}

export interface ProductAttribute {
  name: string;
  values: string[];
}

export interface ProductVariant {
  id: string;
  sku: string;
  attributes: Record<string, string>;
  price: number;
  comparePrice?: number;
  images: string[];
  stock: number;
  lowStockThreshold: number;
  isActive: boolean;
}

export interface Product {
  id: string;
  name: string;
  brand?: string;
  slug: string;
  description: string;
  material?: string; // New field
  price: number;
  comparePrice?: number;
  images: string[];
  colorImages?: Record<string, string[]>; // New field for color-specific galleries
  videoUrl?: string;
  category: string;
  subcategory: string;
  tags: string[];
  stock: number;
  lowStockThreshold: number;
  sold: number;
  soldCount?: number;
  views: number;
  rating: number;
  reviewCount: number;
  isActive: boolean;
  isFeatured: boolean;
  isFlashSale: boolean;
  flashSalePrice?: number;
  flashSaleEndsAt?: Date;
  bundleIds: string[];
  weight?: number;
  dimensions?: { l: number; w: number; h: number };
  hasVariants: boolean;
  attributes?: ProductAttribute[];
  variants?: ProductVariant[];
  sizeGuide?: Record<string, string>; // New field for size measurements/rules
  specifications?: { key: string; value: string }[]; // New field for technical specs
  createdAt: Date;
  updatedAt: Date;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  image: string;
  icon: string;
  parentId: string | null;
  order: number;
  isActive: boolean;
}

export interface CartItem {
  productId: string;
  variantId?: string;
  name: string;
  price: number;
  image: string;
  qty: number;
  stock: number;
  variant?: string;
  attributes?: Record<string, string>;
}

export interface Order {
  id: string;
  userId: string;
  guestEmail: string | null;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  couponCode?: string;
  total: number;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled' | 'returned';
  paymentMethod: 'cod' | 'card' | 'wallet';
  paymentStatus: 'pending' | 'paid' | 'refunded';
  address: Address;
  timeline: StatusUpdate[];
  invoiceUrl?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  image: string;
  qty: number;
}

export interface Address {
  id: string;
  label: string;
  fullName: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  province: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
}

export interface Review {
  id: string;
  productId: string;
  userId?: string;
  userName: string;
  userImage?: string;
  rating: number;
  title: string;
  body: string;
  images?: string[];
  isVerifiedPurchase: boolean;
  helpful: number;
  reported: boolean;
  createdAt: Date;
}

export interface StatusUpdate {
  status: string;
  timestamp: Date;
  message: string;
}

export interface Coupon {
  id: string;
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  minOrderValue: number;
  maxDiscount?: number;
  usageLimit: number;
  usedCount: number;
  usedBy: string[];
  expiresAt: Date;
  isActive: boolean;
  categories: string[];
}

export interface Notification {
  id: string;
  userId: string;
  type: 'order' | 'promo' | 'abandoned_cart' | 'restock' | 'flash_sale' | 'loyalty';
  title: string;
  body: string;
  imageUrl?: string;
  actionUrl?: string;
  isRead: boolean;
  createdAt: Date;
}

export interface Chat {
  id: string;
  userId: string | null;
  guestId: string;
  userName: string;
  status: 'open' | 'closed' | 'pending';
  lastMessage: string;
  lastMessageAt: Date;
  unreadAdmin: number;
  unreadUser: number;
  createdAt: Date;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderRole: 'user' | 'admin';
  text: string;
  imageUrl?: string;
  isRead: boolean;
  timestamp: Date;
}

export interface Bundle {
  id: string;
  name: string;
  productIds: string[];
  bundlePrice: number;
  discount: number;
  isActive: boolean;
}

export interface ReturnRequest {
  id: string;
  orderId: string;
  userId: string;
  items: ReturnItem[];
  reason: string;
  status: 'pending' | 'approved' | 'rejected' | 'refunded';
  adminNote?: string;
  createdAt: Date;
}

export interface ReturnItem {
  productId: string;
  name: string;
  qty: number;
  reason: string;
}

export interface GetProductsOptions {
  category?: string;
  sort?: 'price_asc' | 'price_desc' | 'newest' | 'popular';
  priceMin?: number;
  priceMax?: number;
  pageSize?: number;
}
