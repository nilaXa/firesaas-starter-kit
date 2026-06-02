"use server";

import { adminDb } from "@/firebase/admin";
import { FirestorePaths } from "@/firebase/firestore";
import { requireAuth } from "@/features/auth/server";
import { z } from "zod";
import { syncProfileInputSchema } from "./schema";

/**
 * Synchronizes the user profile in Firestore when a user signs up or logs in.
 * Prevents overwriting existing profiles.
 */
export async function syncUserProfile(payload: {
  uid?: string;
  email?: string;
  displayName?: string | null;
  photoURL?: string | null;
}) {
  const claims = await requireAuth();

  // Zod-validate optional profile fields
  const validated = z
    .object({
      displayName: z.string().nullable().optional(),
      photoURL: z.string().url().or(z.literal("")).nullable().optional(),
    })
    .parse({
      displayName: payload?.displayName,
      photoURL: payload?.photoURL,
    });

  const uid = claims.uid;
  const email = claims.email || "";
  const displayName = validated.displayName ?? null;
  const photoURL = validated.photoURL ?? null;

  const userRef = adminDb.doc(FirestorePaths.user(uid));
  const userSnap = await userRef.get();

  const now = new Date();

  // Create public profile if it doesn't exist
  if (!userSnap.exists) {
    const defaultProfile = {
      id: uid,
      email,
      displayName,
      photoURL,
      onboardingCompleted: false,
      createdAt: now,
      updatedAt: now,
    };

    await userRef.set(defaultProfile);

    // Create private metadata document
    const privateRef = adminDb.doc(FirestorePaths.privateUser(uid));
    await privateRef.set({
      id: uid,
      email,
      role: "user", // Default tier role
      createdAt: now,
      updatedAt: now,
    });

    console.log(`Created new Firestore profile for: ${email}`);
    return { success: true, created: true };
  } else {
    // If it already exists, update updatedAt to show recent login activity
    await userRef.update({ updatedAt: now });
    return { success: true, created: false };
  }
}

export async function updateUserProfile(data: unknown) {
  const claims = await requireAuth();

  // Validate input
  const validated = syncProfileInputSchema.parse(data);

  const userRef = adminDb.doc(FirestorePaths.user(claims.uid));
  const userSnap = await userRef.get();

  const now = new Date();

  if (!userSnap.exists) {
    // Initialize the base profile first, just like syncUserProfile
    const defaultProfile = {
      id: claims.uid,
      email: claims.email || "",
      displayName: validated.displayName || claims.name || null,
      photoURL: validated.photoURL || claims.picture || null,
      onboardingCompleted: false,
      timezone: validated.timezone || "UTC",
      locale: validated.locale || "en",
      createdAt: now,
      updatedAt: now,
    };
    await userRef.set(defaultProfile);

    // Create private metadata document
    const privateRef = adminDb.doc(FirestorePaths.privateUser(claims.uid));
    await privateRef.set({
      id: claims.uid,
      email: claims.email || "",
      role: "user", // Default tier role
      createdAt: now,
      updatedAt: now,
    });
  } else {
    // If it exists, update it
    const updateData = {
      ...validated,
      updatedAt: now,
    };
    await userRef.update(updateData);
  }

  return { success: true };
}
