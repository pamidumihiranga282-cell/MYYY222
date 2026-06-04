export interface User {
  uid: string;
  email: string;
  displayName: string;
  phone?: string;
  address?: string;
  city?: string;
  role: 'admin' | 'customer';
  createdAt: any;
  photoURL?: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  category: string;
  imageUrl: string;
  images?: string[];
  stock: number;
  weight: number; // in kg
  featured: boolean;
  isNew?: boolean;
  discount?: number;
  createdAt: any;
  updatedAt?: any;
}

export interface CartItem {
  productId: string;
  product: Product;
  quantity: number;
}

export interface Order {
  id: string;
  trackingNumber: string;
  userId: string;
  userEmail: string;
  userName: string;
  userPhone: string;
  items: OrderItem[];
  subtotal: number;
  deliveryCharge: number;
  total: number;
  status: OrderStatus;
  shippingAddress: ShippingAddress;
  paymentMethod: string;
  notes?: string;
  createdAt: any;
  updatedAt?: any;
  statusHistory: StatusUpdate[];
}

export interface OrderItem {
  productId: string;
  productName: string;
  productImage: string;
  price: number;
  quantity: number;
  weight: number;
}

export interface StatusUpdate {
  status: OrderStatus;
  note?: string;
  timestamp: any;
}

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'shipped'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled';

export interface ShippingAddress {
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  district: string;
  postalCode?: string;
}

export interface SiteSettings {
  id: string;
  heroBanner: {
    title: string;
    subtitle: string;
    imageUrl: string;
    ctaText: string;
  };
  specialOffer?: {
    enabled: boolean;
    title: string;
    description: string;
    imageUrl?: string;
    discount?: number;
  };
  announcement?: string;
  announcementEnabled: boolean;
  aboutUs?: string;
  updatedAt?: any;
  emailjsServiceId?: string;
  emailjsTemplateIdAdmin?: string;
  emailjsTemplateIdCustomer?: string;
  emailjsTemplateIdStatus?: string;
  emailjsPublicKey?: string;
}
