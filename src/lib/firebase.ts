import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBoD5r0uj_AsPvzLvTvhSnvTs9HTy6Q_28",
  authDomain: "mrm-shopping.firebaseapp.com",
  projectId: "mrm-shopping",
  storageBucket: "mrm-shopping.firebasestorage.app",
  messagingSenderId: "437910659349",
  appId: "1:437910659349:web:bcd2d352a1efa40ac4491c",
  measurementId: "G-BQQT9V9BXY",
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export default app;
