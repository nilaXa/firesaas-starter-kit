"use server";

import { adminDb } from "@/firebase/admin";
import { FirestorePaths } from "@/firebase/firestore";
import { requireAuth } from "@/features/auth/server";
import { createAuditLog } from "@/features/audit-logs/actions";
import { summarizeTextFlow } from "@/genkit/flows/summarize";
import { generateJsonFlow } from "@/genkit/flows/generateJson";
import { chatAssistantFlow } from "@/genkit/flows/chat";
import { MODELS } from "@/genkit/ai";
import { canRunAiFlows, UserRole } from "@/features/organizations/permissions";

/**
 * Fetches organization member role.
 */
async function getMemberRole(
  orgId: string,
  userId: string,
): Promise<string | null> {
  const docRef = adminDb.doc(FirestorePaths.member(orgId, userId));
  const docSnap = await docRef.get();
  return docSnap.exists ? docSnap.data()?.role : null;
}

// In-memory sliding window rate limiter
// Key: userId, Value: array of request timestamps (ms)
const rateLimitMap = new Map<string, number[]>();
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const MAX_AI_FLOWS_PER_MINUTE = 5; // Allow max 5 AI requests per minute per user

function isRateLimited(userId: string): boolean {
  const now = Date.now();
  const requestTimestamps = rateLimitMap.get(userId) || [];

  // Filter out timestamps older than the 1-minute window
  const activeTimestamps = requestTimestamps.filter(
    (timestamp) => now - timestamp < RATE_LIMIT_WINDOW_MS,
  );

  if (activeTimestamps.length >= MAX_AI_FLOWS_PER_MINUTE) {
    return true;
  }

  // Record current request timestamp
  activeTimestamps.push(now);
  rateLimitMap.set(userId, activeTimestamps);
  return false;
}

/**
 * Executes a Genkit AI flow and logs the token usage to Firestore.
 */
export async function executeAiFlow(
  orgId: string,
  flowName: "summarize" | "generateJson" | "chat",
  inputData: unknown,
) {
  const claims = await requireAuth();
  const userId = claims.uid;

  // 1. Rate Limiting Check
  if (isRateLimited(userId)) {
    throw new Error(
      "Rate limit exceeded. You can only execute 5 AI flows per minute.",
    );
  }

  // 1. Authorization check
  const role = await getMemberRole(orgId, userId);
  if (!role || !canRunAiFlows(role as UserRole)) {
    throw new Error(
      "Unauthorized. User must be a member of the active workspace with permissions to run AI flows.",
    );
  }

  const now = new Date();
  const usageRef = adminDb
    .collection(FirestorePaths.aiUsageLogsList(orgId))
    .doc();
  const usageId = usageRef.id;

  let result: unknown = null;
  let status: "success" | "error" = "success";
  let errorMessage: string | undefined = undefined;

  const inputLength = JSON.stringify(inputData).length;
  let outputLength = 0;

  try {
    // 2. Execute flow
    if (flowName === "summarize") {
      result = await summarizeTextFlow(inputData as { text: string });
    } else if (flowName === "generateJson") {
      result = await generateJsonFlow(inputData as { prompt: string });
    } else if (flowName === "chat") {
      result = await chatAssistantFlow(
        inputData as {
          message: string;
          history?: { role: "user" | "model"; content: string }[];
        },
      );
    } else {
      throw new Error(`Unknown flow name: ${flowName}`);
    }

    outputLength = JSON.stringify(result).length;
  } catch (error: unknown) {
    status = "error";
    errorMessage =
      error instanceof Error
        ? error.message
        : "An error occurred during AI execution";
    console.error(`AI Flow error [${flowName}]:`, error);
    throw error;
  } finally {
    // 3. Estimate token usages (1 token ≈ 4 characters)
    const inputTokens = Math.max(1, Math.round(inputLength / 4));
    const outputTokens = Math.max(1, Math.round(outputLength / 4));
    // Gemini 2.5 Flash estimated rates: $0.075 / 1M input tokens, $0.30 / 1M output tokens
    const estimatedCost =
      status === "success"
        ? inputTokens * 0.000000075 + outputTokens * 0.0000003
        : 0;

    // 4. Log usage in Firestore (append-only)
    await usageRef.set({
      id: usageId,
      organizationId: orgId,
      userId,
      flowName,
      model: MODELS.text,
      inputTokens,
      outputTokens,
      estimatedCost,
      status,
      errorMessage: errorMessage ?? null,
      createdAt: now,
    });

    // 5. Create compliance audit log
    await createAuditLog({
      organizationId: orgId,
      actorId: userId,
      action: `ai_flow_${flowName}`,
      targetType: "ai_flow",
      targetId: usageId,
      metadata: { status, model: MODELS.text },
    });
  }

  return result;
}
