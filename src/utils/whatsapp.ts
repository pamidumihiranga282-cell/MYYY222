import { Order } from '../types';

export const getWhatsAppMessage = (order: Order): string => {
  const sinhala = `🍫 *MRM Shopping - ඔබේ ඇණවුම තහවුරු කරන ලදී!*\n\nනම: ${order.userName}\nඇණවුම් අංකය: #${order.trackingNumber}\nමුළු මිල: Rs. ${order.total.toLocaleString()}\nදිවිරුම් ගාස්තු: Rs. ${order.deliveryCharge}\n\nඅපි ඉක්මනින් ඔබේ ඇණවුම ලබා දෙන්නෙමු! ස්තූතියි! 🙏`;

  const english = `\n\n🍫 *MRM Shopping - Order Confirmed!*\n\nHello ${order.userName}!\nOrder ID: #${order.trackingNumber}\nItems: ${order.items.map(i => `${i.productName} x${i.quantity}`).join(', ')}\nSubtotal: Rs. ${order.subtotal.toLocaleString()}\nDelivery: Rs. ${order.deliveryCharge}\nTotal: Rs. ${order.total.toLocaleString()}\n\nTrack your order at: ${window.location.origin}/tracking\nEnter tracking number: ${order.trackingNumber}\n\nThank you for shopping with MRM Shopping! 🎉`;

  return sinhala + english;
};

export const openWhatsAppPopup = (phone: string, message: string): string => {
  const encoded = encodeURIComponent(message);
  const url = `https://wa.me/${phone.replace(/\D/g, '')}?text=${encoded}`;
  return url;
};

export const getStatusUpdateMessage = (order: Order): string => {
  const statusMessages: Record<string, string> = {
    confirmed: 'ඔබේ ඇණවුම තහවුරු කරන ලදී / Your order has been confirmed',
    processing: 'ඔබේ ඇණවුම සකස් කරමින් ඇත / Your order is being processed',
    shipped: 'ඔබේ ඇණවුම යවා ඇත / Your order has been shipped',
    out_for_delivery: 'ඔබේ ඇණවුම දිවිරුම් ගමනේ ඇත / Your order is out for delivery',
    delivered: 'ඔබේ ඇණවුම ලැබී ඇත / Your order has been delivered',
    cancelled: 'ඔබේ ඇණවුම අවලංගු කරන ලදී / Your order has been cancelled',
  };

  return `🍫 *MRM Shopping - Order Update*\n\nOrder #${order.trackingNumber}\n${statusMessages[order.status] || order.status}\n\nTrack at: ${window.location.origin}/tracking`;
};
