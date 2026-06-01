# AGENTS.md

This document serves as an instruction sheet and project architecture standard for AI coding agents (like Gemini, Claude, or Cursor) working on the FireSaaS codebase.

## Project Overview

FireSaaS Starter Kit is a Firebase-native SaaS starter boilerplate built using:

- **Core**: Next.js App Router (16.x), TypeScript (5.x), Tailwind CSS (v4), next-themes (dark/light toggles), and Radix UI primitives.
- **Backend & Auth**: Firebase Auth (client cookies session verification), Cloud Firestore (multi-tenant structures), and Firebase Storage.
- **AI Engine**: Firebase Genkit using structured schemas and conversational Gemini models.
- **Testing Suite**: Vitest (unit & emulator rules tests) and Playwright (E2E routing/layout validation).
- **Validation**: Zod schema parses on client forms, API routes, Server Actions, and AI inputs.

---

## Rules for Agents

1. **Keep Features Modular**: Co-locate schemas, actions, permissions, and views under `features/` directory rather than dumping everything in generic directories.
2. **Strict Client-Server Isolation**:
   - Never import `firebase-admin` or call `adminDb`/`adminAuth`/`adminStorage` in Client Components (components starting with `"use client"`).
   - Server Actions (`"use server"`) must enforce session checks via `requireAuth()` before running mutations.
3. **Zod Validation Everywhere**: All forms, API endpoints, Server Actions, and Genkit AI inputs/outputs must be parsed against Zod schemas.
4. **Security Rules Synchronization**: When adding a new Firestore collection or storage path, immediately update `firestore.rules` and `storage.rules`, and add unit checks under `tests/firestore-rules` or `tests/storage-rules`.
5. **No Any Types**: Maintain strict type-safety. Infer types from Zod schemas using `z.infer<typeof schema>`.
6. **Multi-Tenant Boundary Controls**: Ensure queries to Firestore check for organization boundaries. E.g. `organizations/{orgId}/files/...`.
7. **HMR Resiliency**: Wrap Firebase Client and Admin initializations to prevent multiple-initialization errors during Hot Module Reloading (HMR).

---

## Feature Development Workflow

When tasked with adding a new feature (e.g. "Teams chat room" or "Usage billing history"):

1. **Define Schema**: Create `features/{featureName}/schema.ts` defining input and database shape validators using Zod.
2. **Define Firestore Paths**: Add path generation helpers to `firebase/firestore.ts` (and `firebase/storage.ts` if uploads are involved).
3. **Define Permission Model**: Document access rights (e.g. owner vs viewer permissions) in `features/organizations/permissions.ts` and add Firestore rules rules to `firestore.rules`.
4. **Implement Server Queries & Actions**: Create `features/{featureName}/actions.ts` using Server Actions. Validate inputs and run checks.
5. **Implement UI**: Build the corresponding pages or layouts under `app/(app)/` and shared UI components. Include loading spinners, empty states, and error toasts.
6. **Add Tests**:
   - Write unit tests under `tests/unit/` for permission mapping or utility logic.
   - Write integration tests under `tests/firestore-rules/` or `tests/storage-rules/` using rules-unit-testing.
   - Write Playwright E2E tests for page loads.
7. **Update Docs**: Supplement deployment, security, or API details in `docs/` or `README.md`.

---

## Definition of Done (DoD)

A feature task is considered complete ONLY when:

- [ ] TypeScript compiles cleanly: `pnpm run typecheck` passes with no errors.
- [ ] Code is linted and formatted: `pnpm run lint` and `pnpm run format` pass.
- [ ] All unit and emulator rules integration tests pass: `pnpm run test:unit` and `pnpm run test:rules` succeed.
- [ ] UI components are responsive, support dark mode, and handle empty, loading, error, and success states.
- [ ] Architecture guides or API documentations are updated.
