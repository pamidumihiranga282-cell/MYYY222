import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { Order, OrderStatus } from '../types';
import { Search, Package, Truck, CheckCircle, Clock, XCircle, MapPin, Phone } from 'lucide-react';
import toast from 'react-hot-toast';

const statusConfig: Record<OrderStatus, { label: string; color: string; bg: string; icon: React.ReactNode; step: number }> = {
  pending: { label: 'Order Placed', color: 'text-yellow-400', bg: 'bg-yellow-500', icon: <Clock size={16} />, step: 1 },
  confirmed: { label: 'Confirmed', color: 'text-blue-400', bg: 'bg-blue-500', icon: <CheckCircle size={16} />, step: 2 },
  processing: { label: 'Processing', color: 'text-purple-400', bg: 'bg-purple-500', icon: <Package size={16} />, step: 3 },
  shipped: { label: 'Shipped', color: 'text-amber-400', bg: 'bg-amber-500', icon: <Truck size={16} />, step: 4 },
  out_for_delivery: { label: 'Out for Delivery', color: 'text-orange-400', bg: 'bg-orange-500', icon: <Truck size={16} />, step: 5 },
  delivered: { label: 'Delivered', color: 'text-green-400', bg: 'bg-green-500', icon: <CheckCircle size={16} />, step: 6 },
  cancelled: { label: 'Cancelled', color: 'text-red-400', bg: 'bg-red-500', icon: <XCircle size={16} />, step: 0 },
};

const steps: OrderStatus[] = ['pending', 'confirmed', 'processing', 'shipped', 'out_for_delivery', 'delivered'];

const TrackingPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const trackingParam = searchParams.get('number') || '';
  const [trackingInput, setTrackingInput] = useState(trackingParam.toUpperCase());
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const fetchOrder = async (trackingNum: string) => {
    if (!trackingNum.trim()) return;
    setLoading(true);
    setSearched(false);
    try {
      const q = query(collection(db, 'orders'), where('trackingNumber', '==', trackingNum.trim().toUpperCase()));
      const snap = await getDocs(q);
      if (snap.empty) {
        setOrder(null);
        toast.error('No order found with this tracking number');
      } else {
        setOrder({ id: snap.docs[0].id, ...snap.docs[0].data() } as Order);
      }
      setSearched(true);
    } catch (e) {
      toast.error('Error fetching order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (trackingParam) {
      setTrackingInput(trackingParam.toUpperCase());
      fetchOrder(trackingParam);
    }
  }, [trackingParam]);

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackingInput.trim()) return toast.error('Please enter a tracking number');
    await fetchOrder(trackingInput);
  };

  const cfg = order ? statusConfig[order.status] : null;
  const currentStep = cfg?.step || 0;

  return (
    <div className="bg-[#0d0500] min-h-screen py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="text-5xl mb-4">📦</div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
            Track Your <span className="text-amber-400">Order</span>
          </h1>
          <p className="text-amber-200/50">Enter your tracking number to see your order status</p>
        </div>

        {/* Search form */}
        <form onSubmit={handleTrack} className="flex gap-3 mb-8">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-amber-500" />
            <input
              type="text"
              value={trackingInput}
              onChange={e => setTrackingInput(e.target.value.toUpperCase())}
              placeholder="Enter tracking number (e.g. MRMXXXXXXX)"
              className="w-full bg-[#1a0800] border border-amber-900/30 text-white placeholder-amber-200/30 rounded-xl pl-10 pr-4 py-4 focus:outline-none focus:border-amber-500 transition-colors text-lg tracking-wider"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="bg-amber-500 hover:bg-amber-600 text-white px-6 py-4 rounded-xl font-semibold flex items-center gap-2 transition-all hover:scale-105 disabled:opacity-60"
          >
            {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Search size={18} />}
            Track
          </button>
        </form>

        {/* Result */}
        {searched && !order && (
          <div className="text-center py-12 bg-[#1a0800] border border-amber-900/30 rounded-2xl">
            <div className="text-4xl mb-3">🔍</div>
            <h3 className="text-white font-semibold mb-1">Order Not Found</h3>
            <p className="text-amber-200/50 text-sm">No order was found with tracking number <span className="text-amber-400 font-mono">{trackingInput}</span></p>
          </div>
        )}

        {order && cfg && (
          <div className="space-y-6">
            {/* Status banner */}
            <div className={`p-6 rounded-2xl bg-gradient-to-r ${order.status === 'delivered' ? 'from-green-900/50 to-green-800/20 border-green-700/30' : order.status === 'cancelled' ? 'from-red-900/50 to-red-800/20 border-red-700/30' : 'from-amber-900/30 to-amber-800/10 border-amber-800/20'} border`}>
              <div className="flex items-center gap-3 mb-2">
                <div className={`w-10 h-10 ${cfg.bg} rounded-full flex items-center justify-center text-white`}>
                  {cfg.icon}
                </div>
                <div>
                  <div className={`text-lg font-bold ${cfg.color}`}>{cfg.label}</div>
                  <div className="text-amber-200/50 text-sm">Tracking: <span className="font-mono text-amber-400">{order.trackingNumber}</span></div>
                </div>
              </div>
            </div>

            {/* Progress stepper */}
            {order.status !== 'cancelled' && (
              <div className="bg-[#1a0800] border border-amber-900/30 rounded-2xl p-6">
                <h3 className="text-white font-semibold mb-6">Order Progress</h3>
                <div className="relative">
                  <div className="absolute top-4 left-4 right-4 h-0.5 bg-amber-900/30" />
                  <div
                    className="absolute top-4 left-4 h-0.5 bg-amber-500 transition-all duration-500"
                    style={{ width: `${Math.max(0, ((currentStep - 1) / (steps.length - 1)) * 100)}%` }}
                  />
                  <div className="relative flex justify-between">
                    {steps.map((step) => {
                      const s = statusConfig[step];
                      const isActive = s.step === currentStep;
                      const isDone = s.step < currentStep;
                      return (
                        <div key={step} className="flex flex-col items-center gap-2">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center z-10 transition-all ${isActive ? s.bg + ' text-white ring-2 ring-offset-2 ring-offset-[#1a0800] ring-amber-500' : isDone ? 'bg-amber-500 text-white' : 'bg-amber-900/30 text-amber-200/30'}`}>
                            {isDone ? <CheckCircle size={14} /> : s.icon}
                          </div>
                          <div className={`text-xs text-center max-w-[60px] ${isActive ? 'text-amber-400 font-semibold' : isDone ? 'text-amber-300' : 'text-amber-200/30'}`}>
                            {s.label}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Order details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-[#1a0800] border border-amber-900/30 rounded-2xl p-5">
                <h3 className="text-amber-400 font-semibold mb-3 flex items-center gap-2"><Package size={14} /> Order Items</h3>
                <div className="space-y-2">
                  {order.items.map((item, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <img src={item.productImage} alt={item.productName} className="w-10 h-10 rounded-lg object-cover bg-amber-950" onError={e => { (e.target as HTMLImageElement).src = '/images/dubai-choc-1.jpg'; }} />
                      <div className="flex-1">
                        <div className="text-white text-sm font-medium leading-tight">{item.productName}</div>
                        <div className="text-amber-200/40 text-xs">Qty: {item.quantity} × Rs. {item.price.toLocaleString()}</div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="border-t border-amber-900/30 mt-3 pt-3 space-y-1 text-sm">
                  <div className="flex justify-between text-amber-200/50"><span>Subtotal</span><span>Rs. {order.subtotal.toLocaleString()}</span></div>
                  <div className="flex justify-between text-amber-200/50"><span>Delivery</span><span>Rs. {order.deliveryCharge}</span></div>
                  <div className="flex justify-between text-white font-bold"><span>Total</span><span className="text-amber-400">Rs. {order.total.toLocaleString()}</span></div>
                </div>
              </div>

              <div className="bg-[#1a0800] border border-amber-900/30 rounded-2xl p-5">
                <h3 className="text-amber-400 font-semibold mb-3 flex items-center gap-2"><MapPin size={14} /> Delivery Address</h3>
                <div className="space-y-1 text-sm text-amber-200/60">
                  <div className="text-white font-medium">{order.shippingAddress.fullName}</div>
                  <div className="flex items-center gap-1"><Phone size={12} className="text-amber-500" /> {order.shippingAddress.phone}</div>
                  <div>{order.shippingAddress.addressLine1}</div>
                  {order.shippingAddress.addressLine2 && <div>{order.shippingAddress.addressLine2}</div>}
                  <div>{order.shippingAddress.city}, {order.shippingAddress.district}</div>
                  {order.shippingAddress.postalCode && <div>{order.shippingAddress.postalCode}</div>}
                </div>
              </div>
            </div>

            {/* Status history */}
            {order.statusHistory && order.statusHistory.length > 0 && (
              <div className="bg-[#1a0800] border border-amber-900/30 rounded-2xl p-5">
                <h3 className="text-amber-400 font-semibold mb-4">Order Timeline</h3>
                <div className="space-y-3">
                  {[...order.statusHistory].reverse().map((update, idx) => {
                    const s = statusConfig[update.status as OrderStatus];
                    return (
                      <div key={idx} className="flex items-start gap-3">
                        <div className={`w-7 h-7 ${s?.bg || 'bg-amber-500'} rounded-full flex items-center justify-center text-white flex-shrink-0 mt-0.5`}>
                          {s?.icon}
                        </div>
                        <div>
                          <div className={`text-sm font-medium ${s?.color || 'text-amber-400'}`}>{s?.label || update.status}</div>
                          {update.note && <div className="text-amber-200/50 text-xs mt-0.5">{update.note}</div>}
                          <div className="text-amber-200/30 text-xs mt-0.5">
                            {update.timestamp ? new Date(update.timestamp).toLocaleString() : ''}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Info */}
        <div className="mt-10 bg-amber-900/10 border border-amber-800/20 rounded-2xl p-6 text-center">
          <h3 className="text-white font-semibold mb-2">Need Help?</h3>
          <p className="text-amber-200/50 text-sm mb-4">Contact us for any order related queries</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a href="tel:0707070872" className="flex items-center justify-center gap-2 bg-amber-900/30 border border-amber-800/30 text-amber-300 px-6 py-2.5 rounded-xl hover:bg-amber-900/50 transition-colors text-sm">
              <Phone size={14} /> 0707070872
            </a>
            <a href="https://wa.me/94707070872" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 bg-green-900/30 border border-green-700/30 text-green-400 px-6 py-2.5 rounded-xl hover:bg-green-900/50 transition-colors text-sm">
              WhatsApp Us
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrackingPage;
