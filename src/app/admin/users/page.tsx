"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getAllUsers, updateUser, deleteUser } from "@/lib/firestore";
import toast from "react-hot-toast";
import { ArrowLeft, Trash2, Edit2, X, Save, Search } from "lucide-react";

interface UserRecord {
  id: string;
  displayName: string;
  email: string;
  phone?: string;
  address?: string;
  role: string;
  createdAt?: unknown;
}

export default function AdminUsersPage() {
  const { isAdmin, loading } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [filtered, setFiltered] = useState<UserRecord[]>([]);
  const [search, setSearch] = useState("");
  const [usersLoading, setUsersLoading] = useState(true);
  const [editingUser, setEditingUser] = useState<UserRecord | null>(null);
  const [editForm, setEditForm] = useState({ displayName: "", phone: "", address: "", role: "customer" });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !isAdmin) router.push("/");
  }, [loading, isAdmin, router]);

  useEffect(() => {
    if (isAdmin) {
      getAllUsers()
        .then((u) => {
          const typed = u as UserRecord[];
          setUsers(typed);
          setFiltered(typed);
        })
        .finally(() => setUsersLoading(false));
    }
  }, [isAdmin]);

  useEffect(() => {
    if (search.trim()) {
      setFiltered(users.filter((u) =>
        u.displayName?.toLowerCase().includes(search.toLowerCase()) ||
        u.email?.toLowerCase().includes(search.toLowerCase())
      ));
    } else {
      setFiltered(users);
    }
  }, [search, users]);

  const handleEdit = (user: UserRecord) => {
    setEditingUser(user);
    setEditForm({ displayName: user.displayName || "", phone: user.phone || "", address: user.address || "", role: user.role || "customer" });
  };

  const handleSave = async () => {
    if (!editingUser) return;
    setSaving(true);
    try {
      await updateUser(editingUser.id, editForm);
      setUsers((prev) => prev.map((u) => u.id === editingUser.id ? { ...u, ...editForm } : u));
      setEditingUser(null);
      toast.success("User updated successfully!");
    } catch {
      toast.error("Failed to update user");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (uid: string, name: string) => {
    if (!confirm(`Delete user "${name}"? This cannot be undone.`)) return;
    setDeleting(uid);
    try {
      await deleteUser(uid);
      setUsers((prev) => prev.filter((u) => u.id !== uid));
      toast.success(`${name} deleted`);
    } catch {
      toast.error("Failed to delete user");
    } finally {
      setDeleting(null);
    }
  };

  if (loading || !isAdmin) return <div style={{ textAlign: "center", padding: "100px", color: "#c8a45f" }}>Loading...</div>;

  return (
    <div style={{ minHeight: "100vh", background: "#fdf8f0", padding: "32px 16px" }}>
      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "24px", flexWrap: "wrap" }}>
          <Link href="/admin" style={{ display: "flex", alignItems: "center", gap: "6px", border: "1px solid rgba(200,164,95,0.3)", borderRadius: "8px", padding: "8px 14px", color: "#c8a45f", textDecoration: "none", fontSize: "14px" }}>
            <ArrowLeft size={16} /> Dashboard
          </Link>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "26px", fontWeight: "700", color: "#1a0a00" }}>
            Users ({filtered.length})
          </h1>
        </div>

        <div style={{ position: "relative", marginBottom: "20px" }}>
          <Search size={16} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#9a7a3f" }} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email..."
            style={{ padding: "12px 12px 12px 38px", border: "1px solid rgba(200,164,95,0.3)", borderRadius: "10px", fontSize: "14px", color: "#1a0a00", background: "#fff", minWidth: "300px" }}
          />
        </div>

        {usersLoading ? (
          <div style={{ textAlign: "center", padding: "60px", color: "#c8a45f" }}>Loading users...</div>
        ) : (
          <div style={{ background: "#fff", borderRadius: "16px", overflow: "hidden", border: "1px solid rgba(200,164,95,0.15)" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "linear-gradient(135deg,#1a0a00,#3d1c02)" }}>
                  {["User", "Email", "Phone", "Role", "Actions"].map((h) => (
                    <th key={h} style={{ padding: "14px 16px", textAlign: "left", color: "#e8c97a", fontWeight: "700", fontSize: "13px" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((user, i) => (
                  <tr key={user.id} style={{ borderBottom: "1px solid rgba(200,164,95,0.08)", background: i % 2 === 0 ? "#fff" : "#fdf8f0" }}>
                    <td style={{ padding: "14px 16px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "linear-gradient(135deg,#c8a45f,#e8c97a)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "700", color: "#1a0a00", fontSize: "14px" }}>
                          {user.displayName?.charAt(0).toUpperCase() || "?"}
                        </div>
                        <div>
                          <div style={{ fontWeight: "700", color: "#1a0a00", fontSize: "14px" }}>{user.displayName || "—"}</div>
                          <div style={{ color: "#9a8070", fontSize: "12px" }}>{user.address || "No address"}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: "14px 16px", fontSize: "14px", color: "#6b5040" }}>{user.email}</td>
                    <td style={{ padding: "14px 16px", fontSize: "14px", color: "#6b5040" }}>{user.phone || "—"}</td>
                    <td style={{ padding: "14px 16px" }}>
                      <span style={{ background: user.role === "admin" ? "rgba(200,164,95,0.15)" : "rgba(59,130,246,0.1)", color: user.role === "admin" ? "#c8a45f" : "#3b82f6", padding: "3px 12px", borderRadius: "999px", fontSize: "12px", fontWeight: "700", textTransform: "uppercase" }}>
                        {user.role}
                      </span>
                    </td>
                    <td style={{ padding: "14px 16px" }}>
                      <div style={{ display: "flex", gap: "8px" }}>
                        <button
                          onClick={() => handleEdit(user)}
                          style={{ display: "flex", alignItems: "center", gap: "4px", padding: "7px 12px", background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.3)", borderRadius: "8px", color: "#3b82f6", cursor: "pointer", fontSize: "13px", fontWeight: "600" }}
                        >
                          <Edit2 size={13} /> Edit
                        </button>
                        <button
                          onClick={() => handleDelete(user.id, user.displayName)}
                          disabled={deleting === user.id}
                          style={{ display: "flex", alignItems: "center", gap: "4px", padding: "7px 12px", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: "8px", color: "#ef4444", cursor: "pointer", fontSize: "13px", fontWeight: "600" }}
                        >
                          <Trash2 size={13} /> {deleting === user.id ? "..." : "Delete"}
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

      {/* Edit Modal */}
      {editingUser && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 999, display: "flex", alignItems: "center", justifyContent: "center", padding: "16px" }}>
          <div style={{ background: "#fff", borderRadius: "20px", padding: "32px", maxWidth: "480px", width: "100%", position: "relative" }}>
            <button onClick={() => setEditingUser(null)} style={{ position: "absolute", top: "16px", right: "16px", background: "rgba(200,164,95,0.1)", border: "none", borderRadius: "8px", cursor: "pointer", padding: "6px", color: "#c8a45f" }}>
              <X size={18} />
            </button>
            <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: "22px", fontWeight: "700", color: "#1a0a00", marginBottom: "24px" }}>
              Edit User
            </h3>
            {[
              { label: "Full Name", field: "displayName", type: "text" },
              { label: "Phone", field: "phone", type: "tel" },
              { label: "Address", field: "address", type: "text" },
            ].map((f) => (
              <div key={f.field} style={{ marginBottom: "16px" }}>
                <label style={{ display: "block", color: "#6b5040", fontWeight: "600", fontSize: "13px", marginBottom: "6px" }}>{f.label}</label>
                <input
                  type={f.type}
                  value={editForm[f.field as keyof typeof editForm]}
                  onChange={(e) => setEditForm({ ...editForm, [f.field]: e.target.value })}
                  style={{ width: "100%", padding: "12px 16px", border: "1px solid rgba(200,164,95,0.3)", borderRadius: "10px", fontSize: "15px", color: "#1a0a00" }}
                />
              </div>
            ))}
            <div style={{ marginBottom: "24px" }}>
              <label style={{ display: "block", color: "#6b5040", fontWeight: "600", fontSize: "13px", marginBottom: "6px" }}>Role</label>
              <select
                value={editForm.role}
                onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                style={{ width: "100%", padding: "12px 16px", border: "1px solid rgba(200,164,95,0.3)", borderRadius: "10px", fontSize: "15px", color: "#1a0a00", cursor: "pointer" }}
              >
                <option value="customer">Customer</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <button
              onClick={handleSave}
              disabled={saving}
              style={{ width: "100%", padding: "14px", background: "linear-gradient(135deg,#c8a45f,#e8c97a)", color: "#1a0a00", border: "none", borderRadius: "12px", fontWeight: "700", fontSize: "16px", cursor: saving ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}
            >
              <Save size={18} /> {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
