import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

const ADMIN_EMAIL = "mrmshopping2025@gmail.com";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      orderId,
      trackingNumber,
      customerName,
      customerEmail,
      customerPhone,
      shippingAddress,
      items,
      totalPrice,
      deliveryCharge,
      grandTotal,
      paymentMethod,
    } = body;

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: ADMIN_EMAIL,
        pass: process.env.EMAIL_PASSWORD || "",
      },
    });

    const itemsHtml = items
      .map(
        (item: { name: string; quantity: number; price: number }) =>
          `<tr>
            <td style="padding:8px;border-bottom:1px solid #f5ead8;">${item.name}</td>
            <td style="padding:8px;border-bottom:1px solid #f5ead8;text-align:center;">${item.quantity}</td>
            <td style="padding:8px;border-bottom:1px solid #f5ead8;text-align:right;">Rs. ${(item.price * item.quantity).toLocaleString()}</td>
          </tr>`
      )
      .join("");

    const emailHtml = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Order Confirmation</title></head>
<body style="font-family:'Segoe UI',Arial,sans-serif;background:#fdf8f0;margin:0;padding:0;">
  <div style="max-width:600px;margin:0 auto;padding:20px;">
    <div style="background:linear-gradient(135deg,#1a0a00,#3d1c02);padding:30px;border-radius:16px 16px 0 0;text-align:center;">
      <div style="font-size:40px;margin-bottom:10px;">🛍</div>
      <h1 style="color:#e8c97a;font-family:Georgia,serif;margin:0;font-size:28px;">MRM Shopping</h1>
      <p style="color:#c8a45f;margin:8px 0 0;font-size:13px;letter-spacing:2px;">DUBAI LUXURY</p>
    </div>
    <div style="background:#fff;padding:30px;border:1px solid rgba(200,164,95,0.2);">
      <h2 style="color:#1a0a00;font-family:Georgia,serif;margin:0 0 16px;">Order Confirmed! 🎉</h2>
      <p style="color:#6b5040;">Hello <strong>${customerName}</strong>, thank you for your order!</p>
      
      <div style="background:linear-gradient(135deg,#c8a45f,#e8c97a);padding:16px;border-radius:10px;margin:20px 0;text-align:center;">
        <div style="color:#3d1c02;font-size:12px;font-weight:700;letter-spacing:1px;">TRACKING NUMBER</div>
        <div style="color:#1a0a00;font-size:24px;font-weight:700;font-family:monospace;letter-spacing:3px;">${trackingNumber}</div>
      </div>
      
      <div style="background:#fdf8f0;padding:16px;border-radius:10px;margin:20px 0;">
        <table style="width:100%;border-collapse:collapse;">
          <thead>
            <tr style="border-bottom:2px solid rgba(200,164,95,0.3);">
              <th style="padding:8px;text-align:left;color:#9a7a3f;font-size:13px;">Product</th>
              <th style="padding:8px;text-align:center;color:#9a7a3f;font-size:13px;">Qty</th>
              <th style="padding:8px;text-align:right;color:#9a7a3f;font-size:13px;">Amount</th>
            </tr>
          </thead>
          <tbody>${itemsHtml}</tbody>
        </table>
        <div style="border-top:2px solid rgba(200,164,95,0.3);margin-top:8px;padding-top:8px;">
          <div style="display:flex;justify-content:space-between;margin-bottom:4px;font-size:14px;color:#6b5040;">
            <span>Subtotal:</span><span>Rs. ${totalPrice?.toLocaleString()}</span>
          </div>
          <div style="display:flex;justify-content:space-between;margin-bottom:4px;font-size:14px;color:#6b5040;">
            <span>Delivery:</span><span>Rs. ${deliveryCharge}</span>
          </div>
          <div style="display:flex;justify-content:space-between;font-size:18px;font-weight:700;color:#1a0a00;margin-top:8px;">
            <span>Total:</span><span>Rs. ${grandTotal?.toLocaleString()}</span>
          </div>
        </div>
      </div>
      
      <div style="background:#fdf8f0;padding:16px;border-radius:10px;margin-bottom:20px;">
        <div style="margin-bottom:8px;"><strong style="color:#1a0a00;">📍 Delivery Address:</strong><br><span style="color:#6b5040;">${shippingAddress}</span></div>
        <div style="margin-bottom:8px;"><strong style="color:#1a0a00;">📞 Phone:</strong> <span style="color:#6b5040;">${customerPhone}</span></div>
        <div><strong style="color:#1a0a00;">💳 Payment:</strong> <span style="color:#6b5040;">${paymentMethod === "cash" ? "Cash on Delivery" : "Bank Transfer"}</span></div>
      </div>
      
      <p style="color:#6b5040;font-size:14px;">Track your order at any time using your tracking number on our website.</p>
      <p style="color:#6b5040;font-size:14px;">Questions? Call us: <strong>070 707 0872</strong></p>
    </div>
    <div style="background:linear-gradient(135deg,#1a0a00,#3d1c02);padding:20px;border-radius:0 0 16px 16px;text-align:center;">
      <p style="color:#9a8070;margin:0;font-size:13px;">© 2025 MRM Shopping 🛍 | Anuradhapura, Sri Lanka</p>
    </div>
  </div>
</body>
</html>
    `;

    // Send to customer
    if (customerEmail) {
      await transporter.sendMail({
        from: `"MRM Shopping 🛍" <${ADMIN_EMAIL}>`,
        to: customerEmail,
        subject: `Order Confirmed! Tracking: ${trackingNumber} — MRM Shopping`,
        html: emailHtml,
      });
    }

    // Send to admin
    await transporter.sendMail({
      from: `"MRM Shopping Orders" <${ADMIN_EMAIL}>`,
      to: ADMIN_EMAIL,
      subject: `🛍 New Order Received! — ${trackingNumber}`,
      html: `
        <h2>New Order Received!</h2>
        <p><strong>Order ID:</strong> ${orderId}</p>
        <p><strong>Tracking:</strong> ${trackingNumber}</p>
        <p><strong>Customer:</strong> ${customerName} (${customerEmail})</p>
        <p><strong>Phone:</strong> ${customerPhone}</p>
        <p><strong>Address:</strong> ${shippingAddress}</p>
        <p><strong>Total:</strong> Rs. ${grandTotal?.toLocaleString()}</p>
        <p><strong>Payment:</strong> ${paymentMethod}</p>
        <p><a href="${process.env.NEXT_PUBLIC_SITE_URL || ""}/admin/orders">View in Admin Panel</a></p>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Email error:", error);
    return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
  }
}
