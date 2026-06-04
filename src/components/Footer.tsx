"use client";

import Link from "next/link";

export default function Footer() {
  return (
    <footer
      style={{
        background: "linear-gradient(135deg, #1a0a00 0%, #3d1c02 100%)",
        color: "#d4b896",
        paddingTop: "60px",
      }}
    >
      <div
        style={{
          maxWidth: "1280px",
          margin: "0 auto",
          padding: "0 16px",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "40px",
          paddingBottom: "40px",
        }}
      >
        {/* Brand */}
        <div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              marginBottom: "16px",
            }}
          >
            <span style={{ fontSize: "32px" }}>🛍</span>
            <div>
              <div
                style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: "22px",
                  fontWeight: "700",
                  background: "linear-gradient(135deg, #c8a45f, #e8c97a)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                MRM Shopping
              </div>
              <div
                style={{ fontSize: "10px", color: "#9a7a3f", letterSpacing: "2px" }}
              >
                DUBAI LUXURY
              </div>
            </div>
          </div>
          <p style={{ fontSize: "14px", lineHeight: "1.7", color: "#9a8070" }}>
            Your premium destination for authentic Dubai chocolates and luxury
            products, delivered across Sri Lanka.
          </p>
          <div style={{ marginTop: "20px", display: "flex", gap: "12px" }}>
            {["📘", "📸", "🐦"].map((icon, i) => (
              <div
                key={i}
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "8px",
                  background: "rgba(200,164,95,0.15)",
                  border: "1px solid rgba(200,164,95,0.3)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  fontSize: "16px",
                }}
              >
                {icon}
              </div>
            ))}
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h4
            style={{
              color: "#e8c97a",
              fontWeight: "700",
              marginBottom: "20px",
              fontSize: "16px",
              letterSpacing: "1px",
            }}
          >
            QUICK LINKS
          </h4>
          {[
            { href: "/", label: "Home" },
            { href: "/products", label: "Products" },
            { href: "/tracking", label: "Track Order" },
            { href: "/contact", label: "Contact Us" },
            { href: "/account", label: "My Account" },
          ].map((link) => (
            <Link
              key={link.href}
              href={link.href}
              style={{
                display: "block",
                color: "#9a8070",
                textDecoration: "none",
                marginBottom: "10px",
                fontSize: "14px",
                transition: "color 0.2s",
              }}
            >
              → {link.label}
            </Link>
          ))}
        </div>

        {/* Contact */}
        <div>
          <h4
            style={{
              color: "#e8c97a",
              fontWeight: "700",
              marginBottom: "20px",
              fontSize: "16px",
              letterSpacing: "1px",
            }}
          >
            CONTACT
          </h4>
          {[
            { icon: "📞", text: "070 707 0872" },
            { icon: "✉️", text: "mrmshopping2025@gmail.com" },
            { icon: "📍", text: "Anuradhapura, Sri Lanka" },
            { icon: "⏰", text: "Mon–Sat: 8AM–8PM" },
          ].map((item, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: "10px",
                marginBottom: "12px",
                fontSize: "14px",
                color: "#9a8070",
              }}
            >
              <span>{item.icon}</span>
              <span>{item.text}</span>
            </div>
          ))}
        </div>

        {/* Delivery Info */}
        <div>
          <h4
            style={{
              color: "#e8c97a",
              fontWeight: "700",
              marginBottom: "20px",
              fontSize: "16px",
              letterSpacing: "1px",
            }}
          >
            DELIVERY
          </h4>
          <div
            style={{
              background: "rgba(200,164,95,0.1)",
              border: "1px solid rgba(200,164,95,0.2)",
              borderRadius: "12px",
              padding: "16px",
            }}
          >
            <div style={{ color: "#e8c97a", fontWeight: "600", marginBottom: "8px" }}>
              Delivery Charges
            </div>
            <div style={{ fontSize: "13px", color: "#9a8070", lineHeight: "1.8" }}>
              Up to 1 kg: Rs. 150 – 450<br />
              Calculated by total weight<br />
              Island-wide delivery<br />
              2–5 business days
            </div>
          </div>
          <div
            style={{
              marginTop: "12px",
              padding: "12px",
              background: "rgba(37,211,102,0.1)",
              borderRadius: "8px",
              border: "1px solid rgba(37,211,102,0.2)",
              fontSize: "13px",
              color: "#25d366",
            }}
          >
            💬 WhatsApp: 0707070872
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div
        style={{
          borderTop: "1px solid rgba(200,164,95,0.2)",
          padding: "20px 16px",
          textAlign: "center",
          fontSize: "13px",
          color: "#6b5040",
        }}
      >
        <div>
          © {new Date().getFullYear()} MRM Shopping 🛍. All rights reserved. |
          Made with ❤️ for Dubai Luxury
        </div>
      </div>
    </footer>
  );
}
