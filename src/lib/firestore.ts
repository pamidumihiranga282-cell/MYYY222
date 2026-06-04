import {
  collection,
  doc,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  getDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  limit,
} from "firebase/firestore";
import { db } from "./firebase";
import type { Product, Order, SpecialOffer, SiteSettings, ContactMessage, StatusUpdate } from "./types";

// ─── Products ───────────────────────────────────────────────
export async function getProducts(): Promise<Product[]> {
  const snap = await getDocs(
    query(collection(db, "products"), orderBy("createdAt", "desc"))
  );
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Product));
}

export async function getProduct(id: string): Promise<Product | null> {
  const snap = await getDoc(doc(db, "products", id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as Product;
}

export async function addProduct(product: Omit<Product, "id" | "createdAt" | "updatedAt">): Promise<string> {
  const ref = await addDoc(collection(db, "products"), {
    ...product,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updateProduct(id: string, data: Partial<Product>): Promise<void> {
  await updateDoc(doc(db, "products", id), {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteProduct(id: string): Promise<void> {
  await deleteDoc(doc(db, "products", id));
}

export async function getFeaturedProducts(): Promise<Product[]> {
  const snap = await getDocs(
    query(collection(db, "products"), where("featured", "==", true), limit(8))
  );
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Product));
}

// ─── Orders ────────────────────────────────────────────────
export async function createOrder(order: Omit<Order, "id" | "createdAt" | "updatedAt">): Promise<string> {
  const ref = await addDoc(collection(db, "orders"), {
    ...order,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function getOrder(id: string): Promise<Order | null> {
  const snap = await getDoc(doc(db, "orders", id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as Order;
}

export async function getOrderByTracking(trackingNumber: string): Promise<Order | null> {
  const snap = await getDocs(
    query(collection(db, "orders"), where("trackingNumber", "==", trackingNumber))
  );
  if (snap.empty) return null;
  const d = snap.docs[0];
  return { id: d.id, ...d.data() } as Order;
}

export async function getUserOrders(userId: string): Promise<Order[]> {
  const snap = await getDocs(
    query(
      collection(db, "orders"),
      where("userId", "==", userId),
      orderBy("createdAt", "desc")
    )
  );
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Order));
}

export async function getAllOrders(): Promise<Order[]> {
  const snap = await getDocs(
    query(collection(db, "orders"), orderBy("createdAt", "desc"))
  );
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Order));
}

export async function updateOrderStatus(
  orderId: string,
  status: Order["status"],
  message: string,
  updatedBy: string
): Promise<void> {
  const orderRef = doc(db, "orders", orderId);
  const orderSnap = await getDoc(orderRef);
  if (!orderSnap.exists()) throw new Error("Order not found");

  const orderData = orderSnap.data() as Order;
  const newHistory: StatusUpdate = {
    status,
    message,
    timestamp: serverTimestamp(),
    updatedBy,
  };

  await updateDoc(orderRef, {
    status,
    statusHistory: [...(orderData.statusHistory || []), newHistory],
    updatedAt: serverTimestamp(),
  });
}

// ─── Special Offers ─────────────────────────────────────────
export async function getSpecialOffers(): Promise<SpecialOffer[]> {
  const snap = await getDocs(
    query(collection(db, "specialOffers"), where("active", "==", true))
  );
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as SpecialOffer));
}

export async function getAllSpecialOffers(): Promise<SpecialOffer[]> {
  const snap = await getDocs(collection(db, "specialOffers"));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as SpecialOffer));
}

export async function addSpecialOffer(offer: Omit<SpecialOffer, "id" | "createdAt">): Promise<string> {
  const ref = await addDoc(collection(db, "specialOffers"), {
    ...offer,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updateSpecialOffer(id: string, data: Partial<SpecialOffer>): Promise<void> {
  await updateDoc(doc(db, "specialOffers", id), data);
}

export async function deleteSpecialOffer(id: string): Promise<void> {
  await deleteDoc(doc(db, "specialOffers", id));
}

// ─── Site Settings ──────────────────────────────────────────
export async function getSiteSettings(): Promise<SiteSettings> {
  const snap = await getDoc(doc(db, "settings", "site"));
  if (!snap.exists()) {
    return defaultSettings;
  }
  return snap.data() as SiteSettings;
}

export async function updateSiteSettings(settings: Partial<SiteSettings>): Promise<void> {
  await setDoc(doc(db, "settings", "site"), settings, { merge: true });
}

const defaultSettings: SiteSettings = {
  heroTitle: "Authentic Dubai & Buibai Chocolates",
  heroSubtitle: "Premium luxury chocolates & products delivered to your door",
  aboutText: "MRM Shopping brings you the finest Dubai chocolates and luxury products.",
  phone: "070 707 0872",
  address: "Anuradhapura",
  email: "mrmshopping2025@gmail.com",
  whatsapp: "0707070872",
  deliveryInfo: "Delivery charge: Rs.150 to Rs.450 (up to 1kg)",
  bannerActive: false,
  bannerColor: "#c8a45f",
};

// ─── Contact Messages ────────────────────────────────────────
export async function addContactMessage(msg: Omit<ContactMessage, "id" | "createdAt" | "read">): Promise<string> {
  const ref = await addDoc(collection(db, "contactMessages"), {
    ...msg,
    read: false,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export async function getAllContactMessages(): Promise<ContactMessage[]> {
  const snap = await getDocs(
    query(collection(db, "contactMessages"), orderBy("createdAt", "desc"))
  );
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as ContactMessage));
}

export async function markMessageRead(id: string): Promise<void> {
  await updateDoc(doc(db, "contactMessages", id), { read: true });
}

// ─── Users ──────────────────────────────────────────────────
export async function getAllUsers() {
  const snap = await getDocs(collection(db, "users"));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function updateUser(uid: string, data: Record<string, unknown>): Promise<void> {
  await updateDoc(doc(db, "users", uid), data);
}

export async function deleteUser(uid: string): Promise<void> {
  await deleteDoc(doc(db, "users", uid));
}
