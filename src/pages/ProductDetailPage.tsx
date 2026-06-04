import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { Product } from '../types';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { ShoppingCart, Star, Truck, Shield, ArrowLeft, Plus, Minus, Package } from 'lucide-react';
import toast from 'react-hot-toast';

const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const { addToCart } = useCart();
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetch = async () => {
      if (!id) return;
      try {
        const snap = await getDoc(doc(db, 'products', id));
        if (snap.exists()) setProduct({ id: snap.id, ...snap.data() } as Product);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id]);

  const calcDelivery = (w: number) => {
    if (w <= 0.25) return 150;
    if (w <= 0.5) return 250;
    if (w <= 0.75) return 350;
    return 450;
  };

  const handleAddToCart = () => {
    if (!currentUser) {
      toast.error('Please login to add items to cart');
      navigate('/login');
      return;
    }
    if (product) {
      addToCart(product, quantity);
    }
  };

  const handleBuyNow = () => {
    if (!currentUser) {
      toast.error('Please login to continue');
      navigate('/login');
      return;
    }
    if (product) {
      addToCart(product, quantity);
      navigate('/cart');
    }
  };

  if (loading) return (
    <div className="bg-[#0d0500] min-h-screen flex items-center justify-center">
      <div className="animate-spin w-10 h-10 border-2 border-amber-500 border-t-transparent rounded-full" />
    </div>
  );

  if (!product) return (
    <div className="bg-[#0d0500] min-h-screen flex flex-col items-center justify-center text-white">
      <p>Product not found</p>
      <Link to="/products" className="text-amber-400 mt-4">← Back to Products</Link>
    </div>
  );

  const images = [product.imageUrl, ...(product.images || [])].filter(Boolean);
  const delivery = calcDelivery(product.weight * quantity);

  return (
    <div className="bg-[#0d0500] min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link to="/products" className="inline-flex items-center gap-2 text-amber-400 hover:text-amber-300 mb-8 transition-colors">
          <ArrowLeft size={16} /> Back to Products
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Images */}
          <div>
            <div className="aspect-square rounded-2xl overflow-hidden bg-amber-950 mb-4">
              <img
                src={images[selectedImage] || '/images/dubai-choc-1.jpg'}
                alt={product.name}
                className="w-full h-full object-cover"
                onError={e => { (e.target as HTMLImageElement).src = '/images/dubai-choc-1.jpg'; }}
              />
            </div>
            {images.length > 1 && (
              <div className="flex gap-3">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={`w-20 h-20 rounded-xl overflow-hidden border-2 transition-colors ${i === selectedImage ? 'border-amber-500' : 'border-transparent'}`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div>
            {product.isNew && (
              <span className="inline-block bg-green-500/20 text-green-400 border border-green-500/30 text-xs px-3 py-1 rounded-full mb-3">New Arrival</span>
            )}
            <h1 className="text-3xl font-bold text-white mb-3">{product.name}</h1>

            <div className="flex items-center gap-2 mb-4">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={16} className="text-amber-500 fill-amber-500" />
                ))}
              </div>
              <span className="text-amber-200/50 text-sm">5.0 (Premium Quality)</span>
            </div>

            <div className="flex items-baseline gap-3 mb-6">
              <span className="text-4xl font-bold text-amber-400">Rs. {product.price.toLocaleString()}</span>
              {product.originalPrice && product.originalPrice > product.price && (
                <span className="text-xl text-amber-200/40 line-through">Rs. {product.originalPrice.toLocaleString()}</span>
              )}
              {product.discount && product.discount > 0 ? (
                <span className="bg-red-500/20 text-red-400 text-sm px-2 py-0.5 rounded-full">{product.discount}% OFF</span>
              ) : null}
            </div>

            <p className="text-amber-200/60 leading-relaxed mb-6">{product.description}</p>

            {/* Details */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-amber-900/20 border border-amber-800/20 rounded-xl p-3">
                <div className="text-amber-400 text-xs font-medium mb-1">Weight</div>
                <div className="text-white font-semibold">{product.weight} kg</div>
              </div>
              <div className="bg-amber-900/20 border border-amber-800/20 rounded-xl p-3">
                <div className="text-amber-400 text-xs font-medium mb-1">Category</div>
                <div className="text-white font-semibold">{product.category || 'Chocolate'}</div>
              </div>
              <div className="bg-amber-900/20 border border-amber-800/20 rounded-xl p-3">
                <div className="text-amber-400 text-xs font-medium mb-1">Stock</div>
                <div className={`font-semibold ${product.stock > 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {product.stock > 0 ? `${product.stock} available` : 'Out of Stock'}
                </div>
              </div>
              <div className="bg-amber-900/20 border border-amber-800/20 rounded-xl p-3">
                <div className="text-amber-400 text-xs font-medium mb-1">Delivery</div>
                <div className="text-white font-semibold">Rs. {delivery}</div>
              </div>
            </div>

            {/* Quantity */}
            <div className="flex items-center gap-4 mb-6">
              <span className="text-amber-200/60 text-sm">Quantity:</span>
              <div className="flex items-center gap-3 bg-amber-900/20 border border-amber-800/30 rounded-xl px-3 py-2">
                <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="text-amber-400 hover:text-white transition-colors">
                  <Minus size={16} />
                </button>
                <span className="text-white font-semibold w-6 text-center">{quantity}</span>
                <button onClick={() => setQuantity(q => q + 1)} className="text-amber-400 hover:text-white transition-colors">
                  <Plus size={16} />
                </button>
              </div>
              <span className="text-amber-200/40 text-sm">Total weight: {(product.weight * quantity).toFixed(2)}kg</span>
            </div>

            {/* Actions */}
            <div className="flex gap-3 mb-8">
              <button
                onClick={handleAddToCart}
                disabled={product.stock <= 0}
                className="flex-1 flex items-center justify-center gap-2 bg-amber-500/20 border border-amber-500/50 text-amber-400 hover:bg-amber-500/30 px-6 py-4 rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ShoppingCart size={18} /> Add to Cart
              </button>
              <button
                onClick={handleBuyNow}
                disabled={product.stock <= 0}
                className="flex-1 bg-amber-500 hover:bg-amber-600 text-white px-6 py-4 rounded-xl font-semibold transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Buy Now
              </button>
            </div>

            {/* Trust badges */}
            <div className="grid grid-cols-3 gap-3">
              <div className="flex flex-col items-center text-center p-3 bg-amber-900/10 rounded-xl">
                <Truck size={20} className="text-amber-500 mb-1" />
                <span className="text-xs text-amber-200/50">Fast Delivery</span>
              </div>
              <div className="flex flex-col items-center text-center p-3 bg-amber-900/10 rounded-xl">
                <Shield size={20} className="text-amber-500 mb-1" />
                <span className="text-xs text-amber-200/50">100% Authentic</span>
              </div>
              <div className="flex flex-col items-center text-center p-3 bg-amber-900/10 rounded-xl">
                <Package size={20} className="text-amber-500 mb-1" />
                <span className="text-xs text-amber-200/50">Safe Packaging</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;
