// Email notification utility
// Using EmailJS - configure your service at emailjs.com
// For now we'll implement via fetch/mailto as a fallback

export const sendOrderConfirmationToAdmin = async (order: any) => {
  try {
    // EmailJS integration
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
    console.log('Admin notification:', templateParams);
  } catch (e) {
    console.error('Email error:', e);
  }
};

export const sendOrderConfirmationToCustomer = async (order: any) => {
  try {
    const templateParams = {
      to_email: order.userEmail,
      to_name: order.userName,
      order_id: order.id,
      tracking_number: order.trackingNumber,
      items: order.items.map((i: any) => `${i.productName} x${i.quantity}`).join(', '),
      total: `Rs. ${order.total}`,
      delivery_charge: `Rs. ${order.deliveryCharge}`,
    };
    console.log('Customer notification:', templateParams);
  } catch (e) {
    console.error('Email error:', e);
  }
};

export const sendOrderStatusUpdate = async (order: any) => {
  try {
    console.log('Status update notification for order:', order.trackingNumber, 'Status:', order.status);
  } catch (e) {
    console.error('Email error:', e);
  }
};
