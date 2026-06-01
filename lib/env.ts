import { z } from "zod";

const clientEnvSchema = z.object({
  NEXT_PUBLIC_APP_NAME: z.string().default("FireSaaS"),
  NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),

  // Firebase Client SDK configs
  NEXT_PUBLIC_FIREBASE_API_KEY: z
    .string()
    .min(1, "Firebase API Key is required"),
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: z
    .string()
    .min(1, "Firebase Auth Domain is required"),
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: z
    .string()
    .min(1, "Firebase Project ID is required"),
  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: z
    .string()
    .min(1, "Firebase Storage Bucket is required"),
  NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: z
    .string()
    .min(1, "Firebase Messaging Sender ID is required"),
  NEXT_PUBLIC_FIREBASE_APP_ID: z.string().min(1, "Firebase App ID is required"),

  // Stripe Client Config (Optional)
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().optional(),
});

const serverEnvSchema = clientEnvSchema.extend({
  // Firebase Admin SDK configs (Optional locally if emulators are active, but required in prod)
  FIREBASE_PROJECT_ID: z
    .string()
    .min(1, "Firebase Admin Project ID is required")
    .optional(),
  FIREBASE_CLIENT_EMAIL: z
    .string()
    .email("Firebase Client Email must be a valid email")
    .optional(),
  FIREBASE_PRIVATE_KEY: z
    .string()
    .min(1, "Firebase Private Key is required")
    .optional(),

  // Admin emails comma-separated
  ADMIN_EMAILS: z.string().default(""),

  // Genkit and AI Models
  GENKIT_ENV: z.enum(["dev", "prod"]).default("dev"),
  GOOGLE_GENAI_API_KEY: z.string().optional(), // optional locally if emulating, but needed for Gemini API
  AI_TEXT_MODEL: z.string().default("googleai/gemini-3.5-flash"),
  AI_REASONING_MODEL: z.string().default("googleai/gemini-3.5-flash"),
  AI_EMBEDDING_MODEL: z.string().default("googleai/gemini-embedding-2"),

  // Stripe Secret Configs (Optional)
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
});

// Helper function to extract and format Zod errors
function formatErrors(
  errors: z.ZodFormattedError<Map<string, string>, string>,
) {
  return Object.entries(errors)
    .map(([name, value]) => {
      if (value && "_errors" in value) {
        return `${name}: ${value._errors.join(", ")}`;
      }
      return null;
    })
    .filter(Boolean)
    .join("\n");
}

export function validateEnv() {
  const isServer = typeof window === "undefined";

  if (isServer) {
    // Validate both server and client variables on the server
    const parsed = serverEnvSchema.safeParse(process.env);
    if (!parsed.success) {
      console.error(
        "❌ Invalid server environment variables:\n",
        formatErrors(parsed.error.format()),
      );
      throw new Error("Invalid environment variables. See logs above.");
    }
    return parsed.data;
  } else {
    // Validate only client-safe variables on the client
    const clientEnv = {
      NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME,
      NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
      NEXT_PUBLIC_FIREBASE_API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN:
        process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      NEXT_PUBLIC_FIREBASE_PROJECT_ID:
        process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET:
        process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID:
        process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      NEXT_PUBLIC_FIREBASE_APP_ID: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
      NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY:
        process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
    };

    const parsed = clientEnvSchema.safeParse(clientEnv);
    if (!parsed.success) {
      console.error(
        "❌ Invalid client environment variables:\n",
        formatErrors(parsed.error.format()),
      );
      throw new Error(
        "Invalid client environment variables. See browser console.",
      );
    }
    return parsed.data;
  }
}

// Export a single validated environment object
// Note: In Next.js App Router, env is validated dynamically.
export const env = validateEnv();
export type EnvType = z.infer<typeof serverEnvSchema>;
