"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getAllOrders, updateOrderStatus } from "@/lib/firestore";
import type { Order } from "@/lib/types";
import toast from "react-hot-toast";
import { ArrowLeft, Search, Eye, X, MessageCircle } from "lucide-react";
import { format } from "date-fns";

const STATUS_OPTIONS = ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"] as const;

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
      return format((ts as { toDate(): Date }).toDate(), "dd MMM yyyy, hh:mm a");
    }
    return format(new Date(ts as string), "dd MMM yyyy, hh:mm a");
  } catch { return "N/A"; }
}

export default function AdminOrdersPage() {
  const { isAdmin, loading, userData } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [filtered, setFiltered] = useState<Order[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [updateStatus, setUpdateStatus] = useState("");
  const [updateMsg, setUpdateMsg] = useState("");
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (!loading && !isAdmin) router.push("/");
  }, [loading, isAdmin, router]);

  useEffect(() => {
    if (isAdmin) {
      getAllOrders().then((o) => { setOrders(o); setFiltered(o); }).finally(() => setOrdersLoading(false));
    }
  }, [isAdmin]);

  useEffect(() => {
    let result = [...orders];
    if (statusFilter !== "all") result = result.filter((o) => o.status === statusFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((o) =>
        o.trackingNumber.toLowerCase().includes(q) ||
        o.userName.toLowerCase().includes(q) ||
        o.userEmail.toLowerCase().includes(q)
      );
    }
    setFiltered(result);
  }, [orders, statusFilter, search]);

  const handleUpdateStatus = async () => {
    if (!selectedOrder || !updateStatus || !updateMsg.trim()) {
      toast.error("Please select status and enter a message");
      return;
    }
    setUpdating(true);
    try {
      await updateOrderStatus(
        selectedOrder.id,
        updateStatus as Order["status"],
        updateMsg,
        userData?.displayName || "Admin"
      );
      // Send email notification
      try {
        await fetch("/api/send-status-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            orderId: selectedOrder.id,
            trackingNumber: selectedOrder.trackingNumber,
            customerName: selectedOrder.userName,
            customerEmail: selectedOrder.userEmail,
            status: updateStatus,
            message: updateMsg,
          }),
        });
      } catch {}

      // Send WhatsApp
      const waMsg = encodeURIComponent(
        `🛍 *MRM Shopping - Order Update*\n\n` +
        `Hello ${selectedOrder.userName}!\n` +
        `Your order *${selectedOrder.trackingNumber}* has been updated.\n\n` +
        `📦 Status: *${updateStatus.toUpperCase()}*\n` +
        `📝 Message: ${updateMsg}\n\n` +
        `Track your order: /tracking\n\nThank you! 🙏`
      );
      window.open(
        `https://wa.me/94${selectedOrder.userPhone.replace(/^0/, "")}?text=${waMsg}`,
        "_blank"
      );

      // Update local state
      setOrders((prev) =>
        prev.map((o) =>
          o.id === selectedOrder.id
            ? {
                ...o,
                status: updateStatus as Order["status"],
                statusHistory: [
                  ...(o.statusHistory || []),
                  { status: updateStatus, message: updateMsg, timestamp: new Date(), updatedBy: userData?.displayName || "Admin" },
                ],
              }
            : o
        )
      );
      toast.success("Order status updated! WhatsApp sent. ✅");
      setSelectedOrder(null);
      setUpdateStatus("");
      setUpdateMsg("");
    } catch {
      toast.error("Failed to update order status");
    } finally {
      setUpdating(false);
    }
  };

  if (loading || !isAdmin) return <div style={{ textAlign: "center", padding: "100px", color: "#c8a45f" }}>Loading...</div>;

  return (
    <div style={{ minHeight: "100vh", background: "#fdf8f0", padding: "32px 16px" }}>
      <div style={{ maxWidth: "1300px", margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "24px", flexWrap: "wrap" }}>
          <Link href="/admin" style={{ display: "flex", alignItems: "center", gap: "6px", border: "1px solid rgba(200,164,95,0.3)", borderRadius: "8px", padding: "8px 14px", color: "#c8a45f", textDecoration: "none", fontSize: "14px" }}>
            <ArrowLeft size={16} /> Dashboard
          </Link>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "26px", fontWeight: "700", color: "#1a0a00" }}>
            Orders Management
          </h1>
        </div>

        {/* Filters */}
        <div style={{ display: "flex", gap: "12px", marginBottom: "20px", flexWrap: "wrap" }}>
          <div style={{ position: "relative" }}>
            <Search size={16} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#9a7a3f" }} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by tracking, name, email..."
              style={{ padding: "10px 10px 10px 38px", border: "1px solid rgba(200,164,95,0.3)", borderRadius: "10px", fontSize: "14px", color: "#1a0a00", background: "#fff", minWidth: "280px" }}
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ padding: "10px 16px", border: "1px solid rgba(200,164,95,0.3)", borderRadius: "10px", fontSize: "14px", color: "#1a0a00", background: "#fff", cursor: "pointer" }}
          >
            <option value="all">All Statuses</option>
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
            ))}
          </select>
        </div>

        <div style={{ color: "#6b5040", fontSize: "14px", marginBottom: "16px" }}>
          {filtered.length} order{filtered.length !== 1 ? "s" : ""} found
        </div>

        {ordersLoading ? (
          <div style={{ textAlign: "center", padding: "60px", color: "#c8a45f" }}>Loading orders...</div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px", color: "#9a8070" }}>No orders found</div>
        ) : (
          <div style={{ background: "#fff", borderRadius: "16px", overflow: "auto", border: "1px solid rgba(200,164,95,0.15)" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "900px" }}>
              <thead>
                <tr style={{ background: "linear-gradient(135deg,#1a0a00,#3d1c02)" }}>
                  {["Tracking", "Customer", "Items", "Total", "Delivery", "Status", "Date", "Actions"].map((h) => (
                    <th key={h} style={{ padding: "14px 16px", textAlign: "left", color: "#e8c97a", fontWeight: "700", fontSize: "13px" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((order, i) => {
                  const cfg = STATUS_COLORS[order.status];
                  return (
                    <tr key={order.id} style={{ borderBottom: "1px solid rgba(200,164,95,0.08)", background: i % 2 === 0 ? "#fff" : "#fdf8f0" }}>
                      <td style={{ padding: "12px 16px" }}>
                        <div style={{ fontWeight: "700", color: "#c8a45f", fontSize: "13px", fontFamily: "monospace" }}>{order.trackingNumber}</div>
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        <div style={{ fontWeight: "600", color: "#1a0a00", fontSize: "14px" }}>{order.userName}</div>
                        <div style={{ color: "#9a8070", fontSize: "12px" }}>{order.userPhone}</div>
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        <div style={{ fontSize: "14px", color: "#1a0a00" }}>{order.items.length} item{order.items.length > 1 ? "s" : ""}</div>
                        <div style={{ fontSize: "12px", color: "#9a8070" }}>{order.totalWeight?.toFixed(2)} kg</div>
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        <div style={{ fontWeight: "700", color: "#1a0a00" }}>Rs. {order.grandTotal.toLocaleString()}</div>
                        <div style={{ fontSize: "12px", color: "#9a8070" }}>{order.paymentMethod === "cash" ? "💵 COD" : "🏦 Bank"}</div>
                      </td>
                      <td style={{ padding: "12px 16px", fontSize: "13px", color: "#6b5040" }}>
                        Rs. {order.deliveryCharge}
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        <span style={{ background: cfg?.bg, border: `1px solid ${cfg?.color}`, borderRadius: "999px", padding: "4px 12px", color: cfg?.color, fontWeight: "700", fontSize: "12px", textTransform: "capitalize" }}>
                          {order.status}
                        </span>
                      </td>
                      <td style={{ padding: "12px 16px", fontSize: "12px", color: "#9a8070" }}>
                        {formatTimestamp(order.createdAt)}
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        <button
                          onClick={() => { setSelectedOrder(order); setUpdateStatus(order.status); setUpdateMsg(""); }}
                          style={{ display: "flex", alignItems: "center", gap: "4px", padding: "7px 12px", background: "linear-gradient(135deg,#c8a45f,#e8c97a)", color: "#1a0a00", border: "none", borderRadius: "8px", cursor: "pointer", fontSize: "13px", fontWeight: "700" }}
                        >
                          <Eye size={13} /> Update
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Update Modal */}
      {selectedOrder && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 999, display: "flex", alignItems: "center", justifyContent: "center", padding: "16px" }}>
          <div style={{ background: "#fff", borderRadius: "20px", padding: "32px", maxWidth: "540px", width: "100%", boxShadow: "0 30px 80px rgba(0,0,0,0.3)", position: "relative" }}>
            <button onClick={() => setSelectedOrder(null)} style={{ position: "absolute", top: "16px", right: "16px", background: "rgba(200,164,95,0.1)", border: "none", borderRadius: "8px", cursor: "pointer", padding: "6px", color: "#c8a45f" }}>
              <X size={18} />
            </button>

            <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: "22px", fontWeight: "700", color: "#1a0a00", marginBottom: "8px" }}>
              Update Order
            </h3>
            <div style={{ color: "#9a8070", fontSize: "14px", marginBottom: "24px" }}>
              #{selectedOrder.trackingNumber} — {selectedOrder.userName}
            </div>

            {/* Order summary */}
            <div style={{ background: "#fdf8f0", borderRadius: "10px", padding: "16px", marginBottom: "20px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", fontSize: "13px" }}>
                <div><span style={{ color: "#9a8070" }}>Total:</span> <strong>Rs. {selectedOrder.grandTotal.toLocaleString()}</strong></div>
                <div><span style={{ color: "#9a8070" }}>Items:</span> <strong>{selectedOrder.items.length}</strong></div>
                <div><span style={{ color: "#9a8070" }}>Phone:</span> <strong>{selectedOrder.userPhone}</strong></div>
                <div><span style={{ color: "#9a8070" }}>Weight:</span> <strong>{selectedOrder.totalWeight?.toFixed(2)} kg</strong></div>
              </div>
              <div style={{ marginTop: "8px", fontSize: "13px", color: "#6b5040" }}>
                📍 {selectedOrder.shippingAddress}
              </div>
            </div>

            <div style={{ marginBottom: "16px" }}>
              <label style={{ display: "block", color: "#6b5040", fontWeight: "600", fontSize: "14px", marginBottom: "8px" }}>New Status</label>
              <select
                value={updateStatus}
                onChange={(e) => setUpdateStatus(e.target.value)}
                style={{ width: "100%", padding: "12px 16px", border: "1px solid rgba(200,164,95,0.3)", borderRadius: "10px", fontSize: "15px", color: "#1a0a00", background: "#fdf8f0", cursor: "pointer" }}
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: "24px" }}>
              <label style={{ display: "block", color: "#6b5040", fontWeight: "600", fontSize: "14px", marginBottom: "8px" }}>Status Message *</label>
              <textarea
                value={updateMsg}
                onChange={(e) => setUpdateMsg(e.target.value)}
                placeholder="e.g. Your order has been dispatched via courier..."
                rows={3}
                style={{ width: "100%", padding: "12px 16px", border: "1px solid rgba(200,164,95,0.3)", borderRadius: "10px", fontSize: "15px", color: "#1a0a00", resize: "vertical" }}
              />
            </div>

            <div style={{ display: "flex", gap: "12px" }}>
              <button
                onClick={handleUpdateStatus}
                disabled={updating}
                style={{ flex: 1, padding: "14px", background: "linear-gradient(135deg,#c8a45f,#e8c97a)", color: "#1a0a00", border: "none", borderRadius: "12px", fontWeight: "700", fontSize: "16px", cursor: updating ? "not-allowed" : "pointer" }}
              >
                {updating ? "Updating..." : "Update & Notify"}
              </button>
              <a
                href={`https://wa.me/94${selectedOrder.userPhone.replace(/^0/, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{ padding: "14px 18px", background: "#25d366", color: "#fff", textDecoration: "none", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center" }}
              >
                <MessageCircle size={20} />
              </a>
            </div>

            <div style={{ marginTop: "12px", fontSize: "12px", color: "#9a8070", textAlign: "center" }}>
              💬 WhatsApp notification will be sent to customer automatically
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
