import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { Order, OrderStatus } from '../types';
import { User, Package, MapPin, Phone, Mail, ChevronRight, Clock, CheckCircle, Truck, XCircle, Edit3, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import { getWhatsAppMessage, openWhatsAppPopup } from '../utils/whatsapp';

const statusConfig: Record<OrderStatus, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  pending: { label: 'Pending', color: 'text-yellow-400', bg: 'bg-yellow-500/20 border-yellow-500/30', icon: <Clock size={12} /> },
  confirmed: { label: 'Confirmed', color: 'text-blue-400', bg: 'bg-blue-500/20 border-blue-500/30', icon: <CheckCircle size={12} /> },
  processing: { label: 'Processing', color: 'text-purple-400', bg: 'bg-purple-500/20 border-purple-500/30', icon: <Package size={12} /> },
  shipped: { label: 'Shipped', color: 'text-amber-400', bg: 'bg-amber-500/20 border-amber-500/30', icon: <Truck size={12} /> },
  out_for_delivery: { label: 'Out for Delivery', color: 'text-orange-400', bg: 'bg-orange-500/20 border-orange-500/30', icon: <Truck size={12} /> },
  delivered: { label: 'Delivered', color: 'text-green-400', bg: 'bg-green-500/20 border-green-500/30', icon: <CheckCircle size={12} /> },
  cancelled: { label: 'Cancelled', color: 'text-red-400', bg: 'bg-red-500/20 border-red-500/30', icon: <XCircle size={12} /> },
};

