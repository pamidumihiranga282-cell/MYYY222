import React, { useEffect, useState } from 'react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Product } from '../types';
import { useCart } from '../context/CartContext';
import { ShoppingCart, Search, Filter, Eye } from 'lucide-react';
import toast from 'react-hot-toast';

interface ProductsPageProps {
  setCurrentPage: (page: string) => void;
  onProductClick: (product: Product) => void;
}

const ProductsPage: React.FC<ProductsPageProps> = ({ setCurrentPage, onProductClick }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filtered, setFiltered] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [categories, setCategories] = useState<string[]>([]);
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const q = query(collection(db, 'products'), orderBy('createdAt', 'desc'));
        const snap = await getDocs(q);
        const prods = snap.docs.map(d => ({ id: d.id, ...d.data() }) as Product);
        setProducts(prods);
        setFiltered(prods);
        const cats = [...new Set(prods.map(p => p.category).filter(Boolean))];
        setCategories(cats);
      } catch (err) {
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  useEffect(() => {
    let result = products;
    if (search) {
      result = result.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.description.toLowerCase().includes(search.toLowerCase())
      );
    }
    if (category !== 'all') {
      result = result.filter(p => p.category === category);
    }
    setFiltered(result);
  }, [search, category, products]);

  const handleAddToCart = (e: React.MouseEvent, product: Product) => {
    e.stopPropagation();
    if (product.stock <= 0) return;
    addToCart(product);
    toast.success(`${product.name} added to cart!`, {
      style: { background: '#3d1f14', color: '#f9edcf', borderRadius: '12px' },
      iconTheme: { primary: '#d4912a', secondary: '#3d1f14' }
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-dubai-cream to-gold-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="font-display text-4xl font-bold text-chocolate-900 mb-3">
            🍫 Our Products
          </h1>
          <p className="text-chocolate-500 text-lg">Premium Dubai chocolates and luxury products</p>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-chocolate-400" size={20} />
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white rounded-xl border border-gold-200 focus:border-gold-500 focus:ring-2 focus:ring-gold-200 outline-none text-chocolate-800 transition"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-chocolate-400" size={20} />
            <select
              value={category}
              onChange={e => setCategory(e.target.value)}
              className="pl-12 pr-8 py-3 bg-white rounded-xl border border-gold-200 focus:border-gold-500 focus:ring-2 focus:ring-gold-200 outline-none text-chocolate-800 appearance-none min-w-[200px] transition"
            >
              <option value="all">All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-16 h-16 border-4 border-gold-300 border-t-gold-600 rounded-full animate-spin"></div>
          </div>
        ) : filtered.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filtered.map((product, i) => (
              <div
                key={product.id}
                onClick={() => onProductClick(product)}
                className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gold-100 animate-fadeIn cursor-pointer"
                style={{ animationDelay: `${i * 0.05}s` }}
              >
                <div className="relative h-56 overflow-hidden bg-chocolate-50">
                  <img
                    src={product.imageUrl || '/images/dubai-chocolate-1.jpg'}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  {product.featured && (
                    <span className="absolute top-3 left-3 bg-gold-500 text-chocolate-900 text-xs font-bold px-3 py-1 rounded-full shadow">
                      ⭐ Featured
                    </span>
                  )}
                  {product.stock <= 0 && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                      <span className="bg-red-600 text-white px-4 py-2 rounded-lg font-bold">Out of Stock</span>
                    </div>
                  )}
                  {product.stock > 0 && (
                    <span className="absolute bottom-3 left-3 bg-green-500/90 text-white text-xs font-bold px-2 py-1 rounded-full">
                      ✓ In Stock
                    </span>
                  )}
                  <span className="absolute top-3 right-3 bg-chocolate-800/80 text-gold-300 text-xs px-2 py-1 rounded-full">
                    {product.category}
                  </span>

                  {/* View Details overlay */}
                  <div className="absolute inset-0 bg-chocolate-900/0 group-hover:bg-chocolate-900/20 transition-all duration-300 flex items-center justify-center">
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white/90 text-chocolate-900 font-semibold text-sm px-4 py-2 rounded-full flex items-center gap-2">
                      <Eye size={14} /> View Details
                    </span>
                  </div>
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
                      disabled={product.stock <= 0}
                      className="p-3 bg-gradient-to-r from-gold-500 to-gold-400 text-chocolate-900 rounded-xl hover:from-gold-400 hover:to-gold-300 transition shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Add to Cart"
                    >
                      <ShoppingCart size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🍫</div>
            <h3 className="font-display text-2xl font-bold text-chocolate-700 mb-2">No Products Found</h3>
            <p className="text-chocolate-400">Try adjusting your search or check back later!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductsPage;
