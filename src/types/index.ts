export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  weight: number; // in grams
  category: string;
  imageUrl: string;
  stock: number;
  featured: boolean;
  createdAt: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Order {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  userPhone: string;
  items: CartItem[];
  subtotal: number;
  deliveryCharge: number;
  totalWeight: number;
  total: number;
  shippingAddress: string;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  trackingNumber: string;
  createdAt: number;
  updatedAt: number;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  phone: string;
  address: string;
  isAdmin: boolean;
  createdAt: number;
}

export interface SiteSettings {
  heroTitle: string;
  heroSubtitle: string;
  specialBanner: string;
  showSpecialBanner: boolean;
  heroImageUrl: string;
  aboutText: string;
}
