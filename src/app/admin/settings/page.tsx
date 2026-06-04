"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getSiteSettings, updateSiteSettings } from "@/lib/firestore";
import { storage } from "@/lib/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import type { SiteSettings } from "@/lib/types";
import toast from "react-hot-toast";
import { ArrowLeft, Save, Upload } from "lucide-react";

export default function AdminSettingsPage() {
  const { isAdmin, loading } = useAuth();
  const router = useRouter();
  const [settings, setSettings] = useState<SiteSettings>({
    heroTitle: "",
    heroSubtitle: "",
    heroImage: "",
    aboutText: "",
    phone: "",
    address: "",
    email: "",
    whatsapp: "",
    deliveryInfo: "",
    bannerText: "",
    bannerActive: false,
    bannerColor: "#c8a45f",
  });
  const [settingsLoading, setSettingsLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [heroImageFile, setHeroImageFile] = useState<File | null>(null);
  const [heroPreview, setHeroPreview] = useState("");
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!loading && !isAdmin) router.push("/");
  }, [loading, isAdmin, router]);

  useEffect(() => {
    if (isAdmin) {
      getSiteSettings().then((s) => {
        setSettings(s);
        setHeroPreview(s.heroImage || "");
      }).finally(() => setSettingsLoading(false));
    }
  }, [isAdmin]);

  const handleHeroImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setHeroImageFile(file);
    setHeroPreview(URL.createObjectURL(file));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      let heroImageUrl = settings.heroImage || "";
      if (heroImageFile) {
        setUploading(true);
        const storageRef = ref(storage, `site/hero_${Date.now()}`);
        await uploadBytes(storageRef, heroImageFile);
        heroImageUrl = await getDownloadURL(storageRef);
        setUploading(false);
      }
      await updateSiteSettings({ ...settings, heroImage: heroImageUrl });
      toast.success("Site settings saved! ✅");
    } catch {
      toast.error("Failed to save settings");
    } finally {
      setSaving(false);
      setUploading(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "12px 16px",
    border: "1px solid rgba(200,164,95,0.3)", borderRadius: "10px",
    fontSize: "15px", color: "#1a0a00", background: "#fdf8f0",
  };

  const labelStyle: React.CSSProperties = {
    display: "block", color: "#6b5040", fontWeight: "600", fontSize: "13px", marginBottom: "6px",
  };

  if (loading || settingsLoading) return <div style={{ textAlign: "center", padding: "100px", color: "#c8a45f" }}>Loading...</div>;
  if (!isAdmin) return null;

  return (
    <div style={{ minHeight: "100vh", background: "#fdf8f0", padding: "32px 16px" }}>
      <div style={{ maxWidth: "900px", margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "32px" }}>
          <Link href="/admin" style={{ display: "flex", alignItems: "center", gap: "6px", border: "1px solid rgba(200,164,95,0.3)", borderRadius: "8px", padding: "8px 14px", color: "#c8a45f", textDecoration: "none", fontSize: "14px" }}>
            <ArrowLeft size={16} /> Dashboard
          </Link>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "26px", fontWeight: "700", color: "#1a0a00" }}>
            Site Settings
          </h1>
        </div>

        <form onSubmit={handleSave}>
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            {/* Hero Section */}
            <div style={{ background: "#fff", borderRadius: "16px", padding: "28px", border: "1px solid rgba(200,164,95,0.15)" }}>
              <h3 style={{ fontWeight: "700", color: "#1a0a00", marginBottom: "20px", fontSize: "17px" }}>🏠 Hero Section</h3>
              <div style={{ marginBottom: "16px" }}>
                <label style={labelStyle}>Hero Title</label>
                <input value={settings.heroTitle} onChange={(e) => setSettings({ ...settings, heroTitle: e.target.value })} placeholder="Main headline..." style={inputStyle} />
              </div>
              <div style={{ marginBottom: "16px" }}>
                <label style={labelStyle}>Hero Subtitle</label>
                <input value={settings.heroSubtitle} onChange={(e) => setSettings({ ...settings, heroSubtitle: e.target.value })} placeholder="Tagline..." style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Hero Background Image</label>
                <div
                  style={{ border: "2px dashed rgba(200,164,95,0.4)", borderRadius: "12px", overflow: "hidden", cursor: "pointer", marginBottom: "12px" }}
                  onClick={() => document.getElementById("hero-upload")?.click()}
                >
                  {heroPreview ? (
                    <div style={{ position: "relative" }}>
                      <img src={heroPreview} alt="Hero" style={{ width: "100%", height: "200px", objectFit: "cover" }} />
                      <div style={{ position: "absolute", bottom: "10px", right: "10px", background: "rgba(26,10,0,0.8)", color: "#e8c97a", padding: "6px 12px", borderRadius: "8px", fontSize: "12px", fontWeight: "600" }}>
                        Click to change
                      </div>
                    </div>
                  ) : (
                    <div style={{ padding: "40px", textAlign: "center" }}>
                      <Upload size={36} style={{ color: "#c8a45f", marginBottom: "8px" }} />
                      <div style={{ color: "#9a8070" }}>Click to upload hero image</div>
                    </div>
                  )}
                </div>
                <input id="hero-upload" type="file" accept="image/*" onChange={handleHeroImageChange} style={{ display: "none" }} />
                <div>
                  <label style={labelStyle}>Or paste image URL</label>
                  <input
                    value={settings.heroImage || ""}
                    onChange={(e) => { setSettings({ ...settings, heroImage: e.target.value }); setHeroPreview(e.target.value); }}
                    placeholder="https://..."
                    style={inputStyle}
                  />
                </div>
              </div>
            </div>

            {/* Contact Info */}
            <div style={{ background: "#fff", borderRadius: "16px", padding: "28px", border: "1px solid rgba(200,164,95,0.15)" }}>
              <h3 style={{ fontWeight: "700", color: "#1a0a00", marginBottom: "20px", fontSize: "17px" }}>📞 Contact Information</h3>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                {[
                  { label: "Phone", field: "phone", placeholder: "070 707 0872" },
                  { label: "WhatsApp", field: "whatsapp", placeholder: "0707070872" },
                  { label: "Email", field: "email", placeholder: "mrmshopping2025@gmail.com" },
                  { label: "Address", field: "address", placeholder: "Anuradhapura" },
                ].map((f) => (
                  <div key={f.field}>
                    <label style={labelStyle}>{f.label}</label>
                    <input
                      value={((settings as unknown) as Record<string, string>)[f.field] || ""}
                      onChange={(e) => setSettings({ ...settings, [f.field]: e.target.value })}
                      placeholder={f.placeholder}
                      style={inputStyle}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* About */}
            <div style={{ background: "#fff", borderRadius: "16px", padding: "28px", border: "1px solid rgba(200,164,95,0.15)" }}>
              <h3 style={{ fontWeight: "700", color: "#1a0a00", marginBottom: "20px", fontSize: "17px" }}>📖 About Section</h3>
              <div>
                <label style={labelStyle}>About Text</label>
                <textarea
                  value={settings.aboutText}
                  onChange={(e) => setSettings({ ...settings, aboutText: e.target.value })}
                  placeholder="About MRM Shopping..."
                  rows={4}
                  style={{ ...inputStyle, resize: "vertical" }}
                />
              </div>
              <div style={{ marginTop: "16px" }}>
                <label style={labelStyle}>Delivery Information</label>
                <input
                  value={settings.deliveryInfo || ""}
                  onChange={(e) => setSettings({ ...settings, deliveryInfo: e.target.value })}
                  placeholder="Delivery charge info..."
                  style={inputStyle}
                />
              </div>
            </div>

            {/* Top Banner */}
            <div style={{ background: "#fff", borderRadius: "16px", padding: "28px", border: "1px solid rgba(200,164,95,0.15)" }}>
              <h3 style={{ fontWeight: "700", color: "#1a0a00", marginBottom: "20px", fontSize: "17px" }}>📢 Top Announcement Banner</h3>
              <div style={{ marginBottom: "16px" }}>
                <label style={labelStyle}>Banner Text</label>
                <input
                  value={settings.bannerText || ""}
                  onChange={(e) => setSettings({ ...settings, bannerText: e.target.value })}
                  placeholder="🔥 Special offer this week..."
                  style={inputStyle}
                />
              </div>
              <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
                <label style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={settings.bannerActive || false}
                    onChange={(e) => setSettings({ ...settings, bannerActive: e.target.checked })}
                    style={{ width: "18px", height: "18px", accentColor: "#c8a45f" }}
                  />
                  <span style={{ fontWeight: "600", color: "#6b5040" }}>Show Banner</span>
                </label>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <span style={{ color: "#6b5040", fontWeight: "600", fontSize: "13px" }}>Color:</span>
                  <input type="color" value={settings.bannerColor || "#c8a45f"} onChange={(e) => setSettings({ ...settings, bannerColor: e.target.value })} style={{ width: "50px", height: "38px", border: "1px solid rgba(200,164,95,0.3)", borderRadius: "8px", cursor: "pointer" }} />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={saving || uploading}
              style={{ padding: "16px 48px", background: saving || uploading ? "rgba(200,164,95,0.5)" : "linear-gradient(135deg,#c8a45f,#e8c97a)", color: "#1a0a00", border: "none", borderRadius: "12px", fontWeight: "700", fontSize: "17px", cursor: saving ? "not-allowed" : "pointer", display: "flex", alignItems: "center", gap: "10px", boxShadow: "0 8px 25px rgba(200,164,95,0.3)", alignSelf: "flex-start" }}
            >
              <Save size={20} />
              {uploading ? "Uploading..." : saving ? "Saving..." : "Save All Settings"}
            </button>
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
