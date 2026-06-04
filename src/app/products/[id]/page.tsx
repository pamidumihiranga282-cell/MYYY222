"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { getProduct } from "@/lib/firestore";
import type { Product } from "@/lib/types";
import { useCart } from "@/lib/cart-context";
import { useAuth } from "@/lib/auth-context";
import toast from "react-hot-toast";
import { ShoppingCart, ArrowLeft, Truck, Shield, Star, Plus, Minus } from "lucide-react";

export default function ProductDetailPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const { addToCart, items } = useCart();
  const { user } = useAuth();

  useEffect(() => {
    if (id) {
      getProduct(id)
        .then(setProduct)
        .finally(() => setLoading(false));
    }
  }, [id]);

  const cartItem = items.find((i) => i.id === id);

  const handleAddToCart = () => {
    if (!user) {
      toast.error("Please login to add items to cart");
      router.push("/login");
      return;
    }
    if (!product) return;
    for (let i = 0; i < qty; i++) {
      addToCart({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        weight: product.weight,
        stock: product.stock,
      });
    }
    toast.success(`${qty}x ${product.name} added to cart! 🛍`);
  };

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#fdf8f0" }}>
        <div style={{ textAlign: "center", color: "#c8a45f" }}>
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>🍫</div>
          <p>Loading product...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#fdf8f0" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "60px", marginBottom: "16px" }}>😢</div>
          <h2 style={{ color: "#1a0a00", marginBottom: "16px" }}>Product not found</h2>
          <Link href="/products" style={{ color: "#c8a45f", textDecoration: "none", fontWeight: "600" }}>
            ← Back to Products
          </Link>
        </div>
      </div>
    );
  }

  const savings = product.originalPrice && product.originalPrice > product.price
    ? product.originalPrice - product.price
    : 0;

  return (
    <div style={{ minHeight: "100vh", background: "#fdf8f0", padding: "32px 16px" }}>
      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
        {/* Breadcrumb */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "24px", color: "#9a8070", fontSize: "14px" }}>
          <Link href="/" style={{ color: "#c8a45f", textDecoration: "none" }}>Home</Link>
          <span>/</span>
          <Link href="/products" style={{ color: "#c8a45f", textDecoration: "none" }}>Products</Link>
          <span>/</span>
          <span style={{ color: "#1a0a00", fontWeight: "600" }}>{product.name}</span>
        </div>

        <button
          onClick={() => router.back()}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            background: "none",
            border: "1px solid rgba(200,164,95,0.3)",
            borderRadius: "8px",
            padding: "8px 16px",
            color: "#c8a45f",
            cursor: "pointer",
            fontSize: "14px",
            fontWeight: "600",
            marginBottom: "32px",
          }}
        >
          <ArrowLeft size={16} /> Back
        </button>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "48px", alignItems: "start" }}>
          {/* Image */}
          <div>
            <div style={{ borderRadius: "20px", overflow: "hidden", boxShadow: "0 20px 60px rgba(61,28,2,0.2)", position: "relative" }}>
              <img
                src={product.image || "https://images.pexels.com/photos/10477142/pexels-photo-10477142.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=600&w=600"}
                alt={product.name}
                style={{ width: "100%", height: "450px", objectFit: "cover" }}
              />
              {product.badge && (
                <span
                  style={{
                    position: "absolute",
                    top: "16px",
                    left: "16px",
                    background: "linear-gradient(135deg,#c8a45f,#e8c97a)",
                    color: "#1a0a00",
                    fontWeight: "700",
                    padding: "6px 16px",
                    borderRadius: "999px",
                    fontSize: "13px",
                  }}
                >
                  {product.badge}
                </span>
              )}
            </div>
          </div>

          {/* Details */}
          <div>
            <div style={{ fontSize: "12px", color: "#c8a45f", fontWeight: "700", letterSpacing: "2px", marginBottom: "8px" }}>
              {product.category}
            </div>
            <h1
              style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: "2rem",
                fontWeight: "700",
                color: "#1a0a00",
                marginBottom: "16px",
                lineHeight: "1.2",
              }}
            >
              {product.name}
            </h1>

            {/* Rating */}
            <div style={{ display: "flex", alignItems: "center", gap: "4px", marginBottom: "20px" }}>
              {[1,2,3,4,5].map((s) => (
                <Star key={s} size={16} fill="#c8a45f" color="#c8a45f" />
              ))}
              <span style={{ color: "#9a8070", fontSize: "13px", marginLeft: "8px" }}>
                (Authentic Product)
              </span>
            </div>

            <p style={{ color: "#6b5040", lineHeight: "1.8", marginBottom: "24px", fontSize: "15px" }}>
              {product.description}
            </p>

            {/* Price */}
            <div style={{ marginBottom: "24px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <span
                  style={{
                    fontFamily: "'Playfair Display', serif",
                    fontSize: "2.2rem",
                    fontWeight: "700",
                    color: "#1a0a00",
                  }}
                >
                  Rs. {product.price.toLocaleString()}
                </span>
                {product.originalPrice && product.originalPrice > product.price && (
                  <span style={{ fontSize: "16px", color: "#9a8070", textDecoration: "line-through" }}>
                    Rs. {product.originalPrice.toLocaleString()}
                  </span>
                )}
              </div>
              {savings > 0 && (
                <div style={{ color: "#25d366", fontWeight: "600", fontSize: "14px", marginTop: "4px" }}>
                  You save Rs. {savings.toLocaleString()}!
                </div>
              )}
            </div>

            {/* Info */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "24px" }}>
              {[
                { label: "Weight", value: `${product.weight} kg` },
                { label: "Stock", value: product.stock > 0 ? `${product.stock} available` : "Out of Stock" },
                { label: "Category", value: product.category },
                { label: "Delivery", value: "Rs.150-450" },
              ].map((item, i) => (
                <div key={i} style={{ background: "#fff", borderRadius: "10px", padding: "12px 16px", border: "1px solid rgba(200,164,95,0.15)" }}>
                  <div style={{ fontSize: "11px", color: "#9a8070", fontWeight: "600", marginBottom: "2px" }}>{item.label}</div>
                  <div style={{ fontSize: "14px", fontWeight: "700", color: "#1a0a00" }}>{item.value}</div>
                </div>
              ))}
            </div>

            {/* Quantity */}
            {product.stock > 0 && (
              <div style={{ marginBottom: "24px" }}>
                <label style={{ display: "block", color: "#6b5040", fontWeight: "600", fontSize: "14px", marginBottom: "8px" }}>
                  Quantity
                </label>
                <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                  <div style={{ display: "flex", alignItems: "center", border: "1px solid rgba(200,164,95,0.3)", borderRadius: "10px", overflow: "hidden" }}>
                    <button
                      onClick={() => setQty(Math.max(1, qty - 1))}
                      style={{ padding: "10px 16px", background: "none", border: "none", color: "#c8a45f", cursor: "pointer", fontSize: "18px" }}
                    >
                      <Minus size={16} />
                    </button>
                    <span style={{ padding: "10px 20px", fontWeight: "700", fontSize: "16px", color: "#1a0a00", borderLeft: "1px solid rgba(200,164,95,0.2)", borderRight: "1px solid rgba(200,164,95,0.2)" }}>
                      {qty}
                    </span>
                    <button
                      onClick={() => setQty(Math.min(product.stock, qty + 1))}
                      style={{ padding: "10px 16px", background: "none", border: "none", color: "#c8a45f", cursor: "pointer", fontSize: "18px" }}
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                  <span style={{ color: "#9a8070", fontSize: "13px" }}>
                    Total: Rs. {(product.price * qty).toLocaleString()}
                  </span>
                </div>
              </div>
            )}

            {/* Cart message */}
            {cartItem && (
              <div style={{ background: "rgba(200,164,95,0.1)", border: "1px solid rgba(200,164,95,0.3)", borderRadius: "10px", padding: "12px 16px", marginBottom: "16px", color: "#c8a45f", fontSize: "14px", fontWeight: "600" }}>
                ✓ {cartItem.quantity} item(s) already in cart
              </div>
            )}

            {/* Add to Cart */}
            <button
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              style={{
                width: "100%",
                padding: "16px",
                background: product.stock === 0 ? "#ccc" : "linear-gradient(135deg,#c8a45f,#e8c97a)",
                color: "#1a0a00",
                border: "none",
                borderRadius: "12px",
                fontWeight: "700",
                fontSize: "17px",
                cursor: product.stock === 0 ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "10px",
                boxShadow: product.stock === 0 ? "none" : "0 8px 25px rgba(200,164,95,0.4)",
                marginBottom: "12px",
              }}
            >
              <ShoppingCart size={20} />
              {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
            </button>

            <Link
              href="/cart"
              style={{
                display: "block",
                textAlign: "center",
                padding: "14px",
                background: "transparent",
                color: "#c8a45f",
                border: "2px solid rgba(200,164,95,0.4)",
                borderRadius: "12px",
                fontWeight: "600",
                textDecoration: "none",
                fontSize: "15px",
              }}
            >
              View Cart
            </Link>

            {/* Features */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginTop: "24px" }}>
              {[
                { icon: <Truck size={16} />, text: "Island-wide delivery" },
                { icon: <Shield size={16} />, text: "100% Authentic" },
              ].map((f, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: "8px", color: "#9a8070", fontSize: "13px" }}>
                  <span style={{ color: "#c8a45f" }}>{f.icon}</span>
                  {f.text}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          div[style*="grid-template-columns: 1fr 1fr"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
