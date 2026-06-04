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
    if (w <= 0.25) return 250;
    if (w <= 0.5) return 350;
    if (w <= 1) return 450;
    const extra = Math.ceil((w - 1) / 0.5);
    return 450 + extra * 100;
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

  const handleWhatsAppInquiry = () => {
    if (!product) return;
    const msg = `🍫 *MRM Shopping - WhatsApp Order / Inquiry*\n\nHello! I would like to order / inquire about the following product:\n\n*Product Name:* ${product.name}\n*Price:* Rs. ${product.price.toLocaleString()}\n*Weight:* ${product.weight} kg\n*Quantity:* ${quantity}\n*Total Price:* Rs. ${(product.price * quantity).toLocaleString()}\n\nIs it available? Please let me know the next steps. Thank you!`;
    const encoded = encodeURIComponent(msg);
    const url = `https://wa.me/94707070872?text=${encoded}`;
    window.open(url, '_blank');
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
                  {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
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
            <div className="flex flex-col gap-3 mb-8">
              <div className="flex gap-3">
                <button
                  onClick={handleAddToCart}
                  disabled={product.stock <= 0}
                  className="flex-1 flex items-center justify-center gap-2 bg-amber-500/20 border border-amber-500/50 text-amber-400 hover:bg-amber-500/30 px-6 py-4 rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm whitespace-nowrap"
                >
                  <ShoppingCart size={18} /> Add to Cart
                </button>
                <button
                  onClick={handleBuyNow}
                  disabled={product.stock <= 0}
                  className="flex-1 bg-amber-500 hover:bg-amber-600 text-white px-6 py-4 rounded-xl font-semibold transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  Buy Now
                </button>
              </div>
              <button
                onClick={handleWhatsAppInquiry}
                className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-4 rounded-xl font-semibold transition-all hover:scale-[1.02] text-sm"
              >
                <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                Order via WhatsApp
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
