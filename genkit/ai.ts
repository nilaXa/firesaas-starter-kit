import { genkit } from "genkit";
import { googleAI } from "@genkit-ai/google-genai";

// Initialize Genkit with Google AI plugin
// GOOGLE_GENAI_API_KEY will be automatically picked up from process.env
export const ai = genkit({
  plugins: [
    googleAI({
      apiKey: process.env.GOOGLE_GENAI_API_KEY,
    }),
  ],
});

// Helper to select the configured models
export const MODELS = {
  text: process.env.AI_TEXT_MODEL || "googleai/gemini-3.5-flash",
  reasoning: process.env.AI_REASONING_MODEL || "googleai/gemini-3.5-flash",
};
