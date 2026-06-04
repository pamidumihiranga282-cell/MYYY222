"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useCart } from "@/lib/cart-context";
import {
  ShoppingBag,
  Menu,
  X,
  User,
  LogOut,
  ChevronDown,
  Package,
  Settings,
  Search,
} from "lucide-react";

export default function Navbar() {
  const { user, userData, logout, isAdmin } = useAuth();
  const { totalItems } = useCart();
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropOpen, setDropOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/products", label: "Products" },
    { href: "/tracking", label: "Tracking" },
    { href: "/contact", label: "Contact" },
  ];

  const handleLogout = async () => {
    await logout();
    setDropOpen(false);
    router.push("/");
  };

  return (
    <nav
      style={{
        background: scrolled
          ? "linear-gradient(135deg, #1a0a00 0%, #3d1c02 100%)"
          : "linear-gradient(135deg, #1a0a00 0%, #3d1c02 100%)",
        boxShadow: scrolled ? "0 4px 20px rgba(0,0,0,0.3)" : "none",
        position: "sticky",
        top: 0,
        zIndex: 100,
        transition: "all 0.3s ease",
      }}
    >
      {/* Top bar */}
      <div
        style={{
          background: "linear-gradient(90deg, #c8a45f, #e8c97a, #c8a45f)",
          padding: "6px 0",
          textAlign: "center",
          fontSize: "13px",
          fontWeight: "600",
          color: "#1a0a00",
        }}
      >
        📞 070 707 0872 &nbsp;|&nbsp; 📍 Anuradhapura &nbsp;|&nbsp; 🚚 Free delivery on orders over Rs.5000
      </div>

      <div
        style={{
          maxWidth: "1280px",
          margin: "0 auto",
          padding: "0 16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          height: "70px",
        }}
      >
        {/* Logo */}
        <Link
          href="/"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            textDecoration: "none",
          }}
        >
          <span style={{ fontSize: "28px" }}>🛍</span>
          <div>
            <div
              style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: "20px",
                fontWeight: "700",
                background: "linear-gradient(135deg, #c8a45f, #e8c97a)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                lineHeight: 1.1,
              }}
            >
              MRM Shopping
            </div>
            <div style={{ fontSize: "9px", color: "#c8a45f", letterSpacing: "2px" }}>
              DUBAI LUXURY
            </div>
          </div>
        </Link>

        {/* Desktop Nav */}
        <div
          style={{ display: "flex", alignItems: "center", gap: "8px" }}
          className="hidden-mobile"
        >
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              style={{
                color: pathname === link.href ? "#e8c97a" : "#d4b896",
                textDecoration: "none",
                padding: "8px 16px",
                borderRadius: "8px",
                fontWeight: "500",
                fontSize: "15px",
                borderBottom: pathname === link.href ? "2px solid #c8a45f" : "2px solid transparent",
                transition: "all 0.2s",
              }}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Right side */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          {/* Cart */}
          <Link
            href="/cart"
            style={{
              position: "relative",
              color: "#e8c97a",
              textDecoration: "none",
              padding: "8px",
              borderRadius: "8px",
              display: "flex",
              alignItems: "center",
            }}
          >
            <ShoppingBag size={24} />
            {totalItems > 0 && (
              <span
                style={{
                  position: "absolute",
                  top: "-4px",
                  right: "-4px",
                  background: "linear-gradient(135deg, #c8a45f, #e8c97a)",
                  color: "#1a0a00",
                  borderRadius: "50%",
                  width: "20px",
                  height: "20px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "11px",
                  fontWeight: "700",
                }}
              >
                {totalItems}
              </span>
            )}
          </Link>

          {/* User menu */}
          {user ? (
            <div style={{ position: "relative" }}>
              <button
                onClick={() => setDropOpen(!dropOpen)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  background: "rgba(200,164,95,0.15)",
                  border: "1px solid rgba(200,164,95,0.4)",
                  borderRadius: "10px",
                  padding: "8px 14px",
                  color: "#e8c97a",
                  cursor: "pointer",
                  fontSize: "14px",
                  fontWeight: "500",
                }}
              >
                {userData?.photoURL ? (
                  <img
                    src={userData.photoURL}
                    alt="avatar"
                    style={{
                      width: "28px",
                      height: "28px",
                      borderRadius: "50%",
                      objectFit: "cover",
                    }}
                  />
                ) : (
                  <User size={18} />
                )}
                <span className="hidden-mobile">
                  {userData?.displayName?.split(" ")[0] || "Account"}
                </span>
                <ChevronDown size={14} />
              </button>

              {dropOpen && (
                <div
                  style={{
                    position: "absolute",
                    right: 0,
                    top: "calc(100% + 8px)",
                    background: "linear-gradient(135deg, #1a0a00, #2d1a00)",
                    border: "1px solid rgba(200,164,95,0.3)",
                    borderRadius: "12px",
                    minWidth: "200px",
                    boxShadow: "0 10px 40px rgba(0,0,0,0.5)",
                    overflow: "hidden",
                    zIndex: 200,
                  }}
                >
                  <div
                    style={{
                      padding: "16px",
                      borderBottom: "1px solid rgba(200,164,95,0.2)",
                    }}
                  >
                    <div style={{ color: "#e8c97a", fontWeight: "600", fontSize: "14px" }}>
                      {userData?.displayName}
                    </div>
                    <div style={{ color: "#9a7a3f", fontSize: "12px" }}>
                      {userData?.email}
                    </div>
                    {isAdmin && (
                      <span
                        style={{
                          background: "linear-gradient(135deg,#c8a45f,#e8c97a)",
                          color: "#1a0a00",
                          fontSize: "10px",
                          fontWeight: "700",
                          padding: "2px 8px",
                          borderRadius: "999px",
                          display: "inline-block",
                          marginTop: "4px",
                        }}
                      >
                        ADMIN
                      </span>
                    )}
                  </div>

                  {[
                    { href: "/account", label: "My Account", icon: <User size={15} /> },
                    { href: "/account/orders", label: "My Orders", icon: <Package size={15} /> },
                    ...(isAdmin
                      ? [{ href: "/admin", label: "Admin Dashboard", icon: <Settings size={15} /> }]
                      : []),
                  ].map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setDropOpen(false)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        padding: "12px 16px",
                        color: "#d4b896",
                        textDecoration: "none",
                        fontSize: "14px",
                        transition: "background 0.2s",
                      }}
                    >
                      {item.icon}
                      {item.label}
                    </Link>
                  ))}

                  <button
                    onClick={handleLogout}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      padding: "12px 16px",
                      color: "#ff6b6b",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      fontSize: "14px",
                      width: "100%",
                      borderTop: "1px solid rgba(200,164,95,0.2)",
                    }}
                  >
                    <LogOut size={15} />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div style={{ display: "flex", gap: "8px" }}>
              <Link
                href="/login"
                style={{
                  padding: "8px 16px",
                  color: "#e8c97a",
                  textDecoration: "none",
                  border: "1px solid rgba(200,164,95,0.4)",
                  borderRadius: "8px",
                  fontSize: "14px",
                  fontWeight: "500",
                  transition: "all 0.2s",
                }}
              >
                Login
              </Link>
              <Link
                href="/register"
                style={{
                  padding: "8px 16px",
                  background: "linear-gradient(135deg, #c8a45f, #e8c97a)",
                  color: "#1a0a00",
                  textDecoration: "none",
                  borderRadius: "8px",
                  fontSize: "14px",
                  fontWeight: "700",
                  transition: "all 0.2s",
                }}
              >
                Register
              </Link>
            </div>
          )}

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            style={{
              background: "none",
              border: "none",
              color: "#e8c97a",
              cursor: "pointer",
              display: "none",
              padding: "4px",
            }}
            className="show-mobile"
          >
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div
          style={{
            background: "linear-gradient(135deg, #1a0a00, #2d1a00)",
            borderTop: "1px solid rgba(200,164,95,0.2)",
            padding: "16px",
          }}
        >
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              style={{
                display: "block",
                color: pathname === link.href ? "#e8c97a" : "#d4b896",
                textDecoration: "none",
                padding: "12px 0",
                borderBottom: "1px solid rgba(200,164,95,0.1)",
                fontWeight: "500",
              }}
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .hidden-mobile { display: none !important; }
          .show-mobile { display: flex !important; }
        }
        @media (min-width: 769px) {
          .show-mobile { display: none !important; }
        }
      `}</style>
    </nav>
  );
}
