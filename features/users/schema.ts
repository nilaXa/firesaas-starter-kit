import { z } from "zod";

export const userProfileSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  displayName: z.string().nullable().optional(),
  photoURL: z.string().url().nullable().optional(),
  defaultOrganizationId: z.string().optional(),
  onboardingCompleted: z.boolean().default(false),
});

export const syncProfileInputSchema = z.object({
  displayName: z.string().min(1, "Name is required").optional(),
  photoURL: z.string().url("Invalid photo URL").optional(),
  timezone: z.string().optional(),
  locale: z.string().optional(),
});

export type UserProfileInput = z.infer<typeof userProfileSchema>;
export type SyncProfileInput = z.infer<typeof syncProfileInputSchema>;
