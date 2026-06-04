"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { getProduct, updateProduct } from "@/lib/firestore";
import { storage } from "@/lib/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import type { Product } from "@/lib/types";
import toast from "react-hot-toast";
import { ArrowLeft, Upload, Save } from "lucide-react";

const CATEGORIES = [
  "Dubai Chocolates", "Buibai Sweets", "Date Truffles",
  "Gift Boxes", "Arabic Sweets", "Luxury Items", "Other",
];

export default function EditProductPage() {
  const { isAdmin, loading } = useAuth();
  const router = useRouter();
  const { id } = useParams() as { id: string };
  const [form, setForm] = useState({
    name: "", description: "", price: "", originalPrice: "",
    category: "Dubai Chocolates", weight: "0.5", stock: "10",
    featured: false, badge: "", image: "",
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [productLoading, setProductLoading] = useState(true);

  useEffect(() => {
    if (!loading && (!isAdmin)) router.push("/");
  }, [loading, isAdmin, router]);

  useEffect(() => {
    if (id && isAdmin) {
      getProduct(id).then((p: Product | null) => {
        if (p) {
          setForm({
            name: p.name,
            description: p.description,
            price: String(p.price),
            originalPrice: p.originalPrice ? String(p.originalPrice) : "",
            category: p.category,
            weight: String(p.weight),
            stock: String(p.stock),
            featured: p.featured,
            badge: p.badge || "",
            image: p.image || "",
          });
          setImagePreview(p.image || "");
        }
      }).finally(() => setProductLoading(false));
    }
  }, [id, isAdmin]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const uploadImage = async (): Promise<string> => {
    if (!imageFile) return form.image;
    setUploading(true);
    try {
      const storageRef = ref(storage, `products/${Date.now()}_${imageFile.name}`);
      await uploadBytes(storageRef, imageFile);
      return await getDownloadURL(storageRef);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.price) {
      toast.error("Please fill all required fields");
      return;
    }
    setSaving(true);
    try {
      const imageUrl = await uploadImage();
      await updateProduct(id, {
        name: form.name,
        description: form.description,
        price: parseFloat(form.price),
        originalPrice: form.originalPrice ? parseFloat(form.originalPrice) : undefined,
        category: form.category,
        weight: parseFloat(form.weight),
        stock: parseInt(form.stock),
        featured: form.featured,
        badge: form.badge || undefined,
        image: imageUrl,
      });
      toast.success("Product updated! ✅");
      router.push("/admin/products");
    } catch {
      toast.error("Failed to update product");
    } finally {
      setSaving(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "12px 16px",
    border: "1px solid rgba(200,164,95,0.3)", borderRadius: "10px",
    fontSize: "15px", color: "#1a0a00", background: "#fdf8f0",
  };

  if (loading || productLoading) {
    return <div style={{ textAlign: "center", padding: "100px", color: "#c8a45f" }}>Loading...</div>;
  }

  return (
    <div style={{ minHeight: "100vh", background: "#fdf8f0", padding: "32px 16px" }}>
      <div style={{ maxWidth: "900px", margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "32px" }}>
          <Link href="/admin/products" style={{ display: "flex", alignItems: "center", gap: "6px", border: "1px solid rgba(200,164,95,0.3)", borderRadius: "8px", padding: "8px 14px", color: "#c8a45f", textDecoration: "none", fontSize: "14px" }}>
            <ArrowLeft size={16} /> Products
          </Link>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "26px", fontWeight: "700", color: "#1a0a00" }}>
            Edit Product
          </h1>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              <div style={{ background: "#fff", borderRadius: "16px", padding: "24px", border: "1px solid rgba(200,164,95,0.15)" }}>
                <h3 style={{ fontWeight: "700", color: "#1a0a00", marginBottom: "20px" }}>Product Details</h3>
                <div style={{ marginBottom: "14px" }}>
                  <label style={{ display: "block", color: "#6b5040", fontWeight: "600", fontSize: "13px", marginBottom: "6px" }}>Name *</label>
                  <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} style={inputStyle} required />
                </div>
                <div style={{ marginBottom: "14px" }}>
                  <label style={{ display: "block", color: "#6b5040", fontWeight: "600", fontSize: "13px", marginBottom: "6px" }}>Description *</label>
                  <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={4} style={{ ...inputStyle, resize: "vertical" }} required />
                </div>
                <div style={{ marginBottom: "14px" }}>
                  <label style={{ display: "block", color: "#6b5040", fontWeight: "600", fontSize: "13px", marginBottom: "6px" }}>Category</label>
                  <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} style={{ ...inputStyle, cursor: "pointer" }}>
                    {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div style={{ marginBottom: "14px" }}>
                  <label style={{ display: "block", color: "#6b5040", fontWeight: "600", fontSize: "13px", marginBottom: "6px" }}>Badge</label>
                  <input value={form.badge} onChange={(e) => setForm({ ...form, badge: e.target.value })} placeholder="NEW, HOT, SALE..." style={inputStyle} />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "14px" }}>
                  <div>
                    <label style={{ display: "block", color: "#6b5040", fontWeight: "600", fontSize: "13px", marginBottom: "6px" }}>Price (Rs.) *</label>
                    <input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} min="0" style={inputStyle} required />
                  </div>
                  <div>
                    <label style={{ display: "block", color: "#6b5040", fontWeight: "600", fontSize: "13px", marginBottom: "6px" }}>Original Price</label>
                    <input type="number" value={form.originalPrice} onChange={(e) => setForm({ ...form, originalPrice: e.target.value })} min="0" style={inputStyle} />
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "14px" }}>
                  <div>
                    <label style={{ display: "block", color: "#6b5040", fontWeight: "600", fontSize: "13px", marginBottom: "6px" }}>Weight (kg)</label>
                    <input type="number" value={form.weight} onChange={(e) => setForm({ ...form, weight: e.target.value })} step="0.1" min="0" style={inputStyle} />
                  </div>
                  <div>
                    <label style={{ display: "block", color: "#6b5040", fontWeight: "600", fontSize: "13px", marginBottom: "6px" }}>Stock</label>
                    <input type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} min="0" style={inputStyle} />
                  </div>
                </div>
                <label style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer" }}>
                  <input type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} style={{ width: "18px", height: "18px", accentColor: "#c8a45f" }} />
                  <span style={{ fontWeight: "600", color: "#6b5040" }}>⭐ Featured Product</span>
                </label>
              </div>
            </div>

            <div>
              <div style={{ background: "#fff", borderRadius: "16px", padding: "24px", border: "1px solid rgba(200,164,95,0.15)", marginBottom: "16px" }}>
                <h3 style={{ fontWeight: "700", color: "#1a0a00", marginBottom: "20px" }}>Product Image</h3>
                <div
                  style={{ border: "2px dashed rgba(200,164,95,0.4)", borderRadius: "12px", padding: "20px", textAlign: "center", marginBottom: "12px", cursor: "pointer" }}
                  onClick={() => document.getElementById("edit-image-upload")?.click()}
                >
                  {imagePreview ? (
                    <img src={imagePreview} alt="Preview" style={{ width: "100%", height: "200px", objectFit: "cover", borderRadius: "8px" }} />
                  ) : (
                    <div>
                      <Upload size={36} style={{ color: "#c8a45f", marginBottom: "8px" }} />
                      <div style={{ color: "#9a8070", fontSize: "13px" }}>Click to change image</div>
                    </div>
                  )}
                  <input id="edit-image-upload" type="file" accept="image/*" onChange={handleImageChange} style={{ display: "none" }} />
                </div>
                <div>
                  <label style={{ display: "block", color: "#6b5040", fontWeight: "600", fontSize: "13px", marginBottom: "6px" }}>Or paste URL</label>
                  <input
                    value={form.image}
                    onChange={(e) => { setForm({ ...form, image: e.target.value }); setImagePreview(e.target.value); }}
                    placeholder="https://..."
                    style={inputStyle}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={saving || uploading}
                style={{ width: "100%", padding: "16px", background: saving || uploading ? "rgba(200,164,95,0.5)" : "linear-gradient(135deg,#c8a45f,#e8c97a)", color: "#1a0a00", border: "none", borderRadius: "12px", fontWeight: "700", fontSize: "17px", cursor: saving ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", boxShadow: "0 8px 25px rgba(200,164,95,0.3)" }}
              >
                <Save size={20} />
                {uploading ? "Uploading..." : saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </form>
      </div>

      <style>{`
        @media (max-width: 768px) {
          div[style*="grid-template-columns: 1fr 1fr"] { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
