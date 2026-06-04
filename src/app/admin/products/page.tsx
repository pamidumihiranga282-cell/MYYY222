"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getProducts, deleteProduct } from "@/lib/firestore";
import type { Product } from "@/lib/types";
import toast from "react-hot-toast";
import { Plus, Edit, Trash2, Search, ArrowLeft, Package } from "lucide-react";

export default function AdminProductsPage() {
  const { user, isAdmin, loading } = useAuth();
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [filtered, setFiltered] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [productsLoading, setProductsLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) router.push("/");
  }, [user, loading, isAdmin, router]);

  useEffect(() => {
    if (isAdmin) {
      getProducts()
        .then((p) => { setProducts(p); setFiltered(p); })
        .finally(() => setProductsLoading(false));
    }
  }, [isAdmin]);

  useEffect(() => {
    if (search.trim()) {
      setFiltered(products.filter((p) =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.category.toLowerCase().includes(search.toLowerCase())
      ));
    } else {
      setFiltered(products);
    }
  }, [search, products]);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    setDeleting(id);
    try {
      await deleteProduct(id);
      setProducts((prev) => prev.filter((p) => p.id !== id));
      toast.success(`${name} deleted`);
    } catch {
      toast.error("Failed to delete product");
    } finally {
      setDeleting(null);
    }
  };

  if (loading || !isAdmin) {
    return <div style={{ textAlign: "center", padding: "100px", color: "#c8a45f" }}>Loading...</div>;
  }

  return (
    <div style={{ minHeight: "100vh", background: "#fdf8f0", padding: "32px 16px" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "32px", flexWrap: "wrap", gap: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <Link href="/admin" style={{ display: "flex", alignItems: "center", gap: "6px", background: "none", border: "1px solid rgba(200,164,95,0.3)", borderRadius: "8px", padding: "8px 14px", color: "#c8a45f", textDecoration: "none", fontSize: "14px" }}>
              <ArrowLeft size={16} /> Dashboard
            </Link>
            <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "26px", fontWeight: "700", color: "#1a0a00" }}>
              Products ({filtered.length})
            </h1>
          </div>
          <Link
            href="/admin/products/new"
            style={{ display: "flex", alignItems: "center", gap: "8px", padding: "12px 24px", background: "linear-gradient(135deg,#c8a45f,#e8c97a)", color: "#1a0a00", textDecoration: "none", borderRadius: "10px", fontWeight: "700", fontSize: "15px" }}
          >
            <Plus size={18} /> Add Product
          </Link>
        </div>

        {/* Search */}
        <div style={{ position: "relative", marginBottom: "24px" }}>
          <Search size={18} style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "#9a7a3f" }} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products..."
            style={{ width: "100%", padding: "14px 14px 14px 44px", border: "1px solid rgba(200,164,95,0.3)", borderRadius: "12px", fontSize: "15px", color: "#1a0a00", background: "#fff", maxWidth: "400px" }}
          />
        </div>

        {productsLoading ? (
          <div style={{ textAlign: "center", padding: "60px", color: "#c8a45f" }}>Loading products...</div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 0" }}>
            <Package size={60} style={{ color: "#d4b896", marginBottom: "16px" }} />
            <p style={{ color: "#9a8070", fontSize: "18px" }}>No products found</p>
            <Link href="/admin/products/new" style={{ display: "inline-block", marginTop: "20px", padding: "12px 28px", background: "linear-gradient(135deg,#c8a45f,#e8c97a)", color: "#1a0a00", textDecoration: "none", borderRadius: "10px", fontWeight: "700" }}>
              Add First Product
            </Link>
          </div>
        ) : (
          <div style={{ background: "#fff", borderRadius: "16px", overflow: "hidden", border: "1px solid rgba(200,164,95,0.15)", boxShadow: "0 4px 20px rgba(61,28,2,0.05)" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "linear-gradient(135deg,#1a0a00,#3d1c02)" }}>
                  {["Image", "Product", "Category", "Price", "Weight", "Stock", "Featured", "Actions"].map((h) => (
                    <th key={h} style={{ padding: "14px 16px", textAlign: "left", color: "#e8c97a", fontWeight: "700", fontSize: "13px", letterSpacing: "0.5px" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((product, i) => (
                  <tr key={product.id} style={{ borderBottom: "1px solid rgba(200,164,95,0.1)", background: i % 2 === 0 ? "#fff" : "#fdf8f0" }}>
                    <td style={{ padding: "12px 16px" }}>
                      <img
                        src={product.image || "https://images.pexels.com/photos/10477142/pexels-photo-10477142.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=100&w=100"}
                        alt={product.name}
                        style={{ width: "52px", height: "52px", objectFit: "cover", borderRadius: "8px" }}
                      />
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <div style={{ fontWeight: "700", color: "#1a0a00", fontSize: "14px" }}>{product.name}</div>
                      <div style={{ color: "#9a8070", fontSize: "12px" }} className="line-clamp-2">{product.description}</div>
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <span style={{ background: "rgba(200,164,95,0.1)", color: "#c8a45f", padding: "3px 10px", borderRadius: "999px", fontSize: "12px", fontWeight: "600" }}>
                        {product.category}
                      </span>
                    </td>
                    <td style={{ padding: "12px 16px", fontWeight: "700", color: "#1a0a00", fontSize: "14px" }}>
                      Rs. {product.price.toLocaleString()}
                    </td>
                    <td style={{ padding: "12px 16px", color: "#6b5040", fontSize: "14px" }}>
                      {product.weight} kg
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <span style={{ color: product.stock > 0 ? "#25d366" : "#ef4444", fontWeight: "700", fontSize: "14px" }}>
                        {product.stock}
                      </span>
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <span style={{ fontSize: "16px" }}>{product.featured ? "⭐" : "—"}</span>
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <div style={{ display: "flex", gap: "8px" }}>
                        <Link
                          href={`/admin/products/${product.id}/edit`}
                          style={{ display: "flex", alignItems: "center", gap: "4px", padding: "7px 12px", background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.3)", borderRadius: "8px", color: "#3b82f6", textDecoration: "none", fontSize: "13px", fontWeight: "600" }}
                        >
                          <Edit size={13} /> Edit
                        </Link>
                        <button
                          onClick={() => handleDelete(product.id, product.name)}
                          disabled={deleting === product.id}
                          style={{ display: "flex", alignItems: "center", gap: "4px", padding: "7px 12px", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: "8px", color: "#ef4444", cursor: "pointer", fontSize: "13px", fontWeight: "600" }}
                        >
                          <Trash2 size={13} /> {deleting === product.id ? "..." : "Delete"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
