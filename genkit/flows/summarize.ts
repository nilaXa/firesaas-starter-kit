import { z } from "zod";
import { ai, MODELS } from "../ai";

export const summarizeInputSchema = z.object({
  text: z.string().min(1, "Input text cannot be empty"),
});

export const summarizeOutputSchema = z.object({
  summary: z.string(),
  wordCount: z.number(),
});

// Define the text summarization flow
export const summarizeTextFlow = ai.defineFlow(
  {
    name: "summarizeTextFlow",
    inputSchema: summarizeInputSchema,
    outputSchema: summarizeOutputSchema,
  },
  async (input) => {
    const response = await ai.generate({
      model: MODELS.text,
      prompt: `Summarize the following text in a concise and professional manner. Provide 2-3 key takeaways if relevant.\n\nText: ${input.text}`,
    });

    const summaryText = response.text;
    const wordCount = summaryText.split(/\s+/).filter(Boolean).length;

    return {
      summary: summaryText,
      wordCount,
    };
  },
);
