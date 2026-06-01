# Agentic Development Guide

This guide explains how AI coding agents (such as Gemini, Claude, or Cursor) should operate when editing, extending, or maintaining this codebase.

---

## 1. Operating Rules for AI Agents

When tasked to work on this repository, you must unconditionally follow these standards:

- **Respect Multi-Tenancy Boundary Rules**: Never query nested subcollections (like `files` or `aiUsage` or `auditLogs`) globally. Always query them under their parent organization paths.
- **Client/Server Isolation**: Never import `firebase-admin` or call `adminDb`/`adminAuth`/`adminStorage` inside files using `"use client"`. Always route mutations through Server Actions or API Route Handlers.
- **Strict Typing**: Never use `any` unless absolutely unavoidable. Use TypeScript strictly, deriving types from Zod schemas where possible.
- **Fail-Fast Environment validation**: Validate environment variables at compile-time/runtime. If you add variables, update `lib/env.ts` and `.env.example`.
- **Always Add Tests**: Do not consider a feature complete without adding unit checks and emulator security rules checks.

---

## 2. Walkthrough: Adding a Feature (e.g. "Shared Chat Rooms")

Follow this sequence to add a new multi-tenant feature:

### Step 1: Define Schemas & Paths

1. Create `features/chat/schema.ts` defining Zod schemas for messages.
2. Add paths to `firebase/firestore.ts`:
   ```ts
   // In FirestorePaths
   chatMessage: (orgId: string, msgId: string) => `organizations/${orgId}/chat/${msgId}`,
   chatMessagesList: (orgId: string) => `organizations/${orgId}/chat`
   ```

### Step 2: Define Security Rules

Update `firestore.rules` to restrict message access:

```javascript
match /organizations/{orgId} {
  // ...
  match /chat/{msgId} {
    allow read: if isOrgMember(orgId);
    allow create: if isOrgMember(orgId) && request.resource.data.senderId == request.auth.uid;
    allow delete: if hasRole(orgId, ['owner', 'admin']) || resource.data.senderId == request.auth.uid;
  }
}
```

### Step 3: Implement Server Actions

Create `features/chat/actions.ts` containing `"use server"` mutations:

```ts
"use server";
import { requireAuth } from "@/features/auth/server";
import { adminDb } from "@/firebase/admin";
import { FirestorePaths } from "@/firebase/firestore";

export async function sendChatMessage(orgId: string, content: string) {
  const claims = await requireAuth();
  // Validate, check membership, and set doc in Firestore...
}
```

### Step 4: Implement Playground / UI

Create the corresponding pages or layouts under `app/(app)/chat/page.tsx`. Use Tailwind CSS and follow the flame brand aesthetics (harmonious dark background, warm primary orange accents, and next-themes toggles). Include loading screens and empty states.

### Step 5: Test and Verify

1. Create `tests/firestore-rules/chat.test.ts` to verify security rules:
   - Alice (member) can read/write messages.
   - Bob (non-member) cannot write messages.
2. Start emulators and run rules test:
   ```bash
   pnpm run test:rules
   ```
3. Run types and lint tests:
   ```bash
   pnpm run typecheck
   pnpm run lint
   ```
