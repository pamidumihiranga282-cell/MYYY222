"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { Eye, EyeOff, Mail, Lock, User, Phone, MapPin, UserPlus } from "lucide-react";

export default function RegisterPage() {
  const { signUpWithEmail, signInWithGoogle } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    password: "",
    confirmPassword: "",
  });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) {
      toast.error("Please fill in all required fields");
      return;
    }
    if (form.password !== form.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    if (form.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    setLoading(true);
    try {
      await signUpWithEmail(form.email, form.password, form.name, form.phone, form.address);
      toast.success("Account created successfully! Welcome to MRM Shopping 🛍");
      router.push("/");
    } catch (err: unknown) {
      const error = err as { code?: string };
      if (error.code === "auth/email-already-in-use") {
        toast.error("Email already registered. Please login.");
      } else if (error.code === "auth/weak-password") {
        toast.error("Password is too weak. Use at least 6 characters.");
      } else {
        toast.error("Registration failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setGoogleLoading(true);
    try {
      await signInWithGoogle();
      toast.success("Registered with Google! Welcome! 🎉");
      router.push("/");
    } catch {
      toast.error("Google sign-in failed. Please try again.");
    } finally {
      setGoogleLoading(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "13px 13px 13px 44px",
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(200,164,95,0.3)",
    borderRadius: "10px",
    color: "#fff",
    fontSize: "14px",
  };

  const labelStyle: React.CSSProperties = {
    display: "block",
    color: "#d4b896",
    fontSize: "13px",
    fontWeight: "600",
    marginBottom: "6px",
  };

  const iconStyle: React.CSSProperties = {
    position: "absolute",
    left: "14px",
    top: "50%",
    transform: "translateY(-50%)",
    color: "#9a7a3f",
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #1a0a00 0%, #3d1c02 50%, #1a0a00 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
      }}
    >
      <div
        style={{
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(200,164,95,0.3)",
          borderRadius: "24px",
          padding: "40px",
          width: "100%",
          maxWidth: "500px",
          backdropFilter: "blur(10px)",
          boxShadow: "0 30px 80px rgba(0,0,0,0.5)",
        }}
      >
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: "28px" }}>
          <div style={{ fontSize: "40px", marginBottom: "10px" }}>🛍</div>
          <h1
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "26px",
              fontWeight: "700",
              background: "linear-gradient(135deg, #c8a45f, #e8c97a)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              marginBottom: "4px",
            }}
          >
            Create Account
          </h1>
          <p style={{ color: "#9a8070", fontSize: "13px" }}>
            Join MRM Shopping for exclusive Dubai products
          </p>
        </div>

        {/* Google Sign Up */}
        <button
          onClick={handleGoogle}
          disabled={googleLoading}
          style={{
            width: "100%",
            padding: "13px",
            background: "#fff",
            border: "none",
            borderRadius: "12px",
            fontWeight: "600",
            fontSize: "14px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "10px",
            color: "#333",
            marginBottom: "20px",
            boxShadow: "0 2px 10px rgba(0,0,0,0.2)",
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          {googleLoading ? "Signing up..." : "Continue with Google"}
        </button>

        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
          <div style={{ flex: 1, height: "1px", background: "rgba(200,164,95,0.2)" }} />
          <span style={{ color: "#6b5040", fontSize: "12px" }}>or fill in the form</span>
          <div style={{ flex: 1, height: "1px", background: "rgba(200,164,95,0.2)" }} />
        </div>

        <form onSubmit={handleRegister}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            {/* Name */}
            <div style={{ marginBottom: "12px" }}>
              <label style={labelStyle}>Full Name *</label>
              <div style={{ position: "relative" }}>
                <User size={16} style={iconStyle} />
                <input name="name" type="text" value={form.name} onChange={handleChange} placeholder="Your name" style={inputStyle} required />
              </div>
            </div>

            {/* Phone */}
            <div style={{ marginBottom: "12px" }}>
              <label style={labelStyle}>Phone</label>
              <div style={{ position: "relative" }}>
                <Phone size={16} style={iconStyle} />
                <input name="phone" type="tel" value={form.phone} onChange={handleChange} placeholder="07X XXX XXXX" style={inputStyle} />
              </div>
            </div>
          </div>

          {/* Email */}
          <div style={{ marginBottom: "12px" }}>
            <label style={labelStyle}>Email Address *</label>
            <div style={{ position: "relative" }}>
              <Mail size={16} style={iconStyle} />
              <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="your@email.com" style={inputStyle} required />
            </div>
          </div>

          {/* Address */}
          <div style={{ marginBottom: "12px" }}>
            <label style={labelStyle}>Delivery Address</label>
            <div style={{ position: "relative" }}>
              <MapPin size={16} style={{ ...iconStyle, top: "20px" }} />
              <input
                name="address"
                value={form.address}
                onChange={handleChange}
                placeholder="Your address"
                style={{ ...inputStyle, paddingTop: "13px" }}
              />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            {/* Password */}
            <div style={{ marginBottom: "12px" }}>
              <label style={labelStyle}>Password *</label>
              <div style={{ position: "relative" }}>
                <Lock size={16} style={iconStyle} />
                <input
                  name="password"
                  type={showPass ? "text" : "password"}
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Min 6 chars"
                  style={{ ...inputStyle, paddingRight: "40px" }}
                  required
                />
                <button type="button" onClick={() => setShowPass(!showPass)} style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "#9a7a3f", cursor: "pointer", padding: 0 }}>
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div style={{ marginBottom: "20px" }}>
              <label style={labelStyle}>Confirm Password *</label>
              <div style={{ position: "relative" }}>
                <Lock size={16} style={iconStyle} />
                <input
                  name="confirmPassword"
                  type={showPass ? "text" : "password"}
                  value={form.confirmPassword}
                  onChange={handleChange}
                  placeholder="Repeat password"
                  style={inputStyle}
                  required
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "15px",
              background: loading ? "rgba(200,164,95,0.5)" : "linear-gradient(135deg, #c8a45f, #e8c97a)",
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
            <UserPlus size={18} />
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        <div style={{ textAlign: "center", marginTop: "20px", color: "#6b5040", fontSize: "14px" }}>
          Already have an account?{" "}
          <Link href="/login" style={{ color: "#c8a45f", fontWeight: "600", textDecoration: "none" }}>
            Sign in here
          </Link>
        </div>
      </div>
    </div>
  );
}
