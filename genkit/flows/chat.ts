import { z } from "zod";
import { ai, MODELS } from "../ai";

export const chatInputSchema = z.object({
  message: z.string().min(1, "Message cannot be empty"),
  history: z
    .array(
      z.object({
        role: z.enum(["user", "model"]),
        content: z.string(),
      }),
    )
    .optional(),
});

export const chatOutputSchema = z.object({
  reply: z.string(),
});

// Define chat assistant flow
export const chatAssistantFlow = ai.defineFlow(
  {
    name: "chatAssistantFlow",
    inputSchema: chatInputSchema,
    outputSchema: chatOutputSchema,
  },
  async (input) => {
    // Map history to Genkit format
    const messages = (input.history || []).map((h) => ({
      role: h.role,
      content: [{ text: h.content }],
    }));

    // Append the new message
    messages.push({
      role: "user",
      content: [{ text: input.message }],
    });

    const response = await ai.generate({
      model: MODELS.text,
      messages,
      system:
        "You are the FireSaaS SaaS chatbot assistant. Help developers understand how to build apps with Firebase, Next.js, and Genkit.",
    });

    return {
      reply: response.text,
    };
  },
);
