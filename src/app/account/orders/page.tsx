"use client";

import { useEffect, useState, Suspense } from "react";
import { useAuth } from "@/lib/auth-context";
import { useRouter, useSearchParams } from "next/navigation";
import { getUserOrders } from "@/lib/firestore";
import type { Order } from "@/lib/types";
import Link from "next/link";
import { Package, ArrowLeft, Eye, MessageCircle } from "lucide-react";
import { format } from "date-fns";

const STATUS_COLORS: Record<string, { color: string; bg: string }> = {
  pending: { color: "#f59e0b", bg: "rgba(245,158,11,0.1)" },
  confirmed: { color: "#3b82f6", bg: "rgba(59,130,246,0.1)" },
  processing: { color: "#8b5cf6", bg: "rgba(139,92,246,0.1)" },
  shipped: { color: "#c8a45f", bg: "rgba(200,164,95,0.1)" },
  delivered: { color: "#25d366", bg: "rgba(37,211,102,0.1)" },
  cancelled: { color: "#ef4444", bg: "rgba(239,68,68,0.1)" },
};

function formatTimestamp(ts: unknown): string {
  if (!ts) return "N/A";
  try {
    if (typeof ts === "object" && ts !== null && "toDate" in ts) {
      return format((ts as { toDate(): Date }).toDate(), "dd MMM yyyy");
    }
    return format(new Date(ts as string), "dd MMM yyyy");
  } catch {
    return "N/A";
  }
}

