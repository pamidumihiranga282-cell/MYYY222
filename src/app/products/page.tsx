"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { getProducts } from "@/lib/firestore";
import type { Product } from "@/lib/types";
import { useCart } from "@/lib/cart-context";
import { useAuth } from "@/lib/auth-context";
import toast from "react-hot-toast";
import { ShoppingCart, Search, Filter, X } from "lucide-react";

const CATEGORIES = [
  "All",
  "Dubai Chocolates",
  "Buibai Sweets",
  "Date Truffles",
  "Gift Boxes",
  "Arabic Sweets",
  "Luxury Items",
];

function ProductsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [filtered, setFiltered] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState(searchParams.get("category") || "All");
  const [sortBy, setSortBy] = useState("newest");
  const [showFilters, setShowFilters] = useState(false);
  const { addToCart } = useCart();
  const { user } = useAuth();

  useEffect(() => {
    getProducts()
      .then((prods) => {
        setProducts(prods);
        setFiltered(prods);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    let result = [...products];

    if (category !== "All") {
      result = result.filter((p) => p.category === category);
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q)
      );
    }

    if (sortBy === "price-asc") result.sort((a, b) => a.price - b.price);
    else if (sortBy === "price-desc") result.sort((a, b) => b.price - a.price);
    else if (sortBy === "name") result.sort((a, b) => a.name.localeCompare(b.name));

    setFiltered(result);
  }, [products, category, search, sortBy]);

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
      image: product.image,
      weight: product.weight,
      stock: product.stock,
    });
    toast.success(`${product.name} added to cart! 🛍`);
  };

  return (
    <div style={{ minHeight: "100vh", background: "#fdf8f0" }}>
      {/* Header */}
      <div
        style={{
          background: "linear-gradient(135deg,#1a0a00,#3d1c02)",
          padding: "60px 24px",
          textAlign: "center",
        }}
      >
        <h1
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: "clamp(2rem,5vw,3.5rem)",
            fontWeight: "700",
            background: "linear-gradient(135deg,#c8a45f,#e8c97a)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            marginBottom: "12px",
          }}
        >
          Our Premium Collection
        </h1>
        <p style={{ color: "#9a8070", fontSize: "16px" }}>
          Authentic Dubai chocolates & luxury products
        </p>
      </div>

      <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "32px 16px" }}>
        {/* Search & Filters */}
        <div
          style={{
            display: "flex",
            gap: "12px",
            flexWrap: "wrap",
            marginBottom: "24px",
            alignItems: "center",
          }}
        >
          {/* Search */}
          <div style={{ position: "relative", flex: "1", minWidth: "200px" }}>
            <Search
              size={18}
              style={{
                position: "absolute",
                left: "14px",
                top: "50%",
                transform: "translateY(-50%)",
                color: "#9a7a3f",
              }}
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products..."
              style={{
                width: "100%",
                padding: "12px 12px 12px 44px",
                border: "1px solid rgba(200,164,95,0.3)",
                borderRadius: "10px",
                fontSize: "15px",
                background: "#fff",
                color: "#1a0a00",
              }}
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                style={{
                  position: "absolute",
                  right: "12px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "#9a7a3f",
                }}
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            style={{
              padding: "12px 16px",
              border: "1px solid rgba(200,164,95,0.3)",
              borderRadius: "10px",
              fontSize: "14px",
              background: "#fff",
              color: "#1a0a00",
              cursor: "pointer",
            }}
          >
            <option value="newest">Newest First</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="name">Name A-Z</option>
          </select>

          <button
            onClick={() => setShowFilters(!showFilters)}
            style={{
              padding: "12px 20px",
              background: showFilters
                ? "linear-gradient(135deg,#c8a45f,#e8c97a)"
                : "#fff",
              border: "1px solid rgba(200,164,95,0.3)",
              borderRadius: "10px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              color: showFilters ? "#1a0a00" : "#6b5040",
              fontWeight: "600",
              fontSize: "14px",
            }}
          >
            <Filter size={16} /> Filters
          </button>
        </div>

        {/* Category filters */}
        {showFilters && (
          <div
            style={{
              display: "flex",
              gap: "10px",
              flexWrap: "wrap",
              marginBottom: "24px",
              padding: "16px",
              background: "#fff",
              borderRadius: "12px",
              border: "1px solid rgba(200,164,95,0.2)",
            }}
          >
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                style={{
                  padding: "8px 20px",
                  borderRadius: "999px",
                  border:
                    category === cat
                      ? "none"
                      : "1px solid rgba(200,164,95,0.3)",
                  background:
                    category === cat
                      ? "linear-gradient(135deg,#c8a45f,#e8c97a)"
                      : "transparent",
                  color: category === cat ? "#1a0a00" : "#6b5040",
                  fontWeight: category === cat ? "700" : "500",
                  fontSize: "14px",
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        {/* Results count */}
        <div
          style={{
            color: "#6b5040",
            fontSize: "14px",
            marginBottom: "24px",
          }}
        >
          {loading
            ? "Loading products..."
            : `${filtered.length} product${filtered.length !== 1 ? "s" : ""} found`}
        </div>

        {/* Products grid */}
        {loading ? (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))",
              gap: "24px",
            }}
          >
            {[...Array(8)].map((_, i) => (
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
        ) : filtered.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "80px 0",
              color: "#9a8070",
            }}
          >
            <div style={{ fontSize: "60px", marginBottom: "16px" }}>🔍</div>
            <h3 style={{ fontSize: "20px", marginBottom: "8px" }}>
              No products found
            </h3>
            <p>Try a different search or category</p>
            <button
              onClick={() => { setSearch(""); setCategory("All"); }}
              style={{
                marginTop: "20px",
                padding: "12px 28px",
                background: "linear-gradient(135deg,#c8a45f,#e8c97a)",
                color: "#1a0a00",
                border: "none",
                borderRadius: "10px",
                fontWeight: "700",
                cursor: "pointer",
              }}
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))",
              gap: "24px",
            }}
          >
            {filtered.map((product) => (
              <div
                key={product.id}
                className="product-card"
                style={{
                  background: "#fff",
                  borderRadius: "16px",
                  overflow: "hidden",
                  border: "1px solid rgba(200,164,95,0.15)",
                  boxShadow: "0 4px 20px rgba(61,28,2,0.08)",
                }}
              >
                <div style={{ position: "relative" }}>
                  <Link href={`/products/${product.id}`}>
                    <img
                      src={product.image || "https://images.pexels.com/photos/10477142/pexels-photo-10477142.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=400&w=400"}
                      alt={product.name}
                      style={{
                        width: "100%",
                        height: "220px",
                        objectFit: "cover",
                        display: "block",
                      }}
                    />
                  </Link>
                  {product.badge && (
                    <span
                      style={{
                        position: "absolute",
                        top: "10px",
                        left: "10px",
                        background: "linear-gradient(135deg,#c8a45f,#e8c97a)",
                        color: "#1a0a00",
                        fontSize: "11px",
                        fontWeight: "700",
                        padding: "3px 10px",
                        borderRadius: "999px",
                      }}
                    >
                      {product.badge}
                    </span>
                  )}
                  {product.stock === 0 && (
                    <div
                      style={{
                        position: "absolute",
                        inset: 0,
                        background: "rgba(0,0,0,0.5)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#fff",
                        fontWeight: "700",
                        fontSize: "18px",
                      }}
                    >
                      SOLD OUT
                    </div>
                  )}
                </div>
                <div style={{ padding: "18px" }}>
                  <div style={{ fontSize: "11px", color: "#c8a45f", fontWeight: "600", letterSpacing: "1px", marginBottom: "4px" }}>
                    {product.category}
                  </div>
                  <Link href={`/products/${product.id}`} style={{ textDecoration: "none" }}>
                    <h3 style={{ fontWeight: "700", color: "#1a0a00", fontSize: "15px", marginBottom: "6px" }} className="line-clamp-2">
                      {product.name}
                    </h3>
                  </Link>
                  <p className="line-clamp-2" style={{ color: "#6b5040", fontSize: "13px", marginBottom: "14px" }}>
                    {product.description}
                  </p>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div>
                      <div style={{ fontWeight: "700", fontSize: "18px", color: "#1a0a00" }}>
                        Rs. {product.price.toLocaleString()}
                      </div>
                      {product.originalPrice && product.originalPrice > product.price && (
                        <div style={{ fontSize: "12px", color: "#9a8070", textDecoration: "line-through" }}>
                          Rs. {product.originalPrice.toLocaleString()}
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => handleAddToCart(product)}
                      disabled={product.stock === 0}
                      style={{
                        background: product.stock === 0 ? "#ccc" : "linear-gradient(135deg,#c8a45f,#e8c97a)",
                        color: "#1a0a00",
                        border: "none",
                        borderRadius: "8px",
                        padding: "9px 14px",
                        cursor: product.stock === 0 ? "not-allowed" : "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "5px",
                        fontWeight: "700",
                        fontSize: "13px",
                      }}
                    >
                      <ShoppingCart size={14} />
                      Add
                    </button>
                  </div>
                  <div style={{ marginTop: "8px", fontSize: "11px", color: "#9a8070" }}>
                    ⚖️ {product.weight} kg &nbsp;|&nbsp; 📦 {product.stock} in stock
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<div style={{ textAlign: "center", padding: "100px", color: "#c8a45f" }}>Loading...</div>}>
      <ProductsContent />
    </Suspense>
  );
}
