import { cookies } from "next/headers";
import { adminAuth, adminDb } from "@/firebase/admin";
import { FirestorePaths, firestoreConverter } from "@/firebase/firestore";

export interface UserProfile {
  id: string;
  email: string;
  displayName: string | null;
  photoURL: string | null;
  defaultOrganizationId?: string;
  onboardingCompleted: boolean;
  createdAt: unknown;
  updatedAt: unknown;
}

/**
 * Gets the current verified user claims from the __session cookie.
 * Throws an error or returns null if not authenticated.
 */
export async function getCurrentUser() {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("__session")?.value;

    if (!sessionCookie) {
      return null;
    }

    const decodedClaims = await adminAuth.verifyIdToken(sessionCookie);
    return decodedClaims;
  } catch (error) {
    console.error("Error verifying admin token session:", error);
    return null;
  }
}

/**
 * Fetches the public user profile from Firestore.
 */
export async function getUserProfile(
  userId: string,
): Promise<UserProfile | null> {
  const docRef = adminDb
    .doc(FirestorePaths.user(userId))
    .withConverter(firestoreConverter<UserProfile>());

  const docSnap = await docRef.get();

  if (!docSnap.exists) {
    return null;
  }

  return docSnap.data() || null;
}

/**
 * Helper to require authentication, throwing if not signed in.
 */
export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Unauthorized access. User must be signed in.");
  }
  return user;
}
