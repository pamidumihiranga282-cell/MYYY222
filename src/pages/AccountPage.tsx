import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { doc, updateDoc, collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Order } from '../types';
import { User, Mail, Phone, MapPin, Save, Package, Clock, Truck, CheckCircle, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';

interface AccountPageProps {
  setCurrentPage: (page: string) => void;
  defaultTab?: 'profile' | 'orders';
}

const AccountPage: React.FC<AccountPageProps> = ({ setCurrentPage, defaultTab = 'profile' }) => {
  const { user, userProfile, refreshProfile } = useAuth();
  const [name, setName] = useState(userProfile?.displayName || '');
  const [phone, setPhone] = useState(userProfile?.phone || '');
  const [address, setAddress] = useState(userProfile?.address || '');
  const [saving, setSaving] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [activeTab, setActiveTab] = useState<'profile' | 'orders'>(defaultTab);

  useEffect(() => {
    if (userProfile) {
      setName(userProfile.displayName || '');
      setPhone(userProfile.phone || '');
      setAddress(userProfile.address || '');
    }
  }, [userProfile]);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user) return;
      try {
        const q = query(collection(db, 'orders'), where('userId', '==', user.uid), orderBy('createdAt', 'desc'));
        const snap = await getDocs(q);
        setOrders(snap.docs.map(d => ({ id: d.id, ...d.data() }) as Order));
      } catch (err) {
        console.error('Error:', err);
      } finally {
        setLoadingOrders(false);
      }
    };
    fetchOrders();
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        displayName: name,
        phone,
        address
      });
      await refreshProfile();
      toast.success('Profile updated! ✅');
    } catch (err) {
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-dubai-cream to-gold-50 flex items-center justify-center">
        <div className="text-center">
          <User size={60} className="text-gold-300 mx-auto mb-4" />
          <h2 className="font-display text-2xl font-bold text-chocolate-900 mb-3">Please Log In</h2>
          <button onClick={() => setCurrentPage('login')} className="px-6 py-3 bg-gold-500 text-chocolate-900 rounded-xl font-bold">
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-700';
      case 'confirmed': return 'bg-blue-100 text-blue-700';
      case 'processing': return 'bg-purple-100 text-purple-700';
      case 'shipped': return 'bg-indigo-100 text-indigo-700';
      case 'delivered': return 'bg-green-100 text-green-700';
      case 'cancelled': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock size={14} />;
      case 'shipped': return <Truck size={14} />;
      case 'delivered': return <CheckCircle size={14} />;
      case 'cancelled': return <XCircle size={14} />;
      default: return <Package size={14} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-dubai-cream to-gold-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="bg-gradient-to-r from-chocolate-900 to-chocolate-800 rounded-2xl p-8 mb-8 text-white">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gold-500 flex items-center justify-center text-chocolate-900 text-2xl font-bold">
              {userProfile?.displayName?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div>
              <h1 className="font-display text-2xl font-bold">{userProfile?.displayName || 'User'}</h1>
              <p className="text-chocolate-300">{user.email}</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition ${
              activeTab === 'profile' ? 'bg-gold-500 text-chocolate-900 shadow-lg' : 'bg-white text-chocolate-600 hover:bg-gold-50'
            }`}
          >
            <User size={18} /> Profile
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition ${
              activeTab === 'orders' ? 'bg-gold-500 text-chocolate-900 shadow-lg' : 'bg-white text-chocolate-600 hover:bg-gold-50'
            }`}
          >
            <Package size={18} /> My Orders ({orders.length})
          </button>
        </div>

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="bg-white rounded-2xl p-8 shadow-xl border border-gold-100 animate-fadeIn">
            <h2 className="font-display text-xl font-bold text-chocolate-900 mb-6">Edit Profile</h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-chocolate-700 mb-1 block">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-chocolate-400" size={18} />
                  <input type="text" value={name} onChange={e => setName(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-gold-50 rounded-xl border border-gold-200 focus:border-gold-500 outline-none text-chocolate-800" />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-chocolate-700 mb-1 block">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-chocolate-400" size={18} />
                  <input type="email" value={user.email || ''} disabled
                    className="w-full pl-10 pr-4 py-3 bg-gray-100 rounded-xl border border-gray-200 text-gray-500 cursor-not-allowed" />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-chocolate-700 mb-1 block">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-chocolate-400" size={18} />
                  <input type="tel" value={phone} onChange={e => setPhone(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-gold-50 rounded-xl border border-gold-200 focus:border-gold-500 outline-none text-chocolate-800" />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-chocolate-700 mb-1 block">Address</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 text-chocolate-400" size={18} />
                  <textarea value={address} onChange={e => setAddress(e.target.value)} rows={3}
                    className="w-full pl-10 pr-4 py-3 bg-gold-50 rounded-xl border border-gold-200 focus:border-gold-500 outline-none text-chocolate-800 resize-none" />
                </div>
              </div>
              <button onClick={handleSave} disabled={saving}
                className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-gold-500 to-gold-400 text-chocolate-900 rounded-xl font-bold hover:from-gold-400 hover:to-gold-300 transition shadow-lg disabled:opacity-50">
                <Save size={18} /> {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div className="space-y-4 animate-fadeIn">
            {loadingOrders ? (
              <div className="flex justify-center py-12">
                <div className="w-12 h-12 border-4 border-gold-300 border-t-gold-600 rounded-full animate-spin"></div>
              </div>
            ) : orders.length > 0 ? (
              orders.map(order => (
                <div key={order.id} className="bg-white rounded-2xl shadow-lg border border-gold-100 overflow-hidden">
                  <div className="p-5">
                    <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
                      <div>
                        <p className="text-sm text-chocolate-400">Tracking Number</p>
                        <p className="font-mono font-bold text-chocolate-900">{order.trackingNumber}</p>
                      </div>
                      <span className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold ${getStatusColor(order.status)}`}>
                        {getStatusIcon(order.status)} {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-3">
                      {order.items.map((item, i) => (
                        <div key={i} className="flex items-center gap-2 bg-gold-50 rounded-lg p-2 pr-3">
                          <img src={item.product.imageUrl || '/images/dubai-chocolate-1.jpg'} alt="" className="w-8 h-8 rounded object-cover" />
                          <span className="text-xs text-chocolate-700">{item.product.name} x{item.quantity}</span>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-chocolate-400">{new Date(order.createdAt).toLocaleDateString()}</span>
                      <span className="font-bold text-gold-600 text-lg">LKR {order.total.toLocaleString()}</span>
                    </div>
                  </div>

                  {/* WhatsApp record */}
                  <div className="bg-green-50 px-5 py-3 border-t border-green-100 flex items-center justify-between">
                    <span className="text-xs text-green-700">📱 WhatsApp notification was sent for this order</span>
                    <button
                      onClick={() => {
                        const msg = encodeURIComponent(
                          `Hi MRM Shopping! I'd like to check on my order ${order.trackingNumber}. Status: ${order.status}. Thank you!`
                        );
                        window.open(`https://wa.me/94707070872?text=${msg}`, '_blank');
                      }}
                      className="text-xs text-green-600 font-semibold hover:underline"
                    >
                      Follow up →
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-white rounded-2xl p-12 shadow-xl text-center">
                <Package size={60} className="text-gold-300 mx-auto mb-4" />
                <h3 className="font-display text-xl font-bold text-chocolate-900 mb-2">No Orders Yet</h3>
                <p className="text-chocolate-500 mb-4">Start shopping to see your orders here!</p>
                <button onClick={() => setCurrentPage('products')} className="px-6 py-3 bg-gold-500 text-chocolate-900 rounded-xl font-bold">
                  Browse Products
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AccountPage;
