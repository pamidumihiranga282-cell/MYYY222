import React, { useState } from 'react';
import { Product } from '../types';
import { useCart } from '../context/CartContext';
import {
  ShoppingCart, ArrowLeft, MessageCircle, Zap, Package,
  Weight, Tag, CheckCircle, XCircle, Star, Plus, Minus
} from 'lucide-react';
import toast from 'react-hot-toast';

interface ProductDetailPageProps {
  product: Product;
  setCurrentPage: (page: string) => void;
}

const WHATSAPP_NUMBER = '94707070872';

const ProductDetailPage: React.FC<ProductDetailPageProps> = ({ product, setCurrentPage }) => {
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [imageError, setImageError] = useState(false);

  const inStock = product.stock > 0;

  const handleAddToCart = () => {
    if (!inStock) return;
    addToCart(product, quantity);
    toast.success(`${product.name} added to cart!`, {
      style: { background: '#3d1f14', color: '#f9edcf', borderRadius: '12px' },
      iconTheme: { primary: '#d4912a', secondary: '#3d1f14' }
    });
  };

  const handleBuyNow = () => {
    if (!inStock) return;
    addToCart(product, quantity);
    toast.success(`${product.name} added to cart!`, {
      style: { background: '#3d1f14', color: '#f9edcf', borderRadius: '12px' },
    });
    setCurrentPage('cart');
  };

  const handleWhatsApp = () => {
    const msg = encodeURIComponent(
      `Hello MRM Shopping! 👋\n\n` +
      `I'm interested in purchasing:\n` +
      `🍫 *${product.name}*\n` +
      `💰 Price: LKR ${product.price.toLocaleString()}\n` +
      `⚖️ Weight: ${product.weight}g\n` +
      `🔢 Quantity: ${quantity}\n\n` +
      `Please let me know about availability and delivery. Thank you!`
    );
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${msg}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-dubai-cream to-gold-50 py-8">
      <div className="max-w-5xl mx-auto px-4">

        {/* Back Button */}
        <button
          onClick={() => setCurrentPage('products')}
          className="flex items-center gap-2 text-chocolate-600 hover:text-chocolate-900 mb-6 transition font-medium group"
        >
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          Back to Products
        </button>

        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gold-100">
          <div className="grid md:grid-cols-2 gap-0">

            {/* Image Section */}
            <div className="relative bg-gradient-to-br from-chocolate-50 to-gold-50 min-h-[360px] md:min-h-[500px] flex items-center justify-center overflow-hidden">
              {!imageError && product.imageUrl ? (
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="w-full h-full object-cover absolute inset-0"
                  onError={() => setImageError(true)}
                />
              ) : (
                <div className="text-8xl animate-pulse">🍫</div>
              )}

              {/* Badges */}
              <div className="absolute top-4 left-4 flex flex-col gap-2">
                {product.featured && (
                  <span className="flex items-center gap-1 bg-gold-500 text-chocolate-900 text-sm font-bold px-3 py-1.5 rounded-full shadow-lg">
                    <Star size={14} fill="currentColor" /> Featured
                  </span>
                )}
                <span className={`flex items-center gap-1 text-sm font-bold px-3 py-1.5 rounded-full shadow-lg ${
                  inStock ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                }`}>
                  {inStock ? <><CheckCircle size={14} /> In Stock</> : <><XCircle size={14} /> Out of Stock</>}
                </span>
              </div>

              {/* Category badge */}
              <div className="absolute top-4 right-4">
                <span className="bg-chocolate-800/80 text-gold-300 text-xs font-medium px-3 py-1.5 rounded-full backdrop-blur-sm">
                  {product.category}
                </span>
              </div>
            </div>

            {/* Details Section */}
            <div className="p-8 flex flex-col justify-between">
              <div>
                <h1 className="font-display text-3xl font-bold text-chocolate-900 mb-3 leading-tight">
                  {product.name}
                </h1>

                <div className="flex items-center gap-4 mb-5 text-sm text-chocolate-500">
                  <span className="flex items-center gap-1.5">
                    <Weight size={15} className="text-gold-500" />
                    {product.weight}g
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Tag size={15} className="text-gold-500" />
                    {product.category}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Package size={15} className="text-gold-500" />
                    {inStock ? 'Available' : 'Unavailable'}
                  </span>
                </div>

                <p className="text-chocolate-600 text-base leading-relaxed mb-6">
                  {product.description || 'Premium quality product brought directly from Dubai.'}
                </p>

                {/* Price */}
                <div className="bg-gradient-to-r from-gold-50 to-amber-50 rounded-2xl p-5 mb-6 border border-gold-200">
                  <p className="text-sm text-chocolate-500 mb-1">Price</p>
                  <p className="text-4xl font-bold text-gold-600">
                    LKR {product.price.toLocaleString()}
                  </p>
                  <p className="text-xs text-chocolate-400 mt-1">per {product.weight}g unit</p>
                </div>

                {/* Delivery Info */}
                <div className="bg-blue-50 rounded-xl p-4 mb-6 border border-blue-100">
                  <p className="text-sm font-semibold text-blue-700 mb-1">🚚 Delivery Charges</p>
                  <div className="text-xs text-blue-600 space-y-0.5">
                    <p>250g → Rs. 250 &nbsp;|&nbsp; 500g → Rs. 350 &nbsp;|&nbsp; 1kg → Rs. 450</p>
                  </div>
                </div>

                {/* Quantity Selector */}
                <div className="flex items-center gap-4 mb-6">
                  <span className="text-sm font-medium text-chocolate-700">Quantity:</span>
                  <div className="flex items-center gap-2 bg-gold-50 rounded-xl p-1 border border-gold-200">
                    <button
                      onClick={() => setQuantity(q => Math.max(1, q - 1))}
                      className="w-9 h-9 rounded-lg bg-white shadow flex items-center justify-center text-chocolate-700 hover:bg-gold-100 transition"
                    >
                      <Minus size={16} />
                    </button>
                    <span className="w-10 text-center font-bold text-chocolate-900 text-lg">{quantity}</span>
                    <button
                      onClick={() => setQuantity(q => q + 1)}
                      className="w-9 h-9 rounded-lg bg-white shadow flex items-center justify-center text-chocolate-700 hover:bg-gold-100 transition"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                  <span className="text-sm text-chocolate-500">
                    = LKR {(product.price * quantity).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={handleAddToCart}
                    disabled={!inStock}
                    className="flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-gold-500 to-gold-400 text-chocolate-900 rounded-xl font-bold hover:from-gold-400 hover:to-gold-300 transition shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ShoppingCart size={18} />
                    Add to Cart
                  </button>
                  <button
                    onClick={handleBuyNow}
                    disabled={!inStock}
                    className="flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-chocolate-800 to-chocolate-700 text-gold-300 rounded-xl font-bold hover:from-chocolate-700 hover:to-chocolate-600 transition shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Zap size={18} />
                    Buy Now
                  </button>
                </div>
                <button
                  onClick={handleWhatsApp}
                  className="w-full flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-xl font-bold hover:from-green-500 hover:to-green-400 transition shadow-lg"
                >
                  <MessageCircle size={18} />
                  Enquire on WhatsApp
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;
