"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Package, ShoppingBag, Users, MessageSquare,
  Settings, Star, TrendingUp, DollarSign
} from "lucide-react";
import { getAllOrders, getProducts, getAllUsers, getAllContactMessages } from "@/lib/firestore";

export default function AdminDashboard() {
  const { user, userData, loading, isAdmin } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalProducts: 0,
    totalUsers: 0,
    totalMessages: 0,
    totalRevenue: 0,
    pendingOrders: 0,
  });
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    if (!loading) {
      if (!user) { router.push("/login"); return; }
      if (!isAdmin) { router.push("/"); return; }
    }
  }, [user, loading, isAdmin, router]);

  useEffect(() => {
    if (isAdmin) {
      Promise.all([
        getAllOrders(),
        getProducts(),
        getAllUsers(),
        getAllContactMessages(),
      ]).then(([orders, products, users, messages]) => {
        setStats({
          totalOrders: orders.length,
          totalProducts: products.length,
          totalUsers: users.length,
          totalMessages: messages.length,
          totalRevenue: orders.reduce((s, o) => s + (o.grandTotal || 0), 0),
          pendingOrders: orders.filter((o) => o.status === "pending").length,
        });
      }).finally(() => setStatsLoading(false));
    }
  }, [isAdmin]);

  if (loading || !isAdmin) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#fdf8f0" }}>
        <div style={{ textAlign: "center", color: "#c8a45f" }}>
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>⚙️</div>
          <p>Loading admin panel...</p>
        </div>
      </div>
    );
  }

  const statCards = [
    { title: "Total Orders", value: stats.totalOrders, icon: <ShoppingBag size={24} />, color: "#c8a45f", sub: `${stats.pendingOrders} pending` },
    { title: "Total Revenue", value: `Rs. ${stats.totalRevenue.toLocaleString()}`, icon: <DollarSign size={24} />, color: "#25d366", sub: "All time" },
    { title: "Products", value: stats.totalProducts, icon: <Package size={24} />, color: "#3b82f6", sub: "In catalog" },
    { title: "Customers", value: stats.totalUsers, icon: <Users size={24} />, color: "#8b5cf6", sub: "Registered users" },
    { title: "Messages", value: stats.totalMessages, icon: <MessageSquare size={24} />, color: "#f59e0b", sub: "Contact inquiries" },
  ];

  const adminMenuItems = [
    { href: "/admin/orders", label: "Manage Orders", icon: <ShoppingBag size={28} />, desc: "View, update & track all orders", color: "#c8a45f" },
    { href: "/admin/products", label: "Manage Products", icon: <Package size={28} />, desc: "Add, edit & delete products", color: "#3b82f6" },
    { href: "/admin/users", label: "Manage Users", icon: <Users size={28} />, desc: "View & manage customer accounts", color: "#8b5cf6" },
    { href: "/admin/offers", label: "Special Offers", icon: <Star size={28} />, desc: "Add banners, popups & announcements", color: "#f59e0b" },
    { href: "/admin/settings", label: "Site Settings", icon: <Settings size={28} />, desc: "Edit hero, about, contact info", color: "#ef4444" },
    { href: "/admin/messages", label: "Messages", icon: <MessageSquare size={28} />, desc: "Customer contact messages", color: "#25d366" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#fdf8f0", padding: "32px 16px" }}>
      <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
        {/* Header */}
        <div
          style={{
            background: "linear-gradient(135deg,#1a0a00,#3d1c02)",
            borderRadius: "20px",
            padding: "32px",
            marginBottom: "32px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "16px",
            border: "1px solid rgba(200,164,95,0.2)",
          }}
        >
          <div>
            <div style={{ color: "#9a8070", fontSize: "13px", marginBottom: "4px" }}>
              ADMIN DASHBOARD
            </div>
            <h1
              style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: "28px",
                fontWeight: "700",
                background: "linear-gradient(135deg,#c8a45f,#e8c97a)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                marginBottom: "4px",
              }}
            >
              Welcome, {userData?.displayName?.split(" ")[0]}! 👑
            </h1>
            <div style={{ color: "#9a8070", fontSize: "14px" }}>MRM Shopping Admin Panel</div>
          </div>
          <div style={{ display: "flex", gap: "12px" }}>
            <Link
              href="/products"
              style={{ padding: "10px 20px", background: "rgba(200,164,95,0.15)", border: "1px solid rgba(200,164,95,0.3)", borderRadius: "10px", color: "#e8c97a", textDecoration: "none", fontSize: "14px", fontWeight: "600" }}
            >
              View Store
            </Link>
            <Link
              href="/admin/products/new"
              style={{ padding: "10px 20px", background: "linear-gradient(135deg,#c8a45f,#e8c97a)", color: "#1a0a00", textDecoration: "none", borderRadius: "10px", fontSize: "14px", fontWeight: "700" }}
            >
              + Add Product
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))",
            gap: "16px",
            marginBottom: "32px",
          }}
        >
          {statCards.map((card, i) => (
            <div
              key={i}
              style={{
                background: "#fff",
                borderRadius: "16px",
                padding: "20px",
                border: "1px solid rgba(200,164,95,0.15)",
                boxShadow: "0 4px 15px rgba(61,28,2,0.05)",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                <div style={{ width: "44px", height: "44px", borderRadius: "12px", background: `${card.color}20`, display: "flex", alignItems: "center", justifyContent: "center", color: card.color }}>
                  {card.icon}
                </div>
              </div>
              <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "22px", fontWeight: "700", color: "#1a0a00", marginBottom: "4px" }}>
                {statsLoading ? "..." : card.value}
              </div>
              <div style={{ color: "#6b5040", fontWeight: "600", fontSize: "13px" }}>{card.title}</div>
              <div style={{ color: "#9a8070", fontSize: "12px", marginTop: "2px" }}>{card.sub}</div>
            </div>
          ))}
        </div>

        {/* Quick actions */}
        <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "22px", fontWeight: "700", color: "#1a0a00", marginBottom: "20px" }}>
          Admin Controls
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: "20px" }}>
          {adminMenuItems.map((item, i) => (
            <Link
              key={i}
              href={item.href}
              style={{
                background: "#fff",
                borderRadius: "16px",
                padding: "24px",
                border: "1px solid rgba(200,164,95,0.15)",
                textDecoration: "none",
                boxShadow: "0 4px 15px rgba(61,28,2,0.05)",
                display: "block",
                transition: "all 0.3s ease",
              }}
              className="product-card"
            >
              <div style={{ width: "56px", height: "56px", borderRadius: "14px", background: `${item.color}15`, display: "flex", alignItems: "center", justifyContent: "center", color: item.color, marginBottom: "16px" }}>
                {item.icon}
              </div>
              <h3 style={{ fontWeight: "700", color: "#1a0a00", fontSize: "17px", marginBottom: "6px" }}>{item.label}</h3>
              <p style={{ color: "#9a8070", fontSize: "13px" }}>{item.desc}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
