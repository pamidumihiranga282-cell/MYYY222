"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { Eye, EyeOff, Mail, Lock, LogIn } from "lucide-react";

export default function LoginPage() {
  const { signInWithEmail, signInWithGoogle, resetPassword } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [forgotMode, setForgotMode] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please fill in all fields");
      return;
    }
    setLoading(true);
    try {
      await signInWithEmail(email, password);
      toast.success("Welcome back! 🛍");
      router.push("/");
    } catch (err: unknown) {
      const error = err as { code?: string };
      if (error.code === "auth/invalid-credential" || error.code === "auth/wrong-password") {
        toast.error("Invalid email or password");
      } else if (error.code === "auth/user-not-found") {
        toast.error("No account found with this email");
      } else {
        toast.error("Login failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setGoogleLoading(true);
    try {
      await signInWithGoogle();
      toast.success("Signed in with Google! 🎉");
      router.push("/");
    } catch {
      toast.error("Google sign-in failed. Please try again.");
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) {
      toast.error("Please enter your email");
      return;
    }
    setForgotLoading(true);
    try {
      await resetPassword(forgotEmail);
      toast.success("Password reset email sent! Check your inbox.");
      setForgotMode(false);
    } catch {
      toast.error("Failed to send reset email. Please try again.");
    } finally {
      setForgotLoading(false);
    }
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
      {/* Decorative background */}
      <div
        style={{
          position: "fixed",
          top: "10%",
          left: "5%",
          width: "300px",
          height: "300px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(200,164,95,0.1) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "fixed",
          bottom: "10%",
          right: "5%",
          width: "400px",
          height: "400px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(200,164,95,0.08) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(200,164,95,0.3)",
          borderRadius: "24px",
          padding: "48px 40px",
          width: "100%",
          maxWidth: "440px",
          backdropFilter: "blur(10px)",
          boxShadow: "0 30px 80px rgba(0,0,0,0.5)",
        }}
      >
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <div style={{ fontSize: "48px", marginBottom: "12px" }}>🛍</div>
          <h1
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "28px",
              fontWeight: "700",
              background: "linear-gradient(135deg, #c8a45f, #e8c97a)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              marginBottom: "4px",
            }}
          >
            MRM Shopping
          </h1>
          <p style={{ color: "#9a8070", fontSize: "14px" }}>
            {forgotMode ? "Reset your password" : "Welcome back! Sign in to continue"}
          </p>
        </div>

        {forgotMode ? (
          <form onSubmit={handleForgotPassword}>
            <div style={{ marginBottom: "20px" }}>
              <label
                style={{
                  display: "block",
                  color: "#d4b896",
                  fontSize: "14px",
                  fontWeight: "600",
                  marginBottom: "8px",
                }}
              >
                Email Address
              </label>
              <div style={{ position: "relative" }}>
                <Mail
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
                  type="email"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  placeholder="Enter your email"
                  style={{
                    width: "100%",
                    padding: "14px 14px 14px 44px",
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(200,164,95,0.3)",
                    borderRadius: "10px",
                    color: "#fff",
                    fontSize: "15px",
                  }}
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={forgotLoading}
              style={{
                width: "100%",
                padding: "15px",
                background: "linear-gradient(135deg, #c8a45f, #e8c97a)",
                color: "#1a0a00",
                border: "none",
                borderRadius: "12px",
                fontWeight: "700",
                fontSize: "16px",
                cursor: "pointer",
                marginBottom: "16px",
              }}
            >
              {forgotLoading ? "Sending..." : "Send Reset Email"}
            </button>
            <button
              type="button"
              onClick={() => setForgotMode(false)}
              style={{
                width: "100%",
                padding: "12px",
                background: "transparent",
                color: "#c8a45f",
                border: "1px solid rgba(200,164,95,0.3)",
                borderRadius: "12px",
                cursor: "pointer",
                fontSize: "15px",
              }}
            >
              Back to Login
            </button>
          </form>
        ) : (
          <>
            {/* Google Sign In */}
            <button
              onClick={handleGoogle}
              disabled={googleLoading}
              style={{
                width: "100%",
                padding: "14px",
                background: "#fff",
                border: "none",
                borderRadius: "12px",
                fontWeight: "600",
                fontSize: "15px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "10px",
                color: "#333",
                marginBottom: "24px",
                boxShadow: "0 2px 10px rgba(0,0,0,0.2)",
                transition: "all 0.2s ease",
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              {googleLoading ? "Signing in..." : "Continue with Google"}
            </button>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                marginBottom: "24px",
              }}
            >
              <div
                style={{ flex: 1, height: "1px", background: "rgba(200,164,95,0.2)" }}
              />
              <span style={{ color: "#6b5040", fontSize: "13px" }}>
                or sign in with email
              </span>
              <div
                style={{ flex: 1, height: "1px", background: "rgba(200,164,95,0.2)" }}
              />
            </div>

            <form onSubmit={handleLogin}>
              {/* Email */}
              <div style={{ marginBottom: "16px" }}>
                <label
                  style={{
                    display: "block",
                    color: "#d4b896",
                    fontSize: "14px",
                    fontWeight: "600",
                    marginBottom: "8px",
                  }}
                >
                  Email Address
                </label>
                <div style={{ position: "relative" }}>
                  <Mail
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
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    style={{
                      width: "100%",
                      padding: "14px 14px 14px 44px",
                      background: "rgba(255,255,255,0.05)",
                      border: "1px solid rgba(200,164,95,0.3)",
                      borderRadius: "10px",
                      color: "#fff",
                      fontSize: "15px",
                    }}
                  />
                </div>
              </div>

              {/* Password */}
              <div style={{ marginBottom: "8px" }}>
                <label
                  style={{
                    display: "block",
                    color: "#d4b896",
                    fontSize: "14px",
                    fontWeight: "600",
                    marginBottom: "8px",
                  }}
                >
                  Password
                </label>
                <div style={{ position: "relative" }}>
                  <Lock
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
                    type={showPass ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    style={{
                      width: "100%",
                      padding: "14px 44px 14px 44px",
                      background: "rgba(255,255,255,0.05)",
                      border: "1px solid rgba(200,164,95,0.3)",
                      borderRadius: "10px",
                      color: "#fff",
                      fontSize: "15px",
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    style={{
                      position: "absolute",
                      right: "14px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      background: "none",
                      border: "none",
                      color: "#9a7a3f",
                      cursor: "pointer",
                      padding: 0,
                    }}
                  >
                    {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Forgot password */}
              <div style={{ textAlign: "right", marginBottom: "24px" }}>
                <button
                  type="button"
                  onClick={() => setForgotMode(true)}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#c8a45f",
                    cursor: "pointer",
                    fontSize: "13px",
                    fontWeight: "600",
                  }}
                >
                  Forgot Password?
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  width: "100%",
                  padding: "15px",
                  background: loading
                    ? "rgba(200,164,95,0.5)"
                    : "linear-gradient(135deg, #c8a45f, #e8c97a)",
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
                <LogIn size={18} />
                {loading ? "Signing in..." : "Sign In"}
              </button>
            </form>
          </>
        )}

        <div
          style={{
            textAlign: "center",
            marginTop: "24px",
            color: "#6b5040",
            fontSize: "14px",
          }}
        >
          Don&apos;t have an account?{" "}
          <Link
            href="/register"
            style={{ color: "#c8a45f", fontWeight: "600", textDecoration: "none" }}
          >
            Register here
          </Link>
        </div>
      </div>
    </div>
  );
}
