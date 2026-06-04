"use client";

import { useState } from "react";
import { getOrderByTracking } from "@/lib/firestore";
import type { Order } from "@/lib/types";
import { Search, Package, CheckCircle, Truck, Clock, XCircle } from "lucide-react";
import { format } from "date-fns";

const STATUS_CONFIG: Record<string, { color: string; bg: string; icon: React.ReactNode; label: string }> = {
  pending: { color: "#f59e0b", bg: "rgba(245,158,11,0.1)", icon: <Clock size={20} />, label: "Order Pending" },
  confirmed: { color: "#3b82f6", bg: "rgba(59,130,246,0.1)", icon: <CheckCircle size={20} />, label: "Confirmed" },
  processing: { color: "#8b5cf6", bg: "rgba(139,92,246,0.1)", icon: <Package size={20} />, label: "Processing" },
  shipped: { color: "#c8a45f", bg: "rgba(200,164,95,0.1)", icon: <Truck size={20} />, label: "Shipped" },
  delivered: { color: "#25d366", bg: "rgba(37,211,102,0.1)", icon: <CheckCircle size={20} />, label: "Delivered" },
  cancelled: { color: "#ef4444", bg: "rgba(239,68,68,0.1)", icon: <XCircle size={20} />, label: "Cancelled" },
};

const STEPS = ["pending", "confirmed", "processing", "shipped", "delivered"];

