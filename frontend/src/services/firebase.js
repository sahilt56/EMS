import { initializeApp } from 'firebase/app';
import * as authSdk from 'firebase/auth';

const apiKeyValue = import.meta.env.VITE_FIREBASE_API_KEY;
const isAuthActive = !!(apiKeyValue && !apiKeyValue.startsWith('your-'));

let app;
let auth;
let googleProvider;

if (isAuthActive) {
  try {
    app = initializeApp({
      apiKey: apiKeyValue,
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
      storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
      appId: import.meta.env.VITE_FIREBASE_APP_ID
    });
    auth = authSdk.getAuth(app);
    googleProvider = new authSdk.GoogleAuthProvider();
  } catch (error) {
    console.error('Firebase Client SDK failed to initialize:', error);
  }
} else {
  console.warn(
    '[Firebase Service]: VITE_FIREBASE_API_KEY is not defined. Firebase Authentication is disabled. Please create a frontend/.env file.'
  );
}

// Wrapper to safely listen for auth changes
export const onAuthChanged = (callback) => {
  if (isAuthActive && auth) {
    return authSdk.onAuthStateChanged(auth, callback);
  }
  callback(null);
  return () => {};
};

// Wrapper for email sign-up
export const signUpUser = (email, password) => {
  if (isAuthActive && auth) {
    return authSdk.createUserWithEmailAndPassword(auth, email, password);
  }
  return Promise.reject(new Error('Firebase Auth is disabled (API Key is missing).'));
};

// Wrapper for email login
export const signInUser = (email, password) => {
  if (isAuthActive && auth) {
    return authSdk.signInWithEmailAndPassword(auth, email, password);
  }
  return Promise.reject(new Error('Firebase Auth is disabled (API Key is missing).'));
};

// Wrapper for Google login popup
export const signInGoogle = () => {
  if (isAuthActive && auth) {
    return authSdk.signInWithPopup(auth, googleProvider);
  }
  return Promise.reject(new Error('Firebase Auth is disabled (API Key is missing).'));
};

// Wrapper for logout
export const signOutUser = () => {
  if (isAuthActive && auth) {
    return authSdk.signOut(auth);
  }
  return Promise.resolve();
};

export default app;
