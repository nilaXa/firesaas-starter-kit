# Genkit AI Integration Guide

This guide explains the integration of **Firebase Genkit** for AI orchestration and model routing within the FireSaaS Starter Kit.

---

## 1. Genkit Architecture Overview

We use Genkit to build structured, type-safe, and self-documenting AI workflows. Our AI module is split into three layers:

1. **Configuration (`genkit/ai.ts`)**: Initializes Genkit with the Google AI plugin.
2. **Flow Definitions (`genkit/flows/`)**: Declarative flows using input/output Zod schemas.
3. **Execution & Logger Action (`features/ai/actions.ts`)**: Coordinates executions, handles errors, computes cost telemetry, and logs records to Firestore.

---

## 2. Configured AI Flows

We include three core Genkit workflows in this starter kit:

### A. Article Text Summarizer (`genkit/flows/summarize.ts`)

- **Input Schema**: `{ text: string }`
- **Output Schema**: `{ summary: string, wordCount: number }`
- **Purpose**: Generates short professional summaries.

### B. Structured JSON Generator (`genkit/flows/generateJson.ts`)

- **Input Schema**: `{ prompt: string }`
- **Output Schema**:
  ```ts
  z.object({
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
  ```
- **Purpose**: Demonstrates structured JSON response parsing directly from Gemini model outputs.

### C. Conversational Chat Assistant (`genkit/flows/chat.ts`)

- **Input Schema**: `{ message: string, history?: Array<{ role: 'user' | 'model', content: string }> }`
- **Output Schema**: `{ reply: string }`
- **Purpose**: Provides conversational capabilities, parsing history arrays.

---

## 3. Invoking Flows from Next.js Server Actions

In Next.js App Router, we run Genkit flows inside Server Actions. This secures our Gemini API key (`GOOGLE_GENAI_API_KEY`) on the server.

Example execution from `features/ai/actions.ts`:

```ts
import { summarizeTextFlow } from "@/genkit/flows/summarize";

export async function runSummarizer(orgId: string, text: string) {
  // 1. Verify user is in workspace
  await checkMembership(orgId);

  // 2. Call the Genkit flow function directly
  const result = await summarizeTextFlow({ text });

  // 3. Log usage metrics to Firestore
  await logUsage(orgId, "summarize", result);

  return result;
}
```

---

## 4. Usage Metrics & Cost Calculation

To help SaaS startups monitor Gemini API costs, our execution action tracks token usage. We use character-based token estimates (1 token ≈ 4 characters) to calculate estimated costs:

- **Gemini 2.5 Flash Pricing (Estimated)**:
  - Input: **$0.075 / 1,000,000 tokens**
  - Output: **$0.30 / 1,000,000 tokens**
- **Calculation in Action**:
  ```ts
  const inputTokens = Math.max(1, Math.round(inputLength / 4));
  const outputTokens = Math.max(1, Math.round(outputLength / 4));
  const estimatedCost = inputTokens * 0.000000075 + outputTokens * 0.0000003;
  ```

This telemetry is written to `organizations/{orgId}/aiUsage/{usageId}` and displayed directly in the user's dashboard charts.

---

## 5. Local Genkit Developer UI

Genkit includes a local developer interface to test prompts and run flows interactively in the browser.

To start the Genkit Developer UI:

```bash
pnpm run dev:genkit
```

_(This starts the Genkit UI on [http://localhost:4000](http://localhost:4000) or another available port, where you can select, run, and trace flows.)_
