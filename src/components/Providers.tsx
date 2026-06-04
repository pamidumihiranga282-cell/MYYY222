"use client";

import { AuthProvider } from "@/lib/auth-context";
import { CartProvider } from "@/lib/cart-context";
import { Toaster } from "react-hot-toast";
import Navbar from "./Navbar";
import Footer from "./Footer";
import WhatsAppFloat from "./WhatsAppFloat";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <CartProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: "#1a0a00",
              color: "#e8c97a",
              border: "1px solid #c8a45f",
              borderRadius: "12px",
              fontWeight: "500",
            },
          }}
        />
        <Navbar />
        <main>{children}</main>
        <Footer />
        <WhatsAppFloat />
      </CartProvider>
    </AuthProvider>
  );
}
