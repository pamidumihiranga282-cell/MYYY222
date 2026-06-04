"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { updateUser } from "@/lib/firestore";
import toast from "react-hot-toast";
import Link from "next/link";
import { User, Package, Settings, Edit2, Save, X, Phone, MapPin, Mail } from "lucide-react";

export default function AccountPage() {
  const { user, userData, loading, refreshUserData, isAdmin } = useAuth();
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    displayName: "",
    phone: "",
    address: "",
  });

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
    if (userData) {
      setForm({
        displayName: userData.displayName || "",
        phone: userData.phone || "",
        address: userData.address || "",
      });
    }
  }, [user, userData, loading, router]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      await updateUser(user.uid, {
        displayName: form.displayName,
        phone: form.phone,
        address: form.address,
      });
      await refreshUserData();
      setEditing(false);
      toast.success("Profile updated successfully!");
    } catch {
      toast.error("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#fdf8f0" }}>
        <div style={{ textAlign: "center", color: "#c8a45f" }}>
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>⏳</div>
          <p>Loading your account...</p>
        </div>
      </div>
    );
  }

  if (!user || !userData) return null;

  const navItems = [
    { href: "/account", label: "Profile", icon: <User size={18} />, active: true },
    { href: "/account/orders", label: "My Orders", icon: <Package size={18} />, active: false },
    ...(isAdmin ? [{ href: "/admin", label: "Admin Panel", icon: <Settings size={18} />, active: false }] : []),
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#fdf8f0", padding: "32px 16px" }}>
      <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: "32px", alignItems: "start" }}>
          {/* Sidebar */}
          <div>
            {/* Profile card */}
            <div
              style={{
                background: "linear-gradient(135deg,#1a0a00,#3d1c02)",
                borderRadius: "20px",
                padding: "28px",
                marginBottom: "16px",
                textAlign: "center",
                border: "1px solid rgba(200,164,95,0.2)",
              }}
            >
              <div
                style={{
                  width: "80px",
                  height: "80px",
                  borderRadius: "50%",
                  background: "linear-gradient(135deg,#c8a45f,#e8c97a)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 16px",
                  fontSize: "32px",
                  fontWeight: "700",
                  color: "#1a0a00",
                  overflow: "hidden",
                }}
              >
                {userData.photoURL ? (
                  <img src={userData.photoURL} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : (
                  userData.displayName?.charAt(0).toUpperCase() || "U"
                )}
              </div>
              <div
                style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: "18px",
                  fontWeight: "700",
                  color: "#e8c97a",
                  marginBottom: "4px",
                }}
              >
                {userData.displayName}
              </div>
              <div style={{ color: "#9a8070", fontSize: "13px", marginBottom: "8px" }}>{userData.email}</div>
              {isAdmin && (
                <span
                  style={{
                    background: "linear-gradient(135deg,#c8a45f,#e8c97a)",
                    color: "#1a0a00",
                    fontSize: "11px",
                    fontWeight: "700",
                    padding: "3px 12px",
                    borderRadius: "999px",
                  }}
                >
                  ADMIN
                </span>
              )}
            </div>

            {/* Nav */}
            <div style={{ background: "#fff", borderRadius: "16px", overflow: "hidden", border: "1px solid rgba(200,164,95,0.15)" }}>
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    padding: "16px 20px",
                    color: item.active ? "#c8a45f" : "#6b5040",
                    textDecoration: "none",
                    fontWeight: item.active ? "700" : "500",
                    background: item.active ? "rgba(200,164,95,0.08)" : "transparent",
                    borderLeft: item.active ? "3px solid #c8a45f" : "3px solid transparent",
                    transition: "all 0.2s",
                    fontSize: "15px",
                    borderBottom: "1px solid rgba(200,164,95,0.08)",
                  }}
                >
                  {item.icon}
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Main Content */}
          <div>
            <div
              style={{
                background: "#fff",
                borderRadius: "20px",
                padding: "32px",
                border: "1px solid rgba(200,164,95,0.15)",
                boxShadow: "0 4px 20px rgba(61,28,2,0.05)",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "28px" }}>
                <h2
                  style={{
                    fontFamily: "'Playfair Display', serif",
                    fontSize: "24px",
                    fontWeight: "700",
                    color: "#1a0a00",
                  }}
                >
                  My Profile
                </h2>
                {!editing ? (
                  <button
                    onClick={() => setEditing(true)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      padding: "10px 20px",
                      background: "linear-gradient(135deg,#c8a45f,#e8c97a)",
                      color: "#1a0a00",
                      border: "none",
                      borderRadius: "10px",
                      cursor: "pointer",
                      fontWeight: "700",
                      fontSize: "14px",
                    }}
                  >
                    <Edit2 size={15} /> Edit Profile
                  </button>
                ) : (
                  <div style={{ display: "flex", gap: "8px" }}>
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        padding: "10px 18px",
                        background: "linear-gradient(135deg,#c8a45f,#e8c97a)",
                        color: "#1a0a00",
                        border: "none",
                        borderRadius: "10px",
                        cursor: "pointer",
                        fontWeight: "700",
                        fontSize: "14px",
                      }}
                    >
                      <Save size={15} /> {saving ? "Saving..." : "Save"}
                    </button>
                    <button
                      onClick={() => setEditing(false)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        padding: "10px 18px",
                        background: "rgba(200,164,95,0.1)",
                        color: "#c8a45f",
                        border: "1px solid rgba(200,164,95,0.3)",
                        borderRadius: "10px",
                        cursor: "pointer",
                        fontWeight: "600",
                        fontSize: "14px",
                      }}
                    >
                      <X size={15} /> Cancel
                    </button>
                  </div>
                )}
              </div>

              {/* Fields */}
              <div style={{ display: "grid", gap: "20px" }}>
                {[
                  { label: "Full Name", field: "displayName", icon: <User size={18} />, type: "text" },
                  { label: "Email Address", field: "email", icon: <Mail size={18} />, type: "email", readOnly: true },
                  { label: "Phone Number", field: "phone", icon: <Phone size={18} />, type: "tel" },
                  { label: "Delivery Address", field: "address", icon: <MapPin size={18} />, type: "text" },
                ].map((f) => (
                  <div key={f.field}>
                    <label
                      style={{
                        display: "block",
                        color: "#6b5040",
                        fontWeight: "600",
                        fontSize: "13px",
                        marginBottom: "8px",
                      }}
                    >
                      {f.label}
                    </label>
                    <div style={{ position: "relative" }}>
                      <span
                        style={{
                          position: "absolute",
                          left: "14px",
                          top: "50%",
                          transform: "translateY(-50%)",
                          color: "#c8a45f",
                        }}
                      >
                        {f.icon}
                      </span>
                      <input
                        type={f.type}
                        value={f.readOnly ? (userData?.email || "") : form[f.field as keyof typeof form]}
                        onChange={(e) =>
                          !f.readOnly && setForm({ ...form, [f.field]: e.target.value })
                        }
                        readOnly={f.readOnly || !editing}
                        style={{
                          width: "100%",
                          padding: "14px 14px 14px 48px",
                          border: "1px solid rgba(200,164,95,0.3)",
                          borderRadius: "12px",
                          fontSize: "15px",
                          color: "#1a0a00",
                          background: (f.readOnly || !editing) ? "#fdf8f0" : "#fff",
                          cursor: (f.readOnly || !editing) ? "default" : "text",
                          outline: "none",
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div
                style={{
                  marginTop: "32px",
                  padding: "16px 20px",
                  background: "rgba(200,164,95,0.08)",
                  borderRadius: "12px",
                  border: "1px solid rgba(200,164,95,0.2)",
                }}
              >
                <div style={{ fontWeight: "600", color: "#c8a45f", marginBottom: "4px", fontSize: "14px" }}>
                  Account Type: {userData.role === "admin" ? "👑 Administrator" : "🛍 Customer"}
                </div>
                <div style={{ color: "#9a8070", fontSize: "13px" }}>
                  Member since: {userData.createdAt ? "Recently joined" : "Unknown"}
                </div>
              </div>

              {/* Quick Links */}
              <div style={{ marginTop: "24px", display: "flex", gap: "12px", flexWrap: "wrap" }}>
                <Link
                  href="/account/orders"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "12px 20px",
                    background: "#fdf8f0",
                    border: "1px solid rgba(200,164,95,0.2)",
                    borderRadius: "10px",
                    color: "#1a0a00",
                    textDecoration: "none",
                    fontWeight: "600",
                    fontSize: "14px",
                  }}
                >
                  <Package size={16} /> My Orders
                </Link>
                <Link
                  href="/tracking"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "12px 20px",
                    background: "#fdf8f0",
                    border: "1px solid rgba(200,164,95,0.2)",
                    borderRadius: "10px",
                    color: "#1a0a00",
                    textDecoration: "none",
                    fontWeight: "600",
                    fontSize: "14px",
                  }}
                >
                  📦 Track Order
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          div[style*="grid-template-columns: 280px 1fr"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
