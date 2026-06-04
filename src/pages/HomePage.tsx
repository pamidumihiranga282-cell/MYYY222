import React, { useEffect, useState } from 'react';
import { collection, getDocs, query, where, orderBy, limit, doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Product, SiteSettings } from '../types';
import { useCart } from '../context/CartContext';
import { ShoppingCart, Star, Truck, Shield, Award, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';

interface HomePageProps {
  setCurrentPage: (page: string) => void;
  onProductClick: (product: Product) => void;
}

const defaultSettings: SiteSettings = {
  heroTitle: 'Premium Dubai Chocolates & Products',
  heroSubtitle: 'Experience the finest luxury from Dubai, delivered with love to your doorstep. Authentic taste, premium quality.',
  specialBanner: '🎉 Grand Opening Sale — 20% OFF on all Dubai Chocolate Bars! Limited time only! 🍫',
  showSpecialBanner: true,
  heroImageUrl: '/images/hero-banner.jpg',
  aboutText: 'We bring the finest products from Dubai directly to you.'
};

const HomePage: React.FC<HomePageProps> = ({ setCurrentPage, onProductClick }) => {
  const [featured, setFeatured] = useState<Product[]>([]);
  const [settings, setSettings] = useState<SiteSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch settings
        const settingsDoc = await getDoc(doc(db, 'settings', 'site'));
        if (settingsDoc.exists()) {
          setSettings({ ...defaultSettings, ...settingsDoc.data() } as SiteSettings);
        }
        // Fetch featured products
        const q = query(collection(db, 'products'), where('featured', '==', true), orderBy('createdAt', 'desc'), limit(4));
        const snap = await getDocs(q);
        const prods = snap.docs.map(d => ({ id: d.id, ...d.data() }) as Product);
        if (prods.length === 0) {
          const allQ = query(collection(db, 'products'), orderBy('createdAt', 'desc'), limit(4));
          const allSnap = await getDocs(allQ);
          setFeatured(allSnap.docs.map(d => ({ id: d.id, ...d.data() }) as Product));
        } else {
          setFeatured(prods);
        }
      } catch (err) {
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleAddToCart = (e: React.MouseEvent, product: Product) => {
    e.stopPropagation();
    addToCart(product);
    toast.success(`${product.name} added to cart!`, {
      style: { background: '#3d1f14', color: '#f9edcf', borderRadius: '12px' },
      iconTheme: { primary: '#d4912a', secondary: '#3d1f14' }
    });
  };

  return (
    <div className="min-h-screen">
      {/* Special Banner */}
      {settings.showSpecialBanner && settings.specialBanner && (
        <div className="bg-gradient-to-r from-red-600 via-red-500 to-red-600 text-white text-center py-3 px-4 text-sm font-semibold animate-fadeIn">
          {settings.specialBanner}
        </div>
      )}

      {/* Hero Section */}
      <section className="relative min-h-[600px] flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={settings.heroImageUrl || '/images/hero-banner.jpg'}
            alt="Dubai Chocolates"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-chocolate-900/90 via-chocolate-900/70 to-chocolate-900/40"></div>
        </div>
        <div className="relative max-w-7xl mx-auto px-4 py-20 md:py-32">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-gold-500/20 text-gold-300 px-4 py-2 rounded-full text-sm font-medium mb-6 backdrop-blur-sm border border-gold-500/30">
              <Star size={16} fill="currentColor" /> Premium Quality Guaranteed
            </div>
            <h1 className="font-display text-4xl md:text-6xl font-bold text-white leading-tight mb-6">
              {settings.heroTitle}
            </h1>
            <p className="text-lg md:text-xl text-chocolate-200 mb-8 leading-relaxed">
              {settings.heroSubtitle}
            </p>
            <div className="flex flex-wrap gap-4">
              <button
                onClick={() => setCurrentPage('products')}
                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-gold-500 to-gold-400 text-chocolate-900 rounded-xl font-bold text-lg hover:from-gold-400 hover:to-gold-300 transition-all shadow-xl hover:shadow-2xl transform hover:-translate-y-1"
              >
                Shop Now <ChevronRight size={20} />
              </button>
              <button
                onClick={() => setCurrentPage('contact')}
                className="inline-flex items-center gap-2 px-8 py-4 bg-white/10 text-white rounded-xl font-semibold text-lg hover:bg-white/20 transition-all backdrop-blur-sm border border-white/20"
              >
                Contact Us
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { icon: <Truck className="text-gold-500" size={32} />, title: 'Island-wide Delivery', desc: 'LKR 150-450 up to 1Kg' },
              { icon: <Shield className="text-gold-500" size={32} />, title: '100% Authentic', desc: 'Genuine Dubai products' },
              { icon: <Award className="text-gold-500" size={32} />, title: 'Premium Quality', desc: 'Handpicked luxury items' },
              { icon: <Star className="text-gold-500" size={32} />, title: 'Best Prices', desc: 'Competitive pricing always' },
            ].map((f, i) => (
              <div key={i} className="flex flex-col items-center text-center p-6 rounded-2xl bg-gradient-to-b from-gold-50 to-white border border-gold-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                <div className="w-16 h-16 rounded-2xl bg-gold-100 flex items-center justify-center mb-4">
                  {f.icon}
                </div>
                <h3 className="font-display text-lg font-bold text-chocolate-800 mb-2">{f.title}</h3>
                <p className="text-sm text-chocolate-500">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-20 bg-gradient-to-b from-dubai-cream to-gold-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-chocolate-900 mb-4">
              ✨ Featured Products
            </h2>
            <p className="text-chocolate-500 text-lg max-w-2xl mx-auto">
              Discover our handpicked selection of premium Dubai chocolates and luxury products
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="w-12 h-12 border-4 border-gold-300 border-t-gold-600 rounded-full animate-spin"></div>
            </div>
          ) : featured.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featured.map((product, i) => (
                <div
                  key={product.id}
                  onClick={() => onProductClick(product)}
                  className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gold-100 cursor-pointer"
                  style={{ animationDelay: `${i * 0.1}s` }}
                >
                  <div className="relative h-56 overflow-hidden bg-chocolate-50">
                    <img
                      src={product.imageUrl || '/images/dubai-chocolate-1.jpg'}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    {product.featured && (
                      <span className="absolute top-3 left-3 bg-gold-500 text-chocolate-900 text-xs font-bold px-3 py-1 rounded-full">
                        ⭐ Featured
                      </span>
                    )}
                  </div>
                  <div className="p-5">
                    <h3 className="font-display text-lg font-bold text-chocolate-800 mb-1 line-clamp-1">{product.name}</h3>
                    <p className="text-sm text-chocolate-400 mb-3 line-clamp-2">{product.description}</p>
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-2xl font-bold text-gold-600">LKR {product.price.toLocaleString()}</span>
                        <p className="text-xs text-chocolate-400">{product.weight}g</p>
                      </div>
                      <button
                        onClick={(e) => handleAddToCart(e, product)}
                        className="p-3 bg-gradient-to-r from-gold-500 to-gold-400 text-chocolate-900 rounded-xl hover:from-gold-400 hover:to-gold-300 transition shadow-lg"
                      >
                        <ShoppingCart size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-chocolate-400 text-lg">Products coming soon! Stay tuned. 🍫</p>
            </div>
          )}

          <div className="text-center mt-10">
            <button
              onClick={() => setCurrentPage('products')}
              className="inline-flex items-center gap-2 px-8 py-3 bg-chocolate-900 text-gold-300 rounded-xl font-semibold hover:bg-chocolate-800 transition shadow-lg"
            >
              View All Products <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <img src="/images/dubai-chocolate-2.jpg" alt="Dubai Products" className="rounded-3xl shadow-2xl" />
            </div>
            <div>
              <h2 className="font-display text-3xl md:text-4xl font-bold text-chocolate-900 mb-6">
                Why Choose MRM Shopping? 🛍
              </h2>
              <p className="text-chocolate-600 leading-relaxed mb-6">
                {settings.aboutText}
              </p>
              <div className="space-y-4">
                {[
                  'Authentic Dubai chocolates imported directly',
                  'Premium quality guaranteed on every product',
                  'Island-wide delivery across Sri Lanka',
                  'Secure packaging for freshness',
                  'Customer satisfaction is our priority'
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-gold-500 flex items-center justify-center shrink-0">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#3d1f14" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                    </div>
                    <span className="text-chocolate-700">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gradient-to-r from-chocolate-900 via-chocolate-800 to-chocolate-900">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Taste the Finest? 🍫
          </h2>
          <p className="text-chocolate-200 text-lg mb-8">
            Order now and experience premium Dubai chocolates delivered to your doorstep
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <button
              onClick={() => setCurrentPage('products')}
              className="px-8 py-4 bg-gradient-to-r from-gold-500 to-gold-400 text-chocolate-900 rounded-xl font-bold text-lg hover:from-gold-400 hover:to-gold-300 transition shadow-xl"
            >
              Shop Now 🛒
            </button>
            <a
              href="https://wa.me/94707070872"
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-4 bg-green-600 text-white rounded-xl font-bold text-lg hover:bg-green-500 transition shadow-xl"
            >
              WhatsApp Order 💬
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
