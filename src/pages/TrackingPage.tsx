import React, { useState } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Order } from '../types';
import { Search, Package, Truck, CheckCircle, Clock, MapPin, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const statusSteps = [
  { key: 'pending', label: 'Order Placed', icon: <Clock size={20} /> },
  { key: 'confirmed', label: 'Confirmed', icon: <CheckCircle size={20} /> },
  { key: 'processing', label: 'Processing', icon: <Package size={20} /> },
  { key: 'shipped', label: 'Shipped', icon: <Truck size={20} /> },
  { key: 'delivered', label: 'Delivered', icon: <MapPin size={20} /> },
];

const getStatusIndex = (status: string) => {
  if (status === 'cancelled') return -1;
  return statusSteps.findIndex(s => s.key === status);
};

const TrackingPage: React.FC = () => {
  const [trackingNumber, setTrackingNumber] = useState('');
  const [order, setOrder] = useState<Order | null>(null);
  const [searching, setSearching] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackingNumber.trim()) {
      toast.error('Please enter a tracking number');
      return;
    }
    setSearching(true);
    setSearched(true);
    try {
      const q = query(collection(db, 'orders'), where('trackingNumber', '==', trackingNumber.trim().toUpperCase()));
      const snap = await getDocs(q);
      if (snap.empty) {
        setOrder(null);
        toast.error('No order found with this tracking number');
      } else {
        const doc = snap.docs[0];
        setOrder({ id: doc.id, ...doc.data() } as Order);
        toast.success('Order found!');
      }
    } catch (err) {
      toast.error('Error searching. Please try again.');
    } finally {
      setSearching(false);
    }
  };

  const currentStatusIndex = order ? getStatusIndex(order.status) : -1;

  return (
    <div className="min-h-screen bg-gradient-to-b from-dubai-cream to-gold-50 py-12">
      <div className="max-w-3xl mx-auto px-4">
        <div className="text-center mb-10">
          <h1 className="font-display text-4xl font-bold text-chocolate-900 mb-3">📦 Track Your Order</h1>
          <p className="text-chocolate-500 text-lg">Enter your tracking number to see your order status</p>
        </div>

        {/* Search */}
        <form onSubmit={handleSearch} className="bg-white rounded-2xl p-6 shadow-xl border border-gold-100 mb-8">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-chocolate-400" size={20} />
              <input
                type="text"
                value={trackingNumber}
                onChange={e => setTrackingNumber(e.target.value.toUpperCase())}
                placeholder="Enter tracking number (e.g., MRM...)"
                className="w-full pl-12 pr-4 py-4 bg-gold-50 rounded-xl border border-gold-200 focus:border-gold-500 focus:ring-2 focus:ring-gold-200 outline-none text-chocolate-800 text-lg font-mono"
              />
            </div>
            <button
              type="submit"
              disabled={searching}
              className="px-8 py-4 bg-gradient-to-r from-gold-500 to-gold-400 text-chocolate-900 rounded-xl font-bold hover:from-gold-400 hover:to-gold-300 transition shadow-lg disabled:opacity-50 whitespace-nowrap"
            >
              {searching ? 'Searching...' : 'Track'}
            </button>
          </div>
        </form>

        {/* Result */}
        {order && (
          <div className="bg-white rounded-2xl shadow-xl border border-gold-100 overflow-hidden animate-fadeIn">
            <div className="bg-gradient-to-r from-chocolate-900 to-chocolate-800 p-6 text-white">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <p className="text-gold-300 text-sm font-medium">Tracking Number</p>
                  <p className="text-xl font-mono font-bold">{order.trackingNumber}</p>
                </div>
                <div className={`px-4 py-2 rounded-full font-bold text-sm ${
                  order.status === 'delivered' ? 'bg-green-500 text-white' :
                  order.status === 'cancelled' ? 'bg-red-500 text-white' :
                  'bg-gold-500 text-chocolate-900'
                }`}>
                  {order.status === 'cancelled' ? '❌ Cancelled' : order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </div>
              </div>
            </div>

            <div className="p-6">
              {/* Status Timeline */}
              {order.status !== 'cancelled' ? (
                <div className="mb-8">
                  <h3 className="font-display text-lg font-bold text-chocolate-900 mb-6">Order Progress</h3>
                  <div className="flex items-center justify-between relative">
                    <div className="absolute top-5 left-0 right-0 h-1 bg-gold-100 z-0"></div>
                    <div
                      className="absolute top-5 left-0 h-1 bg-gradient-to-r from-green-500 to-gold-500 z-0 transition-all duration-500"
                      style={{ width: `${Math.max(0, (currentStatusIndex / (statusSteps.length - 1)) * 100)}%` }}
                    ></div>
                    {statusSteps.map((step, i) => (
                      <div key={step.key} className="relative z-10 flex flex-col items-center">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                          i <= currentStatusIndex
                            ? 'bg-gradient-to-r from-green-500 to-green-400 text-white shadow-lg'
                            : 'bg-gold-100 text-chocolate-400'
                        }`}>
                          {step.icon}
                        </div>
                        <p className={`text-xs mt-2 font-medium text-center max-w-[80px] ${
                          i <= currentStatusIndex ? 'text-green-600' : 'text-chocolate-400'
                        }`}>
                          {step.label}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3 p-4 bg-red-50 rounded-xl mb-6">
                  <XCircle className="text-red-500" size={24} />
                  <p className="text-red-700 font-semibold">This order has been cancelled</p>
                </div>
              )}

              {/* Order Details */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-chocolate-700 mb-3">Order Details</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between py-1.5 border-b border-gold-50">
                      <span className="text-chocolate-500">Order Date</span>
                      <span className="font-medium text-chocolate-800">{new Date(order.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-gold-50">
                      <span className="text-chocolate-500">Total Weight</span>
                      <span className="font-medium text-chocolate-800">{(order.totalWeight / 1000).toFixed(2)} Kg</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-gold-50">
                      <span className="text-chocolate-500">Subtotal</span>
                      <span className="font-medium text-chocolate-800">LKR {order.subtotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-gold-50">
                      <span className="text-chocolate-500">Delivery</span>
                      <span className="font-medium text-chocolate-800">LKR {order.deliveryCharge.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between py-1.5 text-lg">
                      <span className="font-bold text-chocolate-800">Total</span>
                      <span className="font-bold text-gold-600">LKR {order.total.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-chocolate-700 mb-3">Items</h4>
                  <div className="space-y-2">
                    {order.items.map((item, i) => (
                      <div key={i} className="flex items-center gap-3 p-2 bg-gold-50 rounded-lg">
                        <img
                          src={item.product.imageUrl || '/images/dubai-chocolate-1.jpg'}
                          alt={item.product.name}
                          className="w-10 h-10 rounded-lg object-cover"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-chocolate-800 truncate">{item.product.name}</p>
                          <p className="text-xs text-chocolate-400">x{item.quantity}</p>
                        </div>
                        <p className="text-sm font-semibold text-chocolate-700">LKR {(item.product.price * item.quantity).toLocaleString()}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-6 p-4 bg-gold-50 rounded-xl">
                <p className="text-sm text-chocolate-500">
                  <strong>📍 Delivery Address:</strong> {order.shippingAddress}
                </p>
                <p className="text-xs text-chocolate-400 mt-1">
                  Last updated: {new Date(order.updatedAt).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        )}

        {searched && !order && !searching && (
          <div className="bg-white rounded-2xl p-12 shadow-xl border border-gold-100 text-center animate-fadeIn">
            <Package size={60} className="text-gold-300 mx-auto mb-4" />
            <h3 className="font-display text-xl font-bold text-chocolate-900 mb-2">Order Not Found</h3>
            <p className="text-chocolate-500">Please check your tracking number and try again.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TrackingPage;