const AccountPage: React.FC = () => {
  const { currentUser, userData } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [activeSection, setActiveSection] = useState(location.pathname.includes('orders') ? 'orders' : 'profile');
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    displayName: userData?.displayName || '',
    phone: userData?.phone || '',
    address: userData?.address || '',
    city: userData?.city || '',
  });
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    if (!currentUser) { navigate('/login'); return; }
    if (activeSection === 'orders') fetchOrders();
  }, [currentUser, activeSection]);

  useEffect(() => {
    setProfileForm({
      displayName: userData?.displayName || '',
      phone: userData?.phone || '',
      address: userData?.address || '',
      city: userData?.city || '',
    });
  }, [userData]);

  const fetchOrders = async () => {
    if (!currentUser) return;
    setLoadingOrders(true);
    try {
      const q = query(collection(db, 'orders'), where('userId', '==', currentUser.uid));
      const snap = await getDocs(q);
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() } as Order));
      list.sort((a, b) => {
        const timeA = a.createdAt?.seconds || 0;
        const timeB = b.createdAt?.seconds || 0;
        return timeB - timeA;
      });
      setOrders(list);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingOrders(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!currentUser) return;
    try {
      await updateDoc(doc(db, 'users', currentUser.uid), profileForm);
      toast.success('Profile updated successfully!');
      setEditingProfile(false);
    } catch (e) {
      toast.error('Failed to update profile');
    }
  };

  const nav = [
    { id: 'profile', label: 'My Profile', icon: <User size={16} /> },
    { id: 'orders', label: 'My Orders', icon: <Package size={16} /> },
  ];

  if (!currentUser) return null;

  return (
    <div className="bg-[#0d0500] min-h-screen py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold text-white mb-8">My Account</h1>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-[#1a0800] border border-amber-900/30 rounded-2xl p-4">
              <div className="flex items-center gap-3 p-3 mb-4 border-b border-amber-900/20">
                <div className="w-12 h-12 rounded-full bg-amber-600 flex items-center justify-center text-white text-xl font-bold">
                  {userData?.displayName?.[0]?.toUpperCase() || 'U'}
                </div>
                <div className="min-w-0">
                  <div className="text-white font-semibold text-sm truncate">{userData?.displayName}</div>
                  <div className="text-amber-200/40 text-xs truncate">{currentUser.email}</div>
                </div>
              </div>
              <nav className="space-y-1">
                {nav.map(item => (
                  <button
                    key={item.id}
                    onClick={() => { setActiveSection(item.id); setSelectedOrder(null); }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${activeSection === item.id ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'text-amber-200/60 hover:bg-amber-900/20 hover:text-amber-300'}`}
                  >
                    {item.icon} {item.label}
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Content */}
          <div className="lg:col-span-3">
            {activeSection === 'profile' && (
              <div className="bg-[#1a0800] border border-amber-900/30 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-white font-semibold text-lg">Profile Information</h2>
                  <button
                    onClick={() => editingProfile ? handleSaveProfile() : setEditingProfile(true)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${editingProfile ? 'bg-amber-500 text-white hover:bg-amber-600' : 'bg-amber-900/30 text-amber-400 hover:bg-amber-900/50'}`}
                  >
                    {editingProfile ? <><Save size={14} /> Save</> : <><Edit3 size={14} /> Edit</>}
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { label: 'Full Name', key: 'displayName', icon: <User size={14} />, type: 'text' },
                    { label: 'Phone Number', key: 'phone', icon: <Phone size={14} />, type: 'tel' },
                    { label: 'Address', key: 'address', icon: <MapPin size={14} />, type: 'text' },
                    { label: 'City', key: 'city', icon: <MapPin size={14} />, type: 'text' },
                  ].map(field => (
                    <div key={field.key}>
                      <label className="text-amber-300 text-xs font-medium block mb-1 flex items-center gap-1">
                        {field.icon} {field.label}
                      </label>
                      {editingProfile ? (
                        <input
                          type={field.type}
                          value={(profileForm as any)[field.key]}
                          onChange={e => setProfileForm(f => ({ ...f, [field.key]: e.target.value }))}
                          className="w-full bg-amber-950/30 border border-amber-800/30 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-amber-500"
                        />
                      ) : (
                        <div className="text-amber-200/70 text-sm py-2.5 px-4 bg-amber-900/10 rounded-xl border border-amber-900/20">
                          {(profileForm as any)[field.key] || <span className="text-amber-200/30 italic">Not set</span>}
                        </div>
                      )}
                    </div>
                  ))}
                  <div className="md:col-span-2">
                    <label className="text-amber-300 text-xs font-medium block mb-1 flex items-center gap-1">
                      <Mail size={14} /> Email Address
                    </label>
                    <div className="text-amber-200/70 text-sm py-2.5 px-4 bg-amber-900/10 rounded-xl border border-amber-900/20">
                      {currentUser.email}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'orders' && !selectedOrder && (
              <div className="bg-[#1a0800] border border-amber-900/30 rounded-2xl p-6">
                <h2 className="text-white font-semibold text-lg mb-6">My Orders</h2>
                {loadingOrders ? (
                  <div className="space-y-3">
                    {[...Array(3)].map((_, i) => <div key={i} className="h-20 bg-amber-900/20 rounded-xl animate-pulse" />)}
                  </div>
                ) : orders.length === 0 ? (
                  <div className="text-center py-12">
                    <Package size={48} className="text-amber-900 mx-auto mb-3" />
                    <p className="text-amber-200/50 mb-4">No orders yet</p>
                    <Link to="/products" className="bg-amber-500 text-white px-6 py-2.5 rounded-xl font-medium hover:bg-amber-600 transition-colors text-sm">
                      Start Shopping
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {orders.map(order => {
                      const cfg = statusConfig[order.status];
                      return (
                        <div key={order.id} className="border border-amber-900/20 rounded-xl p-4 hover:border-amber-700/40 transition-colors cursor-pointer" onClick={() => setSelectedOrder(order)}>
                          <div className="flex items-start justify-between gap-4">
                            <div className="min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-white font-mono font-medium text-sm">{order.trackingNumber}</span>
                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs border ${cfg.bg} ${cfg.color}`}>
                                  {cfg.icon} {cfg.label}
                                </span>
                              </div>
                              <div className="text-amber-200/40 text-xs mt-1">
                                {order.items.length} item(s) · Rs. {order.total.toLocaleString()}
                              </div>
                              <div className="text-amber-200/30 text-xs">
                                {order.createdAt?.toDate?.()?.toLocaleDateString?.() || new Date(order.createdAt?.seconds * 1000).toLocaleDateString()}
                              </div>
                            </div>
                            <ChevronRight size={16} className="text-amber-600 flex-shrink-0 mt-1" />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {activeSection === 'orders' && selectedOrder && (
              <div className="bg-[#1a0800] border border-amber-900/30 rounded-2xl p-6">
                <button onClick={() => setSelectedOrder(null)} className="text-amber-400 hover:text-amber-300 text-sm mb-4 flex items-center gap-1 transition-colors">
                  ← Back to Orders
                </button>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-white font-semibold">Order #{selectedOrder.trackingNumber}</h2>
                  <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs border ${statusConfig[selectedOrder.status].bg} ${statusConfig[selectedOrder.status].color}`}>
                    {statusConfig[selectedOrder.status].icon} {statusConfig[selectedOrder.status].label}
                  </span>
                </div>

                {/* Items */}
                <div className="space-y-3 mb-6">
                  {selectedOrder.items.map((item, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 bg-amber-900/10 rounded-xl">
                      <img src={item.productImage} alt={item.productName} className="w-12 h-12 rounded-lg object-cover bg-amber-950" onError={e => { (e.target as HTMLImageElement).src = '/images/dubai-choc-1.jpg'; }} />
                      <div className="flex-1">
                        <div className="text-white text-sm font-medium">{item.productName}</div>
                        <div className="text-amber-200/40 text-xs">Qty: {item.quantity} × Rs. {item.price.toLocaleString()}</div>
                      </div>
                      <div className="text-amber-400 font-semibold text-sm">Rs. {(item.price * item.quantity).toLocaleString()}</div>
                    </div>
                  ))}
                </div>

                {/* Totals */}
                <div className="border-t border-amber-900/30 pt-4 mb-6 space-y-2 text-sm">
                  <div className="flex justify-between text-amber-200/50"><span>Subtotal</span><span>Rs. {selectedOrder.subtotal.toLocaleString()}</span></div>
                  <div className="flex justify-between text-amber-200/50"><span>Delivery</span><span>Rs. {selectedOrder.deliveryCharge}</span></div>
                  <div className="flex justify-between text-white font-bold text-base"><span>Total</span><span className="text-amber-400">Rs. {selectedOrder.total.toLocaleString()}</span></div>
                </div>

                {/* WhatsApp resend */}
                <div className="mb-6">
                  <a
                    href={openWhatsAppPopup(
                      selectedOrder.userPhone.startsWith('0') ? '94' + selectedOrder.userPhone.slice(1) : selectedOrder.userPhone,
                      getWhatsAppMessage(selectedOrder)
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-green-600/20 border border-green-600/30 text-green-400 px-4 py-2.5 rounded-xl text-sm hover:bg-green-600/30 transition-colors"
                  >
                    <svg viewBox="0 0 24 24" className="w-4 h-4 fill-green-400">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                    </svg>
                    Resend WhatsApp Notification
                  </a>
                </div>

                {/* Address */}
                <div className="bg-amber-900/10 rounded-xl p-4 text-sm">
                  <div className="text-amber-400 font-medium mb-2 flex items-center gap-1"><MapPin size={12} /> Delivery Address</div>
                  <div className="text-amber-200/60">
                    <div>{selectedOrder.shippingAddress.fullName}</div>
                    <div>{selectedOrder.shippingAddress.addressLine1}</div>
                    {selectedOrder.shippingAddress.addressLine2 && <div>{selectedOrder.shippingAddress.addressLine2}</div>}
                    <div>{selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.district}</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountPage;
