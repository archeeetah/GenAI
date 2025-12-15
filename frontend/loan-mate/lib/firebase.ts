import { initializeApp, getApps } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: "genai-d1e91.firebaseapp.com",
  projectId: "genai-d1e91",
  storageBucket: "genai-d1e91.appspot.com",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase only if it hasn't been initialized and we have a valid API key
let app;
if (typeof window !== 'undefined' && !getApps().length && firebaseConfig.apiKey && firebaseConfig.apiKey !== 'your_api_key_here') {
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

export default app;