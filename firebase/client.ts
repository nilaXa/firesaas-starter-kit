import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { getStorage, connectStorageEmulator } from "firebase/storage";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase App for Client side (preventing multiple initialization during HMR)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Connect to Firebase Emulators when running locally in development mode
const isLocal =
  typeof window !== "undefined" && window.location.hostname === "localhost";
let emulatorsInitialized = false;

if (
  process.env.NODE_ENV === "development" &&
  isLocal &&
  !emulatorsInitialized
) {
  emulatorsInitialized = true;
  try {
    connectAuthEmulator(auth, "http://localhost:9099", {
      disableWarnings: true,
    });
    console.log("Connected to Firebase Auth Emulator");
  } catch (err) {
    console.warn("Firebase Auth Emulator connection warning:", err);
  }

  try {
    connectFirestoreEmulator(db, "localhost", 8080);
    console.log("Connected to Firestore Emulator");
  } catch (err) {
    console.warn("Firestore Emulator connection warning:", err);
  }

  try {
    connectStorageEmulator(storage, "localhost", 9199);
    console.log("Connected to Firebase Storage Emulator");
  } catch (err) {
    console.warn("Firebase Storage Emulator connection warning:", err);
  }
}

export { app, auth, db, storage };
export default app;
