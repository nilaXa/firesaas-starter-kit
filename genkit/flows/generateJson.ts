import { z } from "zod";
import { ai, MODELS } from "../ai";

export const generateJsonInputSchema = z.object({
  prompt: z.string().min(1, "Input prompt cannot be empty"),
});

// Target output schema for the AI response
export const targetOutputSchema = z.object({
  category: z.string(),
  items: z.array(
    z.object({
      name: z.string(),
      description: z.string(),
      priority: z.enum(["high", "medium", "low"]),
      estimatedHours: z.number(),
    }),
  ),
});

// Define structured output flow
export const generateJsonFlow = ai.defineFlow(
  {
    name: "generateJsonFlow",
    inputSchema: generateJsonInputSchema,
    outputSchema: targetOutputSchema,
  },
  async (input) => {
    const response = await ai.generate({
      model: MODELS.text,
      prompt: `Generate a structured task list or roadmap based on the following request: ${input.prompt}`,
      output: {
        schema: targetOutputSchema,
      },
    });

    const parsed = response.output;
    if (!parsed) {
      throw new Error(
        "AI failed to generate output matching the required JSON schema.",
      );
    }

    return parsed;
  },
);
