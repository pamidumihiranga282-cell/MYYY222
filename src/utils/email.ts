import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import emailjs from '@emailjs/browser';

const getEmailSettings = async () => {
  try {
    const snap = await getDoc(doc(db, 'settings', 'site'));
    if (snap.exists()) {
      const data = snap.data();
      return {
        serviceId: data.emailjsServiceId || '',
        templateIdAdmin: data.emailjsTemplateIdAdmin || '',
        templateIdCustomer: data.emailjsTemplateIdCustomer || '',
        templateIdStatus: data.emailjsTemplateIdStatus || '',
        publicKey: data.emailjsPublicKey || '',
      };
    }
  } catch (e) {
    console.error('Error fetching email settings:', e);
  }
  return null;
};

export const sendOrderConfirmationToAdmin = async (order: any) => {
  try {
    const settings = await getEmailSettings();
    if (!settings || !settings.serviceId || !settings.templateIdAdmin || !settings.publicKey) {
      console.warn('EmailJS settings not configured. Skipping admin email.');
      return;
    }
    const templateParams = {
      to_email: 'mrmshopping2025@gmail.com',
      from_name: order.userName,
      order_id: order.id,
      tracking_number: order.trackingNumber,
      customer_name: order.userName,
      customer_email: order.userEmail,
      customer_phone: order.userPhone,
      items: order.items.map((i: any) => `${i.productName} x${i.quantity}`).join(', '),
      subtotal: `Rs. ${order.subtotal}`,
      delivery: `Rs. ${order.deliveryCharge}`,
      total: `Rs. ${order.total}`,
      address: `${order.shippingAddress.addressLine1}, ${order.shippingAddress.city}`,
    };
    await emailjs.send(settings.serviceId, settings.templateIdAdmin, templateParams, settings.publicKey);
    console.log('Admin confirmation email sent successfully via EmailJS');
  } catch (e) {
    console.error('EmailJS Admin Error:', e);
  }
};

export const sendOrderConfirmationToCustomer = async (order: any) => {
  try {
    const settings = await getEmailSettings();
    if (!settings || !settings.serviceId || !settings.templateIdCustomer || !settings.publicKey) {
      console.warn('EmailJS settings not configured. Skipping customer email.');
      return;
    }
    const templateParams = {
      to_email: order.userEmail,
      to_name: order.userName,
      order_id: order.id,
      tracking_number: order.trackingNumber,
      items: order.items.map((i: any) => `${i.productName} x${i.quantity}`).join(', '),
      total: `Rs. ${order.total}`,
      delivery_charge: `Rs. ${order.deliveryCharge}`,
    };
    await emailjs.send(settings.serviceId, settings.templateIdCustomer, templateParams, settings.publicKey);
    console.log('Customer confirmation email sent successfully via EmailJS');
  } catch (e) {
    console.error('EmailJS Customer Error:', e);
  }
};

export const sendOrderStatusUpdate = async (order: any) => {
  try {
    const settings = await getEmailSettings();
    if (!settings || !settings.serviceId || !settings.templateIdStatus || !settings.publicKey) {
      console.warn('EmailJS settings not configured. Skipping status update email.');
      return;
    }
    const statusMessages: Record<string, string> = {
      pending: 'Pending',
      confirmed: 'Confirmed',
      processing: 'Processing',
      shipped: 'Shipped',
      out_for_delivery: 'Out for Delivery',
      delivered: 'Delivered',
      cancelled: 'Cancelled',
    };
    const templateParams = {
      to_email: order.userEmail,
      to_name: order.userName,
      order_id: order.id,
      tracking_number: order.trackingNumber,
      status: statusMessages[order.status] || order.status,
      items: order.items.map((i: any) => `${i.productName} x${i.quantity}`).join(', '),
      total: `Rs. ${order.total}`,
    };
    await emailjs.send(settings.serviceId, settings.templateIdStatus, templateParams, settings.publicKey);
    console.log('Status update email sent successfully via EmailJS');
  } catch (e) {
    console.error('EmailJS Status Update Error:', e);
  }
};
