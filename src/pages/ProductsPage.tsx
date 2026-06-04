import React, { useEffect, useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { Product } from '../types';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { ShoppingCart, Star, Search, SlidersHorizontal, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

const ProductsPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchInput, setSearchInput] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'newest');
  const [showFilters, setShowFilters] = useState(false);
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const snap = await getDocs(query(collection(db, 'products'), orderBy('createdAt', 'desc')));
        setProducts(snap.docs.map(d => ({ id: d.id, ...d.data() } as Product)));
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const categories = ['All', ...Array.from(new Set(products.map(p => p.category).filter(Boolean)))];

  const filtered = products
    .filter(p => {
      const search = searchParams.get('search') || searchInput;
      const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.description?.toLowerCase().includes(search.toLowerCase());
      const cat = searchParams.get('category') || selectedCategory;
      const matchCat = !cat || cat === 'All' || p.category === cat;
      return matchSearch && matchCat;
    })
    .sort((a, b) => {
      if (sortBy === 'price-asc') return a.price - b.price;
      if (sortBy === 'price-desc') return b.price - a.price;
      return 0; // newest by default (already sorted by createdAt)
    });

  return (
    <div className="bg-[#0d0500] min-h-screen">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#1a0800] to-[#0d0500] py-12 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-3">
            Our <span className="text-amber-400">Products</span>
          </h1>
          <p className="text-amber-200/60">Authentic Dubai chocolates delivered to your door</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search & Filter bar */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-1 relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-500" />
            <input
              type="text"
              value={searchInput}
              onChange={e => {
                setSearchInput(e.target.value);
                const p = new URLSearchParams(searchParams);
                if (e.target.value) p.set('search', e.target.value);
                else p.delete('search');
                setSearchParams(p);
              }}
              placeholder="Search products..."
              className="w-full bg-[#1a0800] border border-amber-900/30 text-white placeholder-amber-200/30 rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:border-amber-500 transition-colors"
            />
          </div>
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
            className="bg-[#1a0800] border border-amber-900/30 text-amber-200 rounded-xl px-4 py-3 focus:outline-none focus:border-amber-500"
          >
            <option value="newest" className="bg-[#1a0800] text-white">Newest First</option>
            <option value="price-asc" className="bg-[#1a0800] text-white">Price: Low to High</option>
            <option value="price-desc" className="bg-[#1a0800] text-white">Price: High to Low</option>
          </select>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 bg-amber-500/20 border border-amber-500/30 text-amber-400 px-4 py-3 rounded-xl hover:bg-amber-500/30 transition-colors"
          >
            <SlidersHorizontal size={16} /> Filters
          </button>
        </div>

        {/* Category pills */}
        <div className="flex flex-wrap gap-2 mb-8">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => {
                const p = new URLSearchParams(searchParams);
                if (cat === 'All') p.delete('category');
                else p.set('category', cat);
                setSearchParams(p);
                setSelectedCategory(cat === 'All' ? '' : cat);
              }}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                (selectedCategory === cat) || (cat === 'All' && !selectedCategory)
                  ? 'bg-amber-500 text-white'
                  : 'bg-amber-900/20 text-amber-300 hover:bg-amber-900/40 border border-amber-800/30'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-amber-900/10 rounded-2xl h-72 animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24">
            <div className="text-6xl mb-4">🍫</div>
            <h3 className="text-white text-xl font-semibold mb-2">No products found</h3>
            <p className="text-amber-200/50">Try adjusting your search or filters</p>
          </div>
        ) : (
          <>
            <p className="text-amber-200/40 text-sm mb-4">{filtered.length} products found</p>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {filtered.map(product => (
                <ProductCard key={product.id} product={product} onAddToCart={addToCart} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onAddToCart }) => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!currentUser) {
      toast.error('Please login to add items to cart');
      navigate('/login');
      return;
    }
    onAddToCart(product);
  };

  return (
    <Link
      to={`/products/${product.id}`}
      className="block bg-[#1a0800] border border-amber-900/30 rounded-2xl overflow-hidden group hover:border-amber-600/50 hover:shadow-xl hover:shadow-amber-900/20 transition-all cursor-pointer"
    >
      <div className="relative overflow-hidden aspect-square bg-amber-950">
        {product.isNew && (
          <div className="absolute top-2 left-2 z-10 bg-green-500 text-white text-xs px-2 py-0.5 rounded-full font-medium">New</div>
        )}
        {product.discount ? (
          <div className="absolute top-2 right-2 z-10 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full font-medium">{product.discount}% OFF</div>
        ) : null}
        <img
          src={product.imageUrl || '/images/dubai-choc-1.jpg'}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          onError={e => { (e.target as HTMLImageElement).src = '/images/dubai-choc-1.jpg'; }}
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors" />
        {/* View detail hint */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col items-center gap-1 pointer-events-none">
          <ArrowRight size={28} className="text-white drop-shadow-lg" />
          <span className="text-white text-xs font-semibold bg-black/50 px-2 py-0.5 rounded-full whitespace-nowrap">View Details</span>
        </div>
        <button
          onClick={handleAddToCart}
          className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all whitespace-nowrap"
        >
          <ShoppingCart size={14} /> Add to Cart
        </button>
      </div>
      <div className="p-3">
        <h3 className="text-white font-medium text-sm leading-tight group-hover:text-amber-400 transition-colors line-clamp-2">
          {product.name}
        </h3>
        <div className="flex items-center gap-1 mt-1 mb-2">
          {[...Array(5)].map((_, i) => (
            <Star key={i} size={10} className="text-amber-500 fill-amber-500" />
          ))}
        </div>
        {product.category && (
          <div className="text-amber-500/60 text-xs mb-1 font-medium">{product.category}</div>
        )}
        <div className="flex items-center justify-between">
          <div>
            <span className="text-amber-400 font-bold">Rs. {product.price.toLocaleString()}</span>
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="text-amber-200/40 text-xs line-through ml-1">Rs. {product.originalPrice.toLocaleString()}</span>
            )}
          </div>
          <span className="text-amber-200/40 text-xs">{product.weight}kg</span>
        </div>
        {product.stock <= 0 ? (
          <div className="mt-2 text-xs text-red-400 font-medium">Out of Stock</div>
        ) : (
          <div className="mt-2 text-xs text-green-400/70 font-medium">In Stock</div>
        )}
      </div>
    </Link>
  );
};

export default ProductsPage;
