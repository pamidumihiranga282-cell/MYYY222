export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: string;
  weight: number; // in kg
  stock: number;
  featured: boolean;
  badge?: string;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface Order {
  id: string;
  trackingNumber: string;
  userId: string;
  userEmail: string;
  userName: string;
  userPhone: string;
  shippingAddress: string;
  items: OrderItem[];
  totalPrice: number;
  deliveryCharge: number;
  grandTotal: number;
  totalWeight: number;
  status: "pending" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled";
  statusHistory: StatusUpdate[];
  paymentMethod: string;
  notes?: string;
  createdAt?: unknown;
  updatedAt?: unknown;
  whatsappNotified?: boolean;
}

export interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  weight: number;
}

export interface StatusUpdate {
  status: string;
  message: string;
  timestamp: unknown;
  updatedBy: string;
}

export interface SpecialOffer {
  id: string;
  title: string;
  description: string;
  image?: string;
  link?: string;
  active: boolean;
  type: "banner" | "popup" | "announcement";
  bgColor?: string;
  createdAt?: unknown;
}

export interface SiteSettings {
  heroTitle: string;
  heroSubtitle: string;
  heroImage?: string;
  aboutText: string;
  phone: string;
  address: string;
  email: string;
  whatsapp: string;
  facebookUrl?: string;
  instagramUrl?: string;
  deliveryInfo: string;
  bannerText?: string;
  bannerActive?: boolean;
  bannerColor?: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  read: boolean;
  createdAt?: unknown;
}
