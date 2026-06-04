import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { collection, getDocs, query, where, orderBy, limit, doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { Product, SiteSettings } from '../types';
import { useCart } from '../context/CartContext';
import { ShoppingCart, Star, Truck, Shield, Award, ChevronRight, Zap } from 'lucide-react';

const HomePage: React.FC = () => {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [newProducts, setNewProducts] = useState<Product[]>([]);
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [featSnap, newSnap, settingsSnap] = await Promise.all([
          getDocs(query(collection(db, 'products'), where('featured', '==', true), limit(6))),
          getDocs(query(collection(db, 'products'), orderBy('createdAt', 'desc'), limit(4))),
          getDoc(doc(db, 'settings', 'site')),
        ]);
        setFeaturedProducts(featSnap.docs.map(d => ({ id: d.id, ...d.data() } as Product)));
        setNewProducts(newSnap.docs.map(d => ({ id: d.id, ...d.data() } as Product)));
        if (settingsSnap.exists()) setSettings(settingsSnap.data() as SiteSettings);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const defaultHero = {
    title: 'Authentic Dubai Chocolate',
    subtitle: 'Experience the luxury of premium Dubai chocolates with pistachio, kunafa & gold flakes — delivered across Sri Lanka',
    imageUrl: '/images/hero-chocolate.jpg',
    ctaText: 'Shop Now',
  };

  const hero = settings?.heroBanner || defaultHero;

  return (
    <div className="bg-[#0d0500]">
      {/* Hero Section */}
      <section className="relative min-h-[92vh] flex items-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${hero.imageUrl})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0d0500]/95 via-[#0d0500]/70 to-transparent" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-amber-500/20 border border-amber-500/30 text-amber-400 px-4 py-1.5 rounded-full text-sm font-medium mb-6">
              <Zap size={14} /> Premium Dubai Collection 2025
            </div>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-tight mb-6">
              {hero.title.split(' ').map((word, i) => (
                <span key={i} className={i % 2 === 1 ? 'text-amber-400' : ''}>
                  {word}{' '}
                </span>
              ))}
            </h1>
            <p className="text-lg text-amber-100/70 mb-8 leading-relaxed">
              {hero.subtitle}
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                to="/products"
                className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all hover:scale-105 shadow-lg shadow-amber-500/25"
              >
                {hero.ctaText} <ChevronRight size={20} />
              </Link>
              <Link
                to="/tracking"
                className="inline-flex items-center gap-2 border border-amber-500/50 text-amber-300 hover:bg-amber-500/10 px-8 py-4 rounded-xl font-semibold text-lg transition-all"
              >
                Track Order
              </Link>
            </div>
            <div className="flex items-center gap-6 mt-10 flex-wrap">
              <div className="flex items-center gap-2 text-amber-200/60 text-sm">
                <Shield size={16} className="text-amber-500" />
                <span>100% Authentic</span>
              </div>
              <div className="flex items-center gap-2 text-amber-200/60 text-sm">
                <Truck size={16} className="text-amber-500" />
                <span>Island-wide Delivery</span>
              </div>
              <div className="flex items-center gap-2 text-amber-200/60 text-sm">
                <Award size={16} className="text-amber-500" />
                <span>Premium Quality</span>
              </div>
            </div>
          </div>
        </div>
        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 animate-bounce">
          <div className="w-0.5 h-8 bg-amber-500/40" />
          <div className="w-2 h-2 rounded-full bg-amber-500" />
        </div>
      </section>

      {/* Features bar */}
      <div className="bg-amber-500 py-3">
        <div className="max-w-7xl mx-auto px-4 flex flex-wrap justify-center gap-6 md:gap-12 text-sm font-medium text-white">
          <span className="flex items-center gap-2"><Truck size={16} /> Island-wide Delivery</span>
          <span className="flex items-center gap-2"><Shield size={16} /> Authentic Products</span>
          <span className="flex items-center gap-2"><Award size={16} /> Premium Quality</span>
          <span className="flex items-center gap-2"><Star size={16} /> 5-Star Rated</span>
        </div>
      </div>

      {/* Special Offer Banner */}
      {settings?.specialOffer?.enabled && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-amber-900 to-amber-700 p-8 md:p-12">
            <div className="absolute inset-0 opacity-10">
              <img src={settings.specialOffer.imageUrl || '/images/hero-chocolate.jpg'} alt="" className="w-full h-full object-cover" />
            </div>
            <div className="relative z-10">
              {settings.specialOffer.discount && (
                <span className="inline-block bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold mb-3">
                  {settings.specialOffer.discount}% OFF
                </span>
              )}
              <h2 className="text-2xl md:text-4xl font-bold text-white mb-2">{settings.specialOffer.title}</h2>
              <p className="text-amber-200 text-lg mb-6">{settings.specialOffer.description}</p>
              <Link to="/products" className="inline-flex items-center gap-2 bg-white text-amber-800 px-6 py-3 rounded-xl font-semibold hover:bg-amber-50 transition-colors">
                Shop Offer <ChevronRight size={18} />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-2xl md:text-3xl font-bold text-white text-center mb-8">
          Our <span className="text-amber-400">Collections</span>
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { name: 'Dubai Bars', emoji: '🍫', color: 'from-amber-900 to-amber-700', desc: 'Pistachio & Kunafa' },
            { name: 'Gift Boxes', emoji: '🎁', color: 'from-rose-900 to-rose-700', desc: 'Luxury Collections' },
            { name: 'Truffles', emoji: '✨', color: 'from-purple-900 to-purple-700', desc: 'Gold Dusted' },
            { name: 'Assorted', emoji: '🌟', color: 'from-emerald-900 to-emerald-700', desc: 'Mix & Match' },
          ].map(cat => (
            <Link
              key={cat.name}
              to={`/products?category=${encodeURIComponent(cat.name)}`}
              className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${cat.color} p-6 text-center hover:scale-105 transition-transform group cursor-pointer`}
            >
              <div className="text-4xl mb-3">{cat.emoji}</div>
              <h3 className="text-white font-semibold text-sm">{cat.name}</h3>
              <p className="text-white/60 text-xs mt-1">{cat.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      {(featuredProducts.length > 0 || !loading) && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-white">
              Featured <span className="text-amber-400">Products</span>
            </h2>
            <Link to="/products" className="text-amber-400 hover:text-amber-300 flex items-center gap-1 text-sm font-medium">
              View All <ChevronRight size={16} />
            </Link>
          </div>
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-amber-900/20 rounded-2xl h-64 animate-pulse" />
              ))}
            </div>
          ) : featuredProducts.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">🍫</div>
              <p className="text-amber-200/60">Products coming soon! Check back later.</p>
              <p className="text-amber-200/40 text-sm mt-2">Admin can add products from the Admin Panel</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {featuredProducts.map(product => (
                <ProductCard key={product.id} product={product} onAddToCart={addToCart} />
              ))}
            </div>
          )}
        </section>
      )}

      {/* New Arrivals */}
      {newProducts.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-white">
              New <span className="text-amber-400">Arrivals</span>
            </h2>
            <Link to="/products?sort=newest" className="text-amber-400 hover:text-amber-300 flex items-center gap-1 text-sm font-medium">
              View All <ChevronRight size={16} />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {newProducts.map(product => (
              <ProductCard key={product.id} product={product} onAddToCart={addToCart} />
            ))}
          </div>
        </section>
      )}

      {/* Why Choose Us */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-2xl md:text-3xl font-bold text-white text-center mb-12">
          Why Choose <span className="text-amber-400">MRM Shopping</span>?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { icon: '🍫', title: 'Authentic Dubai Chocolates', desc: 'We source directly from Dubai — genuine pistachio, kunafa and gold-flake chocolates.' },
            { icon: '🚚', title: 'Fast Island-wide Delivery', desc: 'We deliver across all Sri Lanka. Track your order live with our tracking system.' },
            { icon: '💎', title: 'Premium Packaging', desc: 'Every order is beautifully packaged to maintain freshness and luxury presentation.' },
          ].map(item => (
            <div key={item.title} className="text-center p-8 bg-amber-900/10 border border-amber-800/20 rounded-2xl hover:border-amber-600/40 transition-colors">
              <div className="text-5xl mb-4">{item.icon}</div>
              <h3 className="text-white font-semibold text-lg mb-2">{item.title}</h3>
              <p className="text-amber-200/50 text-sm leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Delivery Charges */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="bg-gradient-to-br from-amber-900/30 to-amber-800/10 border border-amber-800/20 rounded-2xl p-8">
          <h2 className="text-2xl font-bold text-white text-center mb-6">🚚 Delivery Charges</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { weight: 'Up to 250G', price: 'Rs. 250' },
              { weight: 'Up to 500G', price: 'Rs. 350' },
              { weight: 'Up to 1KG', price: 'Rs. 450' },
              { weight: 'Over 1KG', price: '+ Rs. 100 / 500g' },
            ].map(item => (
              <div key={item.weight} className="text-center p-4 bg-amber-900/20 rounded-xl">
                <div className="text-amber-400 font-bold text-xl">{item.price}</div>
                <div className="text-amber-200/60 text-sm mt-1">{item.weight}</div>
              </div>
            ))}
          </div>
          <p className="text-center text-amber-200/40 text-xs mt-4">* Delivery charge is calculated based on the total weight of your order</p>
        </div>
      </section>
    </div>
  );
};

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onAddToCart }) => {
  return (
    <div className="bg-[#1a0800] border border-amber-900/30 rounded-2xl overflow-hidden group hover:border-amber-600/50 hover:shadow-xl hover:shadow-amber-900/20 transition-all">
      <div className="relative overflow-hidden aspect-square bg-amber-950">
        {product.isNew && (
          <div className="absolute top-2 left-2 z-10 bg-green-500 text-white text-xs px-2 py-0.5 rounded-full font-medium">New</div>
        )}
        {product.discount && product.discount > 0 ? (
          <div className="absolute top-2 right-2 z-10 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full font-medium">{product.discount}% OFF</div>
        ) : null}
        <img
          src={product.imageUrl || '/images/dubai-choc-1.jpg'}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
        <button
          onClick={() => onAddToCart(product)}
          className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all whitespace-nowrap"
        >
          <ShoppingCart size={14} /> Add to Cart
        </button>
      </div>
      <div className="p-3">
        <Link to={`/products/${product.id}`}>
          <h3 className="text-white font-medium text-sm leading-tight hover:text-amber-400 transition-colors line-clamp-2">
            {product.name}
          </h3>
        </Link>
        <div className="flex items-center gap-1 mt-1 mb-2">
          {[...Array(5)].map((_, i) => (
            <Star key={i} size={10} className="text-amber-500 fill-amber-500" />
          ))}
          <span className="text-amber-200/40 text-xs ml-1">5.0</span>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <span className="text-amber-400 font-bold">Rs. {product.price.toLocaleString()}</span>
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="text-amber-200/40 text-xs line-through ml-1">Rs. {product.originalPrice.toLocaleString()}</span>
            )}
          </div>
          <span className="text-amber-200/40 text-xs">{product.weight}kg</span>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