function OrdersContent() {
  const { user, userData, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const successOrderId = searchParams.get("success");
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
      return;
    }
    if (user) {
      getUserOrders(user.uid)
        .then(setOrders)
        .finally(() => setOrdersLoading(false));
    }
  }, [user, loading, router]);

  const sendWhatsApp = (order: Order) => {
    const msg = encodeURIComponent(
      `🛍 *MRM Shopping - Order Update*\n\n` +
      `Order #${order.trackingNumber}\n` +
      `Status: ${order.status.toUpperCase()}\n` +
      `Total: Rs. ${order.grandTotal.toLocaleString()}\n\n` +
      `Track at: /tracking`
    );
    window.open(`https://wa.me/94707070872?text=${msg}`, "_blank");
  };

  if (loading || ordersLoading) {
    return (
      <div style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center", color: "#c8a45f" }}>
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>📦</div>
          <p>Loading your orders...</p>
        </div>
      </div>
    );
  }

  if (selectedOrder) {
    const cfg = STATUS_COLORS[selectedOrder.status];
    return (
      <div style={{ minHeight: "100vh", background: "#fdf8f0", padding: "32px 16px" }}>
        <div style={{ maxWidth: "800px", margin: "0 auto" }}>
          <button
            onClick={() => setSelectedOrder(null)}
            style={{ display: "flex", alignItems: "center", gap: "8px", background: "none", border: "1px solid rgba(200,164,95,0.3)", borderRadius: "8px", padding: "8px 16px", color: "#c8a45f", cursor: "pointer", marginBottom: "24px", fontSize: "14px" }}
          >
            <ArrowLeft size={16} /> Back to Orders
          </button>

          <div style={{ background: "#fff", borderRadius: "20px", overflow: "hidden", border: "1px solid rgba(200,164,95,0.15)", boxShadow: "0 10px 40px rgba(61,28,2,0.1)" }}>
            <div style={{ background: "linear-gradient(135deg,#1a0a00,#3d1c02)", padding: "24px 28px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
              <div>
                <div style={{ color: "#9a8070", fontSize: "12px", marginBottom: "4px" }}>ORDER #</div>
                <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "20px", fontWeight: "700", color: "#e8c97a", letterSpacing: "1px" }}>{selectedOrder.trackingNumber}</div>
                <div style={{ color: "#9a8070", fontSize: "13px", marginTop: "4px" }}>Placed: {formatTimestamp(selectedOrder.createdAt)}</div>
              </div>
              <div style={{ background: cfg?.bg || "rgba(200,164,95,0.1)", border: `1px solid ${cfg?.color || "#c8a45f"}`, borderRadius: "999px", padding: "8px 20px", color: cfg?.color || "#c8a45f", fontWeight: "700", fontSize: "14px", textTransform: "capitalize" }}>
                {selectedOrder.status}
              </div>
            </div>

            <div style={{ padding: "28px" }}>
              {/* Items */}
              <h4 style={{ fontWeight: "700", color: "#1a0a00", marginBottom: "16px" }}>Order Items</h4>
              {selectedOrder.items.map((item, i) => (
                <div key={i} style={{ display: "flex", gap: "12px", alignItems: "center", padding: "12px 0", borderBottom: "1px solid rgba(200,164,95,0.1)" }}>
                  <img src={item.image} alt={item.name} style={{ width: "60px", height: "60px", objectFit: "cover", borderRadius: "8px" }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: "600", color: "#1a0a00" }}>{item.name}</div>
                    <div style={{ color: "#9a8070", fontSize: "13px" }}>Qty: {item.quantity} × Rs. {item.price.toLocaleString()}</div>
                  </div>
                  <div style={{ fontWeight: "700", color: "#1a0a00" }}>Rs. {(item.price * item.quantity).toLocaleString()}</div>
                </div>
              ))}

              {/* Totals */}
              <div style={{ marginTop: "20px", padding: "16px", background: "#fdf8f0", borderRadius: "12px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", fontSize: "14px" }}>
                  <span style={{ color: "#6b5040" }}>Subtotal</span>
                  <span>Rs. {selectedOrder.totalPrice.toLocaleString()}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", fontSize: "14px" }}>
                  <span style={{ color: "#6b5040" }}>Delivery</span>
                  <span>Rs. {selectedOrder.deliveryCharge}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontWeight: "700", fontSize: "16px", borderTop: "1px solid rgba(200,164,95,0.2)", paddingTop: "8px", marginTop: "4px" }}>
                  <span>Total</span>
                  <span style={{ color: "#c8a45f" }}>Rs. {selectedOrder.grandTotal.toLocaleString()}</span>
                </div>
              </div>

              {/* Delivery info */}
              <div style={{ marginTop: "20px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div style={{ padding: "14px 16px", background: "#fdf8f0", borderRadius: "10px" }}>
                  <div style={{ fontSize: "11px", color: "#9a8070", fontWeight: "600", marginBottom: "4px" }}>DELIVERY ADDRESS</div>
                  <div style={{ fontSize: "14px", color: "#1a0a00" }}>{selectedOrder.shippingAddress}</div>
                </div>
                <div style={{ padding: "14px 16px", background: "#fdf8f0", borderRadius: "10px" }}>
                  <div style={{ fontSize: "11px", color: "#9a8070", fontWeight: "600", marginBottom: "4px" }}>PAYMENT</div>
                  <div style={{ fontSize: "14px", color: "#1a0a00" }}>{selectedOrder.paymentMethod === "cash" ? "💵 Cash on Delivery" : "🏦 Bank Transfer"}</div>
                </div>
              </div>

              {/* Status history */}
              {selectedOrder.statusHistory && selectedOrder.statusHistory.length > 0 && (
                <div style={{ marginTop: "24px" }}>
                  <h4 style={{ fontWeight: "700", color: "#1a0a00", marginBottom: "16px" }}>Status Updates</h4>
                  {[...selectedOrder.statusHistory].reverse().map((h, i) => (
                    <div key={i} style={{ display: "flex", gap: "12px", marginBottom: "12px" }}>
                      <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: STATUS_COLORS[h.status]?.color || "#c8a45f", marginTop: "5px", flexShrink: 0 }} />
                      <div>
                        <div style={{ fontWeight: "600", color: STATUS_COLORS[h.status]?.color || "#c8a45f", fontSize: "13px", textTransform: "capitalize" }}>{h.status}</div>
                        <div style={{ color: "#6b5040", fontSize: "13px" }}>{h.message}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Actions */}
              <div style={{ display: "flex", gap: "12px", marginTop: "24px", flexWrap: "wrap" }}>
                <Link
                  href={`/tracking?q=${selectedOrder.trackingNumber}`}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "12px 20px",
                    background: "linear-gradient(135deg,#c8a45f,#e8c97a)",
                    color: "#1a0a00",
                    textDecoration: "none",
                    borderRadius: "10px",
                    fontWeight: "700",
                    fontSize: "14px",
                  }}
                >
                  📦 Track Order
                </Link>
                <button
                  onClick={() => sendWhatsApp(selectedOrder)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "12px 20px",
                    background: "#25d366",
                    color: "#fff",
                    border: "none",
                    borderRadius: "10px",
                    cursor: "pointer",
                    fontWeight: "700",
                    fontSize: "14px",
                  }}
                >
                  <MessageCircle size={16} /> WhatsApp
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#fdf8f0", padding: "32px 16px" }}>
      <div style={{ maxWidth: "900px", margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "32px" }}>
          <Link href="/account" style={{ display: "flex", alignItems: "center", gap: "6px", background: "none", border: "1px solid rgba(200,164,95,0.3)", borderRadius: "8px", padding: "8px 14px", color: "#c8a45f", textDecoration: "none", fontSize: "14px" }}>
            <ArrowLeft size={16} /> Account
          </Link>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "28px", fontWeight: "700", color: "#1a0a00" }}>
            My Orders
          </h1>
        </div>

        {successOrderId && (
          <div style={{ background: "rgba(37,211,102,0.1)", border: "1px solid rgba(37,211,102,0.3)", borderRadius: "12px", padding: "16px 20px", marginBottom: "24px", color: "#25d366", fontWeight: "600" }}>
            ✅ Order placed successfully! Check your WhatsApp for confirmation.
          </div>
        )}

        {orders.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 0" }}>
            <div style={{ fontSize: "60px", marginBottom: "16px" }}>📦</div>
            <h3 style={{ fontWeight: "700", color: "#1a0a00", marginBottom: "8px" }}>No orders yet</h3>
            <p style={{ color: "#9a8070", marginBottom: "24px" }}>Start shopping to see your orders here!</p>
            <Link href="/products" style={{ padding: "14px 32px", background: "linear-gradient(135deg,#c8a45f,#e8c97a)", color: "#1a0a00", textDecoration: "none", borderRadius: "12px", fontWeight: "700" }}>
              Shop Now
            </Link>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {orders.map((order) => {
              const cfg = STATUS_COLORS[order.status];
              return (
                <div
                  key={order.id}
                  style={{ background: "#fff", borderRadius: "16px", padding: "20px 24px", border: "1px solid rgba(200,164,95,0.15)", boxShadow: "0 4px 15px rgba(61,28,2,0.05)" }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px", flexWrap: "wrap", gap: "12px" }}>
                    <div>
                      <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "18px", fontWeight: "700", color: "#1a0a00", marginBottom: "4px" }}>
                        #{order.trackingNumber}
                      </div>
                      <div style={{ color: "#9a8070", fontSize: "13px" }}>
                        {order.items.length} item{order.items.length > 1 ? "s" : ""} &nbsp;|&nbsp; {formatTimestamp(order.createdAt)}
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <span style={{ background: cfg?.bg || "rgba(200,164,95,0.1)", border: `1px solid ${cfg?.color || "#c8a45f"}`, borderRadius: "999px", padding: "5px 14px", color: cfg?.color || "#c8a45f", fontWeight: "700", fontSize: "13px", textTransform: "capitalize" }}>
                        {order.status}
                      </span>
                      <div style={{ fontFamily: "'Playfair Display', serif", fontWeight: "700", fontSize: "18px", color: "#1a0a00" }}>
                        Rs. {order.grandTotal.toLocaleString()}
                      </div>
                    </div>
                  </div>

                  {/* Items preview */}
                  <div style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
                    {order.items.slice(0, 3).map((item, i) => (
                      <img key={i} src={item.image} alt={item.name} style={{ width: "48px", height: "48px", objectFit: "cover", borderRadius: "8px", border: "1px solid rgba(200,164,95,0.2)" }} />
                    ))}
                    {order.items.length > 3 && (
                      <div style={{ width: "48px", height: "48px", borderRadius: "8px", background: "rgba(200,164,95,0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "#c8a45f", fontWeight: "700", fontSize: "14px" }}>
                        +{order.items.length - 3}
                      </div>
                    )}
                  </div>

                  <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                    <button
                      onClick={() => setSelectedOrder(order)}
                      style={{ display: "flex", alignItems: "center", gap: "6px", padding: "9px 16px", background: "linear-gradient(135deg,#c8a45f,#e8c97a)", color: "#1a0a00", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "700", fontSize: "13px" }}
                    >
                      <Eye size={14} /> View Details
                    </button>
                    <Link href={`/tracking`} style={{ display: "flex", alignItems: "center", gap: "6px", padding: "9px 16px", background: "rgba(200,164,95,0.1)", border: "1px solid rgba(200,164,95,0.3)", borderRadius: "8px", color: "#c8a45f", textDecoration: "none", fontWeight: "600", fontSize: "13px" }}>
                      <Package size={14} /> Track
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default function OrdersPage() {
  return (
    <Suspense fallback={<div style={{ textAlign: "center", padding: "100px", color: "#c8a45f" }}>Loading...</div>}>
      <OrdersContent />
    </Suspense>
  );
}
