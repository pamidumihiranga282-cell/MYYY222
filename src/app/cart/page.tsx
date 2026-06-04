"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCart } from "@/lib/cart-context";
import { useAuth } from "@/lib/auth-context";
import { createOrder } from "@/lib/firestore";
import toast from "react-hot-toast";
import { Trash2, Plus, Minus, ShoppingBag, ArrowLeft, Truck } from "lucide-react";
import { v4 as uuidv4 } from "uuid";

function generateTrackingNumber(): string {
  return "MRM" + Date.now().toString().slice(-8).toUpperCase();
}

export default function CartPage() {
  const { items, removeFromCart, updateQuantity, clearCart, totalPrice, deliveryCharge, grandTotal, totalWeight } = useCart();
  const { user, userData } = useAuth();
  const router = useRouter();
  const [checkoutMode, setCheckoutMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: userData?.displayName || "",
    email: userData?.email || "",
    phone: userData?.phone || "",
    address: userData?.address || "",
    notes: "",
    paymentMethod: "cash",
  });

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error("Please login to place an order");
      router.push("/login");
      return;
    }
    if (!form.phone || !form.address) {
      toast.error("Please fill in phone and delivery address");
      return;
    }
    if (items.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    setLoading(true);
    try {
      const trackingNumber = generateTrackingNumber();
      const orderId = await createOrder({
        trackingNumber,
        userId: user.uid,
        userEmail: form.email || user.email || "",
        userName: form.name || userData?.displayName || "",
        userPhone: form.phone,
        shippingAddress: form.address,
        items: items.map((i) => ({
          id: i.id,
          name: i.name,
          price: i.price,
          quantity: i.quantity,
          image: i.image,
          weight: i.weight,
        })),
        totalPrice,
        deliveryCharge,
        grandTotal,
        totalWeight,
        status: "pending",
        statusHistory: [
          {
            status: "pending",
            message: "Order placed successfully",
            timestamp: new Date(),
            updatedBy: "system",
          },
        ],
        paymentMethod: form.paymentMethod,
        notes: form.notes,
        whatsappNotified: false,
      });

      // Send email notification
      try {
        await fetch("/api/send-order-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            orderId,
            trackingNumber,
            customerName: form.name,
            customerEmail: form.email,
            customerPhone: form.phone,
            shippingAddress: form.address,
            items,
            totalPrice,
            deliveryCharge,
            grandTotal,
            paymentMethod: form.paymentMethod,
          }),
        });
      } catch {
        // Email failure is non-critical
      }

      clearCart();
      toast.success(`Order placed! Tracking: ${trackingNumber} 🎉`);

      // WhatsApp notification
      const waMsg = encodeURIComponent(
        `🛍 *MRM Shopping - Order Confirmed!*\n\n` +
        `Hello ${form.name}!\n` +
        `Your order has been placed successfully.\n\n` +
        `📦 *Order ID:* ${orderId}\n` +
        `🔍 *Tracking No:* ${trackingNumber}\n` +
        `💰 *Total:* Rs. ${grandTotal.toLocaleString()}\n\n` +
        `Track your order at: mrmshopping.com/tracking\n\n` +
        `Thank you for shopping with us! 🙏`
      );
      window.open(
        `https://wa.me/94${form.phone.replace(/^0/, "")}?text=${waMsg}`,
        "_blank"
      );

      router.push(`/account/orders?success=${orderId}`);
    } catch (err) {
      console.error(err);
      toast.error("Failed to place order. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0 && !checkoutMode) {
    return (
      <div
        style={{
          minHeight: "80vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#fdf8f0",
          padding: "20px",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "80px", marginBottom: "24px" }}>🛒</div>
          <h2
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "28px",
              color: "#1a0a00",
              marginBottom: "12px",
            }}
          >
            Your cart is empty
          </h2>
          <p style={{ color: "#9a8070", marginBottom: "28px" }}>
            Add some amazing Dubai products to get started!
          </p>
          <Link
            href="/products"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "14px 32px",
              background: "linear-gradient(135deg,#c8a45f,#e8c97a)",
              color: "#1a0a00",
              textDecoration: "none",
              borderRadius: "12px",
              fontWeight: "700",
              fontSize: "16px",
            }}
          >
            <ShoppingBag size={18} /> Start Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#fdf8f0", padding: "32px 16px" }}>
      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "32px" }}>
          <button
            onClick={() => checkoutMode ? setCheckoutMode(false) : router.back()}
            style={{ background: "none", border: "1px solid rgba(200,164,95,0.3)", borderRadius: "8px", padding: "8px 14px", color: "#c8a45f", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px", fontSize: "14px" }}
          >
            <ArrowLeft size={16} /> {checkoutMode ? "Back to Cart" : "Continue Shopping"}
          </button>
          <h1
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "2rem",
              fontWeight: "700",
              color: "#1a0a00",
            }}
          >
            {checkoutMode ? "Checkout" : "Shopping Cart"}
          </h1>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: "32px", alignItems: "start" }}>
          {/* Left side */}
          <div>
            {!checkoutMode ? (
              // Cart items
              <div>
                {items.map((item) => (
                  <div
                    key={item.id}
                    style={{
                      background: "#fff",
                      borderRadius: "16px",
                      padding: "20px",
                      marginBottom: "16px",
                      border: "1px solid rgba(200,164,95,0.15)",
                      boxShadow: "0 4px 15px rgba(61,28,2,0.05)",
                      display: "flex",
                      gap: "16px",
                      alignItems: "center",
                    }}
                  >
                    <img
                      src={item.image || "https://images.pexels.com/photos/10477142/pexels-photo-10477142.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=200&w=200"}
                      alt={item.name}
                      style={{ width: "90px", height: "90px", objectFit: "cover", borderRadius: "12px" }}
                    />
                    <div style={{ flex: 1 }}>
                      <h3 style={{ fontWeight: "700", color: "#1a0a00", fontSize: "16px", marginBottom: "4px" }}>
                        {item.name}
                      </h3>
                      <div style={{ color: "#9a8070", fontSize: "13px", marginBottom: "12px" }}>
                        ⚖️ {item.weight} kg each &nbsp;|&nbsp; Rs. {item.price.toLocaleString()} each
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <div style={{ display: "flex", alignItems: "center", border: "1px solid rgba(200,164,95,0.3)", borderRadius: "8px", overflow: "hidden" }}>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            style={{ padding: "6px 12px", background: "none", border: "none", color: "#c8a45f", cursor: "pointer" }}
                          >
                            <Minus size={14} />
                          </button>
                          <span style={{ padding: "6px 14px", fontWeight: "700", color: "#1a0a00", borderLeft: "1px solid rgba(200,164,95,0.2)", borderRight: "1px solid rgba(200,164,95,0.2)" }}>
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            style={{ padding: "6px 12px", background: "none", border: "none", color: "#c8a45f", cursor: "pointer" }}
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          style={{ padding: "6px 10px", background: "rgba(255,100,100,0.1)", border: "1px solid rgba(255,100,100,0.2)", borderRadius: "8px", color: "#ff6b6b", cursor: "pointer" }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontWeight: "700", fontSize: "18px", color: "#1a0a00" }}>
                        Rs. {(item.price * item.quantity).toLocaleString()}
                      </div>
                      <div style={{ fontSize: "12px", color: "#9a8070" }}>
                        {(item.weight * item.quantity).toFixed(2)} kg total
                      </div>
                    </div>
                  </div>
                ))}

                <div style={{ display: "flex", justifyContent: "space-between", marginTop: "8px" }}>
                  <button
                    onClick={clearCart}
                    style={{ padding: "10px 20px", background: "rgba(255,100,100,0.1)", border: "1px solid rgba(255,100,100,0.2)", borderRadius: "8px", color: "#ff6b6b", cursor: "pointer", fontWeight: "600", fontSize: "14px" }}
                  >
                    Clear Cart
                  </button>
                  <Link
                    href="/products"
                    style={{ padding: "10px 20px", background: "rgba(200,164,95,0.1)", border: "1px solid rgba(200,164,95,0.3)", borderRadius: "8px", color: "#c8a45f", textDecoration: "none", fontWeight: "600", fontSize: "14px" }}
                  >
                    + Add More Items
                  </Link>
                </div>
              </div>
            ) : (
              // Checkout form
              <form onSubmit={handleCheckout}>
                <div style={{ background: "#fff", borderRadius: "16px", padding: "28px", border: "1px solid rgba(200,164,95,0.15)" }}>
                  <h3 style={{ fontWeight: "700", color: "#1a0a00", marginBottom: "24px", fontSize: "18px" }}>
                    Delivery Information
                  </h3>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                    {[
                      { label: "Full Name *", name: "name", type: "text", placeholder: "Your name" },
                      { label: "Phone Number *", name: "phone", type: "tel", placeholder: "07X XXX XXXX" },
                      { label: "Email", name: "email", type: "email", placeholder: "your@email.com" },
                    ].map((f) => (
                      <div key={f.name} style={{ gridColumn: f.name === "email" ? "span 2" : "auto" }}>
                        <label style={{ display: "block", color: "#6b5040", fontWeight: "600", fontSize: "13px", marginBottom: "6px" }}>
                          {f.label}
                        </label>
                        <input
                          type={f.type}
                          name={f.name}
                          value={form[f.name as keyof typeof form]}
                          onChange={(e) => setForm({ ...form, [f.name]: e.target.value })}
                          placeholder={f.placeholder}
                          style={{ width: "100%", padding: "12px", border: "1px solid rgba(200,164,95,0.3)", borderRadius: "10px", fontSize: "15px", color: "#1a0a00" }}
                          required={f.name === "phone" || f.name === "name"}
                        />
                      </div>
                    ))}
                    <div style={{ gridColumn: "span 2" }}>
                      <label style={{ display: "block", color: "#6b5040", fontWeight: "600", fontSize: "13px", marginBottom: "6px" }}>
                        Delivery Address *
                      </label>
                      <input
                        value={form.address}
                        onChange={(e) => setForm({ ...form, address: e.target.value })}
                        placeholder="Full delivery address"
                        style={{ width: "100%", padding: "12px", border: "1px solid rgba(200,164,95,0.3)", borderRadius: "10px", fontSize: "15px", color: "#1a0a00" }}
                        required
                      />
                    </div>
                    <div style={{ gridColumn: "span 2" }}>
                      <label style={{ display: "block", color: "#6b5040", fontWeight: "600", fontSize: "13px", marginBottom: "6px" }}>
                        Order Notes (Optional)
                      </label>
                      <textarea
                        value={form.notes}
                        onChange={(e) => setForm({ ...form, notes: e.target.value })}
                        placeholder="Any special instructions..."
                        rows={3}
                        style={{ width: "100%", padding: "12px", border: "1px solid rgba(200,164,95,0.3)", borderRadius: "10px", fontSize: "15px", color: "#1a0a00", resize: "vertical" }}
                      />
                    </div>
                  </div>

                  <div style={{ marginTop: "20px" }}>
                    <label style={{ display: "block", color: "#6b5040", fontWeight: "600", fontSize: "13px", marginBottom: "10px" }}>
                      Payment Method
                    </label>
                    <div style={{ display: "flex", gap: "12px" }}>
                      {[
                        { value: "cash", label: "💵 Cash on Delivery" },
                        { value: "bank", label: "🏦 Bank Transfer" },
                      ].map((pm) => (
                        <label key={pm.value} style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", padding: "12px 20px", border: `2px solid ${form.paymentMethod === pm.value ? "#c8a45f" : "rgba(200,164,95,0.2)"}`, borderRadius: "10px", background: form.paymentMethod === pm.value ? "rgba(200,164,95,0.1)" : "transparent" }}>
                          <input
                            type="radio"
                            value={pm.value}
                            checked={form.paymentMethod === pm.value}
                            onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })}
                            style={{ accentColor: "#c8a45f" }}
                          />
                          <span style={{ fontWeight: "600", color: "#1a0a00", fontSize: "14px" }}>{pm.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div style={{ marginTop: "16px", padding: "12px", background: "rgba(37,211,102,0.08)", borderRadius: "10px", border: "1px solid rgba(37,211,102,0.2)", fontSize: "13px", color: "#25d366" }}>
                    💬 WhatsApp order confirmation will be sent after placing order
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    width: "100%",
                    marginTop: "20px",
                    padding: "18px",
                    background: loading ? "rgba(200,164,95,0.5)" : "linear-gradient(135deg,#c8a45f,#e8c97a)",
                    color: "#1a0a00",
                    border: "none",
                    borderRadius: "14px",
                    fontWeight: "700",
                    fontSize: "18px",
                    cursor: loading ? "not-allowed" : "pointer",
                    boxShadow: "0 8px 25px rgba(200,164,95,0.4)",
                  }}
                >
                  {loading ? "Placing Order..." : `Place Order — Rs. ${grandTotal.toLocaleString()}`}
                </button>
              </form>
            )}
          </div>

          {/* Order Summary */}
          <div
            style={{
              background: "#fff",
              borderRadius: "16px",
              padding: "24px",
              border: "1px solid rgba(200,164,95,0.15)",
              boxShadow: "0 4px 20px rgba(61,28,2,0.08)",
              position: "sticky",
              top: "100px",
            }}
          >
            <h3 style={{ fontWeight: "700", color: "#1a0a00", marginBottom: "20px", fontSize: "18px" }}>
              Order Summary
            </h3>
            <div style={{ borderBottom: "1px solid rgba(200,164,95,0.15)", paddingBottom: "16px", marginBottom: "16px" }}>
              {items.map((item) => (
                <div key={item.id} style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", fontSize: "14px" }}>
                  <span style={{ color: "#6b5040" }}>{item.name} × {item.quantity}</span>
                  <span style={{ fontWeight: "600", color: "#1a0a00" }}>Rs. {(item.price * item.quantity).toLocaleString()}</span>
                </div>
              ))}
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px", fontSize: "14px" }}>
              <span style={{ color: "#6b5040" }}>Subtotal</span>
              <span style={{ fontWeight: "600" }}>Rs. {totalPrice.toLocaleString()}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px", fontSize: "14px" }}>
              <span style={{ color: "#6b5040" }}>
                <Truck size={13} style={{ display: "inline" }} /> Delivery
              </span>
              <span style={{ fontWeight: "600", color: "#c8a45f" }}>Rs. {deliveryCharge}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px", fontSize: "13px", color: "#9a8070" }}>
              <span>Total Weight</span>
              <span>{totalWeight.toFixed(2)} kg</span>
            </div>
            <div style={{ borderTop: "2px solid rgba(200,164,95,0.2)", paddingTop: "16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontWeight: "700", color: "#1a0a00", fontSize: "18px" }}>Grand Total</span>
              <span style={{ fontWeight: "700", color: "#1a0a00", fontSize: "22px", fontFamily: "'Playfair Display', serif" }}>
                Rs. {grandTotal.toLocaleString()}
              </span>
            </div>
            <div style={{ marginTop: "8px", fontSize: "12px", color: "#9a8070", textAlign: "center" }}>
              Delivery: Rs.150 (up to 1kg) to Rs.450 (max)
            </div>

            {!checkoutMode && (
              <button
                onClick={() => {
                  if (!user) {
                    toast.error("Please login to checkout");
                    router.push("/login");
                    return;
                  }
                  setCheckoutMode(true);
                  setForm({
                    name: userData?.displayName || "",
                    email: userData?.email || "",
                    phone: userData?.phone || "",
                    address: userData?.address || "",
                    notes: "",
                    paymentMethod: "cash",
                  });
                }}
                style={{
                  width: "100%",
                  marginTop: "20px",
                  padding: "16px",
                  background: "linear-gradient(135deg,#c8a45f,#e8c97a)",
                  color: "#1a0a00",
                  border: "none",
                  borderRadius: "12px",
                  fontWeight: "700",
                  fontSize: "16px",
                  cursor: "pointer",
                  boxShadow: "0 8px 25px rgba(200,164,95,0.3)",
                }}
              >
                Proceed to Checkout
              </button>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          div[style*="grid-template-columns: 1fr 380px"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
