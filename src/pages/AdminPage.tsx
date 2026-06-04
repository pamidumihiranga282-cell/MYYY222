import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  collection, getDocs, addDoc, updateDoc, deleteDoc, doc,
  serverTimestamp, query, orderBy, setDoc, getDoc
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage, auth } from '../firebase';
import { sendPasswordResetEmail } from 'firebase/auth';
import { useAuth } from '../context/AuthContext';
import { Product, Order, User, SiteSettings, OrderStatus } from '../types';
import {
  Package, Users, ShoppingBag, Settings, Plus, Edit3, Trash2,
  Save, X, Upload, Bell, BarChart3, Image, MessageCircle, Mail
} from 'lucide-react';
import toast from 'react-hot-toast';
import { getWhatsAppMessage, getStatusUpdateMessage } from '../utils/whatsapp';
import { sendOrderStatusUpdate } from '../utils/email';

const ADMIN_EMAIL = 'mrmshopping2025@gmail.com';

const statusOptions: { value: OrderStatus; label: string }[] = [
  { value: 'pending', label: 'Pending' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'processing', label: 'Processing' },
  { value: 'shipped', label: 'Shipped' },
  { value: 'out_for_delivery', label: 'Out for Delivery' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' },
];

const AdminPage: React.FC = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalOrders: 0, revenue: 0, customers: 0, products: 0 });

  useEffect(() => {
    if (!currentUser || currentUser.email !== ADMIN_EMAIL) {
      navigate('/');
      return;
    }
    fetchAll();
  }, [currentUser]);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [prodSnap, orderSnap, userSnap, settingsSnap] = await Promise.all([
        getDocs(query(collection(db, 'products'), orderBy('createdAt', 'desc'))),
        getDocs(query(collection(db, 'orders'), orderBy('createdAt', 'desc'))),
        getDocs(collection(db, 'users')),
        getDoc(doc(db, 'settings', 'site')),
      ]);
      const p = prodSnap.docs.map(d => ({ id: d.id, ...d.data() } as Product));
      const o = orderSnap.docs.map(d => ({ id: d.id, ...d.data() } as Order));
      const u = userSnap.docs.map(d => d.data() as User);
      setProducts(p);
      setOrders(o);
      setUsers(u);
      if (settingsSnap.exists()) setSettings(settingsSnap.data() as SiteSettings);
      setStats({
        totalOrders: o.length,
        revenue: o.filter(ord => ord.status !== 'cancelled').reduce((s, ord) => s + ord.total, 0),
        customers: u.filter(u => u.role !== 'admin').length,
        products: p.length,
      });
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (!currentUser || currentUser.email !== ADMIN_EMAIL) return null;

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: <BarChart3 size={16} /> },
    { id: 'products', label: 'Products', icon: <Package size={16} /> },
    { id: 'orders', label: 'Orders', icon: <ShoppingBag size={16} /> },
    { id: 'users', label: 'Users', icon: <Users size={16} /> },
    { id: 'settings', label: 'Site Settings', icon: <Settings size={16} /> },
  ];

  return (
    <div className="bg-[#0d0500] min-h-screen">
      <div className="bg-[#1a0800] border-b border-amber-900/30 px-4 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <h1 className="text-xl font-bold text-amber-400">MRM Admin Panel</h1>
          <button onClick={fetchAll} className="text-amber-400 hover:text-amber-300 text-sm flex items-center gap-1 transition-colors">
            🔄 Refresh
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${activeTab === tab.id ? 'bg-amber-500 text-white' : 'bg-[#1a0800] text-amber-300 hover:bg-amber-900/30 border border-amber-900/30'}`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full" />
          </div>
        ) : (
          <>
            {activeTab === 'dashboard' && <Dashboard stats={stats} orders={orders} />}
            {activeTab === 'products' && <ProductsManager products={products} onRefresh={fetchAll} />}
            {activeTab === 'orders' && <OrdersManager orders={orders} onRefresh={fetchAll} />}
            {activeTab === 'users' && <UsersManager users={users} onRefresh={fetchAll} />}
            {activeTab === 'settings' && <SiteSettingsManager settings={settings} onRefresh={fetchAll} />}
          </>
        )}
      </div>
    </div>
  );
};

// Dashboard
const Dashboard: React.FC<{ stats: any; orders: Order[] }> = ({ stats, orders }) => {
  const recentOrders = orders.slice(0, 5);
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Orders', value: stats.totalOrders, icon: '📦', color: 'from-amber-900 to-amber-700' },
          { label: 'Revenue', value: `Rs. ${stats.revenue.toLocaleString()}`, icon: '💰', color: 'from-green-900 to-green-700' },
          { label: 'Customers', value: stats.customers, icon: '👥', color: 'from-blue-900 to-blue-700' },
          { label: 'Products', value: stats.products, icon: '🍫', color: 'from-purple-900 to-purple-700' },
        ].map(s => (
          <div key={s.label} className={`bg-gradient-to-br ${s.color} rounded-2xl p-5`}>
            <div className="text-3xl mb-2">{s.icon}</div>
            <div className="text-2xl font-bold text-white">{s.value}</div>
            <div className="text-white/60 text-sm">{s.label}</div>
          </div>
        ))}
      </div>
      <div className="bg-[#1a0800] border border-amber-900/30 rounded-2xl p-6">
        <h3 className="text-white font-semibold mb-4">Recent Orders</h3>
        {recentOrders.length === 0 ? (
          <p className="text-amber-200/40 text-sm">No orders yet</p>
        ) : (
          <div className="space-y-3">
            {recentOrders.map(order => (
              <div key={order.id} className="flex items-center justify-between p-3 bg-amber-900/10 rounded-xl text-sm">
                <div>
                  <span className="text-white font-mono">{order.trackingNumber}</span>
                  <span className="text-amber-200/40 ml-2">· {order.userName}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-amber-400 font-semibold">Rs. {order.total.toLocaleString()}</span>
                  <span className="text-amber-200/40">{order.status}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Products Manager
const ProductsManager: React.FC<{ products: Product[]; onRefresh: () => void }> = ({ products, onRefresh }) => {
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState({
    name: '', description: '', price: 0, originalPrice: 0, category: '',
    stock: 0, weight: 0.25, featured: false, isNew: false, discount: 0,
    imageUrl: '',
  });
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const openAdd = () => {
    setEditing(null);
    setForm({ name: '', description: '', price: 0, originalPrice: 0, category: '', stock: 0, weight: 0.25, featured: false, isNew: false, discount: 0, imageUrl: '' });
    setShowForm(true);
  };

  const openEdit = (p: Product) => {
    setEditing(p);
    setForm({
      name: p.name, description: p.description, price: p.price,
      originalPrice: p.originalPrice || 0, category: p.category,
      stock: p.stock, weight: p.weight, featured: p.featured,
      isNew: p.isNew || false, discount: p.discount || 0, imageUrl: p.imageUrl,
    });
    setShowForm(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) return toast.error('Please select an image file');
    setUploading(true);
    
    const storagePromise = (async () => {
      const storageRef = ref(storage, `products/${Date.now()}_${file.name}`);
      await uploadBytes(storageRef, file);
      return await getDownloadURL(storageRef);
    })();
    
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('timeout')), 2000)
    );

    try {
      // Try Firebase Storage with 2s timeout
      const url = await Promise.race([storagePromise, timeoutPromise]);
      setForm(f => ({ ...f, imageUrl: url }));
      toast.success('Image uploaded to cloud storage!');
      setUploading(false);
    } catch {
      // Fallback: convert to base64 Data URL stored directly
      try {
        const reader = new FileReader();
        reader.onload = (ev) => {
          const dataUrl = ev.target?.result as string;
          setForm(f => ({ ...f, imageUrl: dataUrl }));
          toast.success('Image loaded locally (base64)!');
          setUploading(false);
        };
        reader.onerror = () => {
          toast.error('Failed to read image file');
          setUploading(false);
        };
        reader.readAsDataURL(file);
      } catch {
        toast.error('Image upload failed');
        setUploading(false);
      }
    }
  };

  const handleSave = async () => {
    if (!form.name || !form.price) return toast.error('Name and price are required');
    setSaving(true);
    try {
      if (editing) {
        await updateDoc(doc(db, 'products', editing.id), { ...form, updatedAt: serverTimestamp() });
        toast.success('Product updated!');
      } else {
        await addDoc(collection(db, 'products'), { ...form, createdAt: serverTimestamp() });
        toast.success('Product added!');
      }
      setShowForm(false);
      onRefresh();
    } catch (e) {
      toast.error('Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this product?')) return;
    try {
      await deleteDoc(doc(db, 'products', id));
      toast.success('Product deleted');
      onRefresh();
    } catch (e) {
      toast.error('Delete failed');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-white font-semibold text-lg">Products ({products.length})</h2>
        <button onClick={openAdd} className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors">
          <Plus size={16} /> Add Product
        </button>
      </div>

      {showForm && (
        <div className="bg-[#1a0800] border border-amber-900/30 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-semibold">{editing ? 'Edit Product' : 'New Product'}</h3>
            <button onClick={() => setShowForm(false)} className="text-amber-400 hover:text-white transition-colors"><X size={18} /></button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="text-amber-300 text-xs font-medium block mb-1">Product Name *</label>
              <input type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                className="w-full bg-amber-950/30 border border-amber-800/30 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-amber-500"
                placeholder="Dubai Pistachio Chocolate Bar" />
            </div>
            <div className="md:col-span-2">
              <label className="text-amber-300 text-xs font-medium block mb-1">Description</label>
              <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                className="w-full bg-amber-950/30 border border-amber-800/30 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-amber-500 h-24 resize-none"
                placeholder="Product description..." />
            </div>
            <div>
              <label className="text-amber-300 text-xs font-medium block mb-1">Price (Rs.) *</label>
              <input type="number" value={form.price} onChange={e => setForm(f => ({ ...f, price: +e.target.value }))}
                className="w-full bg-amber-950/30 border border-amber-800/30 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-amber-500" min="0" />
            </div>
            <div>
              <label className="text-amber-300 text-xs font-medium block mb-1">Original Price (Rs.)</label>
              <input type="number" value={form.originalPrice} onChange={e => setForm(f => ({ ...f, originalPrice: +e.target.value }))}
                className="w-full bg-amber-950/30 border border-amber-800/30 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-amber-500" min="0" />
            </div>
            <div>
              <label className="text-amber-300 text-xs font-medium block mb-1">Category</label>
              <input type="text" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                className="w-full bg-amber-950/30 border border-amber-800/30 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-amber-500"
                placeholder="Dubai Bars, Gift Boxes, Truffles..." />
            </div>
            <div>
              <label className="text-amber-300 text-xs font-medium block mb-1">Stock</label>
              <input type="number" value={form.stock} onChange={e => setForm(f => ({ ...f, stock: +e.target.value }))}
                className="w-full bg-amber-950/30 border border-amber-800/30 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-amber-500" min="0" />
            </div>
            <div>
              <label className="text-amber-300 text-xs font-medium block mb-1">Weight (kg) *</label>
              <select value={form.weight} onChange={e => setForm(f => ({ ...f, weight: +e.target.value }))}
                className="w-full bg-amber-950/30 border border-amber-800/30 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-amber-500 [&>option]:bg-amber-950">
                <option value="0.1" className="bg-[#1a0800] text-white">0.1 kg</option>
                <option value="0.15" className="bg-[#1a0800] text-white">0.15 kg</option>
                <option value="0.25" className="bg-[#1a0800] text-white">0.25 kg</option>
                <option value="0.5" className="bg-[#1a0800] text-white">0.5 kg</option>
                <option value="0.75" className="bg-[#1a0800] text-white">0.75 kg</option>
                <option value="1" className="bg-[#1a0800] text-white">1.0 kg</option>
              </select>
            </div>
            <div>
              <label className="text-amber-300 text-xs font-medium block mb-1">Discount (%)</label>
              <input type="number" value={form.discount} onChange={e => setForm(f => ({ ...f, discount: +e.target.value }))}
                className="w-full bg-amber-950/30 border border-amber-800/30 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-amber-500" min="0" max="100" />
            </div>

            {/* Image Upload */}
            <div className="md:col-span-2">
              <label className="text-amber-300 text-xs font-medium block mb-2">Product Image</label>
              <div className="flex gap-3 items-start">
                <div
                  onClick={() => fileRef.current?.click()}
                  className="flex-1 border-2 border-dashed border-amber-800/40 rounded-xl p-4 text-center cursor-pointer hover:border-amber-600/60 transition-colors"
                >
                  {uploading ? (
                    <div className="flex items-center justify-center gap-2 text-amber-400">
                      <div className="w-4 h-4 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
                      Uploading...
                    </div>
                  ) : (
                    <>
                      <Upload size={20} className="text-amber-500 mx-auto mb-1" />
                      <div className="text-amber-300 text-xs">Click to upload image from device</div>
                      <div className="text-amber-200/30 text-xs">JPG, PNG, WebP supported</div>
                    </>
                  )}
                </div>
                {form.imageUrl && (
                  <div className="w-24 h-24 rounded-xl overflow-hidden bg-amber-950 flex-shrink-0">
                    <img src={form.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>
              <input ref={fileRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
              <div className="mt-2">
                <label className="text-amber-300 text-xs font-medium block mb-1">Or paste image URL</label>
                <input type="text" value={form.imageUrl} onChange={e => setForm(f => ({ ...f, imageUrl: e.target.value }))}
                  className="w-full bg-amber-950/30 border border-amber-800/30 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-amber-500"
                  placeholder="https://..." />
              </div>
            </div>

            {/* Flags */}
            <div className="flex gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.featured} onChange={e => setForm(f => ({ ...f, featured: e.target.checked }))}
                  className="w-4 h-4 rounded border-amber-700 bg-amber-950 text-amber-500 focus:ring-amber-500" />
                <span className="text-amber-300 text-sm">Featured</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.isNew} onChange={e => setForm(f => ({ ...f, isNew: e.target.checked }))}
                  className="w-4 h-4 rounded border-amber-700 bg-amber-950 text-amber-500 focus:ring-amber-500" />
                <span className="text-amber-300 text-sm">New Arrival</span>
              </label>
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button onClick={handleSave} disabled={saving}
              className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-6 py-2.5 rounded-xl font-medium text-sm transition-colors disabled:opacity-60">
              {saving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Save size={14} />}
              {editing ? 'Update' : 'Add Product'}
            </button>
            <button onClick={() => setShowForm(false)} className="flex items-center gap-2 bg-amber-900/30 text-amber-400 hover:bg-amber-900/50 px-6 py-2.5 rounded-xl font-medium text-sm transition-colors">
              <X size={14} /> Cancel
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {products.map(product => (
          <div key={product.id} className="bg-[#1a0800] border border-amber-900/30 rounded-2xl overflow-hidden">
            <div className="aspect-video bg-amber-950 relative">
              <img src={product.imageUrl || '/images/dubai-choc-1.jpg'} alt={product.name}
                className="w-full h-full object-cover"
                onError={e => { (e.target as HTMLImageElement).src = '/images/dubai-choc-1.jpg'; }} />
              {product.featured && <span className="absolute top-2 left-2 bg-amber-500 text-white text-xs px-2 py-0.5 rounded-full">Featured</span>}
            </div>
            <div className="p-4">
              <h3 className="text-white font-medium text-sm mb-1 line-clamp-1">{product.name}</h3>
              <div className="flex items-center justify-between mb-3">
                <span className="text-amber-400 font-bold">Rs. {product.price.toLocaleString()}</span>
                <span className="text-amber-200/40 text-xs">{product.weight}kg · Stock: {product.stock}</span>
              </div>
              <div className="flex gap-2">
                <button onClick={() => openEdit(product)} className="flex-1 flex items-center justify-center gap-1 bg-amber-900/30 text-amber-400 hover:bg-amber-900/50 py-2 rounded-xl text-xs font-medium transition-colors">
                  <Edit3 size={12} /> Edit
                </button>
                <button onClick={() => handleDelete(product.id)} className="flex-1 flex items-center justify-center gap-1 bg-red-900/20 text-red-400 hover:bg-red-900/40 py-2 rounded-xl text-xs font-medium transition-colors">
                  <Trash2 size={12} /> Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Orders Manager
const OrdersManager: React.FC<{ orders: Order[]; onRefresh: () => void }> = ({ orders, onRefresh }) => {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [newStatus, setNewStatus] = useState<OrderStatus>('pending');
  const [statusNote, setStatusNote] = useState('');
  const [updating, setUpdating] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');

  const filtered = filterStatus === 'all' ? orders : orders.filter(o => o.status === filterStatus);

  const handleDeleteOrder = async (orderId: string) => {
    if (!window.confirm('Delete this order permanently? This cannot be undone.')) return;
    try {
      await deleteDoc(doc(db, 'orders', orderId));
      toast.success('Order deleted successfully!');
      onRefresh();
    } catch {
      toast.error('Failed to delete order');
    }
  };

  const handleUpdateStatus = async () => {
    if (!selectedOrder) return;
    setUpdating(true);
    try {
      const statusHistory = [
        ...(selectedOrder.statusHistory || []),
        { status: newStatus, note: statusNote, timestamp: new Date().toISOString() }
      ];
      await updateDoc(doc(db, 'orders', selectedOrder.id), {
        status: newStatus,
        statusHistory,
        updatedAt: serverTimestamp(),
      });
      toast.success('Order status updated!');
      // WhatsApp notification URL
      const updatedOrder = { ...selectedOrder, status: newStatus, statusHistory } as unknown as Order;
      
      // Send email notification on status update
      sendOrderStatusUpdate(updatedOrder);

      const msg = getStatusUpdateMessage(updatedOrder);
      const phone = selectedOrder.userPhone.startsWith('0') ? '94' + selectedOrder.userPhone.slice(1) : selectedOrder.userPhone;
      const waUrl = `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;
      window.open(waUrl, '_blank');
      setSelectedOrder(null);
      setStatusNote('');
      onRefresh();
    } catch (e) {
      toast.error('Update failed');
    } finally {
      setUpdating(false);
    }
  };

  const statusColors: Record<string, string> = {
    pending: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20',
    confirmed: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
    processing: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
    shipped: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    out_for_delivery: 'text-orange-400 bg-orange-500/10 border-orange-500/20',
    delivered: 'text-green-400 bg-green-500/10 border-green-500/20',
    cancelled: 'text-red-400 bg-red-500/10 border-red-500/20',
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-white font-semibold text-lg">Orders ({filtered.length})</h2>
        <div className="flex gap-2 flex-wrap">
          {['all', ...statusOptions.map(s => s.value)].map(s => (
            <button key={s} onClick={() => setFilterStatus(s)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${filterStatus === s ? 'bg-amber-500 text-white' : 'bg-amber-900/20 text-amber-300 hover:bg-amber-900/40 border border-amber-900/30'}`}>
              {s === 'all' ? 'All' : s.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-amber-200/40">No orders found</div>
        ) : filtered.map(order => (
          <div key={order.id} className="bg-[#1a0800] border border-amber-900/30 rounded-2xl p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className="text-white font-mono font-semibold">{order.trackingNumber}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full border ${statusColors[order.status] || 'text-amber-400'}`}>
                    {order.status.replace('_', ' ')}
                  </span>
                </div>
                <div className="text-amber-200/60 text-sm">{order.userName} · {order.userPhone}</div>
                <div className="text-amber-200/40 text-xs">{order.items.map(i => `${i.productName} ×${i.quantity}`).join(', ')}</div>
                <div className="flex items-center gap-4 mt-2">
                  <span className="text-amber-400 font-semibold text-sm">Rs. {order.total.toLocaleString()}</span>
                  <span className="text-amber-200/30 text-xs">
                    {order.createdAt?.toDate?.()?.toLocaleDateString?.() || new Date((order.createdAt?.seconds || 0) * 1000).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <div className="flex gap-2 flex-shrink-0 flex-wrap">
                <button
                  onClick={() => { setSelectedOrder(order); setNewStatus(order.status); }}
                  className="flex items-center gap-1 bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 px-3 py-1.5 rounded-xl text-xs transition-colors"
                >
                  <Edit3 size={12} /> Update
                </button>
                <a
                  href={`https://wa.me/${order.userPhone.startsWith('0') ? '94' + order.userPhone.slice(1) : order.userPhone}?text=${encodeURIComponent(getWhatsAppMessage(order))}`}
                  target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1 bg-green-900/20 text-green-400 hover:bg-green-900/40 px-3 py-1.5 rounded-xl text-xs transition-colors"
                >
                  <MessageCircle size={12} /> WhatsApp
                </a>
                <button
                  onClick={() => handleDeleteOrder(order.id)}
                  className="flex items-center gap-1 bg-red-900/20 text-red-400 hover:bg-red-900/40 px-3 py-1.5 rounded-xl text-xs transition-colors"
                >
                  <Trash2 size={12} /> Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Update Status Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-[#1a0800] border border-amber-900/30 rounded-2xl p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-semibold">Update Order Status</h3>
              <button onClick={() => setSelectedOrder(null)} className="text-amber-400 hover:text-white transition-colors"><X size={18} /></button>
            </div>
            <p className="text-amber-200/50 text-sm mb-4">Order: <span className="text-amber-400 font-mono">{selectedOrder.trackingNumber}</span></p>
            <div className="mb-4">
              <label className="text-amber-300 text-xs font-medium block mb-1">New Status</label>
              <select value={newStatus} onChange={e => setNewStatus(e.target.value as OrderStatus)}
                className="w-full bg-amber-950/30 border border-amber-800/30 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-amber-500 [&>option]:bg-amber-950">
                {statusOptions.map(s => <option key={s.value} value={s.value} className="bg-[#1a0800] text-white">{s.label}</option>)}
              </select>
            </div>
            <div className="mb-6">
              <label className="text-amber-300 text-xs font-medium block mb-1">Note (optional)</label>
              <textarea value={statusNote} onChange={e => setStatusNote(e.target.value)}
                className="w-full bg-amber-950/30 border border-amber-800/30 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-amber-500 h-20 resize-none"
                placeholder="Add a note about this status update..." />
            </div>
            <div className="flex gap-3">
              <button onClick={handleUpdateStatus} disabled={updating}
                className="flex-1 flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-white py-2.5 rounded-xl font-medium text-sm transition-colors disabled:opacity-60">
                {updating ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Save size={14} />}
                Update & Notify
              </button>
              <button onClick={() => setSelectedOrder(null)} className="flex-1 bg-amber-900/30 text-amber-400 hover:bg-amber-900/50 py-2.5 rounded-xl font-medium text-sm transition-colors">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Users Manager
const UsersManager: React.FC<{ users: User[]; onRefresh: () => void }> = ({ users, onRefresh }) => {
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [userForm, setUserForm] = useState({
    displayName: '',
    phone: '',
    address: '',
    city: '',
    role: 'customer' as 'admin' | 'customer'
  });

  const handleDelete = async (uid: string, email: string) => {
    if (email === ADMIN_EMAIL) return toast.error('Cannot delete admin account');
    if (!window.confirm(`Delete user ${email}?`)) return;
    try {
      await deleteDoc(doc(db, 'users', uid));
      toast.success('User deleted');
      onRefresh();
    } catch (e) {
      toast.error('Delete failed');
    }
  };

  const handleEditClick = (u: User) => {
    setEditingUser(u);
    setUserForm({
      displayName: u.displayName || '',
      phone: u.phone || '',
      address: u.address || '',
      city: u.city || '',
      role: u.role || 'customer'
    });
  };

  const handleSaveUser = async () => {
    if (!editingUser) return;
    try {
      await updateDoc(doc(db, 'users', editingUser.uid), {
        displayName: userForm.displayName,
        phone: userForm.phone,
        address: userForm.address,
        city: userForm.city,
        role: userForm.role
      });
      toast.success('User updated successfully!');
      setEditingUser(null);
      onRefresh();
    } catch {
      toast.error('Failed to update user details');
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-white font-semibold text-lg">Users ({users.length})</h2>
      <div className="space-y-3">
        {users.map(user => (
          <div key={user.uid} className="bg-[#1a0800] border border-amber-900/30 rounded-2xl p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-amber-600 flex items-center justify-center text-white font-bold flex-shrink-0">
              {user.displayName?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-white font-medium text-sm truncate">{user.displayName || 'No Name'}</div>
              <div className="text-amber-200/50 text-xs truncate">{user.email}</div>
              <div className="flex flex-col gap-0.5 mt-1">
                {user.phone && <div className="text-amber-200/40 text-xs flex items-center gap-1">📞 {user.phone}</div>}
                {(user.address || user.city) && (
                  <div className="text-amber-200/30 text-xs flex items-center gap-1">
                    📍 {user.address}{user.city ? `, ${user.city}` : ''}
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className={`text-xs px-2 py-0.5 rounded-full border ${user.role === 'admin' ? 'text-amber-400 bg-amber-500/10 border-amber-500/20' : 'text-amber-200/40 bg-amber-900/10 border-amber-900/20'}`}>
                {user.role}
              </span>
              <button onClick={() => handleEditClick(user)}
                className="text-amber-400 hover:text-amber-300 transition-colors p-1.5 hover:bg-amber-900/20 rounded-lg">
                <Edit3 size={14} />
              </button>
              {user.email !== ADMIN_EMAIL && (
                <button onClick={() => handleDelete(user.uid, user.email)}
                  className="text-red-400 hover:text-red-300 transition-colors p-1.5 hover:bg-red-900/20 rounded-lg">
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Edit User Modal */}
      {editingUser && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-[#1a0800] border border-amber-900/30 rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-semibold">Edit User Details</h3>
              <button onClick={() => setEditingUser(null)} className="text-amber-400 hover:text-white transition-colors"><X size={18} /></button>
            </div>
            <p className="text-amber-200/50 text-sm mb-4">User Email: <span className="text-amber-400 font-mono">{editingUser.email}</span></p>

            <div className="space-y-4 mb-6">
              <div>
                <label className="text-amber-300 text-xs font-medium block mb-1">Full Name</label>
                <input type="text" value={userForm.displayName} onChange={e => setUserForm(u => ({ ...u, displayName: e.target.value }))}
                  className="w-full bg-amber-950/30 border border-amber-800/30 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-amber-500" />
              </div>
              <div>
                <label className="text-amber-300 text-xs font-medium block mb-1">Phone Number</label>
                <input type="tel" value={userForm.phone} onChange={e => setUserForm(u => ({ ...u, phone: e.target.value }))}
                  className="w-full bg-amber-950/30 border border-amber-800/30 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-amber-500" placeholder="07XXXXXXXX" />
              </div>
              <div>
                <label className="text-amber-300 text-xs font-medium block mb-1">Address</label>
                <input type="text" value={userForm.address} onChange={e => setUserForm(u => ({ ...u, address: e.target.value }))}
                  className="w-full bg-amber-950/30 border border-amber-800/30 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-amber-500" placeholder="Street Address" />
              </div>
              <div>
                <label className="text-amber-300 text-xs font-medium block mb-1">City</label>
                <input type="text" value={userForm.city} onChange={e => setUserForm(u => ({ ...u, city: e.target.value }))}
                  className="w-full bg-amber-950/30 border border-amber-800/30 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-amber-500" placeholder="City" />
              </div>
              <div>
                <label className="text-amber-300 text-xs font-medium block mb-1">Role</label>
                <select value={userForm.role} onChange={e => setUserForm(u => ({ ...u, role: e.target.value as 'admin' | 'customer' }))}
                  disabled={editingUser.email === ADMIN_EMAIL}
                  className="w-full bg-amber-950/30 border border-amber-800/30 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-amber-500 [&>option]:bg-amber-950">
                  <option value="customer" className="bg-[#1a0800] text-white">Customer</option>
                  <option value="admin" className="bg-[#1a0800] text-white">Admin</option>
                </select>
              </div>
              <div className="border-t border-amber-900/30 pt-4">
                <label className="text-amber-300 text-xs font-medium block mb-2 flex items-center gap-1.5"><Mail size={12} /> Reset User Password</label>
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      await sendPasswordResetEmail(auth, editingUser.email);
                      toast.success('Password reset email sent to user!');
                    } catch {
                      toast.error('Failed to send password reset email');
                    }
                  }}
                  className="w-full flex items-center justify-center gap-2 bg-amber-900/40 text-amber-300 border border-amber-800/40 py-2 rounded-xl text-xs font-medium hover:bg-amber-900/60 transition-colors"
                >
                  Send Password Reset Link
                </button>
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={handleSaveUser}
                className="flex-1 flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-white py-2.5 rounded-xl font-medium text-sm transition-colors shadow-lg shadow-amber-500/10">
                <Save size={14} /> Save Changes
              </button>
              <button onClick={() => setEditingUser(null)} className="flex-1 bg-amber-900/30 text-amber-400 hover:bg-amber-900/50 py-2.5 rounded-xl font-medium text-sm transition-colors">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Site Settings Manager
const SiteSettingsManager: React.FC<{ settings: SiteSettings | null; onRefresh: () => void }> = ({ settings, onRefresh }) => {
  const [form, setForm] = useState({
    heroTitle: settings?.heroBanner?.title || 'Authentic Dubai Chocolate',
    heroSubtitle: settings?.heroBanner?.subtitle || 'Experience the luxury of premium Dubai chocolates',
    heroImage: settings?.heroBanner?.imageUrl || '/images/hero-chocolate.jpg',
    heroCta: settings?.heroBanner?.ctaText || 'Shop Now',
    specialEnabled: settings?.specialOffer?.enabled || false,
    specialTitle: settings?.specialOffer?.title || '',
    specialDesc: settings?.specialOffer?.description || '',
    specialImage: settings?.specialOffer?.imageUrl || '',
    specialDiscount: settings?.specialOffer?.discount || 0,
    announcement: settings?.announcement || '',
    announcementEnabled: settings?.announcementEnabled || false,
    emailjsServiceId: settings?.emailjsServiceId || '',
    emailjsTemplateIdAdmin: settings?.emailjsTemplateIdAdmin || '',
    emailjsTemplateIdCustomer: settings?.emailjsTemplateIdCustomer || '',
    emailjsTemplateIdStatus: settings?.emailjsTemplateIdStatus || '',
    emailjsPublicKey: settings?.emailjsPublicKey || '',
  });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState('');
  const heroFileRef = useRef<HTMLInputElement>(null);
  const specialFileRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(field);
    
    const storagePromise = (async () => {
      const storageRef = ref(storage, `settings/${Date.now()}_${file.name}`);
      await uploadBytes(storageRef, file);
      return await getDownloadURL(storageRef);
    })();
    
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('timeout')), 2000)
    );

    try {
      // Try Firebase Storage with 2s timeout
      const url = await Promise.race([storagePromise, timeoutPromise]);
      setForm(f => ({ ...f, [field]: url }));
      toast.success('Image uploaded to cloud storage!');
      setUploading('');
    } catch {
      // Fallback: convert to base64 Data URL stored directly in settings doc
      try {
        const reader = new FileReader();
        reader.onload = (ev) => {
          const dataUrl = ev.target?.result as string;
          setForm(f => ({ ...f, [field]: dataUrl }));
          toast.success('Image loaded locally (base64)!');
          setUploading('');
        };
        reader.onerror = () => {
          toast.error('Failed to read image file');
          setUploading('');
        };
        reader.readAsDataURL(file);
      } catch {
        toast.error('Upload failed');
        setUploading('');
      }
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await setDoc(doc(db, 'settings', 'site'), {
        heroBanner: { title: form.heroTitle, subtitle: form.heroSubtitle, imageUrl: form.heroImage, ctaText: form.heroCta },
        specialOffer: { enabled: form.specialEnabled, title: form.specialTitle, description: form.specialDesc, imageUrl: form.specialImage, discount: form.specialDiscount },
        announcement: form.announcement,
        announcementEnabled: form.announcementEnabled,
        emailjsServiceId: form.emailjsServiceId,
        emailjsTemplateIdAdmin: form.emailjsTemplateIdAdmin,
        emailjsTemplateIdCustomer: form.emailjsTemplateIdCustomer,
        emailjsTemplateIdStatus: form.emailjsTemplateIdStatus,
        emailjsPublicKey: form.emailjsPublicKey,
        updatedAt: serverTimestamp(),
      }, { merge: true });
      toast.success('Settings saved!');
      onRefresh();
    } catch (e) {
      toast.error('Save failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-white font-semibold text-lg">Site Settings</h2>

      {/* Hero Banner */}
      <div className="bg-[#1a0800] border border-amber-900/30 rounded-2xl p-6">
        <h3 className="text-amber-400 font-semibold mb-4 flex items-center gap-2"><Image size={16} /> Hero Banner</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-amber-300 text-xs font-medium block mb-1">Title</label>
            <input type="text" value={form.heroTitle} onChange={e => setForm(f => ({ ...f, heroTitle: e.target.value }))}
              className="w-full bg-amber-950/30 border border-amber-800/30 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-amber-500" />
          </div>
          <div>
            <label className="text-amber-300 text-xs font-medium block mb-1">CTA Button Text</label>
            <input type="text" value={form.heroCta} onChange={e => setForm(f => ({ ...f, heroCta: e.target.value }))}
              className="w-full bg-amber-950/30 border border-amber-800/30 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-amber-500" />
          </div>
          <div className="md:col-span-2">
            <label className="text-amber-300 text-xs font-medium block mb-1">Subtitle</label>
            <textarea value={form.heroSubtitle} onChange={e => setForm(f => ({ ...f, heroSubtitle: e.target.value }))}
              className="w-full bg-amber-950/30 border border-amber-800/30 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-amber-500 h-20 resize-none" />
          </div>
          <div className="md:col-span-2">
            <label className="text-amber-300 text-xs font-medium block mb-2">Hero Image</label>
            <div className="flex gap-3 items-start">
              <button onClick={() => heroFileRef.current?.click()}
                className="flex items-center gap-2 bg-amber-900/30 border border-amber-800/30 text-amber-400 hover:bg-amber-900/50 px-4 py-2.5 rounded-xl text-sm transition-colors">
                <Upload size={14} /> {uploading === 'heroImage' ? 'Uploading...' : 'Upload Image'}
              </button>
              {form.heroImage && <img src={form.heroImage} alt="" className="w-24 h-16 rounded-xl object-cover" />}
            </div>
            <input ref={heroFileRef} type="file" accept="image/*" onChange={e => handleImageUpload(e, 'heroImage')} className="hidden" />
            <input type="text" value={form.heroImage} onChange={e => setForm(f => ({ ...f, heroImage: e.target.value }))}
              className="w-full mt-2 bg-amber-950/30 border border-amber-800/30 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-amber-500"
              placeholder="Or paste image URL" />
          </div>
        </div>
      </div>

      {/* Announcement */}
      <div className="bg-[#1a0800] border border-amber-900/30 rounded-2xl p-6">
        <h3 className="text-amber-400 font-semibold mb-4 flex items-center gap-2"><Bell size={16} /> Announcement Banner</h3>
        <div className="flex items-center gap-2 mb-3">
          <input type="checkbox" checked={form.announcementEnabled} onChange={e => setForm(f => ({ ...f, announcementEnabled: e.target.checked }))}
            className="w-4 h-4 rounded" />
          <span className="text-amber-300 text-sm">Show announcement bar</span>
        </div>
        <input type="text" value={form.announcement} onChange={e => setForm(f => ({ ...f, announcement: e.target.value }))}
          className="w-full bg-amber-950/30 border border-amber-800/30 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-amber-500"
          placeholder="Free shipping on orders over Rs. 5000!" />
      </div>

      {/* Special Offer */}
      <div className="bg-[#1a0800] border border-amber-900/30 rounded-2xl p-6">
        <h3 className="text-amber-400 font-semibold mb-4">Special Offer Section</h3>
        <div className="flex items-center gap-2 mb-4">
          <input type="checkbox" checked={form.specialEnabled} onChange={e => setForm(f => ({ ...f, specialEnabled: e.target.checked }))}
            className="w-4 h-4 rounded" />
          <span className="text-amber-300 text-sm">Show special offer on homepage</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-amber-300 text-xs font-medium block mb-1">Offer Title</label>
            <input type="text" value={form.specialTitle} onChange={e => setForm(f => ({ ...f, specialTitle: e.target.value }))}
              className="w-full bg-amber-950/30 border border-amber-800/30 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-amber-500"
              placeholder="Valentine's Day Special" />
          </div>
          <div>
            <label className="text-amber-300 text-xs font-medium block mb-1">Discount %</label>
            <input type="number" value={form.specialDiscount} onChange={e => setForm(f => ({ ...f, specialDiscount: +e.target.value }))}
              className="w-full bg-amber-950/30 border border-amber-800/30 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-amber-500" min="0" max="100" />
          </div>
          <div className="md:col-span-2">
            <label className="text-amber-300 text-xs font-medium block mb-1">Description</label>
            <textarea value={form.specialDesc} onChange={e => setForm(f => ({ ...f, specialDesc: e.target.value }))}
              className="w-full bg-amber-950/30 border border-amber-800/30 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-amber-500 h-20 resize-none"
              placeholder="Special offer description..." />
          </div>
          <div className="md:col-span-2">
            <label className="text-amber-300 text-xs font-medium block mb-2">Offer Image</label>
            <div className="flex gap-3 items-start">
              <button onClick={() => specialFileRef.current?.click()}
                className="flex items-center gap-2 bg-amber-900/30 border border-amber-800/30 text-amber-400 hover:bg-amber-900/50 px-4 py-2.5 rounded-xl text-sm transition-colors">
                <Upload size={14} /> {uploading === 'specialImage' ? 'Uploading...' : 'Upload Image'}
              </button>
              {form.specialImage && <img src={form.specialImage} alt="" className="w-24 h-16 rounded-xl object-cover" />}
            </div>
            <input ref={specialFileRef} type="file" accept="image/*" onChange={e => handleImageUpload(e, 'specialImage')} className="hidden" />
          </div>
        </div>
      </div>

      {/* EmailJS Settings */}
      <div className="bg-[#1a0800] border border-amber-900/30 rounded-2xl p-6">
        <h3 className="text-amber-400 font-semibold mb-2 flex items-center gap-2"><Mail size={16} /> EmailJS Notifications Settings</h3>
        <p className="text-xs text-amber-200/50 mb-4">
          Configure EmailJS integration to send email notifications when orders are placed or updated. Register at <a href="https://www.emailjs.com" target="_blank" rel="noopener noreferrer" className="text-amber-400 hover:underline">emailjs.com</a> to retrieve these keys.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-amber-300 text-xs font-medium block mb-1">EmailJS Service ID</label>
            <input type="text" value={form.emailjsServiceId} onChange={e => setForm(f => ({ ...f, emailjsServiceId: e.target.value }))}
              className="w-full bg-amber-950/30 border border-amber-800/30 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-amber-500"
              placeholder="e.g. service_xxxxxxx" />
          </div>
          <div>
            <label className="text-amber-300 text-xs font-medium block mb-1">EmailJS Public Key</label>
            <input type="text" value={form.emailjsPublicKey} onChange={e => setForm(f => ({ ...f, emailjsPublicKey: e.target.value }))}
              className="w-full bg-amber-950/30 border border-amber-800/30 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-amber-500"
              placeholder="e.g. user_xxxxxxxxxxxxxxxx" />
          </div>
          <div>
            <label className="text-amber-300 text-xs font-medium block mb-1">Admin Order Notification Template ID</label>
            <input type="text" value={form.emailjsTemplateIdAdmin} onChange={e => setForm(f => ({ ...f, emailjsTemplateIdAdmin: e.target.value }))}
              className="w-full bg-amber-950/30 border border-amber-800/30 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-amber-500"
              placeholder="e.g. template_xxxxxxx" />
          </div>
          <div>
            <label className="text-amber-300 text-xs font-medium block mb-1">Customer Order Confirmation Template ID</label>
            <input type="text" value={form.emailjsTemplateIdCustomer} onChange={e => setForm(f => ({ ...f, emailjsTemplateIdCustomer: e.target.value }))}
              className="w-full bg-amber-950/30 border border-amber-800/30 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-amber-500"
              placeholder="e.g. template_xxxxxxx" />
          </div>
          <div className="md:col-span-2">
            <label className="text-amber-300 text-xs font-medium block mb-1">Order Status Update Template ID</label>
            <input type="text" value={form.emailjsTemplateIdStatus} onChange={e => setForm(f => ({ ...f, emailjsTemplateIdStatus: e.target.value }))}
              className="w-full bg-amber-950/30 border border-amber-800/30 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-amber-500"
              placeholder="e.g. template_xxxxxxx" />
          </div>
        </div>
      </div>

      <button onClick={handleSave} disabled={saving}
        className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-8 py-3 rounded-xl font-semibold transition-colors disabled:opacity-60">
        {saving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Save size={16} />}
        Save All Settings
      </button>
    </div>
  );
};

export default AdminPage;