export default function TrackingPage() {
  const [trackingNum, setTrackingNum] = useState("");
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState("");

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackingNum.trim()) {
      setError("Please enter a tracking number");
      return;
    }
    setLoading(true);
    setError("");
    setSearched(false);
    try {
      const result = await getOrderByTracking(trackingNum.trim().toUpperCase());
      setOrder(result);
      setSearched(true);
      if (!result) setError("No order found with this tracking number");
    } catch {
      setError("Failed to search. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const statusCfg = order ? STATUS_CONFIG[order.status] : null;
  const currentStep = order ? STEPS.indexOf(order.status) : -1;

  const formatTimestamp = (ts: unknown): string => {
    if (!ts) return "";
    try {
      if (typeof ts === "object" && ts !== null && "toDate" in ts) {
        return format((ts as { toDate(): Date }).toDate(), "dd MMM yyyy, hh:mm a");
      }
      return format(new Date(ts as string), "dd MMM yyyy, hh:mm a");
    } catch {
      return "";
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#fdf8f0", padding: "48px 16px" }}>
      {/* Header */}
      <div
        style={{
          textAlign: "center",
          marginBottom: "48px",
        }}
      >
        <div style={{ fontSize: "56px", marginBottom: "16px" }}>📦</div>
        <h1
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: "clamp(2rem,5vw,3rem)",
            fontWeight: "700",
            color: "#1a0a00",
            marginBottom: "12px",
          }}
        >
          Track Your Order
        </h1>
        <p style={{ color: "#6b5040", fontSize: "16px", maxWidth: "500px", margin: "0 auto" }}>
          Enter your tracking number to see real-time updates on your order
        </p>
      </div>

      <div style={{ maxWidth: "700px", margin: "0 auto" }}>
        {/* Search */}
        <form onSubmit={handleSearch} style={{ marginBottom: "40px" }}>
          <div style={{ display: "flex", gap: "12px" }}>
            <div style={{ position: "relative", flex: 1 }}>
              <Search
                size={20}
                style={{
                  position: "absolute",
                  left: "16px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "#9a7a3f",
                }}
              />
              <input
                type="text"
                value={trackingNum}
                onChange={(e) => setTrackingNum(e.target.value.toUpperCase())}
                placeholder="Enter tracking number (e.g. MRM12345678)"
                style={{
                  width: "100%",
                  padding: "18px 18px 18px 52px",
                  border: "2px solid rgba(200,164,95,0.3)",
                  borderRadius: "14px",
                  fontSize: "16px",
                  color: "#1a0a00",
                  background: "#fff",
                  boxShadow: "0 4px 15px rgba(61,28,2,0.05)",
                  fontWeight: "600",
                  letterSpacing: "1px",
                }}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              style={{
                padding: "18px 32px",
                background: "linear-gradient(135deg,#c8a45f,#e8c97a)",
                color: "#1a0a00",
                border: "none",
                borderRadius: "14px",
                fontWeight: "700",
                fontSize: "16px",
                cursor: loading ? "not-allowed" : "pointer",
                boxShadow: "0 8px 25px rgba(200,164,95,0.3)",
                whiteSpace: "nowrap",
              }}
            >
              {loading ? "..." : "Track"}
            </button>
          </div>
          {error && (
            <div style={{ marginTop: "12px", padding: "12px 16px", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: "10px", color: "#ef4444", fontSize: "14px", fontWeight: "600" }}>
              ⚠️ {error}
            </div>
          )}
        </form>

        {/* Order Result */}
        {searched && order && (
          <div
            style={{
              background: "#fff",
              borderRadius: "20px",
              overflow: "hidden",
              border: "1px solid rgba(200,164,95,0.2)",
              boxShadow: "0 10px 40px rgba(61,28,2,0.1)",
            }}
          >
            {/* Order header */}
            <div
              style={{
                background: "linear-gradient(135deg,#1a0a00,#3d1c02)",
                padding: "24px 28px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <div style={{ color: "#9a8070", fontSize: "12px", marginBottom: "4px" }}>
                  TRACKING NUMBER
                </div>
                <div
                  style={{
                    fontFamily: "'Playfair Display', serif",
                    fontSize: "22px",
                    fontWeight: "700",
                    color: "#e8c97a",
                    letterSpacing: "2px",
                  }}
                >
                  {order.trackingNumber}
                </div>
              </div>
              {statusCfg && (
                <div
                  style={{
                    background: statusCfg.bg,
                    border: `1px solid ${statusCfg.color}`,
                    borderRadius: "999px",
                    padding: "8px 20px",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    color: statusCfg.color,
                    fontWeight: "700",
                    fontSize: "14px",
                  }}
                >
                  {statusCfg.icon}
                  {statusCfg.label}
                </div>
              )}
            </div>

            {/* Progress bar */}
            {order.status !== "cancelled" && (
              <div style={{ padding: "28px", borderBottom: "1px solid rgba(200,164,95,0.1)" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", position: "relative" }}>
                  <div style={{ position: "absolute", top: "16px", left: "10%", right: "10%", height: "4px", background: "#f5ead8", borderRadius: "2px", zIndex: 0 }}>
                    <div style={{ height: "100%", background: "linear-gradient(90deg,#c8a45f,#e8c97a)", borderRadius: "2px", width: `${currentStep >= 0 ? (currentStep / (STEPS.length - 1)) * 100 : 0}%`, transition: "width 0.5s ease" }} />
                  </div>
                  {STEPS.map((step, i) => (
                    <div key={step} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", zIndex: 1 }}>
                      <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: i <= currentStep ? "linear-gradient(135deg,#c8a45f,#e8c97a)" : "#f5ead8", border: i <= currentStep ? "none" : "2px solid #d4b896", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "700", fontSize: "14px", color: i <= currentStep ? "#1a0a00" : "#9a8070" }}>
                        {i < currentStep ? "✓" : i + 1}
                      </div>
                      <div style={{ fontSize: "11px", fontWeight: "600", color: i <= currentStep ? "#c8a45f" : "#9a8070", textTransform: "capitalize", textAlign: "center" }}>
                        {STATUS_CONFIG[step]?.label || step}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Order details */}
            <div style={{ padding: "24px 28px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "24px" }}>
                {[
                  { label: "Customer", value: order.userName },
                  { label: "Phone", value: order.userPhone },
                  { label: "Total Amount", value: `Rs. ${order.grandTotal.toLocaleString()}` },
                  { label: "Delivery Charge", value: `Rs. ${order.deliveryCharge}` },
                  { label: "Payment", value: order.paymentMethod === "cash" ? "💵 Cash on Delivery" : "🏦 Bank Transfer" },
                  { label: "Weight", value: `${order.totalWeight?.toFixed(2) || "N/A"} kg` },
                ].map((item, i) => (
                  <div key={i} style={{ padding: "12px 16px", background: "#fdf8f0", borderRadius: "10px" }}>
                    <div style={{ fontSize: "11px", color: "#9a8070", fontWeight: "600", marginBottom: "4px" }}>{item.label}</div>
                    <div style={{ fontSize: "14px", fontWeight: "700", color: "#1a0a00" }}>{item.value}</div>
                  </div>
                ))}
              </div>

              <div style={{ marginBottom: "24px" }}>
                <div style={{ fontWeight: "700", color: "#1a0a00", fontSize: "16px", marginBottom: "12px" }}>
                  📍 Delivery Address
                </div>
                <div style={{ padding: "12px 16px", background: "#fdf8f0", borderRadius: "10px", color: "#6b5040", fontSize: "14px" }}>
                  {order.shippingAddress}
                </div>
              </div>

              {/* Items */}
              <div style={{ marginBottom: "24px" }}>
                <div style={{ fontWeight: "700", color: "#1a0a00", fontSize: "16px", marginBottom: "12px" }}>
                  🛍 Order Items
                </div>
                {order.items.map((item, i) => (
                  <div key={i} style={{ display: "flex", gap: "12px", alignItems: "center", padding: "10px 0", borderBottom: "1px solid rgba(200,164,95,0.1)" }}>
                    <img src={item.image} alt={item.name} style={{ width: "50px", height: "50px", objectFit: "cover", borderRadius: "8px" }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: "600", color: "#1a0a00", fontSize: "14px" }}>{item.name}</div>
                      <div style={{ color: "#9a8070", fontSize: "12px" }}>Qty: {item.quantity} × Rs. {item.price.toLocaleString()}</div>
                    </div>
                    <div style={{ fontWeight: "700", color: "#1a0a00" }}>Rs. {(item.price * item.quantity).toLocaleString()}</div>
                  </div>
                ))}
              </div>

              {/* Status History */}
              {order.statusHistory && order.statusHistory.length > 0 && (
                <div>
                  <div style={{ fontWeight: "700", color: "#1a0a00", fontSize: "16px", marginBottom: "16px" }}>
                    📋 Status History
                  </div>
                  {[...order.statusHistory].reverse().map((hist, i) => {
                    const cfg = STATUS_CONFIG[hist.status];
                    return (
                      <div key={i} style={{ display: "flex", gap: "14px", marginBottom: "16px" }}>
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                          <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: cfg?.bg || "#f5ead8", border: `2px solid ${cfg?.color || "#c8a45f"}`, display: "flex", alignItems: "center", justifyContent: "center", color: cfg?.color || "#c8a45f" }}>
                            {cfg?.icon || <Package size={16} />}
                          </div>
                          {i < order.statusHistory.length - 1 && (
                            <div style={{ width: "2px", flex: 1, background: "rgba(200,164,95,0.2)", marginTop: "6px" }} />
                          )}
                        </div>
                        <div style={{ flex: 1, paddingTop: "6px" }}>
                          <div style={{ fontWeight: "700", color: cfg?.color || "#c8a45f", fontSize: "14px", textTransform: "capitalize" }}>
                            {cfg?.label || hist.status}
                          </div>
                          <div style={{ color: "#6b5040", fontSize: "13px", marginTop: "2px" }}>{hist.message}</div>
                          <div style={{ color: "#9a8070", fontSize: "11px", marginTop: "4px" }}>
                            {formatTimestamp(hist.timestamp)}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tips */}
        {!searched && (
          <div
            style={{
              background: "#fff",
              borderRadius: "16px",
              padding: "28px",
              border: "1px solid rgba(200,164,95,0.15)",
            }}
          >
            <h3 style={{ fontWeight: "700", color: "#1a0a00", marginBottom: "16px" }}>
              How to track your order?
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {[
                "Your tracking number is sent via email after placing an order",
                "It also appears in your Account → My Orders section",
                "Format example: MRM12345678",
                "WhatsApp confirmation sent at time of order",
              ].map((tip, i) => (
                <div key={i} style={{ display: "flex", gap: "10px", alignItems: "flex-start", color: "#6b5040", fontSize: "14px" }}>
                  <span style={{ color: "#c8a45f", fontWeight: "700", minWidth: "24px" }}>{i + 1}.</span>
                  {tip}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
