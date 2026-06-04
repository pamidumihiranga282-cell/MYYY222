"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getAllContactMessages, markMessageRead } from "@/lib/firestore";
import type { ContactMessage } from "@/lib/types";
import { ArrowLeft, Mail, Phone, Eye } from "lucide-react";
import { format } from "date-fns";

function formatTimestamp(ts: unknown): string {
  if (!ts) return "";
  try {
    if (typeof ts === "object" && ts !== null && "toDate" in ts) {
      return format((ts as { toDate(): Date }).toDate(), "dd MMM yyyy, hh:mm a");
    }
    return format(new Date(ts as string), "dd MMM yyyy, hh:mm a");
  } catch { return ""; }
}

export default function AdminMessagesPage() {
  const { isAdmin, loading } = useAuth();
  const router = useRouter();
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [messagesLoading, setMessagesLoading] = useState(true);
  const [selected, setSelected] = useState<ContactMessage | null>(null);

  useEffect(() => {
    if (!loading && !isAdmin) router.push("/");
  }, [loading, isAdmin, router]);

  useEffect(() => {
    if (isAdmin) {
      getAllContactMessages().then(setMessages).finally(() => setMessagesLoading(false));
    }
  }, [isAdmin]);

  const handleSelect = async (msg: ContactMessage) => {
    setSelected(msg);
    if (!msg.read) {
      await markMessageRead(msg.id);
      setMessages((prev) => prev.map((m) => m.id === msg.id ? { ...m, read: true } : m));
    }
  };

  if (loading || !isAdmin) return <div style={{ textAlign: "center", padding: "100px", color: "#c8a45f" }}>Loading...</div>;

  const unread = messages.filter((m) => !m.read).length;

  return (
    <div style={{ minHeight: "100vh", background: "#fdf8f0", padding: "32px 16px" }}>
      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "24px" }}>
          <Link href="/admin" style={{ display: "flex", alignItems: "center", gap: "6px", border: "1px solid rgba(200,164,95,0.3)", borderRadius: "8px", padding: "8px 14px", color: "#c8a45f", textDecoration: "none", fontSize: "14px" }}>
            <ArrowLeft size={16} /> Dashboard
          </Link>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "26px", fontWeight: "700", color: "#1a0a00" }}>
            Messages {unread > 0 && <span style={{ fontSize: "18px", color: "#ef4444" }}>({unread} unread)</span>}
          </h1>
        </div>

        {messagesLoading ? (
          <div style={{ textAlign: "center", padding: "60px", color: "#c8a45f" }}>Loading...</div>
        ) : messages.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 0" }}>
            <Mail size={60} style={{ color: "#d4b896", marginBottom: "16px" }} />
            <p style={{ color: "#9a8070", fontSize: "18px" }}>No messages yet</p>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "380px 1fr", gap: "24px" }}>
            {/* Message list */}
            <div style={{ background: "#fff", borderRadius: "16px", overflow: "hidden", border: "1px solid rgba(200,164,95,0.15)", maxHeight: "600px", overflowY: "auto" }}>
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  onClick={() => handleSelect(msg)}
                  style={{ padding: "16px 20px", borderBottom: "1px solid rgba(200,164,95,0.08)", cursor: "pointer", background: selected?.id === msg.id ? "rgba(200,164,95,0.08)" : !msg.read ? "rgba(200,164,95,0.03)" : "transparent", borderLeft: selected?.id === msg.id ? "3px solid #c8a45f" : "3px solid transparent" }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                    <div style={{ fontWeight: msg.read ? "600" : "700", color: "#1a0a00", fontSize: "14px" }}>
                      {!msg.read && <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#ef4444", display: "inline-block", marginRight: "8px" }} />}
                      {msg.name}
                    </div>
                    <div style={{ fontSize: "11px", color: "#9a8070" }}>{formatTimestamp(msg.createdAt)}</div>
                  </div>
                  <div style={{ color: "#c8a45f", fontSize: "13px", fontWeight: "600", marginBottom: "2px" }}>{msg.subject || "No Subject"}</div>
                  <div style={{ color: "#9a8070", fontSize: "12px" }} className="line-clamp-2">{msg.message}</div>
                </div>
              ))}
            </div>

            {/* Message detail */}
            {selected ? (
              <div style={{ background: "#fff", borderRadius: "16px", padding: "28px", border: "1px solid rgba(200,164,95,0.15)" }}>
                <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: "20px", fontWeight: "700", color: "#1a0a00", marginBottom: "16px" }}>
                  {selected.subject || "No Subject"}
                </h3>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "20px" }}>
                  {[
                    { icon: <span>👤</span>, label: "From", value: selected.name },
                    { icon: <Mail size={14} />, label: "Email", value: selected.email },
                    { icon: <Phone size={14} />, label: "Phone", value: selected.phone || "N/A" },
                    { icon: <span>📅</span>, label: "Date", value: formatTimestamp(selected.createdAt) },
                  ].map((item, i) => (
                    <div key={i} style={{ padding: "12px 16px", background: "#fdf8f0", borderRadius: "10px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#9a8070", fontSize: "11px", fontWeight: "600", marginBottom: "4px" }}>
                        {item.icon} {item.label}
                      </div>
                      <div style={{ fontSize: "14px", fontWeight: "600", color: "#1a0a00" }}>{item.value}</div>
                    </div>
                  ))}
                </div>
                <div style={{ padding: "20px", background: "#fdf8f0", borderRadius: "12px", lineHeight: "1.8", color: "#1a0a00", fontSize: "15px" }}>
                  {selected.message}
                </div>
                <div style={{ marginTop: "20px", display: "flex", gap: "12px" }}>
                  <a
                    href={`mailto:${selected.email}?subject=Re: ${selected.subject || "Your Inquiry"}`}
                    style={{ display: "flex", alignItems: "center", gap: "8px", padding: "12px 20px", background: "linear-gradient(135deg,#c8a45f,#e8c97a)", color: "#1a0a00", textDecoration: "none", borderRadius: "10px", fontWeight: "700", fontSize: "14px" }}
                  >
                    <Mail size={16} /> Reply via Email
                  </a>
                  {selected.phone && (
                    <a
                      href={`https://wa.me/94${selected.phone.replace(/^0/, "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ display: "flex", alignItems: "center", gap: "8px", padding: "12px 20px", background: "#25d366", color: "#fff", textDecoration: "none", borderRadius: "10px", fontWeight: "700", fontSize: "14px" }}
                    >
                      💬 WhatsApp
                    </a>
                  )}
                </div>
              </div>
            ) : (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", background: "#fff", borderRadius: "16px", border: "1px solid rgba(200,164,95,0.15)", color: "#9a8070" }}>
                <div style={{ textAlign: "center" }}>
                  <Eye size={40} style={{ marginBottom: "12px", opacity: 0.5 }} />
                  <p>Select a message to view</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <style>{`
        @media (max-width: 768px) {
          div[style*="grid-template-columns: 380px 1fr"] { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
