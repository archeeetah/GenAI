import { initializeApp, getApps } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase only if it hasn't been initialized and we have a valid API key
let app;
if (typeof window !== 'undefined' && !getApps().length) {
  app = initializeApp(firebaseConfig);
}

// Initialize Firebase Authentication and get a reference to the service
export const auth = app ? getAuth(app) : null;

// Initialize Google Auth Provider
export const googleProvider = app ? new GoogleAuthProvider() : null;
if (googleProvider) {
  googleProvider.setCustomParameters({
    prompt: 'select_account'
  });
}

// Initialize Cloud Firestore and get a reference to the service
export const db = app ? getFirestore(app) : null;

export default app;