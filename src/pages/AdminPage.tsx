import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, orderBy, setDoc, getDoc
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../lib/firebase';
import { Product, Order, UserProfile, SiteSettings } from '../types';
import {
  Shield, Package, ShoppingBag, Users, Settings, Plus, Edit, Trash2,
  Save, X, Upload, TrendingUp
} from 'lucide-react';
import toast from 'react-hot-toast';

interface AdminPageProps {
  setCurrentPage: (page: string) => void;
}

const defaultSettings: SiteSettings = {
  heroTitle: 'Premium Dubai Chocolates & Products',
  heroSubtitle: 'Experience the finest luxury from Dubai, delivered with love to your doorstep.',
  specialBanner: '🎉 Grand Opening Sale — 20% OFF on all Dubai Chocolate Bars! 🍫',
  showSpecialBanner: true,
  heroImageUrl: '/images/hero-banner.jpg',
  aboutText: 'We bring the finest products from Dubai directly to you.'
};

const AdminPage: React.FC<AdminPageProps> = ({ setCurrentPage }) => {
  const { isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'products' | 'orders' | 'users' | 'settings'>('dashboard');
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [settings, setSettings] = useState<SiteSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);

  // Product form
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productForm, setProductForm] = useState({
    name: '', description: '', price: 0, weight: 0, category: '', imageUrl: '', stock: 0, featured: false
  });
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Order editing
  const [editingOrder, setEditingOrder] = useState<string | null>(null);
  const [orderStatus, setOrderStatus] = useState('');
  const [orderTracking, setOrderTracking] = useState('');

  useEffect(() => {
    if (!isAdmin) return;
    fetchAll();
  }, [isAdmin]);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [prodSnap, orderSnap, userSnap] = await Promise.all([
        getDocs(query(collection(db, 'products'), orderBy('createdAt', 'desc'))),
        getDocs(query(collection(db, 'orders'), orderBy('createdAt', 'desc'))),
        getDocs(collection(db, 'users'))
      ]);
      setProducts(prodSnap.docs.map(d => ({ id: d.id, ...d.data() }) as Product));
      setOrders(orderSnap.docs.map(d => ({ id: d.id, ...d.data() }) as Order));
      setUsers(userSnap.docs.map(d => ({ uid: d.id, ...d.data() }) as UserProfile));

      const settingsDoc = await getDoc(doc(db, 'settings', 'site'));
      if (settingsDoc.exists()) {
        setSettings({ ...defaultSettings, ...settingsDoc.data() } as SiteSettings);
      }
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-dubai-cream to-gold-50 flex items-center justify-center">
        <div className="text-center">
          <Shield size={60} className="text-red-300 mx-auto mb-4" />
          <h2 className="font-display text-2xl font-bold text-chocolate-900 mb-3">Access Denied</h2>
          <p className="text-chocolate-500 mb-4">You don't have admin privileges.</p>
          <button onClick={() => setCurrentPage('home')} className="px-6 py-3 bg-gold-500 text-chocolate-900 rounded-xl font-bold">
            Go Home
          </button>
        </div>
      </div>
    );
  }

  // Product handlers
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const storageRef = ref(storage, `products/${Date.now()}_${file.name}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      setProductForm(prev => ({ ...prev, imageUrl: url }));
      toast.success('Image uploaded!');
    } catch (err) {
      console.error('Upload error:', err);
      toast.error('Upload failed. Using URL input instead.');
    } finally {
      setUploading(false);
    }
  };

  const handleSaveProduct = async () => {
    if (!productForm.name || !productForm.price) {
      toast.error('Name and price are required');
      return;
    }
    try {
      if (editingProduct) {
        await updateDoc(doc(db, 'products', editingProduct.id), {
          ...productForm,
          price: Number(productForm.price),
          weight: Number(productForm.weight),
          stock: Number(productForm.stock)
        });
        toast.success('Product updated!');
      } else {
        await addDoc(collection(db, 'products'), {
          ...productForm,
          price: Number(productForm.price),
          weight: Number(productForm.weight),
          stock: Number(productForm.stock),
          createdAt: Date.now()
        });
        toast.success('Product added!');
      }
      setShowProductForm(false);
      setEditingProduct(null);
      setProductForm({ name: '', description: '', price: 0, weight: 0, category: '', imageUrl: '', stock: 0, featured: false });
      fetchAll();
    } catch (err) {
      toast.error('Failed to save product');
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Delete this product?')) return;
    try {
      await deleteDoc(doc(db, 'products', id));
      toast.success('Product deleted');
      fetchAll();
    } catch (err) {
      toast.error('Failed to delete');
    }
  };

  const handleEditProduct = (p: Product) => {
    setEditingProduct(p);
    setProductForm({
      name: p.name, description: p.description, price: p.price, weight: p.weight,
      category: p.category, imageUrl: p.imageUrl, stock: p.stock, featured: p.featured
    });
    setShowProductForm(true);
  };

  // Order handlers
  const handleUpdateOrder = async (orderId: string) => {
    try {
      const updateData: any = { updatedAt: Date.now() };
      if (orderStatus) updateData.status = orderStatus;
      if (orderTracking) updateData.trackingNumber = orderTracking;

      await updateDoc(doc(db, 'orders', orderId), updateData);

      // WhatsApp notification to customer
      const order = orders.find(o => o.id === orderId);
      if (order && orderStatus) {
        const msg = encodeURIComponent(
          `🛍 *MRM Shopping - Order Update*\n\n` +
          `Hi ${order.userName}!\n\n` +
          `Your order *${order.trackingNumber}* has been updated.\n` +
          `📦 New Status: *${orderStatus.toUpperCase()}*\n\n` +
          `Track your order anytime on our website.\n` +
          `Thank you for shopping with MRM Shopping! ✅`
        );
        window.open(`https://wa.me/${order.userPhone?.replace(/\D/g, '')}?text=${msg}`, '_blank');
      }

      toast.success('Order updated!');
      setEditingOrder(null);
      setOrderStatus('');
      setOrderTracking('');
      fetchAll();
    } catch (err) {
      toast.error('Failed to update order');
    }
  };

  // User handlers
  const handleDeleteUser = async (uid: string) => {
    if (!confirm('Delete this user? This cannot be undone.')) return;
    try {
      await deleteDoc(doc(db, 'users', uid));
      toast.success('User deleted');
      fetchAll();
    } catch (err) {
      toast.error('Failed to delete user');
    }
  };

  const handleToggleAdmin = async (uid: string, current: boolean) => {
    try {
      await updateDoc(doc(db, 'users', uid), { isAdmin: !current });
      toast.success(`Admin status ${!current ? 'granted' : 'revoked'}`);
      fetchAll();
    } catch (err) {
      toast.error('Failed to update');
    }
  };

  // Settings handlers
  const handleSaveSettings = async () => {
    try {
      await setDoc(doc(db, 'settings', 'site'), settings);
      toast.success('Settings saved! 🎉');
    } catch (err) {
      toast.error('Failed to save settings');
    }
  };

  const handleHeroImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const storageRef = ref(storage, `site/hero_${Date.now()}_${file.name}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      setSettings(prev => ({ ...prev, heroImageUrl: url }));
      toast.success('Hero image uploaded!');
    } catch (err) {
      toast.error('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const tabs = [
    { id: 'dashboard' as const, label: 'Dashboard', icon: <TrendingUp size={18} /> },
    { id: 'products' as const, label: 'Products', icon: <Package size={18} /> },
    { id: 'orders' as const, label: 'Orders', icon: <ShoppingBag size={18} /> },
    { id: 'users' as const, label: 'Users', icon: <Users size={18} /> },
    { id: 'settings' as const, label: 'Settings', icon: <Settings size={18} /> },
  ];

  const totalRevenue = orders.filter(o => o.status !== 'cancelled').reduce((s, o) => s + o.total, 0);
  const pendingOrders = orders.filter(o => o.status === 'pending').length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Header */}
      <div className="bg-gradient-to-r from-chocolate-900 to-chocolate-800 text-white p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="text-gold-400" size={24} />
            <h1 className="font-display text-xl font-bold">Admin Panel</h1>
          </div>
          <button onClick={() => setCurrentPage('home')} className="text-sm text-chocolate-300 hover:text-gold-400 transition">
            ← Back to Site
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto flex overflow-x-auto">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-4 text-sm font-medium whitespace-nowrap transition border-b-2 ${
                activeTab === tab.id
                  ? 'border-gold-500 text-gold-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.icon} {tab.label}
              {tab.id === 'orders' && pendingOrders > 0 && (
                <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {pendingOrders}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 md:p-6">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-12 h-12 border-4 border-gold-300 border-t-gold-600 rounded-full animate-spin"></div>
          </div>
        ) : (
          <>
            {/* Dashboard */}
            {activeTab === 'dashboard' && (
              <div className="space-y-6 animate-fadeIn">
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-white rounded-2xl p-6 shadow-lg border-l-4 border-gold-500">
                    <p className="text-sm text-gray-500">Total Revenue</p>
                    <p className="text-2xl font-bold text-chocolate-900">LKR {totalRevenue.toLocaleString()}</p>
                  </div>
                  <div className="bg-white rounded-2xl p-6 shadow-lg border-l-4 border-blue-500">
                    <p className="text-sm text-gray-500">Total Orders</p>
                    <p className="text-2xl font-bold text-chocolate-900">{orders.length}</p>
                  </div>
                  <div className="bg-white rounded-2xl p-6 shadow-lg border-l-4 border-green-500">
                    <p className="text-sm text-gray-500">Products</p>
                    <p className="text-2xl font-bold text-chocolate-900">{products.length}</p>
                  </div>
                  <div className="bg-white rounded-2xl p-6 shadow-lg border-l-4 border-purple-500">
                    <p className="text-sm text-gray-500">Customers</p>
                    <p className="text-2xl font-bold text-chocolate-900">{users.length}</p>
                  </div>
                </div>

                {/* Recent Orders */}
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <h3 className="font-display text-lg font-bold text-chocolate-900 mb-4">Recent Orders</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gold-50">
                        <tr>
                          <th className="text-left p-3 rounded-l-lg">Tracking</th>
                          <th className="text-left p-3">Customer</th>
                          <th className="text-left p-3">Total</th>
                          <th className="text-left p-3">Status</th>
                          <th className="text-left p-3 rounded-r-lg">Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {orders.slice(0, 5).map(order => (
                          <tr key={order.id} className="border-b border-gray-50 hover:bg-gold-50/50">
                            <td className="p-3 font-mono text-xs">{order.trackingNumber}</td>
                            <td className="p-3">{order.userName}</td>
                            <td className="p-3 font-semibold">LKR {order.total.toLocaleString()}</td>
                            <td className="p-3">
                              <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                                order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                                order.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                                'bg-gold-100 text-gold-700'
                              }`}>
                                {order.status}
                              </span>
                            </td>
                            <td className="p-3 text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Products Tab */}
            {activeTab === 'products' && (
              <div className="animate-fadeIn">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-display text-2xl font-bold text-chocolate-900">Products ({products.length})</h2>
                  <button
                    onClick={() => {
                      setEditingProduct(null);
                      setProductForm({ name: '', description: '', price: 0, weight: 0, category: '', imageUrl: '', stock: 0, featured: false });
                      setShowProductForm(true);
                    }}
                    className="flex items-center gap-2 px-5 py-2.5 bg-gold-500 text-chocolate-900 rounded-xl font-bold hover:bg-gold-400 transition shadow-lg"
                  >
                    <Plus size={18} /> Add Product
                  </button>
                </div>

                {/* Product Form Modal */}
                {showProductForm && (
                  <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 shadow-2xl">
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="font-display text-xl font-bold text-chocolate-900">
                          {editingProduct ? 'Edit Product' : 'Add New Product'}
                        </h3>
                        <button onClick={() => setShowProductForm(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                          <X size={20} />
                        </button>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium text-gray-700 block mb-1">Product Name *</label>
                          <input type="text" value={productForm.name} onChange={e => setProductForm(p => ({ ...p, name: e.target.value }))}
                            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:border-gold-500 outline-none" placeholder="Dubai Pistachio Chocolate" />
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-700 block mb-1">Description</label>
                          <textarea value={productForm.description} onChange={e => setProductForm(p => ({ ...p, description: e.target.value }))}
                            rows={3} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:border-gold-500 outline-none resize-none" placeholder="Premium chocolate with pistachios..." />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm font-medium text-gray-700 block mb-1">Price (LKR) *</label>
                            <input type="number" value={productForm.price} onChange={e => setProductForm(p => ({ ...p, price: Number(e.target.value) }))}
                              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:border-gold-500 outline-none" />
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-700 block mb-1">Weight (grams)</label>
                            <input type="number" value={productForm.weight} onChange={e => setProductForm(p => ({ ...p, weight: Number(e.target.value) }))}
                              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:border-gold-500 outline-none" />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm font-medium text-gray-700 block mb-1">Category</label>
                            <input type="text" value={productForm.category} onChange={e => setProductForm(p => ({ ...p, category: e.target.value }))}
                              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:border-gold-500 outline-none" placeholder="Chocolate" />
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-700 block mb-1">Stock</label>
                            <input type="number" value={productForm.stock} onChange={e => setProductForm(p => ({ ...p, stock: Number(e.target.value) }))}
                              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:border-gold-500 outline-none" />
                          </div>
                        </div>

                        {/* Image Upload */}
                        <div>
                          <label className="text-sm font-medium text-gray-700 block mb-1">Product Image</label>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={productForm.imageUrl}
                              onChange={e => setProductForm(p => ({ ...p, imageUrl: e.target.value }))}
                              className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl focus:border-gold-500 outline-none text-sm"
                              placeholder="Image URL or upload"
                            />
                            <input type="file" accept="image/*" ref={fileInputRef} className="hidden" onChange={handleImageUpload} />
                            <button
                              type="button"
                              onClick={() => fileInputRef.current?.click()}
                              disabled={uploading}
                              className="px-4 py-2.5 bg-gray-100 rounded-xl hover:bg-gray-200 transition text-sm font-medium flex items-center gap-1"
                            >
                              <Upload size={16} /> {uploading ? 'Uploading...' : 'Upload'}
                            </button>
                          </div>
                          {productForm.imageUrl && (
                            <img src={productForm.imageUrl} alt="Preview" className="mt-2 h-32 rounded-xl object-cover" />
                          )}
                        </div>

                        <label className="flex items-center gap-2 cursor-pointer">
                          <input type="checkbox" checked={productForm.featured} onChange={e => setProductForm(p => ({ ...p, featured: e.target.checked }))}
                            className="w-5 h-5 rounded border-gray-300 text-gold-500 focus:ring-gold-500" />
                          <span className="text-sm font-medium text-gray-700">⭐ Featured Product</span>
                        </label>

                        <div className="flex gap-3 pt-2">
                          <button onClick={handleSaveProduct}
                            className="flex-1 py-3 bg-gold-500 text-chocolate-900 rounded-xl font-bold hover:bg-gold-400 transition flex items-center justify-center gap-2">
                            <Save size={18} /> {editingProduct ? 'Update' : 'Add'} Product
                          </button>
                          <button onClick={() => setShowProductForm(false)}
                            className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition">
                            Cancel
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Products Grid */}
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {products.map(product => (
                    <div key={product.id} className="bg-white rounded-2xl overflow-hidden shadow-lg border border-gray-100">
                      <div className="relative h-40">
                        <img src={product.imageUrl || '/images/dubai-chocolate-1.jpg'} alt={product.name} className="w-full h-full object-cover" />
                        {product.featured && <span className="absolute top-2 left-2 bg-gold-500 text-xs font-bold px-2 py-1 rounded-full">⭐</span>}
                      </div>
                      <div className="p-4">
                        <h4 className="font-bold text-chocolate-900 mb-1">{product.name}</h4>
                        <p className="text-sm text-gray-500 mb-2">{product.category} • {product.weight}g • Stock: {product.stock}</p>
                        <p className="text-lg font-bold text-gold-600 mb-3">LKR {product.price.toLocaleString()}</p>
                        <div className="flex gap-2">
                          <button onClick={() => handleEditProduct(product)}
                            className="flex-1 py-2 bg-blue-50 text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-100 transition flex items-center justify-center gap-1">
                            <Edit size={14} /> Edit
                          </button>
                          <button onClick={() => handleDeleteProduct(product.id)}
                            className="flex-1 py-2 bg-red-50 text-red-600 rounded-lg text-sm font-medium hover:bg-red-100 transition flex items-center justify-center gap-1">
                            <Trash2 size={14} /> Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {products.length === 0 && (
                  <div className="text-center py-16 bg-white rounded-2xl shadow-lg">
                    <Package size={60} className="text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No products yet. Add your first product!</p>
                  </div>
                )}
              </div>
            )}

            {/* Orders Tab */}
            {activeTab === 'orders' && (
              <div className="animate-fadeIn space-y-4">
                <h2 className="font-display text-2xl font-bold text-chocolate-900 mb-4">Orders ({orders.length})</h2>
                {orders.map(order => (
                  <div key={order.id} className="bg-white rounded-2xl shadow-lg p-5 border border-gray-100">
                    <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                      <div>
                        <p className="font-mono text-sm font-bold text-chocolate-900">{order.trackingNumber}</p>
                        <p className="text-sm text-gray-500">{order.userName} • {order.userEmail}</p>
                        <p className="text-xs text-gray-400">{order.userPhone} • {order.shippingAddress}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-gold-600">LKR {order.total.toLocaleString()}</p>
                        <p className="text-xs text-gray-400">{new Date(order.createdAt).toLocaleString()}</p>
                        <span className={`inline-block mt-1 px-3 py-1 rounded-full text-xs font-bold ${
                          order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                          order.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                          order.status === 'shipped' ? 'bg-blue-100 text-blue-700' :
                          'bg-yellow-100 text-yellow-700'
                        }`}>
                          {order.status}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-4">
                      {order.items.map((item, i) => (
                        <div key={i} className="flex items-center gap-2 bg-gray-50 rounded-lg p-2 pr-3 text-xs">
                          <img src={item.product.imageUrl || '/images/dubai-chocolate-1.jpg'} alt="" className="w-8 h-8 rounded object-cover" />
                          <span>{item.product.name} x{item.quantity}</span>
                        </div>
                      ))}
                    </div>

                    {editingOrder === order.id ? (
                      <div className="flex flex-wrap gap-3 p-4 bg-gold-50 rounded-xl animate-fadeIn">
                        <select value={orderStatus} onChange={e => setOrderStatus(e.target.value)}
                          className="px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-gold-500">
                          <option value="">Update Status</option>
                          <option value="pending">Pending</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="processing">Processing</option>
                          <option value="shipped">Shipped</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                        <input type="text" value={orderTracking} onChange={e => setOrderTracking(e.target.value)}
                          placeholder="New tracking number (optional)"
                          className="px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-gold-500 font-mono flex-1 min-w-[200px]" />
                        <button onClick={() => handleUpdateOrder(order.id)}
                          className="px-4 py-2 bg-green-500 text-white rounded-lg text-sm font-bold hover:bg-green-400 transition">
                          Save
                        </button>
                        <button onClick={() => setEditingOrder(null)}
                          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm hover:bg-gray-300 transition">
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => { setEditingOrder(order.id); setOrderStatus(order.status); setOrderTracking(order.trackingNumber); }}
                        className="text-sm text-gold-600 hover:text-gold-700 font-medium flex items-center gap-1"
                      >
                        <Edit size={14} /> Update Order
                      </button>
                    )}
                  </div>
                ))}

                {orders.length === 0 && (
                  <div className="text-center py-16 bg-white rounded-2xl shadow-lg">
                    <ShoppingBag size={60} className="text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No orders yet</p>
                  </div>
                )}
              </div>
            )}

            {/* Users Tab */}
            {activeTab === 'users' && (
              <div className="animate-fadeIn">
                <h2 className="font-display text-2xl font-bold text-chocolate-900 mb-6">Users ({users.length})</h2>
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gold-50">
                        <tr>
                          <th className="text-left p-4">User</th>
                          <th className="text-left p-4">Email</th>
                          <th className="text-left p-4">Phone</th>
                          <th className="text-left p-4">Role</th>
                          <th className="text-left p-4">Joined</th>
                          <th className="text-left p-4">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {users.map(u => (
                          <tr key={u.uid} className="border-b border-gray-50 hover:bg-gold-50/50">
                            <td className="p-4">
                              <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-full bg-gold-200 flex items-center justify-center font-bold text-chocolate-800">
                                  {u.displayName?.charAt(0)?.toUpperCase() || 'U'}
                                </div>
                                <span className="font-medium">{u.displayName || 'Unknown'}</span>
                              </div>
                            </td>
                            <td className="p-4 text-gray-600">{u.email}</td>
                            <td className="p-4 text-gray-600">{u.phone || '-'}</td>
                            <td className="p-4">
                              <span className={`px-2 py-1 rounded-full text-xs font-bold ${u.isAdmin ? 'bg-gold-100 text-gold-700' : 'bg-gray-100 text-gray-600'}`}>
                                {u.isAdmin ? '👑 Admin' : 'Customer'}
                              </span>
                            </td>
                            <td className="p-4 text-gray-500">{new Date(u.createdAt).toLocaleDateString()}</td>
                            <td className="p-4">
                              <div className="flex gap-2">
                                <button onClick={() => handleToggleAdmin(u.uid, u.isAdmin)}
                                  className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-xs font-medium hover:bg-blue-100 transition">
                                  {u.isAdmin ? 'Remove Admin' : 'Make Admin'}
                                </button>
                                <button onClick={() => handleDeleteUser(u.uid)}
                                  className="px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-xs font-medium hover:bg-red-100 transition">
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Settings Tab */}
            {activeTab === 'settings' && (
              <div className="animate-fadeIn max-w-2xl">
                <h2 className="font-display text-2xl font-bold text-chocolate-900 mb-6">Site Settings</h2>
                <div className="bg-white rounded-2xl shadow-lg p-6 space-y-5">
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-1">Hero Title</label>
                    <input type="text" value={settings.heroTitle} onChange={e => setSettings(s => ({ ...s, heroTitle: e.target.value }))}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:border-gold-500 outline-none" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-1">Hero Subtitle</label>
                    <textarea value={settings.heroSubtitle} onChange={e => setSettings(s => ({ ...s, heroSubtitle: e.target.value }))}
                      rows={2} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:border-gold-500 outline-none resize-none" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-1">Hero Image</label>
                    <div className="flex gap-2">
                      <input type="text" value={settings.heroImageUrl} onChange={e => setSettings(s => ({ ...s, heroImageUrl: e.target.value }))}
                        className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl focus:border-gold-500 outline-none text-sm" />
                      <label className="px-4 py-2.5 bg-gray-100 rounded-xl hover:bg-gray-200 transition text-sm font-medium flex items-center gap-1 cursor-pointer">
                        <Upload size={16} /> Upload
                        <input type="file" accept="image/*" className="hidden" onChange={handleHeroImageUpload} />
                      </label>
                    </div>
                    {settings.heroImageUrl && <img src={settings.heroImageUrl} alt="Hero" className="mt-2 h-32 rounded-xl object-cover" />}
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-1">Special Banner Text</label>
                    <input type="text" value={settings.specialBanner} onChange={e => setSettings(s => ({ ...s, specialBanner: e.target.value }))}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:border-gold-500 outline-none" />
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={settings.showSpecialBanner} onChange={e => setSettings(s => ({ ...s, showSpecialBanner: e.target.checked }))}
                      className="w-5 h-5 rounded border-gray-300 text-gold-500" />
                    <span className="text-sm font-medium text-gray-700">Show Special Banner</span>
                  </label>
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-1">About Text</label>
                    <textarea value={settings.aboutText} onChange={e => setSettings(s => ({ ...s, aboutText: e.target.value }))}
                      rows={4} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:border-gold-500 outline-none resize-none" />
                  </div>
                  <button onClick={handleSaveSettings}
                    className="flex items-center gap-2 px-8 py-3 bg-gold-500 text-chocolate-900 rounded-xl font-bold hover:bg-gold-400 transition shadow-lg">
                    <Save size={18} /> Save Settings
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AdminPage;
