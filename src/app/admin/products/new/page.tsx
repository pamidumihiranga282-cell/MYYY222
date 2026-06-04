"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { addProduct } from "@/lib/firestore";
import { storage } from "@/lib/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import toast from "react-hot-toast";
import { ArrowLeft, Upload, Package } from "lucide-react";

const CATEGORIES = [
  "Dubai Chocolates",
  "Buibai Sweets",
  "Date Truffles",
  "Gift Boxes",
  "Arabic Sweets",
  "Luxury Items",
  "Other",
];

export default function NewProductPage() {
  const { isAdmin, loading } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    originalPrice: "",
    category: "Dubai Chocolates",
    weight: "0.5",
    stock: "10",
    featured: false,
    badge: "",
    image: "",
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  if (!loading && !isAdmin) {
    router.push("/");
    return null;
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    const url = URL.createObjectURL(file);
    setImagePreview(url);
  };

  const uploadImage = async (): Promise<string> => {
    if (!imageFile) return form.image;
    setUploading(true);
    try {
      const storageRef = ref(storage, `products/${Date.now()}_${imageFile.name}`);
      await uploadBytes(storageRef, imageFile);
      const url = await getDownloadURL(storageRef);
      return url;
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.price || !form.description) {
      toast.error("Please fill all required fields");
      return;
    }
    setSaving(true);
    try {
      const imageUrl = await uploadImage();
      await addProduct({
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
      toast.success("Product added successfully! 🎉");
      router.push("/admin/products");
    } catch (err) {
      console.error(err);
      toast.error("Failed to add product. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "12px 16px",
    border: "1px solid rgba(200,164,95,0.3)",
    borderRadius: "10px",
    fontSize: "15px",
    color: "#1a0a00",
    background: "#fdf8f0",
  };

  const labelStyle: React.CSSProperties = {
    display: "block",
    color: "#6b5040",
    fontWeight: "600",
    fontSize: "13px",
    marginBottom: "6px",
  };

  return (
    <div style={{ minHeight: "100vh", background: "#fdf8f0", padding: "32px 16px" }}>
      <div style={{ maxWidth: "900px", margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "32px" }}>
          <Link href="/admin/products" style={{ display: "flex", alignItems: "center", gap: "6px", border: "1px solid rgba(200,164,95,0.3)", borderRadius: "8px", padding: "8px 14px", color: "#c8a45f", textDecoration: "none", fontSize: "14px" }}>
            <ArrowLeft size={16} /> Products
          </Link>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "26px", fontWeight: "700", color: "#1a0a00" }}>
            Add New Product
          </h1>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
            {/* Left */}
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              <div style={{ background: "#fff", borderRadius: "16px", padding: "24px", border: "1px solid rgba(200,164,95,0.15)" }}>
                <h3 style={{ fontWeight: "700", color: "#1a0a00", marginBottom: "20px", fontSize: "16px" }}>Basic Information</h3>

                <div style={{ marginBottom: "16px" }}>
                  <label style={labelStyle}>Product Name *</label>
                  <input
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="e.g. Dubai Chocolate Gift Box"
                    style={inputStyle}
                    required
                  />
                </div>

                <div style={{ marginBottom: "16px" }}>
                  <label style={labelStyle}>Description *</label>
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    placeholder="Product description..."
                    rows={4}
                    style={{ ...inputStyle, resize: "vertical" }}
                    required
                  />
                </div>

                <div style={{ marginBottom: "16px" }}>
                  <label style={labelStyle}>Category</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    style={{ ...inputStyle, cursor: "pointer" }}
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div style={{ marginBottom: "16px" }}>
                  <label style={labelStyle}>Badge (Optional)</label>
                  <input
                    value={form.badge}
                    onChange={(e) => setForm({ ...form, badge: e.target.value })}
                    placeholder="e.g. NEW, HOT, SALE"
                    style={inputStyle}
                  />
                </div>

                <label style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={form.featured}
                    onChange={(e) => setForm({ ...form, featured: e.target.checked })}
                    style={{ width: "18px", height: "18px", accentColor: "#c8a45f" }}
                  />
                  <span style={{ fontWeight: "600", color: "#6b5040" }}>⭐ Featured Product</span>
                </label>
              </div>

              <div style={{ background: "#fff", borderRadius: "16px", padding: "24px", border: "1px solid rgba(200,164,95,0.15)" }}>
                <h3 style={{ fontWeight: "700", color: "#1a0a00", marginBottom: "20px", fontSize: "16px" }}>Pricing & Stock</h3>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "12px" }}>
                  <div>
                    <label style={labelStyle}>Price (Rs.) *</label>
                    <input
                      type="number"
                      value={form.price}
                      onChange={(e) => setForm({ ...form, price: e.target.value })}
                      placeholder="0"
                      min="0"
                      style={inputStyle}
                      required
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Original Price (Rs.)</label>
                    <input
                      type="number"
                      value={form.originalPrice}
                      onChange={(e) => setForm({ ...form, originalPrice: e.target.value })}
                      placeholder="0 (optional)"
                      min="0"
                      style={inputStyle}
                    />
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <div>
                    <label style={labelStyle}>Weight (kg) *</label>
                    <input
                      type="number"
                      value={form.weight}
                      onChange={(e) => setForm({ ...form, weight: e.target.value })}
                      placeholder="0.5"
                      min="0"
                      step="0.1"
                      style={inputStyle}
                      required
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Stock *</label>
                    <input
                      type="number"
                      value={form.stock}
                      onChange={(e) => setForm({ ...form, stock: e.target.value })}
                      placeholder="10"
                      min="0"
                      style={inputStyle}
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Right - Image */}
            <div>
              <div style={{ background: "#fff", borderRadius: "16px", padding: "24px", border: "1px solid rgba(200,164,95,0.15)" }}>
                <h3 style={{ fontWeight: "700", color: "#1a0a00", marginBottom: "20px", fontSize: "16px" }}>Product Image</h3>

                {/* Upload from device */}
                <div
                  style={{
                    border: "2px dashed rgba(200,164,95,0.4)",
                    borderRadius: "12px",
                    padding: "24px",
                    textAlign: "center",
                    marginBottom: "16px",
                    cursor: "pointer",
                    background: "rgba(200,164,95,0.03)",
                  }}
                  onClick={() => document.getElementById("image-upload")?.click()}
                >
                  {imagePreview ? (
                    <img
                      src={imagePreview}
                      alt="Preview"
                      style={{ width: "100%", height: "220px", objectFit: "cover", borderRadius: "8px" }}
                    />
                  ) : (
                    <div>
                      <Upload size={40} style={{ color: "#c8a45f", marginBottom: "12px" }} />
                      <div style={{ fontWeight: "600", color: "#6b5040", marginBottom: "4px" }}>
                        Click to upload image
                      </div>
                      <div style={{ color: "#9a8070", fontSize: "13px" }}>
                        PNG, JPG, WEBP up to 10MB
                      </div>
                    </div>
                  )}
                  <input
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    style={{ display: "none" }}
                  />
                </div>

                {imagePreview && (
                  <button
                    type="button"
                    onClick={() => { setImageFile(null); setImagePreview(""); }}
                    style={{ width: "100%", padding: "10px", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: "10px", color: "#ef4444", cursor: "pointer", fontWeight: "600", fontSize: "14px", marginBottom: "12px" }}
                  >
                    Remove Image
                  </button>
                )}

                <div style={{ marginBottom: "12px" }}>
                  <label style={labelStyle}>Or paste image URL</label>
                  <input
                    value={form.image}
                    onChange={(e) => { setForm({ ...form, image: e.target.value }); if (e.target.value) setImagePreview(e.target.value); }}
                    placeholder="https://..."
                    style={inputStyle}
                  />
                </div>

                {/* Preview */}
                {(form.image || imagePreview) && !imageFile && (
                  <img
                    src={form.image || imagePreview}
                    alt="Preview"
                    style={{ width: "100%", height: "200px", objectFit: "cover", borderRadius: "10px", border: "1px solid rgba(200,164,95,0.2)" }}
                  />
                )}
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={saving || uploading}
                style={{
                  width: "100%",
                  marginTop: "16px",
                  padding: "16px",
                  background: saving || uploading ? "rgba(200,164,95,0.5)" : "linear-gradient(135deg,#c8a45f,#e8c97a)",
                  color: "#1a0a00",
                  border: "none",
                  borderRadius: "12px",
                  fontWeight: "700",
                  fontSize: "17px",
                  cursor: saving || uploading ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "10px",
                  boxShadow: "0 8px 25px rgba(200,164,95,0.3)",
                }}
              >
                <Package size={20} />
                {uploading ? "Uploading Image..." : saving ? "Adding Product..." : "Add Product"}
              </button>
            </div>
          </div>
        </form>
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
