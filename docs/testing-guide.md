# Testing Guide

This guide explains the test suite structure, tool configuration, and commands to run unit, integration, rules, and E2E tests in the **FireSaaS Starter Kit**.

---

## 1. The Test Pyramid

FireSaaS implements a comprehensive test pyramid to ensure codebase safety:

```txt
  ▲  [ Playwright E2E ]       - E2E routing, layout validation, theme switches
 ╱█╲ [ rules-unit-testing ]  - Security boundaries for Firestore and Storage
╱███╲ [ Vitest Unit Tests ]   - Permissions, path builders, and schemas validation
```

---

## 2. Unit Testing (Vitest)

Unit tests verify independent pure functions, path helpers, permissions mapping, and schema structures. We use **Vitest** for fast execution with jsdom compatibility.

- **Test Files**: located under `tests/unit/*.test.ts`
- **Run Unit Tests**:
  ```bash
  pnpm run test:unit
  ```

---

## 3. Security Rules Testing (`rules-unit-testing`)

We write integration tests to verify database security rules in `firestore.rules` and `storage.rules`. These tests run against the local Firebase Emulator Suite.

- **Test Files**: located under `tests/firestore-rules/*.test.ts` and `tests/storage-rules/*.test.ts`
- **Prerequisites**: The Firebase Emulators must be running:
  ```bash
  pnpm run dev:emulators
  ```
- **Run Rules Tests**:
  In a separate terminal, run:
  ```bash
  pnpm run test:rules
  ```

### Writing Rules Tests Example

We use `@firebase/rules-unit-testing` to mock authenticated contexts:

```ts
const aliceContext = testEnv.authenticatedContext("alice");
const aliceDb = aliceContext.firestore();
await assertSucceeds(setDoc(doc(aliceDb, "users/alice"), { name: "Alice" }));
```

---

## 4. E2E Testing (Playwright)

E2E tests automate browser interactions. They confirm landing page links, features, pricing grids, and login input elements load correctly.

- **Test Files**: located under `tests/e2e/*.spec.ts`
- **Run Playwright Tests**:

  ```bash
  pnpm run test:e2e
  ```

  _(Note: Playwright will automatically start the Next.js server on port 3000 using `pnpm run dev` in the background if it is not already running.)_

- **Open Playwright Inspector**:
  To inspect browser interactions visually:
  ```bash
  npx playwright test --ui
  ```

---

## 5. Adding New Tests

When building a new feature (e.g. `features/invitations`):

1. **Unit Test**: Add a test file `tests/unit/invitations.test.ts` verifying Zod schemas.
2. **Rules Test**: Add test cases to `tests/firestore-rules/rules.test.ts` ensuring users cannot read others' workspace invitations.
3. **E2E Test**: Add tests to `tests/e2e/routing.spec.ts` ensuring the invite workspace modal works.
