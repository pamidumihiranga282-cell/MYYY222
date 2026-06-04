"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import {
  User,
  onAuthStateChanged,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  updateProfile,
} from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "./firebase";

interface UserData {
  uid: string;
  email: string;
  displayName: string;
  phone?: string;
  address?: string;
  role: "admin" | "customer";
  createdAt?: unknown;
  photoURL?: string;
}

interface AuthContextType {
  user: User | null;
  userData: UserData | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (
    email: string,
    password: string,
    name: string,
    phone?: string,
    address?: string
  ) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  refreshUserData: () => Promise<void>;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  const ADMIN_EMAIL = "mrmshopping2025@gmail.com";

  const fetchUserData = async (uid: string): Promise<UserData | null> => {
    try {
      const docRef = doc(db, "users", uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return docSnap.data() as UserData;
      }
      return null;
    } catch {
      return null;
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        const data = await fetchUserData(firebaseUser.uid);
        setUserData(data);
      } else {
        setUserData(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    const firebaseUser = result.user;
    const docRef = doc(db, "users", firebaseUser.uid);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) {
      const role = firebaseUser.email === ADMIN_EMAIL ? "admin" : "customer";
      const newUser: UserData = {
        uid: firebaseUser.uid,
        email: firebaseUser.email || "",
        displayName: firebaseUser.displayName || "",
        role,
        photoURL: firebaseUser.photoURL || "",
        createdAt: serverTimestamp(),
      };
      await setDoc(docRef, newUser);
      setUserData(newUser);
    } else {
      setUserData(docSnap.data() as UserData);
    }
  };

  const signInWithEmail = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
    const currentUser = auth.currentUser;
    if (currentUser) {
      const data = await fetchUserData(currentUser.uid);
      setUserData(data);
    }
  };

  const signUpWithEmail = async (
    email: string,
    password: string,
    name: string,
    phone?: string,
    address?: string
  ) => {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(result.user, { displayName: name });
    const role = email === ADMIN_EMAIL ? "admin" : "customer";
    const newUser: UserData = {
      uid: result.user.uid,
      email,
      displayName: name,
      phone: phone || "",
      address: address || "",
      role,
      createdAt: serverTimestamp(),
    };
    await setDoc(doc(db, "users", result.user.uid), newUser);
    setUserData(newUser);
  };

  const logout = async () => {
    await signOut(auth);
    setUserData(null);
  };

  const resetPassword = async (email: string) => {
    await sendPasswordResetEmail(auth, email);
  };

  const refreshUserData = async () => {
    if (user) {
      const data = await fetchUserData(user.uid);
      setUserData(data);
    }
  };

  const isAdmin = userData?.role === "admin";

  return (
    <AuthContext.Provider
      value={{
        user,
        userData,
        loading,
        signInWithGoogle,
        signInWithEmail,
        signUpWithEmail,
        logout,
        resetPassword,
        refreshUserData,
        isAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
