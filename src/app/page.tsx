"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getProducts, getSiteSettings, getSpecialOffers } from "@/lib/firestore";
import type { Product, SiteSettings, SpecialOffer } from "@/lib/types";
import { useCart } from "@/lib/cart-context";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { ShoppingCart, Star, Truck, Shield, Award, ChevronRight, X } from "lucide-react";

const HERO_IMAGE =
  "https://images.pexels.com/photos/32692730/pexels-photo-32692730.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200";

const PRODUCT_PLACEHOLDER =
  "https://images.pexels.com/photos/10477142/pexels-photo-10477142.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=400&w=400";

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [offers, setOffers] = useState<SpecialOffer[]>([]);
  const [popupOffer, setPopupOffer] = useState<SpecialOffer | null>(null);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    async function load() {
      try {
        const [prods, sett, offs] = await Promise.all([
          getProducts(),
          getSiteSettings(),
          getSpecialOffers(),
        ]);
        setProducts(prods.slice(0, 8));
        setSettings(sett);
        setOffers(offs);
        const popup = offs.find((o) => o.type === "popup");
        if (popup) {
          setTimeout(() => setPopupOffer(popup), 1500);
        }
      } catch {
        // use defaults
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleAddToCart = (product: Product) => {
    if (!user) {
      toast.error("Please login to add items to cart");
      router.push("/login");
      return;
    }
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image || PRODUCT_PLACEHOLDER,
      weight: product.weight,
      stock: product.stock,
    });
    toast.success(`${product.name} added to cart! 🛍`);
  };

  const bannerOffer = offers.find((o) => o.type === "banner");
  const announcementOffer = offers.find((o) => o.type === "announcement");

  return (
    <div style={{ background: "#fdf8f0", minHeight: "100vh" }}>
      {/* Announcement Banner */}
      {announcementOffer && (
        <div
          style={{
            background: announcementOffer.bgColor || "linear-gradient(90deg,#3d1c02,#c8a45f,#3d1c02)",
            color: "#fff",
            textAlign: "center",
            padding: "10px 16px",
            fontSize: "14px",
            fontWeight: "600",
          }}
        >
          ✨ {announcementOffer.title} — {announcementOffer.description}
        </div>
      )}

      {/* Hero Section */}
      <section
        style={{
          position: "relative",
          minHeight: "90vh",
          display: "flex",
          alignItems: "center",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: `url(${settings?.heroImage || HERO_IMAGE})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            filter: "brightness(0.35)",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(135deg, rgba(26,10,0,0.85) 0%, rgba(61,28,2,0.7) 50%, rgba(26,10,0,0.8) 100%)",
          }}
        />
        <div
          style={{
            position: "relative",
            maxWidth: "1280px",
            margin: "0 auto",
            padding: "60px 24px",
            width: "100%",
          }}
        >
          <div style={{ maxWidth: "700px" }}>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                background: "rgba(200,164,95,0.2)",
                border: "1px solid rgba(200,164,95,0.4)",
                borderRadius: "999px",
                padding: "8px 20px",
                marginBottom: "24px",
                color: "#e8c97a",
                fontSize: "13px",
                fontWeight: "600",
                letterSpacing: "1px",
              }}
            >
              ✨ AUTHENTIC DUBAI LUXURY
            </div>
            <h1
              style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: "clamp(2.5rem, 6vw, 4.5rem)",
                fontWeight: "700",
                color: "#fff",
                lineHeight: "1.1",
                marginBottom: "20px",
              }}
            >
              {settings?.heroTitle || "Authentic Dubai & Buibai Chocolates"}
            </h1>
            <p
              style={{
                color: "#d4b896",
                fontSize: "18px",
                lineHeight: "1.7",
                marginBottom: "36px",
                maxWidth: "500px",
              }}
            >
              {settings?.heroSubtitle ||
                "Premium luxury chocolates & products delivered to your door"}
            </p>
            <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
              <Link
                href="/products"
                style={{
                  padding: "16px 36px",
                  background: "linear-gradient(135deg, #c8a45f, #e8c97a)",
                  color: "#1a0a00",
                  textDecoration: "none",
                  borderRadius: "12px",
                  fontWeight: "700",
                  fontSize: "16px",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  boxShadow: "0 8px 25px rgba(200,164,95,0.4)",
                }}
              >
                Shop Now <ChevronRight size={18} />
              </Link>
              <Link
                href="/tracking"
                style={{
                  padding: "16px 36px",
                  background: "transparent",
                  color: "#e8c97a",
                  textDecoration: "none",
                  borderRadius: "12px",
                  fontWeight: "600",
                  fontSize: "16px",
                  border: "2px solid rgba(200,164,95,0.5)",
                }}
              >
                Track Order
              </Link>
            </div>

            {/* Stats */}
            <div
              style={{
                display: "flex",
                gap: "32px",
                marginTop: "48px",
                flexWrap: "wrap",
              }}
            >
              {[
                { value: "500+", label: "Products" },
                { value: "1000+", label: "Happy Customers" },
                { value: "100%", label: "Authentic" },
                { value: "2-5", label: "Days Delivery" },
              ].map((stat, i) => (
                <div key={i}>
                  <div
                    style={{
                      fontSize: "2rem",
                      fontWeight: "700",
                      background: "linear-gradient(135deg,#c8a45f,#e8c97a)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      fontFamily: "'Playfair Display', serif",
                    }}
                  >
                    {stat.value}
                  </div>
                  <div style={{ color: "#9a8070", fontSize: "13px" }}>{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Special Banner */}
      {bannerOffer && (
        <div
          style={{
            background: bannerOffer.bgColor || "linear-gradient(135deg,#c8a45f,#e8c97a)",
            padding: "20px 24px",
            textAlign: "center",
          }}
        >
          <h3
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "22px",
              fontWeight: "700",
              color: "#1a0a00",
            }}
          >
            🌟 {bannerOffer.title}
          </h3>
          <p style={{ color: "#3d1c02", marginTop: "6px" }}>{bannerOffer.description}</p>
          {bannerOffer.link && (
            <Link
              href={bannerOffer.link}
              style={{
                display: "inline-block",
                marginTop: "12px",
                padding: "8px 24px",
                background: "#1a0a00",
                color: "#e8c97a",
                borderRadius: "8px",
                textDecoration: "none",
                fontWeight: "600",
              }}
            >
              Learn More
            </Link>
          )}
        </div>
      )}

      {/* Features */}
      <section style={{ padding: "60px 24px", background: "#fff" }}>
        <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))",
              gap: "24px",
            }}
          >
            {[
              {
                icon: <Truck size={32} style={{ color: "#c8a45f" }} />,
                title: "Island-wide Delivery",
                desc: "Rs.150–450 based on weight",
              },
              {
                icon: <Shield size={32} style={{ color: "#c8a45f" }} />,
                title: "100% Authentic",
                desc: "Direct from Dubai suppliers",
              },
              {
                icon: <Award size={32} style={{ color: "#c8a45f" }} />,
                title: "Premium Quality",
                desc: "Luxury grade products only",
              },
              {
                icon: <Star size={32} style={{ color: "#c8a45f" }} />,
                title: "5★ Rated",
                desc: "Trusted by 1000+ customers",
              },
            ].map((f, i) => (
              <div
                key={i}
                style={{
                  textAlign: "center",
                  padding: "32px 20px",
                  borderRadius: "16px",
                  border: "1px solid rgba(200,164,95,0.2)",
                  background: "linear-gradient(135deg,#fdf8f0,#fff)",
                  transition: "all 0.3s ease",
                }}
              >
                <div
                  style={{
                    width: "64px",
                    height: "64px",
                    borderRadius: "16px",
                    background: "linear-gradient(135deg,rgba(200,164,95,0.15),rgba(232,201,122,0.1))",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 16px",
                  }}
                >
                  {f.icon}
                </div>
                <h3
                  style={{
                    fontWeight: "700",
                    color: "#3d1c02",
                    marginBottom: "8px",
                    fontSize: "16px",
                  }}
                >
                  {f.title}
                </h3>
                <p style={{ color: "#9a8070", fontSize: "14px" }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section style={{ padding: "80px 24px", background: "#fdf8f0" }}>
        <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "48px" }}>
            <div
              style={{
                display: "inline-block",
                background: "linear-gradient(135deg,#c8a45f,#e8c97a)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                fontWeight: "700",
                fontSize: "14px",
                letterSpacing: "3px",
                marginBottom: "12px",
              }}
            >
              OUR COLLECTION
            </div>
            <h2
              style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: "clamp(2rem, 4vw, 3rem)",
                fontWeight: "700",
                color: "#1a0a00",
                marginBottom: "16px",
              }}
            >
              Featured Products
            </h2>
            <p style={{ color: "#6b5040", maxWidth: "500px", margin: "0 auto" }}>
              Handpicked premium Dubai chocolates and luxury products
            </p>
          </div>

          {loading ? (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))",
                gap: "24px",
              }}
            >
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  style={{
                    height: "380px",
                    borderRadius: "16px",
                    background: "linear-gradient(90deg,#f5ead8 25%,#fdf8f0 50%,#f5ead8 75%)",
                    backgroundSize: "200% 100%",
                    animation: "shimmer 1.5s infinite",
                  }}
                />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px 0", color: "#9a8070" }}>
              <div style={{ fontSize: "60px", marginBottom: "16px" }}>🍫</div>
              <p style={{ fontSize: "18px" }}>Products coming soon! Check back later.</p>
            </div>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))",
                gap: "24px",
              }}
            >
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={handleAddToCart}
                />
              ))}
            </div>
          )}

          <div style={{ textAlign: "center", marginTop: "48px" }}>
            <Link
              href="/products"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "16px 40px",
                background: "linear-gradient(135deg,#c8a45f,#e8c97a)",
                color: "#1a0a00",
                textDecoration: "none",
                borderRadius: "12px",
                fontWeight: "700",
                fontSize: "16px",
                boxShadow: "0 8px 25px rgba(200,164,95,0.3)",
              }}
            >
              View All Products <ChevronRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section
        style={{
          padding: "80px 24px",
          background: "linear-gradient(135deg,#1a0a00,#3d1c02)",
        }}
      >
        <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "48px" }}>
            <h2
              style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: "clamp(1.8rem, 4vw, 3rem)",
                fontWeight: "700",
                color: "#e8c97a",
                marginBottom: "12px",
              }}
            >
              Shop by Category
            </h2>
            <p style={{ color: "#9a8070" }}>
              Explore our premium Dubai collections
            </p>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))",
              gap: "20px",
            }}
          >
            {[
              { label: "Dubai Chocolates", emoji: "🍫", href: "/products?category=Dubai+Chocolates" },
              { label: "Buibai Sweets", emoji: "🍬", href: "/products?category=Buibai+Sweets" },
              { label: "Date Truffles", emoji: "🌴", href: "/products?category=Date+Truffles" },
              { label: "Gift Boxes", emoji: "🎁", href: "/products?category=Gift+Boxes" },
              { label: "Arabic Sweets", emoji: "🧆", href: "/products?category=Arabic+Sweets" },
              { label: "Luxury Items", emoji: "💎", href: "/products?category=Luxury+Items" },
            ].map((cat, i) => (
              <Link
                key={i}
                href={cat.href}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "12px",
                  padding: "28px 16px",
                  background: "rgba(200,164,95,0.08)",
                  border: "1px solid rgba(200,164,95,0.2)",
                  borderRadius: "16px",
                  textDecoration: "none",
                  transition: "all 0.3s ease",
                  cursor: "pointer",
                }}
              >
                <div
                  style={{
                    fontSize: "40px",
                    width: "70px",
                    height: "70px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "rgba(200,164,95,0.15)",
                    borderRadius: "16px",
                  }}
                >
                  {cat.emoji}
                </div>
                <span
                  style={{
                    color: "#e8c97a",
                    fontWeight: "600",
                    fontSize: "14px",
                    textAlign: "center",
                  }}
                >
                  {cat.label}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section style={{ padding: "80px 24px", background: "#fff" }}>
        <div
          style={{
            maxWidth: "1280px",
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "60px",
            alignItems: "center",
          }}
        >
          <div>
            <div
              style={{
                background: "linear-gradient(135deg,#c8a45f,#e8c97a)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                fontWeight: "700",
                fontSize: "13px",
                letterSpacing: "3px",
                marginBottom: "16px",
              }}
            >
              ABOUT US
            </div>
            <h2
              style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: "clamp(1.8rem,4vw,2.8rem)",
                fontWeight: "700",
                color: "#1a0a00",
                marginBottom: "20px",
              }}
            >
              Sri Lanka&apos;s Premier Dubai Products Store
            </h2>
            <p
              style={{
                color: "#6b5040",
                lineHeight: "1.8",
                marginBottom: "24px",
                fontSize: "15px",
              }}
            >
              {settings?.aboutText ||
                "MRM Shopping brings you the finest authentic Dubai chocolates, Buibai sweets, and luxury products directly from the UAE. Based in Anuradhapura, we deliver premium quality products island-wide."}
            </p>
            <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
              <Link
                href="/contact"
                style={{
                  padding: "12px 28px",
                  background: "linear-gradient(135deg,#c8a45f,#e8c97a)",
                  color: "#1a0a00",
                  textDecoration: "none",
                  borderRadius: "10px",
                  fontWeight: "700",
                  fontSize: "15px",
                }}
              >
                Contact Us
              </Link>
              <Link
                href="/products"
                style={{
                  padding: "12px 28px",
                  background: "transparent",
                  color: "#c8a45f",
                  textDecoration: "none",
                  borderRadius: "10px",
                  fontWeight: "600",
                  fontSize: "15px",
                  border: "2px solid #c8a45f",
                }}
              >
                Shop Now
              </Link>
            </div>
          </div>
          <div
            style={{
              borderRadius: "24px",
              overflow: "hidden",
              boxShadow: "0 20px 60px rgba(61,28,2,0.2)",
              position: "relative",
            }}
          >
            <img
              src="https://images.pexels.com/photos/5713596/pexels-photo-5713596.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200"
              alt="Dubai chocolates"
              style={{ width: "100%", height: "400px", objectFit: "cover" }}
            />
            <div
              style={{
                position: "absolute",
                bottom: "20px",
                left: "20px",
                background: "linear-gradient(135deg,#c8a45f,#e8c97a)",
                borderRadius: "12px",
                padding: "12px 20px",
              }}
            >
              <div
                style={{
                  fontFamily: "'Playfair Display', serif",
                  fontWeight: "700",
                  fontSize: "18px",
                  color: "#1a0a00",
                }}
              >
                MRM Shopping 🛍
              </div>
              <div style={{ fontSize: "12px", color: "#3d1c02" }}>
                Anuradhapura, Sri Lanka
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Popup Offer */}
      {popupOffer && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.7)",
            zIndex: 999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "16px",
          }}
          onClick={() => setPopupOffer(null)}
        >
          <div
            style={{
              background: "linear-gradient(135deg,#1a0a00,#3d1c02)",
              border: "2px solid #c8a45f",
              borderRadius: "24px",
              padding: "40px",
              maxWidth: "500px",
              width: "100%",
              position: "relative",
              boxShadow: "0 30px 80px rgba(0,0,0,0.5)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setPopupOffer(null)}
              style={{
                position: "absolute",
                top: "16px",
                right: "16px",
                background: "rgba(200,164,95,0.2)",
                border: "none",
                borderRadius: "8px",
                color: "#e8c97a",
                cursor: "pointer",
                padding: "6px",
                display: "flex",
              }}
            >
              <X size={18} />
            </button>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "48px", marginBottom: "16px" }}>🎉</div>
              <h3
                style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: "24px",
                  color: "#e8c97a",
                  marginBottom: "12px",
                }}
              >
                {popupOffer.title}
              </h3>
              <p style={{ color: "#d4b896", lineHeight: "1.7", marginBottom: "24px" }}>
                {popupOffer.description}
              </p>
              {popupOffer.link && (
                <Link
                  href={popupOffer.link}
                  onClick={() => setPopupOffer(null)}
                  style={{
                    display: "inline-block",
                    padding: "12px 32px",
                    background: "linear-gradient(135deg,#c8a45f,#e8c97a)",
                    color: "#1a0a00",
                    textDecoration: "none",
                    borderRadius: "10px",
                    fontWeight: "700",
                  }}
                >
                  Shop Now
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ProductCard({
  product,
  onAddToCart,
}: {
  product: Product;
  onAddToCart: (p: Product) => void;
}) {
  return (
    <div
      className="product-card"
      style={{
        background: "#fff",
        borderRadius: "16px",
        overflow: "hidden",
        border: "1px solid rgba(200,164,95,0.15)",
        boxShadow: "0 4px 20px rgba(61,28,2,0.08)",
      }}
    >
      <div style={{ position: "relative", overflow: "hidden" }}>
        <Link href={`/products/${product.id}`}>
          <img
            src={product.image || "https://images.pexels.com/photos/10477142/pexels-photo-10477142.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=400&w=400"}
            alt={product.name}
            style={{
              width: "100%",
              height: "220px",
              objectFit: "cover",
              display: "block",
              transition: "transform 0.4s ease",
            }}
          />
        </Link>
        {product.badge && (
          <span
            style={{
              position: "absolute",
              top: "12px",
              left: "12px",
              background: "linear-gradient(135deg,#c8a45f,#e8c97a)",
              color: "#1a0a00",
              fontSize: "11px",
              fontWeight: "700",
              padding: "4px 12px",
              borderRadius: "999px",
            }}
          >
            {product.badge}
          </span>
        )}
        {product.featured && (
          <span
            style={{
              position: "absolute",
              top: "12px",
              right: "12px",
              background: "rgba(26,10,0,0.8)",
              color: "#e8c97a",
              fontSize: "11px",
              fontWeight: "700",
              padding: "4px 10px",
              borderRadius: "999px",
              border: "1px solid rgba(200,164,95,0.4)",
            }}
          >
            ⭐ Featured
          </span>
        )}
      </div>
      <div style={{ padding: "20px" }}>
        <div
          style={{
            fontSize: "11px",
            color: "#c8a45f",
            fontWeight: "600",
            letterSpacing: "1px",
            marginBottom: "6px",
          }}
        >
          {product.category}
        </div>
        <Link
          href={`/products/${product.id}`}
          style={{ textDecoration: "none" }}
        >
          <h3
            style={{
              fontWeight: "700",
              color: "#1a0a00",
              fontSize: "16px",
              marginBottom: "8px",
              lineHeight: "1.3",
            }}
            className="line-clamp-2"
          >
            {product.name}
          </h3>
        </Link>
        <p
          className="line-clamp-2"
          style={{ color: "#6b5040", fontSize: "13px", marginBottom: "16px" }}
        >
          {product.description}
        </p>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div>
            <div
              style={{
                fontWeight: "700",
                fontSize: "20px",
                color: "#1a0a00",
                fontFamily: "'Playfair Display', serif",
              }}
            >
              Rs. {product.price.toLocaleString()}
            </div>
            {product.originalPrice && product.originalPrice > product.price && (
              <div
                style={{
                  fontSize: "13px",
                  color: "#9a8070",
                  textDecoration: "line-through",
                }}
              >
                Rs. {product.originalPrice.toLocaleString()}
              </div>
            )}
          </div>
          <button
            onClick={() => onAddToCart(product)}
            disabled={product.stock === 0}
            style={{
              background:
                product.stock === 0
                  ? "#ccc"
                  : "linear-gradient(135deg,#c8a45f,#e8c97a)",
              color: "#1a0a00",
              border: "none",
              borderRadius: "10px",
              padding: "10px 16px",
              cursor: product.stock === 0 ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              fontWeight: "700",
              fontSize: "13px",
              transition: "all 0.2s",
            }}
          >
            <ShoppingCart size={16} />
            {product.stock === 0 ? "Sold Out" : "Add"}
          </button>
        </div>
        <div style={{ marginTop: "10px", fontSize: "12px", color: "#9a8070" }}>
          ⚖️ {product.weight} kg &nbsp;|&nbsp; 📦 {product.stock} in stock
        </div>
      </div>
    </div>
  );
}
