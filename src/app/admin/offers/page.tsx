"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getAllSpecialOffers, addSpecialOffer, updateSpecialOffer, deleteSpecialOffer } from "@/lib/firestore";
import type { SpecialOffer } from "@/lib/types";
import toast from "react-hot-toast";
import { ArrowLeft, Plus, Trash2, Edit2, X, Save, Star } from "lucide-react";

export default function AdminOffersPage() {
  const { isAdmin, loading } = useAuth();
  const router = useRouter();
  const [offers, setOffers] = useState<SpecialOffer[]>([]);
  const [offersLoading, setOffersLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingOffer, setEditingOffer] = useState<SpecialOffer | null>(null);
  const [form, setForm] = useState({
    title: "", description: "", link: "", type: "banner" as SpecialOffer["type"],
    bgColor: "#c8a45f", active: true,
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!loading && !isAdmin) router.push("/");
  }, [loading, isAdmin, router]);

  useEffect(() => {
    if (isAdmin) {
      getAllSpecialOffers().then(setOffers).finally(() => setOffersLoading(false));
    }
  }, [isAdmin]);

  const resetForm = () => {
    setForm({ title: "", description: "", link: "", type: "banner", bgColor: "#c8a45f", active: true });
    setEditingOffer(null);
    setShowForm(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.description) {
      toast.error("Title and description are required");
      return;
    }
    setSaving(true);
    try {
      if (editingOffer) {
        await updateSpecialOffer(editingOffer.id, form);
        setOffers((prev) => prev.map((o) => o.id === editingOffer.id ? { ...o, ...form } : o));
        toast.success("Offer updated!");
      } else {
        const id = await addSpecialOffer(form);
        setOffers((prev) => [...prev, { id, ...form }]);
        toast.success("Offer added!");
      }
      resetForm();
    } catch {
      toast.error("Failed to save offer");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (offer: SpecialOffer) => {
    setEditingOffer(offer);
    setForm({
      title: offer.title, description: offer.description,
      link: offer.link || "", type: offer.type,
      bgColor: offer.bgColor || "#c8a45f", active: offer.active,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Delete "${title}"?`)) return;
    try {
      await deleteSpecialOffer(id);
      setOffers((prev) => prev.filter((o) => o.id !== id));
      toast.success("Offer deleted");
    } catch {
      toast.error("Failed to delete offer");
    }
  };

  const handleToggle = async (offer: SpecialOffer) => {
    try {
      await updateSpecialOffer(offer.id, { active: !offer.active });
      setOffers((prev) => prev.map((o) => o.id === offer.id ? { ...o, active: !o.active } : o));
    } catch {
      toast.error("Failed to toggle offer");
    }
  };

  if (loading || !isAdmin) return <div style={{ textAlign: "center", padding: "100px", color: "#c8a45f" }}>Loading...</div>;

  return (
    <div style={{ minHeight: "100vh", background: "#fdf8f0", padding: "32px 16px" }}>
      <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px", flexWrap: "wrap", gap: "12px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <Link href="/admin" style={{ display: "flex", alignItems: "center", gap: "6px", border: "1px solid rgba(200,164,95,0.3)", borderRadius: "8px", padding: "8px 14px", color: "#c8a45f", textDecoration: "none", fontSize: "14px" }}>
              <ArrowLeft size={16} /> Dashboard
            </Link>
            <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "26px", fontWeight: "700", color: "#1a0a00" }}>
              Special Offers
            </h1>
          </div>
          <button
            onClick={() => setShowForm(true)}
            style={{ display: "flex", alignItems: "center", gap: "8px", padding: "12px 20px", background: "linear-gradient(135deg,#c8a45f,#e8c97a)", color: "#1a0a00", border: "none", borderRadius: "10px", fontWeight: "700", cursor: "pointer", fontSize: "15px" }}
          >
            <Plus size={18} /> Add Offer
          </button>
        </div>

        <div style={{ background: "rgba(200,164,95,0.08)", border: "1px solid rgba(200,164,95,0.2)", borderRadius: "12px", padding: "16px", marginBottom: "24px", fontSize: "14px", color: "#6b5040" }}>
          <strong>Types:</strong> 🎯 <strong>Banner</strong> - shown below hero | 📢 <strong>Announcement</strong> - top bar | 🎉 <strong>Popup</strong> - shown on homepage load
        </div>

        {offersLoading ? (
          <div style={{ textAlign: "center", padding: "60px", color: "#c8a45f" }}>Loading...</div>
        ) : offers.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px" }}>
            <Star size={48} style={{ color: "#d4b896", marginBottom: "16px" }} />
            <p style={{ color: "#9a8070", fontSize: "18px" }}>No offers yet. Add your first special offer!</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {offers.map((offer) => (
              <div key={offer.id} style={{ background: "#fff", borderRadius: "16px", padding: "20px 24px", border: "1px solid rgba(200,164,95,0.15)", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
                    <span style={{ background: offer.type === "popup" ? "rgba(139,92,246,0.15)" : offer.type === "banner" ? "rgba(200,164,95,0.15)" : "rgba(245,158,11,0.15)", color: offer.type === "popup" ? "#8b5cf6" : offer.type === "banner" ? "#c8a45f" : "#f59e0b", padding: "2px 10px", borderRadius: "999px", fontSize: "11px", fontWeight: "700", textTransform: "uppercase" }}>
                      {offer.type}
                    </span>
                    <span style={{ width: "10px", height: "10px", borderRadius: "50%", background: offer.active ? "#25d366" : "#9a8070", display: "inline-block" }} />
                    <span style={{ fontSize: "12px", color: offer.active ? "#25d366" : "#9a8070" }}>
                      {offer.active ? "Active" : "Inactive"}
                    </span>
                  </div>
                  <h3 style={{ fontWeight: "700", color: "#1a0a00", fontSize: "16px", marginBottom: "4px" }}>{offer.title}</h3>
                  <p style={{ color: "#6b5040", fontSize: "14px" }}>{offer.description}</p>
                  {offer.link && <div style={{ color: "#c8a45f", fontSize: "12px", marginTop: "4px" }}>Link: {offer.link}</div>}
                  <div style={{ marginTop: "8px", display: "flex", alignItems: "center", gap: "6px" }}>
                    <div style={{ width: "20px", height: "20px", borderRadius: "4px", background: offer.bgColor }} />
                    <span style={{ fontSize: "12px", color: "#9a8070" }}>{offer.bgColor}</span>
                  </div>
                </div>
                <div style={{ display: "flex", gap: "8px", flexShrink: 0 }}>
                  <button
                    onClick={() => handleToggle(offer)}
                    style={{ padding: "8px 14px", background: offer.active ? "rgba(239,68,68,0.1)" : "rgba(37,211,102,0.1)", border: `1px solid ${offer.active ? "rgba(239,68,68,0.3)" : "rgba(37,211,102,0.3)"}`, borderRadius: "8px", color: offer.active ? "#ef4444" : "#25d366", cursor: "pointer", fontWeight: "600", fontSize: "13px" }}
                  >
                    {offer.active ? "Deactivate" : "Activate"}
                  </button>
                  <button onClick={() => handleEdit(offer)} style={{ display: "flex", alignItems: "center", gap: "4px", padding: "8px 12px", background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.3)", borderRadius: "8px", color: "#3b82f6", cursor: "pointer", fontSize: "13px" }}>
                    <Edit2 size={13} /> Edit
                  </button>
                  <button onClick={() => handleDelete(offer.id, offer.title)} style={{ display: "flex", alignItems: "center", gap: "4px", padding: "8px 12px", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: "8px", color: "#ef4444", cursor: "pointer", fontSize: "13px" }}>
                    <Trash2 size={13} /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Form Modal */}
      {showForm && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 999, display: "flex", alignItems: "center", justifyContent: "center", padding: "16px" }}>
          <div style={{ background: "#fff", borderRadius: "20px", padding: "32px", maxWidth: "520px", width: "100%", position: "relative", maxHeight: "90vh", overflowY: "auto" }}>
            <button onClick={resetForm} style={{ position: "absolute", top: "16px", right: "16px", background: "rgba(200,164,95,0.1)", border: "none", borderRadius: "8px", cursor: "pointer", padding: "6px", color: "#c8a45f" }}>
              <X size={18} />
            </button>
            <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: "22px", fontWeight: "700", color: "#1a0a00", marginBottom: "24px" }}>
              {editingOffer ? "Edit Offer" : "Add Special Offer"}
            </h3>
            <form onSubmit={handleSubmit}>
              {[
                { label: "Title *", field: "title", type: "text", placeholder: "e.g. Special Eid Discount!" },
                { label: "Description *", field: "description", type: "textarea", placeholder: "Describe the offer..." },
                { label: "Link (Optional)", field: "link", type: "text", placeholder: "/products or https://..." },
              ].map((f) => (
                <div key={f.field} style={{ marginBottom: "16px" }}>
                  <label style={{ display: "block", color: "#6b5040", fontWeight: "600", fontSize: "13px", marginBottom: "6px" }}>{f.label}</label>
                  {f.type === "textarea" ? (
                    <textarea
                      value={form[f.field as keyof typeof form] as string}
                      onChange={(e) => setForm({ ...form, [f.field]: e.target.value })}
                      placeholder={f.placeholder}
                      rows={3}
                      style={{ width: "100%", padding: "12px 16px", border: "1px solid rgba(200,164,95,0.3)", borderRadius: "10px", fontSize: "15px", color: "#1a0a00", resize: "vertical" }}
                    />
                  ) : (
                    <input
                      type={f.type}
                      value={form[f.field as keyof typeof form] as string}
                      onChange={(e) => setForm({ ...form, [f.field]: e.target.value })}
                      placeholder={f.placeholder}
                      style={{ width: "100%", padding: "12px 16px", border: "1px solid rgba(200,164,95,0.3)", borderRadius: "10px", fontSize: "15px", color: "#1a0a00" }}
                      required={f.field !== "link"}
                    />
                  )}
                </div>
              ))}

              <div style={{ marginBottom: "16px" }}>
                <label style={{ display: "block", color: "#6b5040", fontWeight: "600", fontSize: "13px", marginBottom: "6px" }}>Type</label>
                <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as SpecialOffer["type"] })} style={{ width: "100%", padding: "12px 16px", border: "1px solid rgba(200,164,95,0.3)", borderRadius: "10px", fontSize: "15px", color: "#1a0a00", cursor: "pointer" }}>
                  <option value="banner">Banner (below hero)</option>
                  <option value="announcement">Announcement (top bar)</option>
                  <option value="popup">Popup (homepage load)</option>
                </select>
              </div>

              <div style={{ marginBottom: "16px" }}>
                <label style={{ display: "block", color: "#6b5040", fontWeight: "600", fontSize: "13px", marginBottom: "6px" }}>Background Color</label>
                <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                  <input type="color" value={form.bgColor} onChange={(e) => setForm({ ...form, bgColor: e.target.value })} style={{ width: "60px", height: "44px", border: "1px solid rgba(200,164,95,0.3)", borderRadius: "8px", cursor: "pointer" }} />
                  <input type="text" value={form.bgColor} onChange={(e) => setForm({ ...form, bgColor: e.target.value })} style={{ flex: 1, padding: "12px 16px", border: "1px solid rgba(200,164,95,0.3)", borderRadius: "10px", fontSize: "15px", color: "#1a0a00" }} />
                </div>
              </div>

              <label style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer", marginBottom: "24px" }}>
                <input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} style={{ width: "18px", height: "18px", accentColor: "#c8a45f" }} />
                <span style={{ fontWeight: "600", color: "#6b5040" }}>Active (visible on website)</span>
              </label>

              <button type="submit" disabled={saving} style={{ width: "100%", padding: "14px", background: "linear-gradient(135deg,#c8a45f,#e8c97a)", color: "#1a0a00", border: "none", borderRadius: "12px", fontWeight: "700", fontSize: "16px", cursor: saving ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                <Save size={18} /> {saving ? "Saving..." : editingOffer ? "Update Offer" : "Add Offer"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
