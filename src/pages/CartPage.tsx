import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { ShoppingCart, Trash2, Plus, Minus, ArrowRight, Package, Truck } from 'lucide-react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { Order, ShippingAddress, OrderItem } from '../types';
import { getWhatsAppMessage, openWhatsAppPopup } from '../utils/whatsapp';
import { sendOrderConfirmationToAdmin, sendOrderConfirmationToCustomer } from '../utils/email';
import toast from 'react-hot-toast';

const CartPage: React.FC = () => {
  const { items, removeFromCart, updateQuantity, clearCart, subtotal, deliveryCharge, total, totalWeight } = useCart();
  const { currentUser, userData } = useAuth();
  const navigate = useNavigate();
  const [checkout, setCheckout] = useState(false);
  const [placing, setPlacing] = useState(false);
  const [whatsappPopup, setWhatsappPopup] = useState<{ url: string; message: string; trackingNumber: string; paymentMethod: string; total: number } | null>(null);
  const [form, setForm] = useState<ShippingAddress>({
    fullName: userData?.displayName || '',
    phone: userData?.phone || '',
    addressLine1: userData?.address || '',
    addressLine2: '',
    city: userData?.city || '',
    district: '',
    postalCode: '',
  });
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [notes, setNotes] = useState('');

  const handlePlaceOrder = async () => {
    if (!form.fullName || !form.phone || !form.addressLine1 || !form.city || !form.district) {
      return toast.error('Please fill in all required fields');
    }
    setPlacing(true);

    try {
      const trackingNumber = 'TRK' + Math.floor(100000 + Math.random() * 900000);
      const orderItems: OrderItem[] = items.map(item => ({
        productId: item.productId,
        productName: item.product.name,
        productImage: item.product.imageUrl,
        price: item.product.price,
        quantity: item.quantity,
        weight: item.product.weight,
      }));

      const orderData = {
        trackingNumber,
        userId: currentUser?.uid || 'guest',
        userEmail: currentUser?.email || 'guest@mrm.com',
        userName: form.fullName,
        userPhone: form.phone,
        items: orderItems,
        subtotal,
        deliveryCharge,
        total,
        status: 'pending',
        shippingAddress: form,
        paymentMethod,
        notes,
        createdAt: serverTimestamp(),
        statusHistory: [{ status: 'pending', note: 'Order placed', timestamp: new Date().toISOString() }],
      };

      const docRef = await addDoc(collection(db, 'orders'), orderData);
      const order = { id: docRef.id, ...orderData } as unknown as Order;

      // WhatsApp notification - always goes to admin's WhatsApp support number
      const msg = getWhatsAppMessage(order);
      const adminPhone = '94707070872';
      const waUrl = openWhatsAppPopup(adminPhone, msg);
      
      // Auto open WhatsApp popup immediately
      window.open(waUrl, '_blank');
      
      setWhatsappPopup({ url: waUrl, message: msg, trackingNumber, paymentMethod, total });

      // Send email notifications
      sendOrderConfirmationToAdmin(order);
      sendOrderConfirmationToCustomer(order);

      clearCart();
      toast.success('🎉 Order placed successfully!');
    } catch (e) {
      console.error(e);
      toast.error('Failed to place order. Please try again.');
    } finally {
      setPlacing(false);
    }
  };

  if (whatsappPopup) {
    return (
      <div className="bg-[#0d0500] min-h-screen flex items-center justify-center px-4 py-12">
        <div className="max-w-lg w-full bg-[#1a0800] border border-amber-900/30 rounded-2xl p-8 text-center shadow-2xl">
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-2xl font-bold text-white mb-2">Order Placed!</h2>
          <p className="text-amber-200/60 mb-6">Your order has been placed successfully. You'll receive updates about your order.</p>

          {/* Tracking Number Section */}
          <div className="bg-amber-950/40 border border-amber-800/30 rounded-xl p-4 mb-6">
            <div className="text-xs text-amber-200/50 uppercase tracking-wider mb-1">Your Tracking Number</div>
            <div className="text-3xl font-bold font-mono text-amber-400 tracking-widest">{whatsappPopup.trackingNumber}</div>
            <p className="text-xs text-amber-200/40 mt-2">Use this tracking number to follow your order progress.</p>
          </div>

          {/* Bank Transfer Details Section */}
          {whatsappPopup.paymentMethod === 'bank' && (
            <div className="bg-amber-900/10 border border-amber-800/20 rounded-xl p-4 mb-6 text-left text-sm space-y-2">
              <div className="font-semibold text-amber-400 flex items-center gap-1.5">🏦 Bank Transfer Details:</div>
              <p className="text-xs text-amber-200/60 font-medium">Please transfer the total of <span className="text-amber-400 font-semibold">Rs. {whatsappPopup.total.toLocaleString()}</span> to the account below and share the receipt via WhatsApp:</p>
              <div className="grid grid-cols-2 gap-2 bg-[#0d0500] p-3 rounded-lg border border-amber-900/30 text-xs">
                <div className="text-amber-400/60 font-medium">Bank Name:</div>
                <div className="text-white font-semibold">Commercial bank</div>
                <div className="text-amber-400/60 font-medium">Branch:</div>
                <div className="text-white font-semibold">Vavuniya</div>
                <div className="text-amber-400/60 font-medium">Account Name:</div>
                <div className="text-white font-semibold">RR Hasan</div>
                <div className="text-amber-400/60 font-medium">Account Number:</div>
                <div className="text-white font-mono font-semibold tracking-wider">8015204918</div>
              </div>
            </div>
          )}

          <div className="bg-[#0f0400] border border-amber-900/20 rounded-xl p-4 mb-6 text-left">
            <h3 className="text-amber-400 font-semibold mb-2 text-xs uppercase tracking-wider">📱 WhatsApp Notification</h3>
            <div className="bg-green-950/20 border border-green-900/20 rounded-lg p-3 text-xs text-green-400 whitespace-pre-line font-mono max-h-32 overflow-y-auto">
              {whatsappPopup.message}
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <a
              href={whatsappPopup.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-semibold transition-colors"
            >
              <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              Send WhatsApp Notification
            </a>
            <button
              onClick={() => navigate('/account/orders')}
              className="bg-amber-500 hover:bg-amber-600 text-white px-6 py-3 rounded-xl font-semibold transition-colors"
            >
              View My Orders
            </button>
            <Link to={`/tracking?number=${whatsappPopup.trackingNumber}`} className="text-amber-400 hover:text-amber-300 transition-colors text-sm underline">
              Track Your Order
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="bg-[#0d0500] min-h-screen flex flex-col items-center justify-center px-4">
        <ShoppingCart size={64} className="text-amber-900 mb-4" />
        <h2 className="text-2xl font-bold text-white mb-2">Your cart is empty</h2>
        <p className="text-amber-200/50 mb-6">Add some delicious Dubai chocolates!</p>
        <Link to="/products" className="bg-amber-500 hover:bg-amber-600 text-white px-8 py-3 rounded-xl font-semibold transition-colors">
          Shop Now
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-[#0d0500] min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl md:text-3xl font-bold text-white mb-8">Shopping Cart</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map(item => (
              <div key={item.productId} className="bg-[#1a0800] border border-amber-900/30 rounded-2xl p-4 flex gap-4">
                <div className="w-20 h-20 rounded-xl overflow-hidden bg-amber-950 flex-shrink-0">
                  <img src={item.product.imageUrl || '/images/dubai-choc-1.jpg'} alt={item.product.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-white font-medium leading-tight line-clamp-2">{item.product.name}</h3>
                  <p className="text-amber-200/40 text-xs mt-1">{item.product.weight}kg each</p>
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center gap-2 bg-amber-900/20 border border-amber-800/30 rounded-xl px-2 py-1">
                      <button onClick={() => updateQuantity(item.productId, item.quantity - 1)} className="text-amber-400 hover:text-white p-1 transition-colors">
                        <Minus size={14} />
                      </button>
                      <span className="text-white text-sm font-medium w-5 text-center">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.productId, item.quantity + 1)} className="text-amber-400 hover:text-white p-1 transition-colors">
                        <Plus size={14} />
                      </button>
                    </div>
                    <div className="text-right">
                      <div className="text-amber-400 font-bold">Rs. {(item.product.price * item.quantity).toLocaleString()}</div>
                      <div className="text-amber-200/30 text-xs">Rs. {item.product.price.toLocaleString()} each</div>
                    </div>
                  </div>
                </div>
                <button onClick={() => removeFromCart(item.productId)} className="text-red-400 hover:text-red-300 transition-colors flex-shrink-0">
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="space-y-4">
            <div className="bg-[#1a0800] border border-amber-900/30 rounded-2xl p-6">
              <h3 className="text-white font-semibold text-lg mb-4">Order Summary</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-amber-200/60">
                  <span>Subtotal ({items.reduce((s, i) => s + i.quantity, 0)} items)</span>
                  <span>Rs. {subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-amber-200/60">
                  <span>Total weight</span>
                  <span>{totalWeight.toFixed(3)} kg</span>
                </div>
                <div className="flex justify-between text-amber-200/60">
                  <span className="flex items-center gap-1"><Truck size={12} /> Delivery charge</span>
                  <span>Rs. {deliveryCharge}</span>
                </div>
                <div className="border-t border-amber-900/30 pt-3 flex justify-between text-white font-bold text-lg">
                  <span>Total</span>
                  <span className="text-amber-400">Rs. {total.toLocaleString()}</span>
                </div>
              </div>

              <button
                onClick={() => {
                  if (!currentUser) { navigate('/login'); return; }
                  setCheckout(true);
                }}
                className="w-full mt-6 bg-amber-500 hover:bg-amber-600 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
              >
                Proceed to Checkout <ArrowRight size={18} />
              </button>
            </div>

            {/* Delivery info */}
            <div className="bg-amber-900/10 border border-amber-800/20 rounded-2xl p-4">
              <h4 className="text-amber-400 text-sm font-medium mb-2 flex items-center gap-1"><Truck size={14} /> Delivery Charges</h4>
              <div className="space-y-1 text-xs text-amber-200/50">
                <div className="flex justify-between"><span>Up to 250G</span><span>Rs. 250</span></div>
                <div className="flex justify-between"><span>Up to 500G</span><span>Rs. 350</span></div>
                <div className="flex justify-between"><span>Up to 1KG</span><span>Rs. 450</span></div>
                <div className="flex justify-between"><span>Over 1KG</span><span>+ Rs. 100 / 500g</span></div>
              </div>
            </div>
          </div>
        </div>

        {/* Checkout Form */}
        {checkout && (
          <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-[#1a0800] border border-amber-900/30 rounded-2xl p-6 max-w-2xl w-full my-4">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">Shipping Details</h2>
                <button onClick={() => setCheckout(false)} className="text-amber-400 hover:text-white transition-colors text-xl">✕</button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="text-amber-300 text-xs font-medium block mb-1">Full Name *</label>
                  <input type="text" value={form.fullName} onChange={e => setForm(f => ({ ...f, fullName: e.target.value }))}
                    className="w-full bg-amber-950/30 border border-amber-800/30 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-amber-500" placeholder="John Silva" />
                </div>
                <div>
                  <label className="text-amber-300 text-xs font-medium block mb-1">Phone *</label>
                  <input type="tel" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                    className="w-full bg-amber-950/30 border border-amber-800/30 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-amber-500" placeholder="0707070872" />
                </div>
                <div className="md:col-span-2">
                  <label className="text-amber-300 text-xs font-medium block mb-1">Address Line 1 *</label>
                  <input type="text" value={form.addressLine1} onChange={e => setForm(f => ({ ...f, addressLine1: e.target.value }))}
                    className="w-full bg-amber-950/30 border border-amber-800/30 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-amber-500" placeholder="No. 123, Main Street" />
                </div>
                <div className="md:col-span-2">
                  <label className="text-amber-300 text-xs font-medium block mb-1">Address Line 2</label>
                  <input type="text" value={form.addressLine2} onChange={e => setForm(f => ({ ...f, addressLine2: e.target.value }))}
                    className="w-full bg-amber-950/30 border border-amber-800/30 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-amber-500" placeholder="Village, Area (optional)" />
                </div>
                <div>
                  <label className="text-amber-300 text-xs font-medium block mb-1">City *</label>
                  <input type="text" value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))}
                    className="w-full bg-amber-950/30 border border-amber-800/30 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-amber-500" placeholder="Colombo" />
                </div>
                <div>
                  <label className="text-amber-300 text-xs font-medium block mb-1">District *</label>
                  <input type="text" value={form.district} onChange={e => setForm(f => ({ ...f, district: e.target.value }))}
                    className="w-full bg-amber-950/30 border border-amber-800/30 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-amber-500" placeholder="Colombo" />
                </div>
                <div>
                  <label className="text-amber-300 text-xs font-medium block mb-1">Postal Code</label>
                  <input type="text" value={form.postalCode} onChange={e => setForm(f => ({ ...f, postalCode: e.target.value }))}
                    className="w-full bg-amber-950/30 border border-amber-800/30 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-amber-500" placeholder="10100" />
                </div>
              </div>

              <div className="mb-4">
                <label className="text-amber-300 text-xs font-medium block mb-2">Payment Method</label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { value: 'cod', label: '💵 Cash on Delivery' },
                    { value: 'bank', label: '🏦 Bank Transfer' },
                  ].map(pm => (
                    <button
                      key={pm.value}
                      onClick={() => setPaymentMethod(pm.value)}
                      className={`p-3 rounded-xl border text-sm font-medium transition-all ${paymentMethod === pm.value ? 'border-amber-500 bg-amber-500/20 text-amber-300' : 'border-amber-900/30 text-amber-200/50 hover:border-amber-700/50'}`}
                    >
                      {pm.label}
                    </button>
                  ))}
                </div>
              </div>

              {paymentMethod === 'bank' && (
                <div className="mb-4 p-4 bg-amber-900/20 border border-amber-800/30 rounded-xl space-y-2 text-sm text-amber-200/80">
                  <div className="font-semibold text-amber-400">🏦 Bank Transfer Details:</div>
                  <p className="text-xs">Please transfer the total amount to the following bank account and upload/send the receipt via WhatsApp:</p>
                  <div className="grid grid-cols-2 gap-2 bg-[#0d0500] p-3 rounded-lg border border-amber-900/30 text-xs">
                    <div className="text-amber-400/60 font-medium">Bank Name:</div>
                    <div className="text-white font-semibold">Commercial bank</div>
                    <div className="text-amber-400/60 font-medium">Branch:</div>
                    <div className="text-white font-semibold">Vavuniya</div>
                    <div className="text-amber-400/60 font-medium">Account Name:</div>
                    <div className="text-white font-semibold">RR Hasan</div>
                    <div className="text-amber-400/60 font-medium">Account Number:</div>
                    <div className="text-white font-mono font-semibold tracking-wider">8015204918</div>
                  </div>
                </div>
              )}

              <div className="mb-6">
                <label className="text-amber-300 text-xs font-medium block mb-1">Order Notes</label>
                <textarea value={notes} onChange={e => setNotes(e.target.value)}
                  className="w-full bg-amber-950/30 border border-amber-800/30 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-amber-500 h-20 resize-none" placeholder="Special instructions..." />
              </div>

              {/* Order total */}
              <div className="bg-amber-900/20 rounded-xl p-4 mb-6">
                <div className="flex justify-between text-sm text-amber-200/60 mb-1">
                  <span>Subtotal</span><span>Rs. {subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm text-amber-200/60 mb-1">
                  <span>Delivery ({totalWeight.toFixed(3)}kg)</span><span>Rs. {deliveryCharge}</span>
                </div>
                <div className="flex justify-between text-white font-bold text-lg border-t border-amber-800/30 pt-2 mt-2">
                  <span>Total</span><span className="text-amber-400">Rs. {total.toLocaleString()}</span>
                </div>
              </div>

              <button
                onClick={handlePlaceOrder}
                disabled={placing}
                className="w-full bg-amber-500 hover:bg-amber-600 text-white py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all hover:scale-[1.02] disabled:opacity-60"
              >
                {placing ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Package size={20} />}
                {placing ? 'Placing Order...' : 'Place Order'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartPage;
