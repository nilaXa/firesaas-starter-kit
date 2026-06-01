import * as admin from "firebase-admin";

function getAdminApp() {
  if (admin.apps.length > 0) {
    return admin.apps[0]!;
  }

  const projectId =
    process.env.FIREBASE_PROJECT_ID ||
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY;

  // If local emulators are active, or we are running in development,
  // or we are in the Next.js build phase, we can initialize without strict credentials.
  const isEmulator =
    process.env.FIREBASE_AUTH_EMULATOR_HOST ||
    process.env.FIRESTORE_EMULATOR_HOST ||
    process.env.FIREBASE_STORAGE_EMULATOR_HOST ||
    process.env.NODE_ENV === "development" ||
    process.env.NEXT_PHASE === "phase-production-build";

  if (isEmulator) {
    // Programmatically fallback to emulator hosts in development to prevent Admin SDK
    // from attempting to reach production and throwing credential or "kid" claim errors.
    if (process.env.NODE_ENV === "development") {
      if (!process.env.FIREBASE_AUTH_EMULATOR_HOST) {
        process.env.FIREBASE_AUTH_EMULATOR_HOST = "127.0.0.1:9099";
      }
      if (!process.env.FIRESTORE_EMULATOR_HOST) {
        process.env.FIRESTORE_EMULATOR_HOST = "127.0.0.1:8080";
      }
      if (!process.env.FIREBASE_STORAGE_EMULATOR_HOST) {
        process.env.FIREBASE_STORAGE_EMULATOR_HOST = "127.0.0.1:9199";
      }
    }
    return admin.initializeApp({
      projectId: projectId || "demo-fire-saas",
    });
  }

  // Production initialization
  if (!projectId || !clientEmail || !privateKey) {
    throw new Error(
      "Missing Firebase Admin credentials. Provide FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY.",
    );
  }

  try {
    return admin.initializeApp({
      credential: admin.credential.cert({
        projectId,
        clientEmail,
        privateKey: privateKey.replace(/\\n/g, "\n"),
      }),
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    });
  } catch (error) {
    console.error(
      "Failed to initialize Firebase Admin with production certificate:",
      error,
    );
    // If this is a mock/invalid private key in non-dev, let it fall back in non-production builds
    if (process.env.NODE_ENV !== "production") {
      console.warn("Falling back to uncredentialed Firebase Admin app.");
      return admin.initializeApp({
        projectId,
      });
    }
    throw error;
  }
}

const adminApp = getAdminApp();
const adminAuth = admin.auth(adminApp);
const adminDb = admin.firestore(adminApp);
const adminStorage = admin.storage(adminApp);

export { adminApp, adminAuth, adminDb, adminStorage };
