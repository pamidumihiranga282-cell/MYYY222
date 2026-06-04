"use client";

import { useState } from "react";
import { addContactMessage } from "@/lib/firestore";
import toast from "react-hot-toast";
import { Mail, Phone, MapPin, Send, Clock } from "lucide-react";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", subject: "", message: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      toast.error("Please fill in all required fields");
      return;
    }
    setLoading(true);
    try {
      await addContactMessage(form);
      toast.success("Message sent successfully! We'll reply soon. 🙏");
      setForm({ name: "", email: "", phone: "", subject: "", message: "" });
    } catch {
      toast.error("Failed to send message. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "14px 16px",
    border: "1px solid rgba(200,164,95,0.3)",
    borderRadius: "12px",
    fontSize: "15px",
    color: "#1a0a00",
    background: "#fdf8f0",
    transition: "all 0.2s",
  };

  return (
    <div style={{ minHeight: "100vh", background: "#fdf8f0" }}>
      {/* Header */}
      <div
        style={{
          background: "linear-gradient(135deg,#1a0a00,#3d1c02)",
          padding: "80px 24px",
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
          Get in Touch
        </h1>
        <p style={{ color: "#9a8070", fontSize: "16px" }}>
          We&apos;d love to hear from you. Send us a message!
        </p>
      </div>

      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "60px 16px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1.5fr", gap: "48px" }}>
          {/* Contact Info */}
          <div>
            <h2
              style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: "28px",
                fontWeight: "700",
                color: "#1a0a00",
                marginBottom: "24px",
              }}
            >
              Contact Information
            </h2>
            <p style={{ color: "#6b5040", lineHeight: "1.8", marginBottom: "32px" }}>
              Reach out to us through any of the channels below. We&apos;re available
              Monday to Saturday, 8AM–8PM.
            </p>

            {[
              { icon: <Phone size={22} />, title: "Phone / WhatsApp", lines: ["070 707 0872"] },
              { icon: <Mail size={22} />, title: "Email", lines: ["mrmshopping2025@gmail.com"] },
              { icon: <MapPin size={22} />, title: "Address", lines: ["Anuradhapura, Sri Lanka"] },
              { icon: <Clock size={22} />, title: "Business Hours", lines: ["Mon – Sat: 8:00 AM – 8:00 PM", "Sunday: Closed"] },
            ].map((info, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  gap: "16px",
                  marginBottom: "24px",
                  padding: "20px",
                  background: "#fff",
                  borderRadius: "14px",
                  border: "1px solid rgba(200,164,95,0.15)",
                  boxShadow: "0 4px 15px rgba(61,28,2,0.05)",
                }}
              >
                <div
                  style={{
                    width: "50px",
                    height: "50px",
                    borderRadius: "12px",
                    background: "linear-gradient(135deg,rgba(200,164,95,0.2),rgba(232,201,122,0.1))",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#c8a45f",
                    flexShrink: 0,
                  }}
                >
                  {info.icon}
                </div>
                <div>
                  <div style={{ fontWeight: "700", color: "#1a0a00", marginBottom: "4px", fontSize: "15px" }}>
                    {info.title}
                  </div>
                  {info.lines.map((line, j) => (
                    <div key={j} style={{ color: "#6b5040", fontSize: "14px" }}>
                      {line}
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {/* WhatsApp CTA */}
            <a
              href="https://wa.me/94707070872"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                padding: "16px 24px",
                background: "#25d366",
                color: "#fff",
                textDecoration: "none",
                borderRadius: "14px",
                fontWeight: "700",
                fontSize: "16px",
                boxShadow: "0 8px 25px rgba(37,211,102,0.3)",
                marginTop: "8px",
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
              </svg>
              Chat on WhatsApp
            </a>
          </div>

          {/* Contact Form */}
          <div
            style={{
              background: "#fff",
              borderRadius: "20px",
              padding: "36px",
              border: "1px solid rgba(200,164,95,0.15)",
              boxShadow: "0 10px 40px rgba(61,28,2,0.08)",
            }}
          >
            <h3
              style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: "24px",
                fontWeight: "700",
                color: "#1a0a00",
                marginBottom: "24px",
              }}
            >
              Send a Message
            </h3>
            <form onSubmit={handleSubmit}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
                <div>
                  <label style={{ display: "block", color: "#6b5040", fontWeight: "600", fontSize: "13px", marginBottom: "6px" }}>
                    Full Name *
                  </label>
                  <input
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Your name"
                    style={inputStyle}
                    required
                  />
                </div>
                <div>
                  <label style={{ display: "block", color: "#6b5040", fontWeight: "600", fontSize: "13px", marginBottom: "6px" }}>
                    Email *
                  </label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="your@email.com"
                    style={inputStyle}
                    required
                  />
                </div>
              </div>

              <div style={{ marginBottom: "16px" }}>
                <label style={{ display: "block", color: "#6b5040", fontWeight: "600", fontSize: "13px", marginBottom: "6px" }}>
                  Phone
                </label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="07X XXX XXXX"
                  style={inputStyle}
                />
              </div>

              <div style={{ marginBottom: "16px" }}>
                <label style={{ display: "block", color: "#6b5040", fontWeight: "600", fontSize: "13px", marginBottom: "6px" }}>
                  Subject
                </label>
                <input
                  value={form.subject}
                  onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  placeholder="How can we help?"
                  style={inputStyle}
                />
              </div>

              <div style={{ marginBottom: "24px" }}>
                <label style={{ display: "block", color: "#6b5040", fontWeight: "600", fontSize: "13px", marginBottom: "6px" }}>
                  Message *
                </label>
                <textarea
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  placeholder="Write your message here..."
                  rows={5}
                  style={{ ...inputStyle, resize: "vertical" }}
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  width: "100%",
                  padding: "16px",
                  background: "linear-gradient(135deg,#c8a45f,#e8c97a)",
                  color: "#1a0a00",
                  border: "none",
                  borderRadius: "12px",
                  fontWeight: "700",
                  fontSize: "16px",
                  cursor: loading ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  boxShadow: "0 8px 25px rgba(200,164,95,0.3)",
                }}
              >
                <Send size={18} />
                {loading ? "Sending..." : "Send Message"}
              </button>
            </form>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          div[style*="grid-template-columns: 1fr 1.5fr"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
