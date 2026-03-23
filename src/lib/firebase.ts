import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, User } from 'firebase/auth';
import { getFirestore, collection, doc, setDoc, getDoc, getDocs, query, where, onSnapshot, addDoc, updateDoc, deleteDoc, Timestamp, getDocFromServer } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const googleProvider = new GoogleAuthProvider();

// Error Handling Spec for Firestore Operations
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | null | undefined;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Auth Helpers
export const loginWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    console.error('Login Error:', error);
    throw error;
  }
};

export const logout = () => signOut(auth);

// Connection Test
export async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if(error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Please check your Firebase configuration. ");
    }
  }
}

// Types
export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  currency: string;
  createdAt: any;
}

export interface Entry {
  id?: string;
  type: 'income' | 'expense' | 'savings' | 'investment';
  amount: number;
  category: string;
  group: 'needs' | 'wants' | 'growth' | 'income' | 'other';
  date: any;
  note?: string;
  tags?: string[];
  isRegret?: boolean;
  isImpulse?: boolean;
  impulseReason?: string;
  createdAt: any;
}

export interface Goal {
  id?: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  deadline: any;
  status: 'active' | 'completed' | 'cancelled';
  createdAt: any;
}

export interface Reflection {
  id?: string;
  period: 'daily' | 'weekly' | 'monthly';
  date: any;
  q1?: string;
  q2?: string;
  q3?: string;
  createdAt: any;
}

export interface Subscription {
  id?: string;
  name: string;
  amount: number;
  frequency: 'monthly' | 'yearly';
  category?: string;
  nextBillingDate?: any;
  createdAt: any;
}

export interface Scorecard {
  id?: string;
  discipline: number;
  consistency: number;
  awareness: number;
  date: any;
}
