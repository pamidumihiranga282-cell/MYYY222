import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Order } from '../types';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, Package, CheckCircle, Copy, Search } from 'lucide-react';
import toast from 'react-hot-toast';

interface CartPageProps {
  setCurrentPage: (page: string) => void;
}

const WHATSAPP_NUMBER = '94707070872';

// Bank details
const BANK_INFO = {
  name: 'RR Hasan',
  account: '8015204918',
  bank: 'Commercial Bank',
  branch: 'Vavuniya',
};

const CartPage: React.FC<CartPageProps> = ({ setCurrentPage }) => {
  const { cart, removeFromCart, updateQuantity, clearCart, getSubtotal, getDeliveryCharge, getTotal, getTotalWeight } = useCart();
  const { user, userProfile } = useAuth();
  const [showCheckout, setShowCheckout] = useState(false);
  const [address, setAddress] = useState(userProfile?.address || '');
  const [phone, setPhone] = useState(userProfile?.phone || '');
  const [placing, setPlacing] = useState(false);
  const [placedTracking, setPlacedTracking] = useState<string | null>(null);

  const copyTracking = (num: string) => {
    navigator.clipboard.writeText(num);
    toast.success('Tracking number copied!');
  };

  const handlePlaceOrder = async () => {
    if (!user || !userProfile) {
      toast.error('Please login to place an order');
      setCurrentPage('login');
      return;
    }
    if (!address.trim() || !phone.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    setPlacing(true);
    try {
      const trackingNumber = 'MRM' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).substring(2, 6).toUpperCase();

      const orderData: Omit<Order, 'id'> = {
        userId: user.uid,
        userEmail: user.email || '',
        userName: userProfile.displayName || '',
        userPhone: phone,
        items: cart,
        subtotal: getSubtotal(),
        deliveryCharge: getDeliveryCharge(),
        totalWeight: getTotalWeight(),
        total: getTotal(),
        shippingAddress: address,
        status: 'pending',
        trackingNumber,
        createdAt: Date.now(),
        updatedAt: Date.now()
      };

      await addDoc(collection(db, 'orders'), orderData);

      // WhatsApp notification to shop
      const itemsList = cart.map(item => `${item.product.name} x${item.quantity}`).join(', ');
      const waMessage = encodeURIComponent(
        `🛍 *New Order from MRM Shopping!*\n\n` +
        `👤 Customer: ${userProfile.displayName}\n` +
        `📧 Email: ${user.email}\n` +
        `📱 Phone: ${phone}\n` +
        `📦 Items: ${itemsList}\n` +
        `💰 Total: LKR ${getTotal().toLocaleString()}\n` +
        `📍 Address: ${address}\n` +
        `🔢 Tracking: ${trackingNumber}\n\n` +
        `Thank you for your order! We'll process it shortly. ✅`
      );

      window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${waMessage}`, '_blank');

      clearCart();
      setPlacedTracking(trackingNumber);
      setShowCheckout(false);
    } catch (err) {
      console.error('Error placing order:', err);
      toast.error('Failed to place order. Please try again.');
    } finally {
      setPlacing(false);
    }
  };

  // Show success screen after order placed
  if (placedTracking) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-dubai-cream to-gold-50 flex items-center justify-center py-12">
        <div className="max-w-lg w-full mx-4">
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gold-100">
            <div className="bg-gradient-to-r from-green-600 to-green-500 p-8 text-center text-white">
              <CheckCircle size={64} className="mx-auto mb-4" />
              <h2 className="font-display text-3xl font-bold mb-2">Order Placed! 🎉</h2>
              <p className="text-green-100">Thank you for shopping with MRM Shopping</p>
            </div>
            <div className="p-8">
              {/* Tracking number */}
              <div className="bg-gold-50 rounded-2xl p-5 mb-6 border border-gold-200 text-center">
                <p className="text-sm text-chocolate-500 mb-2 font-medium">Your Tracking Number</p>
                <p className="font-mono text-2xl font-bold text-chocolate-900 mb-3">{placedTracking}</p>
                <button
                  onClick={() => copyTracking(placedTracking)}
                  className="flex items-center gap-2 mx-auto text-sm text-gold-600 hover:text-gold-700 font-medium"
                >
                  <Copy size={14} /> Copy Number
                </button>
              </div>

              {/* Bank Details */}
              <div className="bg-blue-50 rounded-2xl p-5 mb-6 border border-blue-100">
                <p className="text-sm font-bold text-blue-700 mb-3">🏦 Payment Instructions</p>
                <p className="text-xs text-blue-600 mb-3">Please transfer the amount to the bank account below and send the receipt via WhatsApp.</p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-blue-500">Account Name</span>
                    <span className="font-bold text-blue-800">{BANK_INFO.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-500">Account Number</span>
                    <span className="font-bold text-blue-800 font-mono">{BANK_INFO.account}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-500">Bank</span>
                    <span className="font-bold text-blue-800">{BANK_INFO.bank}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-500">Branch</span>
                    <span className="font-bold text-blue-800">{BANK_INFO.branch}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setCurrentPage('tracking')}
                  className="flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-gold-500 to-gold-400 text-chocolate-900 rounded-xl font-bold hover:from-gold-400 hover:to-gold-300 transition shadow-lg text-sm"
                >
                  <Search size={16} /> Track Order
                </button>
                <button
                  onClick={() => setCurrentPage('orders')}
                  className="flex items-center justify-center gap-2 py-3 bg-chocolate-800 text-gold-300 rounded-xl font-bold hover:bg-chocolate-700 transition shadow-lg text-sm"
                >
                  <Package size={16} /> My Orders
                </button>
              </div>
              <button
                onClick={() => setCurrentPage('products')}
                className="w-full mt-3 py-2.5 text-chocolate-500 hover:text-chocolate-700 text-sm font-medium transition"
              >
                Continue Shopping →
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-dubai-cream to-gold-50 flex items-center justify-center py-20">
        <div className="text-center">
          <ShoppingBag size={80} className="text-gold-300 mx-auto mb-6" />
          <h2 className="font-display text-3xl font-bold text-chocolate-900 mb-3">Your Cart is Empty</h2>
          <p className="text-chocolate-500 mb-6">Add some delicious Dubai chocolates to your cart!</p>
          <button
            onClick={() => setCurrentPage('products')}
            className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-gold-500 to-gold-400 text-chocolate-900 rounded-xl font-semibold hover:from-gold-400 hover:to-gold-300 transition shadow-lg"
          >
            Browse Products <ArrowRight size={18} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-dubai-cream to-gold-50 py-8">
      <div className="max-w-5xl mx-auto px-4">
        <h1 className="font-display text-3xl font-bold text-chocolate-900 mb-8 flex items-center gap-3">
          <ShoppingBag className="text-gold-500" /> Shopping Cart
        </h1>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cart.map(item => (
              <div key={item.product.id} className="bg-white rounded-2xl p-4 shadow-lg border border-gold-100 flex gap-4 animate-fadeIn">
                <img
                  src={item.product.imageUrl || '/images/dubai-chocolate-1.jpg'}
                  alt={item.product.name}
                  className="w-24 h-24 rounded-xl object-cover cursor-pointer hover:opacity-80 transition"
                />
                <div className="flex-1">
                  <h3 className="font-display font-bold text-chocolate-800">{item.product.name}</h3>
                  <p className="text-sm text-chocolate-400">{item.product.weight}g per unit</p>
                  <p className="text-lg font-bold text-gold-600 mt-1">LKR {(item.product.price * item.quantity).toLocaleString()}</p>
                </div>
                <div className="flex flex-col items-end justify-between">
                  <button onClick={() => removeFromCart(item.product.id)} className="text-red-400 hover:text-red-600 transition p-1">
                    <Trash2 size={18} />
                  </button>
                  <div className="flex items-center gap-2 bg-gold-50 rounded-lg p-1">
                    <button
                      onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                      className="w-8 h-8 rounded-lg bg-white shadow flex items-center justify-center text-chocolate-600 hover:bg-gold-100 transition"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="w-8 text-center font-bold text-chocolate-800">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                      className="w-8 h-8 rounded-lg bg-white shadow flex items-center justify-center text-chocolate-600 hover:bg-gold-100 transition"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl p-6 shadow-xl border border-gold-100 sticky top-24 space-y-4">
              <h3 className="font-display text-xl font-bold text-chocolate-900 flex items-center gap-2">
                <Package className="text-gold-500" /> Order Summary
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between text-chocolate-600">
                  <span>Subtotal</span>
                  <span className="font-semibold">LKR {getSubtotal().toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-chocolate-600">
                  <span>Total Weight</span>
                  <span className="font-semibold">{getTotalWeight()}g</span>
                </div>
                <div className="flex justify-between text-chocolate-600">
                  <span>Delivery Charge</span>
                  <span className="font-semibold">LKR {getDeliveryCharge().toLocaleString()}</span>
                </div>
                <hr className="border-gold-200" />
                <div className="flex justify-between text-lg font-bold text-chocolate-900">
                  <span>Total</span>
                  <span className="text-gold-600">LKR {getTotal().toLocaleString()}</span>
                </div>
              </div>

              {/* Delivery Info */}
              <div className="bg-gold-50 rounded-xl p-3 text-xs text-chocolate-500 space-y-1">
                <p className="font-semibold text-chocolate-700">🚚 Delivery Charges:</p>
                <p>250g → Rs. 250</p>
                <p>500g → Rs. 350</p>
                <p>1kg → Rs. 450</p>
              </div>

              {!showCheckout ? (
                <button
                  onClick={() => {
                    if (!user) {
                      toast.error('Please login to checkout');
                      setCurrentPage('login');
                      return;
                    }
                    setShowCheckout(true);
                  }}
                  className="w-full py-3 bg-gradient-to-r from-gold-500 to-gold-400 text-chocolate-900 rounded-xl font-bold text-lg hover:from-gold-400 hover:to-gold-300 transition shadow-lg"
                >
                  Proceed to Checkout
                </button>
              ) : (
                <div className="space-y-3 animate-fadeIn">
                  <input
                    type="text"
                    placeholder="Phone Number"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    className="w-full px-4 py-3 bg-gold-50 rounded-xl border border-gold-200 focus:border-gold-500 outline-none text-chocolate-800"
                  />
                  <textarea
                    placeholder="Delivery Address"
                    value={address}
                    onChange={e => setAddress(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 bg-gold-50 rounded-xl border border-gold-200 focus:border-gold-500 outline-none text-chocolate-800 resize-none"
                  />

                  {/* Bank details in checkout */}
                  <div className="bg-blue-50 rounded-xl p-4 border border-blue-100 text-xs">
                    <p className="font-bold text-blue-700 mb-2">🏦 Bank Transfer Details</p>
                    <p className="text-blue-600"><span className="font-semibold">Name:</span> {BANK_INFO.name}</p>
                    <p className="text-blue-600"><span className="font-semibold">Account:</span> {BANK_INFO.account}</p>
                    <p className="text-blue-600"><span className="font-semibold">Bank:</span> {BANK_INFO.bank}</p>
                    <p className="text-blue-600"><span className="font-semibold">Branch:</span> {BANK_INFO.branch}</p>
                    <p className="text-blue-500 mt-2 italic">Send payment receipt via WhatsApp after placing order.</p>
                  </div>

                  <button
                    onClick={handlePlaceOrder}
                    disabled={placing}
                    className="w-full py-3 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-xl font-bold text-lg hover:from-green-500 hover:to-green-400 transition shadow-lg disabled:opacity-50"
                  >
                    {placing ? 'Placing Order...' : '✅ Place Order'}
                  </button>
                  <button
                    onClick={() => setShowCheckout(false)}
                    className="w-full py-2 text-chocolate-500 hover:text-chocolate-700 text-sm transition"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
