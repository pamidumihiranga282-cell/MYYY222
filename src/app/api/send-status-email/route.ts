import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

const ADMIN_EMAIL = "mrmshopping2025@gmail.com";

const STATUS_LABELS: Record<string, string> = {
  pending: "Order Pending",
  confirmed: "Order Confirmed",
  processing: "Processing",
  shipped: "Shipped 🚚",
  delivered: "Delivered ✅",
  cancelled: "Cancelled ❌",
};

export async function POST(req: NextRequest) {
  try {
    const { trackingNumber, customerName, customerEmail, status, message } = await req.json();

    if (!customerEmail) {
      return NextResponse.json({ error: "No customer email" }, { status: 400 });
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: ADMIN_EMAIL,
        pass: process.env.EMAIL_PASSWORD || "",
      },
    });

    const statusLabel = STATUS_LABELS[status] || status;
    const statusColor = status === "delivered" ? "#25d366" : status === "cancelled" ? "#ef4444" : "#c8a45f";

    const emailHtml = `
<!DOCTYPE html>
<html>
<body style="font-family:'Segoe UI',Arial,sans-serif;background:#fdf8f0;margin:0;padding:0;">
  <div style="max-width:600px;margin:0 auto;padding:20px;">
    <div style="background:linear-gradient(135deg,#1a0a00,#3d1c02);padding:30px;border-radius:16px 16px 0 0;text-align:center;">
      <div style="font-size:40px;margin-bottom:10px;">🛍</div>
      <h1 style="color:#e8c97a;font-family:Georgia,serif;margin:0;">MRM Shopping</h1>
    </div>
    <div style="background:#fff;padding:30px;border:1px solid rgba(200,164,95,0.2);">
      <h2 style="color:#1a0a00;margin:0 0 16px;">Order Update</h2>
      <p>Hello <strong>${customerName}</strong>,</p>
      <p>Your order <strong>${trackingNumber}</strong> has been updated.</p>
      
      <div style="background:${statusColor}15;border:2px solid ${statusColor};padding:20px;border-radius:12px;text-align:center;margin:20px 0;">
        <div style="color:${statusColor};font-size:24px;font-weight:700;">${statusLabel}</div>
      </div>
      
      <div style="background:#fdf8f0;padding:16px;border-radius:10px;margin:20px 0;">
        <strong>Message:</strong><br>
        <p style="color:#6b5040;margin:8px 0 0;">${message}</p>
      </div>
      
      <p>Track your order on our website using tracking number: <strong style="color:#c8a45f;font-family:monospace;">${trackingNumber}</strong></p>
      <p>Questions? Call us: <strong>070 707 0872</strong></p>
    </div>
    <div style="background:linear-gradient(135deg,#1a0a00,#3d1c02);padding:20px;border-radius:0 0 16px 16px;text-align:center;">
      <p style="color:#9a8070;margin:0;font-size:13px;">© 2025 MRM Shopping 🛍 | Anuradhapura, Sri Lanka</p>
    </div>
  </div>
</body>
</html>
    `;

    await transporter.sendMail({
      from: `"MRM Shopping 🛍" <${ADMIN_EMAIL}>`,
      to: customerEmail,
      subject: `Order Update: ${statusLabel} — ${trackingNumber}`,
      html: emailHtml,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Email error:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
